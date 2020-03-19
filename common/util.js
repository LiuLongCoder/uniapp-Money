const User = require('./user.js')
const Response = require('./response.js')
const MD5 = require('./md5.js')

// h5 node server npm : connect-history-api-fallback
let globalUUID = ''
let gloablSystemInfo = uni.getSystemInfoSync()	// 获取系统信息
// #ifdef APP-PLUS
plus.device.getInfo({
		success:function(e){
			globalUUID = e.uuid
			console.log('getDeviceInfo success: '+JSON.stringify(e));
		},
		fail:function(e){
			console.log('getDeviceInfo failed: '+JSON.stringify(e));
		}
	});
// #endif

const Constant = {
	serverHost: 'http://liulong.site',
	// serverHost: 'http://172.20.10.11',
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

function getCommonHeader () {
	let osType = gloablSystemInfo.platform // iOS , Android
	let region = '0' // 0: bookCity, 1: Snaplearn
	let headerJson = {userId: _getUserId(), osType: osType && osType.toLowerCase(), deviceId: globalUUID, timstamp: new Date().getTime()}
	Object.assign(headerJson, gloablSystemInfo)
	// #ifdef APP-PLUS
	headerJson.version = plus.runtime.version
	headerJson.bundleId = plus.runtime.appid
	// #endif
	let jsonString = JSON.stringify(headerJson)
	let signature = MD5.hex_md5('luka' + jsonString + 'luka').toLowerCase()
	headerJson.jsonString = jsonString
	headerJson.signature = signature
	let headerJsonEncoderStr  = JSON.stringify(headerJson)
	return { 'app-header': headerJsonEncoderStr}
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

	uni.request({
		url: url,
		method: method,
		header:getCommonHeader(),
		data: param,
		success: res => {
			// res.data.Body = MXREncryption.decryptionMxr(res.data.Body, true)
			/// 如果请求失败,提示出来
			if (res.statusCode !== 200) {
				uni.showModal({
					title:'appErr',
					content: `res status: ${res.statusCode} url: ${url}`,
					showCancel: false
				})
			}
			try {
				if (callback) {
					let response = Response.builderWithResponse(res.data)
					callback(null, response)
				}
				// res.data.Body = JSON.parse(res.data.Body)
			} catch (e) {
				console.log('>>> parse json error :', e)
			} finally {
				
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
	md5: MD5.hex_md5,
	getCommonHeader: getCommonHeader
}