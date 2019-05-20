<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="info uni-ovh">
          <view class="info-lists">
            <view class="item avatar uni-flex">
              <text>头像</text>
              <image :src="userInfo.avatar_url ? userInfo.avatar_url : defaultAvatar"></image>
            </view>
            <view class="item uni-flex">
              <text>昵称</text>
              {{ userInfo.username }}
            </view>
            <view class="item uni-flex">
              <text>ID</text>
              {{ userInfo.id }}
            </view>
            <view class="item uni-flex" @click="clickRole">
              <text>当前职务</text>
              <view class="uni-flex">
                <toDecima :str="role" :type="4"></toDecima>
                <view class="strong" v-if="role < 4">{{ roleTips }}</view>
                <view v-else>{{ roleTips }}</view>
                <image src="../../static/images/icon/icon-more.png" mode="" class="icon-more" v-if="hasArrow"></image>
              </view>
            </view>
            <view class="item uni-flex" @click="gotoDeposit" v-if="userInfo.role >= 3 && userInfo.agent_type === 2">
              <text>押金退还</text>
              <view class="uni-flex">
                <view class="strong">去退押金</view>
                <image src="../../static/images/icon/icon-more.png" mode="" class="icon-more"></image>
              </view>
            </view>
          </view>
          <view class="progress-box uni-flex uni-column uni-box" v-if="role >= 1 && role <= 3">
            <view class="explain">根据最新的升级规则，需<label v-if="pregressArr.child_toward">锁粉<text>{{ pregressArr.child_toward }}</text>人，</label>邀请<text>{{ pregressArr.banker_toward }}名VIP</text>即可升级为<toDecima :str="(role + 1)" :type="4" :color="1"></toDecima></view>
            <view class="explain">您当前的升级进度</view>
            <view class="details-box uni-flex">
              <view class="details-con uni-flex-item uni-flex uni-column" v-if="pregressArr.child_toward">
                <view class="big">{{ pregressArr.child }} 人</view>
                <view>锁粉</view>
              </view>
              <view class="details-con uni-flex-item uni-flex uni-column">
                <view class="big">{{ pregressArr.banker }} 名</view>
                <view>发展VIP</view>
              </view>
            </view>
          </view>
          <view class="info-lists">
            <view class="item uni-flex" @click="gotoReal">
              <text>实名认证</text>
              <view class="uni-flex">
                <view v-if="isReal">已认证</view>
                <view class="strong" v-else>去认证</view>
                <image src="../../static/images/icon/icon-more.png" mode="" class="icon-more" v-if="!isReal"></image>
              </view>
            </view>
            <view class="item uni-flex" v-if="isReal">
              <text>姓名</text>
              {{ userInfo.real_name ? userInfo.real_name : '尚未实名' }}
            </view>
            <view class="item uni-flex" v-if="isReal">
              <text>身份证</text>
              {{ userInfo.id_card ? userInfo.id_card : '尚未实名' }}
            </view>
            <view class="item uni-flex" @click="bindWx" v-if="showBindwx">
              <text>绑定微信</text>
              <view class="uni-flex">
                <view v-if="userInfo.is_bind_wx">已绑定</view>
                <view class="strong" v-else>去绑定</view>
                <image src="../../static/images/weixin.png" mode="" class="icon-wx"></image>
              </view>
            </view>
          </view>
          <view class="info-lists">
            <view class="item uni-flex" @click="editInfo('mobile')">
              <text>手机号</text>
              <view class="uni-flex">{{ userInfo.mobile ? userInfo.mobile : '去绑定' }}<image src="../../static/images/icon/icon-more.png" mode="" class="icon-more" v-if="!userInfo.mobile"></image></view>
            </view>
            <view class="item uni-flex" @click="editInfo('wx')">
              <text>个人微信号</text>
              <view class="uni-flex">{{ userInfo.wx_number ? userInfo.wx_number : '未设置' }}<image src="../../static/images/icon/icon-more.png" mode="" class="icon-more" v-if="!userInfo.wx_number"></image></view>
            </view>
          </view>
          <view class="upload">
            <view class="tit">个人微信二维码（点击上传）</view>
            <view class="upload-con uni-flex uni-column">
              <view class="btn-upload uni-pr" :class="{'has': userInfo.wx_qrcode_url}">
                <view class="upload-input uni-pa uni-flex" @click="chooseImg('wx')">
                  <image src="/static/images/icon/icon-add.png" mode=""></image>
                </view>
                <view class="picture">
                  <image :src="userInfo.wx_qrcode_url" v-if="userInfo.wx_qrcode_url" mode="widthFix"></image>
                </view>
              </view>
              <view class="text uni-txc">上传您的<text>个人微信二维码</text>，方便您的客户和下属VIP联系您，解答他们的问题，方便沟通。</view>
            </view>
          </view>
          <view class="upload">
            <view class="tit">您创建的微信群二维码（点击上传）</view>
            <view class="upload-con uni-flex uni-column">
              <view class="btn-upload uni-pr" :class="{'has': userInfo.wxq_qrcode_url}">
                <view class="upload-input uni-pa uni-flex" @click="chooseImg('wxq')">
                  <image src="/static/images/icon/icon-add.png" mode=""></image>
                </view>
                <view class="picture">
                  <image :src="userInfo.wxq_qrcode_url" v-if="userInfo.wxq_qrcode_url" mode="widthFix"></image>
                </view>
              </view>
              <view class="text uni-txc">如果你创建了微信群来维护服务您的客户，可以将群二维码上传到这里方便您的客户扫码入群。<text>（微信群二维码每七天会失效，请及时更新）</text></view>
            </view>
          </view>
          <view class="info-lists-2" v-if="showForGet">
            <view class="item uni-flex" @click="editInfo('password')">修改密码</view>
          </view>
          <view class="info-lists-2">
            <view class="item uni-flex err" @click="logout()">退出登录</view>
          </view>
        </view>
			</scroll-view>
		</view>
    <view class="pop pop-edit" v-show="editShow">
      <view class="mask" @click="hideEditInfo"></view>
      <view class="pop-con">
        <view class="write">
          <view class="pop-title uni-box">{{ popEditTitle }}</view>
          <view class="msg uni-box" v-show="error.msg" :class="{'err': error.type}">{{ error.msg }}</view>
          <view class="lists">
            <view class="item uni-flex uni-box" v-if="editType === 'real'">
            	<image class="input-icon" src="/static/images/icon/icon-user.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="realname" placeholder="请输入姓名" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box" v-if="editType === 'real'">
            	<image class="input-icon" src="/static/images/icon/icon-idcard.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="idcard" placeholder="请输入您的身份证" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-show="editType === 'mobile'">
            	<image class="input-icon" src="/static/images/icon/icon-phone.png"></image>
            	<view class="input-box input-box-code uni-flex-item uni-pr">
            		<input type="number" v-model="mobile" placeholder="请输入要绑定的手机号" placeholder-class="input-placeholder" />
            	</view>
            	<view class="send-code uni-pa uni-txc">
            		<view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
            		<view class="text" v-show="sending">{{ countNum }}s</view>
            	</view>
            </view>
            <view class="item uni-flex uni-box" v-if="editType === 'mobile'">
            	<image class="input-icon" src="/static/images/icon/icon-code.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="mobileCode" placeholder="请输入验证码" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box" v-if="editType === 'wx'">
            	<image class="input-icon" src="/static/images/icon/icon-wx.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="wx" placeholder="请输入您要修改的微信号" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box" v-if="editType === 'password'">
            	<image class="input-icon" src="/static/images/icon/icon-code.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="password1" password="true" placeholder="请输入新密码" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box" v-if="editType === 'password'">
            	<image class="input-icon" src="/static/images/icon/icon-code.png"></image>
            	<view class="input-box uni-flex-item uni-pr">
            		<input type="text" v-model="password2" password="true" placeholder="请再次输入新密码" placeholder-class="input-placeholder" />
            	</view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-show="editType === 'password'">
            	<image class="input-icon" src="/static/images/icon/icon-code.png"></image>
            	<view class="input-box input-box-code uni-flex-item uni-pr">
            		<input type="number" v-model="passwordCode" placeholder="请输入验证码" placeholder-class="input-placeholder" />
            	</view>
            	<view class="send-code uni-pa uni-txc">
            		<view class="btn uni-box uni-txc" @click="sendCode2" v-show="!sending2" :class="{'disabled': isClickCode2}">获取验证码</view>
            		<view class="text" v-show="sending2">{{ countNum2 }}s</view>
            	</view>
            </view>
          </view>
        </view>
        <view class="operation uni-flex uni-box">
        	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        		<view class="uni-flex-item gray" @click="hideEditInfo">取消</view>
        		<view class="uni-flex-item" :class="{'disabled': editing}" @click="submit">完成</view>
        	</view>
        </view>
      </view>
    </view>
	</view>
