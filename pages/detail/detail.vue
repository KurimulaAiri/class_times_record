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
</script>

<style lang="scss">
	.content {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-content: flex-start;
		align-items: center;
		justify-content: flex-start;
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
</style>
