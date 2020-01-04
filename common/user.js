let user
class User {
	
	static setUserJson (userJson) {
		Object.assign(User.sharedInstance(), userJson)
	}
	
	setUserJson (userJson) {
		Object.assign(this, userJson)
	}
	
	constructor() {
		let userId = uni.getStorageSync('StorageKey_UserId')
		let userJson = uni.getStorageSync('StorageKey_UserJson')
		if (userId) {
			this.userId = userId
			if (userJson) {
				Object.assign(this, userJson)
			}
		} else {
			this.userId = '0'
		}
	}

	static sharedInstance() {
		if (user === null || user === undefined) {
			user = new User()
		}
		return user
	}
	
	isLogin () {
		if (this.userId === '0') {
			return false
		}
		return true
	}
	
	static logout () {
		uni.removeStorageSync('StorageKey_UserId')
		uni.removeStorageSync('StorageKey_UserJson')
		user = new User()
		uni.$emit('Notice_Logout')
	}
	
	static isLogin() {
		if (User.sharedInstance().userId === '0') {
			return false
		}
		return true
	}

	getUserId() {
		return this.userId
	}
	
	static getUserId () {
		User.sharedInstance().getUserId()
	}
	
	setUserId(_userId) {
		this.userId = _userId
	}
	
	static setUserId (userId) {
		User.sharedInstance().setUserId(userId)
	}
}

module.exports = User
