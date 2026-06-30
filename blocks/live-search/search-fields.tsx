import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface SearchFieldsProps {
	searchFields: string[];
	setAttributes: ( attrs: { searchFields?: string[] } ) => void;
}

const FIELD_OPTIONS = [
	{ key: 'title', label: __( 'Title', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
	{ key: 'sku', label: __( 'SKU', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
	{ key: 'content', label: __( 'Content', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
	{ key: 'categories', label: __( 'Categories', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
	{ key: 'tags', label: __( 'Tags', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
	{ key: 'attributes', label: __( 'Attributes', 'beplus-fast-product-filter-live-search-for-woocommerce' ) },
] as const;

function toggleField( key: string, searchFields: string[] ): string[] {
	const next = searchFields.includes( key )
		? searchFields.filter( ( field ) => field !== key )
		: [ ...searchFields, key ];

	return next.length > 0 ? next : [ 'title' ];
}

export default function SearchFields( {
	searchFields,
	setAttributes,
}: SearchFieldsProps ) {
	return (
		<>
			<p className="components-base-control__help">
				{ __(
					'Choose which product data to search. Matching fields (except Content) appear under each result.',
					'beplus-fast-product-filter-live-search-for-woocommerce'
				) }
			</p>
			{ FIELD_OPTIONS.map( ( field ) => (
				<ToggleControl
					key={ field.key }
					label={ field.label }
					checked={ searchFields.includes( field.key ) }
					onChange={ () =>
						setAttributes( {
							searchFields: toggleField( field.key, searchFields ),
						} )
					}
				/>
			) ) }
		</>
	);
}
