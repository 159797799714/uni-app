<template>
  <view class="container">
    <view class="content">
      <scroll-view scroll-y class="scroll-view">
        <view class="header uni-pr uni-ovh">
          <image src="../../static/images/bg.png" mode="widthFix" class="bg uni-pa"></image>
          <view class="logo uni-pr uni-flex">
            <image src="../../static/images/logo.png" mode="widthFix"></image>
          </view>
          <view class="avatar uni-pa" @click="gotoMine">
            <image :src="userInfo.avatar_url || defaultAvatar"></image>
          </view>
          <view class="notice uni-pr uni-flex" v-if="noticeLists.length > 0">
            <image src="../../static/images/icon/icon-notice.png"></image>
            <view class="notice-con uni-flex-item uni-ovh">
              <view class="lists" :class="{'animate': animate}">
                <view class="item uni-textover" v-for="(item, index) in noticeLists" :key="index" @click="gotoNotice(item, index)">
                  <text>{{ item.title }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="enter uni-pr">
            <view class="enter-con uni-flex uni-flex-wrap">
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoCredit" v-if="config.module_control_card !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-ccard.png"></image>
                <text>办信用卡</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoLoan" v-if="config.module_control_loan !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-loan.png"></image>
                <text>贷款</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoInsurance" v-if="config.module_control_insurance !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-insurance.png"></image>
                <text>保险</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoAutoinsurance" v-if="config.module_control_insurance_car !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-auto.png"></image>
                <text>车险</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoTask">
                <image src="../../static/images/icon/icon-task.png"></image>
                <text>做任务</text>
                <view class="uni-pa">领红包</view>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoInvites" v-if="config.module_control_invite !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-invite3.png"></image>
                <text>邀请好友</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoReport" v-if="config.module_control_report !== constant.MODULE_STATE_CLOSE">
                <image src="../../static/images/icon/icon-report.png"></image>
                <text>信用报告</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoMine">
                <image src="../../static/images/icon/icon-mine.png"></image>
                <text>用户中心</text>
              </view>
            </view>
          </view>
        </view>
        <view class="welcome">
          <view class="welcome-con uni-ovh">
            <view class="welcome-title uni-txc">欢迎加入{{ config.system_name }}</view>
            <view class="welcome-data uni-flex uni-txc">
              <view class="item uni-box">
                <view class="num">
                  <text class="font-number">{{ welfareInfo.people }}</text><text class="tag">人</text>
                </view>
                <view>已在{{ config.system_nick_name }}赚钱</view>
              </view>
              <view class="item uni-box">
                <view class="num">
                  <text class="tag font-number">&yen;</text><text class="font-number">{{ welfareInfo.money }}</text>
                </view>
                <view>累计发放佣金</view>
              </view>
            </view>
            <view class="welfare" v-if="welfareInfo.type === 0">
              <view class="welfare-con uni-flex">今日免费申请名额仅剩： <text class="chunk font-number uni-txc">{{ welfareInfo.quota[0] }}</text><text class="chunk font-number uni-txc">{{ welfareInfo.quota[1] }}</text><text class="chunk font-number uni-txc">{{ welfareInfo.quota[2] }}</text> 名</view>
              <view class="welfare-btn uni-flex uni-txc">
                <view @click="gotoAgent">免费升级赚钱</view>
              </view>
            </view>
            <view class="welfare-redpacket" v-else-if="welfareInfo.type === 1 && config.module_control_invite !== constant.MODULE_STATE_CLOSE">
              <view class="welfare-con uni-flex"><image src="../../static/images/redpacket/redpacket.png"></image>您有<text>{{ welfareInfo.redpacket }}个</text>红包待激活</view>
              <view class="welfare-btn uni-flex uni-txc">
                <view @click="gotoTask">立即领红包</view>
              </view>
            </view>
            <view class="welfare-redpacket" v-else-if="welfareInfo.type === 2 && config.module_control_invite !== constant.MODULE_STATE_CLOSE">
              <view class="welfare-con uni-flex"><image src="../../static/images/redpacket/redpacket.png"></image><rich-text :nodes="welfareInfo.invite.title"></rich-text>即得<rich-text :nodes="welfareInfo.invite.reward"></rich-text>红包</view>
              <view class="welfare-btn uni-flex uni-txc">
                <view @click="gotoInvites">立即领红包</view>
              </view>
            </view>
          </view>
        </view>
        <view class="superiority">
        	<view class="title-2 uni-flex">
        		<view class="uni-pr">
        			平台优势
              <image src="../../static/images/icon/icon-title.png" class="line line-left uni-pa"></image>
              <image src="../../static/images/icon/icon-title.png" class="line line-right uni-pa"></image>
        		</view>
        	</view>
          <view class="superiority-con uni-pr">
          	<view class="lists uni-flex">
          		<view class="item uni-flex uni-column uni-flex-item" v-for="(item, index) in superiority.lists" :key="index" @click="showExplain(index)">
          			<image :src="item.url"></image>
                <text>{{ item.name }}</text>
          		</view>
          	</view>
            <view class="explain uni-pa" :class="'explain-' + (superiority.explain.index + 1)" v-if="superiority.explain.show">
              <view class="explain-con uni-pr uni-flex">
                <image src="../../static/images/icon/icon-lamp.png" class="uni-pr"></image>
                <text>{{ superiority.explain.arr[superiority.explain.index] }}</text>
              </view>
              <view class="bg uni-pa"></view>
              <view class="arrow uni-pa"></view>
            </view>
          </view>
        </view>
        <view class="activity" v-if="advLists.length > 0 || recomLists.length > 0">
        	<view class="banner" v-if="advLists.length > 0">
        		<view class="title">
              <view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>最新活动</view>
            </view>
            <view class="lists uni-ovh">
            	<view class="item uni-ovh" v-for="(item, index) in advLists" :key="index" @click="gotoActivity(item.link_to_app)">
                <image :src="item.url" mode="widthFix"></image>
              </view>
            </view>
        	</view>
          <view class="recommend">
          	<view class="title">
          		<view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>最新推荐</view>
          	</view>
            <view class="lists">
            	<view class="item uni-pr uni-box" v-for="(item, index) in recomLists" :key="index" @click="gotoActivity(item.link_to_app)">
            		<view class="pic-box uni-pa uni-ovh">
            			<image :src="item.url" mode="aspectFill"></image>
            		</view>
                <view class="name uni-flex uni-ovh">
                	{{ item.title }}
                  <text>{{ item.tips }}</text>
                </view>
                <view class="sub uni-textover">{{ item.sub_title }}</view>
                <view class="tag uni-flex" v-if="item.tagArr.length > 0">
                	<view class="tag-item uni-box" v-for="(tagitem, tagindex) in item.tagArr" :key="tagindex">{{ tagitem }}</view>
                </view>
                <image src="../../static/images/icon/icon-more.png" class="arrow uni-pa"></image>
            	</view>
            </view>
          </view>
        </view>
        <view class="cooperation" v-if="cooperaLists.length > 0">
        	<view class="title-2 uni-flex">
        		<view class="uni-pr">
        			合作单位
        			<image src="../../static/images/icon/icon-title.png" class="line line-left uni-pa"></image>
        			<image src="../../static/images/icon/icon-title.png" class="line line-right uni-pa"></image>
        		</view>
        	</view>
          <view class="lists uni-flex uni-flex-wrap">
          	<view class="item uni-flex uni-column uni-box" v-for="(item, index) in cooperaLists" :key="index" v-if="index < 10">
          		<image :src="item.url" mode="aspectFill"></image>
              <text>{{ item.title }}</text>
          	</view>
          </view>
          <view class="more" v-if="cooperaLists.length > 10">
          	<view class="uni-txc">等{{ cooperaLists.length }}家机构</view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        noticeLists: [],
        noticeTimer: null,
        animate: false,
        welfareInfo: {
          type: 0,
          people: '150,000',
          money: '1,000,000',
          quota: '000',
          redpacket: 0,
          invite: {
            title: '邀请<span style="color: #D2A100;">0个</span>用户',
            reward: '最高<span style="color: #D2A100;">0元</span>'
          }
        },
        welfareInfoTimer: null,
        superiority: {
          lists: [
            {
              url: '../../static/images/home/superiority-1.png',
              name: '佣金高'
            },
            {
              url: '../../static/images/home/superiority-2.png',
              name: '业务全'
            },
            {
              url: '../../static/images/home/superiority-3.png',
              name: '结算快'
            },
            {
              url: '../../static/images/home/superiority-4.png',
              name: '收益久'
            }
          ],
          explain: {
            show: false,
            timer: null,
            index: -1,
            arr: ['全网最高佣金，信用卡单张佣金高达150元！', '四大核心业务：信用卡、保险、贷款、理财等综合服务！', '最快当天结算，佣金提现秒到账，直接到微信钱包！', '全行业最高收益，同级永久享受5%提成，躺着赚钱！']
          }
        },
        advLists: [], // 活动
        recomLists: [], // 最新推荐
        cooperaLists: [] // 合作单位
      }
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      config() {
        return this.$store.state.config
      },
      constant() {
      	return this.$constant
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      }
    },
    onLoad() {
      // 获取公告
      this.$http({
        url: this.$apis.notices,
        method: 'GET',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            data.data.forEach((item, index) => {
              item.index = index
              this.noticeLists.push(item)
            })
            if (this.noticeLists.length > 1) {
              this.noticeTimer = setInterval(this.noticeScroll, 4000)
            }
          } else {
            console.log('获取公告失败')
          }
        }
      })
      this.countNumber()
      this.welfareInfoTimer = setInterval(this.countNumber, 300000)
      // 判断用户身份显示内容
      if (this.userInfo.role > 0) {
        this.welfareInfo.type = 1
        // 检查是否完成新手任务
        this.$http({
          url: this.$apis.task,
          method: 'GET',
          data: {
            type: 1
          },
          cb: (err, data) => {
            if (!err && data.success) {
              if (!data.data.is_finish) {
                // 没有完成
                let isFinish = 0
                data.data.data.forEach(item => {
                  if (item.is_finish && item.red_envelope_amount !== '0.00') isFinish ++
                })
                this.welfareInfo.redpacket = data.data.data.length - isFinish
              } else {
                // 完成
                this.welfareInfo.type = 2
                this.$http({
                  url: this.$apis.task,
                  method: 'GET',
                  data: {
                    type: 4
                  },
                  cb: (err1, data1) => {
                    if (!err1 && data1.success === true) {
                      let reg = /^(\.|\d)?$/
                      let str1 = data1.data.reward
                      let str2 = data1.data.title
                      let res = ''
                      for (let i = 0; i < str1.length; i ++) {
                        if (reg.test(str1[i]) || (i > 0 && reg.test(str1[i - 1]) && !reg.test(str1[i]))) {
                          res += '<span style="color: #D2A100;">' + str1[i] + '</span>'
                        } else {
                          res += str1[i]
                        }
                      }
                      this.welfareInfo.invite.reward = res
                      res = ''
                      for (let i = 0; i < str2.length; i ++) {
                        if (reg.test(str2[i]) || (i > 0 && reg.test(str2[i - 1]) && !reg.test(str2[i]))) {
                          res += '<span style="color: #D2A100;">' + str2[i] + '</span>'
                        } else {
                          res += str2[i]
                        }
                      }
                      this.welfareInfo.invite.title = res
                    }
                  }
                })
              }
            }
          }
        })
      }
      // 活动
      this.$http({
        url: this.$apis.adverts,
        method: 'GET',
        data: {
          place: 1
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.advLists = data.data
          }
        }
      })
      // 推荐
      this.$http({
        url: this.$apis.adverts,
        method: 'GET',
        data: {
          place: 5
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.recomLists = data.data
            this.recomLists.forEach(item => {
            	this.$set(item, 'tagArr', this.handleStr(item.labels))
            })
          }
        }
      })
      // 合作单位
      this.$http({
      	url: this.$apis.adverts,
      	method: 'GET',
      	data: {
      		place: 10
      	},
      	cb: (err, data) => {
      		if (!err && data.success) {
      			this.cooperaLists = data.data
      		}
      	}
      })
    },
    onShow() {
      if (this.noticeLists.length > 1 && this.noticeTimer === null) {
        this.noticeTimer = setInterval(this.noticeScroll, 4000)
      }
      if (this.welfareInfoTimer === null) {
        this.welfareInfoTimer = setInterval(this.countNumber, 300000)
      }
    },
    onHide() {
      clearInterval(this.noticeTimer)
      this.noticeTimer = null
      clearInterval(this.welfareInfoTimer)
      this.welfareInfoTimer = null
    },
    methods: {
      gotoNotice(item, index) {
        if (this.animate) return
        this.$navigateTo({
          url: '/pages/mine/notice'
        })
      },
      noticeScroll() {
        this.animate = true
        setTimeout(() => {
          // this.noticeLists.push(this.noticeLists[0])
          this.$set(this.noticeLists, this.noticeLists.length, this.noticeLists[0])
          this.noticeLists.shift()
          this.animate = false
        }, 700)
      },
      gotoMine() {
        uni.switchTab({
        	url: '/pages/mine/index'
        })
      },
      gotoCredit() {
        if (this.config.module_control_card === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/credit/index'
          })
        } else {
          uni.showToast({
          	title: '信用卡暂未开放',
          	icon: 'none'
          })
        }
      },
      gotoLoan() {
        if (this.config.module_control_loan === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/loan/index'
          })
        } else {
          uni.showToast({
          	title: '贷款暂未开放',
          	icon: 'none'
          })
        }
      },
      gotoInsurance() {
        if (this.config.module_control_insurance === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/insurance/index'
          })
        } else {
          uni.showToast({
          	title: '保险暂未开放',
          	icon: 'none'
          })
        }
      },
      gotoAutoinsurance() {
        if (this.config.module_control_insurance_car === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/autoinsurance/index'
          })
        } else {
          uni.showToast({
          	title: '车险暂未开放',
          	icon: 'none'
          })
        }
      },
      gotoTask() {
        if (this.config.module_control_task === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/task/index'
          })
        } else {
          uni.showToast({
          	title: '任务活动暂未开放',
            icon: 'none'
          })
        }
      },
      gotoInvites() {
      	if (this.config.module_control_invite === this.constant.MODULE_STATE_OPEN) {
      		this.$navigateTo({
      			url: '/pages/invite/index'
      		})
      	} else {
      		uni.showToast({
      			title: '邀请活动暂未开放',
      			icon: 'none'
      		})
      	}
      },
      gotoReport() {
        if (this.config.module_control_report === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/report/index'
          })
        } else {
          uni.showToast({
          	title: '信用报告暂未开放',
            icon: 'none'
          })
        }
      },
      gotoMine() {
        uni.switchTab({
        	url: '/pages/mine/index'
        })
      },
      gotoAgent() {
        this.$navigateTo({
        	url: '/pages/mine/agent'
        })
      },
      showExplain(n) {
        clearTimeout(this.superiority.explain.timer)
        if (this.superiority.explain.index === n) {
          this.superiority.explain.show = false
          this.superiority.explain.index = -1
        } else {
          this.superiority.explain.index = n
          this.superiority.explain.show = true
          this.superiority.explain.timer = setTimeout(() => {
            this.superiority.explain.show = false
            this.superiority.explain.index = -1
          }, 4000)
        }
      },
      gotoActivity(url) {
        this.$navigateTo({
          url: url
        })
      },
      countNumber() {
        // 计算
        let startTime = new Date('2018/09/07 00:00:00').getTime()
        let startTime2 = new Date().setHours(0, 0, 0, 0)
        let nowTime = new Date().getTime()
        let cha = Math.ceil((nowTime - startTime) / 1000 / 60)
        let cha2 = Math.ceil((nowTime - startTime2) / 1000 / 60)
        this.welfareInfo.people = this.toThousands(Math.ceil(150000 + cha / 5 * 3))
        this.welfareInfo.money = this.toThousands(Math.ceil(5000000 + cha / 5 * 89))
        let surplus = '' + (288 - Math.ceil(cha2 / 5))
        if (surplus.length === 1) {
          surplus = '00' + surplus
        } else if (surplus.length === 2) {
          surplus = '0' + surplus
        }
        this.welfareInfo.quota = surplus
      },
      toThousands(number) {
        return (number || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
      },
      handleStr(str) {
        return str.split(',')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .header{
    .bg{
      z-index: 1; width: 100%;
    }
    .logo{
      z-index: 3; justify-content: center; width: 572upx; padding: 60upx 0 40upx;
      image{
        width: 220upx; height: 100upx;
      }
    }
    .avatar{
      top: 64upx; right: 62upx; z-index: 3;
      image{
        width: 80upx; height: 80upx; border: $border-avatar; border-radius: 100%;
      }
    }
    .notice{
      z-index: 3; align-items: center; padding: 16upx 20upx;
      image{
        width: 48upx; height: 48upx; margin-right: 10upx;
      }
      .notice-con{
        height: 48upx;
        .lists{
          &.animate{
            margin-top: -.48rem; transition: all .5s;
          }
          .item{
            height: 48upx; line-height: 48upx; color: $color-white;
          }
        }
      }
    }
    .enter{
      z-index: 3; padding: 0 20upx; margin-bottom: 20upx;
      .enter-con{
        padding: 20upx 0; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
        .item{
          align-items: center; width: 25%; height: 154upx; padding-top: 20upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx;
          image{
            width: $icon-size; height: $icon-size; margin-bottom: 8upx;
          }
          view{
            top: 10upx; right: -16upx; height: 32upx; padding: 0 16upx; font-size: $font-size-20; line-height: 32upx; color: $color-white; background-color: $color-tag; border: $border-1; border-color: $color-white; border-radius: 32upx 32upx 32upx 0; pointer-events: none;
          }
        }
      }
    }
  }
  .welcome{
    padding: 0 20upx;
    margin-bottom: 20upx;
    .welcome-con{
      padding-bottom: 30upx; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
      .welcome-title{
        height: 80upx; font-size: 36upx; line-height: 80upx; color: #586D96; background-color: #E7F0F8;
      }
      .welcome-data{
        justify-content: center; padding: 30upx 0;
        .item{
          width: 300upx; height: 120upx; padding-top: 20upx; margin: 0 15upx; font-size: $font-size-22; line-height: $font-size-22 + 10upx; color: #A1A3B1; text-align: center; border: 1px solid #F3F3F3; border-radius: $border-radius;
          .num{
            height: 48upx; margin-bottom: 4upx; font-size: $font-size-40; line-height: 48upx; color: $color;
            .tag{
              font-size: $font-size-32;
            }
          }
        }
      }
      .welfare-con{
        justify-content: center; align-items: center; height: 72upx; margin-bottom: 24upx; font-size: $font-size-28;
        text{
           color: $color;
        }
        .chunk{
          width: 48upx; height: 52upx; margin-right: 4upx; font-size: $font-size-36; line-height: 52upx; background: $bg-linear-chunk; border-radius: $border-radius;
        }
        image{
          width: 72upx; height: 72upx;
        }
      }
      .welfare-btn{
        justify-content: center;
        view{
          width: 520upx; height: 84upx; font-size: $font-size-28; line-height: 84upx; color: $color-white; background: $bg-linear-welcome; border-radius: 84upx;
        }
      }
    }
  }
  .superiority{
    margin-bottom: 20upx;
    .item{
      align-items: center; padding: 20upx 0; font-size: $font-size-24; line-height: $font-size-24 + 10upx; background-color: $color-white;
      image{
        width: 100upx; height: 100upx; margin-bottom: 10upx;
      }
    }
    .explain{
      bottom: calc(100% + 14upx); left: 20upx; width: calc(100% - 40upx);
      .explain-con{
        z-index: 5; align-items: center; padding: 14upx 20upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: #616586; background-color: $color-white; border-radius: 20upx;
        image{
          width: 48upx; height: 48upx; margin-right: 16upx;
        }
      }
      .bg{
        top: 0; left: 0; z-index: 1; width: 100%; height: 100%; border-radius: 20upx; box-shadow: $box-shadow;
      }
      .arrow{
        bottom: -13upx; z-index: 2; width: 30upx; height: 30upx; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow; transform: rotate(45deg); 
      }
      &.explain-1 .arrow{
      	left: 63.75upx;
      }
      &.explain-2 .arrow{
      	left: 251.25upx;
      }
      &.explain-3 .arrow{
      	left: 438.75upx;
      }
      &.explain-4 .arrow{
      	left: 626.25upx;
      }
    }
  }
  .activity{
    margin-bottom: 20upx; background-color: $color-white;
    .banner{
      margin-bottom: 20upx;
      .lists{
        padding: 0 20upx;
        .item{
        	height: 296upx; margin-bottom: 30upx; border-radius: $border-radius;
        	image{
        		width: 100%;
        	}
        }
      }
    }
    .recommend{
      .lists{
        padding: 0 20upx 20upx;
        .item{
          height: 200upx; padding: 30upx 64upx 0 240upx; margin-bottom: 20upx; border-radius: $border-radius; box-shadow: $box-shadow;
          .pic-box{
            top: 30upx; left: 20upx; width: 200upx; height: 140upx; border-radius: $border-radius;
            image{
              width: 100%; height: 100%;
            }
          }
          .name{
            align-items: center; height: 44upx; margin-bottom: 8upx; font-size: $font-size-32;
            text{
              height: 36upx; padding: 0 8upx; margin-left: 8upx; font-size: $font-size-20; line-height: 36upx; color: $color; background: $bg-linear-chunk; border-radius: $border-radius;
            }
          }
          .sub{
            height: 34upx; margin-bottom: 20upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: $color-gray;
          }
          .tag-item{
            padding: 0 10upx; margin-right: 8upx; font-size: $font-size-22; line-height: $font-size-22 + 10upx; color: $color; white-space: nowrap; border: 1px solid $color; border-radius: 4upx;
          }
          .arrow{
            top: 50%; right: .2rem; width: 24upx; height: 48upx; margin-top: -24upx;
          }
        }
      }
    }
  }
  .cooperation{
    margin-bottom: 20upx;
    .lists{
      padding: 20upx 0; background-color: $color-white;
      .item{
        align-items: center; width: 20%; height: 136upx; padding-top: 14upx; font-size: $font-size-18; line-height: 40upx; color: $color-gray;
        image{
          width: 80upx; height: 80upx; margin-bottom: 6upx;
        }
      }
    }
    .more{
      font-size: $font-size-24; line-height: 52upx; color: #aaabb8; background-color: $color-white; border-top: $border-1;
    }
  }
</style>
