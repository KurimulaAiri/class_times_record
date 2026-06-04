/**
 * 表单项选项配置
 * 用于 radio 类型的选项列表，每个选项包含显示文本和值
 */
interface FormItemOption {
	/** 选项显示文本（优先使用） */
	label?: string;
	/** 选项显示文本（label 的备选字段，与 label 二选一） */
	name?: string;
	/** 选项的实际值 */
	value: any;
}

/**
 * 1. 基础表单项配置 (公共字段)
 * 提取所有类型通用的共有属性
 */
interface BaseFormItemConfig {
	/**
	 * 字段路径，对应 modelValue 中的属性名
	 * 支持点号嵌套访问，如 "primaryParent.username" 会读取 modelValue.primaryParent.username
	 */
	key: string;

	/**
	 * 标签文本，显示在表单项左侧
	 * 在 display 模式下作为 info-item 的 label
	 */
	label: string;

	/** 是否必填，为 true 时在 label 后显示红色 * 标记 */
	required?: boolean;

	/** 输入框/选择器的占位提示文本 */
	placeholder?: string;

	/** 是否移除该行的底部分割线，通常用于分组内最后一项 */
	noBorder?: boolean;

	/**
	 * 是否使用块级布局（垂直排列）
	 * 为 true 时 label 在上、控件在下，适用于标签+内容需要上下排列的场景
	 * 如：任课老师选择区域
	 */
	block?: boolean;

	/**
	 * 是否使用纵向布局
	 * 为 true 时 label 在上、输入框在下且带有边框容器（input-box 样式）
	 * 适用于 parent/edit-student-info 页面的表单风格
	 */
	column?: boolean;

	/**
	 * 是否使用紧凑间距
	 * 仅 display 模式下生效，减小 info-item 的上下内边距
	 */
	small?: boolean;

	/** 额外的自定义 CSS 类名，会追加到 form-item 或 info-item 的 class 上 */
	itemClass?: string;

	/** 输入框最大字符长度限制 */
	maxLength?: number;

	/**
	 * 输入框文本对齐方式
	 * - "left": 左对齐（默认）
	 * - "right": 右对齐，适用于班级名称等需要右对齐的输入项
	 */
	inputAlign?: "left" | "right";

	/**
	 * picker 类型显示的文本
	 * 当 type 为 "picker" 时，该字段值会显示在选择器位置
	 * 通常用于显示已选择的内容，如课程名称
	 */
	pickerText?: string;

	/** stepper 类型的最小值限制，点击减号不会低于此值 */
	min?: number;

	/** stepper 类型的最大值限制，点击加号不会超过此值 */
	max?: number;

	/**
	 * display 模式下字段值为空时的回退文本
	 * 默认为 "未填写"
	 */
	emptyText?: string;

	/**
	 * 自定义格式化函数，用于在 display 模式下对字段值进行格式化
	 * 例如，将日期字符串转换为 "yyyy-MM-dd" 格式
	 */
	format?: (value: any) => string;
	/** 格式化函数的参数，用于自定义格式化 */
	formatParams?: any;

	/** radio / select 类型的选项列表 */
	options?: FormItemOption[];
}

/**
 * 2. 针对特定 type 扩展其特有字段
 */

// 只有 number 类型才拥有 allowNegative 属性
interface NumberFormItemConfig extends BaseFormItemConfig {
	type: "number";
	/** 是否允许输入负数，仅在 type 为 number 时有效 */
	allowNegative?: boolean;
}

// 其他不需要 allowNegative 的常规类型配置
interface OtherFormItemConfig extends BaseFormItemConfig {
	type:
		| "input"
		| "textarea"
		| "radio"
		| "select"
		| "date"
		| "time"
		| "picker"
		| "stepper"
		| "avatar"
		| "text"
		| "slot";

	// 显式禁止其他类型传入 allowNegative（设为 never 类型）
	allowNegative?: never;
}

/**
 * 3. 最终组合的表单项配置联合类型
 * 通过辨识属性 'type' 自动推导对应的细分接口
 */
type FormItemConfig = NumberFormItemConfig | OtherFormItemConfig;

/**
 * 表单分组配置保持不变
 */
interface FormGroupConfig {
	title?: string;
	titleStyle?: "theme" | "dark";
	mode?: "edit" | "display";
	required?: boolean;
	items?: FormItemConfig[];
}
