<template>
	<view class="container">
    <view class="nav uni-pr uni-txc">
    	<view class="lists uni-pr uni-flex">
    		<view class="item uni-flex-item" v-for="(item, index) in navLists" :key="index" :class="{'on': navIndex === index}" @click="navChange(index)">{{ item.name }}</view>
    	</view>
    	<view class="actived uni-pa" :style="{'width': 100 / navLists.length + '%', 'left': navIndex * 100 / navLists.length + '%'}"></view>
    </view>
    <view class="tab-hd uni-box">
    	<view class="box uni-pr uni-txc">
    		<view class="lists uni-pr uni-flex">
    			<view class="item" v-for="(item, index) in tabLists[navLists[navIndex].status]" :key="index" :class="{'on': index === activeId, 'off': index !== activeId}" @click="tabChange(index, item.status)" :style="{'width': 100 / tabLists[navLists[navIndex].status].length * 1.3 + '%'}">{{ item.name }}<text v-show="index === activeId">({{ orderLength > 999 ? '999+' : orderLength }})</text></view>
    		</view>
    		<view class="actived uni-pa" :style="{'width': 100 / tabLists[navLists[navIndex].status].length * 1.3 + '%', 'left': activeId * (100 - 100 / tabLists[navLists[navIndex].status].length * 1.3) / (tabLists[navLists[navIndex].status].length - 1) + '%'}"></view>
    	</view>
    </view>
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scrolltolower="scrollUpdate">
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
        <!-- 订单列表 S -->
        <view class="order-lists" v-show="orderLists.length > 0 && !loading">
          <!-- 信用卡 S -->
          <view v-if="navLists[navIndex].status === 10">
            <view class="item uni-pr uni-flex uni-box uni-ovh" v-for="item in orderLists" :key="item.id">
              <view class="img-box uni-pr">
                <image :src="item.bank_logo_url" mode="aspectFit"></image>
                <image class="avatar uni-pa" :src="item.avatar_url ? item.avatar_url : defaultAvatar" mode="aspectFit"></image>
              </view>
              <view class="text uni-flex-item uni-flex uni-column">
                <view class="tit uni-textover">{{ item.bank_name }}信用卡{{ nameTips }}</view>
                <view class="uni-textover">申请人: {{ item.name }}<text class="mob">手机号: {{ item.mobile }}</text></view>
                <view class="uni-textover">经办人：{{ item.username }}<text>（ID：{{ item.uid }}）</text></view>
                <view class="times uni-textover">申请时间：<toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="expect uni-txr">
                <view class="num font-number">{{ item.earn }}</view>
                <view>预计收益(元)</view>
                <view class="err" v-if="item.zero_type === 1">非VIP申请</view>
                <view class="err" v-if="item.zero_type === 2">非本渠道</view>
                <view class="err" v-if="item.zero_type === 3">重复申请</view>
                <view class="err" v-if="item.zero_type === 4">已被拒批</view>
                <view class="err" v-if="item.zero_type === 5">级别低于下级</view>
              </view>
              <view class="btn-box uni-pa">
                <view class="box uni-flex">
                  <view class="uni-txc uni-box btn-del" @click="deleteOrder(item.id)">{{ activeId !== 4 ? '删除记录' : '彻底清除' }}</view>
                  <view class="uni-txc uni-box btn-query" @click="gotoContent(item.apply_id, item.bank_code, item.name, item.id_card, item.mobile)" v-show="activeId === 0 || activeId === 1">查询进度</view>
                  <view class="uni-txc uni-box btn-revoke" @click="deleteConfirm(item.id, 10)" v-show="activeId === 4">恢复记录</view>
                </view>
              </view>
            </view>
          </view>
          <!-- 信用卡 E -->
          <!-- 保险 S -->
          <view v-if="navLists[navIndex].status === 20">
            <view class="item uni-pr uni-flex uni-box uni-ovh" v-for="item in orderLists" :key="item.id">
              <view class="img-box pr">
                <image :src="item.company_logo_url" mode="aspectFit"></image>
                <image class="avatar uni-pa" :src="item.jb_avatar_url ? item.jb_avatar_url : defaultAvatar" mode="aspectFit"></image>
              </view>
              <view class="text uni-flex-item uni-flex uni-column">
                <view class="tit uni-textover">{{ item.product_name }}</view>
                <view class="uni-textover">保险公司: {{ item.company_name }}</view>
                <view class="uni-textover">投保人: {{ item.name }}<text class="mob">手机号: {{ item.mobile }}</text></view>
                <view class="uni-textover">经办人：{{ item.jb_username }}<text>（ID：{{ item.jb_uid }}）</text></view>
                <view class="times uni-textover">申请时间：<toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="expect uni-txr">
                <view class="num font-number">{{ item.earn }}</view>
                <view>预计收益(元)</view>
                <view class="err" v-if="item.zero_type === 1">非VIP申请</view>
                <view class="err" v-if="item.zero_type === 2">已退保</view>
                <view class="err" v-if="item.zero_type === 5">级别低于下级</view>
              </view>
              <view class="btn-box uni-pa">
                <view class="box uni-flex">
                  <view class="uni-txc uni-box" :class="{'disabled': insGetLinking}" @click="insGotoPay(item.apply_id)" v-if="activeId === 0">去支付</view>
                  <view class="uni-txc uni-box btn-del" @click="deleteOrder(item.id)">{{ activeId !== 4 ? '删除记录' : '彻底清除' }}</view>
                  <view class="uni-txc uni-box btn-revoke" @click="deleteConfirm(item.id, 10)" v-show="activeId === 4">恢复记录</view>
                </view>
              </view>
            </view>
          </view>
          <!-- 保险 E -->
          <!-- 贷款 S -->
          <view v-if="navLists[navIndex].status === 30">
            <view class="item uni-pr uni-flex uni-box uni-ovh" v-for="item in orderLists" :key="item.id">
              <view class="img-box uni-pr">
                <image :src="item.product_logo_url" mode="aspectFit"></image>
                <image class="avatar uni-pa" :src="item.avatar_url ? item.avatar_url : defaultAvatar" mode="aspectFit"></image>
              </view>
              <view class="text uni-flex-item uni-flex uni-column">
                <view class="tit uni-textover">{{ item.product_name }}</view>
                <view class="uni-textover">投保人: {{ item.name }}<text class="mob">手机号: {{ item.mobile }}</text></view>
                <view class="uni-textover">经办人：{{ item.username }}<text>（ID：{{ item.uid }}）</text></view>
                <view class="times uni-textover">申请时间：<toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="expect uni-txr">
                <view class="num font-number" :class="{'num-text': item.earn <= 1 && item.earn !== 0}">{{ item.earn > 1 && item.earn !== 0 ? item.earn : '待批款' }}</view>
                <view>预计收益(元)</view>
                <view class="err" v-if="item.zero_type === 1">非VIP申请</view>
                <view class="err" v-if="item.zero_type === 2">已拒批</view>
                <view class="err" v-if="item.zero_type === 5">级别低于下级</view>
              </view>
              <view class="btn-box uni-pa">
                <view class="box uni-flex">
                  <view class="uni-txc uni-box btn-del" @click="deleteOrder(item.id)">{{ activeId !== 4 ? '删除记录' : '彻底清除' }}</view>
                  <view class="uni-txc uni-box btn-revoke" @click="deleteConfirm(item.id, 10)" v-show="activeId === 4">恢复记录</view>
                </view>
              </view>
            </view>
          </view>
          <!-- 贷款 E -->
          <!-- 车险 S -->
          <view v-if="navLists[navIndex].status === 40">
            <view class="item uni-pr uni-flex uni-box uni-ovh" v-for="item in orderLists" :key="item.id">
              <view class="img-box pr">
                <image :src="item.logo_url" mode="aspectFit"></image>
                <image class="avatar uni-pa" :src="item.jb_avatar_url ? item.jb_avatar_url : defaultAvatar" mode="aspectFit"></image>
              </view>
              <view class="text uni-flex-item uni-flex uni-column">
                <view class="tit uni-textover">{{ item.product_name }}</view>
                <view class="uni-textover">车牌号: {{ item.license_no }}</view>
                <view class="uni-textover">投保人: {{ item.name }}<text class="mob">手机号: {{ item.mobile }}</text></view>
                <view class="uni-textover">经办人：{{ item.jb_username }}<text>（ID：{{ item.jb_uid }}）</text></view>
                <view class="times uni-textover">申请时间：<toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="expect uni-txr">
                <view class="num font-number">{{ item.earn }}</view>
                <view>预计收益(元)</view>
                <view class="err" v-if="item.zero_type === 1">非VIP申请</view>
                <view class="err" v-if="item.zero_type === 2">已拒批</view>
                <view class="err" v-if="item.zero_type === 5">级别低于下级</view>
              </view>
              <view class="btn-box uni-pa">
                <view class="box uni-flex">
                  <view class="uni-txc uni-box" @click="autoInsGotoUpload(item.biz_id)" v-if="(activeId === 0 || activeId === 1) && item.need_upload">去上传影像</view>
                  <view class="uni-txc uni-box" :class="{'disabled': autoInsGetLinking}" @click="autoInsGotoPay(item.apply_id)" v-if="activeId === 1 && !item.need_upload">去支付</view>
                  <view class="uni-txc uni-box btn-del" @click="deleteOrder(item.id)">{{ activeId !== 3 ? '删除记录' : '彻底清除' }}</view>
                  <view class="uni-txc uni-box btn-revoke" @click="deleteConfirm(item.id, 10)" v-show="activeId === 3">恢复记录</view>
                </view>
              </view>
            </view>
          </view>
          <!-- 车险 E -->
        </view>
        <!-- 订单列表 E -->
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view v-if="!searching">尚无相关订单</view>
          <view v-else>无订单信息</view>
        </view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navLists: [],
        navIndex: 0,
        tabLists: {
          '10': [
            {
              name: '待确认',
              status: 10
            },
            {
              name: '审批中',
              status: 20
            },
            {
              name: '已批卡',
              status: 30
            },
            {
              name: '未通过',
              status: 40
            },
            {
              name: '回收站',
              status: 100
            }
          ],
          '30': [
            {
              name: '已申请',
              status: 10
            },
            {
              name: '批款中',
              status: 20
            },
            {
              name: '已批款',
              status: 30
            },
            {
              name: '已拒批',
              status: 100
            },
            {
              name: '回收站',
              status: 0
            }
          ],
          '20': [
            {
              name: '未支付',
              status: 10
            },
            {
              name: '已支付',
              status: 20
            },
            {
              name: '已出单',
              status: 30
            },
            {
              name: '已退保',
              status: 100
            },
            {
              name: '回收站',
              status: 0
            }
          ],
          '40': [
            {
              name: '待核保',
              status: 10
            },
            {
              name: '待支付',
              status: 20
            },
            {
              name: '已投保',
              status: 30
            },
            {
              name: '回收站',
              status: 0
            }
          ]
        },
        activeId: 0, // 当前选中tab
        orderLists: [], // 订单数据
        orderLength: 0,
        deleteId: '',
        deleteType: 1,
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false, // 下拉加载中
        searchStr: '', // 搜索字段
        searching: false, // 搜索状态
        inputing: false,
        insGetLinking: false, // 请求保险支付链接
        autoInsGetLinking: false // 请求车险支付链接
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.orderLists.length > 0
      },
      isDelete() {
        return this.inputing && this.searchStr.length > 0
      },
      nameTips() {
        if (this.activeId === 0 || this.activeId === 4) return '浏览记录'
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      showSearch() {
        return (this.orderLists.length > 0 && !this.loading) || this.searching
      },
      showNoRecord() {
        return this.orderLists.length <= 0 && !this.loading
      }
    },
		onLoad(query) {
			if (this.config.module_control_card === this.$constant.MODULE_STATE_OPEN) {
        this.$set(this.navLists, this.navLists.length, {name: '信用卡', status: 10})
      }
      if (this.config.module_control_loan === this.$constant.MODULE_STATE_OPEN) {
        this.$set(this.navLists, this.navLists.length, {name: '贷款', status: 30})
      }
      if (this.config.module_control_insurance === this.$constant.MODULE_STATE_OPEN) {
        this.$set(this.navLists, this.navLists.length, {name: '保险', status: 20})
      }
      if (this.config.module_control_insurance_car === this.$constant.MODULE_STATE_OPEN) {
        this.$set(this.navLists, this.navLists.length, {name: '车险', status: 40})
      }
      if (parseInt(query.nav) <= this.navLists.length - 1 && parseInt(query.nav) >= 0) this.navIndex = parseInt(query.nav)
      if (parseInt(query.tab) <= this.tabLists[this.navLists[this.navIndex].status].length - 1 && parseInt(query.tab) >= 0) this.activeId = parseInt(query.tab)
      this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
		},
    methods: {
      navChange: function (n) {
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
        this.searchStr = ''
        this.searching = false
        this.orderLists = []
        this.orderLength = 0
        this.currentPage = 1
        this.maxPage = 1
        this.activeId = 0
        this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
      },
      tabChange (n, status) {
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
        this.searchStr = ''
        this.searching = false
        this.orderLists = []
        this.orderLength = 0
        this.currentPage = 1
        this.maxPage = 1
        this.getOrders(this.navLists[this.navIndex].status, status)
      },
      getOrders(navStatus, status) {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.orderLists = []
          this.orderLength = 0
        }
        switch (navStatus) {
          case 10:
            this.$http({
              url: this.$apis.order,
              method: 'GET',
              data: {
                page: this.currentPage,
                status: status,
                keyword: this.searchStr
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) {
                    this.orderLists = []
                    this.orderLength = 0
                  }
                	this.orderLength = data.data.total
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.orderLists
                	let newArr = data.data.data
                	this.orderLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取信用卡订单失败',
                    icon: 'none'
                  })
                }
              }
            })
            break
          case 20:
            let bxOrderType = 1
            let bxOrderState = ''
            if (status === 0) {
              bxOrderType = 10
            } else {
              bxOrderState = status
            }
            this.$http({
              url: this.$apis.insuranceOrderList,
              method: 'GET',
              data: {
                page: this.currentPage,
                status: bxOrderType,
                order_status: bxOrderState,
                keyword: this.searchStr
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) {
                    this.orderLists = []
                    this.orderLength = 0
                  }
                	this.orderLength = data.data.total
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.orderLists
                	let newArr = data.data.data
                	this.orderLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取保险订单失败',
                  	icon: 'none'
                  })
                }
              }
            })
            break
          case 30:
            let dkOrderType = 1
            let dkOrderState = ''
            if (status === 0) {
              dkOrderType = 10
            } else {
              dkOrderState = status
            }
            this.$http({
              url: this.$apis.loanOrderList,
              method: 'GET',
              data: {
                page: this.currentPage,
                status: dkOrderType,
                order_status: dkOrderState,
                keyword: this.searchStr
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) {
                    this.orderLists = []
                    this.orderLength = 0
                  }
                	this.orderLength = data.data.total
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.orderLists
                	let newArr = data.data.data
                	this.orderLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取贷款订单失败',
                  	icon: 'none'
                  })
                }
              }
            })
            break
          case 40:
            let cxOrderType = 1
            let cxOrderState = ''
            if (status === 0) {
              cxOrderType = 10
            } else {
              cxOrderState = status
            }
            this.$http({
              url: this.$apis.autoInsOrderlist,
              method: 'GET',
              data: {
                page: this.currentPage,
                status: cxOrderType,
                order_status: cxOrderState,
                keyword: this.searchStr
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) {
                    this.orderLists = []
                    this.orderLength = 0
                  }
                	this.orderLength = data.data.total
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.orderLists
                	let newArr = data.data.data
                	this.orderLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取保险订单失败',
                  	icon: 'none'
                  })
                }
              }
            })
            break
        }
      },
      insGotoPay(id) {
        if (this.insGetLinking) return
        this.insGetLinking = true
        this.$http({
          url: this.$apis.insurancePay,
          method: 'GET',
          data: {
            apply_id: id
          },
          cb: (err, data) => {
            if (!err && data.success) {
              uni.setStorageSync('webSrc', data.data.url)
              this.$navigateTo({
              	url: '/pages/web/index'
              })
            } else {
              uni.showToast({
              	title: '服务器繁忙，请稍后再试',
                icon: 'none'
              })
            }
            this.insGetLinking = false
          }
        })
      },
      autoInsGotoUpload(id) {
        this.$navigateTo({
        	url: '/pages/auto/upload?bizID=' + id
        })
      },
      autoInsGotoPay(id) {
        if (this.autoInsGetLinking) return
        this.autoInsGetLinking = true
        this.$http({
          url: this.$apis.autoInsPay,
          method: 'GET',
          data: {
            order_id: id
          },
          cb: (err, data) => {
            if (!err && data.success) {
            	if (data.data.need_verify_code) {
                this.$navigateTo({
                	url: 'pages/auto/code?bizID=' + data.data.bizID + '&mobile=' + data.data.verify_mobile
                })
            	} else if (data.data.payLink) {
                uni.setStorageSync('webSrc', data.data.payLink)
                this.$navigateTo({
                	url: '/pages/web/index'
                })
            	} else {
                uni.showToast({
                	title: '订单已提交，请耐心等待核保结果',
                  icon: 'none'
                })
            	}
            } else {
              uni.showToast({
              	title: '服务器繁忙，请稍后再试',
              	icon: 'none'
              })
            }
            this.autoInsGetLinking = false
          }
        })
      },
      deleteOrder(id) {
        this.deleteType = this.activeId === 4 ? 2 : 1
        this.deleteId = id
        uni.showModal({
        	content: '您确定要删除该订单吗？',
          success: res => {
          	if (res.confirm) {
              this.deleteConfirm()
            }
          }
        })
      },
      deleteConfirm(id, type) {
        if (this.navLists[this.navIndex].status === 10) {
          this.$http({
            url: this.$apis.deleteOrder,
            method: 'DELETE',
            data: {
              id: id || this.deleteId,
              type: type || this.deleteType
            },
            cb: (err, data) => {
              if (!err && data.success) {
                this.currentPage = 1
              	this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
              } else {
                uni.showToast({
                	title: data.message,
                  icon: 'none'
                })
              }
              this.deleting = false
            }
          })
        } else if (this.navLists[this.navIndex].status === 20) {
          this.$http({
            url: this.$apis.insuranceOrderDelete,
            method: 'DELETE',
            data: {
              id: id || this.deleteId,
              type: type || this.deleteType
            },
            cb: (err, data) => {
              if (!err && data.success) {
                this.currentPage = 1
              	this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
              } else {
              	uni.showToast({
              		title: data.message,
              		icon: 'none'
              	})
              }
              this.deleting = false
            }
          })
        } else if (this.navLists[this.navIndex].status === 30) {
          this.$http({
            url: this.$apis.loanOrderDelete,
            method: 'DELETE',
            data: {
              id: id || this.deleteId,
              type: type || this.deleteType
            },
            cb: (err, data) => {
              if (!err && data.success) {
              	this.currentPage = 1
              	this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
              } else {
              	uni.showToast({
              		title: data.message,
              		icon: 'none'
              	})
              }
              this.deleting = false
            }
          })
        } else if (this.navLists[this.navIndex].status === 40) {
          this.$http({
            url: this.$apis.autoOrderDelete,
            method: 'DELETE',
            data: {
              id: id || this.deleteId,
              type: type || this.deleteType
            },
            cb: (err, data) => {
              if (!err && data.success === true) {
              	this.currentPage = 1
              	this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
              } else {
              	uni.showToast({
              		title: data.message,
              		icon: 'none'
              	})
              }
              this.deleting = false
            }
          })
        }
      },
      gotoContent(id, code, name, idcard, phone) {
        let obj = {
        	name: name,
        	idcard: idcard,
        	mobile: phone
        }
        uni.setStorageSync('queryInfo', JSON.stringify(obj))
        this.$navigateTo({
        	url: '/pages/credit/queryBank?id=' + id + '&bankCode=' + code
        })
      },
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.orderLists.length > 0) {
          this.currentPage ++
          this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
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
        this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
      },
      resetSearch() {
        this.currentPage = 1
        this.searchStr = ''
        this.searching = false
        this.getOrders(this.navLists[this.navIndex].status, this.tabLists[this.navLists[this.navIndex].status][this.activeId].status)
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .content{
    height: calc(100% - 224upx);
  }
  .order-lists{
    .item{
      justify-content: space-between; align-items: center; height: 268upx; padding: 0 24upx 92upx; background-color: $color-white; border-bottom: $border-1;
      .img-box{
        align-self: flex-start; width: 96upx; height: 96upx; padding-left: 38upx; margin: 32upx 16upx 0 0;
        image{
          width: 96upx; height: 96upx;
          &.avatar{
            top: 50%; left: 0; width: 76upx; height: 76upx; transform: translateY(-50%); border-radius: 100%;
          }
        }
      }
      .text{
        align-self: flex-end; justify-content: center; margin-right: 10upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
        .mob{
          margin-left: 10upx;
        }
        .tit{
          margin-bottom: 8upx; font-size: $font-size-26; font-weight: 700; line-height: 36upx; color: $default-color;
        }
      }
      .expect{
        font-size: $font-size-24; line-height: 34upx; color: $color-gray;
        .num{
          font-size: $font-size-48; line-height: 56upx; color: $default-color;
        }
        .num-text{
          font-size: $font-size-32;
        }
        .err{
          margin-top: 10upx; color: $color-err;
        }
      }
      .btn-box{
        right: 24upx; bottom: 22upx;
        .box{
          view{
            height: 48upx; padding: 0 20upx; margin-left: 10upx; font-size: $font-size-22; line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: 48upx;
            &.btn-del{
              color: $color-gray-5; border-color: $color-gray-5;
            }
            &.btn-query{
              color: $default-color; background: $default-btn-linear; border: none;
            }
          }
        }
      }
    }
  }
</style>
