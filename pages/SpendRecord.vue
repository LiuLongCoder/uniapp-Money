<template>
	<view class="content">
		<scroll-view v-if="cardRecord">
			<view class="simpleInfo">
				<view class="inline">
					<text>信用卡刷卡总额：</text><text>{{cardRecord.totalMoney}}元</text>
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
					<text>{{cardItem.cardNumber}}</text>
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
				<view class="repayView" v-if="cardItem.durationCurrentRepayment > 0 && cardItem.willRepaymentMoney > 0">
					<view class="cell">
						<text v-if="cardItem.durationCurrentRepayment == 1" class="redText">今天之内</text>
						<text v-else class="redText">{{cardItem.durationCurrentRepayment}}天之内</text>
						<text class="redText">需要还款：</text><text>{{cardItem.willRepaymentMoney}}</text>
					</view>
					<view class="cell">
						<button type="primary" size="mini" @click="clickMarkRepaymentCard(cardItem._id)">标记还款</button>
					</view>
				</view>
				<!-- v-if="cardItem.waitRepaymentMoney > 0" -->
				<view class="cell willRepayView">
					<text class="greenText">{{cardItem.durationNextBill}}天后会出新账单</text>
					<text class="greenText" v-if="cardItem.waitRepaymentMoney > 0">{{cardItem.waitRepaymentMoney}}元</text>
					<text class="greenText">{{cardItem.durationNextRepayment}}天内需要还款</text>
				</view>
			</view>
		</scroll-view>
		<view v-bind:key="chartIdx" v-for="(chart, chartIdx) in charts">
			<view class="chartTitle">{{chart.chartTitle}}</view>
				<view class="chartView">
					<canvas :canvas-id="chart.chartId" :id="chart.chartId" class="chart" disable-scroll=true @touchstart="touchChart" @touchmove="moveChart" @touchend="touchEndChart"></canvas>
				</view>
			</view>
		<!-- <view class="chartView">
			<canvas canvas-id="chartId" id="canvasLineA" class="chart" disable-scroll=true @touchstart="touchChart" @touchmove="moveChart" @touchend="touchEndChart"></canvas>
		</view> -->
	</view>
</template>

