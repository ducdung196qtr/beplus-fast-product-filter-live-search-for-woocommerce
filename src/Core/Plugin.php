<?php

/**
 * Main plugin bootstrap.
 *
 * @package BePlusFastProductFilterLiveSearch
 * @subpackage Core
 */

namespace BePlusFastProductFilterLiveSearch\Core;

use BePlusFastProductFilterLiveSearch\Admin\SettingsPage;
use BePlusFastProductFilterLiveSearch\Blocks\BlockRegistry;
use BePlusFastProductFilterLiveSearch\Frontend\ShopQueryIntegration;
use BePlusFastProductFilterLiveSearch\REST\FacetsController;
use BePlusFastProductFilterLiveSearch\REST\ProductsController;
use BePlusFastProductFilterLiveSearch\REST\SearchStatsController;
use BePlusFastProductFilterLiveSearch\REST\SuggestionsController;
use BePlusFastProductFilterLiveSearch\Search\CacheService;
use BePlusFastProductFilterLiveSearch\Search\ProductTemplateRenderer;
use BePlusFastProductFilterLiveSearch\Search\SearchEngine;
use BePlusFastProductFilterLiveSearch\Search\SearchRegistry;
use BePlusFastProductFilterLiveSearch\Settings\SettingsRegistry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Core plugin class.
 */
class Plugin {

	/**
	 * Search stats table name (without prefix).
	 *
	 * @var string
	 */
	public const SEARCH_STATS_TABLE = 'bpfpfls_search_stats';

	/**
	 * Service container.
	 *
	 * @var Container
	 */
	private Container $container;

	/**
	 * Registered module class names.
	 *
	 * @var array<int, class-string<AbstractModule>>
	 */
	private array $modules = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->container = new Container();
	}

	/**
	 * Boot the plugin.
	 *
	 * @return void
	 */
	public function boot(): void {
		$this->register_core_services();
		$this->register_services_from_filter();
		$this->boot_registered_modules();

		add_action( 'init', array( $this, 'on_init' ) );
		add_filter( 'block_categories_all', array( $this, 'register_block_category' ) );
	}

	/**
	 * Run on init.
	 *
	 * @return void
	 */
	public function on_init(): void {
		ProductTemplateRenderer::register();
		CacheService::register_invalidation_hooks();
	}

	/**
	 * Activate the plugin.
	 *
	 * @return void
	 */
	public function activate(): void {
		flush_rewrite_rules();
		$this->create_search_stats_table();
	}

	/**
	 * Deactivate the plugin.
	 *
	 * @return void
	 */
	public function deactivate(): void {
		flush_rewrite_rules();
	}

	/**
	 * Create search stats table.
	 *
	 * @return void
	 */
	private function create_search_stats_table(): void {
		global $wpdb;

		$table_name = $wpdb->prefix . self::SEARCH_STATS_TABLE;
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			keyword VARCHAR(255) NOT NULL,
			raw_query VARCHAR(255) NOT NULL DEFAULT '',
			resolved_from VARCHAR(20) NOT NULL DEFAULT 'fallback',
			product_id BIGINT UNSIGNED NULL DEFAULT NULL,
			count INT UNSIGNED NOT NULL DEFAULT 1,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY uk_keyword (keyword),
			KEY idx_count (count),
			KEY idx_updated_at (updated_at)
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	/**
	 * Register block category.
	 *
	 * @param array<int, array<string, mixed>> $categories Block categories.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public function register_block_category( array $categories ): array {
		$categories[] = array(
			'slug'  => 'beplus-fast-product-filter-live-search-for-woocommerce',
			'title' => __( 'Beplus Fast Product Filter & Live Search for WooCommerce', 'beplus-fast-product-filter-live-search-for-woocommerce' ),
			'icon'  => 'search',
		);

		return $categories;
	}

	/**
	 * Register core container services.
	 *
	 * @return void
	 */
	private function register_core_services(): void {
		$this->container->set(
			SearchEngine::class,
			function ( Container $container ) {
				return new SearchEngine( $container );
			},
		);

		$this->modules = array(
			AssetLoader::class,
			SettingsRegistry::class,
			SettingsPage::class,
			BlockRegistry::class,
			ShopQueryIntegration::class,
			SearchRegistry::class,
			ProductsController::class,
			FacetsController::class,
			SuggestionsController::class,
			SearchStatsController::class,
		);
	}

	/**
	 * Allow extensions to register services.
	 *
	 * @return void
	 */
	private function register_services_from_filter(): void {
		$extra = apply_filters( 'beplus_fast_product_filter_live_search.services', array() );

		if ( ! is_array( $extra ) ) {
			return;
		}

		foreach ( $extra as $id => $definition ) {
			if ( is_string( $id ) ) {
				$this->container->set( $id, $definition );
			}
		}

		$extra_modules = apply_filters( 'beplus_fast_product_filter_live_search.modules', array() );

		if ( is_array( $extra_modules ) ) {
			foreach ( $extra_modules as $module_class ) {
				if ( is_string( $module_class ) && is_subclass_of( $module_class, AbstractModule::class ) ) {
					$this->modules[] = $module_class;
				}
			}
		}
	}

	/**
	 * Boot all registered modules.
	 *
	 * @return void
	 */
	private function boot_registered_modules(): void {
		foreach ( $this->modules as $module_class ) {
			$module = $this->container->get( $module_class );
			if ( $module instanceof AbstractModule ) {
				$module->register();
			}
		}
	}
}
