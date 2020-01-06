<template>
	<view class="content">
		<view class="inline nameView commmonInputContainer">
			<text class="labelText">姓名：</text>
			<input class="nameInput" placeholder="请输入名字" @input="onNameKeyInput" :value="name" />
		</view>
		<view class="inline IDCardView commmonInputContainer">
			<text class="labelText">身份证号：</text>
			<input class="IDCardInput" type="idcard" placeholder="请输入身份证号" @input="onIDCardKeyInput" :value="IDCard" />
		</view>
		<view class="inline mobileView commmonInputContainer">
			<text class="labelText">联系电话：</text>
			<input class="mobileInput" type="number" placeholder="请输入手机号码" @input="onMobileKeyInput" :value="mobile" />
		</view>
		<button class="modifyBtn" type="primary" @click="modifyInfoAction"> 修改 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				name: '',
				mobile: '',
				IDCard: ''
			}
		},
		onLoad(option) {
			let user = Util.User.sharedInstance()
			this.name = user.name
			this.mobile = user.mobile
			this.IDCard = user.IDCard
		},
		onShow() {
			// this.loginStatus = Util.User.isLogin()
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
			modifyInfoAction () {
				if (!this.name) {
					uni.showModal({
						title: '提示',
						content: '请输入姓名',
						showCancel:false
					})
					return
				}
				if (!this.IDCard) {+
					uni.showModal({
						title:'提示',
						content: '请输入身份证号码',
						showCancel:false
					})
					return
				}
				if (!this.mobile) {
					uni.showModal({
						title:'提示',
						content: '请输入手机号码',
						showCancel:false
					})
					return
				}
				let userId = Util.getUserId()
				let modifyInfoJson = {userId: userId, name: this.name, mobile: this.mobile, IDCard: this.IDCard}
				Util.post('/money/v1/user/modifyInfo', modifyInfoJson, (err, res) => {
					if (err) {
						uni.showModal({
							title: '警报',
							content: err.errMsg,
							showCancel:false
						})
						console.error('<err> modify user err: ', err)
					} else {
						if (res.isSuccess()) {
							uni.$emit(Util.Constant.Notice_UpdateUserInfo)
							uni.showModal({
								title:'提示',
								content:'修改成功',
								success(res) {
									if (res.confirm) {
										uni.navigateBack()
									} else if (res.cancel) {
										uni.navigateBack()
									}
								}
							})
							console.log('modify user:', res.Body)
						} else {
							uni.showModal({
								title: '提示',
								content: res.Header.ErrMsg,
								showCancel:false
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
	.modifyBtn {
		width: 80%;
		margin-top: 40upx;
	}
</style>
