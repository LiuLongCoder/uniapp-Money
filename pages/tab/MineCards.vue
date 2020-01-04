<template>
	<view class="content">
		<text v-if="loginStatus">Hello , 尊敬的 {{userName}}</text>
		<scroll-view>
			<view class="cardCell" v-bind:key="cIdx" v-for="(card, cIdx) in cardList">
				<text>{{card.bank}}</text>
				<text v-if="card.cardNumber && card.cardNumber.length > 8">{{card.cardNumber.substring(0, 4) + '****' + card.cardNumber.substr(card.cardNumber.length - 4)}}</text>
				<text> 额度{{card.limit}}</text>
			</view>
			<view v-if="loginStatus && cardList.length > 1">
				<button class="commonBtn spendRecordBtn" type="primary" @click="spendRecordAction"> 查看信用卡记录 </button>
				<button class="commonBtn addPayRecordBtn" type="primary" @click="addPayRecordAction"> 增加消费记录 </button>
				<button class="commonBtn" type="primary" @click="payRecordListAction"> 消费记录 </button>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import Util from '../../common/util.js'
	export default {
		data() {
			return {
				cardList: [],
				loginStatus: false,
				userName: ''
			}
		},
		onNavigationBarButtonTap(e) {
			if (!this.verifyLogin()) { return }
			uni.navigateTo({
				url: '../AddCreditCard'
			})
		},
		onLoad(option) {
			this._requestAllCards()
			this.cardList = uni.getStorageSync(Util.Constant.StorageKey_CardList)
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
			if (!this.cardList || this.cardList.length == 0) {
				this._requestAllCards()
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
			spendRecordAction () {
				uni.navigateTo({
					url: '../SpendRecord'
				})
			},
			addPayRecordAction () {
				if (!this.verifyLogin()) { return }
				uni.navigateTo({ url: '../AddPayRecord' })
			},
			payRecordListAction () {
				if (!this.verifyLogin()) { return }
				uni.navigateTo({ url: '../PayRecode' })
			},
			_requestAllCards () {
				if (Util.User.isLogin()) {
					let userId = Util.getUserId()
					this.userName = Util.User.sharedInstance().name
					if (!this.loading) {
						uni.showLoading({
							title: '加载中...'
						})
						Util.get('/money/v1/user/getCardList', {
							userId: userId
						}, (err, res) => {
							this.loading = false
							uni.hideLoading()
							if (err) {
								uni.showModal({
									title: '警报',
									content: err.errMsg
								})
								console.error('<err> get card list err: ', err)
							} else {
								if (res.isSuccess()) {
									console.log('get card list : ', res.Body)
									this.cardList = res.Body
									uni.setStorageSync(Util.Constant.StorageKey_CardList, this.cardList)
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
			_requestCardsInfo () {
				if (Util.isLogin()) {
					let userId = Util.getUserId()
					Util.get('/money/v1/user/getCardInfo', {userId: userId, cardIds:'5e00c8c72f8fe9353cd60852,5e00c8c72f8fe9353cd60854'}, (err, res) => {
						console.log('get cards Info: ', res.Body)
					})
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
	.cardCell {
		display: flex;
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
		font-size: 30upx;
		color: #666;
	}
</style>
