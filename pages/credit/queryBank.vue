<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
				<view class="banner" v-if="bankInfo && bankInfo.bananer_url">
					<view class="item">
						<image :src="bankInfo.bananer_url" mode="widthFix"></image>
					</view>
				</view>
        <!-- 填写查询信息 S -->
        <view class="write">
          <view class="tit">请填写申请人信息查询</view>
          <view class="lists">
            <view class="item uni-flex uni-box" v-if="hasName">
              <image class="input-icon" src="../../static/images/icon/icon-user.png"></image>
              <view class="input-box uni-flex-item uni-pr">
                <input type="text" placeholder="请输入姓名" placeholder-class="input-placeholder" :class="{'gray': !isEdit}" v-model="username">
              </view>
            </view>
            <view class="item uni-flex uni-box">
              <image class="input-icon" src="../../static/images/icon/icon-idcard.png"></image>
              <view class="input-box uni-flex-item uni-pr">
                <input type="idcard" placeholder="请输入身份证号码" placeholder-class="input-placeholder" :class="{'gray': !isEdit}" v-model="idcard">
              </view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-if="hasPhone">
              <image class="input-icon" src="../../static/images/icon/icon-phone.png"></image>
              <view class="input-box input-box-code uni-flex-item uni-pr">
                <input type="number" placeholder="请输入手机号码" placeholder-class="input-placeholder" :class="{'gray': !isEdit}" v-model="phone">
              </view>
              <view class="send-code uni-pa uni-txc">
              	<view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
              	<view class="text" v-show="sending">{{ countNum }}s</view>
              </view>
            </view>
            <view class="item uni-flex uni-box" v-if="hasPhone">
              <image class="input-icon" src="../../static/images/icon/icon-code.png"></image>
              <view class="input-box uni-flex-item uni-pr">
                <input type="text" v-model="phonecode" placeholder="请输入手机验证码" placeholder-class="input-placeholder" class="code-input">
              </view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-if="hasPic">
              <image class="input-icon" src="../../static/images/icon/icon-code.png"></image>
              <view class="code uni-pa uni-flex" @click="getBankCode">
                <view class="pic"><image :src="codeImg" v-if="codeImg" mode="aspectFit"></image></view>
                <image class="reset" src="../../static/images/icon/icon-reset.png"></image>
              </view>
              <view class="input-box input-box-piccode uni-flex-item uni-pr">
                <input type="text" v-model="piccode" placeholder="请输入图形验证码" placeholder-class="input-placeholder" class="code-input">
              </view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-if="onlyPhoneCode">
              <image class="input-icon" src="../../static/images/icon/icon-code.png"></image>
              <view class="input-box input-box-code uni-flex-item uni-pr">
                <input type="text" v-model="phonecodeOnly" placeholder="请输入手机验证码" placeholder-class="input-placeholder" class="code-input">
              </view>
              <view class="send-code uni-pa uni-txc">
              	<view class="btn uni-box uni-txc" @click="sendOnlyCode" v-show="!sending2" :class="{'disabled': isClickCode2}">发送验证码</view>
              	<view class="text" v-show="sending2">{{ countNum2 }}s</view>
              </view>
            </view>
            <view class="item uni-flex uni-box uni-pr" v-if="hasPhone2">
              <image class="input-icon" src="../../static/images/icon/icon-phone.png"></image>
              <view class="input-box input-box-code pr">
                <input type="number" placeholder="请输入手机号码" placeholder-class="input-placeholder" :class="{'gray': !isEdit}" v-model="phone">
              </view>
              <view class="send-code uni-pa uni-txc">
              	<view class="btn uni-box uni-txc" @click="sendCode" v-show="!sending" :class="{'disabled': isClickCode}">发送验证码</view>
              	<view class="text" v-show="sending">{{ countNum }}s</view>
              </view>
            </view>
            <view class="item uni-flex uni-box" v-if="hasPhone2">
              <image class="input-icon" src="../../static/images/icon/icon-code.png"></image>
              <view class="input-box pr">
                <input type="text" v-model="phonecode" placeholder="请输入手机验证码" placeholder-class="input-placeholder" class="code-input">
              </view>
            </view>
          </view>
          <view class="write-fot"></view>
        </view>
        <!-- 填写查询信息 E -->
        <!-- 提示 S -->
        <view class="tips">
          <view>温馨提示</view>
          <view>请填写申请人申请信用卡时提交的相关信息 。否则申请成功后，将无法获取相关奖励。</view>
        </view>
        <!-- 提示 E -->
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
    	<view class="left uni-flex">
    		<view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
    	</view>
    	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
    		<view class="uni-flex-item" :class="{'disabled': querying}" @click="clickQuery">查询进度</view>
    	</view>
    </view>
    <!-- 查询结果 S -->
    <view class="pop pop-result" v-show="resultFlag">
      <view class="mask" @click="hideResult"></view>
      <view class="pop-con">
        <view class="tit">{{ resTitle }}</view>
        <view class="text" v-if="!isSuccess">
          <view class="lists">
            <view class="item">未查询到申请记录可能有如下原因：</view>
            <view class="item">1、请确认填写的身份证或手机号是否与在银行官网申请所填资料一致；</view>
            <view class="item">2、请确认是否收到银行下发的申卡成功短信，并于收到短信后2工作日后查询；</view>
            <view class="item">3、银行网上数据还未同步，请耐心等待2-5个工作日后查询；</view>
            <view class="item">4、是否有去面签，面签后2-5个工作日后才可查询进度。</view>
          </view>
        </view>
        <view class="text" v-else>
          <view class="table txc">
            <view class="table-hd">
              <view class="tr uni-flex">
              	<text class="td-1 uni-flex uni-flex-item uni-box">申请卡种</text>
              	<text class="td-2 uni-flex uni-flex-item uni-box">申请日期</text>
              	<text class="td-3 uni-flex uni-flex-item uni-box">申请状态</text>
              	<text class="td-4 uni-flex uni-flex-item uni-box">其他说明</text>
              </view>
            </view>
            <scroll-view scroll-y class="table-bd">
            	<view class="tr uni-flex" v-for="(item, index) in resArr" :key="index">
            		<text class="td-1 uni-flex uni-flex-item uni-box">{{ item.bank_card_name }}</text>
            		<text class="td-2 uni-flex uni-flex-item uni-box">{{ item.bank_apply_time }}</text>
            		<text class="td-3 uni-flex uni-flex-item uni-box">{{ item.resText }}</text>
            		<text class="td-4 uni-flex uni-flex-item uni-box">{{ item.mark }}</text>
            	</view>
            </scroll-view>
          </view>
          <view class="lists">
            <view class="item">状态说明</view>
            <view class="item">已批卡：核卡成功，平台审核发放奖励条件中；</view>
            <view class="item">未通过：被银行拒绝或不满足平台条件； </view>
            <view class="item">审批中：银行数据还未同步或更新，请稍后查询。 </view>
          </view>
        </view>
        <view class="operation uni-flex uni-box">
        	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        		<view class="uni-flex-item" @click="hideResult">确认</view>
        	</view>
        </view>
      </view>
    </view>
    <!-- 查询结果 E -->
	</view>
