<template>
	<view class="content">
		<view class="cell" v-if="loginStatus">
			<button type="primary" @click="modifyInfoAction">修改信息</button>
			<button type="primary" @click="modifyPasswordAction">修改密码</button>
			<button type="primary" @click="logoutAction">退出登录</button>
		</view>
		<view class="cell" v-else>
			<button class="commonBtn" type="primary" @click="loginAction">登录</button>
		</view>
	</view>
</template>

<script>
	import Util from '../../common/util.js'
	export default {
		data() {
			return {
				cardList: [],
				loginStatus: false,
				userName: ''
			}
		},
		onLoad(option) {
			
		},
		onShow() {
			this.loginStatus = Util.User.isLogin()
		},
		methods: {
			loginAction () {
				uni.navigateTo({
					url: '../login'
				})
			}, 
			logoutAction () {
				Util.User.logout()
				this.loginStatus = false
			},
			modifyInfoAction () {
				uni.navigateTo({
					url: '../ModifyUserInfo'
				})
			},
			modifyPasswordAction () {
				uni.navigateTo({
					url: '../ModifyPassword'
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
	.cell {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: center;
	}
	button {
		margin-top: 20upx;
		/* width: 100%; */
	}
	.commonBtn {
		margin-top: 40upx;
		width: 80%;
		height: 65upx;
		font-size: 28upx;
		justify-content: center;
		align-items: center;
	}
</style>
