interface ToSelectStudentPageParams {
	type: "multi" | "single";
}

/**
 * 搜索筛选配置项
 */
interface SearchFilterConfig {
	label: string;
	options: { label: string; value: any }[];
	defaultValue?: any;
}

interface FilterType extends Record<string, SearchFilterConfig> {}

interface ActiveFiltersType extends Record<string, any> {}

