<template>
	<view class="content">
		<view class="cell inline">
			<text>选择门店：</text>
			<picker class="cardPiker" mode="multiSelector" @columnchange="bindShopPickerChange" :value="shopIndexArray" :range="allShopArrayDataSource" range-key="name">
				<text class="pickerText">{{allShopArrayDataSource[1][shopIndexArray[1]].name}}</text>
			</picker>
		</view>
		<block v-if="shopQRCodeImageSrc">
			<image :src="shopQRCodeImageSrc" class="qrcodeimage" mode="widthFix"></image>
		</block>
		<view class="cell inline">
			<text>选择银行卡：</text>
			<picker class="cardPiker" @change="bindCardPickerChange" :value="cardIndex" :range="cardArray" range-key="name">
				<text class="pickerText">{{cardArray[cardIndex].name}}</text>
			</picker>
		</view>
		<view class="cell inline">
			<text>支付途径：</text>
			<picker class="cardPiker" @change="bindPayWayPickerChange" :value="payWayIndex" :range="payWayArray" range-key="name">
				<text class="pickerText">{{payWayArray[payWayIndex].name}}</text>
			</picker>
		</view>
		<view class="cell inline">
			<text>刷卡时间：</text>
			<picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
				<text class="pickerText">{{date}}</text>
			</picker>
			<picker mode="time" :value="time" start="09:01" end="21:01" @change="bindTimeChange">
				<text class="pickerText">{{time}}</text>
			</picker>
		</view>
		<view class="cell inline">
			<text>价格(元):</text>
			<input class="" type="digit" placeholder="输入刷卡价格" @input="onPriceKeyInput" :value="price" />
		</view>
		<button class="addPayRecordBtn commonBtn" type="primary" @click="addPayRecordAction"> 添加记录 </button>
	</view>
</template>

