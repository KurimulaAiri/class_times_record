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
 * 表单项配置
 * 描述 FormGroup 内每一行的渲染方式，支持 11 种类型
 * 通过 type 字段区分渲染不同的表单控件
 */
interface FormItemConfig {
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

	/**
	 * 表单项类型，决定渲染哪种控件：
	 * - input: 文本输入框
	 * - textarea: 多行文本域
	 * - number: 数字输入框（type=number 的 input）
	 * - radio: 单选按钮组，需配合 options 使用
	 * - date: 日期选择器（picker mode=date）
	 * - time: 时间选择器（picker mode=time）
	 * - picker: 点击跳转选择器，点击整行触发 pickerTap 事件，由父组件处理跳转逻辑
	 * - stepper: 数字步进器（+/- 按钮调节数值）
	 * - avatar: 头像选择，点击触发 uni.chooseImage
	 * - text: 纯文本展示（仅 display 模式有效）
	 * - slot: 具名插槽，渲染 #key 插槽内容，用于完全自定义的表单项
	 */
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

	/**
	 * radio 类型的选项列表
	 * 仅 type 为 "radio" 时需要提供
	 */
	options?: FormItemOption[];

	/** 输入框最大字符长度限制 */
	maxlength?: number;

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
}

/**
 * 表单分组配置
 * 描述 FormPage 中每个 FormGroup 的渲染参数
 * 每个分组包含标题、样式、模式和表单项列表
 */
interface FormGroupConfig {
	/**
	 * 分组标题文本
	 * 为空字符串或不传则不显示标题栏
	 */
	title?: string;

	/**
	 * 标题样式风格：
	 * - "theme": 主题色标题（绿色文字 + 8rpx 宽装饰条），适用于学生相关页面
	 * - "dark": 深色标题（#333 文字 + 6rpx 窄装饰条），适用于班级相关页面
	 */
	titleStyle?: "theme" | "dark";

	/**
	 * 分组模式：
	 * - "edit": 编辑模式，渲染可交互的表单控件（input/radio/picker 等）
	 * - "display": 展示模式，渲染只读的 info-item（label + value 两端对齐）
	 */
	mode?: "edit" | "display";

	/** 标题后是否显示红色 * 必填标记 */
	required?: boolean;

	/**
	 * 分组内的表单项配置列表
	 * 为空数组或不传时，分组只渲染标题和默认插槽，适用于完全自定义内容的场景
	 */
	items?: FormItemConfig[];
}
