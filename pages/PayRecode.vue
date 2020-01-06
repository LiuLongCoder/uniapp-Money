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
				<text class="searchText" @click="_requestPayRecords">搜索</text>
			</view>
			<view class="recordCell" v-bind:key="rIdx" v-for="(record, rIdx) in payRecordList">
				<text>{{record.dateStr}}</text>
				<text>{{record.price}}</text>
				<text>{{record.card && record.card.bank}}</text>
				<text>{{record.shop && record.shop.name}}</text>
			</view>
			<view class="bottomTipView" v-if="showLoadMoreFlag">加载更多...</view>
			<view class="bottomTipView" v-if="noMoreDateFlag">没有更多数据了</view>
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
				payRecordList: [],
				loginStatus: false,
				cardId: undefined,
				shopId: undefined,
				loading: false,
				page: 0,
				pageSize: 50,
				showLoadMoreFlag: false,
				noMoreDateFlag: false,
				dateChecked: true,
				fromDate: getDate('yestoday'),
				toDate: getDate(),
				fromStartDate: getDate('start'),
				fromEndDate: getDate('end'),
				toStartDate: getDate('start'),
				toEndDate: getDate('end'),
			}
		},
		onNavigationBarButtonTap(e) {

		},
		onLoad(option) {
			this.cardId = option.cardId
			this.shopId = option.shopId
			let title = option.title
			if (title) {
				uni.setNavigationBarTitle({ title: title })
			}
			this._requestPayRecords()
		},
		onShow() {
			console.log(this.fromDate)
			console.log(this.toDate)
		},
		onPullDownRefresh() {
			if (!this.loading) {
				this.initData()
				this._requestPayRecords()
			}
		},
		// 下拉加载
		onReachBottom() {
			this._requestPayRecords()
		},
		methods: {
			initData() {
				uni.stopPullDownRefresh()
				this.loading = false
				this.showLoadMoreFlag = false
				this.noMoreDateFlag = false
				console.log('onPullDownRefresh');
				this.page = 0
				this.payRecordList = []
			},
			toggleDateChecked() {
				this.dateChecked = !this.dateChecked
				this.initData()
			},
			bindFromDateChange(e) {
				this.fromDate = e.target.value
				this.initData()
				this.dateChecked = true
			},
			bindToDateChange(e) {
				this.toDate = e.target.value
				this.initData()
				this.dateChecked = true
			},
			percentFormat(num) {
				let strFormt = num.toFixed(3) * 100 + ''
				if (strFormt.length > 4) {
					strFormt = strFormt.substring(0, 4)
				}
				return strFormt += '%'
			},
			_requestCardsInfo() {
				if (Util.isLogin()) {
					let userId = Util.getUserId()
					let getCardInfoParam = {
						userId: userId
					}
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
			_requestPayRecords() {
				if (!this.loading) {
					this.loading = true
					let userId = Util.getUserId()
					if (this.page > 0 && !this.noMoreDateFlag) {
						this.showLoadMoreFlag = true
					}

					let paramJson = {
						userId: userId,
						page: this.page + 1,
						pageSize: this.pageSize
					}
					// 添加门店过滤
					if (this.shopId) {
						paramJson.shopIds = this.shopId
					}
					// 添加信用卡过滤
					if (this.cardId) {
						paramJson.cardIds = this.cardId
					}
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
							this.initData()
							return
						}
					}

					Util.get('/money/v1/user/getPayRecordList', paramJson, (err, res) => {
						this.loading = false
						this.showLoadMoreFlag = false
						uni.stopPullDownRefresh()
						if (res && res.isSuccess) {
							let tmpArray = this.payRecordList
							let resultArray = res.Body
							if (resultArray.length > 0) {
								this.page++
							} else {
								this.noMoreDateFlag = true
							}
							for (let key in resultArray) {
								tmpArray.push(resultArray[key])
							}
							this.payRecordList = tmpArray
							// console.log('get pay records: ', res)
						}
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
	.cardView {
		margin-top: 20upx;
	}
	.recordCell {
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
	.bottomTipView {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30upx;
		color: #999;
		margin-top: 20upx;
	}
</style>
