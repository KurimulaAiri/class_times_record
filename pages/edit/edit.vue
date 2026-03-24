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
				<button class="button" @click="back">取消</button>
				<button class="button" @click="confirm">确认</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { EDIT_DATA_DETAIL_MAP } from "../../config/common";
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post } from "../../utils/request";

	const selectData = ref({});
	const tempData = ref({});

	onLoad((options) => {
		// 1. 打印原始 options 看看结构
		console.log("收到原始 options:", options);

		// 2. 这里的 options.data 才是你 jump 函数里传过来的那个 JSON 字符串
		if (options.data) {
			try {
				// 3. 先解码（对应发送端的 encodeURIComponent），再解析
				const decodedData = decodeURIComponent(options.data);
				const navItem = JSON.parse(decodedData);

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
	});

	const back = () => {
		uni.navigateBack();
	};

	const jump = (type, data) => {
		// 关键点：使用 encodeURIComponent 包装 JSON 字符串
		const dataStr = encodeURIComponent(JSON.stringify(data));

		uni.navigateTo({
			url: `/pages/${type}/${type}?data=${dataStr}`,
		});
	};

	const confirm = () => {
		post("/course_record/update", tempData.value)
			.then((res) => {
				console.log("更新响应:", res);
				if (res.code === 200) {
					uni.showToast({
						title: "更新成功",
						icon: "success",
					});
					uni.navigateBack();
				} else {
					uni.showToast({
						title: res.msg || "更新失败",
						icon: "none",
					});
				}
			})
			.catch(() => {
				uni.showToast({
					title: "更新失败",
					icon: "none",
				});
			})
			.finally(() => {
				uni.hideLoading();
			});
	};
</script>

<style lang="scss" scoped src="./edit.scss"></style>
