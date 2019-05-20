<template name="addContact">
	<view class="pop add-contact" v-show="isShow">
		<view class="mask" @click="hide"></view>
    <view class="pop-con" :class="{'pop-con-1': confirmState === 0}">
    	<view class="box">
    		<scroll-view scroll-y class="scroll-view">
    			<view class="write">
    				<view class="pop-title uni-box" v-if="type === 'xyk'">{{ confirmState === 0 ? '填写' : '确认' }}信用卡申请人</view>
    				<view class="pop-title uni-box" v-else-if="type === 'bx'">{{ confirmState === 0 ? '填写' : '确认' }}投保申请人</view>
    				<view class="pop-title uni-box" v-else-if="type === 'dk'">{{ confirmState === 0 ? '填写' : '确认' }}贷款申请人</view>
    				<view class="msg uni-box" :class="{'err': error.type}" v-show="confirmState === 0">{{ error.msg }}</view>
    				<!-- 填写信息 S -->
    				<view class="lists" v-show="confirmState === 0">
    					<view class="item uni-flex uni-box">
    						<image class="input-icon" src="/static/images/icon/icon-user.png"></image>
    						<view class="input-box uni-flex-item uni-pr">
    							<input type="text" v-model="username" placeholder="请输入姓名" placeholder-class="input-placeholder" confirm-type="next" />
    						</view>
    					</view>
    					<view class="item uni-flex uni-box">
    						<image class="input-icon" src="/static/images/icon/icon-idcard.png"></image>
    						<view class="input-box uni-flex-item uni-pr">
    							<input type="idcard" v-model="idcard" placeholder="请输入身份证号码" placeholder-class="input-placeholder" confirm-type="next" />
    						</view>
    					</view>
    					<view class="item uni-flex uni-box uni-pr">
    						<image class="input-icon" src="/static/images/icon/icon-phone.png"></image>
    						<view class="input-box input-box-code uni-flex-item uni-pr">
    							<input type="number" v-model="mobile" placeholder="请输入手机号码" placeholder-class="input-placeholder" confirm-type="next" />
    						</view>
    						<view class="send-code uni-pa uni-txc">
    							<view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
    							<view class="text" v-show="sending">{{ countNum }}s</view>
    						</view>
    					</view>
    					<view class="item uni-flex uni-box">
    						<image class="input-icon" src="/static/images/icon/icon-code.png"></image>
    						<view class="input-box uni-flex-item uni-pr">
    							<input type="text" v-model="code" placeholder="请输入验证码" placeholder-class="input-placeholder" confirm-type="done" @confirm="confirm" />
    						</view>
    					</view>
    				</view>
    				<!-- 填写信息 E -->
    				<!-- 同意条款 S -->
    				<view class="agreement uni-flex uni-box" v-show="confirmState === 0">
    					<image :src="agree ? '/static/images/icon/icon-check-2.png' : '/static/images/icon/icon-check-1.png'" @click="checkAgree"></image>
    					本人已阅读并同意
    					<view @click="showAgree">《{{ config.system_nick_name }}用户协议》</view>
    				</view>
    				<!-- 同意条款 E -->
    				<!-- 确认信息 S -->
    				<view class="info" v-show="confirmState === 1">
    					<view class="uni-flex"><text class="name">姓名：</text><text class="uni-flex-item">{{ username }}</text></view>
    					<view class="uni-flex"><text class="name">身份证：</text><text class="uni-flex-item">{{ idcard }}</text></view>
    					<view class="uni-flex"><text class="name">手机号：</text><text class="uni-flex-item">{{ mobile }}</text></view>
    				</view>
    				<!-- 确认信息 E -->
            <!-- 是否保存联系人 S -->
            <view class="agreement uni-flex uni-box" @click="checkSave" v-show="confirmState === 1">
              <image :src="isSave === 1 ? '/static/images/icon/icon-check-2.png' : '/static/images/icon/icon-check-1.png'" @click="checkAgree"></image>
              保存申请人信息
            </view>
            <!-- 是否保存联系人 E -->
    				<!-- 提示 S -->
    				<view class="tips" v-if="type === 'xyk'">
    					<view>温馨提示</view>
    					<view>1、请确保申请人信息真实并与银行申请填写的信息一致，否则申请成功后，将无法获取相关奖励。</view>
    					<view>2、请确保申请人未持有本银行信用卡，或在其他平台机构同时申请信用卡，将会影响您的会员信用。</view>
    					<view>3、在{{ config.system_name }}申请信用卡不收取任何费用，如有向您索要手续费情况，请拨及时打电话<text @click="callPhone(config.kf_phone)">{{ config.kf_phone }}</text>向{{ config.system_name }}举报。</view>
    				</view>
    				<view class="tips" v-else-if="type === 'bx'">
    					<view>温馨提示</view>
    					<view>1、请确保申请人信息真实并与保险申请填写的信息一致，否则申请成功后，将无法获取相关奖励。</view>
    					<view>2、在{{ config.system_name }}购买保险平台不收取任何额外费用，如有向您索要手续费情况，请拨及时打电话<text @click="callPhone(config.kf_phone)">{{ config.kf_phone }}</text>向{{ config.system_name }}举报。</view>
    				</view>
    				<view class="tips" v-else-if="type === 'dk'">
    					<view>温馨提示</view>
    					<view>1、请确保申请人信息真实并与贷款申请填写的信息一致，否则申请成功后，将无法获取相关奖励。</view>
    					<view>2、在{{ config.system_name }}购买贷款平台不收取任何额外费用，如有向您索要手续费情况，请拨及时打电话<text @click="callPhone(config.kf_phone)">{{ config.kf_phone }}</text>向{{ config.system_name }}举报。</view>
    				</view>
    				<!-- 提示 E -->
    			</view>
    		</scroll-view>
    	</view>
    	<view class="operation uni-flex uni-box" v-show="confirmState === 0">
    		<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
    			<view class="uni-flex-item gray" @click="hide">取消</view>
    			<view class="uni-flex-item" @click="confirm">立即申请</view>
    		</view>
    	</view>
      <view class="operation uni-flex uni-box" v-show="confirmState === 1">
      	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
      		<view class="uni-flex-item gray" @click="confirmState = 0">取消</view>
      		<view class="uni-flex-item" :class="{'disabled': submiting}" @click="submit">确定</view>
      	</view>
      </view>
    </view>
    <vueagreement :agreeData="agreeData"></vueagreement>
	</view>
