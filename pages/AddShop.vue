<template>
	<view class="content">
		<view class="inline commmonInputContainer">
			<text class="labelText">门店名：</text>
			<input class="" placeholder="请输入门店名称" @input="onShopNameKeyInput" :value="shopName" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">手机号：</text>
			<input class="" placeholder="请输入绑定的手机号" type="number" @input="onMobileKeyInput" :value="mobile" />
		</view>
		<block v-if="shopQRCodeImageSrc">
			<image :src="shopQRCodeImageSrc" class="qrcodeimage" mode="widthFix"></image>
		</block>
		<!-- #ifdef APP-PLUS -->
		<block v-if="shopQRCodeImageSrc">
			<text class="chooseImgText" type="default" @click="chooseImage">更换付款二维码</text>
		</block>
		<block v-else>
			<text class="chooseImgText" type="default" @click="chooseImage">+ 付款二维码</text>
		</block>
		<!-- #endif -->
		<block v-if="shopId">
			<button class="addShopBtn" type="primary" @click="addShopAction"> 修改 </button>
		</block>
		<block v-else>
			<button class="addShopBtn" type="primary" @click="addShopAction"> 添加 </button>
		</block>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				shopId:undefined,
				shopName:'',
				mobile: '',
				shopQRCodeImageSrc: undefined
			}
		},
		onLoad(option) {
			if (option.shopId) {
				this.shopId = option.shopId
				this.mobile = option.mobile
				this.shopName = option.shopName
				uni.setNavigationBarTitle({title:this.shopName})
				this.requestShopData()
			} else {
				this.mobile = Util.User.sharedInstance().mobile
			}
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
			requestShopData () {
				if (this.shopId) {
					Util.get('/money/v1/user/getShop', {shopId: this.shopId}, (err, res) => {
						if (res && res.isSuccess) {
							let shopM = res.Body
							this.shopName = shopM.name
							this.mobile = shopM.mobile
							this.shopQRCodeImageSrc = shopM.shopQRCodeImageSrc
							console.log('>>> get shop: ', shopM)
						}
					})
				}
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: (res) => {
						console.log('chooseImage success, temp path is', res.tempFilePaths[0])
						let imageSrc = res.tempFilePaths[0]
						this.shopQRCodeImageSrc = imageSrc
					},
					fail: (err) => {
						console.log('chooseImage fail', err)
						// #ifdef MP
						uni.getSetting({
							success: (res) => {
								let authStatus = res.authSetting['scope.album'];
								if (!authStatus) {
									uni.showModal({
										title: '授权失败',
										content: 'Hello uni-app需要从您的相册获取图片，请在设置界面打开相关权限',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting()
											}
										}
									})
								}
							}
						})
						// #endif
					}
				})
			},
			requestAddShopAction () {
				if (!Util.isLogin()) {
					uni.showModal({
						content:'请登录',
						showCancel:false
					})
					return
				}
				if (!this.shopName) {
					uni.showModal({
						title: '提示',
						content: '请输入门店名称',
						showCancel:false
					})
					return
				}
				if (!this.mobile) {
					uni.showModal({
						title:'提示',
						content: '请输入所绑定的手机号',
						showCancel:false
					})
					return
				}
				let userName = Util.User.sharedInstance().name
				let userId = Util.getUserId()
				let addShopJson = { user: userId, name: this.shopName, mobile: this.mobile, owner: userName }
				if (this.shopId) {
					addShopJson.shopId = this.shopId
				}
				console.log('>>> src', this.shopQRCodeImageSrc)
				addShopJson.shopQRCodeImageSrc = this.shopQRCodeImageSrc ? this.shopQRCodeImageSrc : ''
				console.log('addshopjson: ', addShopJson)
				Util.post('/money/v1/user/addShop', addShopJson, (err, res) => {
					if (err) {
						uni.showModal({
							title: '警报',
							content: err.errMsg,
							showCancel:false
						})
						console.log('<error> add shop err:', err);
					} else {
						if (res.isSuccess()) {
							if (this.shopId) {
								let operation = this.shopId ? '修改' : '添加'
								uni.$emit(Util.Constant.Notice_AddShop)
								uni.showModal({
									title: '提示',
									content: `${operation}《${this.shopName}》成功`,
									showCancel: false,
									cancelText: '取消',
									confirmText: '修改成功',
									success: res => {
										uni.navigateBack();
									}
								});
							} else {
								let operation = this.shopId ? '修改' : '添加'
								uni.$emit(Util.Constant.Notice_AddShop)
								uni.showModal({
									title: '提示',
									content: `${operation}《${this.shopName}》成功`,
									showCancel: true,
									cancelText: '取消',
									confirmText: '继续添加',
									success: res => {
										if (res.confirm) {
											this.shopName = ''
											this.shopQRCodeImageSrc = ''
										} else if (res.cancel) {
											uni.navigateBack();
										}
									}
								});
							}
						} else {
							uni.showModal({
								title: '警报',
								content: res.Header.ErrMsg,
								showCancel:false
							})
							console.log('<err> add shop err', res.Header.ErrMsg)
						}
					}
				})
			},
			addShopAction () {
				if (this.shopQRCodeImageSrc && this.shopQRCodeImageSrc.indexOf('http') === -1) {
					uni.uploadFile({
						url: Util.Constant.serverHost + '/money/v1/file/upload',
						filePath: this.shopQRCodeImageSrc,
						fileType: 'image',
						name: 'file',
						formData: {'type':'shopImage'},
						success: (res) => {
							let response = JSON.parse(res.data)
							console.log(response.Header.ErrCode === 0)
							if (response.Header.ErrCode === 0) {
								console.log('uploadImage success, res is:', res)
								uni.showToast({
									title: '上传图片成功',
									icon: 'success',
									duration: 1000
								})
								this.shopQRCodeImageSrc = response.Body.imgUrl
								this.requestAddShopAction()
							} else {
								console.log('uploadImage fail', '失败');
								uni.showModal({
									content: '上传文件失败',
									showCancel: false
									
								});
							}
						},
						fail: (err) => {
							console.log('uploadImage fail', err);
							uni.showModal({
								content: err.errMsg,
								showCancel: false
							});
						}
					});
				} else {
					this.requestAddShopAction()
				}
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
	.chooseImgText {
		margin-top: 40upx;
		margin-bottom: 30upx;
		font-size: 30upx;
		padding: 10upx 20upx 10upx 20upx;
		border-radius: 10upx;
		border: 1upx #0000FF solid;
		color: #0000FF;
	}
	.qrcodeimage {
		margin-top: 30upx;
		margin-bottom: 30upx;
	}
</style>
