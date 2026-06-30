<?php

/**
 * Hook name constants for extensibility.
 *
 * @package BePlusFastProductFilterLiveSearch
 * @subpackage Core
 */

namespace BePlusFastProductFilterLiveSearch\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Documents filter and action hook names used by the plugin.
 */
final class HookManager {

	public const FILTER_SERVICES = 'beplus_fast_product_filter_live_search.services';
	public const FILTER_PROVIDERS = 'beplus_fast_product_filter_live_search.providers';
	public const FILTER_BLOCKS = 'beplus_fast_product_filter_live_search.blocks';
	public const FILTER_SEARCH_QUERY = 'beplus_fast_product_filter_live_search_search_query';
	public const FILTER_SEARCH_RESULTS = 'beplus_fast_product_filter_live_search_search_results';
	public const ACTION_SEARCH_COMPLETED = 'beplus_fast_product_filter_live_search_search_completed';
}
