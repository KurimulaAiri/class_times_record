<template>
	<view class="content">
		<view class="top">
			<uni-card class="card">
				<view class="card-title">
					<div class="name">{{ selectData.stuName }}</div>
				</view>
				<view
					v-for="(value, key) in dataDetailMap"
					:key="key"
					class="card-content"
				>
					<view class="card-content-left"> {{ value }}</view>

					<view class="card-content-right"> {{ selectData[key] }}</view>
				</view>
			</uni-card>
		</view>
		<view class="bottom">
			<view class="record-list">

			</view>
			<view class="button-group">
				<view
					class="button"
					@click="
						jump('adjust', selectData)
					"
				>
					<uni-icons type="edit" size="20" color="#fff"></uni-icons>
					调整课时
				</view>
				<view
					class="button"
					@click="jump('edit', { data: selectData, detailMap: dataDetailMap })"
				>
					<uni-icons type="edit" size="20" color="#fff"></uni-icons>
					编辑信息
				</view>
				<view
					class="button"
					@click="jump('share', { data: selectData, detailMap: dataDetailMap })"
				>
					<uni-icons type="share" size="20" color="#fff"></uni-icons>
					分享
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
import { post } from "../../utils/request";
	const dataDetailMap = ref({});
	const selectData = ref({});
	const recordList = ref([]);

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
				dataDetailMap.value = navItem.detailMap;

				console.log("解析后的 data:", selectData.value);
				console.log("解析后的 detailMap:", dataDetailMap.value);
			} catch (e) {
				console.error("解析失败，数据格式可能不对:", e);
			}
		} else {
			console.warn("未接收到名为 data 的跳转参数");
		}

		post("/record/get", {
			courseRecordId: selectData.value.id,
		}).then((res) => {
			console.log("获取记录响应:", res);
			if (res.code === 200) {
				recordList.value = res.data;
			} else {
				uni.showToast({
					title: res.msg || "获取记录失败",
					icon: "none",
				});
			}
		});

	});
	const jump = (type, data) => {
		console.log("跳转类型:", type);
		// 关键点：使用 encodeURIComponent 包装 JSON 字符串
		const dataStr = encodeURIComponent(JSON.stringify(data));
		uni.navigateTo({
			url: `/pages/${type}/${type}?data=${dataStr}`,
		});
	};
</script>

<style lang="scss">
	@import "../../static/scss/index.scss";

	.content {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-content: flex-start;
		align-items: center;
		justify-content: space-between;
		background-color: $theme-color;
	}
	.top {
		margin-top: 5%;
		width: 95%;
	}
	.card-title {
		margin-top: 20px;
		font-size: 20px;
	}
	.card-content {
		font-size: 14px;
		margin-top: 20px;
		display: flex;
		flex-direction: row;
		align-content: center;
		align-items: center;
		justify-content: space-between;
	}
	.card-content-left {
		width: 50%;
	}
	.card-content-right {
		width: 50%;
		display: flex;
		justify-content: flex-end;
		float: right;
	}
	.card {
		width: 95%;
		margin-top: 10%;
		padding-top: 20px;
		border-radius: 20px;
	}
	.bottom {
		margin-top: 10%;
		width: 95%;
	}
	.button-group {
		display: flex;
		flex-direction: row;
		align-content: center;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.button {
		display: flex;
		flex-direction: row;
		align-content: center;
		align-items: center;
		justify-content: center;
		width: 30%;
		height: 40px;
		border-radius: 20px;
		background-color: white;
		color: #5c5c5c;
		font-size: 14px;
	}
	.button:active {
		transform: scale(0.95);
		transition: transform 0.3s ease-in-out;
		transition: background-color 0.3s ease-in-out;
		background-color: #4e7571;
	}
</style>
