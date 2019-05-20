<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
				<view v-if="loanInfo">
					<view class="intro uni-txc">
					  <view class="pic uni-flex">
					    <image :src="loanInfo.logo_url" mode="aspectFit"></image>
					  </view>
					  <view class="name uni-textover">{{ loanInfo.name }}</view>
					  <view class="company uni-textover">{{ loanInfo.company_name }}</view>
					  <view class="max uni-ovh">
					    <view class="text">最高可借额度（元）</view>
					    <view class="num font-number">{{ loanInfo.max_price }}</view>
					    <view class="explain uni-flex" v-if="loanInfo.tagArr">
					      <view class="uni-flex-item uni-box" :class="{'line': tagIndex > 0}" v-for="(tagitem, tagIndex) in loanInfo.tagArr" :key="tagIndex">{{ tagitem }}</view>
					    </view>
					  </view>
					</view>
          <view class="other uni-flex uni-txc">
          	<view class="other-left uni-flex-item uni-flex">
          		<view class="other-con uni-flex-item">
          			<view class="val uni-textover">{{ loanInfo.loan_time_range }}</view>
                <view class="txt">贷款期限</view>
          		</view>
              <view class="other-con uni-flex-item">
              	<view class="val uni-textover">{{ loanInfo.ref_rate }}%</view>
              	<view class="txt">参考{{ loanInfo.ref_rate_type === 0 ? '月' : '日' }}利率</view>
              </view>
              <view class="other-con uni-flex-item">
              	<view class="val uni-textover">{{ loanInfo.apply_hour }}</view>
              	<view class="txt">放贷时间</view>
              </view>
          	</view>
            <view class="other-right" v-if="userInfo.role >= 1">
            	<view class="other-con uni-flex-item" @click="showRule(loanInfo)">
            		<view class="val uni-flex" v-if="loanInfo.commission_type === 0">{{ loanInfo.rate }}%<view class="tri"></view></view>
            		<view class="val uni-flex" v-else="">&yen;{{ loanInfo.rate }}<view class="tri"></view></view>
            		<view class="txt">佣金提成</view>
            	</view>
            </view>
          </view>
          <view class="main uni-ovh">
            <view class="condition">
              <view class="box uni-flex">
              	<view class="item uni-flex-item uni-flex">
              		<view class="tit">申请条件：</view>
                  <rich-text :nodes="loanInfo.apply_condition"></rich-text>
              	</view>
              </view>
              <view class="box uni-flex">
              	<view class="item uni-flex-item uni-flex">
              		<view class="tit">所需材料：</view>
                  <rich-text :nodes="loanInfo.apply_need"></rich-text>
              	</view>
              </view>
              <view class="remarks">备注：身份首次申请授信额度低于3000元，不发放奖励</view>
            </view>
            <view class="tips">
              <view><text>贷款须知：</text>务必在贷款前，向贷款提供方了解详细的贷款利息及手续费，贷款成功后收取的任何费用，与贷款方发生的任何纠纷与本平台无关。</view>
            </view>
          </view>
				</view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
        <view class="uni-flex uni-column" @click="gotoGuide"><image src="../../static/images/icon/nav-guide.png"></image><text>贷款攻略</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view v-if="userInfo.role > 0" class="uni-flex-item gray" @click="showSharePop">我要推广</view>
        <view class="uni-flex-item" :class="{'disabled': reqing}" @click="gotoHandle">我要贷款</view>
      </view>
    </view>
    <!-- 活动介绍 E -->
    <addContact :addData="addData"></addContact>
    <contact :contactData="contactData" @success="applySuccess" @add="gotoAdd"></contact>
    <!-- 奖励规则 S -->
    <rewardRule :rewardData="rewardData" @gotoCreate="gotoHandle"></rewardRule>
    <!-- 奖励规则 E -->
    <!-- 选择分享类型 S -->
    <view class="pop pop-share-type" v-show="popShareType">
      <view class="mask" @click="hideSharePop"></view>
      <view class="pop-con">
        <view class="spread uni-flex uni-txc">
          <view class="uni-flex-item uni-flex uni-column" :class="{'disabled': clickShareLinking}" @click="clickShareLink">
            <image src="/static/images/spread/share.png" mode=""></image>
            <text>链接分享</text>
          </view>
          <view class="uni-flex-item uni-flex uni-column" @click="clickSharePoster">
            <image src="/static/images/spread/poster.png" mode=""></image>
            <text>生成海报</text>
          </view>
        </view>
        <view class="shorturl uni-flex" v-if="false">
          <view class="txt uni-flex-item uni-box">{{ shorturl ? shorturl : '正在生成链接' }}</view>
          <view class="btn uni-txc" :class="{'disabled': !shorturl}" @click="copy(shorturl)">复制链接</view>
        </view>
        <view class="operation uni-flex uni-box">
          <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
          	<view class="uni-flex-item" @click="hideSharePop">取消</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 选择分享类型 S -->
    <poster :posterData="posterData"></poster>
	</view>
