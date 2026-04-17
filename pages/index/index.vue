<template>
	<div>
		<view class="content">
			<view class="entry-select-form">
                <view class="entry-select-form-title">
                    请选择身份
                </view>
				<view class="entry-select-btn-group">
					<view class="entry-select-btn" @click="jump('/pages/login/index', { role: 3 })">
						家长端
					</view>
					<view class="entry-select-btn" @click="jump('/pages/login/index', { role: 4 })">
						老师师端
					</view>
				</view>
			</view>
		</view>
	</div>
</template>

<script setup lang="ts">
	import { jump } from "@/utils/common/index";
</script>

<style scoped lang="scss" src="./index.scss"></style>
