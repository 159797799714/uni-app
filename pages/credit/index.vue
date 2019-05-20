<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="banner" v-if="advLists.length > 0">
					<view class="item">
						<image :src="advLists[0].url" mode="widthFix"></image>
					</view>
				</view>
        <view class="recommend">
        	<view class="title">
        		<view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>精选推荐</view>
        	</view>
          <view class="lists uni-flex uni-flex-wrap">
          	<view class="item uni-pr uni-flex uni-column uni-box" v-for="(item, index) in recommend" :key="index" @click="gotoRecommend(item)">
          		<text class="uni-textover">{{ item.title }}</text>
          		<text class="gray uni-textover">{{ item.tag }}</text>
              <image :src="item.url" class="uni-pa"></image>
          	</view>
          </view>
        </view>
        <view class="bank" v-if="bankLists.length > 0">
        	<view class="title-2 uni-flex">
        		<view class="uni-pr">
        			推荐银行
        			<image src="../../static/images/icon/icon-title.png" class="line line-left uni-pa"></image>
        			<image src="../../static/images/icon/icon-title.png" class="line line-right uni-pa"></image>
        		</view>
        	</view>
          <view class="lists uni-flex uni-flex-wrap uni-ovh">
          	<view class="item uni-pr uni-flex uni-column uni-box uni-txc uni-ovh" :class="{'gray': item.isopen === 2}" v-for="item in bankLists" :key="item.id" @click="gotoBank(item)">
          		<view class="tag uni-pa">{{ item.tags ? item.tags : '' }}</view>
              <image :src="item.logo_url" mode="aspectFill"></image>
              <view class="name uni-textover">{{ item.name }}</view>
              <view class="intro uni-textover">{{ item.short_desc }}</view>
              <view class="intro uni-textover">已申请：{{ item.count_order }}</view>
              <view class="reward uni-flex uni-box" @click.stop="showRule(item)" v-if="userInfo.role >= 1 && item.isopen !== 2">
              	<view>奖金</view>
                <view class="earn">&yen;{{ item.earn }}</view>
                <view class="arrow"></view>
              </view>
              <view class="apply uni-box" v-else-if="userInfo.role < 1 && item.isopen !== 2">申请办卡</view>
              <view class="apply uni-box" v-else-if="item.isopen === 2">即将开放</view>
          	</view>
          </view>
        </view>
        <view class="query">
        	<view class="query-con uni-flex uni-box" @click="gotoQuery">
        		<image src="../../static/images/icon/icon-progress.png" class="icon"></image>
            <view class="box uni-flex-item">
            	<view class="bold">申请进度查询</view>
              <view>一键查询您在本平台申请的信用卡审批进度</view>
            </view>
            <image src="../../static/images/icon/icon-more.png" class="arrow"></image>
        	</view>
        </view>
        <view class="card" v-if="cardLists.length > 0">
        	<view class="title">
        		<view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>热门卡片</view>
        	</view>
          <view class="lists">
          	<view class="item uni-flex uni-box" v-for="item in cardLists" :key="item.id" @click="gotoCard(item.id)">
          		<image :src="item.logo_url" mode="aspectFill"></image>
              <view class="box uni-flex-item">
              	<view class="name uni-textover">{{ item.card_name }}</view>
                <view class="gray uni-textover">{{ item.short_desc }}</view>
                <view class="tag uni-flex" v-if="item.tagArr.length > 0">
                	<view class="tag-item uni-box" v-for="(tagitem, tagindex) in item.tagArr" :key="tagindex">{{ tagitem }}</view>
                </view>
              </view>
          	</view>
          </view>
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
				recommend: [
          {
            title: '新手办卡',
            tag: '办好卡 送好礼',
            url: '/static/images/credit/card-new.png',
            id: 1
          },
          {
          	title: '大额度',
          	tag: '额度任性带你飞',
          	url: '/static/images/credit/card-high.png',
          	id: 2
          },
          {
          	title: '审批快',
          	tag: '至快当天下卡',
          	url: '/static/images/credit/card-fast.png',
          	id: 3
          },
          {
          	title: '易下卡',
          	tag: '门槛低 易通过',
          	url: '/static/images/credit/card-easy.png',
          	id: 4
          }
        ],
        bankLists: [],
        cardLists: [],
        rewardData: {}
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      }
    },
		onLoad() {
      // banner
      this.$http({
        url: this.$apis.adverts,
        method: 'GET',
        data: {
          place: 2
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.advLists = data.data
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
      // 热门信用卡
      this.$http({
        url: this.$apis.card,
        method: 'GET',
        data: {
          ishot: 1
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.cardLists = data.data
            this.cardLists.forEach(item => {
            	this.$set(item, 'tagArr', this.handleStr(item.show_tags))
            })
          }
        }
      })
		},
    methods: {
      handleStr(str) {
      	return str.split(',')
      },
      gotoRecommend(item) {
        this.$navigateTo({
        	url: '/pages/credit/recommend?id=' + item.id + '&title=' + item.title
        })
      },
      gotoBank(item) {
        if (item.isopen === 2) {
          uni.showToast({
          	title: '该银行即将上线',
            icon: 'none'
          })
          return
        }
        this.$navigateTo({
        	url: './bank?bankId=' + item.id + '&bankCode=' + item.code
        })
      },
      gotoQuery() {
        this.$navigateTo({
        	url: '/pages/credit/query'
        })
      },
      gotoCard(id) {
        this.$navigateTo({
        	url: '/pages/credit/card?id=' + id
        })
      },
      showRule(item) {
        this.rewardData = {
          show: true,
          total: item.earn,
          conditionTitle: item.clearing_title,
          conditionDec: item.clearing_info
        }
        this.changeBank = item
      },
      gotoHandle: function () {
        uni.setStorageSync('createCredit', true)
        this.$navigateTo({
        	url: './bank?bankId=' + this.changeBank.id + '&bankCode=' + this.changeBank.code
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
  .recommend{
    background-color: $color-white;
    .title{
      margin-bottom: 0;
    }
    .item{
      justify-content: center; width: 50%; height: 160upx; padding: 0 146upx 0 30upx; font-size: $font-size-28; font-weight: 700; line-height: 40upx;
      .gray{
        margin-top: 8upx; font-size: $font-size-22; font-weight: normal; line-height: $font-size-22 + 10upx; color: $color-gray;
      }
      image{
        top: 50%; right: 40upx; width: 96upx; height: 96upx; margin-top: -48upx;
      }
    }
  }
  .bank{
    margin-bottom: 20upx;
    .lists{
      padding-left: 20upx;
      .item{
        &.gray{
          filter: grayscale(100%);
        }
        align-items: center; width: 234upx; height: 352upx; padding: 44upx 10upx 0; margin: 0 4upx 4upx 0; background-color: $color-white; border-radius: $border-radius;
        .tag{
          top: 12upx; right: 16upx; padding: 0 12upx; font-size: $font-size-18; line-height: 1.778em; color: $color-2; background: $bg-linear-chunk; border-radius: 4upx;
        }
        image{
          width: 120upx; height: 120upx; margin-bottom: 8upx;
        }
        .name{
          height: 36upx; line-height: 36upx;
        }
        .intro{
          height: 32upx; font-size: $font-size-22; line-height: 32upx; color: $color-gray;
        }
        .reward{
          justify-content: center; align-items: center; width: 180upx; height: 48upx; margin: 16upx auto 0; font-size: $font-size-22; line-height: 48upx; color: $color; border: 1px solid $color; border-radius: 48upx;
          .earn{
            margin-left: 8upx;
          }
          .arrow{
            width: 0; height: 0; margin-left: 8upx; border-width: 12upx 7.2upx 0; border-style: solid; border-color: $color transparent transparent;
          }
        }
        .apply{
          width: 180upx; height: 48upx; margin: 16upx auto 0; font-size: $font-size-22; line-height: 48upx; color: $color; border: 1px solid $color; border-radius: 48upx;
        }
      }
    }
  }
  .query{
    padding: 0 20upx; margin-bottom: 20upx;
    .query-con{
      align-items: center; padding: 20upx 30upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: $color-gray; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
      .icon{
        width: 92upx; height: 92upx; margin-right: 30upx;
      }
      .bold{
        margin-bottom: 2upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
      }
      .arrow{
        width: 24upx; height: 48upx;
      }
    }
  }
</style>
