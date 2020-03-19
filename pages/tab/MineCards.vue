<template>
	<view class="content">
		<view class="content" v-if="loginStatus">
			<text class="topText">Hello , 尊敬的 {{userName}}</text>
			<scroll-view class="scrollView">
				<view class="cardCell" v-bind:key="cIdx" v-for="(card, cIdx) in cardList" @click="tapCardAction(card)">
					<text>{{card.bank}}</text>
					<text>{{card.cardNumber}}</text>
					<!-- <text> 额度{{card.limit}}</text> -->
				</view>
				<view v-if="loginStatus && cardList.length > 0">
					<button class="commonBtn addPayRecordBtn" type="primary" @click="addPayRecordAction"> 增加消费记录 </button>
					<button class="commonBtn" type="primary" @click="transferPayAction"> 撸卡信息 </button>
					<button class="commonBtn" type="primary" @click="payRecordListAction"> 消费记录 </button>
					<button class="commonBtn spendRecordBtn" type="primary" @click="spendRecordAction"> 查看信用卡信息 </button>
				</view>
			</scroll-view>
		</view>
		<view v-else>
			<button class="commonBtn" type="primary" @click="loginAction"> 登录 </button>
		</view>
	</view>
</template>

<script>
	import Util from '../../common/util.js'
	export default {
		data() {
			return {
				cardList: [],
				loginStatus: false,
				userName: '',
				hadLoaded: false
			}
		},
		onNavigationBarButtonTap(e) {
			if (!this.verifyLogin()) {
				return
			}
			uni.navigateTo({
				url: '../AddCreditCard'
			})
		},
		onLoad(option) {
			this._requestAllCards()
			this.cardList = uni.getStorageSync(Util.Constant.StorageKey_CardList + Util.getUserId())
			this.loading = false
			uni.$on(Util.Constant.Notice_Logout, () => {
				this.cardList = []
				console.log('>>>> logout notice');
			})
			uni.$on(Util.Constant.Notice_AddCreditCard, () => {
				this.cardList = []
				this._requestAllCards()
			})
		},
		onShow() {
			this.loginStatus = Util.User.isLogin()
			// if (!this.cardList || this.cardList.length == 0) {
				this._requestAllCards()
			// }
			// this._requestIncome()
		},
		methods: {
			verifyLogin() {
				if (!Util.isLogin()) {
					uni.showModal({
						title: '提示',
						content: '请您先登录',
						success(res) {
							if (res.confirm) {
								uni.navigateTo({
									url: '../login'
								})
							}
						}
					})
					return false
				}
				return true
			},
			loginAction() {
				uni.navigateTo({
					url: '../login'
				})
			},
			spendRecordAction() {
				uni.navigateTo({
					url: '../SpendRecord'
				})
			},
			addPayRecordAction() {
				if (!this.verifyLogin()) {
					return
				}
				uni.navigateTo({
					url: '../AddPayRecord'
				})
			},
			payRecordListAction() {
				if (!this.verifyLogin()) {
					return
				}
				uni.navigateTo({
					url: '../PayRecode'
				})
			},
			transferPayAction() {
				if (!this.verifyLogin()) {
					return
				}
				uni.navigateTo({
					url: '../TransferPay?type=user&title=刷卡记录'
				})
			},
			tapCardAction (card) {
				if (!this.verifyLogin()) {
					return
				}
				uni.navigateTo({
					url: `../PayRecode?cardId=${card._id}&title=${card.bank + card.cardNumber}`
				})
			},
			_requestAllCards() {
				if (Util.User.isLogin()) {
					let userId = Util.getUserId()
					this.userName = Util.User.sharedInstance().name
					if (!this.loading) {
						if (!this.hadLoaded) {
							uni.showLoading({
								title: '加载中...'
							})
						}
						Util.get('/money/v1/user/getCardList', {
							userId: userId
						}, (err, res) => {
							this.loading = false
							uni.hideLoading()
							if (err) {
								uni.showModal({
									title: '警报',
									content: err.errMsg,
									showCancel: false
								})
								console.error('<err> get card list err: ', err)
							} else {
								if (res.isSuccess()) {
									this.hadLoaded = true
									console.log('get card list : ', res.Body)
									this.cardList = res.Body
									uni.setStorageSync(Util.Constant.StorageKey_CardList + Util.getUserId(), this.cardList)
								} else {
									uni.showModal({
										title: '警报',
										content: res.Header.ErrMsg
									})
									console.log('get card list err: ', res.Header.ErrMsg)
								}
							}
						})
					}
				} else {
					console.log('>>>> user has not login')
				}
			},
			_requestCardsInfo() {
				if (Util.isLogin()) {
					let userId = Util.getUserId()
					Util.get('/money/v1/user/getCardInfo', {
						userId: userId,
						cardIds: '5e00c8c72f8fe9353cd60852,5e00c8c72f8fe9353cd60854'
					}, (err, res) => {
						console.log('get cards Info: ', res.Body)
					})
				}

			},
			_requestIncome() {
				Util.get('/money/v1/pay/getIncome', {
					type: 'user'
				}, (err, res) => {
					console.log('get income : ', res)
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
	.scrollView {
		width: 660upx;
		justify-content: space-between;
	}
	.topText {
		display: flex;
		justify-content: center;
		text-align: center;
		font-size: 30upx;
	}

	.cardCell {
		display: flex;
		justify-content: space-between;
	}

	.commonBtn {
		margin-top: 40upx;
		width: 500upx;
		height: 65upx;
		font-size: 28upx;
		justify-content: center;
		align-items: center;
	}

	text {
		font-size: 34upx;
		color: #00f;
		margin-top: 20upx;
	}
</style>
