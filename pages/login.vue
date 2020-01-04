<template>
	<view class="content">
		<view class="commmonInputContainer">
			<text class="accountText">手机号:</text>
			<input class="mobileInput" @input="onMobileKeyInput"/>
		</view>
		<view class="commmonInputContainer">
			<text class="accountText">密码:</text>
			<input class="mobileInput" password="true" @input="onPasswordKeyInput"/>
		</view>
		<button class="loginBtn" type="primary" @click="loginAction">登录</button>
		<text class="registerText" @click="registerAction">注册</text>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				mobile: '',
				password: ''
			}
		},
		onLoad(option) {
			
		},
		onShow() {
			
		},
		methods: {
			onMobileKeyInput (event) {
				console.log(event.target.value)
				this.mobile = event.target.value
			}, 
			onPasswordKeyInput (event) {
				console.log(event.target.value)
				this.password = event.target.value
			},
			loginAction () {
				if (!this.mobile) {
					uni.showModal({
						title:'提示',
						content: '请输入手机号'
					})
					return 
				}
				if (!this.password) {
					uni.showModal({
						title:'提示',
						content: '请输入密码'
					})
					return 
				}
				Util.get('/money/v1/user/login', {mobile: this.mobile, password: Util.md5(this.password).toLowerCase()}, (err, res) => {
					if (err) {uni.showModal({
								title: '警报',
								content: err.errMsg
							})
						console.error('<err> login err: ', err)
					} else {
						if (res.isSuccess()) {
							console.log('login response : ', res)
							let userId = res.Body._id
							Util.User.setUserId(userId)
							console.log(userId)
							uni.setStorageSync(Util.Constant.StorageKey_UserId, userId)
							console.log(JSON.stringify(res.Body))
							uni.setStorageSync(Util.Constant.StorageKey_UserJson, res.Body)
							Object.assign(Util.User.sharedInstance(), res.Body)
							console.log(Util.User.sharedInstance())
							uni.showToast({
								title:'登录成功',
								duration:2000, 
							})
							setTimeout(function() {
								uni.navigateBack()
							}, 1000);
						} else {
							uni.showModal({
								title: '警报',
								content: res.Header.ErrMsg
							})
							console.error('login err: ', res.Header.ErrMsg)
						}
					}
				})
			},
			registerAction () {
				// 跳转到注册页面
				uni.navigateTo({
					url: 'register'
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-left: 20upx;
		padding-right: 20upx;
	}
	.commmonInputContainer {
		margin-top: 30upx;
		display: flex;
		align-items: center;
	} 
	.accountText {
		font-size: 28upx;
		color: #666;
	}
	.mobileInput {
		margin-left: 20upx;
		border: solid #E0E0E0 1upx;
		border-radius: 8upx;
	}
	.loginBtn {
		margin-top: 40upx;
		width: 80%;
	}
	.registerText {
		font-size: 28upx;
		color: #999;
		padding: 8upx 15upx 8upx 15upx;
		border: solid #E0E0E0 1upx;
		border-radius: 8upx;
		align-self: flex-end;
		margin-right: 50upx;
		margin-top: 40upx;
	}
	input {
		font-size: 28upx;
		color: #333;
	}
</style>
