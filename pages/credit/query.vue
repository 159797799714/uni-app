<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="banner" v-if="advLists.length > 0">
					<view class="item">
						<image :src="advLists[0].url" mode="widthFix"></image>
					</view>
				</view>
        <view class="query">
        	<!-- 最近申请 S -->
          <view class="apply-lists" v-if="orderLists.length > 0">
            <view class="title">
            	<view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>最新活动</view>
            </view>
            <view class="lists">
              <view class="item uni-pr uni-flex" v-for="item in orderLists" :key="item.id">
                <image :src="item.bank_logo_url"></image>
                <view class="text uni-flex-item">
                  <view class="name-bank uni-flex">{{ item.bank_name }}<text>{{ item.create_time }}</text></view>
                  <view class="name">姓名:&nbsp;{{ item.name }}</view>
                  <view class="phone">手机号:&nbsp;{{ item.mobile }}</view>
                </view>
                <view class="btn uni-pa uni-box uni-txc" @click="gotoContent(item)">查询进度</view>
              </view>
            </view>
            <view class="more-btn uni-txc" @click="gotoOrder">查看更多</view>
          </view>
          <!-- 最近申请 E -->
          <!-- 银行查询 S -->
          <div class="bank-lists" v-if="bankLists.length > 0">
            <view class="title-2 uni-flex">
            	<view class="uni-pr">
            		按银行查询
            		<image src="../../static/images/icon/icon-title.png" class="line line-left uni-pa"></image>
            		<image src="../../static/images/icon/icon-title.png" class="line line-right uni-pa"></image>
            	</view>
            </view>
            <view class="lists uni-flex uni-flex-wrap">
              <view class="item uni-flex uni-column uni-box" v-for="item in bankLists" :key="item.id" @click="gotoQueryBank(item)" :class="{'gray': item.isopen === 2}">
                <image :src="item.logo_url"></image>
                <view class="txc">{{ item.name }}</view>
              </view>
            </view>
          </div>
          <!-- 银行查询 E -->
        </view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				advLists: [],
        orderLists: [],
        bankLists: []
			};
		},
		onLoad() {
			// banner
			this.$http({
				url: this.$apis.adverts,
				method: 'GET',
				data: {
					place: 3
				},
				cb: (err, data) => {
					if (!err && data.success) {
						this.advLists = data.data
					}
				}
			})
      // 最近申请
      this.$http({
        url: this.$apis.orderLatest,
        method: 'GET',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            this.orderLists = data.data
            this.orderLists.forEach(item => {
              item.create_time = this.$utils.formatTimes(item.create_time)
            })
          }
        }
      })
      // 银行列表
      this.$http({
      	url: this.$apis.banks,
      	method: 'GET',
      	data: null,
      	cb: (err, data) => {
      		if (!err && data.success) {
      			this.bankLists = data.data
      		}
      	}
      })
		},
    methods: {
      gotoContent(item) {
        let obj = {
          name: item.name,
          idcard: item.id_card,
          mobile: item.mobile
        }
        uni.setStorageSync('queryInfo', JSON.stringify(obj))
        this.$navigateTo({
        	url: './queryBank?id=' + item.apply_id + '&bankCode=' + item.bank_code
        })
      },
      gotoQueryBank(item) {
        if (item.isopen === 2) {
        	uni.showToast({
        		title: '该银行即将上线',
        		icon: 'none'
        	})
        	return
        }
        this.$navigateTo({
        	url: './queryBank?bankCode=' + item.code
        })
      },
      gotoOrder() {
        this.$navigateTo({
          url: '/pages/mine/order'
        })
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
  .apply-lists{
    margin: 0 20upx 20upx; background-color: $color-white; border-radius: $border-radius;
    .item{
      align-items: center; height: 160upx; padding: 0 26upx; border-bottom: $border-1;
      image{
        width: 96upx; height: 96upx; margin-right: 26upx;
      }
      .text{
        .name-bank{
          justify-content: space-between; align-items: center; height: 36upx; margin-bottom: 8upx; color: $default-color;
          text{
            font-size: $font-size-24; color: $color-gray;
          }
        }
        .name, .phone{
          font-size: $font-size-24; line-height: 34upx; color: $color-gray;
        }
      }
      .btn{
        right: 26upx; bottom: 24upx; width: 144upx; height: 48upx; font-size: $font-size-22; line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: 48upx;
      }
    }
    .more-btn{
      font-size: $font-size-28; line-height: 80upx; color: $color;
    }
  }
  .bank-lists{
    margin-bottom: 20upx;
    .lists{
      padding-left: 20upx;
      .item{
        align-items: center; width: 234upx; height: 200upx; padding-top: 18upx; margin: 0 4upx 4upx; line-height: 36upx; color: $default-color; background-color: $color-white; border-radius: $border-radius;
        image{
          width: 120upx; height: 120upx; margin-bottom: 8upx;
        }
        &.gray{
          filter: grayscale(100%);
        }
      }
    }
  }
</style>
