import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

export default defineConfig({
	plugins: [uni()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	define: {
		global: "globalThis",
	},
	css: {
		preprocessorOptions: {
			scss: {
				// 关键改动：利用 path.resolve 抛弃 @/ 别名，直接生成标准的文件绝对路径
				// 这样可以完美避开 uni-app 别名解析器的 MODULE_NOT_FOUND Bug
				additionalData: `
          @use "sass:color";
          @use "${path.resolve(__dirname, "src/static/scss/index.scss").replace(/\\/g, "/")}" as *;
        `,
				includePaths: [path.resolve(__dirname, "")],
				silenceDeprecations: ["legacy-js-api"], // 解决旧版颜色函数警告],
			},
		},
	},
});
