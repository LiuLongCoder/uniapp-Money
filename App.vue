<script>
	import Util from './common/util.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			uni.$on(Util.Constant.Notice_UpdateUserInfo, () => {
				this._requestUserInfo()
			})
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
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
