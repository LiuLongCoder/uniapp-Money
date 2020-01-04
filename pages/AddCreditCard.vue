<template>
	<view class="content">
		<view class="inline commmonInputContainer">
			<text class="labelText">卡号：</text>
			<input class="" placeholder="请输入卡号" @input="onCardNumberKeyInput" :value="cardNumber" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">银行：</text>
			<input class="" placeholder="请输入银行" @input="onBankKeyInput" :value="bank" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">手机号：</text>
			<input class="" placeholder="请输入预留手机号(选填)" @input="onMobileKeyInput" :value="mobile" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">额度：</text>
			<input class="" placeholder="请输入额度(元)" @input="onLimitKeyInput" :value="limit" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">账单日：</text>
			<input class="" placeholder="请输入账单日1-31" @input="onBillDayKeyInput" :value="billDayStr" />
		</view>
		<view class="inline commmonInputContainer">
			<text class="labelText">还款日：</text>
			<input class="" placeholder="请输入还款日1-31" @input="onRepaymentDayKeyInput" :value="repaymentDayStr" />
		</view>
		<button class="addCardBtn" type="primary" @click="addCardAction"> 添加 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				cardNumber: '',
				bank: '',
				mobile: '',
				limit: '',
				billDayStr: '',
				repaymentDayStr: ''
			}
		},
		onLoad(option) {
			
		},
		onShow() {
			// this.loginStatus = Util.User.isLogin()
		},
		methods: {
			onCardNumberKeyInput (event) { this.cardNumber = event.target.value },
			onBankKeyInput (event) { this.bank = event.target.value },
			onMobileKeyInput (event) { this.mobile = event.target.value },
			onLimitKeyInput (event) { this.limit = event.target.value },
			onBillDayKeyInput (event) { this.billDayStr = event.target.value },
			onRepaymentDayKeyInput (event) { this.repaymentDayStr = event.target.value },
			addCardAction () {
				if (!this.cardNumber) {
					uni.showModal({
						title: '提示',
						content: '请输入卡号'
					})
					return
				}
				if (!this.bank) {+
					uni.showModal({
						title:'提示',
						content: '请输入所属银行'
					})
					return
				}
				// need to do 设置数字键盘
				if (!this.limit) {
					uni.showModal({
						title:'提示',
						content: '请输入额度'
					})
					return
				}
				if (!this.billDayStr) {
					uni.showModal({
						title:'提示',
						content: '请输入账单日'
					})
					return
				}
				if (!this.repaymentDayStr) {
					uni.showModal({
						title:'提示',
						content: '请输入还款日'
					})
					return
				}
				let userId = Util.getUserId()
				let addCardJson = {userId: userId, cardNumber: this.cardNumber, bank: this.bank, mobile: this.mobile, limit: parseInt(this.limit), billDayStr: this.billDayStr, repaymentDayStr: this.repaymentDayStr}
				Util.post('/money/v1/user/addCreditCard', addCardJson, (err, res) => {
					if (error) {
						uni.showModal({
							title: '警报',
							content: err
						})
						console.error('<err> modify user err: ', err)
					} else {
						if (res.isSuccess()) {
							uni.$emit(Util.Constant.Notice_AddCreditCard)
							uni.showModal({
								title:'提示',
								content:'添加成功',
								confirmText:"继续添加",
								success(res) {
									if (res.confirm) {
										this.cardNumber = ''
										this.bank = ''
										this.mobile = ''
										this.limit = ''
										this.billDayStr = ''
										this.repaymentDayStr = ''
									} else if (res.cancel) {
										uni.navigateBack()
									}
								}
							})
							console.log('add credit card: ', res.Body)
						} else {
							uni.showModal({
								title: '警报',
								content: res.Header.ErrMsg
							})
							console.error('<err> add credit err: ', res.Header.ErrMsg)
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
	.addCardBtn {
		width: 80%;
		margin-top: 40upx;
	}
</style>
