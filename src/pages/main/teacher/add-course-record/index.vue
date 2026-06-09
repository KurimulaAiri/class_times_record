<template>
    <view>
        <FormPage
            :groups="groups"
            @picker-tap="onPickerTap"
            v-model:modelValue="insertForm"
        >
        </FormPage>

        <PageFooter
            :buttons="[{ text: '添加课程', type: 'primary' }]"
            @btnClick="handleSubmit"
        ></PageFooter>
    </view>
</template>

<script setup lang="ts">
    import FormPage from "@/components/form-page/index.vue";
    import PageFooter from "@/components/page-footer/index.vue";
    import { useStudentStore } from "@/stores/student";
    import { ROUTES } from "@/config/routes";
    import { jump, showToast } from "@/utils/common";
    import { onLoad } from "@dcloudio/uni-app";
    import { onUnmounted, ref, watch } from "vue";
    import { insertCourseRecord } from "@/api/course-record";

    const studentStore = useStudentStore();
    const currentStudent = ref<StudentResponse>();

    // 1. 表单响应式基础数据
    const insertForm = ref<InsertCourseRecordRequest>({
        courseId: 0,
        studentId: 0,
        courseRemark: "",
        courseRestTime: 0,
        courseTotalTime: 0,
        // 如果你的 FormPage 组件支持在数据模型里直接读取显示文本，可以加一个冗余字段，
        // 或者像下面通过固定 groups 配合单独的 watch 来解决。
        expireTime: "",
    });

    // 2. 【核心破局点】：干掉 computed，改为普通固定配置
    // 如果 FormPage 内部是通过 items 里的某个属性显示 picker 文本的，
    // 我们在 uni.$on 里直接精准修改 groups 里的某一项，而不是让 Vue 自动去大面积重算。
    const groups: FormGroupConfig[] = [
        {
            title: "添加课程信息",
            mode: "edit",
            items: [
                {
                    label: "选择课程",
                    key: "courseId",
                    type: "picker",
                    inputAlign: "right",
                    pickerText: "请选择", // 给定初始字样
                },
                {
                    label: "剩余课时",
                    key: "courseRestTime",
                    type: "stepper",
                    inputAlign: "right",
                    placeholder: "请输入剩余课时",
                },
                {
                    label: "总课时",
                    key: "courseTotalTime",
                    type: "stepper",
                    inputAlign: "right",
                    placeholder: "请输入总课时",
                },
                {
                    label: "到期时间",
                    key: "expireTime",
                    type: "date",
                    inputAlign: "right",
                    placeholder: "请选择到期时间",
                },
            ],
        },
    ];

    // 3. 监听 Pinia Store 中学生数据的真正到达
    watch(
        () => studentStore?.studentInfo,
        (newInfo) => {
            if (newInfo && newInfo.id) {
                currentStudent.value = newInfo;
                insertForm.value.studentId = newInfo.id;
                console.log("学生ID已成功绑定到表单:", insertForm.value.studentId);
            }
        },
        { immediate: true, deep: true },
    );

    // 4. 全局跨页事件监听
    uni.$on("updateCourse", (course: CourseResponse) => {
        console.log("接收课程跨页数据:", course);
        
        // 步骤 A：给实际提交的表单字段赋值
        insertForm.value.courseId = course.id;
        
        // 步骤 B：精准改写静态 groups 配置中的展示文字，不破坏整个数组的引用地址，防止子组件重置
        if (groups[0]?.items?.[0]) {
            groups[0].items[0].pickerText = course.courseName;
        }

        // 步骤 C：强刷一次表单引用，通知子组件数据已变动
        insertForm.value = { ...insertForm.value };
    });

    onLoad(() => {
        const student = studentStore?.studentInfo || ({} as StudentResponse);
        currentStudent.value = student;

        if (student && student.id) {
            insertForm.value.studentId = student.id;
            console.log("onLoad 阶段成功注入学生ID:", insertForm.value.studentId);
        } else {
            console.warn("警告：未能在 Store 中检测到有效的学生信息！");
        }
    });

    /** 处理课程选择器点击事件 */
    const onPickerTap = () => {
        jump(ROUTES.SELECT_COURSE);
    };

    const validate = () => {
        if (!insertForm.value.studentId || insertForm.value.studentId <= 0) {
            showToast({ msg: "当前学生身份未就绪，请返回重试", icon: "none" });
            return false;
        }
        if (!insertForm.value.courseId || insertForm.value.courseId === 0) {
            showToast({ msg: "请选择课程", icon: "none" });
            return false;
        }
        if (insertForm.value.courseRestTime <= 0) {
            showToast({ msg: "请输入正确的剩余课时", icon: "none" });
            return false;
        }
        if (insertForm.value.courseTotalTime <= 0) {
            showToast({ msg: "请输入正确的总课时", icon: "none" });
            return false;
        }
        if (insertForm.value.courseRestTime > insertForm.value.courseTotalTime) {
            showToast({ msg: "剩余课时不能大于总课时", icon: "none" });
            return false;
        }
        return true;
    };

    /** 处理提交事件 */
    const handleSubmit = async () => {
        if (!validate()) return;
        
        console.log("安全提交表单:", insertForm.value);
        const res = await insertCourseRecord({
            ...insertForm.value,
            expireTime: insertForm.value.expireTime + " 00:00:00" || "",
        });

        if (res) {
            showToast({ msg: "添加成功", icon: "success" });
            uni.navigateBack();
        } else {
            showToast({ msg: "添加失败", icon: "none" });
        }
    };

    onUnmounted(() => {
        uni.$off("updateCourse");
    });
</script>

<style scoped lang="scss" src="./index.scss"></style>