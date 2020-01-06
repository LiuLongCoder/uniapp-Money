<template>
	<view class="content">
		<view class="demo">
			<block v-if="imageSrc">
				<image :src="imageSrc" class="image" mode="widthFix"></image>
			</block>
			<block v-else>
				<view class="uni-hello-addfile" @click="chooseImage">+ 选择图片</view>
			</block>
			<button @click="uploadFile">上传</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'uploadFile',
				imageSrc: ''
			}
		},
		onLoad() {
			console.log('uplaod img load')
		},
		onUnload() {
			this.imageSrc = '';
		},
		methods: {
			uploadFile: function() {
				console.log('test upload')
				uni.uploadFile({
					url: 'http://192.168.2.38/money/v1/file/upload',
					filePath: this.imageSrc,
					fileType: 'image',
					name: 'file',
					formData: {'type':'shopImage'},
					success: (res) => {
						let response = JSON.parse(res.data)
						console.log(response.Header.ErrCode === 0)
						if (response.Header.ErrCode === 0) {
							console.log('uploadImage success, res is:', res)
							uni.showToast({
								title: '上传成功',
								icon: 'success',
								duration: 1000
							})
							this.imageSrc = response.Body.imgUrl
						} else {
							console.log('uploadImage fail', '失败');
							uni.showModal({
								content: '上传文件失败',
								showCancel: false
							});
						}
					},
					fail: (err) => {
						console.log('uploadImage fail', err);
						uni.showModal({
							content: err.errMsg,
							showCancel: false
						});
					}
				});
			},
			chooseImage: function() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: (res) => {
						console.log('chooseImage success, temp path is', res.tempFilePaths[0])
						var imageSrc = res.tempFilePaths[0]
						this.imageSrc = imageSrc
					},
					fail: (err) => {
						console.log('chooseImage fail', err)
						// #ifdef MP
						uni.getSetting({
							success: (res) => {
								let authStatus = res.authSetting['scope.album'];
								if (!authStatus) {
									uni.showModal({
										title: '授权失败',
										content: 'Hello uni-app需要从您的相册获取图片，请在设置界面打开相关权限',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting()
											}
										}
									})
								}
							}
						})
						// #endif
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
</style>
