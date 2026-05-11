<template>
	<div></div>
</template>

<script setup lang="ts">
	import { useStudentStore } from "@/stores/student";
	import { computed, ref } from "vue";
    import { onLoad } from "@dcloudio/uni-app";

	const studentStore = useStudentStore();

	const student = computed(() => studentStore.studentInfo);

	onLoad(() => {
		if (student.value) {
			console.log("当前student.value:", student.value);
		}
	});
</script>

<style scoped></style>
