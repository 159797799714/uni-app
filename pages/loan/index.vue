<template>
	<view class="container">
    <!-- banner S -->
    <view class="banner uni-ovh" v-if="advLists.length > 0">
    	<swiper indicator-dots="true" autoplay="true" interval="4000" duration="500" indicator-color="rgba(255, 255, 255, .3)" indicator-active-color="rgba(255, 255, 255, 1)" circular="true">
    		<swiper-item v-for="(item, index) in advLists" :key="index">
    			<view class="swiper-item">
            <image :src="item.url" mode="widthFix"></image>
          </view>
    		</swiper-item>
    	</swiper>
    </view>
    <!-- banner E -->
    <view class="enter uni-box">
      <view class="lists uni-flex uni-txc clearfix">
        <view class="item uni-flex-item uni-flex uni-column" @click="tabClick(3)">
          <image src="/static/images/loan/img-1.png"></image>
          <view>一定能贷到</view>
        </view>
        <view class="item uni-flex-item uni-flex uni-column" @click="tabClick(1)">
          <image src="/static/images/loan/img-2.png"></image>
          <view>小额快贷</view>
        </view>
        <view class="item uni-flex-item uni-flex uni-column" @click="tabClick(2)">
          <image src="/static/images/loan/img-3.png"></image>
          <view>大额低息</view>
        </view>
        <view class="item uni-flex-item uni-flex uni-column" @click="gotoOrder">
          <image src="/static/images/loan/img-4.png"></image>
          <view>我的订单</view>
        </view>
      </view>
    </view>
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scrolltolower="scrollUpdate">
        <!-- 列表 S -->
        <view class="lists" v-show="lists.length > 0">
          <view class="item" v-for="(item, index) in lists" :key="index" @click="gotoDetails(item.id)">
            <view class="info uni-flex">
              <image class="pic" :src="item.logo_url" mode="aspectFit"></image>
              <view class="name uni-flex-item uni-ovh">
                <view class="tit uni-textover">{{ item.name }}<text>{{ item.success_count }}人成功申请</text></view>
                <view class="tag uni-flex" v-if="item.tagArr">
                  <view class="tag-item uni-box" v-for="(tagitem, tagindex) in item.tagArr" :key="tagindex">{{ tagitem }}</view>
                </view>
              </view>
              <view class="btn-rule uni-box uni-txc" @click.prevent.stop="showRule(item)" v-if="isRole">
                <view class="val uni-flex" v-if="item.commission_type === 0">奖金{{ item.rate }}%<view class="arrow"></view></view>
                <view class="val uni-flex" v-else>奖金&yen;{{ item.rate }}<view class="arrow"></view></view>
              </view>
            </view>
            <view class="explain uni-flex uni-txc">
              <view class="uni-flex-item">
                <view class="text">最高额度</view>
                <view class="num"><text class="strong font-number">{{ item.max_price }}</text></view>
              </view>
              <view class="line"></view>
              <view class="uni-flex-item">
                <view class="text">参考{{ item.ref_rate_type === 0 ? '月' : '日' }}利率</view>
                <view class="num"><text class="em font-number">{{ item.ref_rate }}%</text></view>
              </view>
              <view class="line"></view>
              <view class="uni-flex-item">
                <view class="text">放贷时间</view>
                <view class="num"><text class="font-number">{{ item.apply_hour }}</text></view>
              </view>
            </view>
            <view class="btn uni-txc">立即申请</view>
          </view>
        </view>
        <!-- 列表 E -->
        <view class="no-record uni-flex uni-column" v-if="lists.length <= 0 && !loading">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view>暂无贷款列表</view>
        </view>
			</scroll-view>
		</view>
    <!-- 奖励规则 S -->
    <rewardRule :rewardData="rewardData" @gotoCreate="gotoHandle"></rewardRule>
    <!-- 奖励规则 E -->
	</view>
</template>