</template>

<script>
  import addContact from '../../components/addContact.vue'
  import contact from '../../components/contact.vue'
  import rewardRule from '../../components/rewardRule.vue'
  import poster from './poster.vue'
  
	export default {
    components: {
      addContact,
      contact,
      rewardRule,
      poster
    },
		data() {
			return {
				loanInfo: null,
        addData: {},
        contactData: {},
        reqing: false,
        rewardData: {},
        popShareType: false,
        posterData: {},
        shorturl: '',
        clickShareLinking: false
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      isRole() {
        return this.userInfo.role >= 1
      }
    },
		onLoad(query) {
			this.$http({
        url: this.$apis.loanDetails,
        method: 'GET',
        data: {
          id: query.loanId
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.loanInfo = data.data
            this.$set(this.loanInfo, 'tagArr', this.handleStr(this.loanInfo.tag_ids))
            uni.setNavigationBarTitle({
            	title: this.loanInfo.name
            })
            if (uni.getStorageSync('createLoan') === true) {
              this.gotoHandle()
              uni.removeStorageSync('createLoan')
            }
          } else {
            uni.showToast({
            	title: '获取贷款详情失败',
              icon: 'none'
            })
          }
        }
      })
		},
    onShow() {
      if (uni.getStorageSync('createLoan') === true && this.loanInfo) {
        this.gotoHandle()
        uni.removeStorageSync('createLoan')
      }
    },
    methods: {
      handleStr(str) {
      	return str.split(',')
      },
      gotoAdd() {
        this.addData = {
          show: true,
          productId: this.loanInfo.id,
          link: this.loanInfo.channel_url_link,
          state: 0,
          type: 'dk'
        }
      },
      gotoHandle() {
        if (this.reqing) return
        this.reqing = true
        this.$http({
        	url: this.$apis.contactList,
        	method: 'GET',
        	data: null,
        	cb: (err, data) => {
        		if (err || data.data.data.length <= 0) {
        			this.gotoAdd()
        		} else {
        			this.contactData = {
                show: true,
                productId: this.loanInfo.id,
                link: this.loanInfo.channel_url_link,
                state: 0,
                type: 'dk',
                index: -1
              }
        		}
        		this.reqing = false
        	}
        })
      },
      showRule(item) {
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
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      },
      gotoGuide() {
        this.$navigateTo({
        	url: '/pages/loan/guide?loanId=' + this.loanInfo.id
        })
      },
      showSharePop() {
        this.popShareType = true
      },
      hideSharePop() {
        this.popShareType = false
      },
      clickShareLink() {
        if (this.clickShareLinking) {
          uni.showToast({
          	title: '分享中，请勿频繁操作',
            icon: 'none'
          })
          return
        }
        this.clickShareLinking = true
        let str = this.$constant.shareUrl + '?pid=' + this.userInfo.id
        uni.getProvider({
        	service: 'share',
          success: res => {
            if (~res.provider.indexOf('weixin')) {
              uni.share({
              	provider: 'weixin',
              	type: 0,
                title: this.$store.state.config.system_nick_name,
                scene: 'WXSceneSession',
                summary: this.$store.state.config.platform_info,
                href: str,
                imageUrl: this.$store.state.config.logo,
              	success: res => {
                  console.log(res)
                },
              	fail: err => {
                  this.copy(str)
                },
              	complete: () => {
                  this.clickShareLinking = false
                }
              });
            } else {
              this.clickShareLinking = false
              this.copy(str)
            }
          },
          fail: () => {
            this.clickShareLinking = false
          	this.copy(str)
          }
        })
      },
      clickSharePoster() {
        this.hideSharePop()
        this.posterData = {
          show: true,
          code: this.loanInfo.name,
          logoUrl: this.loanInfo.logo_url,
          posterUrl: this.loanInfo.background_img,
          url: this.$constant.shareUrl + '?pid=' + this.userInfo.id,
          maxPrice: this.loanInfo.max_price,
          tag: this.loanInfo.tag_ids
        }
      },
      copy(str) {
        uni.setClipboardData({
        	data: str,
          success: () => {
            uni.showModal({
              title: '复制成功',
              content: '链接已复制，请手动粘贴发送给好友',
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
          	this.hideSharePop()
          }
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .intro{
    padding: 40upx; margin-bottom: 20upx; background-color: $color-white;
    .pic{
      height: 110upx; margin-bottom: 10upx;
      image{
        width: 100%; height: 110upx;
      }
    }
    .name{
      height: 50upx; margin-bottom: 4upx; font-size: $font-size-36; line-height: 50upx; color: $color-gray-4;
    }
    .company{
      height: 34upx; margin-bottom: 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
    }
    .max{
      padding-top: 50upx; background: $loan-linear; border-radius: 16upx;
      .text{
        margin-bottom: 20upx; font-size: 28upx; line-height: 40upx; color: $color-white;
      }
      .num{
        height: 94upx; margin-bottom: 30upx; font-size: $font-size-80; line-height: 94upx; color: $color-white;
      }
    }
    .explain{
      height: 60upx; padding: 10upx 0; margin: 0 30upx; border-top: $border-1; border-color: rgba(255, 255, 255, .2);
      view{
        font-size: $font-size-24; line-height: 60upx; color: $color-white;
        &.line{
          border-left: $border-1; border-color: rgba(255, 255, 255, .2);
        }
      }
    }
  }
  .other{
    padding: 30upx 20upx; background-color: $color-white;
    .other-left{
      background-color: $default-bg-color; border-radius: $border-radius;
    }
    .other-right{
      width: 172upx; margin-left: 20upx; background-color: $bonus-bg; border-radius: $border-radius; color: $color;
      .txt{
        color: $color !important;
      }
    }
    .other-con{
      padding: 24upx 0 18upx; font-size: $font-size-32; line-height: 44upx;
      .val{
        justify-content: center; align-items: center;
      }
      .txt{
        margin-top: 8upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: $color-gray;
      }
      .tri{
        width: 0; height: 0; margin-left: 6upx; border-width: 10upx 10upx 0; border-style: solid; border-color: $color transparent transparent;
      }
    }
  }
  .main{
    padding: 20upx;
    .condition{
      padding: 0 20upx; margin-bottom: 30upx; background-color: $color-white; border-radius: $border-radius;
      .box{
        padding: 40upx 10upx; font-size: $font-size-28; line-height: 40upx; color: $color-gray; border-bottom: $border-1;
        .tit{
          width: 150upx; margin-right: 20upx; font-weight: 700; color: $color-gray-4;
        }
      }
      .remarks{
        padding: 40upx 10upx; font-size: $font-size-26; font-weight: 700; line-height: 36upx; color: $color-err;
      }
    }
    .tips{
      margin-bottom: 20upx; font-size: $font-size-26; line-height: 36upx; color: $color-gray;
    }
  }
</style>
