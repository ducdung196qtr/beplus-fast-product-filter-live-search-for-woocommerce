<?php

/**
 * Block registry.
 *
 * @package BePlusFastProductFilterLiveSearch
 * @subpackage Blocks
 */

namespace BePlusFastProductFilterLiveSearch\Blocks;

use BePlusFastProductFilterLiveSearch\Core\AbstractModule;
use BePlusFastProductFilterLiveSearch\Core\Container;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auto-discovers and registers Gutenberg blocks.
 */
class BlockRegistry extends AbstractModule {

	/**
	 * Blocks directory path.
	 *
	 * @var string
	 */
	private string $blocks_dir;

	/**
	 * Constructor.
	 *
	 * @param Container $container Service container.
	 */
	public function __construct( Container $container ) {
		parent::__construct( $container );
		$this->blocks_dir = $this->plugin_dir . 'blocks/';
	}

	/**
	 * Register init hook.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_blocks' ), 9 );
	}

	/**
	 * Discover and register blocks from block.json.
	 *
	 * @return void
	 */
	public function register_blocks(): void {
		$block_dirs = glob( $this->blocks_dir . '*/', GLOB_ONLYDIR );

		if ( empty( $block_dirs ) ) {
			return;
		}

		foreach ( $block_dirs as $block_dir ) {
			$block_json = $block_dir . 'block.json';

			if ( ! file_exists( $block_json ) ) {
				continue;
			}

			register_block_type_from_metadata( $block_dir );
		}

		$third_party = apply_filters( 'beplus_fast_product_filter_live_search.blocks', array() );

		if ( is_array( $third_party ) ) {
			foreach ( $third_party as $block_dir ) {
				if ( is_string( $block_dir ) && file_exists( $block_dir . '/block.json' ) ) {
					register_block_type_from_metadata( $block_dir );
				}
			}
		}

		do_action( 'beplus_fast_product_filter_live_search.blocks_registered' );
	}
}