<script>
  import rewardRule from '../../components/rewardRule.vue'
  
	export default {
    components: {
      rewardRule
    },
		data() {
			return {
        advLists: [],
        lists: [],
        loanType: 0,
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false, // 加载中
        loanId: '',
        rewardData: {}
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      isRole() {
        return this.userInfo.role >= 1
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.lists.length > 0
      }
    },
		onLoad() {
      // banner
      this.$http({
        url: this.$apis.adverts,
        method: 'GET',
        data: {
          place: 7
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.advLists = data.data
          }
        }
      })
      // 列表
      this.updateLists()
		},
    methods: {
      handleStr(str) {
      	return str.split(',')
      },
      updateLists() {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.lists = []
        }
        this.$http({
          url: this.$apis.loanList,
          method: 'GET',
          data: {
            page: this.currentPage,
            type: this.loanType
          },
          cb: (err, data) => {
            if (!err && data.success === true) {
              this.currentPage = data.data.current_page
              this.maxPage = data.data.last_page
              let oldArr = this.lists
              let newArr = data.data.data
              newArr.forEach(item => {
                this.$set(item, 'tagArr', this.handleStr(item.tag_ids))
              })
              this.lists = oldArr.concat(newArr)
            } else {
              uni.showToast({
              	title: '获取贷款列表失败',
                icon: 'none'
              })
            }
            this.loading = false
          }
        })
      },
      tabClick(type) {
        if (this.loanType === type) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.currentPage = 1
        this.maxPage = 1
        this.loanType = type
        this.updateLists()
      },
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.lists.length > 0) {
          this.currentPage ++
          this.updateLists()
        }
      },
      gotoDetails(id) {
        this.$navigateTo({
        	url: '/pages/loan/details?loanId=' + id
        })
      },
      showRule(item) {
        this.loanId = item.id
        if (item.commission_type === 0) {
          this.rewardData = {
            show: true,
            total: item.max_price,
            conditionTitle: item.clearing_title,
            conditionDec: item.clearing_info,
            type: 1,
            name: 'dk',
            frPercent: item.rate
          }
        } else {
          this.rewardData = {
            show: true,
            total: item.rate,
            conditionTitle: item.clearing_title,
            conditionDec: item.clearing_info,
            name: 'dk'
          }
        }
      },
      gotoHandle() {
        uni.setStorageSync('createLoan', true)
        this.$navigateTo({
        	url: './details?loanId=' + this.loanId
        })
      },
      gotoOrder: function () {
        uni.setStorageSync('orderIndex', 1)
        this.$navigateTo({
          url: '/pages/mine/order?nav=1'
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
  @import '../../common/var';
	.banner{
	  height: 300upx; margin-bottom: 20upx;
	  swiper{
	    image{
	      width: 100%;
	    }
	  }
	}
  .enter{
    padding: 24upx 0; background-color: $color-white; border-bottom: $border-1;
    .item{
      align-items: center; font-size: $font-size-24; line-height: 34upx; color: $default-color;
      image{
        width: 80upx; height: 80upx; margin-bottom: 10upx;
      }
    }
  }
  .content{
    height: calc(100% - 494upx);
    .lists{
      padding-top: 20upx;
      .item{
        padding: 0 30upx; margin-bottom: 20upx; background-color: $color-white;
        .info{
          align-items: center; height: 88upx; padding: 30upx 0;
          .pic{
            width: 88upx; height: 88upx; margin-right: 20upx;
          }
          .tit{
            height: 50upx; margin-bottom: 6upx; font-size: $font-size-36; font-weight: 700; line-height: 50upx; color: $color-text;
            text{
              margin-left: 20upx; font-weight: normal; font-size: $font-size-26; color: $color-gray-2;
            }
          }
          .tag-item{
            padding: 0 10upx; margin-right: 8upx; font-size: $font-size-22; line-height: $font-size-22 + 10upx; color: $color; white-space: nowrap; border: 1px solid $color; border-radius: 4upx;
          }
          .btn-rule{
            height: 44upx; padding: 0 12upx; font-size: $font-size-22; line-height: 44upx; color: $color; border: $border-1; border-color: $color; border-radius: $border-radius;
            .val{
              justify-content: center; align-items: center; width: 100%; height: 100%;
            }
            .arrow{
              width: 0; height: 0; margin-left: 8upx; border-width: 12upx 7.2upx 0; border-style: solid; border-color: $color transparent transparent;
            }
          }
        }
        .explain{
          justify-content: center; align-items: center; padding: 20upx 0; font-size: $font-size-24; line-height: 44upx; color: $color-gray-2; border-top: $border-1;
          .uni-flex-item{
            max-width: 200upx;
          }
          .line{
            width: 1px; height: 80upx; background-color: $default-bg-color;
          }
          .num{
            height: 60upx; font-size: $font-size-32; line-height: 60upx; color: $color-gray-4;
          }
          .strong{
            font-size: $font-size-52; color: $color;
          }
          .em{
            font-size: $font-size-36; font-weight: normal;
          }
        }
        .btn{
          height: 80upx; font-size: $font-size-28; font-weight: 700; line-height: 80upx; color: $color; border-top: $border-1;
        }
      }
    }
  }
</style>
