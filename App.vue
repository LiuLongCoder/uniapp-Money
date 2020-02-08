<script>
	import Util from './common/util.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			uni.$on(Util.Constant.Notice_UpdateUserInfo, () => {
				this._requestUserInfo()
			})
			this._requestCheckAppUpgrade()
			
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}, 
		methods: {
			_requestUserInfo () {
				if (Util.User.sharedInstance().isLogin()) {
					let userId = Util.getUserId()
					Util.get('/money/v1/user/getUserInfo', {userId: userId}, (err, res) => {
						if (res.isSuccess()) {			
							let userId = res.Body._id
							Util.User.setUserId(userId)
							console.log(userId)
							uni.setStorageSync(Util.Constant.StorageKey_UserId, userId)
							console.log(JSON.stringify(res.Body))
							uni.setStorageSync(Util.Constant.StorageKey_UserJson, res.Body)
							Object.assign(Util.User.sharedInstance(), res.Body)
							console.log(Util.User.sharedInstance())
						}
					})
				}
			},
			_requestCheckAppUpgrade () {
				// #ifdef APP-PLUS
				Util.get('/money/v1/user/register', null, (err, res) => {
					if (res && res.isSuccess()) {
						let appM = res.Body
						let isForceUpgrade = appM.forceUpgrade === 1
						let version = plus.runtime.version
						if (version !== appM.version) {
							let upgradeDescription = appM.upgradeDescription ? appM.upgradeDescription : '有升级版本'
							let message = `当前版本:${version}\n最新版本:${appM.version}\n\n更新内容为:${upgradeDescription}\n\n下载地址已经复制到剪切板,自己去浏览器粘贴打开`
							let upgradeUrl = appM.dandelion ? appM.dandelion : appM.fir
							if (upgradeUrl) {
								uni.setClipboardData({
									data: upgradeUrl,
									success() {
										uni.showModal({
											title:'升级',
											content:message,
											showCancel:!isForceUpgrade,
											confirmText:'确定',
											success(res) {
												
											}
										})
									}
								})
								
							}
						}
					}					
				})
				// #endif
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
