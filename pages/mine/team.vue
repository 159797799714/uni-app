<template>
  <view class="container">
    <view class="nav uni-pr uni-txc">
    	<view class="lists uni-pr uni-flex">
    		<view class="item uni-flex-item" v-for="(item, index) in navLists" :key="index" :class="{'on': navIndex === index}" @click="navChange(index)">{{ item.name }}<text v-show="navIndex === index">（{{ index === 0 ? userInfo.zt_count : userInfo.tz_count }}）</text></view>
    	</view>
    	<view class="actived uni-pa" :style="{'width': 100 / navLists.length + '%', 'left': navIndex * 100 / navLists.length + '%'}"></view>
    </view>
    <view class="tab-hd uni-flex uni-box">
    	<view class="box uni-pr uni-flex-item uni-txc">
    		<view class="lists uni-pr uni-flex">
    			<view class="item uni-flex-item" v-for="(item, index) in tabLists[navLists[navIndex].type]" :key="index" :class="{'on': index === activeId, 'off': index !== activeId}" @click="tabChange(index, item.role)" :style="{'width': 100 / tabLists[navLists[navIndex].type].length * 1.3 + '%'}">{{ item.name }}</view>
    		</view>
    		<view class="actived uni-pa" :style="{'width': 100 / tabLists[navLists[navIndex].type].length + '%', 'left': activeId * 100 / tabLists[navLists[navIndex].type].length + '%'}"></view>
    	</view>
      <view class="btn-sort uni-flex" @click="showSortPop"><image src="/static/images/icon/icon-order.png" mode=""></image></view>
    </view>
    <view class="content">
      <scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scrolltolower="scrollUpdate">
        <view class="total uni-flex">
          <text>{{ tabLists[navLists[navIndex].type][activeId].title }}：{{ listsLength }}名</text>
          <view class="uni-flex" @click.prevent.stop="showExplain(true)">{{ navIndex === 0 ? '会员体系' : '拓展体系' }}<image src="/static/images/icon/icon-explain3.png"></image></view>
        </view>
        <!-- 搜索 S -->
        <view class="search" v-show="showSearch">
          <view class="uni-pr">
            <input class="uni-box" type="search" placeholder="请输入会员ID/手机号" placeholder-class="input-placeholder" v-model="searchStr" @confirm="search">
            <image class="icon-search uni-pa" src="/static/images/icon/icon-search.png"></image>
            <view class="btn-search uni-pa uni-txc" @click="search" v-if="!searching || inputing">搜索</view>
            <view class="btn-search uni-pa uni-txc" @click="resetSearch" v-else>重置</view>
          </view>
        </view>
        <!-- 搜索 E -->
        <view class="lists" v-show="lists.length > 0 && !loading">
          <view v-for="item in lists" :key="item.id" class="item" :class="{'on': item.show}">
            <view class="info uni-flex" :class="{'info-sx': tabLists[navLists[navIndex].type][activeId].role === 0}">
              <view class="avatar">
                <image :src="item.avatar_url ? item.avatar_url : defaultAvatar" mode=""></image>
              </view>
              <view class="name uni-flex-item">
                <view class="id uni-flex"><text class="yhj textover">{{ item.username }}</text> (ID:{{ item.id }})</view>
                <view class="bonus uni-flex"><text class="first">总收入: {{ item.bonus }}</text><text v-if="tabLists[navLists[navIndex].type][activeId].role !== 0">锁粉: {{ item.child_count }}人</text></view>
                <view class="time uni-flex"><toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="offer uni-txr">
                <view class="num font-number">{{ item.offer_bonus ? item.offer_bonus : '0.00' }}</view>
                <view>贡献收益(元)</view>
              </view>
            </view>
            <view class="opera uni-flex" v-if="tabLists[navLists[navIndex].type][activeId].role !== 0">
              <view class="opera-con uni-flex">
                <view class="uni-flex btn-call" @click="call(item.mobile)"><image src="/static/images/icon/icon-call.png"></image>拨打电话</view>
                <view class="uni-flex" @click="showWechat(item.wx_number, item.wx_qrcode_url)" :class="{'gray': !item.wx_number && !item.wx_qrcode_url}"><image src="/static/images/icon/icon-wechat.png" mode=""></image>微信联系</view>
              </view>
              <view class="zztype" v-if="tabLists[navLists[navIndex].type][activeId].role === 4">
                <text v-if="item.agent_type === 2">付费升级</text>
                <text v-else-if="item.agent_type === 1">完成任务升级</text>
                <text v-else-if="item.agent_type === 3">完成任务升级</text>
                <text v-else>完成任务升级</text>
              </view>
              <view class="btn-progress" v-if="tabLists[navLists[navIndex].type][activeId].role > 0 && tabLists[navLists[navIndex].type][activeId].role < 4" @click="slideToggle(item)">查看升级进度</view>
            </view>
            <view class="progress-con uni-ovh" v-if="tabLists[navLists[navIndex].type][activeId].role > 0 && tabLists[navLists[navIndex].type][activeId].role < 4">
              <view class="progress-box uni-flex uni-column uni-box" v-if="item.pregressArr">
                <view class="explain">根据最新的升级规则，需<label v-if="item.pregressArr.child_toward">锁粉<text>{{ item.pregressArr.child_toward }}</text>人，</label>邀请<text>{{ item.pregressArr.banker_toward }}名VIP</text>即可升级</view>
                <view class="details-box uni-flex">
                  <view class="details-con uni-flex-item uni-flex uni-column" v-if="item.pregressArr.child_toward">
                    <view class="big">{{ item.pregressArr.child }} 人</view>
                    <view>锁粉</view>
                  </view>
                  <view class="details-con uni-flex-item uni-flex uni-column">
                    <view class="big">{{ item.pregressArr.banker }} 名</view>
                    <view>发展VIP</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view v-if="!searching">{{ tipText }}</view>
          <view v-else>无团队信息</view>
        </view>
      </scroll-view>
    </view>
    <view class="pop pop-sort" v-show="showSort">
      <view class="mask" @click="hideSortPop"></view>
      <view class="pop-con">
        <view class="sort-lists uni-txc">
        	<view class="uni-pr" :class="{'on': sortStatus === index}" v-for="(item, index) in sortLists" :key="index" @click="clickSort(index, item.status)" v-if="!(tabLists[navLists[navIndex].type][activeId].role === 0 && (item.status === 5 || item.status === 6))">{{ item.name }}<image src="/static/images/icon/icon-select.png" class="uni-pa" mode=""></image></view>
        </view>
      </view>
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
    <!-- 权益介绍 S -->
    <relation :relationData="relationData"></relation>
    <!-- 权益介绍 E -->
  </view>
