<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="content-bg">
					<image src="../../static/images/login/bg.png" mode="aspectFill"></image>
				</view>
				<view class="content-main">
					<image src="../../static/images/login/logo.png" class="logo"></image>
					<view class="form">
						<label >
							<view class="phone-num">
								<image src="../../static/images/login/phone.png" mode=""></image>
								<input type="number" v-model="mobile" placeholder="请输入手机号码" placeholder-style="color:#fff" />
							</view>
						</label>
						<label >
							<view class="code">
								<view class="code-ipt">
									<image src="../../static/images/login/auth-code.png" mode=""></image>
									<input type="number" v-model="code" placeholder="请输入验证码" placeholder-style="color:#fff"/>
								</view>
								<view class="code-btn">
                  <view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
                  <view class="text" v-show="sending">{{ countNum }}s</view>
                </view>
							</view>
						</label>
						<label>
							<view class="password">
								<image src="../../static/images/login/lock1.png" mode=""></image>
								<input type="text" v-model="password" password="true" placeholder="请输入6-16位的新密码" placeholder-style="color:#fff"/>
							</view>	
						</label>
						<label>
							<view class="password">
								<image src="../../static/images/login/lock1.png" mode=""></image>
								<input type="text" v-model="password2" password="true" placeholder="请再次输入密码" placeholder-style="color:#fff"/>
							</view>	
						</label>
						<view class="register-now" :class="{'disabled': submiting}" @click="submit">密码重置</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
  const COUNTSECEND = 60
  
	export default {
		data() {
			return {
				mobile: '',
        code: '',
        password: '',
        password2: '',
        hasSendCode: false,
        isClickCode: false,
        sending: false,
        countNum: COUNTSECEND,
        countTimer: null,
        submiting: false
			};
		},
    onShow() {
    	// 是否处于验证码获取倒计时状态
    	if (uni.getStorageInfoSync('forgetStamp')) {
    	  let oldtime = uni.getStorageInfoSync('forgetStamp')
    	  let nowtime = new Date().getTime()
    	  let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
    	  if (cha < COUNTSECEND) {
    	    this.sending = true
    	    this.countNum = COUNTSECEND - cha
    	    this.countTimer = setInterval(() => {
    	      this.countNum --;
    	      if (this.countNum <= 0) {
    	        clearInterval(this.countTimer)
    	        this.countNum = COUNTSECEND
    	        this.sending = false
    	        this.isClickCode = false
    	      }
    	    }, 1000)
    	    this.hasSendCode = true
    	  }
    	}
    },
    methods: {
      sendCode() {
        if (this.isClickCode) return
        if (!this.$utils.validatePhone(this.mobile)) {
          uni.showToast({
          	title: '请输入正确的手机号码',
            icon: 'none'
          })
        } else {
          this.isClickCode = true
          if (!this.hasSendCode) this.hasSendCode = true
          this.$http({
            url: this.$apis.code,
            method: 'POST',
            data: {
              'type': 1,
              'mobile': this.mobile
            },
            cb: (err, data) => {
              if (!err && data.success) {
              	this.sending = true
              	this.countTimer = setInterval(() => {
              		this.countNum --
              		if (this.countNum <= 0) {
              			clearInterval(this.countTimer)
              			this.countNum = COUNTSECEND
              			this.sending = false
              			this.isClickCode = false
              		}
              	}, 1000)
              	// 保存发送时间
                uni.setStorageSync('forgetStamp', (new Date().getTime()).toString())
              } else {
                uni.showToast({
                	title: data.message,
                  icon: 'none'
                })
              	this.sending = false
              	this.isClickCode = false
              }
            }
          })
        }
      },
      submit() {
        if (!this.$utils.validatePhone(this.mobile)) {
          uni.showToast({
          	title: '请输入正确的手机号码',
            icon: 'none'
          })
          return
        }
        if (!this.hasSendCode) {
          uni.showToast({
          	title: '验证码已失效，请重新发送',
            icon: 'none'
          })
          return
        }
        if (this.code.length <= 0) {
          uni.showToast({
          	title: '请输入验证码',
            icon: 'none'
          })
          return
        }
        if (this.password.length < 6 || this.password.length > 16) {
          uni.showToast({
          	title: '请输入大于6位数小于16位数的密码',
            icon: 'none'
          })
          return
        }
        if (this.password2 !== this.password) {
          uni.showToast({
          	title: '请再次输入相同的密码',
            icon: 'none'
          })
          return
        }
				this.$http({
				  url: this.$apis.resetPassword,
				  method: 'POST',
				  data: {
				    password: this.password,
				    mobile: this.mobile,
				    verify_code: this.code,
						repeat_password:this.password2
				  },
				  cb: (err, data) => {
				    if (!err && data.success) {
				      uni.showModal({
				      	title: '重置密码成功',
				      	content: '点击确认前往登录',
				      	showCancel: false,
				      	confirmText: '好的',
				      	success: () => {
				          uni.reLaunch({
				          	url: '/pages/login/index'
				          })
				        }
				      });
				    } else {
				      this.code = ''
				      uni.showModal({
				      	content: data.message,
				        showCancel: false
				      })
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
  	.phone-num,.password{display: flex;align-items: center; border-radius: $radius; height: $height;border:$border;padding-left: 21upx;margin-bottom: 28upx;}
    .code{border: 0px;display: flex;margin-bottom: 28upx;
  		.code-ipt{padding-left: 21upx; height:$height;flex: 1;display: flex;align-items: center; margin-right: 12upx;border-radius: $radius;border:2upx solid$color-white;}
  		.code-btn{
        height: $height;color: $color-white; width: 209upx;border: $border;border-radius: $radius;line-height: $height; text-align: center;font-size: 29upx;font-family:PingFang-SC-Regular;
        .text{
          color: #999; background-color: #f0f0f0;
        }
       }
  	}
  	.register-now{height: $height;background: #67C90A;text-align: center;line-height: $height;box-shadow:0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 2px 0px 0px rgba(103,201,10,1);
  	  border-radius:9upx;font-size: 35upx;color:$color-white;margin-top: 44upx;margin-bottom: 33upx;
  	}
	}
</style>
