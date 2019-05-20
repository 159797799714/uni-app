<template>
	<view class="container">
    <image class="bg uni-pa" src="../../static/images/bg.png" mode="aspectFill"></image>
    <!-- 金额 S -->
    <view class="profit uni-pr uni-box uni-txc">
    	<view class="total uni-pa">
    		<view class="num font-number">{{ userInfo.bonus }}</view>
    		<view class="text">总收入(元)</view>
    	</view>
    	<view class="stay uni-flex uni-box">
    		<view class="stay-con uni-flex-item">
    			<view class="num font-number">{{ userInfo.balance }}</view>
    			<view class="text">可提现金额(元)</view>
    		</view>
    		<view class="stay-con uni-flex-item">
    			<view class="num font-number">{{ userInfo.djs }}</view>
    			<view class="text">待结算佣金(元)</view>
    		</view>
    		<view class="stay-con uni-flex-item">
    			<view class="num font-number">{{ userInfo.expect }}</view>
    			<view class="text">预期佣金(元)</view>
    		</view>
    	</view>
    	<view class="btn-put uni-pa uni-flex uni-box" @click="gotoCash">提现<image src="../../static/images/icon/icon-arrow-l.png"></image></view>
    </view>
    <!-- 金额 E -->
    <view class="tab-hd-2 uni-pr uni-flex uni-txc">
      <view @click="tabClick(index)" class="item uni-flex-item" :class="{'on': index === tabIndex}" v-for="(item, index) in tabLists" :key="index">{{ item.name }}</view>
      <view class="actived uni-pa" :style="{'left': tabIndex * 100 / tabLists.length + 50 / tabLists.length + '%'}"></view>
    </view>
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
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
        <!-- 收入列表 S -->
        <view class="lists" :class="{'wx-lists': tabIndex === 2, 'hb-lists': tabIndex === 1}" v-show="earningLists.length > 0 && !loading">
          <view class="item" v-for="item in earningLists" :key="item.id" :class="{'wait': parseInt(item.status) === 1}">
            <view class="box uni-flex uni-box" v-if="tabIndex === 0">
              <image :src="item.logo_url" mode="aspectFit"></image>
              <view class="text uni-flex-item">
                <view class="tit uni-textover" v-if="item.from_type === 1">{{ item.order_name }}(信用卡)</view>
                <view class="tit uni-textover" v-else-if="item.from_type === 2">{{ item.order_name }}(保险)</view>
                <view class="tit uni-textover" v-else-if="item.from_type === 3">{{ item.order_name }}(贷款)</view>
                <view class="tit uni-textover" v-else-if="item.from_type === 4">{{ item.order_name }}(车险)</view>
                <view class="tit uni-textover" v-else>{{ item.order_name }}</view>
                <view class="uni-textover">申请人: {{ item.name }}<text class="mob">手机号: {{ item.mobile }}</text></view>
                <view class="uni-textover">经办人：{{ item.username }}<text>（ID：{{ item.uid }}）</text></view>
                <view class="times">申请时间：<toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="amount uni-flex uni-txr">
                <view class="num font-number">+{{ item.amount }}</view>
                <view>{{ item.status === 1 ? '未结算' : '已结算' }}</view>
              </view>
            </view>
            <view class="box uni-flex uni-box" :class="{'gray': parseInt(item.status) !== 200}" v-else-if="tabIndex === 2">
              <image src="/static/images/weixin.png" mode="aspectFit"></image>
              <view class="text uni-flex-item">
                <view class="tit uni-textover">微信钱包提现</view>
                <view><toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <view class="amount uni-flex uni-txr">
                <view class="num font-number">-{{ item.total_fee }}</view>
                <view v-if="parseInt(item.status) === 100">审核失败</view>
                <view v-else-if="parseInt(item.status) === 200">提现成功</view>
                <view v-else-if="parseInt(item.status) === 1 || parseInt(item.status) === 10">审核中</view>
                <view v-else>提现失败</view>
              </view>
            </view>
            <view class="box uni-flex uni-box" v-else-if="tabIndex === 1">
              <image src="/static/images/redpacket/redpacket.png" mode="aspectFit"></image>
              <view class="text uni-flex-item">
                <view class="tit uni-textover">红包收入<text v-if="item.type === 3 && parseInt(item.amount) === 20">(新VIP红包)</text><text v-if="item.type === 3 && parseInt(item.amount) === 100">(新钻石VIP红包)</text></view>
                <view><toDecima :str="item.add_time" :type="1"></toDecima></view>
              </view>
              <view class="amount uni-flex uni-txr">
                <view class="num font-number">+{{ item.amount }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-if="earningLists.length <= 0 && !loading">
        	<image src="/static/images/icon/icon-empty.png"></image>
        	<view v-if="!searching">{{ tipsText }}</view>
        	<view v-else>无收入信息</view>
        </view>
        <!-- 收入列表 E -->
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabLists: [
          {
            name: '收入明细'
          },
          {
            name: '红包明细'
          },
          {
            name: '提现记录'
          }
        ],
        tabIndex: 0,
        earningLists: [],
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false, // 加载中
        searchStr: '', // 搜索字段
        searching: false, // 搜索状态
        inputing: false
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.earningLists.length > 0
      },
      tipsText() {
        return '尚无' + this.tabLists[this.tabIndex].name
      },
      showSearch() {
        return ((this.earningLists.length > 0 && !this.loading) || this.searching) && this.tabIndex === 0
      }
    },
		onLoad(query) {
			if (parseInt(query.tab) <= this.tabLists.length - 1 && parseInt(query.tab) >= 0) this.tabIndex = parseInt(query.tab)
      this.updateLists(this.tabIndex)
		},
    methods: {
      gotoCash() {
        this.$navigateTo({
        	url: '/pages/mine/cash'
        })
      },
      tabClick(n) {
        if (this.tabIndex === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.tabIndex = n
        this.searchStr = ''
        this.searching = false
        this.currentPage = 1
        this.updateLists(this.tabIndex)
      },
      updateLists(n) {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) this.earningLists = []
        switch (n) {
          case 0:
            this.$http({
              url: this.$apis.earningList,
              method: 'GET',
              data: {
                page: this.currentPage,
                keyword: this.searchStr
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) this.earningLists = []
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.earningLists
                	let newArr = data.data.data
                	this.earningLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取收支明细失败',
                    icon: 'none'
                  })
                }
              }
            })
            break
          case 1:
            this.$http({
              url: this.$apis.redpacketList,
              method: 'GET',
              data: {
                page: this.currentPage
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  if (parseInt(this.currentPage) <= 1) this.earningLists = []
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.earningLists
                	let newArr = data.data.data
                	this.earningLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                  setTimeout(() => {
                    this.loading = false
                  }, 600)
                } else {
                	this.searching = false
                  this.loading = false
                  uni.showToast({
                  	title: '获取红包明细失败',
                  	icon: 'none'
                  })
                }
              }
            })
            break
          case 2:
            this.$http({
              url: this.$apis.withdrawLists,
              method: 'GET',
              data: {
                page: this.currentPage
              },
              cb: (err, data) => {
                if (!err && data.success === true) {
                	this.currentPage = data.data.current_page
                	this.maxPage = data.data.last_page
                	let oldArr = this.earningLists
                	let newArr = data.data.data
                	this.earningLists = oldArr.concat(newArr)
                	if (this.searchStr.length > 0) this.searching = true
                } else {
                	this.searching = false
                  uni.showToast({
                  	title: '获取提现明细失败',
                    icon: 'none'
                  })
                }
                this.loading = false
              }
            })
            break
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
        this.updateLists(this.tabIndex)
      },
      resetSearch() {
        this.currentPage = 1
        this.searchStr = ''
        this.searching = false
        this.updateLists(this.tabIndex)
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .bg{
    top: 0; left: 0; z-index: 1; width: 100%; height: 280upx;
  }
  .profit{
    background: none;
    .num{
      color: $color-2;
    }
    .text{
      color: $color-white;
    }
    .btn-put{
      color: $color-2; border-color: $color-2;
    }
  }
  .content{
    height: calc(100% - 378upx);
  }
  .lists{
    padding-bottom: 20upx;
    .item{
      height: 202upx; background-color: $color-white; border-bottom: $border-1;
      .box{
        justify-content: space-between; height: 100%; padding: 28upx 24upx 0;
        image{
          width: 96upx; height: 96upx; margin-right: 16upx;
        }
        .text{
          margin-right: 10upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .mob{
            margin-left: 10upx;
          }
          .tit{
            margin-bottom: 8upx; font-size: $font-size-26; font-weight: 700; line-height: 36upx; color: $default-color;
          }
        }
        .amount{
          flex-direction: column; justify-content: center; align-items: flex-end; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .num{
            font-size: $font-size-48; line-height: 56upx; color: $default-color;
          }
        }
      }
      &.wait .amount .num{
        color: $color-gray-5;
      }
    }
    &.wx-lists{
      .box{
        align-items: center; padding-top: 0;
        &.gray .amount .num{
          color: $color-gray;
        }
      }
    }
    &.hb-lists{
      .box{
        align-items: center; padding-top: 0;
        .tit{
          margin-bottom: 16upx; font-size: $font-size-32;
          text{
            font-size: $font-size-26; color: $color-gray;
          }
        }
      }
    }
  }
</style>