</template>

<script>
  const COUNTSECEND = 60
  
	export default {
		data() {
			return {
				bankCode: '',
				bankInfo: null,
        username: '',
        applyId: '',
        idcard: '',
        phone: '',
        phonecode: '', // 填了手机号码之后，发送验证码
        phonecodeOnly: '', // 直接触发发送二维码
        piccode: '',
        codeImg: '',
        hasSendCode: false, // 填了手机号码之后，发送验证码
        hasSendCode2: false, // 直接触发发送二维码
        isClickCode: false, // 填了手机号码之后，发送验证码
        isClickCode2: false, // 直接触发发送二维码
        sending: false, // 填了手机号码之后，发送验证码
        sending2: false, // 直接触发发送二维码
        countNum: COUNTSECEND, // 填了手机号码之后，发送验证码
        countNum2: COUNTSECEND, // 直接触发发送二维码
        countTimer: null, // 填了手机号码之后，发送验证码
        countTimer2: null, // 直接触发发送二维码
        resultFlag: false,
        isSuccess: false,
        loading: false,
        resTitle: '查询结果',
        resArr: [],
        oldInfo: {
          username: null,
          idcard: null,
          phone: null
        },
        querying: false
			}
		},
    computed: {
      hasName() {
        let code = this.bankCode.toLowerCase()
        return code === 'hb' || code === 'ceb'
      },
      hasPhone() {
        let code = this.bankCode.toLowerCase()
        return code === 'boc' || code === 'hb' || code === 'citic' || code === 'pab' || code === 'cmb'
      },
      hasPhone2() {
        let code = this.bankCode.toLowerCase()
        return code === 'cgb'
      },
      onlyPhoneCode() {
        let code = this.bankCode.toLowerCase()
        return code === 'cmbc' || code === 'ceb' || code === 'bog'
      },
      hasPic() {
        let code = this.bankCode.toLowerCase()
        return code === 'bcm' || code === 'spd' || code === 'cmbc' || code === 'ceb' || code === 'cgb'
      },
      isEdit() {
        return !(this.oldInfo.username === this.username && this.oldInfo.idcard === this.idcard && this.oldInfo.phone === this.phone)
      }
    },
		onLoad(query) {
      this.bankCode = query.bankCode
      this.applyId = query.id
			this.$http({
        url: this.$apis.bankInfo,
        method: 'GET',
        data: {
          code: this.bankCode
        },
        cb: (err, data) => {
          if (!err && data) {
            this.bankInfo = data.data
          }
        }
      })
      // 如果是订单查询
      let queryInfo = uni.getStorageSync('queryInfo') ? JSON.parse(uni.getStorageSync('queryInfo')) : null
      if (queryInfo) {
        uni.removeStorageSync('queryInfo')
        this.oldInfo.username = queryInfo.name || null
        this.oldInfo.idcard = queryInfo.idcard || null
        this.oldInfo.phone = queryInfo.mobile || null
        this.username = queryInfo.name || ''
        this.idcard = queryInfo.idcard || ''
        this.phone = queryInfo.mobile || ''
      }
      // 如果有图形验证码，获取验证码
      if (this.hasPic) {
        this.getBankCode()
      }
      // 是否处于验证码获取倒计时状态
      if (uni.getStorageSync('QueryBankCodeStamp')) {
        let oldtime = uni.getStorageSync('QueryBankCodeStamp')
        let nowtime = new Date().getTime()
        let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
        if (cha < COUNTSECEND) {
          this.sending = true
          this.hasSendCode = true
          this.isClickCode = true
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
        }
      }
      if (uni.getStorageSync('QueryBankCodeStamp2')) {
        let oldtime = uni.getStorageSync('QueryBankCodeStamp2')
        let nowtime = new Date().getTime()
        let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
        if (cha < COUNTSECEND) {
          this.sending2 = true
          this.hasSendCode2 = true
          this.isClickCode2 = true
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
        }
      }
		},
    methods: {
      getBankCode(id) {
        this.codeImg = ''
        if (this.hasPic) {
          this.$http({
            url: this.$apis.bankCode,
            method: 'GET',
            data: {
              bankCode: this.bankCode,
              uid: this.$store.state.userInfo.id
            },
            cb: (err, data) => {
              if (!err && data.code === 0) {
              	this.codeImg = data.data + '?' + Math.random()
              } else {
                uni.showToast({
                	title: data ? data.message : '获取图形验证码失败',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          this.$http({
          	url: this.$apis.bankCode,
          	method: 'GET',
          	data: {
          		bankCode: 'SPD',
          		uid: this.$store.state.userInfo.id
          	},
          	cb: (err, data) => {
          		if (!err && data.code === 0) {
          			this.codeImg = data.data + '?' + Math.random()
          		} else {
          			uni.showToast({
          				title: data ? data.message : '获取图形验证码失败',
          				icon: 'none'
          			})
          		}
          	}
          })
        }
      },
      sendCode() {
        if (this.isClickCode) return
        // 如果是订单查询
        if (!this.isEdit) {
          if (this.hasPhone2 && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
              icon: 'none'
            })
            return
          }
          this.isClickCode = true
          if (!this.hasSendCode) this.hasSendCode = true
          this.$http({
            url: this.$apis.queryBank,
            method: 'GET',
            data: {
              bankCode: this.bankCode,
              uid: this.$store.state.userInfo.id,
              applyId: this.applyId,
              idCard: '',
              verifyCode: this.piccode,
              mobile: '',
              verifyMobileMsg: ''
            },
            cb: (err, data) => {
              if (!err && data.success) {
              	this.sending = true
                uni.showToast({
                	title: data && data.message ? data.message : '短信发送成功',
                  icon: 'none'
                })
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
                uni.setStorageSync('QueryBankCodeStamp', (new Date().getTime()).toString())
              } else {
                uni.showToast({
                	title: data && data.message ? data.message : '短信发送失败',
                	icon: 'none'
                })
              	this.sending = false
              	this.isClickCode = false
              }
            }
          })
        } else {
          if (this.hasPhone2 && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
            	icon: 'none'
            })
            return
          }
          if (!this.$utils.validateIdCard(this.idcard)) {
            uni.showToast({
            	title: '请输入正确的身份证号码',
            	icon: 'none'
            })
          } else if (!this.$utils.validatePhone(this.phone)) {
            uni.showToast({
            	title: '请输入正确的手机号码',
            	icon: 'none'
            })
          } else {
            this.isClickCode = true
            if (!this.hasSendCode) this.hasSendCode = true
            this.$http({
              url: this.$apis.queryBank,
              method: 'GET',
              data: {
                bankCode: this.bankCode,
                uid: this.$store.state.userInfo.id,
                applyId: '',
                idCard: this.idcard,
                verifyCode: this.piccode,
                mobile: this.phone,
                verifyMobileMsg: ''
              },
              cb: (err, data) => {
                if (!err && data.success) {
                	this.sending = true
                  uni.showToast({
                  	title: data && data.message ? data.message : '短信发送成功',
                  	icon: 'none'
                  })
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
                	uni.setStorageSync('QueryBankCodeStamp', (new Date().getTime()).toString())
                } else {
                  uni.showToast({
                  	title: data && data.message ? data.message : '短信发送失败',
                  	icon: 'none'
                  })
                	this.sending = false
                	this.isClickCode = false
                }
              }
            })
          }
        }
      },
      sendOnlyCode() {
        if (this.isClickCode2) return
        // 如果是订单查询
        if (!this.isEdit) {
          if (this.hasPic && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
            	icon: 'none'
            })
          } else {
            this.isClickCode2 = true
            if (!this.hasSendCode2) this.hasSendCode2 = true
            this.$http({
              url: this.$apis.queryBank,
              method: 'GET',
              data: {
                bankCode: this.bankCode,
                uid: this.$store.state.userInfo.id,
                applyId: this.applyId,
                idCard: '',
                verifyCode: this.piccode,
                mobile: this.phone,
                verifyMobileMsg: ''
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  uni.showToast({
                  	title: data.message,
                  	icon: 'none'
                  })
                  uni.removeStorageSync('QueryBankCodeStamp2')
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
                  uni.setStorageSync('QueryBankCodeStamp2', (new Date().getTime()).toString())
                } else {
                  uni.showToast({
                  	title: data.message,
                  	icon: 'none'
                  })
                	if (this.hasPic) {
                		this.getBankCode()
                	}
                	this.hasSendCode2 = false
                	this.sending2 = false
                	this.isClickCode2 = false
                }
              }
            })
          }
        } else {
          if (!this.$utils.validateIdCard(this.idcard)) {
            uni.showToast({
            	title: '请输入正确的身份证号码',
            	icon: 'none'
            })
          } else if (this.hasPic && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
            	icon: 'none'
            })
          } else {
            this.isClickCode2 = true
            if (!this.hasSendCode2) this.hasSendCode2 = true
            this.$http({
              url: this.$apis.queryBank,
              method: 'GET',
              data: {
                bankCode: this.bankCode,
                uid: this.$store.state.userInfo.id,
                applyId: '',
                idCard: this.idcard,
                verifyCode: this.piccode,
                mobile: this.phone,
                verifyMobileMsg: ''
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  uni.showToast({
                  	title: data.message,
                  	icon: 'none'
                  })
                  uni.removeStorageSync('QueryBankCodeStamp2')
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
                	uni.setStorageSync('QueryBankCodeStamp2', (new Date().getTime()).toString())
                } else {
                	uni.showToast({
                		title: data.message,
                		icon: 'none'
                	})
                	if (this.hasPic) {
                		this.getBankCode()
                	}
                	this.hasSendCode2 = false
                	this.sending2 = false
                	this.isClickCode2 = false
                }
              }
            })
          }
        }
      },
      clickQuery() {
        // 如果有订单id
        if (!this.isEdit) {
          if ((this.hasPhone || this.hasPhone2) && this.phonecode.length <= 0) {
            uni.showToast({
            	title: '请输入手机验证码',
            	icon: 'none'
            })
          } else if (this.hasPic && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
            	icon: 'none'
            })
          } else if (this.onlyPhoneCode && this.phonecodeOnly.length <= 0) {
            uni.showToast({
            	title: '请输入手机验证码',
            	icon: 'none'
            })
          } else {
            if (this.querying) return
            this.querying = true
            // this.loading = true
            uni.showLoading({
            	title: '正在查询...',
              mask: true
            })
            this.resArr = []
            if (this.bankCode.toLowerCase() === 'bcm' || this.bankCode.toLowerCase() === 'spd' || this.bankCode.toLowerCase() === 'cmbc' || this.bankCode.toLowerCase() === 'bosc' || this.bankCode.toLowerCase() === 'citic' || this.bankCode.toLowerCase() === 'cib' || this.bankCode.toLowerCase() === 'ceb' || this.bankCode.toLowerCase() === 'pab' || this.bankCode.toLowerCase() === 'bog' || this.bankCode.toLowerCase() === 'cmb' || this.bankCode.toLowerCase() === 'cgb') {
              let codeStr = ''
              if (this.onlyPhoneCode) {
                codeStr = this.phonecodeOnly
              } else {
                codeStr = this.phonecode
              }
              this.$http({
                url: this.$apis.queryBank,
                method: 'GET',
                data: {
                  bankCode: this.bankCode,
                  uid: this.$store.state.userInfo.id,
                  applyId: this.applyId,
                  idCard: '',
                  verifyCode: this.piccode,
                  mobile: '',
                  verifyMobileMsg: codeStr
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                  	if (data.data.length > 0) {
                  		uni.removeStorageSync('QueryBankCodeStamp')
                  		this.resArr = data.data
                      this.resArr.forEach(item => {
                        this.$set(item, 'resText', this.returnState(item.bank_apply_status))
                      })
                  		this.showResult(true)
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
                            	this.$store.commit('changeAgentSuccess', true)
                            	if (data.data === 3) {
                            		this.$store.commit('changeAgentIndex', 1)
                            	} else if (data.data === 4) {
                            		this.$store.commit('changeAgentIndex', 1)
                            	}
                            }
                          }
                        })
                  		}
                  	} else {
                  		this.showResult(false)
                  	}
                  } else {
                    uni.showToast({
                    	title: data.message,
                    	icon: 'none'
                    })
                  }
                  if (this.hasPic) {
                  	this.getBankCode()
                  }
                  this.piccode = ''
                  this.phonecode = ''
                  this.phonecodeOnly = ''
                  this.querying = false
                  // this.loading = false
                  uni.hideLoading()
                  // this.hasSendCode = false
                  // this.hasSendCode2 = false
                }
              })
            } else {
              if (this.hasPic) {
                this.getBankCode()
              }
              this.piccode = ''
              this.phonecode = ''
              this.phonecodeOnly = ''
              this.querying = false
              // this.hasSendCode = false
              // this.hasSendCode2 = false
              setTimeout(() => {
                // this.loading = false
                uni.hideLoading()
                this.showResult(false)
              }, 1000)
            }
          }
        } else {
          if (this.hasName && !this.$utils.validateName(this.username)) {
            uni.showToast({
            	title: '请输入正确的姓名',
            	icon: 'none'
            })
          } else if (!this.$utils.validateIdCard(this.idcard)) {
            uni.showToast({
            	title: '请输入正确的身份证号码',
            	icon: 'none'
            })
          } else if ((this.hasPhone || this.hasPhone2) && !this.$utils.validatePhone(this.phone)) {
            uni.showToast({
            	title: '请输入正确的手机号码',
            	icon: 'none'
            })
          } else if ((this.hasPhone || this.hasPhone2) && !this.hasSendCode) {
            uni.showToast({
            	title: '验证码已失效，请重新发送',
            	icon: 'none'
            })
          } else if ((this.hasPhone || this.hasPhone2) && this.phonecode.length <= 0) {
            uni.showToast({
            	title: '请输入手机验证码',
            	icon: 'none'
            })
          } else if (this.hasPic && this.piccode.length <= 0) {
            uni.showToast({
            	title: '请输入图形验证码',
            	icon: 'none'
            })
          } else if (this.onlyPhoneCode && !this.hasSendCode2) {
            uni.showToast({
            	title: '验证码已失效，请重新发送',
            	icon: 'none'
            })
          } else if (this.onlyPhoneCode && this.phonecodeOnly.length <= 0) {
            uni.showToast({
            	title: '请输入手机验证码',
            	icon: 'none'
            })
          } else {
            if (this.querying) return
            this.querying = true
            // this.loading = true
            uni.showLoading({
            	title: '正在查询...',
              mask: true
            })
            this.resArr = []
            if (this.bankCode.toLowerCase() === 'bcm' || this.bankCode.toLowerCase() === 'spd' || this.bankCode.toLowerCase() === 'cmbc' || this.bankCode.toLowerCase() === 'bosc' || this.bankCode.toLowerCase() === 'citic' || this.bankCode.toLowerCase() === 'cib' || this.bankCode.toLowerCase() === 'ceb' || this.bankCode.toLowerCase() === 'pab' || this.bankCode.toLowerCase() === 'bog' || this.bankCode.toLowerCase() === 'cmb' || this.bankCode.toLowerCase() === 'cgb') {
              let codeStr = ''
              if (this.onlyPhoneCode) {
                codeStr = this.phonecodeOnly
              } else {
                codeStr = this.phonecode
              }
              this.$http({
                url: this.$apis.queryBank,
                method: 'GET',
                data: {
                  bankCode: this.bankCode,
                  uid: this.$store.state.userInfo.id,
                  applyId: '',
                  idCard: this.idcard,
                  verifyCode: this.piccode,
                  mobile: this.phone,
                  verifyMobileMsg: codeStr
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                  	if (data.data.length > 0) {
                  		uni.removeStorageSync('QueryBankCodeStamp')
                  		this.resArr = data.data
                      this.resArr.forEach(item => {
                      	this.$set(item, 'resText', this.returnState(item.bank_apply_status))
                      })
                  		this.showResult(true)
                  		// 查询是否有资格升级VIP
                  		if (this.$store.state.role === 1) {
                  			this.$http({
                  				url: this.$apis.checkAgent,
                  				method: 'GET',
                  				data: {
                  					uid: this.$store.state.userInfo.id
                  				},
                  				cb: (err, data) => {
                  					if (!err && data.success) {
                  						this.$store.commit('changeAgentSuccess', true)
                  						if (data.data === 3) {
                  							this.$store.commit('changeAgentIndex', 1)
                  						} else if (data.data === 4) {
                  							this.$store.commit('changeAgentIndex', 1)
                  						}
                  					}
                  				}
                  			})
                  		}
                  	} else {
                  		this.showResult(false)
                  	}
                  } else {
                    uni.showToast({
                    	title: data.message,
                    	icon: 'none'
                    })
                  }
                  if (this.hasPic) {
                  	this.getBankCode()
                  }
                  this.piccode = ''
                  this.phonecode = ''
                  this.phonecodeOnly = ''
                  this.querying = false
                  // this.loading = false
                  uni.hideLoading()
                  // this.hasSendCode = false
                  // this.hasSendCode2 = false
                }
              })
            } else {
              if (this.hasPic) {
                this.getBankCode()
              }
              this.piccode = ''
              this.phonecode = ''
              this.phonecodeOnly = ''
              this.querying = false
              // this.hasSendCode = false
              // this.hasSendCode2 = false
              setTimeout(() => {
                // this.loading = false
                uni.hideLoading()
                this.showResult(false)
              }, 1000)
            }
          }
        }
      },
      showResult(type) {
        this.isSuccess = type
        this.resTitle = type ? '查询结果' : '未查询到申请记录'
        this.resultFlag = true
      },
      hideResult() {
        this.resultFlag = false
      },
      returnState(n) {
        let str = ''
        switch (n) {
          case 1:
            str = '审批中'
            break
          case 2:
            str = '已批卡'
            break
          case 3:
            str = '未通过'
            break
        }
        return str
      },
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      }
    },
    watch: {
      idcard: function (val) {
        this.idcard = val.replace(/x/g, 'X')
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
	.banner{
		margin-bottom: 20upx;
		image{
			width: 100%;
		}
	}
  .write{
    background-color: $color-white;
    .tit{
      padding: 0 30upx; font-size: $font-size-26; line-height: 64upx; color: $color-gray; border-bottom: $border-1;
    }
    .item{
    	align-items: center; height: 128upx; padding: 0 30upx; border-bottom: $border-1;
    	.input-icon{
    		width: 80upx; height: 80upx; margin-right: 40upx;
    	}
      .input-box-piccode{
        margin-right: 260upx;
      }
    	.input-box-code{
    		margin-right: 184upx;
    	}
    	input{
    		width: 100%; height: 64upx; font-size: $font-size-32; font-weight: 700; color: $default-color;
        &.gray{
          color: $color-gray;
        }
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
      .code{
        top: 50%; right: 30upx; z-index: 5; align-items: center; height: 60upx; color: $default-color; transform: translateY(-50%);
        .pic{
          width: 185upx; height: 100%;
          image{
            width: 100%; height: 100%;
          }
        }
        .reset{
          width: 48upx; height: 48upx;
          &.animate{
            animation: rote .5s linear;
          }
        }
      }
    }
    .write-fot{
      height: 64upx;
    }
  }
  .tips{
    padding: 20upx 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
  }
  .pop-result{
    .tit{
      padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
    }
    .text{
      padding-bottom: 20upx;
    }
    .lists{
      padding: 0 30upx;
      .item{
        font-size: $font-size-26; line-height: 36upx; color: $color-gray;
      }
    }
    .table{
      margin-bottom: 20upx;
      .table-hd{
      	text{
      		justify-content: center; align-items: center; height: 72upx; padding: 0 5upx; font-size: $font-size-28; color: $color-gray;
      	}
      }
      .table-bd{
      	max-height: 386upx;
      	text{
      		justify-content: center; align-items: center; height: 108upx; padding: 0 5upx; font-size: $font-size-26; line-height: 36upx; color: $color-gray-3;
      	}
      }
      .tr{
      	padding: 0 30upx;
      	.td-1{
      		width: 36%;
      	}
      	.td-2{
      		width: 28%;
      	}
      	.td-3{
      		width: 16%;
      	}
      	.td-4{
      		width: 20%;
      	}
      }
    }
  }
  @keyframes rote{
    0%{ transform: rotate(0deg); }
    100%{ transform: rotate(-360deg); }
  }
</style>
