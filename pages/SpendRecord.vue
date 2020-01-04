<template>
	<view class="content">
		<scroll-view v-if="cardRecord">
			<view class="simpleInfo">
				<view class="inline">
					<text>行用卡刷卡总额：</text><text>{{cardRecord.totalMoney}}元</text>
				</view>
				<view class="inline">
					<text>需要还款：</text><text>{{cardRecord.totalRepaymentMoney}}元</text>
				</view>
				<view class="inline">
					<text>等待还款：</text><text>{{cardRecord.totalWaitRepaymentMoney}}元</text>
				</view>
			</view>
			<view class="cardView" v-bind:key="cIdx" v-for="(cardItem, cIdx) in cardList">
				<view>
					<text>银行：</text><text>{{cardItem.bank}}</text>
					<text v-if="cardItem.cardNumber && cardItem.cardNumber.length > 8">{{cardItem.cardNumber.substring(0, 4) + '****' + cardItem.cardNumber.substr(cardItem.cardNumber.length - 4)}}</text>
				</view>
				<view class="cell">
					<view class="inline">
						<text>额度：</text><text>{{cardItem.limit}}元</text>
					</view>
					<view class="inline">
						<text>已用：</text><text>{{cardItem.willRepaymentMoney + cardItem.waitRepaymentMoney}}元</text>
					</view>
					<view class="inline">
						<text>占比：</text><text>{{percentFormat((cardItem.willRepaymentMoney + cardItem.waitRepaymentMoney)/cardItem.limit)}}</text>
					</view>
				</view>
				<view class="cell">
					<text>账单日：</text><text>{{cardItem.billDate}}</text><text>还款日：</text><text>{{cardItem.repaymentDate}}</text>
				</view>
				<view class="cell repayView" v-if="cardItem.durationCurrentRepayment >= 0 && cardItem.willRepaymentMoney > 0">
					<text class="redText">{{cardItem.durationCurrentRepayment}}天之内</text>
					<text class="redText">需要还款：</text><text>{{cardItem.willRepaymentMoney}}</text>
				</view>
				<view class="cell willRepayView" v-if="cardItem.waitRepaymentMoney > 0">
					<text class="greenText">{{cardItem.durationNextBill}}天后会出新账单</text>
					<text class="greenText">{{cardItem.waitRepaymentMoney}}元</text>
					<text class="greenText">{{cardItem.durationNextRepayment}}天内需要还款</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				cardRecord: undefined,
				cardList: [],
				loginStatus: false,
				cardId: undefined
			}
		},
		onNavigationBarButtonTap(e) {
			
		},
		onLoad(option) {
			this.cardId = option.cardId
			this.loading = false
			uni.$on(Util.Constant.Notice_Logout, () => {
			})
		},
		onShow() {
			// this._requestPayRecords()
			this.loginStatus = Util.isLogin()
			this._requestCardsInfo()
		},
		methods: {
			percentFormat(num) {
				let strFormt = num.toFixed(3) * 100 + ''
				if (strFormt.length > 4) {
					strFormt = strFormt.substring(0, 4)
				}
				return strFormt += '%'
			},
			_requestCardsInfo () {
				if (Util.isLogin()) {
					let userId = Util.getUserId()
					let getCardInfoParam = {userId: userId}
					if (this.cardId) {
						getCardInfoParam['cardIds'] = [this.cardId]
					}
					Util.get('/money/v1/user/getCardInfo', getCardInfoParam, (err, res) => {
						if (err) {
							
						} else {
							if (res.isSuccess()) {
								this.cardRecord = res.Body
								this.cardList = this.cardRecord.list
							} else {
								
							}
						}
						console.log('get cards Info: ', res.Body)
					})
				}
			},
			_requestPayRecords () {
				let userId = Util.getUserId()
				Util.get('/money/v1/user/getPayRecordList', {userId: userId}, (err, res) => {
					if (res && res.isSuccess) {
						// console.log('get pay records: ', res)
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
		padding-left: 20upx;
		padding-right: 20upx;
	}
	.block {
		display: block;
	}
	.cardView {
		margin-top: 20upx;
	}
	.cell {
		display: flex;
		justify-content: flex-start;
	}
	.inline {
		display: flex;
		align-items: center;
		align-content: center;
	}
	text {
		font-size: 24upx;
		color: #666;
		margin-left: 10upx;
	}
	.repayView{
		color: #f00;
	}
	.willRepayView {
		color: #ff0;
	}
	.greenText {
		color: #00a023;
	}
	.redText {
		color: #a00023;
	}
</style>
