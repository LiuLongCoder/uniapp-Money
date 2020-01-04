<template>
	<view class="content">
		<view class="inline oriPwdView commmonInputContainer">
			<text class="labelText">原密码：</text>
			<input class="oriPwdInput" placeholder="请输入原密码" @input="oriPwdKeyInput" :value="oriPwd" />
		</view>
		<view class="inline pwdView commmonInputContainer">
			<text class="labelText">新密码：</text>
			<input class="pwdInput" placeholder="请输入新密码" @input="onPwdKeyInput" :value="pwd" />
		</view>
		<view class="inline confirmPwdView commmonInputContainer">
			<text class="labelText">确认密码：</text>
			<input class="confirmPwdInput" placeholder="请确认密码" @input="onConfirmPwdKeyInput" :value="confirmPwd" />
		</view>
		<button class="modifyBtn" type="primary" @click="registerAction"> 修改 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				oriPwd: '',
				pwd: '',
				confirmPwd: ''
			}
		},
		onLoad(option) {
			
		},
		onShow() {
			
		},
		methods: {
			oriPwdKeyInput (event) {
				this.oriPwd = event.target.value
			},
			onPwdKeyInput (event) {
				this.pwd = event.target.value
			},
			onConfirmPwdKeyInput (event) {
				this.confirmPwd = event.target.value
			},
			registerAction () {
				if (!this.oriPwd) {
					uni.showModal({
						title:'提示',
						content:'请输入原密码'
					})
					return
				}
				if (!this.pwd) {
					uni.showModal({
						title:'提示',
						content:'请输入新密码'
					})
					return
				}
				if (!this.confirmPwd) {
					uni.showModal({
						title:'提示',
						content:'请确认新密码'
					})
					return
				}
				if (this.pwd !== this.confirmPwd) {
					uni.showModal({
						title:'提示',
						content:'两次输入的密码不一致'
					})
					return
				}
				let userId = Util.getUserId()
				Util.post('/money/v1/user/modifyPwd', {userId: userId, password: Util.md5(this.pwd).toLowerCase()}, (err, res) => {
					if (err) {
						uni.showModal({
							title: '警报',
							content: err.errMsg
						})
						console.error('<err> modify pwd err: ', err)
					} else {
						if (res.isSuccess()) {
							console.log('modify pwd success: ', res.Body)
							uni.showToast({
								title:'修改密码成功'
							})
							setTimeout(function() {
								uni.navigateBack()
							}, 1000);
						} else {
							uni.showModal({
								title:'修改密码失败',
								content:res.Header.ErrMsg
							})
						}
					}
				})
				console.log(`oriPwd: ${this.oriPwd}, pwd: ${this.pwd}, confirmPwd: ${this.confirmPwd}`)
			}, 
			
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 40upx;
		padding-left: 20upx;
		padding-right: 20upx;
	}
	.inline {
		display: flex;
		align-items: center;
		align-content: center;
	}
	.commmonInputContainer {
		margin-top: 30upx;
	}
	.labelText {
		font-size: 28upx;
		color: #666;
		margin-right: 20upx;
	}
	input {
		font-size: 28upx;
		color: #333;
		border: solid #E0E0E0 1upx;
		border-radius: 8upx;
	}
	.modifyBtn {
		width: 80%;
		margin-top: 40upx;
	}
</style>
