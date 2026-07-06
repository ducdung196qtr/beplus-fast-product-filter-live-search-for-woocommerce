<?php

/**
 * Search stats REST controller.
 *
 * @package BePlusFastProductFilterLiveSearch
 * @subpackage REST
 */

namespace BePlusFastProductFilterLiveSearch\REST;

use BePlusFastProductFilterLiveSearch\Core\AbstractModule;
use BePlusFastProductFilterLiveSearch\Core\Plugin;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST endpoint for search keyword statistics.
 */
class SearchStatsController extends AbstractModule {

	/**
	 * Soft cap: maximum rows allowed before pruning.
	 *
	 * @var int
	 */
	private const MAX_ROWS = 2000;

	/**
	 * When pruning, never delete more than this fraction of total rows at once.
	 *
	 * @var float
	 */
	private const MAX_PRUNE_FRACTION = 0.1;

	/**
	 * REST namespace.
	 *
	 * @var string
	 */
	private string $namespace = 'beplus-fast-product-filter-live-search-for-woocommerce/v1';

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register routes on rest_api_init.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/search-stats',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'track_keyword' ),
				'permission_callback' => '__return_true',
				'args'                => $this->get_track_params(),
			),
		);

		register_rest_route(
			$this->namespace,
			'/search-stats',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stats' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
				'args'                => $this->get_stats_params(),
			),
		);

		register_rest_route(
			$this->namespace,
			'/search-stats/cleanup',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'cleanup_stats' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_woocommerce' );
				},
			),
		);
	}

	/**
	 * Track a keyword search event.
	 *
	 * @param WP_REST_Request $request REST request.
	 *
	 * @return WP_REST_Response
	 */
	public function track_keyword( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$keyword      = sanitize_text_field( (string) $request->get_param( 'keyword' ) );
		$raw_query    = sanitize_text_field( (string) $request->get_param( 'raw_query' ) );
		$resolved_from = sanitize_key( (string) $request->get_param( 'resolved_from' ) );
		$product_id   = absint( (int) $request->get_param( 'product_id' ) );

		if ( '' === $keyword ) {
			return new WP_REST_Response(
				array( 'error' => 'keyword_required' ),
				400,
			);
		}

		if ( ! in_array( $resolved_from, array( 'click', 'fallback' ), true ) ) {
			$resolved_from = 'fallback';
		}

		$table_name = $wpdb->prefix . Plugin::SEARCH_STATS_TABLE;

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$existing = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, count FROM {$table_name} WHERE keyword = %s",
				$keyword,
			),
		);

		if ( $existing ) {
			$new_count = (int) $existing->count + 1;

			$wpdb->update(
				$table_name,
				array(
					'count'         => $new_count,
					'raw_query'     => $raw_query,
					'resolved_from' => $resolved_from,
					'product_id'    => $product_id > 0 ? $product_id : null,
				),
				array( 'id' => $existing->id ),
				array( '%d', '%s', '%s', '%d' ),
				array( '%d' ),
			);
		} else {
			$wpdb->insert(
				$table_name,
				array(
					'keyword'       => $keyword,
					'raw_query'     => $raw_query,
					'resolved_from' => $resolved_from,
					'product_id'    => $product_id > 0 ? $product_id : null,
					'count'         => 1,
				),
				array( '%s', '%s', '%s', '%d', '%d' ),
			);
			$this->prune_if_needed();
		}
		// phpcs:enable

		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/**
	 * Prune rows if table exceeds soft cap.
	 *
	 * Strategy: delete low-count stale keywords first (count=1 + 7 days stale),
	 * then delete lowest-count oldest remaining rows. Never prune more than
	 * MAX_PRUNE_FRACTION at once, and always keep the top half.
	 *
	 * @return void
	 */
	private function prune_if_needed(): void {
		global $wpdb;

		$max_rows     = apply_filters( 'beplus_fast_product_filter_live_search.stats_max_rows', self::MAX_ROWS );
		$table_name   = $wpdb->prefix . Plugin::SEARCH_STATS_TABLE;
		$current_rows = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( $current_rows <= $max_rows ) {
			return;
		}

		$excess      = $current_rows - $max_rows;
		$max_prune   = max( 1, (int) ( $current_rows * self::MAX_PRUNE_FRACTION ) );
		$to_delete   = min( $excess, $max_prune );

		// Phase 1: delete stale low-count keywords (count=1, 7+ days without update).
		$stale_deleted = $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$table_name}
				WHERE count = 1
				AND updated_at < DATE_SUB( NOW(), INTERVAL 7 DAY )
				ORDER BY updated_at ASC
				LIMIT %d",
				$to_delete,
			),
		);

		if ( false === $stale_deleted ) {
			$stale_deleted = 0;
		}

		$remaining = $to_delete - $stale_deleted;

		// Phase 2: if still over limit, delete lowest-count, oldest rows.
		// Keep at least the top 50%.
		if ( $remaining > 0 ) {
			$keep_rows = max( 1, (int) ( $current_rows * 0.5 ) );
			$safe_limit = max( 0, $current_rows - $keep_rows );

			if ( $safe_limit > 0 ) {
				$remaining = min( $remaining, (int) $safe_limit );

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->query(
					$wpdb->prepare(
						"DELETE FROM {$table_name}
						WHERE id IN (
							SELECT id FROM (
								SELECT id FROM {$table_name}
								ORDER BY count ASC, updated_at ASC
								LIMIT %d
							) AS tmp
						)",
						$remaining,
					),
				);
			}
		}
	}

	/**
	 * Manual cleanup of search stats.
	 *
	 * @param WP_REST_Request $request REST request.
	 *
	 * @return WP_REST_Response
	 */
	public function cleanup_stats( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		unset( $request );

		$table_name = $wpdb->prefix . Plugin::SEARCH_STATS_TABLE;
		$max_rows   = apply_filters( 'beplus_fast_product_filter_live_search.stats_max_rows', self::MAX_ROWS );

		// Delete stale low-count keywords.
		$stale = (int) $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			"DELETE FROM {$table_name}
			WHERE count = 1
			AND updated_at < DATE_SUB( NOW(), INTERVAL 7 DAY )",
		);

		// If still over cap, trim.
		$current = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		$trimmed = 0;
		if ( $current > $max_rows ) {
			$cut = $current - $max_rows;
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$trimmed = (int) $wpdb->query(
				$wpdb->prepare(
					"DELETE FROM {$table_name}
					WHERE id IN (
						SELECT id FROM (
							SELECT id FROM {$table_name}
							ORDER BY count ASC, updated_at ASC
							LIMIT %d
						) AS tmp
					)",
					$cut,
				),
			);
		}

		return new WP_REST_Response(
			array(
				'ok'      => true,
				'removed' => $stale + $trimmed,
			),
			200,
		);
	}

	/**
	 * Get search keyword statistics.
	 *
	 * @param WP_REST_Request $request REST request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_stats( WP_REST_Request $request ): WP_REST_Response {
		global $wpdb;

		$limit = max( 1, min( 100, (int) $request->get_param( 'per_page' ) ) );
		$page  = max( 1, (int) $request->get_param( 'page' ) );
		$offset = ( $page - 1 ) * $limit;

		$table_name = $wpdb->prefix . Plugin::SEARCH_STATS_TABLE;

		$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table_name}" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		$items = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT keyword, raw_query, resolved_from, product_id, count, updated_at
				FROM {$table_name}
				ORDER BY count DESC, updated_at DESC
				LIMIT %d OFFSET %d",
				$limit,
				$offset,
			),
		);

		if ( ! is_array( $items ) ) {
			$items = array();
		}

		$formatted = array();
		foreach ( $items as $item ) {
			$formatted[] = array(
				'keyword'       => $item->keyword,
				'raw_query'     => $item->raw_query,
				'resolved_from' => $item->resolved_from,
				'product_id'    => $item->product_id ? (int) $item->product_id : null,
				'count'         => (int) $item->count,
				'updated_at'    => $item->updated_at,
			);
		}

		return new WP_REST_Response(
			array(
				'items'    => $formatted,
				'total'    => $total,
				'per_page' => $limit,
				'page'     => $page,
			),
			200,
		);
	}

	/**
	 * Track endpoint params schema.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_track_params(): array {
		return array(
			'keyword' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'raw_query' => array(
				'type'              => 'string',
				'required'          => false,
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'resolved_from' => array(
				'type'              => 'string',
				'required'          => false,
				'default'           => 'fallback',
				'sanitize_callback' => 'sanitize_key',
			),
			'product_id' => array(
				'type'              => 'integer',
				'required'          => false,
				'default'           => 0,
				'sanitize_callback' => 'absint',
			),
		);
	}

	/**
	 * Stats endpoint params schema.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public function get_stats_params(): array {
		return array(
			'per_page' => array(
				'type'    => 'integer',
				'default' => 20,
				'minimum' => 1,
				'maximum' => 100,
			),
			'page' => array(
				'type'    => 'integer',
				'default' => 1,
				'minimum' => 1,
			),
		);
	}
}
