<template>
	<view class="content">
		<view class="top">
			<view class="update-form">
				<view
					class="form-item"
					v-for="(item, index) in dataDetailMap"
					:key="index"
				>
					<view class="form-label">{{ item }}</view>
					<view class="form-input">
						<input class="form-input-text" v-model="tempData[index]" />
					</view>
				</view>
			</view>
		</view>
		<view class="bottom">
			<view class="button-group">
				<button class="button" @click="jump('detail', selectData.value)">
					取消
				</button>
				<button class="button" @click="confirm">确认</button>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post } from "../../utils/request";

	const selectData = ref({});
	const tempData = ref({});
	const dataDetailMap = ref({});

	onLoad((options) => {
		// 1. 打印原始 options 看看结构
		console.log("收到原始 options:", options);

		// 2. 这里的 options.data 才是你 jump 函数里传过来的那个 JSON 字符串
		if (options.data) {
			try {
				// 3. 先解码（对应发送端的 encodeURIComponent），再解析
				const decodedData = decodeURIComponent(options.data);
				const navItem = JSON.parse(decodedData);

				// 4. 赋值给响应式变量
				selectData.value = navItem.data;
				tempData.value = navItem.data;

				console.log("原始 detailMap:", navItem.detailMap);
				const { courseLastTimeStr, ...left } = navItem.detailMap;
				const newDetailMap = {...left, courseStatus: "课程状态"};
				dataDetailMap.value = newDetailMap;

				console.log("解析后的 data:", selectData.value);
				console.log("解析后的 detailMap:", dataDetailMap.value);
			} catch (e) {
				console.error("解析失败，数据格式可能不对:", e);
			}
		} else {
			console.warn("未接收到名为 data 的跳转参数");
		}
	});

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
			});
	};
</script>

<style lang="scss">
	@import "../../static/scss/index.scss";

	.content {
		display: flex;
		align-content: space-around;
		flex-direction: column;
		justify-content: space-between;
		height: 100vh;
		background-color: $theme-color;
	}

	.top {
		padding: 20px;
		margin-bottom: 20px;
	}

	.update-form {
		display: flex;
		align-content: space-between;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.form-item {
		width: 100%;
		display: flex;
		align-items: center;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.form-label {
		font-size: 15px;
		font-weight: bold;
	}

	.form-input {
		font-size: 15px;
	}

	.form-input-text {
		font-size: 15px;
	}

	.bottom {
		margin-top: 20px;
	}

	.button-group {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: space-around;
		margin-bottom: 20px;
	}

	.button {
		width: 100px;
		margin: 0 10px;
	}
</style>
