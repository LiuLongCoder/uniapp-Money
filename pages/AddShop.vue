<template>
	<view class="content">
		<view class="inline commmonInputContainer">
			<text class="labelText">门店名：</text>
			<input class="" placeholder="请输入门店名称" @input="onShopNameKeyInput" :value="shopName" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">手机号：</text>
			<input class="" placeholder="请输入绑定的手机号" @input="onMobileKeyInput" :value="mobile" />
		</view>
		<button class="addShopBtn" type="primary" @click="addShopAction"> 添加 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				shopName: '',
				mobile: ''
			}
		},
		onLoad(option) {
			this.mobile = Util.User.sharedInstance().mobile
		},
		onShow() {
			
		},
		methods: {
			onShopNameKeyInput(event) {
				this.shopName = event.target.value
			},
			onMobileKeyInput (event) {
				this.mobile = event.target.value
			},
			addShopAction () {
				if (!this.shopName) {
					uni.showModal({
						title: '提示',
						content: '请输入门店名称'
					})
					return
				}
				if (!this.mobile) {
					uni.showModal({
						title:'提示',
						content: '请输入所绑定的手机号'
					})
					return
				}
				let userName = Util.User.sharedInstance().name
				let userId = Util.getUserId()
				let addShopJson = { user: userId, name: this.shopName, mobile: this.mobile, owner: userName }
				Util.post('/money/v1/user/addShop', addShopJson, (err, res) => {
					if (err) {
						uni.showModal({
							title: '警报',
							content: err.errMsg,
						})
						console.log('<error> add shop err:', err);
					} else {
						if (res.isSuccess()) {
							uni.$emit(Util.Constant.Notice_AddShop)
							uni.showModal({
								title: '提示',
								content: `添加《${this.shopName}》成功`,
								showCancel: true,
								cancelText: '取消',
								confirmText: '继续添加',
								success: res => {
									if (res.confirm) {
										this.shopName = ''
									} else if (res.cancel) {
										uni.navigateBack();
									}
								}
							});
						} else {
							uni.showModal({
								title: '警报',
								content: res.Header.ErrMsg,
							})
							console.log('<err> add shop err', res.Header.ErrMsg)
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
	.addShopBtn {
		width: 80%;
		margin-top: 40upx;
	}
</style>