</template>

<script>
  const COUNTSECEND = 60
  
	export default {
		data() {
			return {
				error: {
          type: 0,
          msg: ''
        },
        errorTimer: null,
        uploadImg: '',
        uploading: false,
        editShow: false,
        editType: null,
        realname: '',
        idcard: '',
        mobile: '',
        mobileCode: '',
        hasSendCode: false,
        isClickCode: false,
        sending: false,
        countNum: COUNTSECEND,
        countTimer: null,
        wx: '',
        password1: '',
        password2: '',
        passwordCode: '',
        hasSendCode2: false,
        isClickCode2: false,
        sending2: false,
        countNum2: COUNTSECEND,
        countTimer2: null,
        editing: false,
        pregressArr: {
          apply: 0,
          apply_toward: 0,
          banker: 0,
          banker_toward: 0,
          canLevelUp: false
        }
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      role() {
        return this.userInfo.role
      },
      hasArrow() {
        return this.role < 4 || this.userInfo.agent_type === 2
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      roleTips() {
        if (this.role < 4 && this.role > 1) {
          return '立即升级'
        } else if (this.role === 4) {
          if (this.userInfo.agent_type === 2) {
            return '付费升级'
          } else {
            return '完成任务升级'
          }
        } else {
          return '升级VIP'
        }
      },
      isReal() {
        return this.userInfo.is_real === 1
      },
      popEditTitle() {
        if (this.editType === 'real') return '实名认证'
        if (this.editType === 'password') return '修改密码'
        if (this.editType === 'mobile') return '绑定手机'
        return '请填写需要修改的信息'
      },
      showForGet() {
        return (this.$store.state.loginType === this.$constant.LOGIN_TYPE_MOBILE) || (this.$store.state.loginType === this.$constant.LOGIN_TYPE_WECHAT && this.userInfo.mobile)
      },
      showBindwx() {
        return this.$store.state.loginType === this.$constant.LOGIN_TYPE_MOBILE
      }
    },
		onLoad() {
      // 升级进度
      if (this.role >= 1 && this.role <= 3) {
        this.$http({
          url: this.$apis.sxProgress,
          method: 'GET',
          data: {
            id: this.userInfo.id
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.pregressArr = data.data
            } else {
              uni.showToast({
              	title: '获取升级进度数据失败',
                icon: 'none'
              })
            }
          }
        })
      }
      // 显示实名认证弹窗
      if (uni.getStorageSync('real')) {
        this.gotoReal()
        uni.removeStorageSync('real')
      }
		},
    onShow() {
    	// 是否处于验证码获取倒计时状态
    	if (uni.getStorageSync('accountCodeStamp')) {
    	  let oldtime = uni.getStorageSync('accountCodeStamp')
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
      if (uni.getStorageSync('accountCodeStamp2')) {
        let oldtime = uni.getStorageSync('accountCodeStamp2')
        let nowtime = new Date().getTime()
        let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
        if (cha < COUNTSECEND) {
          this.sending2 = true
          this.countNum2 = COUNTSECEND - cha
          this.countTimer2 = setInterval(() => {
            this.countNum2 --
            if (this.countNum2 <= 0) {
              clearInterval(this.countTimer2)
              this.countNum2 = COUNTSECEND
              this.sending2 = false
              this.isClickCode2 = false
            }
          }, 1000)
          this.hasSendCode2 = true
        }
      }
    },
    methods: {
      editInfo(type) {
        if (type === 'mobile' && this.userInfo.mobile) {
          return
//           this.$navigateTo({
//           	url: '/pages/mine/agent'
//           })
        } else {
          this.editType = type
          this.realname = ''
          this.idcard = ''
          this.mobile = ''
          this.mobileCode = ''
          this.wx = ''
          this.error = {
            msg: '',
            type: false
          }
          this.editShow = true
        }
      },
      hideEditInfo(cb) {
        this.editShow = false
        if (typeof cb === 'function') cb()
      },
      sendCode() {
        if (this.isClickCode) return
        if (!this.$utils.validatePhone(this.mobile)) {
          this.error = {
            msg: '手机号码格式错误',
            type: true
          }
          clearTimeout(this.errorTimer)
          this.errorTimer = setTimeout(() => {
            this.error = {
              msg: '',
              type: false
            }
          }, 2000)
        } else {
          this.isClickCode = true
          if (!this.hasSendCode) this.hasSendCode = true
          this.error = {
            msg: '验证码已发送至 ' + this.mobile,
            type: false
          }
          this.$http({
            url: this.$apis.phone,
            method: 'POST',
            data: {
              type: 5,
              mobile: this.mobile
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
                uni.setStorageSync('accountCodeStamp', (new Date().getTime()).toString())
              } else {
                this.error = {
                  msg: data.message,
                  type: true
                }
                clearTimeout(this.errorTimer)
                this.errorTimer = setTimeout(() => {
                  this.error = {
                    msg: '',
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
      sendCode2() {
        if (this.isClickCode2) return
        this.isClickCode2 = true
        if (!this.hasSendCode2) this.hasSendCode2 = true
        this.error = {
          msg: '验证码已发送至 ' + this.userInfo.mobile,
          type: false
        }
        this.$http({
          url: this.$apis.code,
          method: 'POST',
          data: {
            type: 1,
            mobile: this.userInfo.mobile
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.sending2 = true
              this.countTimer2 = setInterval(() => {
                this.countNum2 --
                if (this.countNum2 <= 0) {
                  clearInterval(this.countTimer2)
                  this.countNum2 = COUNTSECEND
                  this.sending2 = false
                  this.isClickCode2 = false
                }
              }, 1000)
              // 保存发送时间
              uni.setStorageSync('accountCodeStamp2', (new Date().getTime()).toString())
            } else {
              this.error = {
                msg: data.message,
                type: true
              }
              clearTimeout(this.errorTimer)
              this.errorTimer = setTimeout(() => {
                this.error = {
                  msg: '',
                  type: false
                }
              }, 2000)
              this.sending2 = false
              this.isClickCode2 = false
            }
          }
        })
      },
      submit() {
        let _this = this
        if (_this.editing) return false
        let infodata = {
          'real_name': '',
          'id_card': '',
          'verify_code': '',
          'mobile': '',
          'wx_number': '',
          'wx_qrcode_url': '',
          'wxq_qrcode_url': ''
        }
        if (_this.editType === 'real') {
          // 实名
          if (!this.$utils.validateName(_this.realname)) {
            _this.error = {
              msg: '请输入正确的姓名',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else if (!this.$utils.validateIdCard(_this.idcard)) {
            _this.error = {
              msg: '请输入正确的身份证号码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else {
            let realInfodata = {
              'real_name': '',
              'id_card': ''
            }
            realInfodata.real_name = _this.realname
            realInfodata.id_card = _this.idcard
            _this.editing = true
            this.$http({
              url: this.$apis.realname,
              method: 'POST',
              data: realInfodata,
              cb: (err, data) => {
                if (!err && data.success) {
                  _this.hideEditInfo(() => {
                    uni.showModal({
                    	title: '提示',
                      content: '实名成功',
                      showCancel: false,
                      confirmText: '确认',
                      success: res => {
                      	if (res.confirm) {
                          _this.updateInfo()
                        }
                      }
                    })
                  })
                } else {
                  _this.error = {
                    msg: data && data.message ? data.message : '实名失败，请稍后再试',
                    type: true
                  }
                  clearTimeout(_this.errorTimer)
                  _this.errorTimer = setTimeout(() => {
                    _this.error = {
                      msg: '',
                      type: false
                    }
                  }, 2000)
                }
                _this.editing = false
              }
            })
          }
        } else if (_this.editType === 'mobile') {
          // 修改手机
          if (!this.$utils.validatePhone(_this.mobile)) {
            _this.error = {
              msg: '手机号码格式错误',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else if (_this.mobileCode.length <= 0) {
            _this.error = {
              msg: '请输入验证码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else {
            infodata.mobile = _this.mobile
            infodata.verify_code = _this.mobileCode
            _this.editing = true
            this.$http({
              url: this.$apis.updateInfo,
              method: 'PUT',
              data: infodata,
              cb: (err, data) => {
                if (!err && data.success) {
                  _this.hideEditInfo(() => {
                    uni.showModal({
                      title: '提示',
                      content: '保存成功',
                      showCancel: false,
                      confirmText: '确认',
                      success: res => {
                        if (res.confirm) {
                          _this.updateInfo()
                        }
                      }
                    })
                  })
                  uni.removeStorageSync('accountCodeStamp')
                } else {
                  _this.error = {
                    msg: data.message,
                    type: true
                  }
                  clearTimeout(_this.errorTimer)
                  _this.errorTimer = setTimeout(() => {
                    _this.error = {
                      msg: '',
                      type: false
                    }
                  }, 2000)
                }
                _this.editing = false
              }
            })
          }
        } else if (_this.editType === 'wx') {
          // 修改微信
          if (!this.$utils.validateWeixin(_this.wx)) {
            _this.error = {
              msg: '请输入正确的微信号',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else {
            infodata.wx_number = _this.wx
            _this.editing = true
            this.$http({
              url: this.$apis.updateInfo,
              method: 'PUT',
              data: infodata,
              cb: (err, data) => {
                if (!err && data.success) {
                  _this.hideEditInfo(() => {
                    uni.showModal({
                      title: '提示',
                      content: '保存成功',
                      showCancel: false,
                      confirmText: '确认',
                      success: res => {
                        if (res.confirm) {
                          _this.updateInfo()
                        }
                      }
                    })
                  })
                } else {
                  _this.error = {
                    msg: data.message,
                    type: true
                  }
                  clearTimeout(_this.errorTimer)
                  _this.errorTimer = setTimeout(() => {
                    _this.error = {
                      msg: '',
                      type: false
                    }
                  }, 2000)
                }
                _this.editing = false
              }
            })
          }
        } else if (_this.editType === 'password') {
          if (_this.password1.length < 6 || _this.password1.length > 16) {
            _this.error = {
              msg: '请输入6位到16位的密码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else if (_this.password2 !== _this.password1) {
            _this.error = {
              msg: '请再次输入相同的新密码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else if (!_this.hasSendCode2) {
            _this.error = {
              msg: '请点击获取验证码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else if (_this.passwordCode.length <= 0) {
            _this.error = {
              msg: '请输入验证码',
              type: true
            }
            clearTimeout(_this.errorTimer)
            _this.errorTimer = setTimeout(() => {
              _this.error = {
                msg: '',
                type: false
              }
            }, 2000)
          } else {
            this.$http({
              url: this.$apis.resetPassword,
              method: 'POST',
              data: {
                password: this.password1,
                mobile: this.userInfo.mobile,
                verify_code: this.passwordCode,
            		repeat_password: this.password2
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  this.$store.commit('logout')
                  uni.showModal({
                  	title: '修改成功',
                    content: '点击确认重新登录',
                    showCancel: false,
                    success: () => {
                      uni.reLaunch({
                      	url: '/pages/login/index'
                      })
                    }
                  })
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
      },
      bindWx() {
        if (this.userInfo.is_bind_wx) return
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
                  	title: '正在获取微信信息',
                  	mask: true
                  })
                  uni.getUserInfo({
                  	provider: 'weixin',
                    success: infoRes => {
                      this.$http({
                        url: this.$apis.wxBind,
                        method: 'POST',
                        data: {
                          userInfo: JSON.stringify(infoRes.userInfo)
                        },
                        cb: (err, data) => {
                          if (!err && data.success) {
                            uni.hideLoading()
                            this.updateInfo()
                          } else {
                            uni.showToast({
                            	title: '绑定失败：' + data.message,
                              icon: 'none'
                            })
                          }
                          uni.hideLoading()
                        }
                      })
                    },
                    fail: err => {
                    	uni.hideLoading()
                    	uni.showToast({
                    		title: '绑定失败：' + JSON.stringify(err),
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
      chooseImg(utype) {
        uni.chooseImage({
        	count: 1,
          sizeType: ['compressed'],
          success: res => {
            if (res.tempFiles[0].size / 1024 / 1024 > 2) {
              uni.showModal({
              	title: '提示',
                content: '请选择小于2Mb的图片',
                showCancel: false,
                confirmText: '知道了'
              })
              return
            }
            uni.showLoading({
            	title: '正在上传',
            	mask: true
            });
            uni.uploadFile({
            	url: this.$apis.uploadPic,
              header: {
                Authorization: this.$store.state.jwt
              },
              fileType: 'image',
              filePath: res.tempFilePaths[0],
              name: 'image',
              formData: {
                type: 'wx_qrcode'
              },
              success: res2 => {
                let resData = JSON.parse(res2.data)
                if (!resData.success) {
                  uni.showToast({
                  	title: '图片上传失败，请重新上传',
                    icon: 'none'
                  })
                  uni.hideLoading()
                  return
                }
                let infodata = {}
                if (utype === 'wxq') {
                  infodata.wxq_qrcode_url = resData.data.key
                } else {
                  infodata.wx_qrcode_url = resData.data.key
                }
                this.$http({
                  url: this.$apis.updateInfo,
                  method: 'PUT',
                  data: infodata,
                  cb: (err, data) => {
                    if (!err && data.success) {
                      this.updateInfo()
                    } else {
                      uni.showToast({
                      	title: data.message,
                        icon: 'none'
                      })
                    }
                    uni.hideLoading()
                  }
                })
              },
              fail: () => {
              	uni.showToast({
              		title: '图片上传失败，请重新上传',
              	  icon: 'none'
              	})
                uni.hideLoading()
              }
            })
          },
          fail: () => {
          	uni.showToast({
          		title: '选择图片失败，请稍候再试',
              icon: 'none'
          	})
          }
        })
      },
      clickRole() {
        if (this.role <= 0) {
          // 临时用户去升级
          this.$navigateTo({
          	url: '/pages/mine/agent'
          })
        } else if (this.role > 0 && this.role <= 3) {
          this.$navigateTo({
          	url: '/pages/index/member'
          })
        }
      },
      gotoDeposit() {
        this.$navigateTo({
        	url: '/pages/mine/deposit'
        })
      },
      gotoReal() {
        if (!this.isReal) {
          this.editInfo('real')
        }
      },
      updateInfo() {
        this.$getInfo()
      },
      logout() {
        uni.showModal({
        	title: '退出确认',
          content: '您确认退出登录吗？',
          success: res => {
          	if (res.confirm) {
              this.$store.commit('logout')
              uni.reLaunch({
              	url: '/pages/login/index'
              })
            }
          }
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .info-lists{
    margin-bottom: 20upx; background-color: $color-white;
    .item{
      justify-content: space-between; align-items: center; height: 96upx; padding: 0 30upx; font-size: $font-size-28; font-weight: 700; color: $default-color; border-bottom: $border-1;
      &.avatar{
        height: 160upx;
        image{
          width: 108upx; height: 108upx;
        }
      }
      .uni-flex{
        align-items: center; font-weight: normal; color: $color-gray;
        view{
          display: flex; align-items: center; box-sizing: border-box; height: 36upx; padding: 0 10upx; margin-left: 20upx; font-size: $font-size-20; font-weight: normal; color: $color; border: $border-1; border-color: $color; border-radius: $border-radius;
          &.strong{
            padding: 0 20upx; color: $default-color; background-color: $color-3; border: none; border-radius: 36upx;
          }
        }
        .icon-more{
          width: 24upx; height: 48upx; margin-left: 6upx;
        }
        .icon-wx{
          width: 48upx; height: 48upx; margin-left: 6upx;
        }
      }
    }
  }
  .info-lists-2{
    margin-top: 20upx;
    .item{
      justify-content: center; align-items: center; height: 96upx; padding: 0 30upx; font-size: $font-size-28; font-weight: 700; color: $default-color; background-color: $color-white;  border-bottom: $border-1;
      &.err{
        color: $color-err;
      }
    }
  }
  .upload{
    padding: 0 .3rem; background-color: $color-white; border-top: $border-1;
    .tit{
      font-weight: 700; line-height: 96upx;
    }
    .upload-con{
      align-items: center;
      .btn-upload{
        width: 320upx; height: auto; min-height: 320upx; background-color: $default-bg-color; border: 1px solid rgba(255, 182, 0, 1); box-shadow: 0 0 .08rem .08rem rgba(255, 182, 0, .25);
        .upload-input{
          top: 0; left: 0; z-index: 3; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 320upx; opacity: 1;
          image{
            width: 72upx; height: 72upx;
          }
        }
        .picture{
          width: 100%; background-color: $color-white;
          image{
            width: 100%;
          }
        }
        &.has{
          min-height: auto;
          .upload-input{
            opacity: 0;
          }
        }
      }
      .text{
        width: 564upx; padding: 30upx 0; font-size: $font-size-24; font-weight: normal; line-height: 34upx; color: $color-gray;
        text{
          color: $color;
        }
      }
    }
  }
  .pop-edit{
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
</style>
