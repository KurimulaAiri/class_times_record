/**
 * 页脚按钮配置
 * 描述 PageFooter 中每个按钮的渲染参数
 */
interface FooterButton {
	/**
	 * 按钮显示文本
	 */
	text: string;

	/**
	 * 按钮类型，决定颜色风格：
	 * - "primary": 主题色背景 + 白色文字（主要操作按钮）
	 * - "secondary": 白色背景 + 深色文字 + 边框（次要操作按钮）
	 * - "danger": 红色背景 + 白色文字（危险操作按钮，如解绑）
	 */
	type?: "primary" | "secondary" | "danger";

	/** 是否禁用按钮，禁用时显示灰色且不可点击 */
	disabled?: boolean;
}
