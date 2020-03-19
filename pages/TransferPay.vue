<template>
	<view class="content">
		<scroll-view>
			<view class="conditionView">
				<checkbox :checked="dateChecked" @click="toggleDateChecked"><text>选择时间段</text></checkbox>
				<picker mode="date" :value="fromDate" :start="fromStartDate" :end="fromEndDate" @change="bindFromDateChange">
					<text class="pickerText">{{fromDate}}</text>
				</picker>
				<picker mode="date" :value="toDate" :start="toStartDate" :end="toEndDate" @change="bindToDateChange">
					<text class="pickerText">{{toDate}}</text>
				</picker>
				<text class="searchText" @click="_requestIncome">搜索</text>
			</view>
			<view class="noMoreDateView" v-if="loadDataBack && lukaList.length == 0">
				<text class="noMoreDateText">没有数据~</text>
			</view>
			<view v-else>
				<view class="totalMoneyView" v-if="totalMoney > 0">
					<text>实际总额：</text>
					<text class="priceText">{{totalMoney}}</text>
				</view>
				<view class="" v-bind:key="lIdx" v-for="(luka, lIdx) in lukaList" v-if="luka.spendArray.length > 0">
					<view v-if="type === 'user'">
						<view class="oneCell" v-if="type === 'user'">
							<text>在</text>
							<text class="nameText">{{luka.name}}</text>
							<text>店里</text>
							<view class="" v-bind:key="sIdx" v-for="(spendItem, sIdx) in luka.spendArray">
								<text>刷了共{{spendItem.count}}笔</text>
								<text>共{{spendItem.price}}元</text>
								<text>产生利润：</text>
								<text class="priceText">{{spendItem.returnPrice}}</text>
							</view>
						</view>
						<view v-else>
							<text class="nameText">{{spendItem.user.name}}</text>
							<text>在我家店里</text>
							<text>刷了{{spendItem.count}}笔,共{{spendItem.price}}元</text>
							<text>产生利润：</text>
							<text class="priceText">{{spendItem.returnPrice}}</text>
						</view>
						
					</view>
					<view v-else>
						<view class="oneCell" v-bind:key="sIdx" v-for="(spendItem, sIdx) in luka.spendArray">
							<text class="nameText">{{spendItem.user.name}}</text>
							<text>在 [{{luka.name}}] 店里</text>
							<text>刷了{{spendItem.count}}笔,共{{spendItem.price}}元</text>
							<text>产生利润：</text>
							<text class="priceText">{{spendItem.returnPrice}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	
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
	
	import Util from '../common/util.js'
	export default {
		data() {
			return {
				type: 'user',
				lukaList: [],
				loadDataBack: false,
				dateChecked: true,
				fromDate: getDate('yestoday'),
				toDate: getDate(),
				fromStartDate: getDate('start'),
				fromEndDate: getDate('end'),
				toStartDate: getDate('start'),
				toEndDate: getDate('end'),
				totalMoney: 0
			}
		},
		onNavigationBarButtonTap(e) {
			if (!this.verifyLogin()) { return }
			uni.navigateTo({
				url: '../AddCreditCard'
			})
		},
		onLoad(option) {
			this.type = option.type
			let title = option.title
			if (title) {
				uni.setNavigationBarTitle({title})
			}
		},
		onShow() {
			this.loginStatus = Util.User.isLogin()
			if (!this.cardList || this.cardList.length == 0) {
				this._requestIncome()
			}
			
		},
		methods: {
			toggleDateChecked() {
				this.dateChecked = !this.dateChecked
				this.lukaList = []
				this.loadDataBack = false
				this.totalMoney = 0
			},
			bindFromDateChange(e) {
				this.fromDate = e.target.value
				this._initData()
			},
			bindToDateChange(e) {
				this.toDate = e.target.value
				this._initData()
			},
			_initData () {
				this.lukaList = []
				this.loadDataBack = false
				this.dateChecked = true
				this.totalMoney = 0
			},
			_requestIncome () {
				if (!Util.isLogin()) { return }
				let paramJson = {type: this.type}
				// 添加时间过滤
				if (this.dateChecked) {
					let fDate = new Date(this.fromDate)
					let tDate = new Date(this.toDate)
					if (fDate.getTime() <= tDate.getTime()) {
						let fromDateStr = this.fromDate + ' 00:00:00'
						let toDateStr = this.toDate + ' 23:59:59'
						paramJson.fromDate = fromDateStr
						paramJson.toDate = toDateStr
					} else {
						uni.showModal({
							content: '请保证时间先后顺序',
							showCancel:false
						})
						return
					}
				}
				
				this.totalMoney = 0
				Util.get('/money/v1/pay/getIncome', paramJson, (err, res) => {
					this.loadDataBack = true
					console.log('get income : ', res)
					if (res && res.isSuccess()) {
						let lukaJson = res.Body
						let tmplukaList = []
						for (let key in lukaJson) {
							let luka = lukaJson[key]
							let spendArray = []
							for (let key in luka.spendJson) {
								let spendItem = luka.spendJson[key]
								// let dotIdx = (spendItem.returnPrice + '').indexOf('.')
								// if (dotIdx >= 0) {
								// 	spendItem.returnPrice = (spendItem.returnPrice + '').substring(0, dotIdx + 3)
								// }
								if (spendItem.returnPrice) {
									this.totalMoney += spendItem.returnPrice
								}
								spendArray.push(spendItem)
								// luka.spendJson[key].returnPrice = parseFloat(luka.spendJson[key].returnPrice).tof
							}
							if (spendArray.length > 0) {
								luka.spendArray = spendArray
								tmplukaList.push(luka)
							}
						}
						this.lukaList = tmplukaList
						console.log(tmplukaList[0])
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
	.conditionView {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30upx;
		margin-bottom: 30upx;
	}
	.pickerText {
		padding: 8upx 15upx 8upx 5upx;
		border: #007AFF 1px solid;
		border-radius: 8upx;
	}
	.searchText {
		padding: 8upx 15upx 8upx 5upx;
		border: #0000FF 1px solid;
		border-radius: 8upx;
	}
	.block {
		display: block;
	}
	.lukaCell {
		display: flex;
		justify-content: flex-start;
	}
	.inline {
		display: flex;
		align-items: center;
		align-content: center;
	}
	.oneCell {
		margin-top: 30upx;
	}
	text {
		font-size: 30upx;
		color: #666;
		margin-left: 10upx;
	}
	.nameText {
		color: #007AFF;
	}
	.priceText {
		color: #DD524D;
	}
	.noMoreDateView {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 100upx;
	}
	.noMoreDateText {
		font-size: 40upx;
	}
</style>