<script>
	import Util from '../common/util.js'
	
	function getDate(type) {
		let date = new Date();
		if (type === 'yestoday') {
			date = new Date(date.getTime() - 60 * 60 * 24 * 1000)
		}

		let year = date.getFullYear()
		let month = date.getMonth() + 1
		let day = date.getDate()
	
		if (type === 'start') {
			year = year - 1
		}
		month = month > 9 ? month : '0' + month
		day = day > 9 ? day : '0' + day
	
		return `${year}-${month}-${day}`
	}
	
	export default {
		data() {
			return {
				shopName: '',
				mobile: '',
				cardArray: [],
				cardIndex: 0,
				allShopArrayDataSource: [[],[]],
				allShopArray: [],
				shopIndexArray:[0, 0],
				price: '',
				date: getDate({
					format: true
				}),
				time:'12:01',
				startDate:getDate('start'),
				endDate:getDate('end'),
				payWayArray: [],
				payWayIndex: 0,
				shopQRCodeImageSrc: undefined
			}
		},
		onLoad(option) {
			this.cardArray = uni.getStorageSync(Util.Constant.StorageKey_CardList + Util.getUserId())
			this.allShopArray = uni.getStorageSync(Util.Constant.StorageKey_AllShopList + Util.getUserId())
			this.payWayArray = uni.getStorageSync(Util.Constant.StorageKey_PayWayList + Util.getUserId())
			this._requestAllShopList()
			this._requestPayWayList()
			let nowDate = new Date()
			this.time = nowDate.getHours() + ':' + nowDate.getMinutes()
			for (let key in this.cardArray) {
				let card = this.cardArray[key]
				if (card.cardNumber && card.cardNumber.length > 8) {
					card.name = card.bank + card.cardNumber.substring(0, 4) + '****' + card.cardNumber.substr(card.cardNumber.length - 4)
				} else {
					card.name = card.bank + card.cardNumber
				}
			}
			if (this.allShopArray.length > 0) {
				this.allShopArrayDataSource[0] = this.allShopArray
				if (this.allShopArray.length > this.shopIndexArray[0]) {
					this.allShopArrayDataSource[1] = this.allShopArray[this.shopIndexArray[0]].shopList
				}
			}
			this.refreshQRCodeImg()
		},
		onShow() {
			if (!this.allShopArray || this.allShopArray.length == 0) {
				this._requestAllShopList()
			}
		},
		methods: {
			refreshQRCodeImg () {
				if (this.allShopArrayDataSource[1].length > this.shopIndexArray[1]) {
					this.shopQRCodeImageSrc = this.allShopArrayDataSource[1][this.shopIndexArray[1]].shopQRCodeImageSrc
				} else {
					this.shopQRCodeImageSrc = undefined
				}
				if (!this.shopQRCodeImageSrc) {
					this.shopQRCodeImageSrc = ''
				}
				// console.log('>>>> refreshqrcode : ', this.shopQRCodeImageSrc)
			},
			onShopNameKeyInput(event) {
				this.shopName = event.target.value
			},
			onMobileKeyInput (event) {
				this.mobile = event.target.value
			},
			onPriceKeyInput (event) {
				this.price = event.target.value
			},
			bindCardPickerChange (e) {
				console.log('picker发送选择改变，携带值为：' + e.target.value)
				this.cardIndex = e.target.value
			},
			bindPayWayPickerChange (e) {
				console.log('picker发送选择改变，携带值为：' + e.target.value)
				this.payWayIndex = e.target.value
			},
			bindDateChange (e) {
				this.date = e.target.value
			},
			bindTimeChange: function(e) {
				this.time = e.target.value
			},
			bindShopPickerChange (e) {
				let column = e.detail.column
				let value = e.detail.value
				console.log('修改的列为：' + e.detail.column + '，值为：' + e.detail.value)
				console.log('picker发送选择改变，携带值为：' + e.target.value)
				if (column === 0) {
					if (this.allShopArray.length > value) {
						this.allShopArrayDataSource[1] = this.allShopArray[value].shopList
						this.shopIndexArray[1] = 0
					}
				}
				this.shopIndexArray[column] = value
				this.refreshQRCodeImg()
				this.$forceUpdate()
				console.log(this.shopIndexArray)
			},
			_requestAllShopList () {
				Util.get('/money/v1/user/getAllShopListByOwner', null, (err, res) => {
					if (err) {
						console.error('<err> get all shop err: ', err)
					} else {
						if (res.isSuccess()) {
							this.allShopArray = res.Body
							uni.setStorageSync(Util.Constant.StorageKey_AllShopList + Util.getUserId(), this.allShopArray)
							this.shopIndexArray = [0, 0]
							if (this.allShopArray.length > 0) {
								this.allShopArrayDataSource[0] = this.allShopArray
								if (this.allShopArray.length > this.shopIndexArray[0]) {
									this.allShopArrayDataSource[1] = this.allShopArray[this.shopIndexArray[0]].shopList
								}
							}
							this.refreshQRCodeImg()
							console.log('get all shop: ', this.allShopArray)
						} else {
							console.error('<error> get all shop error : ', res.Header.ErrMsg)
						}
					}
				})
			},
			_requestPayWayList () {
				Util.get('/money/v1/pay/getPayWayList', null, (err, res) => {
					if (res && res.isSuccess()) {
						this.payWayArray = res.Body
						uni.setStorageSync(Util.Constant.StorageKey_PayWayList + Util.getUserId(), this.payWayArray)
						console.log('>>> payway: ', this.payWayArray)
					} else {
						if (err) {
							console.error('<error> get payway list error : ', err.errMsg)
						} else {
							console.error('<error> get payway list error : ', res.Header.ErrMsg)
						}
					}
				})
			},
			addPayRecordAction () {
				let cardId = undefined
				let shopId = undefined
				if (this.cardArray.length > this.cardIndex) {
					cardId = this.cardArray[this.cardIndex]._id
				}
				if (this.allShopArrayDataSource[1].length > this.shopIndexArray[1]) {
					shopId = this.allShopArrayDataSource[1][this.shopIndexArray[1]]._id
				}
				
				if (!this.price || parseFloat(this.price) <= 0) {
					uni.showModal({
						title:'提示',
						content:'请输入有效的金额',
						showCancel:false
					})
					return
				}
				
				let payWayModel = this.payWayArray[this.payWayIndex]
				let addRecordJson = {card: cardId, shop: shopId, dateStr: this.date + ' ' + this.time, price: parseFloat(this.price), payType: payWayModel.type, payWay: payWayModel.name}
				console.log('>>> param:', cardId)
				Util.post('/money/v1/user/addPayRecord', addRecordJson, (err, res) => {
					if (res && res.isSuccess()) {
						console.log('add pay record success')
						let self = this
						uni.showModal({
							title: '提示',
							content: `添加消费记录成功`,
							showCancel: true,
							cancelText: '取消',
							confirmText: '继续添加',
							success: res => {
								if (res.confirm) {
									self.price = ''
								} else if (res.cancel) {
									uni.navigateBack();
								}
							}
						});
					} else {
						uni.showModal({
							title:'警报',
							content:(err && err.errMsg) || (res && res.Header.ErrMsg),
							showCancel:false
						})
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
		padding-bottom: 160upx;
	}
	.inline {
		display: flex;
		align-items: center;
		align-content: center;
	}
	.cell {
		margin-top: 30upx;
	}
	.cardPiker {
		display: inline-flex;
	}
	.commmonInputContainer {
		margin-top: 30upx;
	}
	.labelText {
		font-size: 28upx;
		color: #666;
		margin-right: 20upx;
	}
	.pickerText {
		padding: 8upx 15upx 8upx 5upx;
		border: #007AFF 1px solid;
		border-radius: 8upx;
	}
	.addCardBtn {
		width: 80%;
		margin-top: 40upx;
	}
	text {
		margin-left: 10upx;
		font-size: 28upx;
		color: #666;
	}
	input {
		margin-left: 10upx;
		font-size: 28upx;
		color: #333;
		border: solid #E0E0E0 1upx;
		border-radius: 8upx;
	}
	.addPayRecordBtn {
		margin-top: 30upx;
	}
	.commonBtn {
		margin-top: 40upx;
		width: 80%;
		height: 65upx;
		font-size: 28upx;
		justify-content: center;
		align-items: center;
	}
	.qrcodeimage {
		margin-top: 30upx;
		margin-bottom: 30upx;
	}
</style>
