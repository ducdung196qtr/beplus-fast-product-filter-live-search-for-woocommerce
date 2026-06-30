<?php

/**
 * Abstract module base class.
 *
 * @package BePlusFastProductFilterLiveSearch
 * @subpackage Core
 */

namespace BePlusFastProductFilterLiveSearch\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for all plugin modules.
 */
abstract class AbstractModule {

	/**
	 * Service container.
	 *
	 * @var Container
	 */
	protected Container $container;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	protected string $version;

	/**
	 * Plugin directory path.
	 *
	 * @var string
	 */
	protected string $plugin_dir;

	/**
	 * Plugin directory URL.
	 *
	 * @var string
	 */
	protected string $plugin_url;

	/**
	 * Constructor.
	 *
	 * @param Container $container Service container.
	 */
	public function __construct( Container $container ) {
		$this->container  = $container;
		$this->version    = BEPLUS_FAST_PRODUCT_FILTER_LIVE_SEARCH_VERSION;
		$this->plugin_dir = BEPLUS_FAST_PRODUCT_FILTER_LIVE_SEARCH_PLUGIN_DIR;
		$this->plugin_url = BEPLUS_FAST_PRODUCT_FILTER_LIVE_SEARCH_PLUGIN_URL;
	}

	/**
	 * Register WordPress hooks for this module.
	 *
	 * @return void
	 */
	abstract public function register(): void;
}
