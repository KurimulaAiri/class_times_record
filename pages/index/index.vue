<template>
	<view class="content">
		<view class="data-menu">

		</view>
		<view class="top">
			<uni-search-bar
				v-model="searchText"
				placeholder="请输入搜索内容"
				clearable
				@search="handleSearch"
				class="search-bar"
				radius="50"
			>
			</uni-search-bar>
		</view>
		<view class="bottom">
			<uni-card v-for="item in dataList" :key="item.id" class="data-card" @click="handleClick(item)">
				<view>
					<slot name="title" class="title">
						<div class="card-title">
							<div class="card-title-left">
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
									@click="handleMore(item)"
								></uni-icons>
							</div>
						</div>
					</slot>
					<div class="card-content">课程名称：{{ item.courseName }}</div>
					<div class="card-content">课程总次数：{{ item.courseTotalNum }}</div>
					<div class="card-content">课程剩余次数：{{ item.courseLeftNum }}</div>
					<div class="card-content">
						最后上课时间：{{ item.courseLastTime }}
					</div>
					<div class="card-content">备注：{{ item.remark }}</div>
				</view>
			</uni-card>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchText: "",
				selectData: {},
				dataMenuList: [
					{
						name: "编辑",
					},
					{
						name: "删除",
					},
				],
				dataList: [
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
				],
			};
		},
		onLoad() {},
		methods: {
			handleSearch() {
				console.log(this.searchText);
			},
			handleMore(item) {
				// console.log(item);
				this.selectData = item;
				uni.showActionSheet({
					itemList: this.dataMenuList.map((item) => item.name),
					success: (res) => {
						// console.log(res);
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
			},
			handleClick(item) {
				// console.log(item);
				uni.navigateTo({
					url: "/pages/detail/detail?id=" + item.id,
				});
			},
		},
	};
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
	.top {
		width: 100%;
		height: 10%;
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		align-content: center;
		align-items: center;
		justify-content: center;
	}
	.search-bar {
		width: 80%;
	}
	.bottom {
		width: 100%;
		margin-top: 10%;
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
</style>
