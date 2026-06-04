<template>
	<view class="content">
		<view class="top">
			<view class="update-form">
				<view
					class="form-item"
					v-for="(item, index) in EDIT_DATA_DETAIL_MAP"
					:key="index"
				>
					<template v-if="index !== 'courseStatus'">
						<view class="form-label">{{ item }}</view>
						<view class="form-input">
							<input class="form-input-text" v-model="tempData[index]" />
						</view>
					</template>
					<template v-else>
						<view class="form-label">{{ item }}</view>
						<view class="form-input">
							<view class="status-group">
								<view
									class="status-btn"
									:class="{ active: tempData[index] === 1 }"
									@click="tempData[index] = 1"
									>未完成</view
								>
								<view
									class="status-btn"
									:class="{ active: tempData[index] === 2 }"
									@click="tempData[index] = 2"
									>已完成</view
								>
							</view>
						</view>
					</template>
				</view>
			</view>
		</view>
		<view class="bottom">
			<view class="button-group">
				<button class="button btn-cancel" @click="back">取消</button>
				<button class="button btn-confirm" @click="confirm">确认</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { EDIT_DATA_DETAIL_MAP } from "@/config/common";
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post } from "@/utils/request";
	import { parseData, showToast } from "@/utils/common";

	/** 当前编辑的课卡记录数据 */
	const selectData = ref({});
	/** 临时编辑数据 */
	const tempData = ref({});

	onLoad((options) => {
		// 1. 打印原始 options 看看结构
		console.log("收到原始 options:", options);

		if (options) {
			// 2. 这里的 options.data 才是你 jump 函数里传过来的那个 JSON 字符串
			if (options.data) {
				try {
					// 3. 先解码（对应发送端的 encodeURIComponent），再解析
					const navItem: any = parseData(options.data);

					console.log("navItem:", navItem);

					// 4. 赋值给响应式变量
					selectData.value = navItem;
					tempData.value = { ...navItem }; // 深拷贝，避免直接修改原始数据

					console.log("解析后的 data:", selectData.value);
				} catch (e) {
					console.error("解析失败，数据格式可能不对:", e);
				}
			} else {
				console.warn("未接收到名为 data 的跳转参数");
			}
		}
	});

	/** 返回上一页 */
	const back = () => {
		uni.navigateBack();
	};
/** 确认编辑结果 */
	
	const confirm = () => {
		post("/course_record/update", tempData.value)
			.then((res) => {
				console.log("更新响应:", res);
				if (res.code === 200) {
					showToast({ msg: "更新成功", icon: "success" });
					uni.navigateBack();
				} else {
					showToast({ msg: res.message || "更新失败" });
				}
			})
			.catch(() => {
				showToast({ msg: "更新失败" });
			})
			.finally(() => {
				uni.hideLoading();
			});
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
