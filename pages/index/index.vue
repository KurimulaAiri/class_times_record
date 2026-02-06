<template>
	<view class="content">
		<view class="top">
			<view class="search-bar-line">
				<uni-search-bar
					v-model="searchText"
					placeholder="请输入搜索内容"
					clearable
					cancelButton="false"
					@search="handleSearch"
					class="search-bar"
					radius="50"
				>
				</uni-search-bar>
			</view>
			<view class="data-tabs">
				<up-tabs :list="dataTabsList" class="data-menu-tabs"></up-tabs>
			</view>
		</view>
		<view class="bottom">
			<uni-card v-for="item in dataList" :key="item.id" class="data-card">
				<view>
					<slot name="title" class="title">
						<div class="card-title">
							<div
								class="card-title-left"
								@click="handleClick(item, dataDetailMap)"
							>
								<uni-icons
									type="person-filled"
									size="30"
									color="#92dcd3"
								></uni-icons>
								<div class="name">{{ item.name }}</div>
							</div>
							<div class="card-title-right">
								<uni-icons
									type="more"
									size="30"
									color="#92dcd3"
									class="more-icon"
									@click.stop="handleMore(item)"
								></uni-icons>
							</div>
						</div>
					</slot>
					<div
						v-for="(value, key) in dataIndexDetailMap"
						:key="key"
						class="card-content"
						@click="handleClick(item, dataDetailMap)"
					>
						{{ value }}：{{ item[key] }}
					</div>
				</view>
			</uni-card>
		</view>
		<view class="fab">
			<uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";

	// 响应式数据（替代原 data 中的内容）
	const searchText = ref("");
	const selectData = ref({});
	const dataMenuList = ref([
		{
			name: "编辑",
		},
		{
			name: "删除",
		},
	]);
	const dataTabsList = ref([
		{
			name: "全部",
		},
		{
			name: "学习中",
		},
		{
			name: "已完成",
		},
	]);
	const dataIndexDetailMap = ref({
		name: "姓名",
		courseName: "课程名称",
		courseTotalNum: "课程总次数",
		courseLeftNum: "课程剩余次数",
		courseLastTime: "最后上课时间",
		remark: "备注",
	});
	const dataDetailMap = ref({
		name: "姓名",
		courseName: "课程名称",
		courseTotalNum: "课程总次数",
		courseLeftNum: "课程剩余次数",
		courseLastTime: "最后上课时间",
		remark: "备注",
	});
	const dataList = ref([
		{
			id: 1,
			name: "张三",
			courseName: "1",
			courseTotalNum: 10,
			courseLeftNum: 5,
			courseLastTime: "2023-01-01 00:00:00",
			remark: "无",
		},
		{
			id: 2,
			name: "李四",
			courseName: "2",
			courseTotalNum: 10,
			courseLeftNum: 5,
			courseLastTime: "2023-01-01 00:00:00",
			remark: "无",
		},
		{
			id: 3,
			name: "王五",
			courseName: "3",
			courseTotalNum: 10,
			courseLeftNum: 5,
			courseLastTime: "2023-01-01 00:00:00",
			remark: "无",
		},
		{
			id: 4,
			name: "赵六",
			courseName: "4",
			courseTotalNum: 10,
			courseLeftNum: 5,
			courseLastTime: "2023-01-01 00:00:00",
			remark: "无",
		},
	]);

	// 生命周期函数（替代原 onLoad）
	onLoad(() => {
		// console.log(uni.$u.config.v);
	});

	// 方法定义（替代原 methods 中的内容）
	const handleSearch = () => {
		console.log(searchText.value); // Vue3 响应式数据需通过 .value 访问
	};

	const handleMore = (item) => {
		selectData.value = item; // 赋值需用 .value
		uni.showActionSheet({
			itemList: dataMenuList.value.map((item) => item.name),
			success: (res) => {
				switch (res.tapIndex) {
					case 0:
						console.log("编辑");
						break;
					case 1:
						console.log("删除");
						break;
				}
			},
		});
	};

	const handleClick = (item, detailMap) => {
		const navItem = {
			detailMap: detailMap,
			data: item,
		};
		uni.navigateTo({
			url: "/pages/detail/detail?detail=" + JSON.stringify(navItem),
		});
	};

	// 如果模板中需要使用这些方法，需暴露出去（setup 语法自动暴露，无需 return，仅需确保函数定义在 setup 内）
</script>

<style lang="scss">
	.content {
		width: 100%;
		height: 100vh;
		background-color: #92dcd3;
		display: flex;
		align-content: center;
		flex-wrap: nowrap;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}
	.fab {
		position: fixed;
		bottom: 5%;
		right: 5%;
		width: 65px;
		height: 65px;
		z-index: 3;
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #92dcd3;
		color: #fff;
		font-size: 20px;
	}
	.fab:active {
		background-color: #7ccac0;
		transform: scale(0.95);
		transition: transform 0.3s ease-in-out;
		transition: background-color 0.3s ease-in-out;
	}
	.top {
		width: 100%;
		height: 15%;
		top: -5%;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		align-content: center;
		align-items: center;
		justify-content: center;
		position: fixed;
		background-color: #92dcd3;
		z-index: 2;
	}
	.search-bar-line {
		width: 100%;
		background-color: #92dcd3;
	}
	.search-bar {
		width: 70%;
		height: 50px;
		background-color: #92dcd3;
	}

	.bottom {
		width: 100%;
		margin-top: 20%;
		padding-top: 20px;
		background-color: #fff;
		border-radius: 20px;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}
	.data-card {
		width: 90%;
	}
	.name {
		margin-left: 10px;
	}
	.title {
		width: 100%;
		display: inline-flex;
		justify-content: space-around;
		flex-wrap: nowrap;
		flex-direction: row;
	}
	.card-title {
		font-size: 20px;
		color: #333;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.card-title-left {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.card-title-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	.card-content {
		margin-top: 10px;
		font-size: 15px;
		color: #666;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
	.more-icon {
		z-index: 1;
	}
</style>
