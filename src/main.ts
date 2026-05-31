import App from "./App.vue";
// #ifdef VUE3
import { createSSRApp } from "vue";
import * as Pinia from "pinia";

import { ROUTES } from "@/config/routes";
import share from "@/utils/share";

export function createApp() {
	const app = createSSRApp(App);
	const pinia = Pinia.createPinia();
	app.config.globalProperties.$ROUTES = ROUTES;

	app.use(pinia);

	app.mixin(share);

	// 全局注册 pinia
	return {
		app,
		pinia,
	};
}
// #endif
