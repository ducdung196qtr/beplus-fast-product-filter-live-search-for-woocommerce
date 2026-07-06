=== Beplus Fast Product Filter & Live Search for WooCommerce ===
Contributors: bearsthemes, ducdung2026
Tags: woocommerce, product filter, live search, ajax search, product search, gutenberg, block editor, shop filter, autocomplete
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Source Code: https://github.com/ducdung196qtr/beplus-fast-product-filter-live-search-for-woocommerce

Fast AJAX product filtering and smart live search for WooCommerce. Help customers find products instantly with no page reloads.

== Description ==

**Beplus Fast Product Filter & Live Search for WooCommerce** gives your store two native Gutenberg blocks that replace slow page refreshes with instant AJAX results:

**Advanced Woo Search** — A complete product filter panel you drop above your shop grid. Customers narrow products by keyword, category, tag, attributes (Color, Size, etc.), price range, stock status, on-sale, featured, and rating. Every filter change updates the product list immediately via AJAX — no spinning page loads, no lost scroll position.

**Live Search** — A smart autocomplete search bar with dropdown suggestions. As customers type, matching products appear with thumbnail, price, and an instant add-to-cart button. Supports category filtering, typo tolerance, and highlighted search terms.

Both blocks work together or independently. Use the filter panel on your shop page, the search bar in your header, or both.

= Key Features =

* **Instant, no-reload filtering** — Category, tag, attribute, price, stock, on-sale, featured, and rating filters that update results via AJAX
* **Smart autocomplete search** — Live dropdown with product thumbnails, prices, add-to-cart, and typo correction
* **Flexible price filter** — Dual range slider or predefined price segments
* **Product attributes support** — Expose any WooCommerce attribute (Color, Size, Brand, etc.) as a filter
* **Sidebar or inline layout** — Choose how filters sit on your shop page
* **Built-in performance cache** — Pre-built filter data with auto-refresh keeps large catalogs fast
* **Custom taxonomies** — Add any custom product taxonomy as a reusable filter
* **Block editor ready** — Full InspectorControls for each block, ServerSideRender preview
* **Accessible** — ARIA labels, live regions, keyboard navigation, screen-reader text
* **Progressive enhancement** — Without JavaScript, filters fall back to standard GET form submission
* **Translation ready** — Fully internationalized text domain

= Requirements =

* WordPress 6.5+
* WooCommerce (active and configured)
* A block theme or theme that supports the Site Editor (e.g. Twenty Twenty-Five)

= Live Demos =

* **Live Search** — [https://woo-advanced-filter.beplusthemes.com/demo-live-search/](https://woo-advanced-filter.beplusthemes.com/demo-live-search/)
* **Advanced Woo Search (Shop)** — [https://woo-advanced-filter.beplusthemes.com/shop/](https://woo-advanced-filter.beplusthemes.com/shop/)

= How It Works =

1. Drop the **Advanced Woo Search** block above your product collection in the Site Editor
2. Drop the **Live Search** block anywhere a search bar fits — header, sidebar, or dedicated search page
3. Configure which filters to show and how they behave from the block inspector or the global Settings page
4. Customers filter and search your catalog in real time — no page reloads, just instant results

== Screenshots ==

1. Performance cache — toggle, auto-refresh interval, auto-clear on changes, and performance benchmark
2. Sidebar layout and Default filters — collapsible sections, accent color, categories/tags/brand selection modes
3. Product attributes, price filter, and custom taxonomies — attribute table, price range/segments, additional filters
4. Live Search block — smart autocomplete search bar with category filter and instant results
5. Shop page with the Advanced Woo Search block — full filter panel above the product grid

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/beplus-fast-product-filter-live-search-for-woocommerce/`
2. Activate through the 'Plugins' menu in WordPress
3. Make sure WooCommerce is installed and active
4. Go to **Appearance → Editor → Templates → Product Catalog** (or your shop template)
5. Insert the **Advanced Woo Search** block above the product collection, or insert the **Live Search** block anywhere on your site
6. Save the template and visit your shop or search page

For development setup (Node, Composer, build), see `README.md` in the plugin folder.

== Frequently Asked Questions ==

= Does this work with block themes? =

Yes. Both blocks are designed for blockified WooCommerce shop templates (e.g. Twenty Twenty-Five). The Advanced Woo Search block integrates directly with the WooCommerce Product Collection block.

= Can I use only one of the blocks? =

Yes. The Live Search and Advanced Woo Search blocks work independently. Use just the autocomplete search bar in your header, just the filter panel on your shop page, or both together.

= Does it support custom taxonomies? =

Yes. The Filters settings tab lets you register any custom product taxonomy as a reusable filter (selection mode, sub-item display, etc.). Enable individual taxonomies per block in the block editor inspector.

= Will this slow down my store? =

No. All filtering and searching happens via AJAX with a built-in cache service. Filter lists are pre-built and cached server-side with configurable auto-refresh. Actual search queries always return fresh results. You can measure the performance benefit directly from the settings page.

= Can I customize the look and feel? =

Yes. Both blocks inherit your theme's styles. The Advanced Woo Search block supports sidebar or stacked layout. Control which filter sections appear (keyword, category, price, stock, attributes, etc.). Set accent colors, toggle term counts, and choose between single or multi-select modes.

= Does it work with page builders? =

The blocks are designed for the WordPress Site Editor and block themes. They work in any content area that supports Gutenberg blocks.

= Is WooCommerce required? =

Yes. The plugin relies on WooCommerce product data, taxonomies, and templates. It will not activate without WooCommerce installed and active.

= Does it support variable and grouped products? =

Yes. The plugin handles simple, variable, grouped, and external products. Stock filters and price ranges account for variations.

== Changelog ==

= 1.2.0 =
* Live Search block: Submit button style setting (text label or icon), default is text with customizable label
* Live Search block: Quick suggestions below the search bar — manual comma-separated keywords or auto-synced from search stats
* Search keyword statistics: Tracks resolved keywords (product name on click, closest match on submit) via `navigator.sendBeacon`
* Admin Statistics tab: Top keywords table with search counts, resolution method, and last-searched date

= 1.1.0 =
* Improved search performance with server-side caching
* Fixed search not working for products imported after plugin activation

= 1.0.0 =
* Initial release with Advanced Woo Search and Live Search blocks
* REST API: products, facets, and suggestions endpoints
* Live filtering and autocomplete search without page reload
