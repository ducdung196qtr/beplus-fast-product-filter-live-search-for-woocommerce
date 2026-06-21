<?php

/**
 * Plugin Name: Beplus Smart Search
 * Plugin URI:  https://beplusthemes.com/
 * Description: Transform your WooCommerce store with lightning-fast product discovery. Instant search and smart filters update results in real time—no page reloads, no interruptions. Designed exclusively for Gutenberg block themes, it delivers a seamless shopping experience that helps customers find exactly what they need, faster.
 * Version:     1.0.0
 * Author:      Beplus
 * Author URI:  https://beplusthemes.com/
 * Text Domain: beplus-smart-search
 * Domain Path: /languages
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 * License:     GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html.
 *
 * @package BePlusSmartSearch
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BEPLUS_SMART_SEARCH_VERSION', '1.0.0' );
define( 'BEPLUS_SMART_SEARCH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BEPLUS_SMART_SEARCH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'BEPLUS_SMART_SEARCH_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once BEPLUS_SMART_SEARCH_PLUGIN_DIR . 'includes/helpers.php';
require_once BEPLUS_SMART_SEARCH_PLUGIN_DIR . 'includes/facets.php';

if ( file_exists( BEPLUS_SMART_SEARCH_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once BEPLUS_SMART_SEARCH_PLUGIN_DIR . 'vendor/autoload.php';
} else {
	spl_autoload_register(
		function ( string $class_name ) {
			$prefix = 'BePlusSmartSearch\\';
			if ( strncmp( $class_name, $prefix, strlen( $prefix ) ) !== 0 ) {
				return;
			}
			$file = BEPLUS_SMART_SEARCH_PLUGIN_DIR
				. 'src/'
				. str_replace( '\\', '/', substr( $class_name, strlen( $prefix ) ) )
				. '.php';
			if ( file_exists( $file ) ) {
				require_once $file;
			}
		},
	);
}

/**
 * Boot plugin.
 *
 * @return BePlusSmartSearch\Core\Plugin
 */
function beplus_smart_search_boot() {
	static $plugin = null;
	if ( null === $plugin ) {
		$plugin = new BePlusSmartSearch\Core\Plugin();
		$plugin->boot();
	}
	return $plugin;
}

add_action( 'plugins_loaded', 'beplus_smart_search_init' );

/**
 * Init on plugins_loaded.
 *
 * @return void
 */
function beplus_smart_search_init() {
	if ( ! beplus_smart_search_is_woocommerce_active() ) {
		add_action( 'admin_notices', 'beplus_smart_search_woocommerce_missing_notice' );
		return;
	}

	beplus_smart_search_boot();
}

/**
 * Admin notice when WooCommerce is not active.
 *
 * @return void
 */
function beplus_smart_search_woocommerce_missing_notice(): void {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	printf(
		'<div class="notice notice-error"><p>%s</p></div>',
		esc_html__(
			'Beplus Smart Search requires WooCommerce to be installed and active.',
			'beplus-smart-search',
		),
	);
}

register_activation_hook( __FILE__, 'beplus_smart_search_activate' );
register_deactivation_hook( __FILE__, 'beplus_smart_search_deactivate' );

/**
 * Activation handler.
 *
 * @return void
 */
function beplus_smart_search_activate() {
	if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
		deactivate_plugins( plugin_basename( __FILE__ ) );
		wp_die(
			esc_html__( 'Beplus Smart Search requires PHP 7.4 or higher.', 'beplus-smart-search' ),
			'Plugin Activation Error',
			array( 'back_link' => true ),
		);
	}

	if ( ! beplus_smart_search_is_woocommerce_active() ) {
		deactivate_plugins( plugin_basename( __FILE__ ) );
		wp_die(
			esc_html__(
				'Beplus Smart Search requires WooCommerce to be installed and active. Please activate WooCommerce first, then try again.',
				'beplus-smart-search',
			),
			esc_html__( 'Plugin Activation Error', 'beplus-smart-search' ),
			array( 'back_link' => true ),
		);
	}

	( new BePlusSmartSearch\Core\Plugin() )->activate();
}

/**
 * Deactivation handler.
 *
 * @return void
 */
function beplus_smart_search_deactivate() {
	( new BePlusSmartSearch\Core\Plugin() )->deactivate();
}
