---
name: bpss-search-stats
description: Reusable search keyword statistics table and tracking pattern for the Beplus plugin. Covers DB table `{prefix}bpfpfls_search_stats`, REST POST/GET endpoints, frontend sendBeacon tracking, and admin stats display.
---

# BPSS Search Stats — reusable pattern

## DB Table

```sql
CREATE TABLE {$prefix}bpfpfls_search_stats (
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
) {$charset_collate};
```

- **Table constant:** `Plugin::SEARCH_STATS_TABLE = 'bpfpfls_search_stats'`
- **Created in:** `Plugin::activate()` via `dbDelta()`
- **Must require:** `ABSPATH . 'wp-admin/includes/upgrade.php'`

## Keyword resolution logic

```
User types raw query (e.g., "alb")
  │
  ├─ Clicks product "Album" → keyword = "Album", resolved_from = "click"
  │
  └─ Presses Enter without clicking
       ├─ Has suggestions? → use first suggestion as keyword
       └─ No suggestions?   → use raw query as keyword
       resolved_from = "fallback"
```

**Why not use raw query?** With inline suggestions (Tab to autocomplete), users rarely type full keywords. Tracking the product title or suggestion captures the actual search intent.

## Table growth management

**Problem:** Over time, unique keywords grow unbounded. Capping by count would block new trending keywords.

**Solution: Soft cap with two-phase pruning.**

### Constants
- `MAX_ROWS = 2000` — soft cap (filterable via `beplus_fast_product_filter_live_search.stats_max_rows`)
- `MAX_PRUNE_FRACTION = 0.1` — never delete >10% of rows in one auto-prune pass

### Auto-prune (on insert of NEW keyword only)
1. If `total_rows > MAX_ROWS`:
   a. **Phase 1:** Delete stale keywords where `count = 1` AND `updated_at < 7 days ago`. Up to the excess amount.
   b. **Phase 2:** If still over limit, delete lowest-count oldest rows. Always keep at least top 50% of rows.

### Manual cleanup (admin button)
- Deletes ALL stale keywords (count=1, 7+ days stale)
- If still over cap, trims excess from lowest-count oldest
- `DELETE /search-stats/cleanup` (admin only)

### Why this works
- New trending keywords always get space (stale single-entry keywords purged first)
- Popular high-count keywords always protected (top 50% preserved)
- 2000-row cap prevents infinite table growth
- 10% max prune per insert prevents mass deletion spikes

## REST API

- **Namespace:** `beplus-fast-product-filter-live-search-for-woocommerce/v1`
- **Controller:** `src/REST/SearchStatsController.php` (extends `AbstractModule`)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/search-stats` | Public | Track a resolved keyword event |
| `GET` | `/search-stats` | `manage_woocommerce` | Get top keywords (paginated) |

### POST body params

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `keyword` | string | Yes | Resolved keyword (product title or closest match) |
| `raw_query` | string | No | Raw user input |
| `resolved_from` | string | No | `"click"` or `"fallback"` |
| `product_id` | int | No | Product ID if clicked |

Upsert logic: if `keyword` already exists → increment `count`; else → insert.

### GET query params

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `per_page` | int | 20 | Max 100 |
| `page` | int | 1 | |

Response: `{ items: [...], total, per_page, page }`. Items ordered by `count DESC, updated_at DESC`.

## Frontend tracking

Located in `blocks/live-search/view.source.ts`:

```typescript
function trackKeyword(keyword, rawQuery, resolvedFrom, productId?): void {
    const url = bpssData.restUrl + 'search-stats';
    const body = new URLSearchParams();
    body.set('keyword', keyword);
    body.set('raw_query', rawQuery);
    body.set('resolved_from', resolvedFrom);
    if (productId) body.set('product_id', String(productId));

    if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
    } else {
        fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
}
```

### Tracking points

1. **Form submit (`fallback`):** Uses first suggestion if available, else raw query.
2. **Product link click (`click`):** Intercepts click on `.beplus-fast-product-filter-live-search-for-woocommerce__live-product-link`, extracts text from `.beplus-fast-product-filter-live-search-for-woocommerce__live-product-title`.

## Admin display

- **Tab:** "Statistics" added to `$tabs` array in `settings-page.php`
- **Panel:** `data-tab-panel="statistics"` with `<table>` and `data-bpss-refresh-stats` button
- **JS:** jQuery-based `loadStats()` in `settings.ts` fetches from REST `GET /search-stats` with `X-WP-Nonce` header
- **CSS:** `.bpss-stats__*` classes in `admin/css/settings.css`
- **Localized data:** `bpssAdmin.statsRestUrl`, `bpssAdmin.statsNonce` from `SettingsPage::enqueue_assets()`

## Registration

In `Plugin::register_core_services()`:
```php
$this->modules[] = SearchStatsController::class;
```

Tab must be in `$allowed` array in `SettingsPage::preserve_settings_tab()` (and is also automatically part of `$tabs`).
