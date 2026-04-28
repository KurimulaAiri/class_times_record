<template>
	<view class="container">
		<view class="form-group">
			<view class="form-item avatar-section" @tap="chooseAvatar">
				<text class="label">学员头像</text>
				<view class="right-content">
					<view class="avatar-wrapper">
						<image v-if="formData.avatar" :src="formData.avatar" mode="aspectFill" class="avatar-img"></image>
						<uni-icons v-else type="camera" size="30" color="#999"></uni-icons>
					</view>
					<uni-icons type="right" size="18" color="#ccc"></uni-icons>
				</view>
			</view>

			<view class="form-item column">
				<text class="label">出生日期</text>
				<picker mode="date" :value="formData.birthday" @change="onDateChange">
					<view class="input-box">
						<uni-icons type="calendar" size="20" color="#999" class="icon"></uni-icons>
						<text :class="['text', !formData.birthday ? 'placeholder' : '']">
							{{ formData.birthday || '选择日期' }}
						</text>
					</view>
				</picker>
			</view>

			<view class="form-item column">
				<text class="label">就读学校</text>
				<view class="input-box">
					<input class="input" v-model="formData.school" placeholder="请输入" placeholder-class="placeholder" />
				</view>
			</view>

			<view class="form-item column">
				<text class="label">家庭住址</text>
				<view class="input-box">
					<input class="input" v-model="formData.address" placeholder="请输入" placeholder-class="placeholder" />
				</view>
			</view>
		</view>

		<view class="button-wrapper">
			<button class="save-btn" @tap="submitForm">保存</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			formData: {
				avatar: '',
				birthday: '',
				school: '',
				address: ''
			}
		};
	},
	methods: {
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					this.formData.avatar = res.tempFilePaths[0];
				}
			});
		},
		onDateChange(e) {
			this.formData.birthday = e.detail.value;
		},
		submitForm() {
			uni.showLoading({ title: '保存中...' });
			// 模拟请求
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({ title: '保存成功', icon: 'success' });
			}, 1000);
		}
	}
};
</script>

<style lang="scss" scoped src="./index.scss"></style>