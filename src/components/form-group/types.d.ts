interface FormItemOption {
	label?: string;
	name?: string;
	value: any;
}

interface FormItemConfig {
	key: string;
	label: string;
	type:
		| "input"
		| "textarea"
		| "number"
		| "radio"
		| "date"
		| "time"
		| "picker"
		| "stepper"
		| "avatar"
		| "text"
		| "slot";
	required?: boolean;
	placeholder?: string;
	noBorder?: boolean;
	block?: boolean;
	column?: boolean;
	small?: boolean;
	itemClass?: string;
	options?: FormItemOption[];
	maxlength?: number;
	inputAlign?: "left" | "right";
	pickerText?: string;
	min?: number;
	max?: number;
	emptyText?: string;
}

interface FormGroupConfig {
	title?: string;
	titleStyle?: "theme" | "dark";
	mode?: "edit" | "display";
	required?: boolean;
	items?: FormItemConfig[];
}
