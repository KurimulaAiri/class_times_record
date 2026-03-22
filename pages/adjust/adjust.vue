<template>
	<view class="content">
		<view class="top">
			<view class="adjust-form">
				<view class="form-item">
					<view class="form-label">学生-课程</view>
					<view class="form-input" @click="openDrawer()">
						<view
							class="record-item"
							v-for="(item, index) in adjustList"
							:key="index"
						>
							{{ item.stuName }} -
							{{ item.courseName }}
						</view></view
					>
					<uni-icons type="right" @click="openDrawer()" />
				</view>
				<view class="form-item">
					<view class="form-label">日期</view>
					<view class="form-input"
						><uni-datetime-picker
							type="date"
							:clear-icon="false"
							v-model="record.recordTime"
					/></view>
				</view>
				<view class="form-item">
					<view class="form-label">记录类型</view>
					<view class="form-input">
						<view class="status-group">
							<view
								class="status-btn"
								:class="{ active: record.recordType === 1 }"
								@click="record.recordType = 1"
								>消课</view
							>
							<view
								class="status-btn"
								:class="{ active: record.recordType === 2 }"
								@click="record.recordType = 2"
								>充值</view
							>
							<view
								class="status-btn"
								:class="{ active: record.recordType === 3 }"
								@click="record.recordType = 3"
								>记录</view
							>
						</view>
					</view>
				</view>
				<template v-for="(item, index) in recordTypeItemList" :key="index">
					<view class="form-item" v-if="item[record.recordType] !== ''">
						<view class="form-label">{{ item[record.recordType] }}</view>
						<input
							class="form-input"
							v-model="record.recordChange"
							:placeholder="'请输入' + item[record.recordType] + '数量'"
							v-if="index === 0"
						/>
						<input
							class="form-input"
							v-model="record.recordRemark"
							:placeholder="item[record.recordType]"
							v-else
						/>
					</view>
				</template>
			</view>
			<view class="confirm-btn" @click="submit">确认</view>
		</view>
		<uni-drawer ref="showRightRef" mode="right" :mask-click="true">
			<view class="scroll-view">
				<scroll-view class="scroll-view-box" scroll-y="true">
					<view class="course-list">
						<view
							v-for="(item, index) in courseRecordList"
							:key="index"
							class="course-list-item"
							:class="{ 'is-selected': selectedIds.includes(item.id) }"
							@click="toggleSelect(item.id)"
						>
							<view class="select-icon" v-if="selectedIds.includes(item.id)">
								<uni-icons type="checkbox-filled" size="20" color="#70a9a2" />
							</view>
							<view class="list-item">
								<view class="list-label">学生姓名：</view>
								<view class="list-input">{{ item.stuName }}</view>
							</view>
							<view class="list-item">
								<view class="list-label">课程名称：</view>
								<view class="list-input">{{ item.courseName }}</view>
							</view>
							<view class="list-item">
								<view class="list-label">剩余课时：</view>
								<view class="list-input">{{ item.courseRestTime }}</view>
							</view>
						</view>
					</view>
					<button class="confirm-select-btn" @click="confirmSelect">
						确认
					</button>
				</scroll-view>
			</view>
		</uni-drawer>
	</view>
</template>

