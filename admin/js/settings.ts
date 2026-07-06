/**
 * Smart Search admin settings tabs.
 *
 * @package BePlusFastProductFilterLiveSearch
 */
// @ts-nocheck
( function ( $ ) {
	'use strict';

	function togglePriceSettings( $wrap ) {
		const mode = $wrap
			.find( 'input[name*="[sidebar][price][display]"]:checked' )
			.val();
		$wrap.find( '[data-bpss-price-settings="range"]' ).prop(
			'hidden',
			mode !== 'range'
		);
		$wrap.find( '[data-bpss-price-settings="segments"]' ).prop(
			'hidden',
			mode !== 'segments'
		);
	}

	function reindexSegmentRows( $wrap ) {
		const optionKey = $wrap
			.find( 'input[name*="[sidebar][price][segments]"]' )
			.first()
			.attr( 'name' )
			?.match( /^[^\[]+/)?.[ 0 ];

		if ( ! optionKey ) {
			return;
		}

		$wrap.find( '#bpss-price-segments tbody .bpss-settings__segment-row' ).each(
			function ( index ) {
				$( this )
					.find( 'input[data-name="label"], input[name*="[label]"]' )
					.attr(
						'name',
						optionKey +
							'[sidebar][price][segments][' +
							index +
							'][label]'
					);
				$( this )
					.find( 'input[data-name="min"], input[name*="[min]"]' )
					.attr(
						'name',
						optionKey +
							'[sidebar][price][segments][' +
							index +
							'][min]'
					);
				$( this )
					.find( 'input[data-name="max"], input[name*="[max]"]' )
					.attr(
						'name',
						optionKey +
							'[sidebar][price][segments][' +
							index +
							'][max]'
					);
			}
		);
	}

	function reindexCustomTaxRows( $wrap ) {
		const optionKey = $wrap
			.find( 'select[name*="[sidebar][facets][custom_taxonomies]"]' )
			.first()
			.attr( 'name' )
			?.match( /^[^\[]+/)?.[ 0 ];

		if ( ! optionKey ) {
			return;
		}

		$wrap
			.find( '#bpss-custom-taxonomies tbody .bpss-settings__custom-tax-row' )
			.each( function ( index ) {
				$( this )
					.find(
						'select[data-name="taxonomy"], select[name*="[taxonomy]"]'
					)
					.attr(
						'name',
						optionKey +
							'[sidebar][facets][custom_taxonomies][' +
							index +
							'][taxonomy]'
					);
				$( this )
					.find( 'input[data-name="label"], input[name*="[label]"]' )
					.attr(
						'name',
						optionKey +
							'[sidebar][facets][custom_taxonomies][' +
							index +
							'][label]'
					);
				$( this )
					.find( 'select[data-name="mode"], select[name*="[mode]"]' )
					.attr(
						'name',
						optionKey +
							'[sidebar][facets][custom_taxonomies][' +
							index +
							'][mode]'
					);
				$( this )
					.find(
						'input[data-name="show_sub"], input[name*="[show_sub]"]'
					)
					.attr(
						'name',
						optionKey +
							'[sidebar][facets][custom_taxonomies][' +
							index +
							'][show_sub]'
					);
			} );
	}

	$( function () {
		const $wrap = $( '.bpss-settings' );
		if ( ! $wrap.length ) {
			return;
		}

		$wrap.on( 'click', '.bpss-settings__tab', function ( event ) {
			event.preventDefault();
			const tab = $( this ).data( 'tab' );
			if ( ! tab ) {
				return;
			}

			$wrap.find( '.bpss-settings__tab' ).removeClass( 'is-active' );
			$( this ).addClass( 'is-active' );
			$wrap.find( '.bpss-settings__panel' ).removeClass( 'is-active' );
			$wrap
				.find( '.bpss-settings__panel[data-tab-panel="' + tab + '"]' )
				.addClass( 'is-active' );
			$wrap.find( 'input[name="bpss_active_tab"]' ).val( tab );
		} );

		$wrap.on(
			'change',
			'input[name*="[sidebar][price][display]"]',
			function () {
				togglePriceSettings( $wrap );
			}
		);

		$wrap.on( 'click', '.bpss-add-segment', function () {
			const template = document.getElementById(
				'bpss-segment-row-template'
			);
			const tbody = $wrap.find( '#bpss-price-segments tbody' )[ 0 ];

			if ( ! template || ! tbody ) {
				return;
			}

			const clone = template.content.cloneNode( true );
			tbody.appendChild( clone );
			reindexSegmentRows( $wrap );
		} );

		$wrap.on( 'click', '.bpss-remove-segment', function () {
			$( this ).closest( '.bpss-settings__segment-row' ).remove();
			reindexSegmentRows( $wrap );
		} );

		$wrap.on( 'click', '.bpss-add-custom-tax', function () {
			const template = document.getElementById(
				'bpss-custom-tax-row-template'
			);
			const tbody = $wrap.find( '#bpss-custom-taxonomies tbody' )[ 0 ];

			if ( ! template || ! tbody ) {
				return;
			}

			const clone = template.content.cloneNode( true );
			tbody.appendChild( clone );
			reindexCustomTaxRows( $wrap );
		} );

		$wrap.on( 'click', '.bpss-remove-custom-tax', function () {
			$( this ).closest( '.bpss-settings__custom-tax-row' ).remove();
			reindexCustomTaxRows( $wrap );
		} );

		togglePriceSettings( $wrap );

		function toggleCachePanel( $wrap ) {
			const enabled = $wrap
				.find( '[data-bpss-cache-toggle]' )
				.is( ':checked' );

			$wrap.find( '[data-bpss-cache-panel]' ).prop( 'hidden', ! enabled );
			$wrap.find( '[data-bpss-cache-off-note]' ).prop( 'hidden', enabled );
			$wrap
				.find( '[data-bpss-cache-state-label]' )
				.text(
					enabled
						? window.bpssAdmin?.i18n?.on || 'On'
						: window.bpssAdmin?.i18n?.off || 'Off'
				);
		}

		function formatLastCleared( timestamp ) {
			if ( ! timestamp || ! window.bpssAdmin ) {
				return window.bpssAdmin?.i18n?.neverCleared || '';
			}

			const date = new Date( timestamp * 1000 );
			const formatted = date.toLocaleString();
			return (
				( window.bpssAdmin.i18n.lastCleared || 'Last cleared:' ) +
				' ' +
				formatted
			);
		}

		function renderBenchmark( $wrap, labels, measuredAt ) {
			const $body = $wrap.find( '[data-bpss-benchmark-body]' );
			$body.find( '[data-bpss-benchmark-empty]' ).remove();

			let $grid = $body.find( '.bpss-cache__benchmark-grid' );
			if ( ! $grid.length ) {
				$grid = $( `
					<div class="bpss-cache__benchmark-grid">
						<div class="bpss-cache__benchmark-stat">
							<span class="bpss-cache__benchmark-label"></span>
							<strong class="bpss-cache__benchmark-value" data-bpss-benchmark-cold></strong>
						</div>
						<div class="bpss-cache__benchmark-stat is-highlight">
							<span class="bpss-cache__benchmark-label"></span>
							<strong class="bpss-cache__benchmark-value" data-bpss-benchmark-warm></strong>
						</div>
						<div class="bpss-cache__benchmark-stat">
							<span class="bpss-cache__benchmark-label"></span>
							<strong class="bpss-cache__benchmark-value" data-bpss-benchmark-saved></strong>
						</div>
					</div>
					<p class="description bpss-cache__benchmark-meta" data-bpss-benchmark-meta></p>
				` );
				$body.append( $grid );
			}

			$grid
				.find( '.bpss-cache__benchmark-stat' )
				.eq( 0 )
				.find( '.bpss-cache__benchmark-label' )
				.text( window.bpssAdmin?.i18n?.coldLabel || 'Without cache' );
			$grid
				.find( '.bpss-cache__benchmark-stat' )
				.eq( 1 )
				.find( '.bpss-cache__benchmark-label' )
				.text( window.bpssAdmin?.i18n?.warmLabel || 'With cache' );
			$grid
				.find( '.bpss-cache__benchmark-stat' )
				.eq( 2 )
				.find( '.bpss-cache__benchmark-label' )
				.text( window.bpssAdmin?.i18n?.savedLabel || 'Estimated saving' );

			$body.find( '[data-bpss-benchmark-cold]' ).text( labels.cold );
			$body.find( '[data-bpss-benchmark-warm]' ).text( labels.warm );
			$body
				.find( '[data-bpss-benchmark-saved]' )
				.text( labels.saved + ' (' + labels.percent + '% faster)' );

			if ( measuredAt ) {
				const formatted = new Date( measuredAt * 1000 ).toLocaleString();
				$body
					.find( '[data-bpss-benchmark-meta]' )
					.text(
						( window.bpssAdmin?.i18n?.measuredAt || 'Measured:' ) +
							' ' +
							formatted
					);
			}
		}

		$wrap.on( 'change', '[data-bpss-cache-toggle]', function () {
			toggleCachePanel( $wrap );
		} );

		$wrap.on( 'click', '[data-bpss-clear-cache]', function () {
			const $button = $( this );
			const $notice = $wrap.find( '#bpss-cache-notice' );
			const $status = $wrap.find( '[data-bpss-cache-status]' );

			if ( ! window.bpssAdmin?.ajaxUrl || ! window.bpssAdmin?.nonce ) {
				return;
			}

			$button.prop( 'disabled', true );
			$notice.prop( 'hidden', true ).removeClass( 'is-success is-error' );

			$.post( window.bpssAdmin.ajaxUrl, {
				action: 'bpss_clear_cache',
				nonce: window.bpssAdmin.nonce,
			} )
				.done( function ( response ) {
					if ( ! response?.success ) {
						throw new Error( 'clear_failed' );
					}

					const clearedAt = response.data?.clearedAt || 0;
					$status.text( formatLastCleared( clearedAt ) );
					$notice
						.text(
							response.data?.message ||
								window.bpssAdmin.i18n.cleared
						)
						.addClass( 'is-success' )
						.prop( 'hidden', false );
				} )
				.fail( function () {
					$notice
						.text( window.bpssAdmin.i18n.clearError )
						.addClass( 'is-error' )
						.prop( 'hidden', false );
				} )
				.always( function () {
					$button.prop( 'disabled', false );
				} );
		} );

		$wrap.on( 'click', '[data-bpss-benchmark-cache]', function () {
			const $button = $( this );
			const $notice = $wrap.find( '#bpss-benchmark-notice' );

			if ( ! window.bpssAdmin?.ajaxUrl || ! window.bpssAdmin?.nonce ) {
				return;
			}

			$button.prop( 'disabled', true );
			$notice.prop( 'hidden', true ).removeClass( 'is-success is-error' );

			$.post( window.bpssAdmin.ajaxUrl, {
				action: 'bpss_benchmark_cache',
				nonce: window.bpssAdmin.nonce,
			} )
				.done( function ( response ) {
					if ( ! response?.success || ! response.data?.labels ) {
						throw new Error( 'benchmark_failed' );
					}

					renderBenchmark(
						$wrap,
						response.data.labels,
						response.data.benchmark?.measured_at || 0
					);
					$notice
						.addClass( 'is-success' )
						.prop( 'hidden', true );
				} )
				.fail( function () {
					$notice
						.text( window.bpssAdmin.i18n.measureError )
						.addClass( 'is-error' )
						.prop( 'hidden', false );
				} )
				.always( function () {
					$button.prop( 'disabled', false );
				} );
		} );

		// --- Statistics tab ---
		const $statsBody = $wrap.find( '[data-bpss-stats-body]' );
		const $statsNotice = $wrap.find( '[data-bpss-stats-notice]' );

		function formatDate( dateStr: string ): string {
			if ( ! dateStr ) return '—';
			try {
				const d = new Date( dateStr + 'Z' );
				if ( isNaN( d.getTime() ) ) return dateStr;
				return d.toLocaleString();
			} catch {
				return dateStr;
			}
		}

		function loadStats(): void {
			if ( ! $statsBody.length ) return;

			const restUrl = window.bpssAdmin?.statsRestUrl;
			const nonce = window.bpssAdmin?.statsNonce;

			if ( ! restUrl || ! nonce ) return;

			$statsBody.html( '<tr><td colspan="5" class="bpss-stats__empty">' + ( window.bpssAdmin.i18n.loading || 'Loading…' ) + '</td></tr>' );
			$statsNotice.prop( 'hidden', true );

			$.ajax( {
				url: restUrl + '?per_page=50',
				method: 'GET',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', nonce );
				},
			} )
				.done( function ( response ) {
					if ( ! response?.items || ! response.items.length ) {
						$statsBody.html( '<tr><td colspan="5" class="bpss-stats__empty">' + ( window.bpssAdmin.i18n.noData || 'No data.' ) + '</td></tr>' );
						return;
					}

					let rows = '';
					response.items.forEach( function ( item, index ) {
						const fromLabel = item.resolved_from === 'click'
							? ( window.bpssAdmin.i18n.resolvedClick || 'Product click' )
							: ( window.bpssAdmin.i18n.resolvedFallback || 'Closest match' );

						rows += '<tr>' +
							'<td class="col-rank">' + ( index + 1 ) + '</td>' +
							'<td class="col-keyword"><strong>' + escapeHtmlAdmin( item.keyword ) +
								( item.raw_query && item.raw_query !== item.keyword
									? ' <span class="bpss-stats__raw">(' + escapeHtmlAdmin( item.raw_query ) + ')</span>'
									: '' ) +
							'</strong></td>' +
							'<td class="col-count">' + item.count + '</td>' +
							'<td class="col-from">' + fromLabel + '</td>' +
							'<td class="col-date">' + formatDate( item.updated_at ) + '</td>' +
							'</tr>';
					} );

					$statsBody.html( rows );
				} )
				.fail( function () {
					$statsBody.html( '<tr><td colspan="5" class="bpss-stats__empty">' + ( window.bpssAdmin.i18n.loadError || 'Could not load.' ) + '</td></tr>' );
					$statsNotice.text( window.bpssAdmin.i18n.loadError || 'Could not load.' ).addClass( 'is-error' ).prop( 'hidden', false );
				} );
		}

		function escapeHtmlAdmin( text: string ): string {
			const div = document.createElement( 'div' );
			div.textContent = text;
			return div.innerHTML;
		}

		$wrap.on( 'click', '[data-bpss-refresh-stats]', function () {
			const $btn = $( this );
			$btn.prop( 'disabled', true ).text( window.bpssAdmin.i18n.refreshing || 'Refreshing…' );
			loadStats();
			setTimeout( function () {
				$btn.prop( 'disabled', false ).text( window.bpssAdmin.i18n.refresh || 'Refresh' );
			}, 1000 );
		} );

		$wrap.on( 'click', '[data-bpss-cleanup-stats]', function () {
			const $btn = $( this );
			const nonce = window.bpssAdmin?.statsNonce;
			const cleanupUrl = ( window.bpssAdmin?.statsRestUrl || '' ) + '/cleanup';

			if ( ! cleanupUrl || ! nonce ) return;

			$btn.prop( 'disabled', true ).text( window.bpssAdmin.i18n.cleaningUp || 'Cleaning…' );
			$statsNotice.prop( 'hidden', true ).removeClass( 'is-success is-error' );

			$.ajax( {
				url: cleanupUrl,
				method: 'DELETE',
				beforeSend: function ( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', nonce );
				},
			} )
				.done( function ( response ) {
					const removed = response?.removed || 0;
					$statsNotice
						.text( ( window.bpssAdmin.i18n.cleanedUp || 'Cleaned up {n} keywords.' ).replace( '{n}', removed ) )
						.addClass( 'is-success' )
						.prop( 'hidden', false );
					loadStats();
				} )
				.fail( function () {
					$statsNotice
						.text( window.bpssAdmin.i18n.cleanupError || 'Cleanup failed.' )
						.addClass( 'is-error' )
						.prop( 'hidden', false );
				} )
				.always( function () {
					$btn.prop( 'disabled', false ).text( window.bpssAdmin.i18n.cleanupOld || 'Cleanup old keywords' );
				} );
		} );

		if ( $( '.bpss-settings__tab.is-active' ).data( 'tab' ) === 'statistics' ) {
			loadStats();
		}

		$wrap.on( 'click', '.bpss-settings__tab', function () {
			const tab = $( this ).data( 'tab' );
			if ( tab === 'statistics' ) {
				loadStats();
			}
		} );

		toggleCachePanel( $wrap );

		if ( $.fn.wpColorPicker ) {
			$( '.bpss-color-picker' ).wpColorPicker();
		}
	} );
} )( jQuery );