</template>

<script>
  import vueagreement from './agreement.vue'
  
  const COUNTSECEND = 60
  
	export default {
		props: {
			addData: {
				type: Object,
				required: true
			}
		},
    components: {
      vueagreement
    },
		data () {
			return {
				isShow: false,
        type: '',
        productId: '',
        link: '',
        confirmState: 0,
        errorDefault: '',
        error: {
          msg: '',
          type: false
        },
        errorTimer: null,
        username: '', // 姓名
        idcard: '', // 身份证号码
        mobile: '', // 手机号码
        code: '', // 验证码
        agree: true, // 是否同意协议
        isSave: 1,
        hasSendCode: false,
        isClickCode: false,
        sending: false,
        countNum: COUNTSECEND,
        countTimer: null,
        agreeData: {},
        submiting: false, // 是否在提交中
        blankShow: false,
        clearShow: [],
        clearTimer: null,
        isCardApply: false
			}
		},
    computed: {
    	config() {
    		return this.$store.state.config
    	}
    },
    onShow () {
      // 是否处于验证码获取倒计时状态
      if (uni.getStorageInfoSync('addCodeStamp')) {
        let oldtime = uni.getStorageInfoSync('addCodeStamp')
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
		methods: {
			hide() {
        this.isShow = false
        this.$emit('close')
      },
      callPhone(num) {
        uni.makePhoneCall({
        	phoneNumber: num
        })
      },
      checkAgree() {
        this.agree = !this.agree
      },
      showAgree() {
        this.agreeData = {
          show: true
        }
      },
      checkSave() {
        if (this.isSave === 0) {
          this.isSave = 1
        } else {
          this.isSave = 0
        }
      },
      sendCode() {
        if (this.isClickCode) return
        if (!this.$utils.validatePhone(this.mobile)) {
          this.error = {
            msg: '请输入正确的手机号码',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else {
          this.isClickCode = true
          if (!this.hasSendCode) this.hasSendCode = true
          this.$http({
            url: this.$apis.phone,
            method: 'POST',
            data: {
              'type': 3,
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
                uni.setStorageSync('addCodeStamp', (new Date().getTime()).toString())
              } else {
              	this.error = {
              		msg: data.message,
              		type: true
              	}
              	clearTimeout(this.errorTimer)
              	this.errorTimer = setTimeout(() => {
              		this.error = {
              			msg: this.errorDefault,
              			type: false
              		}
              	}, 2000)
              	this.sending = false
              	this.isClickCode = false
              }
            }
          })
        }
      },
      confirm() {
        if (!this.$utils.validateName(this.username)) {
          this.error = {
            msg: '请输入正确的姓名',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else if (!this.$utils.validateIdCard(this.idcard)) {
          this.error = {
            msg: '请输入正确的身份证号码',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else if (!this.$utils.validatePhone(this.mobile)) {
          this.error = {
            msg: '请输入正确的手机号码',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else if (!this.hasSendCode) {
          this.error = {
            msg: '验证码已失效，请重新发送',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else if (this.code.length <= 0) {
          this.error = {
            msg: '请输入验证码',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else if (!this.agree) {
          this.error = {
            msg: '请阅读并勾选《' + this.$store.state.config.system_nick_name + '用户协议》',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: this.errorDefault,
              type: false
            }
          }, 2000)
        } else {
          if (this.submiting) return
          this.confirmState = 1
        }
      },
      submit() {
        if (this.submiting) return
        this.submiting = true
        switch (this.type) {
          case 'xyk':
            if (this.isCardApply) {
              this.$http({
                url: this.$apis.create,
                method: 'POST',
                data: {
                  name: this.username,
                  id_card: this.idcard,
                  mobile: this.mobile,
                  verify_code: this.code,
                  card_id: this.productId,
                  is_save: this.isSave
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                    uni.removeStorageSync('addCodeStamp')
                  	this.hide()
                  	this.submiting = false
                  	this.$emit('success')
                    setTimeout(() => {
                      uni.setStorageSync('webSrc', data.data.apply_link)
                    	this.$navigateTo({
                    		url: '/pages/web/index'
                    	})
                    }, 50)
                  } else {
                  	this.error = {
                  		msg: data.message ? data.message : '申请失败',
                  		type: true
                  	}
                  	clearTimeout(this.errorTimer)
                  	this.errorTimer = setTimeout(() => {
                  		this.error = {
                  			msg: this.errorDefault,
                  			type: false
                  		}
                  	}, 2000)
                  	this.code = ''
                  	this.submiting = false
                  	this.confirmState = 0
                  }
                }
              })
            } else {
              this.$http({
                url: this.$apis.create,
                method: 'POST',
                data: {
                  name: this.username,
                  id_card: this.idcard,
                  mobile: this.mobile,
                  verify_code: this.code,
                  bank_id: this.productId,
                  is_save: this.isSave
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                    uni.removeStorageSync('addCodeStamp')
                    this.hide()
                    this.submiting = false
                    this.$emit('success')
                    setTimeout(() => {
                      uni.setStorageSync('webSrc', data.data.apply_link)
                    	this.$navigateTo({
                    		url: '/pages/web/index'
                    	})
                    }, 50)
                  } else {
                    this.error = {
                      msg: data.message ? data.message : '申请失败',
                      type: true
                    }
                    clearTimeout(this.errorTimer)
                    this.errorTimer = setTimeout(() => {
                      this.error = {
                        msg: this.errorDefault,
                        type: false
                      }
                    }, 2000)
                    this.code = ''
                    this.submiting = false
                    this.confirmState = 0
                  }
                }
              })
            }
            break
          case 'bx':
            this.$http({
              url: this.$apis.insuranceOrder,
              method: 'POST',
              data: {
                name: this.username,
                id_card: this.idcard,
                mobile: this.mobile,
                verify_code: this.code,
                id: this.productId,
                is_save: this.isSave
              },
              cb: (err, data) => {
                if (!err && data.success) {
                	uni.removeStorageSync('addCodeStamp')
                	this.hide()
                	this.submiting = false
                	this.$emit('success')
                  setTimeout(() => {
                    uni.setStorageSync('webSrc', this.link ? this.link : data.data.apply_link)
                  	this.$navigateTo({
                  		url: '/pages/web/index'
                  	})
                  }, 50)
                } else {
                	this.error = {
                		msg: data.message ? data.message : '申请失败',
                		type: true
                	}
                	clearTimeout(this.errorTimer)
                	this.errorTimer = setTimeout(() => {
                		this.error = {
                			msg: this.errorDefault,
                			type: false
                		}
                	}, 2000)
                	this.code = ''
                	this.submiting = false
                	this.confirmState = 0
                }
              }
            })
            break
          case 'dk':
            this.$http({
              url: this.$apis.loanOrder,
              method: 'POST',
              data: {
                name: this.username,
                id_card: this.idcard,
                mobile: this.mobile,
                verify_code: this.code,
                id: this.productId,
                is_save: this.isSave
              },
              cb: (err, data) => {
                if (!err && data.success) {
                	uni.removeStorageSync('addCodeStamp')
                	this.hide()
                	this.submiting = false
                	this.$emit('success')
                	setTimeout(() => {
                    uni.setStorageSync('webSrc', this.link ? this.link : data.data.apply_link)
                		this.$navigateTo({
                			url: '/pages/web/index'
                		})
                	}, 50)
                } else {
                	this.error = {
                		msg: data.message ? data.message : '申请失败',
                		type: true
                	}
                	clearTimeout(this.errorTimer)
                	this.errorTimer = setTimeout(() => {
                		this.error = {
                			msg: this.errorDefault,
                			type: false
                		}
                	}, 2000)
                	this.code = ''
                	this.submiting = false
                	this.confirmState = 0
                }
              }
            })
            break
        }
      }
		},
		watch: {
			addData: function (val) {
				this.isShow = val.show
        this.type = val.type
        this.confirmState = val.state
        this.productId = val.productId
        this.link = val.link
        this.username = ''
        this.idcard = ''
        this.mobile = ''
        this.code = ''
        this.agree = true
        this.isSave = 1
        this.isCardApply = val.card
        switch (this.type) {
          case 'xyk':
            this.errorDefault = '请填写申请人信息(必须与信用卡申请列表所填信息一致)'
            break
          case 'bx':
            this.errorDefault = '请填写投保人信息(必须与保险申请列表所填信息一致)'
            break
          case 'dk':
            this.errorDefault = '请填写贷款人信息(必须与贷款申请列表所填信息一致)'
            break
        }
        this.error = {
          msg: this.errorDefault,
          type: false
        }
			},
      idcard: function (val) {
        this.idcard = val.replace(/x/g, 'X')
      }
		}
	}
</script>

<style lang="scss" scoped>
  @import '../common/var';
  .pop-con-1{
    height: 100%; border-radius: 0;
  }
  .box{
    height: calc(100% - 120upx);
    .pop-title{
      height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color; border-bottom: $border-1;
    }
    .msg{
      height: 64upx; padding: 0 30upx; font-size: $font-size-26; line-height: 64upx; color: $color-gray; border-bottom: $border-1;
      &.err{
        color: $color-err;
      }
    }
    .item{
      align-items: center; height: 128upx; padding: 0 30upx; border-bottom: $border-1;
      .input-icon{
        width: 80upx; height: 80upx; margin-right: 40upx;
      }
      .input-box-code{
        margin-right: 184upx;
      }
      input{
        width: 100%; height: 64upx; font-size: $font-size-32; font-weight: 700; color: $default-color;
      }
      .send-code{
        top: 50%; right: 30upx; width: 144upx; height: 48upx; margin-top: -24upx; font-size: 22upx; line-height: 48upx;
        .btn{
          line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: 48upx;
        }
        .text{
          line-height: 48upx; color: $color-gray; background-color: $color-disabled; border-radius: 48upx;
        }
      }
    }
    .info{
      padding: 20upx 30upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
      .name{
        width: 120upx;
      }
    }
  }
  .agreement{
    align-items: center; height: 64upx; padding: 0 30upx; font-size: $font-size-24; color: $color-gray; border-top: $border-1;
    image{
      width: 48upx; height: 48upx; margin-right: 8upx;
    }
  }
  .tips{
    padding: 20upx 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
    text{
      margin: 0 5upx; color: $color; text-decoration: underline;
    }
  }
</style>
