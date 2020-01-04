<template>
	<view class="content">
		<scroll-view>
			<view class="shopCell" v-bind:key="sIdx" v-for="(shop, sIdx) in shopList">
				<text>{{shop.name}}</text>
				<text>{{shop.mobile}}</text>
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
			}
		},
		onLoad(option) {
			this.loading = false
			this._requestAllShops()
			this.shopList = uni.getStorageSync(Util.Constant.StorageKey_ShopList)
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
			if (!this.shopList || this.shopList.length == 0) {
				this._requestAllShops()
			}
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
			_requestAllShops () {
				if (Util.User.isLogin()) {
					let userId = Util.getUserId()
					this.userName = Util.User.sharedInstance().name
					if (!this.loading) {
						this.loading = true
						uni.showLoading({
							title: '加载中...'
						})
						Util.get('/money/v1/user/getShopList', {userId: userId}, (err, res) => {
							this.loading = false
							uni.hideLoading()
							if (err) {
								uni.showModal({
									title: '警报',
									content: err.errMsg
								})
								console.error('<err> get shop list err: ', err)
							} else {
								if (res.isSuccess()) {
									console.log('get shop list : ', res.Body)
									this.shopList = res.Body
									uni.setStorageSync(Util.Constant.StorageKey_ShopList, this.shopList)
								} else {
									uni.showModal({
										title: '警报',
										content: res.Header.ErrMsg
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
		margin-top: 20upx;
		display: flex;
		justify-content: space-between;
	}
	.commonBtn {
		margin-top: 40upx;
		width: 80%;
	}
	text {
		font-size: 34upx;
		color: #333;
	}
</style>
