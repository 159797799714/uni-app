<template>
  <view class="container">
    <view class="banner uni-ovh">
      <view v-for="item in banner" :key="item.id">
        <rich-text :nodes="item.content"></rich-text>
      </view>
    </view>
    <view class="tab-hd-2 uni-pr uni-flex uni-txc">
      <view @click="tabClick(index)" class="item uni-flex-item" :class="{'on': index === tabIndex}" v-for="(item, index) in tabLists" :key="index">{{ item.name }}</view>
      <view class="actived uni-pa" :style="{'left': tabIndex * 100 / tabLists.length + 50 / tabLists.length + '%'}"></view>
    </view>
    <view class="content">
      <scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scroll="scrollUpdate">
        <view class="team-lists" v-if="teamLists.length > 0">
          <view class="item" v-for="(item, index) in teamLists" :key="index">
            <view class="info uni-flex">
              <view class="avatar">
                <image :src="item.avatar_url ? item.avatar_url : defaultAvatar" mode=""></image>
              </view>
              <view class="name uni-flex-item uni-ovh">
                <view class="id uni-flex"><text class="uni-textover">{{ item.username }}</text> (ID:{{ item.id }})<view class="tag uni-pr uni-flex uni-box" :class="[item.role >= 2 ? 'has' : '', 'tag-' + item.role]" @click.prevent.stop="showVipExplain(true)"><levelImg :role="item.role"></levelImg><toDecima :str="item.role" :type="4"></toDecima></view></view>
                <view class="bonus uni-flex"><text class="first">总收入: {{ item.bonus }}</text><text>锁粉: {{ item.child_count }}人</text></view>
                <view class="time uni-flex"><toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="offer uni-txr">
                <view class="big" v-if="tabIndex === 0">已{{ item.diff_day >= 100 ? '99+' : item.diff_day }}天</view>
                <view class="big" v-else>{{ item.diff_day === 0 ? '刚刚' : (item.diff_day >= 100 ? '99+' : item.diff_day) + '天前' }}</view>
                <view>{{ tabIndex === 0 ? '未登录' : '登录了' }}{{ config.system_nick_name }}</view>
              </view>
            </view>
            <view class="opera uni-flex">
              <view class="opera-con uni-flex">
                <view class="uni-flex btn-call" @click="call(item.mobile)"><image src="/static/images/icon/icon-call.png"></image>拨打电话</view>
                <view class="uni-flex" @click="showWechat(item.wx_number, item.wx_qrcode_url)" :class="{'gray': !item.wx_number && !item.wx_qrcode_url}"><image src="/static/images/icon/icon-wechat.png" mode=""></image>微信联系</view>
              </view>
              <view class="btn-called" @click="createPoster(item)" v-if="tabIndex === 0">去唤醒</view>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view>尚无{{ tabIndex === 0 ? '待': '已' }}唤醒好友</view>
        </view>
      </scroll-view>
    </view>
    <!-- 复制微信号码 S -->
    <view class="pop pop-wechat" v-show="wechatFlag">
      <view class="mask" @click="hideWechat"></view>
      <view class="pop-con">
        <view class="tit">{{ wechatQrCode.length > 0 ? '长按二维码关注微信' : '复制至微信添加' }}</view>
        <view class="wx">
          <image :src="wechatQrCode" v-if="wechatQrCode.length > 0" mode="widthFix"></image>
          <view>{{ wechatStr }}</view>
        </view>
        <view class="operation uni-flex uni-box">
        	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        		<view class="uni-flex-item" @click="hideWechat" v-if="wechatQrCode.length > 0">知道了</view>
        		<view class="uni-flex-item" @click="copy(wechatStr)" v-else>复制</view>
        	</view>
        </view>
      </view>
    </view>
    <!-- 复制微信号码 E -->
    <poster :posterData="posterData"></poster>
    <!-- 权益介绍 S -->
    <relation :relationData="relationData"></relation>
    <!-- 权益介绍 E -->
  </view>
</template>

