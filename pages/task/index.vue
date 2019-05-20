<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true" scroll-with-animation="true" @scroll="scroll">
        <image src="/static/images/task/bg.png" mode="widthFix" class="bg uni-pa"></image>
				<view class="notset uni-pr uni-flex uni-column" v-if="confirmIndex === 0">
          <view class="txt">您未设置梦想收入</view>
          <view class="btn uni-txc" @click="showDreamPop">设置梦想收入</view>
        </view>
        <view class="uni-pr uni-ovh" v-else>
          <view class="dream uni-txc">
            <view class="tit">您的梦想收入</view>
            <view class="num uni-flex font-number" @click="showDreamPop">{{ dreamArr[confirmIndex].amount }}<image src="/static/images/icon/icon-xg.png" mode=""></image></view>
            <view class="text">（每年）</view>
            <view class="progress uni-flex">
              <view class="progress-con uni-box uni-ovh">
                <view class="progress-chunk" :style="{'width': progressPercent + '%'}"></view>
              </view>
              <view>{{ progressPercentTofixed }}%</view>
            </view>
            <view class="now">已实现总收入：{{ bonus }}</view>
          </view>
          <view class="details">
            <view class="details-con uni-pr uni-txc">
              <view class="tit">本周任务</view>
              <view @click="showSituation" class="btn uni-pa uni-box">查看完成情况</view>
              <image src="/static/images/task/seal.png" mode="" class="seal uni-pa" v-if="weekTask.is_finish"></image>
              <view class="data uni-flex">
                <view class="uni-flex-item">
                  <view class="num font-number">{{ weekTask.invite_newer ? weekTask.invite_newer.finish_num : 0 }}/{{ weekTask.invite_newer ? weekTask.invite_newer.toward : 0 }}</view>
                  <view>锁粉</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num font-number">{{ weekTask.banker_init ? weekTask.banker_init.finish_num : 0 }}/{{ weekTask.banker_init ? weekTask.banker_init.toward : 0 }}</view>
                  <view>普通会员</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num font-number">{{ weekTask.team_apply ? weekTask.team_apply.finish_num : 0 }}/{{ weekTask.team_apply ? weekTask.team_apply.toward : 0 }}</view>
                  <view>新增订单</view>
                </view>
              </view>
            </view>
          </view>
          <view class="details" v-if="false">
            <view class="details-con uni-pr uni-txc">
              <view class="tit">本人任务</view>
              <view class="data uni-flex">
                <view class="uni-flex-item">
                  <view class="num font-number">{{ teamTask[0] ? teamTask[0].finish_num : 0 }}/{{ teamTask[0] ? teamTask[0].toward : 0 }}</view>
                  <view>VIP</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="state uni-pr">
          <view class="state-con uni-flex uni-txc">
            <view>您当前是：<toDecima :str="role" :type="4"></toDecima></view>
            <view class="btn" v-if="role === 0" @click="gotoAgent">申请VIP</view>
            <view class="btn" v-if="role === 1" @click="gotoBanker">申请VIP</view>
            <view class="btn" v-if="role === 2" @click="gotoCertificate">查看证书</view>
          </view>
        </view>
        <view class="tab-hd-2 uni-pr uni-flex uni-txc">
          <view @click="tabClick(index)" class="item uni-flex-item" :class="{'on': index === tabIndex}" v-for="(item, index) in tabLists" :key="index">{{ item.name }}</view>
          <view class="actived uni-pa" :style="{'left': tabIndex * 100 / tabLists.length + 50 / tabLists.length + '%'}"></view>
        </view>
        <view class="task-lists uni-pr" v-if="taskLists.length > 0">
          <view class="item uni-flex" v-for="(item, index) in taskLists" :key="index">
            <view class="num">
              <image :src="'/static/images/number/num-' + (index + 1) + '.png'" mode=""></image>
            </view>
            <view class="text uni-flex-item uni-ovh">
              <view class="tit uni-textover">{{ item.title }}</view>
              <view class="btn uni-flex">完成{{ item.finish_num }}/{{ item.toward }}<view class="uni-txc" v-if="item.is_finish && item.red_envelope_amount === '0.00' && tabLists[tabIndex].type === 1" @click="showPacket(item.finish_id)">{{ item.reward }}</view><view class="uni-txc" v-if="item.is_finish === false && item.red_envelope_amount === '0.00' && tabLists[tabIndex].type === 1" @click="showPacket(false)">{{ item.reward }}</view><view class="gray uni-txc" v-if="item.is_finish && item.red_envelope_amount !== '0.00' && tabLists[tabIndex].type === 1">已抽{{ item.red_envelope_amount }}元</view></view>
            </view>
            <view class="btn-box uni-txc">
              <view v-if="item.is_finish === false" @click="gotoFinash(item.link)">去完成</view>
              <image src="/static/images/task/ywc.png" mode="" v-else></image>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-if="taskLists.length <= 0 && !taskLoading">
        	<image src="/static/images/icon/icon-empty.png"></image>
        	<view>您没有{{ tabLists[tabIndex].name }}</view>
        </view>
        <view class="invites" v-if="config.module_control_invite !== constant.MODULE_STATE_CLOSE" v-show="!taskLoading">
          <view class="invites-con uni-flex" @click="gotoInvite">
            <image src="/static/images/icon/icon-invite3.png" mode=""></image>
            <view class="uni-flex-item">邀请好友 领120元现金</view>
            <view class="btn uni-txc">立即前往</view>
          </view>
        </view>
			</scroll-view>
		</view>
    <!-- 梦想收入 S -->
    <view class="pop pop-dream" v-show="dreamShow">
      <view @click="hideDreamPop" class="mask"></view>
      <view class="pop-con-2 uni-txc">
        <image @click="hideDreamPop" src="/static/images/icon/icon-close.png" mode="" class="btn-close uni-pa"></image>
        <image src="/static/images/task/bg-pop.png" mode="widthFix" class="banner"></image>
        <view class="explain">
          <view>梦想收入是您给自己设置的奋斗目标，{{ config.system_nick_name }}会根据您的目标把任务进行分解，逐步引导您完成目标，实现梦想收入</view>
        </view>
        <view class="num font-number">{{ dreamArr[dreamIndex].amount }}</view>
        <view class="line"></view>
        <view class="tips" v-show="dreamIndex < dreamArr.length - 1">（已超过{{ dreamArr[dreamIndex].over }}%的人的梦想收入）</view>
        <view class="tips" v-show="dreamIndex >= dreamArr.length - 1">您具备{{ config.system_nick_name }}合伙人潜质</view>
        <view class="control uni-flex">
          <view class="bar uni-pr">
          	<slider min="0" :max="(dreamArr.length - 1) * 10" :value="dreamPercent" activeColor="#F5C442" :block-size="blockSize" block-color="#FFCF50" @change="stopDragDreamBar" @changing="dragDreamBar"/>
            <view class="lists uni-flex uni-pa">
              <view v-for="(item, index) in dreamArr" :key="index" class="item uni-pr" :class="{'on': index <= dreamIndex}">
                <view class="dot uni-pa uni-box" v-if="index !== 0 || index !== dreamArr.length - 1"></view>
                <view class="num uni-pa"><toDecima :str="item.amount" :type="5"></toDecima></view>
              </view>
            </view>
            <image src="/static/images/icon/icon-coin.png" class="icon uni-pa" :style="{'left': dreamPercent / ((dreamArr.length - 1) * 10) * 100 + '%'}"></image>
          </view>
        </view>
        <view class="tips">（滑动指示条以修改数字）</view>
        <view class="btn-box uni-flex">
          <view @click="confirmDream" v-show="dreamIndex < dreamArr.length - 1">开启梦想之旅</view>
          <view @click="gotoRecruit" v-show="dreamIndex >= dreamArr.length - 1">申请合伙人</view>
        </view>
      </view>
    </view>
    <!-- 梦想收入 E -->
    <!-- 红包 S -->
    <view class="pop pop-redpacket" v-show="redpacketShow">
      <view @click="closeRedPop" class="mask"></view>
      <view class="pop-con-2">
        <image @click="closeRedPop" src="/static/images/icon/icon-close.png" mode="" class="btn-close uni-pa"></image>
        <view class="front uni-pr uni-flex uni-column uni-ovh" v-show="!opened">
          <image src="/static/images/task/packet-bg.png" class="bg uni-pa" mode="widthFix"></image>
          <view @click="openRedPacket" class="open-btn uni-pr" :class="{'animate': opening}">
            <image src="/static/images/task/front.png" mode="" class="icon-front uni-pa"></image>
            <image src="/static/images/task/back.png" mode="" class="icon-back uni-pa"></image>
          </view>
          <view class="text uni-pr uni-txc uni-ovh">恭喜您完成任务<text>\n</text>点击“开”字抽取红包</view>
        </view>
        <view class="back uni-pr uni-flex uni-column uni-txc uni-ovh" v-show="opened">
          <image src="/static/images/task/packet-open.png" class="bg uni-pa" mode="widthFix"></image>
          <view class="num uni-pr">{{ money }}<text>元</text></view>
          <view class="text uni-pr">恭喜您<text>\n</text>红包金额已存入您的钱包</view>
          <view class="btn uni-pr" @click="gotoEarning">去我的钱包</view>
        </view>
      </view>
    </view>
    <!-- 红包 E -->
    <!-- 完成情况 S -->
    <view class="pop pop-situation" v-show="situationShow">
      <view @click="hideSituation" class="mask"></view>
      <view class="pop-con">
        <view class="tit">每周任务达成情况</view>
        <scroll-view scroll-y class="scroll-box">
          <view class="text">
            <view>积跬步以致千里，我们已经根据{{ config.system_nick_name }}智能算法将您的梦想目标分解为周计划。</view>
            <view>根据您设定的梦想收入<text>￥{{ dreamArr[confirmIndex].amount }}元</text>，我们推算您每周需要锁粉<text>{{ weekTask.invite_newer ? weekTask.invite_newer.toward : 0 }}人</text>，发展普通会员<text>{{ weekTask.banker_init ? weekTask.banker_init.toward : 0 }}人</text>，直推办卡<text>{{ weekTask.team_apply ? weekTask.team_apply.toward : 0 }}张</text>。</view>
          </view>
          <view class="lists uni-flex uni-flex-wrap">
            <view v-for="(item, index) in weekTaskArr" :key="index" class="item uni-txc" :class="{'finish': item === 1, 'unfinished': item === 0, 'ongoing': item === 2}">
              <view class="status uni-flex" v-if="item === 1">已完成</view>
              <view class="status uni-flex" v-else-if="item === 0">未完成</view>
              <view class="status uni-flex" v-else-if="item === 2">进行中</view>
              <view class="status uni-flex" v-else></view>
              <view>第{{ index + 1 }}周</view>
            </view>
          </view>
        </scroll-view>
        <view class="operation-2">
          <view @click="hideSituation">知道了</view>
        </view>
      </view>
    </view>
    <!-- 完成情况 E -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabLists: [
          {
            name: '新手任务',
            type: 1
          },
          {
            name: '日常任务',
            type: 2
          }
        ],
        tabIndex: 0,
        dreamShow: false,
        dreamArr: [
          {
            amount: '0.00',
            id: 0,
            over: 0
          }
        ],
        getDreamArr: false,
        dreamIndex: 0,
        dreamPercent: 0,
        confirmIndex: 0,
        weekTask: {
          banker_init: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          invite_newer: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          team_apply: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          is_finish: false
        },
        teamTask: {
          0: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          }
        },
        taskLists: [],
        taskIsFinish: false,
        taskLoading: false,
        situationShow: false,
        redpacketShow: false,
        taskRedId: 0,
        opening: false,
        opened: false,
        isClickRed: false,
        scrrollTop: 0,
        nowScrollTop: 0,
        money: 0.00,
        weekTaskArr: [],
        weekTaskState: false
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      userInfo() {
        return this.$store.state.userInfo
      },
      constant() {
        return this.$constant
      },
      role() {
        return this.userInfo.role
      },
      bonus() {
        return this.userInfo.bonus
      },
      progressPercent() {
        return parseFloat(this.bonus.replace(',', '')) / parseFloat(this.dreamArr[this.confirmIndex].amount) * 100
      },
      progressPercentTofixed() {
        return this.progressPercent.toFixed(2)
      },
      blockSize() {
        let size = uni.upx2px(64) / 3 * 2
        return size >= 28 ? 28 : size
      }
    },
		onLoad() {
			if (this.role > 0) {
        this.$http({
          url: this.$apis.dreamLevel,
          method: 'GET',
          data: null,
          cb: (err, data) => {
            if (!err && data.success) {
              this.dreamArr = data.data
              this.getDreamArr = true
              this.confirmIndex = this.userInfo.task_level
              this.updateWeekTask()
            } else {
              uni.showToast({
              	title: data ? data.message : '获取梦想收入等级失败',
                icon: 'none'
              })
            }
          }
        })
        this.updateTask(() => {
          if (this.taskIsFinish && this.tabLists[0].type === 1) {
            let s = this.tabLists.pop()
            this.tabLists.unshift(s)
            setTimeout(() => {
              this.updateTask()
            }, 50)
          }
        })
      }
		},
    onShow() {
    	if (this.role === 0) {
        this.showTips()
      }
    },
    onHide() {
    	this.nowScrollTop = this.scrrollTop
    },
    methods: {
      showTips() {
        uni.showModal({
        	title: '提示',
          content: '您是临时用户，无权使用此功能，请先免费升级为普通会员继续使用。',
          cancelText: '知道了',
          confirmText: '去升级',
          success: res => {
          	if (res.confirm) {
              this.$navigateTo({
              	url: '/pages/mine/agent'
              })
            }
          }
        })
      },
      gotoAgent() {
        this.$navigateTo({
        	url: '/pages/mine/agent'
        })
      },
      gotoBanker() {
        this.$navigateTo({
        	url: '/pages/index/member'
        })
      },
      gotoCertificate() {
        this.$navigateTo({
        	url: '/pages/mine/certificate'
        })
      },
      gotoEarning() {
        this.$navigateTo({
        	url: '/pages/mine/earning?tab=1'
        })
      },
      tabClick(n) {
        if (this.tabIndex === n) return
        if (this.role === 0) {
          this.showTips()
        } else {
          this.tabIndex = n
          this.updateTask()
        }
      },
      updateTask(cb) {
        if (this.taskLoading) return
        this.taskLoading = true
        this.taskLists = []
        this.$http({
          url: this.$apis.task,
          method: 'GET',
          data: {
            type: this.tabLists[this.tabIndex].type
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.taskLists = data.data.data
              this.taskIsFinish = data.data.is_finish
              this.isClickRed = false
              if (typeof cb === 'function') {
                cb()
              }
            } else {
              uni.showToast({
              	title: data ? data.message : '任务列表获取失败',
                icon: 'none'
              })
            }
            this.taskLoading = false
          }
        })
      },
      updateWeekTask() {
        if (this.confirmIndex !== 0) {
          this.$http({
            url: this.$apis.task,
            method: 'GET',
            data: {
              type: 3
            },
            cb: (err, data) => {
              if (!err && data.success) {
                this.weekTask = data.data.data
                this.weekTask.is_finish = data.data.is_finish
              } else {
                uni.showToast({
                	title: data ? data.message : '周任务获取失败',
                  icon: 'none'
                })
              }
              this.taskLoading = false
            }
          })
          this.$http({
            url: this.$apis.task,
            method: 'GET',
            data: {
              type: 5
            },
            cb: (err, data) => {
              if (!err && data.success === true) {
                this.teamTask = data.data.data
              } else {
                uni.showToast({
                	title: data ? data.message : '团队任务获取失败',
                  icon: 'none'
                })
              }
              this.taskLoading = false
            }
          })
        }
      },
      gotoFinash(url) {
        let str = url.split('#/').pop()
        switch (str) {
          case 'invite':
            this.$navigateTo({
            	url: '/pages/invite/invite'
            })
            break
          case 'material':
            this.$navigateTo({
            	url: '/pages/spread/material'
            })
            break
          case 'apply':
            this.$navigateTo({
            	url: '/pages/credit/index'
            })
            break
          case 'banker':
            this.$navigateTo({
            	url: '/pages/index/member'
            })
            break
          case 'cash':
            this.$navigateTo({
            	url: '/pages/mine/cash'
            })
            break
          case 'account':
            this.$navigateTo({
            	url: '/pages/mine/account'
            })
            break
          case 'task':
            this.showDreamPop()
            break
          case 'query':
            this.$navigateTo({
            	url: '/pages/credit/query'
            })
            break
        }
      },
      scroll(e) {
        this.scrrollTop = e.detail.scrollTop
      },
      showPacket(id) {
        if (!id) {
          uni.showToast({
          	title: '完成任务才能抽红包哟',
            icon: 'none'
          })
        } else {
          this.redpacketShow = true
          this.opening = false
          this.opened = false
          this.taskRedId = id
        }
      },
      openRedPacket() {
        if (this.opening || this.isClickRed) return
        this.opening = true
        this.$http({
          url: this.$apis.taskRedpacket,
          method: 'POST',
          data: {
            id: this.taskRedId
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.money = data.data
              this.isClickRed = true
              setTimeout(() => {
                this.opening = false
                this.opened = true
                this.$getInfo()
              }, 1000)
            } else {
              setTimeout(() => {
                uni.showToast({
                	title: '抽红包失败，请稍后再试',
                  icon: 'none'
                })
                this.opening = false
                this.opened = false
              }, 1000)
            }
          }
        })
      },
      closeRedPop() {
        if (this.isClickRed) {
          this.updateTask(() => {
            setTimeout(() => {
              this.nowScrollTop = this.scrrollTop
            }, 16.67)
          })
        }
        this.redpacketShow = false
      },
      showDreamPop() {
        if (this.role === 0) {
          this.showTips()
        } else {
          if (!this.getDreamArr) return
          this.dreamShow = true
          this.dreamIndex = this.confirmIndex
          this.dreamPercent = this.dreamIndex * 10
        }
      },
      dragDreamBar(e) {
        this.dreamPercent = e.detail.value
        this.percentHandle(this.dreamPercent, false)
      },
      stopDragDreamBar(e) {
        this.dreamPercent = e.detail.value
        this.percentHandle(this.dreamPercent, true)
      },
      percentHandle(n, b) {
        this.dreamIndex = Math.round(this.dreamPercent / 10)
        setTimeout(() => {
          if (b) this.dreamPercent = this.dreamIndex * 10
        }, 16.67)
      },
      confirmDream() {
        let _this = this
        if (_this.dreamIndex === 0) {
          uni.showToast({
          	title: '请设置具体数值',
            icon: 'none'
          })
        } else {
          _this.confirmIndex = _this.dreamIndex
          _this.hideDreamPop()
          _this.$http({
            url: _this.$apis.setDream,
            method: 'PUT',
            data: {
              level: _this.dreamArr[_this.confirmIndex].id
            },
            cb: (err, data) => {
              if (!err && data.success) {
                _this.$getInfo(() => {
                  _this.confirmIndex = _this.userInfo.task_level
                  _this.updateTask()
                  _this.updateWeekTask()
                })
              } else {
                uni.showToast({
                	title: data ? data.message : '设置梦想收入失败，请稍候再试',
                  icon: 'none'
                })
              }
            }
          })
        }
      },
      hideDreamPop() {
        this.dreamShow = false
      },
      showSituation() {
        if (this.weekTaskArr.length <= 0) {
          for (let index = 0; index < 52; index ++) {
            this.$set(this.weekTaskArr, index, -1)
          }
        }
        if (!this.weekTaskState) {
          this.$http({
            url: this.$apis.weekTask,
            method: 'GET',
            data: null,
            cb: (err, data) => {
              if (!err && data.success) {
                this.weekTaskState = true
                for (let index = 0; index < data.data.length; index ++) {
                  this.$set(this.weekTaskArr, index, data.data[index])
                }
                this.$set(this.weekTaskArr, data.data.length, 2)
              } else {
                uni.showToast({
                	title: data ? data.message : '获取数据失败，请稍后再试',
                  icon: 'none'
                })
                return
              }
            }
          })
        }
        this.situationShow = true
      },
      hideSituation() {
        this.situationShow = false
      },
      gotoRecruit() {
        this.$navigateTo({
        	url: '/pages/partner/recruit'
        })
      },
      gotoInvite() {
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
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .bg{
    top: 0; left: 0; z-index: 0; width: 100%;
  }
  .notset{
    justify-content: center; align-items: center; height: 376upx;
    .txt{
      margin-bottom: 68upx; font-size: $font-size-32; line-height: 44upx; color: $color-2;
    }
    .btn{
      width: 208upx; height: 64upx; font-size: $font-size-28; line-height: 64upx; color: $default-color; background-color: $color-2; border-radius: 64upx;
    }
  }
  .dream{
    padding: 60upx 0 20upx;
    .tit{
      margin-bottom: 10upx; font-size: $font-size-32; line-height: 44upx; color: $color-2;
    }
    .num{
      justify-content: center; height: 90upx; font-size: 90upx; color: $color-2;
      image{
        align-self: flex-end; margin-left: 16upx; width: 38upx; height: 38upx;
      }
    }
    .text{
      margin-bottom: 28upx; font-size: $font-size-28; line-height: 40upx; color: $color-2;
    }
    .progress{
      justify-content: center; align-items: center; margin-bottom: 10upx; font-size: $font-size-24; font-weight: 700; line-height: 34upx; color: $color-2;
      .progress-con{
        width: 360upx; height: 16upx; margin-right: 10upx; border: $border-1; border-color: $color-2; border-radius: 16upx;
        .progress-chunk{
          height: 100%; background-color: $color-2; border-radius: 16upx;
        }
      }
    }
    .now{
      font-size: $font-size-24; line-height: 34upx; color: $color-2;
    }
  }
  .details{
    padding: 0 20upx; margin-bottom: 20upx;
    .details-con{
      padding-top: 30upx; background: $task-linear-2; box-shadow: $box-shadow; border-radius: $border-radius;
      .tit{
        margin-bottom: 14upx; font-size: $font-size-32; font-weight: 700; line-height: 44upx; color: $color-white;
      }
      .btn{
        top: 30upx; right: 20upx; height: 44upx; padding: 0 20upx; font-size: $font-size-20; line-height: 44upx; color: $color-white; border: $border-1; border-color: $color-white; border-radius: 44upx;
      }
      .data{
        padding: 48upx 0 20upx; font-size: $font-size-24; line-height: 34upx; color: $color-white;
        .num{
          margin-bottom: 14upx; font-size: 60upx; line-height: 60upx;
        }
      }
      .seal{
        top: 14upx; left: 66upx; width: 104upx; height: 104upx; pointer-events: none;
      }
    }
  }
  .state{
    padding: 0 20upx; margin-bottom: 20upx;
    .state-con{
      justify-content: space-between; align-items: center; height: 140upx; padding: 0 30upx 0 60upx; font-size: $font-size-30; line-height: 42upx; color: $color; background-color: $color-white; box-shadow: $box-shadow; border-radius: $border-radius;
      .btn{
        width: 180upx; height: 60upx; font-size: $font-size-28; line-height: 60upx; color: $default-color; background: $default-btn-linear; border-radius: 60upx;
      }
    }
  }
  .tab-hd-2{
    margin-bottom: 30upx;
  }
  .task-lists{
    padding: 0 20upx;
    .item{
      align-items: center; height: 180upx; padding: 0 20upx 0 10upx; margin-bottom: 20upx; background-color: $color-white; box-shadow: $box-shadow; border-radius: $border-radius;
      .num{
        width: 100upx; height: 100upx; margin-right: 8upx;
        image{
          width: 100%; height: 100%;
        }
      }
      .text{
        font-size: $font-size-28; line-height: 48upx; color: $color;
        .tit{
          margin-bottom: 20upx; font-size: $font-size-32; font-weight: 700; line-height: 44upx; color: $default-color;
        }
        .btn{
          view{
            width: 210upx; height: 48upx; margin-left: 40upx; font-size: $font-size-24; font-weight: 700; line-height: 48upx; color: $color-white; background: $task-linear; border-radius: 48upx;
            &.gray{
              color: $default-color; background: $level-1-bg; pointer-events: none;
            }
          }
        }
      }
      .btn-box{
        view{
          width: 118upx; height: 52upx; font-size: $font-size-22; font-weight: 700; line-height: 52upx; color: $default-color; background: $default-btn-linear; border-radius: 52upx;
        }
        image{
          width: 102upx; height: 102upx;
        }
      }
    }
  }
  .no-record{
    padding-bottom: 20upx; margin-bottom: 20upx; background-color: $color-white; border-radius: $border-radius;
  }
  .invites{
    padding: 0 20upx 20upx;
    .invites-con{
      align-items: center; height: 116upx; padding: 0 20upx; font-size: $font-size-32; font-weight: 700; color: $default-color; background-color: $color-white; box-shadow: $box-shadow; border-radius: $border-radius;
      image{
        width: 72upx; height: 72upx; margin-right: 20upx;
      }
      .btn{
        width: 140upx; height: 52upx; margin-left: 20upx; font-size: $font-size-22; line-height: 52upx; background: $default-btn-linear; border-radius: 52upx;
      }
    }
  }
  .pop{
    .btn-close{
      top: -100upx; right: 0; width: 72upx; height: 72upx;
    }
    &.pop-situation{
      .tit{
        height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
      }
      .scroll-box{
        max-height: 707upx;
        .text{
          padding: 0 30upx 30upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
          text{
            font-weight: 700; color: $color;
          }
        }
        .lists{
          padding: 30upx 0 0 50upx;
          .item{
            width: 80upx; margin: 0 34upx 30upx 0; font-size: $font-size-22; line-height: 32upx; color: $color-gray;
            .status{
              justify-content: center; align-items: center; width: 80upx; height: 80upx; margin-bottom: 10upx; font-size: $font-size-18; color: $color-white; border: $border-1; border-color: $color-2; border-radius: 100%;
            }
            &.finish .status{
              background: linear-gradient(180deg, rgba(132, 196, 214, 1), rgba(98, 125, 214, 1)); border: none;
            }
            &.unfinished .status{
              background: linear-gradient(180deg, rgba(250, 217, 97, 1),rgba(247, 107, 28, 1)); border: none;
            }
            &.ongoing .status{
              background: linear-gradient(-180deg, rgba(40, 199, 111, 1),rgba(129, 251, 184, 1)); border: none;
            }
          }
        }
      }
    }
    &.pop-dream{
      .pop-con-2{
        border-radius: 20upx;
        .explain{
          padding: 40upx 56upx 22upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray-5;
        }
        .num{
          margin-bottom: 10upx; font-size: 90upx; line-height: 90upx; color: $color-2;
        }
        .line{
          margin: 0 auto 10upx; width: 140upx; height: 4upx; background-color: $color-2;
        }
        .tips{
          font-size: $font-size-28; line-height: 40upx; color: $color;
        }
        .control{
          justify-content: center; padding: 40upx 0 70upx;
          .bar{
            width: 480upx;
            slider{
              margin: 0;
            }
            .lists{
              top: 0; left: 0; z-index: 2; justify-content: space-between; width: 100%; height: 100%; pointer-events: none;
              .item{
                width: 0; height: 100%;
                .dot{
                  top: 50%; left: 50%; width: 24upx; height: 24upx; background-color: $color-white; border: $border-1; border-color: $color-2; border-radius: 100%; transform: translate(-50%, -50%);
                }
                .num{
                  top: calc(100% + 20upx); left: 50%; width: 100upx; font-size: $font-size-24; line-height: 34upx; color: $color-2; transform: translateX(-50%);
                }
                &.on .dot{
                  background-color: $color-2;
                }
              }
            }
            .icon{
              top: 50%; z-index: 2; width: 64upx; height: 64upx; transform: translate(-50%, -50%); pointer-events: none;
            }
          }
        }
        .btn-box{
          justify-content: center; padding: 40upx 0;
          view{
            width: 272upx; height: 84upx; margin: 0 15upx; font-size: $font-size-28; font-weight: 700; line-height: 84upx; color: $color-4; text-align: center; background: $default-btn-linear; border-radius: 84upx;
          }
        }
      }
    }
    &.pop-redpacket{
      .pop-con-2{
        width: 582upx; height: 714upx; background: none;
        .bg{
          top: 0; left: 0; z-index: 0; width: 100%;
        }
        .text{
          margin-bottom: 30upx; font-size: $font-size-32; line-height: 44upx; color: $color-2; text-align: center; opacity: .8;
        }
        .front{
          align-items: center; width: 100%; height: 100%;
          .open-btn{
            width: 220upx; height: 220upx; margin: 132upx auto 88upx; perspective: 1000; transform: rotateZ(0);
            image{
              top: 0; left: 0; width: 100%; height: 100%;
              &.icon-front{
                transform: rotateY(0deg);
              }
              &.icon-back{
                transform: rotateY(-180deg);
              }
            }
            &.animate{
              .icon-front{
                animation: flip1 1.6s infinite;
              }
              .icon-back{
                animation: flip2 1.6s infinite;
              }
            }
          }
        }
        .back{
          align-items: center; width: 100%; height: 100%;
          .num{
            margin: 66upx auto 206upx; font-size: 120upx; font-weight: 700; line-height: 168upx; color: #EF273A;
            text{
              font-size: 60upx;
            }
          }
          .btn{
            width: 320upx; height: 80upx; font-size: $font-size-28; font-weight: 700; line-height: 80upx; color: $default-color; background: $default-btn-linear; border-radius: 80upx;
          }
        }
      }
    }
  }
  @keyframes flip1{
    0%{ transform: rotateY(0deg); }
    100%{ transform: rotateY(360deg); }
  }
  @keyframes flip2{
    0%{ transform: rotateY(-180deg); }
    100%{ transform: rotateY(180deg); }
  }
</style>
