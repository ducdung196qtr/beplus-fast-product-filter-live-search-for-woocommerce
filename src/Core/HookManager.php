<?php

/**
 * Hook name constants for extensibility.
 *
 * @package BePlusSmartSearch
 * @subpackage Core
 */

namespace BePlusSmartSearch\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Documents filter and action hook names used by the plugin.
 */
final class HookManager {

	public const FILTER_SERVICES = 'beplus_smart_search.services';
	public const FILTER_PROVIDERS = 'beplus_smart_search.providers';
	public const FILTER_BLOCKS = 'beplus_smart_search.blocks';
	public const FILTER_SEARCH_QUERY = 'beplus_smart_search_search_query';
	public const FILTER_SEARCH_RESULTS = 'beplus_smart_search_search_results';
	public const ACTION_SEARCH_COMPLETED = 'beplus_smart_search_search_completed';
}