<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { ref } from "vue";
	import { post } from "../../utils/request";

	const adjustList = ref([]);

	const courseRecordList = ref({});

	const showRightRef = ref(null);
	const showRight = ref(false);

	const selectedIds = ref([]);

	const confirmSelect = () => {
		console.log("确认选择:", selectedIds.value);
		if (selectedIds.value.length === 0) {
			uni.showToast({
				title: "至少选择一门课程",
				icon: "none",
			});
			return;
		}
		console.log("selectedIds.value", selectedIds.value);

		let temp = null;

		if (adjustList.value[0].courseStatus === 2) {
			temp = adjustList.value[0];
		}

		adjustList.value = [];

		if (temp !== null && temp !== undefined) {
			for (let item of adjustList.value) {
				if (item.id === temp.id) {
					adjustList.value.push(item);
				}
			}
		}

		for (let item of courseRecordList.value) {
			if (selectedIds.value.includes(item.id)) {
				adjustList.value.push(item);
			}
		}
		showRightRef.value.close();
		console.log("adjustList.value", adjustList.value);
	};

	const toggleSelect = (id) => {
		if (selectedIds.value.includes(id)) {
			if (selectedIds.value.length === 1) {
				uni.showToast({
					title: "至少选择一门课程",
					icon: "none",
				});
				return;
			}
			selectedIds.value = selectedIds.value.filter((item) => item !== id);
		} else {
			selectedIds.value.push(id);
		}
	};

	const openDrawer = () => {
		courseRecordList.value = [];
		post("/course_record/get", {
			courseStatus: 1,
		}).then((res) => {
			console.log("获取课程记录:", res);
			// 如果课程是已完成状态，添加到课程列表中，因为查询的目标是未完成的课程
			if (adjustList.value[0].courseStatus === 2) {
				if (courseRecordList.value.length === 0) {
					console.log("当前长度:", courseRecordList.value.length);
					// console.log("adjustList.value[0]:", adjustList.value[0]);
					courseRecordList.value.push(adjustList.value[0]);
				}
			}
			for (let item of res.data.courseRecords) {
				if (!courseRecordList.value.some((record) => record.id === item.id)) {
					console.log("添加课程记录:", item);
					courseRecordList.value.push(item);
				} else {
					console.log("课程记录已存在:", item);
				}
			}
			console.log("courseRecordList.value", courseRecordList.value);
		});
		showRightRef.value.open();
	};

	const recordTypeItemList = ref([
		{
			[1]: "消耗课时",
			[2]: "新增课时",
			[3]: "",
		},
		{
			[1]: "备注",
			[2]: "备注",
			[3]: "记录内容",
		},
	]);

	const record = ref({
		courseRecordIdList: [],
		recordTime: "",
		recordType: 1,
		recordRemark: "",
		recordChange: 1,
	});

	onLoad((options) => {
		// 3. 先解码（对应发送端的 encodeURIComponent），再解析
		const decodedData = decodeURIComponent(options.data);
		adjustList.value.push(JSON.parse(decodedData));

		record.value.recordTime = getToday();
		selectedIds.value = [];
		selectedIds.value.push(adjustList.value[0].id);
		console.log("adjustList.value[0]", adjustList.value[0]);
	});

	const getToday = () => {
		const date = new Date();
		const year = date.getFullYear();
		// month 和 day 如果小于 10，前面补 0
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const submit = () => {
		if (
			record.value.recordChange === null ||
			record.value.recordChange === ""
		) {
			uni.showToast({
				title: "请输入课时调整",
				icon: "none",
			});
			return;
		}
		// 校验是否为数字
		if (isNaN(record.value.recordChange)) {
			uni.showToast({
				title: "课时调整必须为数字",
				icon: "none",
			});
			return;
		}

		record.value.courseRecordIdList = selectedIds.value;
		record.value.recordTime += " 00:00:00"; // 00:00:00 补全具体时间，后端采用LocalDateTime接受

		post("/record/add_all", record.value).then((res) => {
			console.log("提交后:", res);
			if (res.code === 200) {
				uni.showToast({
					title: "调整成功",
					icon: "success",
				});
				uni.navigateBack({
					delta: 1,
				});
			} else {
				uni.showToast({
					title: res.msg,
					icon: "none",
				});
			}
		});
		console.log("提交前:", record.value);
	};
</script>

<style lang="scss">
	@import "../../static/scss/index.scss";

	.content {
		width: 100%;
		display: flex;
		justify-content: space-around;
		flex-direction: column;
	}

	.top {
		width: 100%;
		display: flex;
		align-items: center;
		align-content: center;
		flex-direction: column;
		justify-content: flex-end;
		margin-bottom: 20px;
	}

	.adjust-form {
		width: 90%;
		padding: 0 20px 20px 20px;
		border: 1px solid #ddd;
		margin: 20px auto;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		align-content: center;
		flex-wrap: nowrap;
		flex-direction: column;
		box-sizing: border-box;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.form-item {
		line-height: 40px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		align-content: center;
		flex-direction: row;
		border-bottom: 1px solid #ddd;
		padding-top: 10px;
		padding-bottom: 10px;
		// 最后一项去掉边框，避免多出一道线
		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
			padding-top: 0;
			padding-bottom: 0;
		}
	}

	.form-label {
		width: 30%;
		font-size: 15px;
		font-weight: bold;
		float: left;
	}

	.form-input {
		width: 65%;
		float: left;
		font-size: 15px;
	}

	.status-group {
		width: 100%;
		display: flex;
		justify-content: center;
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
		.status-btn {
			width: 33%;
			height: 20px;
			line-height: 20px;
			background-color: #f8f8f8;
			text-align: center;
			padding: 5px 15px;
			font-size: 14px;
			color: #666;
			transition: all 0.3s;

			// 选中状态的样式
			&.active {
				background-color: $theme-color; // 使用你的主题色
				color: #fff;
			}

			// 第一个按钮加个右边框区分
			&:first-child {
				border-right: 1px solid #ddd;
			}
		}
	}

	.course-list {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		align-content: center;
		flex-direction: column;
	}

	.course-list-item {
		width: 80%;
		position: relative;
		padding: 15px;
		margin-bottom: 10px;
		margin-top: 10px;
		border: 2rpx solid #eee;
		border-radius: 8px;
		background-color: #fff;
		transition: all 0.2s ease; // 让颜色变换更平滑

		// 选中后的样式变换
		&.is-selected {
			background-color: #f0f7ff; // 浅蓝色背景
			border-color: $theme-color; // 主题色边框

			.list-label {
				color: $theme-color; // 标签文字变色
			}
		}
	}

	.select-icon {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.list-item {
		width: 100%;
		font-size: 15px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		align-content: center;
		flex-direction: row;
	}

	.confirm-btn {
		width: 90%;
		height: 40px;
		line-height: 40px;
		background-color: $theme-color;
		color: #fff;
		font-size: 16px;
		text-align: center;
		border-radius: 4px;
	}

	.scroll-view {
		flex: 1;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.confirm-select-btn {
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto; /* 核心：自动分配剩余空间 */
		position: fixed;
		display: block;
		bottom: 20px;
		width: 90%;
		height: 40px;
		line-height: 40px;
		background-color: $theme-color;
		color: #fff;
		font-size: 16px;
		text-align: center;
		border-radius: 4px;
	}
</style>
