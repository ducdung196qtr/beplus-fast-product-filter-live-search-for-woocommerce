export interface BlockAttributes {
	[key: string]: string | number | boolean | string[] | undefined;
	placeholder: string;
	showCategory: boolean;
	searchScope: 'all' | 'limited';
	limitCategorySlugs: string[];
	searchFields: string[];
	maxResults: number;
	debounceMs: number;
	minChars: number;
	enableSuggestions: boolean;
	suggestionLayout: 'inline' | 'tags';
	misspellingFix: boolean;
	exactMatch: boolean;
	searchLogic: 'or' | 'and';
	showAddToCart: boolean;
	showViewAll: boolean;
	highlightColor: string;
	submitButtonStyle: 'text' | 'icon';
	submitButtonText: string;
	quickSuggestions: string;
	quickSuggestionsCount: '5' | '10' | '15' | '20';
	quickSuggestionsAutoSync: boolean;
	enableQuickSuggestions: boolean;
}

export interface CategoryDefinition {
	slug: string;
	name: string;
}