<script>
	import Util from '../common/util.js'
	import uCharts from '../components/u-charts/u-charts.js'

	let _self
	let canvasObj = {}

	export default {
		data() {
			return {
				charts: [],
				cardRecord: '',
				cardList: [],
				loginStatus: false,
				cardId: undefined,
				// 图的一些设置
				cWidth: '',
				cHeight: '',
				cWidth2: '', //横屏图表
				cHeight2: '', //横屏图表
				cWidth3: '', //圆弧进度图
				cHeight3: '', //圆弧进度图
				arcbarWidth: '', //圆弧进度图，进度条宽度,此设置可使各端宽度一致
				gaugeWidth: '', //仪表盘宽度,此设置可使各端宽度一致
				tips: '',
				pixelRatio: 1,
				serverData: '',
				itemCount: 30, //x轴单屏数据密度
				sliderMax: 50
			}
		},
		onNavigationBarButtonTap(e) {

		},
		onLoad(option) {
			this.cardId = option.cardId
			this.loading = false
			uni.$on(Util.Constant.Notice_Logout, () => {})

			this.cWidth = uni.upx2px(750)
			this.cHeight = uni.upx2px(500)
			this.cWidth2 = uni.upx2px(700)
			this.cHeight2 = uni.upx2px(1100)
			this.cWidth3 = uni.upx2px(250)
			this.cHeight3 = uni.upx2px(250)
			this.arcbarWidth = uni.upx2px(24)
			this.gaugeWidth = uni.upx2px(30)
			_self = this
			this._requestCardChartsInfo()
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
			_requestCardChartsInfo () {
				if (Util.isLogin()) {
					Util.get('/money/v1/user/getCardChartsInfo', null, (err, res) => {
						if (res && res.isSuccess()) {
							if (_self.charts.length === 0) {
								_self.charts = res.Body
							} else {
								for (let key in res.Body) {
									_self.charts.push(res.Body[key])
								}
							}
							for (let key in _self.charts) {
								let chat = _self.charts[key]
								console.log('> ', chat)
								_self._layoutChart(chat)
							}
						}
					})
					Util.get('/money/v1/user/getCardRepaymentChartsInfo', null, (err, res) => {
						if (res && res.isSuccess()) {
							if (_self.charts.length === 0) {
								_self.charts = res.Body
							} else {
								for (let key in res.Body) {
									_self.charts.push(res.Body[key])
								}
							}
							for (let key in _self.charts) {
								let chat = _self.charts[key]
								console.log('> ', chat)
								_self._layoutChart(chat)
							}
						}
					})
				}
			},
			clickMarkRepaymentCard(cardId) {
				let self = this
				uni.showModal({
					title: '提示',
					content: '确定标记该信用卡已还款吗?',
					success(res) {
						if (res.confirm) {
							self.repaymentCard(cardId)
						} else if (res.cancel) {}
					}
				})
			},
			repaymentCard(cardId) {
				Util.post('/money/v1/user/repaymentCard', {
					userId: Util.getUserId(),
					cardId: cardId
				}, (err, res) => {
					if (res && res.isSuccess()) {
						uni.showToast({
							title: '标记还款成功',
							duration: 2000
						})
						this.cardRecord = ''
						this.cardList = []
						this._requestCardsInfo()
					}
				})
			},
			_requestPayRecords() {
				let userId = Util.getUserId()
				Util.get('/money/v1/user/getPayRecordList', {
					userId: userId
				}, (err, res) => {
					if (res && res.isSuccess()) {
						// console.log('get pay records: ', res)
					}
				})
			},
			_layoutChart(chartItem) {
				canvasObj[chartItem.chartId] = new uCharts({
					$this: _self,
					canvasId: chartItem.chartId,
					type: chartItem.chartType,
					fontSize: 11,
					padding: [15, 15, 0, 15],
					legend: {
						show: true,
						padding: 5,
						lineHeight: 11,
						margin: 6,
					},
					background: '#FFFFFF',
					pixelRatio: _self.pixelRatio,
					categories: chartItem.categories,
					series: chartItem.series,
					animation: false,
					enableScroll: true, //开启图表拖拽功能
					xAxis: {
						disableGrid: false,
						type: 'grid',
						gridType: 'dash',
						itemCount: 4,
						scrollShow: true,
						scrollAlign: 'left',
					},
					yAxis: {
						gridType: 'dash',
						dashLength: 4,
						splitNumber: 5,
						min: 10,
						max: 180,
						format: (val) => {
							return val.toFixed(0)
						}
					},
					width: _self.cWidth * _self.pixelRatio,
					height: _self.cHeight * _self.pixelRatio,
					dataLabel: true,
					dataPointShape: true,
					extra: {
						column: {
							width: 20 * _self.pixelRatio
						},
						tooltip: {
							bgColor: '#000000',
							bgOpacity: 0.7,
							gridType: 'dash',
							dashLength: 8,
							gridColor: '#1890ff',
							fontColor: '#FFFFFF',
							horizentalLine: true,
							xAxisLabel: true,
							yAxisLabel: true,
							labelBgColor: '#DFE8FF',
							labelBgOpacity: 0.95,
							labelAlign: 'left',
							labelFontColor: '#666666'
						}
					},
				})
			},
			touchChart(e) {
				let chartId = e.target.id
				canvasObj[chartId].scrollStart(e);
			},
			moveChart(e) {
				let chartId = e.target.id
				canvasObj[chartId].scroll(e);
			},
			touchEndChart(e) {
				let chartId = e.target.id
				canvasObj[chartId].scrollEnd(e);
				//下面是toolTip事件，如果滚动后不需要显示，可不填写
				canvasObj[chartId].showToolTip(e, {
					format: function(item, category) {
						return category + ' ' + item.name + ':' + item.data
					}
				});
			},
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

	.repayView {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
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

	/* 图 */
	.chartView {
		width: 750upx;
		height: 500upx;
		background-color: #FFFFFF;
	}
	.chartTitle {
		border-left: 10upx solid #0ea391;
		padding-left: 10upx;
		font-size: 32upx;
		color: #000000
	}
	.chart {
		width: 750upx;
		height: 500upx;
		background-color: #FFFFFF;
	}
</style>