</template>

<script>
  import relation from '../../components/relation.vue'
  
  export default {
    components: {
      relation
    },
    data() {
      return {
        navLists: [
          {
            name: '直推团队',
            type: 1
          },
          {
            name: '拓展团队',
            type: 2
          }
        ],
        navIndex: 0,
        tabLists: {
          '1': [
            {
              name: '锁粉',
              title: '锁粉客户',
              role: 0
            },
            {
              name: '普通',
              title: '普通会员',
              role: 1
            },
            {
              name: '黄金',
              title: '黄金VIP',
              role: 2
            },
            {
              name: '铂金',
              title: '铂金VIP',
              role: 3
            },
            {
              name: '钻石',
              title: '钻石VIP',
              role: 4
            }
          ],
          '2': [
            {
              name: '黄金',
              title: '黄金VIP',
              role: 2
            },
            {
              name: '铂金',
              title: '铂金VIP',
              role: 3
            },
            {
              name: '钻石',
              title: '钻石VIP',
              role: 4
            }
          ]
        },
        activeId: 0, // 当前选中tab
        lists: [],
        listsLength: 0,
        sortLists: [
          {
            name: '时间从后到先',
            status: 3
          },
          {
            name: '时间从先到后',
            status: 4
          },
          {
            name: '收益从高到低',
            status: 5
          },
          {
            name: '收益从低到高',
            status: 6
          }
        ],
        sortStatus: 0,
        sortType: 3,
        showSort: false,
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false, // 加载中
        searchStr: '', // 搜索字段
        searching: false, // 搜索状态
        inputing: false,
        wechatFlag: false,
        wechatStr: '',
        wechatQrCode: '',
        relationData: {}
      }
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      role() {
        return this.userInfo.role
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.lists.length > 0
      },
      tipText() {
        return '尚无' + this.tabLists[this.navLists[this.navIndex].type][this.activeId].title
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      showSearch() {
        return (this.lists.length > 0 && !this.loading) || this.searching
      },
      showNoRecord() {
        return this.lists.length <= 0 && !this.loading
      }
    },
    onLoad() {
      this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
    },
    methods: {
      navChange(n) {
        if (this.navIndex === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.loading = false
        this.navIndex = n
        this.sortStatus = 0
        this.sortType = 3
        this.searchStr = ''
        this.searching = false
        this.lists.length = 0
        this.listsLength = 0
        this.currentPage = 1
        this.maxPage = 1
        this.activeId = 0
        this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
      },
      tabChange(n) {
        if (this.activeId === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.loading = false
        this.activeId = n
        this.sortStatus = 0
        this.sortType = 3
        this.searchStr = ''
        this.searching = false
        this.currentPage = 1
        this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
      },
      updateLists(type, role) {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.lists.length = 0
          this.listsLength = 0
        }
        let sortType = this.sortType
        if (this.tabLists[this.navLists[this.navIndex].type][this.activeId].role === 0) {
          if (this.sortType === 3) {
            sortType = 1
          } else if (this.sortType === 4) {
            sortType = 2
          }
        }
        this.$http({
          url: this.$apis.myTeam,
          method: 'GET',
          data: {
            type: type,
            role: role,
            order: sortType,
            page: this.currentPage,
            keyword: this.searchStr
          },
          cb: (err, data) => {
            if (parseInt(this.currentPage) <= 1) {
              this.lists.length = 0
              this.listsLength = 0
            }
            if (!err && data.success) {
              this.listsLength = data.data.total
              this.currentPage = data.data.current_page
              this.maxPage = data.data.last_page
              let oldArr = this.lists
              let newArr = data.data.data
              this.lists = oldArr.concat(newArr)
              this.lists.forEach(item => {
                this.$set(item, 'show', false)
              })
              if (this.searchStr.length > 0) this.searching = true
              setTimeout(() => {
                this.loading = false
              }, 600)
            } else {
              this.searching = false
              this.loading = false
              uni.showToast({
              	title: '获取团队数据失败',
                icon: 'none'
              })
            }
          }
        })
      },
      showSortPop() {
        this.showSort = true
      },
      hideSortPop() {
        this.showSort = false
      },
      clickSort(n, type) {
        this.sortStatus = n
        this.hideSortPop()
        this.sortType = type
        this.searchStr = ''
        this.searching = false
        this.currentPage = 1
        this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
      },
      slideToggle(that) {
        this.lists.forEach(item => {
          item.show = item.id === that.id ? !item.show : false
        })
        if (!that.pregressArr) {
          this.$http({
            url: this.$apis.sxProgress,
            method: 'GET',
            data: {
              id: that.id
            },
            cb: (err, data) => {
              if (!err && data.success) {
                this.$set(that, 'pregressArr', data.data)
              } else {
                that.show = false
                uni.showToast({
                	title: '获取升级进度数据失败',
                  icon: 'none'
                })
              }
            }
          })
        }
      },
      search() {
        if (this.searchStr.length <= 0) {
          uni.showToast({
          	title: '请输入搜索内容',
            icon: 'none'
          })
          return
        }
        this.currentPage = 1
        this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
      },
      resetSearch() {
        this.currentPage = 1
        this.searchStr = ''
        this.searching = false
        this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
      },
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.lists.length > 0) {
          this.currentPage ++
          this.updateLists(this.navLists[this.navIndex].type, this.tabLists[this.navLists[this.navIndex].type][this.activeId].role)
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
      showExplain(b) {
        if (this.navIndex === 0) {
          this.relationData = {
            show: b
          }
        } else {
          uni.showModal({
          	title: '拓展体系',
            content: '您的团队成员每人会贡献2个VIP进入您的拓展团队，平台将给予您5%的额外奖励。',
            showCancel: false,
            confirmText: '知道了'
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .tab-hd{
    align-items: center;
    .btn-sort{
      justify-content: center; align-items: center; width: 96upx; height: 100%;
      image{
        width: 48upx; height: 48upx;
      }
    }
  }
  .content{
    height: calc(100% - 224upx);
  }
  .total{
    justify-content: space-between; align-items: center; height: 54upx; padding: 0 20upx; font-size: $font-size-26; color: $color-gray-4; background-color: $input-bg;
    view{
      align-items: center; color: $color;
      image{
        width: 32upx; height: 32upx; margin-left: 10upx;
      }
    }
  }
  .lists{
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
          view{
            align-items: center;
            &.id{
              margin-bottom: 8upx; font-size: $font-size-28; font-weight: 700; line-height: 40upx; color: $default-color;
            }
            .yhj{
              max-width: 200upx;
            }
            .first{
              margin-right: 20upx;
            }
          }
        }
        .offer{
          padding-top: 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .num{
            font-size: $font-size-48; line-height: 56upx; color: $default-color;
          }
        }
        &.info-sx{
          align-items: center; height: 1.44rem;
          .avatar, .name, .offer{
            padding-top: 0;
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
      .zztype{
        z-index: 3; height: 36upx; padding: 0 10upx; font-size: $font-size-20; line-height: 36upx; color: $color; border: $border-1; border-color: $color; border-radius: $border-radius;
      }
      .btn-progress{
        right: 24upx; bottom: 14upx; z-index: 3; height: 48upx; padding: 0 20upx; font-size: $font-size-22; line-height: 48upx; color: $default-color; background: $default-btn-linear; border-radius: 48upx;
      }
      .progress-con{
        height: 0; transition: height .4s ease;
        .progress-box{
          padding-top: 20upx;
        }
      }
      &.on{
        .progress-con{
          height: 264upx;
        }
      }
    }
  }
  .no-record{
    height: calc(100% - 54upx);
  }
  .pop-sort{
    .sort-lists{
      view{
        height: 120upx; font-size: $font-size-32; line-height: 120upx; color: $default-color; border-bottom: $border-1;
        image{
          top: 50%; right: 30upx; display: none; width: 48upx; height: 48upx; transform: translateY(-50%);
        }
        &.on{
          color: $color;
          image{
            display: block;
          }
        }
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
