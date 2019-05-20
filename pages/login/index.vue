<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
        <view class="content-bg" v-if="!reqing">
        	<image src="../../static/images/login/bg.png" mode="aspectFill"></image>
        </view>
				<view class="content-main" v-if="!reqing">
					<image src="../../static/images/login/logo.png" class="logo"></image>
					<view class="form">
						<label >
							<view class="phone-num">
								<image src="../../static/images/login/phone.png" ></image>
								<input type="number" v-model="mobile" placeholder="请输入手机号码" placeholder-style="color:#fff" confirm-type="next"/>
							</view>
						</label>
						<label>
							<view class="password">
								<image src="../../static/images/login/lock1.png" mode=""></image>
								<input type="text" v-model="password" password="true" placeholder="请输入密码" placeholder-style="color:#fff" @confirm="clickMobile"/>
							</view>	
						</label>
						<view class="login-btn" :class="{'disabled': loging}" @click="clickMobile">登录{{ loging ? '中...' : '' }}</view>
						<view class="toforget uni-flex">
              <text @click="gotoRegister">去注册</text>
              <text @click="toforget">忘记密码?</text>
            </view>
					</view>
          <!-- #ifdef APP-PLUS -->
          <view class="other uni-flex">
          	<view class="item uni-flex uni-column" @click="clickWx">
          		<text>微信授权登陆</text>
          		<image src="../../static/images/login/weixin.png" class="weixin"></image>
          	</view>
          </view>
          <!-- #endif -->
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
        hasConfig: false,
        showLoading: true,
        configReqNum: 0,
        reqing: true,
        loging: false,
        mobile: '',
        password: ''
			};
		},
		onLoad() {
      // 登录逻辑
      uni.showLoading({
      	mask: true
      })
      // 获取config，失败之后重新获取，三次失败弹窗提示
      this.getConfig()
		},
    methods: {
      getConfig() {
        if (this.configReqNum >= 2) {
          uni.showModal({
          	content: '服务器繁忙，请关闭app，稍候再打开',
            showCancel: false
          })
          return
        }
        this.configReqNum ++
        uni.request({
        	url: this.$apis.configs,
        	method: 'GET',
        	data: {},
        	success: res => {
        		if (res.data.success) {
        			this.$store.commit('savaConfig', res.data.data)
              // 获取config成功之后，检查stroage是否有jwt和登录态
              let jwt = uni.getStorageSync('jwt')
              let loginType = uni.getStorageSync('loginType')
              if (jwt && loginType && (loginType === this.$constant.LOGIN_TYPE_MOBILE || loginType === this.$constant.LOGIN_TYPE_WECHAT)) {
                //#ifdef APP-PLUS
                // 5+app先判断是否要升级
                this.checkVersion(() => {
                  uni.hideLoading()
                }, res => {
                  if (!res) {
                    uni.showLoading({
                    	title: '正在登录',
                      mask: true
                    })
                    this.$store.commit('login', {jwt: jwt, loginType: loginType})
                    this.getUserInfo()
                  }
                })
                //#endif
                //#ifndef APP-PLUS
                this.$store.commit('login', {jwt: jwt, loginType: loginType})
                this.getUserInfo()
                //#endif
              } else {
                // 没有，显示登录
                //#ifdef APP-PLUS
                // 5+app先判断是否要升级
                this.checkVersion(() => {
                  this.reqing = false
                  uni.hideLoading()
                  this.showLoading = false
                })
                //#endif
                //#ifndef APP-PLUS
                this.reqing = false
                uni.hideLoading()
                this.showLoading = false
                //#endif
              }
        		} else {
        			this.getConfig()
        		}
        	},
        	fail: () => {
        		this.getConfig()
        	}
        });
      },
      getUserInfo(click) {
        if (click) {
          uni.showLoading({
            title: '正在登录',
          	mask: true
          })
          this.showLoading = true
        }
        uni.request({
          url: this.$apis.userInfo,
          method: 'GET',
          header: {
            Authorization: this.$store.state.jwt
          },
          data: null,
          success: res => {
            if (res.data.code === 401) {
              this.reqing = false
              this.$store.commit('logout')
              return
            }
            if (res.data.success) {
              this.$store.commit('savaUserInfo', res.data.data)
              // 查询是否有资格升级VIP
              if (this.$store.state.userInfo.role >= 1) {
                this.$http({
                  url: this.$apis.checkAgent,
                  method: 'POST',
                  data: {
                    uid: this.$store.state.userInfo.id
                  },
                  cb: (err, data) => {
                    if (!err && data.success) {
                    	this.$getInfo()
                    }
                  }
                })
              }
              uni.reLaunch({
                url: '/pages/index/index'
              })
            } else {
              this.reqing = false
              uni.showModal({
              	content: res.data.message,
                showCancel: false
              })
            }
          },
          fail: () => {
            this.reqing = false
          },
          complete: () => {
            if (this.showLoading) uni.hideLoading()
            this.showLoading = false
            this.loging = false
          }
        });
      },
      gotoRegister(){
        this.$navigateTo({
          url: '/pages/login/register'
        })
      },
      toforget(){
        this.$navigateTo({
          url: '/pages/login/forget'
        })
      },
      clickMobile(){
        if (!this.$utils.validatePhone(this.mobile)) {
          uni.showToast({
          	title: '请输入正确的手机号码',
            icon: 'none'
          })
          return
        }
        if (this.password.length < 4) {
          uni.showToast({
          	title: '密码长度少于4位',
            icon: 'none'
          })
          return
        }
        // 登录
        this.$http({
          url: this.$apis.login,
          method: 'POST',
          data: {
            mobile: this.mobile,
            password: this.password
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.$store.commit('login', {jwt: 'Bearer ' + data.data.token, loginType: this.$constant.LOGIN_TYPE_MOBILE})
              this.loging = true
              this.getUserInfo(true)
            } else {
              uni.showModal({
              	title: '登录失败',
                content: data.message,
                showCancel: false
              })
            }
          }
        })
      },
      clickWx() {
        uni.showLoading({
        	title: '获取服务商',
        	mask: true
        });
        uni.getProvider({
        	service: 'oauth',
          success: res => {
          	if (~res.provider.indexOf('weixin')) {
              uni.showLoading({
              	title: '拉起微信授权',
              	mask: true
              });
              uni.login({
              	provider: 'weixin',
              	success: res => {
                  uni.showLoading({
                  	title: '正在登录',
                  	mask: true
                  })
                  uni.getUserInfo({
                  	provider: 'weixin',
                    success: infoRes => {
                      uni.request({
                        url: this.$apis.wxLogin,
                        method: 'POST',
                        data: {
                          userInfo: JSON.stringify(infoRes.userInfo)
                        },
                        success: resData => {
                          if (resData.data.success) {
                            this.$store.commit('login', {jwt: 'Bearer ' + resData.data.data.token, loginType: this.$constant.LOGIN_TYPE_WECHAT})
                            this.getUserInfo(true)
                          } else {
                            uni.hideLoading()
                            uni.showToast({
                            	title: '登录失败：' + resData.data.message,
                              icon: 'none'
                            })
                          }
                        },
                        fail: err => {
                        	uni.hideLoading()
                        	uni.showToast({
                        		title: '登录失败：' + JSON.stringify(err),
                        	  icon: 'none'
                        	})
                        }
                      })
                    },
                    fail: err => {
                    	uni.hideLoading()
                    	uni.showToast({
                    		title: '登录失败：' + JSON.stringify(err),
                    	  icon: 'none'
                    	})
                    }
                  })
                },
              	fail: () => {
                  uni.hideLoading()
                  uni.showToast({
                  	title: '拉起微信失败',
                    icon: 'none'
                  })
                }
              });
            } else {
              uni.hideLoading()
              uni.showToast({
              	title: '拉起微信失败',
                icon: 'none'
              })
            }
          },
          fail: () => {
          	uni.hideLoading()
            uni.showToast({
            	title: '获取服务商失败',
              icon: 'none'
            })
          }
        })
      },
      checkVersion(cb, cb2) {
        // 版本检测
        let os = uni.getSystemInfoSync().platform;
        this.$http({
        	url: this.$apis.appUpdate,
          method: 'POST',
          data: {
            type: os,
            version: plus.runtime.version
          },
          cb: (err, data) => {
            if (typeof cb === 'function') cb()
          	if (!err && data.success && data.data.need) {
              uni.showModal({
              	title: '更新提示',
                content: '您当前的版本为' + plus.runtime.version + '，最新版本为' + data.data.version + '，升级为最新版本将为您带来更好的体验',
                confirmText: '去升级',
                success: res2 => {
                  if (res2.confirm) {
                    if (typeof cb2 === 'function') cb2(true)
											try {
												switch(uni.getSystemInfoSync().platform){
													case 'android':
														plus.runtime.openURL(data.data.androidUrl);
														break;
													case 'ios':
														plus.runtime.openURL(data.data.iosUrl) ;
														break;
													default:
														console.log('运行在开发者工具上')
														break;
													}
                    } catch (e) {
                    	if (typeof cb2 === 'function') cb2(false)
                    }
                  } else if (res2.cancel) {
                    if (typeof cb2 === 'function') cb2(false)
                  }
                }
              })
            } else {
              if (typeof cb2 === 'function') cb2(false)
            }
          }
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/login';
	.form{display: flex;flex-direction: column;padding:0px 49upx;
		  image{height: 54upx;width: 54upx;margin-right: 18upx;}
			input{flex: 1;display: inline-block;color: #fff;}
			.phone-num,.password{display: flex;align-items: center;margin-bottom: 28upx; border-radius: $radius; height: $height;border:$border;padding-left: 21upx;}
	    .login-btn{height: $height;background: #67C90A;text-align: center;line-height: $height;box-shadow:0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 2px 0px 0px rgba(103,201,10,1);
			  border-radius:9upx;font-size: 35upx;color:$color-white;margin-top: 44upx;margin-bottom: 33upx;}
	    .toforget{justify-content: space-between; font-size: 33upx;text-decoration:underline;color:$color-white;}
	}
	.other{
    justify-content: center; padding: 50upx 20upx 0;
    .item{
      align-items: center; margin: 0 20upx; font-size: 24upx; line-height: 40upx; color: #fff;
      image{
        width: 88upx; height: 88upx; margin-top: 20upx;
      }
    }
  }
</style>