<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true">
        <image src="/static/images/bg.png" mode="widthFix" class="bg uni-pa"></image>
        <view class="logo uni-pr uni-flex">
          <image src="/static/images/logo.png" mode="widthFix"></image>
        </view>
        <view class="register uni-pr">
          <view class="register-con">
            <view class="tit uni-txc">免费注册普通会员</view>
            <view class="line"></view>
            <view class="wirte">
              <view class="item uni-flex uni-box uni-pr">
                <image class="input-icon" src="/static/images/icon/icon-phone.png"></image>
                <view class="input-box uni-flex-item uni-pr">
                  <input type="number" placeholder="请输入您的手机号码" placeholder-class="input-placeholder" v-model="phone" confirm-type="next">
                </view>
              </view>
              <view class="item uni-flex uni-box uni-pr">
                <image class="input-icon" src="/static/images/icon/icon-code.png"></image>
                <view class="input-box input-box-code uni-flex-item uni-pr">
                  <input type="text" placeholder="请输入验证码" placeholder-class="input-placeholder" class="code-input" v-model="code" @confirm="confirm">
                </view>
                <view class="send-code uni-pa uni-txc">
                	<view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
                	<view class="text" v-show="sending">{{ countNum }}s</view>
                </view>
              </view>
            </view>
            <view class="agreement uni-flex uni-box">
            	<image :src="agree ? '/static/images/icon/icon-check-2.png' : '/static/images/icon/icon-check-1.png'" @click="checkAgree"></image>
            	本人已阅读并同意
            	<view @click="showAgree">《{{ config.system_nick_name }}用户协议》</view>
            </view>
            <view class="operation uni-flex uni-box">
            	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
            		<view class="uni-flex-item" @click="confirm">马上升级</view>
            	</view>
            </view>
          </view>
        </view>
        <view class="tips">
          <view>温馨提示：</view>
          <view>注册普通会员不收取任何费用，并且可以享受办理业务后的佣金提成，具体佣金金额及比例请详见各业务板块。</view>
        </view>
      </scroll-view>
		</view>
    <vueagreement :agreeData="agreeData"></vueagreement>
	</view>
</template>
<script>
  import vueagreement from '../../components/agreement.vue'
  
  const COUNTSECEND = 60
  
	export default{
    components: {
      vueagreement
    },
		data(){
			return{
				phone: '', // 手机号码
        code: '', // 验证码
        agree: true, // 是否同意协议
        hasSendCode: false,
        isClickCode: false,
        sending: false,
        countNum: COUNTSECEND,
        countTimer: null,
        pop: false,
        submiting: false,
        agreeData: {}
			}
		},
    computed: {
    	config() {
    		return this.$store.state.config
    	}
    },
    onShow() {
    	// 是否处于验证码获取倒计时状态
      if (uni.getStorageSync('agentCodeStamp')) {
        let oldtime = uni.getStorageSync('agentCodeStamp')
        let nowtime = new Date().getTime()
        let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
        if (cha < COUNTSECEND) {
          this.sending = true
          this.countNum = COUNTSECEND - cha
          this.countTimer = setInterval(() => {
            this.countNum --
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
		methods:{
      checkAgree() {
        this.agree = !this.agree
      },
      showAgree() {
        this.agreeData = {
          show: true
        }
      },
      sendCode() {
        if (this.isClickCode) return
        if (!this.$utils.validatePhone(this.phone)) {
          uni.showToast({
          	title: '手机号码格式错误',
            icon: 'none'
          })
        } else {
          this.isClickCode = true
          if (!this.hasSendCode) this.hasSendCode = true
          this.$http({
            url: this.$apis.phone,
            method: 'POST',
            data: {
              type: 4,
              mobile: this.phone
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
                uni.setStorageSync('agentCodeStamp', (new Date().getTime()).toString())
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
      confirm() {
        if (!this.$utils.validatePhone(this.phone)) {
          uni.showToast({
          	title: '请输入正确的手机号码',
            icon: 'none'
          })
        } else if (!this.hasSendCode) {
          uni.showToast({
          	title: '验证码已失效，请重新发送',
            icon: 'none'
          })
        } else if (this.code.length <= 0) {
          uni.showToast({
          	title: '请输入验证码',
            icon: 'none'
          })
        } else if (!this.agree) {
          uni.showToast({
          	title: '请阅读并勾选《' + this.config.system_nick_name + '用户协议》',
            icon: 'none'
          })
        } else {
          this.pop = true
        }
      },
      submit() {
        if (this.submiting) return
        let _this = this
        _this.submiting = true
        this.$http({
          url: this.$apis.levelUp,
          method: 'POST',
          data: {
            mobile: _this.phone,
            verify_code: _this.code
          },
          cb: (err, data) => {
            if (!err && data.success === true) {
              uni.removeStorageSync('agentCodeStamp')
              uni.setStorageSync('agentInvitePop', true)
              this.$getInfo(b => {
                if (b) {
                  uni.switchTab({
                  	url: '/pages/shop/index'
                  })
                }
              })
            } else {
              uni.showModal({
                title: '升级失败',
              	content: data ? (data.message ? data.message : '升级失败，请稍后再试') : '升级失败，请稍后再试',
                showCancel: false,
                confirmText: '确定'
              })
            }
            _this.submiting = false
            _this.pop = false
          }
        })
      }
		}
	}
</script>
<style lang="scss" scoped>
	@import '../../common/var';
  .bg{
    width: 100%;
  }
  .logo{
    justify-content: center; align-items: center; height: 280upx;
    image{
      width: 264upx;
    }
  }
  .register{
    padding: 0 40upx;
    .register-con{
      padding: 50upx 0; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
      .tit{
        height: 50upx; margin-bottom: 20upx; font-size: $font-size-36; line-height: 50upx; color: $color;
      }
      .line{
        width: 280upx; height: 4upx; margin: 0 auto 80upx; background-color: $color;
      }
      .wirte{
        .item{
          align-items: center; width: 530upx; padding: 28upx 0; margin: 0 auto 30upx; border-bottom: $border-1;
          .input-icon{
          	width: 80upx; height: 80upx; margin-right: 10upx;
          }
          .input-box-code{
          	margin-right: 184upx;
          }
          input{
          	width: 100%; height: 64upx; font-size: $font-size-32; font-weight: 700; color: $default-color;
          }
          .send-code{
          	top: 50%; right: 0; width: 144upx; height: 48upx; margin-top: -24upx; font-size: 22upx; line-height: 48upx;
          	.btn{
          		line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: 48upx;
          	}
          	.text{
          		line-height: 48upx; color: $color-gray; background-color: $color-disabled; border-radius: 48upx;
          	}
          }
        }
      }
    }
  }
  .agreement{
    align-items: center; height: 64upx; padding: 0 70upx; margin-bottom: 64upx; font-size: $font-size-24; color: $color-gray;
    image{
      width: 48upx; height: 48upx; margin-right: 8upx;
    }
  }
  .tips{
    padding: 40upx 50upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
  }
</style>