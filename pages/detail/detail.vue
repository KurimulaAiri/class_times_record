<template>
	<view class="content">
		<view class="top">
			<uni-card class="card">
				<view class="card-title">
					<div class="name">{{ selectData.name }}</div>
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
			<view class="button-group">
				<view class="button" @click="jump('adjust')">
					<uni-icons type="edit" size="20" color="#fff"></uni-icons>
					调整课时
				</view>
				<view class="button" @click="jump('edit')">
					<uni-icons type="edit" size="20" color="#fff"></uni-icons>
					编辑信息
				</view>
				<view class="button" @click="jump('share')">
					<uni-icons type="share" size="20" color="#fff"></uni-icons>
					分享
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	onLoad((options) => {
		console.log("detail", options);
	});
	import { ref } from "vue";
	const dataDetailMap = ref({});
	const selectData = ref({});
	onLoad((options) => {
		selectData.value = JSON.parse(options.detail).data;
		dataDetailMap.value = JSON.parse(options.detail).detailMap;
		console.log("data", selectData.value);
		console.log("detailMap", dataDetailMap.value);
	});
	const jump = (type) => {
		uni.navigateTo({
			url: "/pages/" + type + "/" + type + "?detail=" + JSON.stringify(selectData.value),
		});
	};
</script>

<style lang="scss">
	.content {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-content: flex-start;
		align-items: center;
		justify-content: space-around;
		background-color: #92dcd3;
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
		background-color: #70a9a2;
		color: #fff;
		font-size: 14px;

	}
	.button:active {
		transform: scale(0.95);
		transition: transform 0.3s ease-in-out;
		transition: background-color 0.3s ease-in-out;
		background-color: #4e7571;
	}
</style>