<script>
  import poster from './poster.vue'
  import relation from '../../components/relation.vue'
  
  export default {
    components: {
      poster,
      relation
    },
    data() {
      return {
        banner: [],
        tabLists: [
          {
            name: '待唤醒'
          },
          {
            name: '已唤醒'
          }
        ],
        tabIndex: 0,
        loading: true,
        teamLists: [],
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        wechatFlag: false,
        wechatStr: '',
        wechatQrCode: '',
        alertData: {},
        posterData: {},
        relationData: {}
      }
    },
    computed: {
      config() {
        return this.$store.state.config
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.teamLists.length > 0
      },
      showNoRecord() {
        return this.teamLists.length <= 0 && !this.loading
      }
    },
    onLoad() {
      this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: 12
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.banner = data.data
            this.banner.forEach(item => {
              item.content = item.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
            })
          }
        }
      })
      this.loading = false
      this.updateLists()
    },
    methods: {
      tabClick(n) {
        if (this.tabIndex === n || this.loading) return
        this.tabIndex = n
        this.currentPage = 1
        this.updateLists()
      },
      updateLists() {
        if (this.loading) return
        this.loading = true
        if (this.currentPage <= 1) {
          this.teamLists = []
        }
        switch (this.tabIndex) {
          case 0:
            this.$http({
              url: this.$apis.waitforCall,
              method: 'GET',
              data: {
                page: this.currentPage
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  this.currentPage = data.data.current_page
                  this.maxPage = data.data.last_page
                  let oldArr = this.teamLists
                  let newArr = data.data.data
                  this.teamLists = oldArr.concat(newArr)
                } else {
                  uni.showToast({
                  	title: '服务器繁忙，请稍后再试',
                    icon: 'none'
                  })
                }
                this.loading = false
              }
            })
            break
          case 1:
            this.$http({
              url: this.$apis.alreadrCall,
              method: 'GET',
              data: {
                page: this.currentPage
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  this.currentPage = data.data.current_page
                  this.maxPage = data.data.last_page
                  let oldArr = this.teamLists
                  let newArr = data.data.data
                  this.teamLists = oldArr.concat(newArr)
                } else {
                  uni.showToast({
                  	title: '服务器繁忙，请稍后再试',
                    icon: 'none'
                  })
                }
                this.loading = false
              }
            })
            break
        }
      },
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.teamLists.length > 0) {
          this.currentPage ++
          this.updateLists()
        }
      },
      showWechat(str, url) {
        if (!str && !url) return
        this.wechatStr = str
        this.wechatQrCode = url || ''
        this.wechatFlag = true
      },
      hideWechat() {
        this.wechatFlag = false
      },
      call(num) {
        if (!num) {
          uni.showToast({
          	title: '用户未填写手机号码',
            icon: 'none'
          })
        } else {
          uni.makePhoneCall({
          	phoneNumber: num
          })
        }
      },
      copy(str) {
        uni.setClipboardData({
        	data: str,
          success: () => {
            uni.showModal({
              title: '复制成功',
              content: '微信已复制，请打开微信查找添加',
              showCancel: false
            })
          },
          fail: () => {
            uni.showModal({
              title: '复制失败',
              content: str,
              showCancel: false
            })
          },
          complete: () => {
          	this.hideWechat()
          }
        })
      },
      showVipExplain(b) {
        this.relationData = {
          show: b
        }
      },
      createPoster(item) {
        let type = 8
        if (item.role >= 2 || (item.role === 1 && item.is_finish === 1)) {
          // 如果是VIP，或者完成任务的普通会员
          type = 5
          this.posterData = {
            show: true,
            type: type
          }
        } else if (item.role === 0 && item.bonus !== '0.00') {
          // 余额不为0的临时用户
          type = 6
          this.posterData = {
            show: true,
            type: type,
            uid: item.id
          }
        } else if (item.role === 0 && item.bonus === '0.00') {
          // 余额为0的临时用户
          type = 7
          this.posterData = {
            show: true,
            type: type
          }
        } else if (item.role === 1 && item.is_finish === 0) {
          // 未完成任务的普通会员
          type = 9
          this.posterData = {
            show: true,
            type: type
          }
        }
      },
      posterError() {
        uni.showToast({
        	title: '海报生成失败',
          icon: 'none'
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .banner{
    height: 240upx;
  }
  .content{
    height: calc(100% - 318upx);
  }
  .team-lists{
    .item{
      border-bottom: $border-1;
      .info{
        justify-content: space-between; padding: 0 24upx; background-color: $color-white;
        .avatar{
          width: 96upx; height: 96upx; padding-top: 26upx; margin-right: 16upx;
          image{
            width: 100%; height: 100%; border-radius: 100%;
          }
        }
        .name{
          padding-top: 38upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .id{
            align-items: center; margin-bottom: 8upx; font-size: $font-size-28; font-weight: 700; line-height: 40upx; color: $default-color;
            text{
              max-width: 100upx; width: auto;
            }
            .tag{
              justify-content: center; align-items: center; width: 140upx; height: 40upx; margin-left: 12upx; font-size: $font-size-22; color: $color-4; background: $level-1-bg; border-radius: 40upx;
              &.has{
                width: 190upx; color: $color-white;
              }
              &.tag-1{
                background: $level-2-bg;
              }
              &.tag-2{
                background: $level-3-bg;
              }
              &.tag-3{
                background: $level-4-bg;
              }
              &.tag-4{
                background: $level-5-bg;
              }
              .bonus text, .time text{
                min-width: 160upx;
                &.first{
                  margin-right: 24upx;
                }
              }
            }
          }
        }
        .offer{
          padding-top: 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .big{
            font-size: $font-size-40; font-weight: 700; line-height: 56upx; color: $default-color;
          }
        }
      }
      .opera{
        justify-content: space-between; align-items: center; height: 80upx; padding: 0 24upx 0 112upx; background-color: $color-white;
        .opera-con{
          align-items: center; height: 100%;
          view{
            justify-content: center; align-items: center; height: 100%; font-size: $font-size-24; color: $default-color;
            image{
              width: 48upx; height: 48upx; margin-right: 8upx;
            }
            &.gray{
              filter: grayscale(100%); pointer-events: none;
            }
            &.btn-call{
              margin-right: 24upx;
            }
          }
        }
      }
      .btn-called{
        right: 24upx; bottom: 14upx; z-index: 3; height: 48upx; padding: 0 20upx; font-size: $font-size-22; line-height: 48upx; color: $default-color; background: $default-btn-linear; border-radius: 48upx;
      }
    }
  }
  .pop-wechat{
    .tit{
      padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
    }
    .wx{
      min-height: 120upx; padding: 0 30upx; font-size: $font-size-48; line-height: 66upx; color: $color;
      image{
        display: block; width: 320upx; margin: 0 auto;
      }
    }
  }
</style>
