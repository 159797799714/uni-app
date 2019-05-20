<template>
  <view class="container">
    <view class="content">
      <scroll-view scroll-y class="scroll-view" enable-back-to-top="true" scroll-with-animation="true" @scroll="scroll">
        <view class="box uni-pr uni-ovh">
        	<image src="/static/images/invite/bg.png" mode="widthFix" class="bg uni-pa" :class="{'has': callLists.data.length > 2}"></image>
          <view class="firend uni-pr uni-flex" v-if="callLists.data.length > 2">
            <view class="avatar-box uni-txc">
              <view class="avatar uni-flex">
                <image :src="item.avatar_url ? item.avatar_url : defaultAvatar" v-for="(item, index) in callLists.data" :key="index" v-if="callLists.data.length > 0 && index < 3" class="uni-pr uni-box" :style="{'z-index': index}"></image>
              </view>
            </view>
            <view class="uni-flex-item">有{{ callLists.total }}位好友一周都没有登陆{{ config.system_nick_name }}。</view>
            <view class="btn-call" @click="gotoCalled">去唤醒</view>
          </view>
          <view class="main uni-pr uni-ovh">
            <view class="task-lists" v-if="taskLists.length > 0">
              <view class="item uni-flex" v-for="(item, index) in taskLists" :key="index">
                <view class="num">
                  <image :src="'/static/images/number/num-' + (index + 1) + '.png'" mode=""></image>
                </view>
                <view class="text uni-flex-item uni-ovh">
                  <view class="tit uni-textover">{{ item.title }}</view>
                  <view class="btn uni-flex">完成{{ item.finish_num }}/{{ item.toward }}<view class="uni-txc" v-if="item.is_finish && item.red_envelope_amount === '0.00'" @click="showPacket(item.finish_id)">{{ item.reward }}</view><view class="uni-txc" v-if="item.is_finish === false && item.red_envelope_amount === '0.00'" @click="showPacket(false)">{{ item.reward }}</view><view class="gray uni-txc" v-if="item.is_finish && item.red_envelope_amount !== '0.00'">已抽{{ item.red_envelope_amount }}元</view></view>
                </view>
                <view class="btn-box uni-txc">
                  <view v-if="item.is_finish === false" @click="createPoster(item.code, item.uid)">去完成</view>
                  <image src="/static/images/task/ywc.png" mode="" v-else></image>
                </view>
              </view>
            </view>
            <view class="no-record uni-flex uni-column" v-if="taskLists.length <= 0 && !taskLoading">
            	<image src="/static/images/icon/icon-empty.png"></image>
            	<view>您没有邀请任务</view>
            </view>
            <view class="invites" v-if="config.module_control_task !== constant.MODULE_STATE_CLOSE" v-show="!taskLoading">
              <view class="invites-con uni-flex" @click="gotoTask">
                <image src="/static/images/icon/icon-task.png" mode=""></image>
                <view class="uni-flex-item">手指点点 领更多现金红包</view>
                <view class="btn uni-txc">立即前往</view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
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
    <poster :posterData="posterData"></poster>
  </view>
</template>

<script>
  import poster from './poster.vue'
  
  export default {
    components: {
      poster
    },
    data() {
      return {
        taskLoading: false,
        taskLists: [],
        callLists: {
          total: 0,
          data: []
        },
        redpacketShow: false,
        taskRedId: 0,
        opening: false,
        opened: false,
        isClickRed: false,
        scrrollTop: 0,
        nowScrollTop: 0,
        money: 0.00,
        posterData: {}
      }
    },
    computed: {
      config() {
        return this.$store.state.config
      },
      constant() {
      	return this.$constant
      },
      userInfo() {
        return this.$store.state.userInfo
      },
      isRole() {
        return this.userInfo.role > 0
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      }
    },
    onShow() {
      if (!this.isRole) {
        this.showTips()
      } else {
        this.updateTask()
        this.$http({
          url: this.$apis.waitforCall,
          method: 'GET',
          data: null,
          cb: (err, data) => {
            if (!err && data.success) {
              this.callLists = data.data
            }
          }
        })
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
      updateTask(cb) {
        if (!this.isRole) {
          this.showTips()
          return
        }
        if (this.taskLoading) return
        this.taskLoading = true
        this.taskLists = []
        this.$http({
          url: this.$apis.task,
          method: 'GET',
          data: {
            type: 4
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.taskLists = data.data
              this.isClickRed = false
              if (typeof cb === 'function') {
                cb()
              }
            } else {
              uni.showToast({
              	title: data ? data.message : '服务器繁忙，请稍后再试',
                icon: 'none',
              })
            }
            this.taskLoading = false
          }
        })
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
              this.nowScrollTop = scrrollTop
            }, 16.67)
          })
        }
        this.redpacketShow = false
      },
      gotoCalled() {
        this.$navigateTo({
        	url: '/pages/invite/called'
        })
      },
      createPoster(text, uid) {
        if (!this.isRole) {
          this.showTips()
          return
        }
        let type = 8
        switch (text) {
          case 'subscribe':
            type = 1
            break
          case 'invite_new':
            type = 2
            break
          case 'apply':
            type = 3
            break
          case 'banker':
            type = 4
            break
          case 'banker_advanced':
            type = 4
            break
        }
        this.posterData = {
          show: true,
          type: type,
          uid: uid
        }
      },
      posterError() {
        uni.showToast({
        	title: '海报生成失败',
          icon: 'none'
        })
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
      gotoEarning() {
        this.$navigateTo({
        	url: '/pages/mine/earning?tab=1'
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .box{
    min-height: 100%; background-color: #f3b65a;
  }
  .bg{
    top: 0; left: 0; z-index: 1; width: 100%;
    &.has{
      top: 100upx;
    }
  }
  .firend{
    z-index: 3; justify-content: space-between; align-items: center; height: 100upx; padding: 0 20upx; font-size: $font-size-24; color: $default-color; background-color: $color-white;
    .avatar-box{
      width: 140upx; height: 60upx; margin-right: 20upx;
      .avatar{
        margin-left: 20upx;
        image{
          width: 60upx; height: 60upx; margin-left: -20upx; border: $border-1; border-color: $color; border-radius: 100%;
        }
      }
    }
    .btn-call{
      height: 50upx; padding: 0 20upx; line-height: 50upx; background: $default-btn-linear; border-radius: 50upx;
    }
  }
  .main{
    z-index: 3; padding: 260upx 20upx 0;
    .task-lists{
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
      padding-bottom: 20upx;
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
  }
  .pop{
    .btn-close{
      top: -100upx; right: 0; width: 72upx; height: 72upx;
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
