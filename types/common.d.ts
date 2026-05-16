interface ToSelectStudentPageParams {
	type: "multi" | "single";
}

interface SearchFilterConfig {
	label: string;
	options: { label: string; value: any }[];
	defaultValue?: any;
}

interface FilterType extends Record<string, SearchFilterConfig> {}

interface ActiveFiltersType extends Record<string, any> {}

