<template>
	<view class="content">
		<scroll-view>
			<view class="shopCell" v-bind:key="sIdx" v-for="(shop, sIdx) in shopList">
				<text @click="clickShopAction(shop)">{{shop.name}}</text>
				<text class="modifyText" @click="modifyShop(sIdx)">修改</text>
			</view>
			<view v-if="loginStatus && shopList.length > 0">
				<button class="commonBtn" type="primary" @click="transferPayAction"> 撸卡信息 </button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import Util from '../../common/util.js'
	export default {
		data() {
			return {
				shopList: [],
				loginStatus: false,
				hadLoaded: false
			}
		},
		onLoad(option) {
			this.loading = false
			this._requestAllShops()
			this.shopList = uni.getStorageSync(Util.Constant.StorageKey_ShopList + Util.getUserId())
			uni.$on(Util.Constant.Notice_AddShop, () => {
				this.shopList = []
				this._requestAllShops()
			})
			uni.$on(Util.Constant.Notice_Logout, () => {
				this.shopList = []
				console.log('>>>> logout notice')
			})
		},
		onNavigationBarButtonTap (e) {
			if (!this.verifyLogin()) { return }
			uni.navigateTo({ url: '../AddShop' })
		},
		onShow() {
			this.loginStatus = Util.User.isLogin()
			// if (!this.shopList || this.shopList.length == 0) {
				this._requestAllShops()
			// }
		},
		methods: {
			verifyLogin() {
				if (!Util.isLogin()) {
					uni.showModal({
						title:'提示',
						content: '请您先登录',
						success(res) {
							if (res.confirm) { uni.navigateTo({ url: '../login' }) }
						}
					})
					return false
				}
				return true
			},
			clickShopAction (shop) {
				uni.navigateTo({
					url: '../PayRecode?shopId=' + shop._id + '&title=' + shop.name
				})
			},
			modifyShop (idx) {
				if (this.shopList.length > idx) {
					let shopM = this.shopList[idx]
					let str = 'shopId=' + shopM._id + '&shopName=' + shopM.name + '&mobile=' + shopM.mobile;
					uni.navigateTo({
						url: '../AddShop?' + str
					})
				}
			},
			transferPayAction () {
				if (!this.verifyLogin()) { return }
				uni.navigateTo({
					url: '../TransferPay?type=shop&title=营业记录'
				})
			},
			_requestAllShops () {
				if (Util.User.isLogin()) {
					let userId = Util.getUserId()
					this.userName = Util.User.sharedInstance().name
					if (!this.loading) {
						this.loading = true
						if (!this.hadLoaded) {
							uni.showLoading({
								title: '加载中...'
							})
						}
						Util.get('/money/v1/user/getShopList', {userId: userId}, (err, res) => {
							this.loading = false
							uni.hideLoading()
							if (err) {
								uni.showModal({
									title: '警报',
									content: err.errMsg,
									showCancel:false
								})
								console.error('<err> get shop list err: ', err)
							} else {
								if (res.isSuccess()) {
									this.hadLoaded = true
									console.log('get shop list : ', res.Body)
									this.shopList = res.Body
									uni.setStorageSync(Util.Constant.StorageKey_ShopList + Util.getUserId(), this.shopList)
								} else {
									uni.showModal({
										title: '警报',
										content: res.Header.ErrMsg,
										showCancel:false
									})
									console.log('get shop list err: ', res.Header.ErrMsg)
								}
							} 
						})
					}
				} else {
					// uni.navigateTo({
					// 	url: '../login'
					// })
					this.shopList = []
					console.log('>>>> user has not login')
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
		padding-left: 20upx;
		padding-right: 20upx;
	}
	.shopCell {
		margin-top: 40upx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.commonBtn {
		margin-top: 40upx;
		width: 80%;
		height: 65upx;
		font-size: 28upx;
		justify-content: center;
		align-items: center;
	}
	text {
		font-size: 34upx;
		color: #00f;
	}
	.modifyText {
		font-size: 30upx;
		padding: 10upx 20upx 10upx 20upx;
		border-radius: 10upx;
		border: 1upx #0000FF solid;
		color: #0000FF;
	}
</style>
