<template>
	<view class="container">
		<view class="form-card">
			<view class="form-item">
				<text class="label">班级名称<text class="required">*</text></text>
				<input
					class="input"
					v-model="form.className"
					placeholder="请输入班级名称"
				/>
			</view>

			<view class="form-item" @tap="toSelectCourse">
				<text class="label">关联课程<text class="required">*</text></text>
				<view :class="['picker-box', !form.courseName && 'placeholder']">
					{{ form.courseName || "点击选择课程" }}
					<uni-icons type="right" size="14" color="#ccc"></uni-icons>
				</view>
			</view>

			<view class="form-item">
				<text class="label">人数上限</text>
				<view class="stepper">
					<view class="step-btn" @tap="form.maxSize > 1 && form.maxSize--"
						>-</view
					>
					<input class="step-input" type="number" v-model="form.maxSize" />
					<view class="step-btn" @tap="form.maxSize++">+</view>
				</view>
			</view>

			<view class="form-item no-border">
				<view class="label-row">
					<text class="label">任课老师<text class="required">*</text></text>
					<view class="add-teacher-btn" @tap="toSelectTeacher">
						<uni-icons
							type="staff-filled"
							size="16"
							:color="themeColor"
						></uni-icons>
						<text>去选择</text>
					</view>
				</view>
				<view class="teacher-tags" v-if="selectedTeachers.length > 0">
					<view class="tag" v-for="(t, i) in selectedTeachers" :key="t.id">
						<text>{{ t.name }}</text>
						<text class="tag-close" @tap="removeTeacher(i)">×</text>
					</view>
				</view>
				<view v-else class="empty-tip">未选择老师</view>
			</view>
		</view>

		<view class="footer">
			<button class="submit-btn" @tap="submit">创建班级</button>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, onUnmounted } from "vue";
	import { onLoad } from "@dcloudio/uni-app";
	import { jump } from "@/utils/common";
	import { ROUTES } from "@/config/routes";

	const themeColor = "#2979ff";
	const form = reactive({
		className: "",
		courseId: "",
		courseName: "",
		maxSize: 30,
	});
	const selectedTeachers = ref([]);

	onLoad(() => {
		uni.$on("updateCourse", (res) => {
			form.courseId = res.id;
			form.courseName = res.name;
		});
		uni.$on("updateTeachers", (res) => {
			selectedTeachers.value = res;
		});
	});

	onUnmounted(() => {
		uni.$off(["updateCourse", "updateTeachers"]);
	});

	const toSelectCourse = () => jump(ROUTES.SELECT_COURSE);
	const toSelectTeacher = () => {
		const ids = selectedTeachers.value.map((t) => t.id).join(",");
		jump(ROUTES.SELECT_TEACHER, { ids });
	};

	const removeTeacher = (index) => selectedTeachers.value.splice(index, 1);

	const submit = () => {
		if (
			!form.className ||
			!form.courseId ||
			selectedTeachers.value.length === 0
		) {
			return uni.showToast({ title: "请完善必填信息", icon: "none" });
		}
		console.log("提交最终数据", { ...form, teachers: selectedTeachers.value });
	};
</script>

<style lang="scss" scoped src="./index.scss"></style>
