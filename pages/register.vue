<template>
	<view class="content">
		<view class="inline nameView commmonInputContainer">
			<text class="labelText">姓名：</text>
			<input class="nameInput" placeholder="请输入名字" @input="onNameKeyInput" :value="name" />
		</view>
		<view class="inline IDCardView commmonInputContainer">
			<text class="labelText">身份证号：</text>
			<input class="IDCardInput" placeholder="请输入身份证号" @input="onIDCardKeyInput" :value="IDCard" />
		</view>
		<view class="inline mobileView commmonInputContainer">
			<text class="labelText">联系电话：</text>
			<input class="mobileInput" placeholder="请输入手机号码" @input="onMobileKeyInput" :value="mobile" />
		</view>
		<view class="inline passwordView commmonInputContainer">
			<text class="labelText">密码：</text>
			<input class="passwordInput" password="true" placeholder="请输入密码" @input="onPasswordKeyInput" :value="password" />
		</view>
		<button class="registerBtn" type="primary" @click="registerAction"> 注册 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				name: '',
				mobile: '',
				IDCard: '',
				password: ''
			}
		},
		onLoad(option) {
			
		},
		onShow() {
			
		},
		methods: {
			onNameKeyInput (event) {
				this.name = event.target.value
			},
			onIDCardKeyInput (event) {
				this.IDCard = event.target.value
			},
			onMobileKeyInput (event) {
				this.mobile = event.target.value
			},
			onPasswordKeyInput (event) {
				this.password = event.target.value
			},
			registerAction () {
				console.log(`name: ${this.name}, IDCard: ${this.IDCard}, mobile: ${this.mobile}, password: ${this.password}`)
				if (!this.name) {
					uni.showModal({
						title: '提示',
						content: '请输入姓名'
					})
					return
				}
				if (!this.IDCard) {+
					uni.showModal({
						title:'提示',
						content: '请输入身份证号码'
					})
					return
				}
				if (!this.mobile) {
					uni.showModal({
						title:'提示',
						content: '请输入手机号码'
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
				let registerJson = {name: this.name, mobile: this.mobile, IDCard: this.IDCard, password: Util.md5(this.password).toLowerCase()}
				Util.post('/money/v1/user/register', registerJson, (err, res) => {
					if (err) {
						console.error('<err> register user err: ', err)
					} else {
						if (res.isSuccess()) {
							uni.showModal({
								title:'提示',
								content:'注册成功，去登录',
								success(res) {
									if (res.confirm) {
										uni.navigateBack()
									} else if (res.cancel) {
										uni.navigateBack({
											delta:5
										})
										console.log('用户点击取消');
									}
								}
							})
							console.log('register user:', res.Body)
						} else {
							uni.showModal({
								title: '提示',
								content: res.Header.ErrMsg,
								success(res) {
									
								}
							})
							console.error('<err> register user err: ', res.Header.ErrMsg)
						}
					}
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
	.registerBtn {
		width: 80%;
		margin-top: 40upx;
	}
</style>
