const User = require('./user.js')
const Response = require('./response.js')
const MD5 = require('./md5.js')

const Constant = {
	serverHost: 'http://192.168.2.38:3000',
	userId: _getUserId(),
	StorageKey_UserId: 'StorageKey_UserId',
	StorageKey_UserJson: 'StorageKey_UserJson',
	StorageKey_CardList: 'StorageKey_CardList',
	StorageKey_AllShopList: 'StorageKey_AllShopList',
	StorageKey_ShopList: 'StorageKey_ShopList',
	StorageKey_PayWayList: 'StorageKey_PayWayList',
	
	Notice_Logout: 'Notice_Logout',
	Notice_Login: 'Notice_Login',
	Notice_AddShop: 'Notice_AddShop',
	Notice_AddCreditCard: 'Notice_AddCreditCard',
	Notice_UpdateUserInfo: 'Notice_UpdateUserInfo'
}

function _getUserId() {
	return User.sharedInstance().getUserId()
}

function _setUserId (userId) {
	User.sharedInstance().setUserId(userId)
}

function _request(url, method, param, callback, complete) {
	if (!param) { param = {} }
	if (url.indexOf('http') === -1) {
		if (url.indexOf('/') !== 0) {
			url = Constant.serverHost + '/' + url
		} else {
			url = Constant.serverHost + url
		}
		
	}
	
	let osType = uni.getSystemInfoSync().platform // iOS , Android
	let region = '0' // 0: bookCity, 1: Snaplearn
	let headerJson = {userId: _getUserId(), osType: osType, appVersion: '5.40.0', deviceId: '5F3E6EB4-CA01-42B0-BD77-0E72DA409618',}
	let headerJsonEncoderStr  = JSON.stringify(headerJson)
	
	uni.request({
		url: url,
		method: method,
		header:{'money-param': headerJsonEncoderStr},
		data: param,
		success: res => {
			// res.data.Body = MXREncryption.decryptionMxr(res.data.Body, true)
			try {
				// res.data.Body = JSON.parse(res.data.Body)
			} catch (e) {
				console.log('>>> parse json error :', e)
			} finally {
				if (callback) {
					let response = Response.builderWithResponse(res.data)
					callback(null, response)
				}
			}
		},
		fail: (err) => {
			if (callback) {
				callback(err, null)
			}
		},
		complete: complete
	});
}

function get(url, param, callback, complete) {
	_request(url, 'GET', param, callback, complete)
}

function post(url, param, callback, complete) {
	_request(url, 'POST', param, callback, complete)
}

export default {
	Constant: Constant,
	User: User,
	isLogin: User.isLogin,
	getUserId: _getUserId,
	setUserId: _setUserId,
	get: get,
	post: post,
	md5: MD5.hex_md5
}