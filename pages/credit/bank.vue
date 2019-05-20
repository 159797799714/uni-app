<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
        <!-- 银行简介 S -->
				<view class="intro" v-if="bankInfo">
					<view class="logo uni-flex">
						<image :src="bankInfo.logo_url" mode="aspectFill"></image>
					</view>
          <view class="name uni-txc">{{ bankInfo.name }}</view>
          <view class="dec">{{ bankInfo.desc }}</view>
          <view class="other uni-flex uni-txc">
          	<view class="other-left uni-flex-item uni-flex">
          		<view class="other-con uni-flex-item">
          			<view class="val uni-textover">{{ bankInfo.pass_card_speed }}</view>
                <view class="txt">批卡速度</view>
          		</view>
              <view class="other-con uni-flex-item">
              	<view class="val uni-textover">{{ bankInfo.average_amount }}</view>
              	<view class="txt">平均额度</view>
              </view>
              <view class="other-con uni-flex-item">
              	<view class="val uni-textover">{{ bankInfo.pass_probability }}</view>
              	<view class="txt">通过率</view>
              </view>
          	</view>
            <view class="other-right" v-if="userInfo.role >= 1">
            	<view class="other-con uni-flex-item" @click="showRule(bankInfo)">
            		<view class="val uni-flex">{{ bankInfo.earn }}元<view class="tri"></view></view>
            		<view class="txt">奖金</view>
            	</view>
            </view>
          </view>
				</view>
        <!-- 银行简介 E -->
        <!-- banner S -->
        <view class="banner" v-if="advLists.length > 0">
        	<swiper indicator-dots="true" autoplay="true" interval="4000" duration="500" indicator-color="rgba(255, 255, 255, .3)" indicator-active-color="rgba(255, 255, 255, 1)" circular="true">
        		<swiper-item v-for="(item, index) in advLists" :key="index" @click="showAct(index)">
        			<view class="swiper-item">
                <image :src="item.logo_url" mode="widthFix"></image>
              </view>
        		</swiper-item>
        	</swiper>
        </view>
        <!-- banner E -->
        <!-- 热门卡片 S -->
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
        <!-- 热门卡片 E -->
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
        <view class="uni-flex uni-column" @click="gotoGuide"><image src="../../static/images/icon/nav-guide.png"></image><text>申卡攻略</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view v-if="userInfo.role > 0" class="uni-flex-item gray" @click="showSharePop">我要推广</view>
        <view class="uni-flex-item" :class="{'disabled': reqing}" @click="gotoHandle">我要办卡</view>
      </view>
    </view>
    <!-- 活动介绍 S -->
    <view class="pop pop-activity" v-show="popAct">
      <view class="mask" @click="hideAct"></view>
      <view class="pop-con">
        <view class="pop-box">
        	<scroll-view scroll-y class="scroll-view">
        		<view class="caption">{{ advLists[actIndex] ? advLists[actIndex].title : '' }}</view>
        		<image v-show="advLists[actIndex]" :src="advLists[actIndex] ? advLists[actIndex].logo_url : ''" mode="widthFix"></image>
        		<rich-text :nodes="advLists[actIndex] ? advLists[actIndex].content : ''"></rich-text>
        	</scroll-view>
        </view>
        <view class="operation uni-flex uni-box">
          <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
          	<view class="uni-flex-item" @click="hideAct">知道了</view>
          </view>
        </view>
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
        bankId: '',
        bankCode: '',
        bankInfo: null,
        reqing: false,
				advLists: [],
        popAct: false,
        actIndex: 0,
        cardLists: [],
        addData: {},
        contactData: {},
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
    	}
    },
		onLoad(query) {
      this.bankId = query.bankId
      this.bankCode = query.bankCode
      // 银行详情
      this.$http({
        url: this.$apis.bankInfo,
        method: 'GET',
        data: {
          id: this.bankId
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.bankInfo = data.data
            uni.setNavigationBarTitle({
            	title: this.bankInfo.name
            })
            if (uni.getStorageSync('createCredit') === true) {
              this.gotoHandle()
              uni.removeStorageSync('createCredit')
            }
          } else {
            uni.setNavigationBarTitle({
            	title: '银行'
            })
          }
        }
      })
      // 文章
      this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: 5,
          bank_id: this.bankId
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.advLists = data.data
            this.advLists.forEach((item, index) => {
              this.$set(item, 'index', index)
            })
          }
        }
      })
      // 信用卡
      this.$http({
      	url: this.$apis.card,
      	method: 'GET',
      	data: {
      		bankid: this.bankId
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
    onShow() {
      if (uni.getStorageSync('createCredit') === true && this.bankInfo) {
        this.gotoHandle()
        uni.removeStorageSync('createCredit')
      }
    },
    methods: {
      handleStr(str) {
      	return str.split(',')
      },
      showRule(item) {
        this.rewardData = {
          show: true,
          total: item.earn,
          conditionTitle: item.clearing_title,
          conditionDec: item.clearing_info
        }
      },
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      },
      gotoGuide() {
        this.$navigateTo({
        	url: './guide?bankId=' + this.bankInfo.id + '&bankCode=' + this.bankInfo.code
        })
      },
      showAct(index) {
        this.popAct = true
        this.actIndex = index
      },
      hideAct() {
        this.popAct = false
      },
      gotoAdd() {
      	this.addData = {
      		show: true,
      		productId: this.bankInfo.id,
      		state: 0,
      		type: 'xyk'
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
        				productId: this.bankInfo.id,
        				state: 0,
        				type: 'xyk',
        				index: -1
        			}
        		}
        		this.reqing = false
        	}
        })
      },
      gotoCard(id) {
      	this.$navigateTo({
      		url: '/pages/credit/card?id=' + id
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
          code: this.bankInfo.code,
          posterUrl: this.bankInfo.background_img,
          url: this.$constant.shareUrl + '?pid=' + this.userInfo.id
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
  	padding: 32upx 20upx; margin-bottom: 20upx; background-color: $color-white;
    .logo{
      justify-content: center; margin-bottom: 24upx;
      image{
        width: 120upx; height: 120upx;
      }
    }
    .name{
      margin-bottom: 8upx; font-size: $font-size-32; line-height: 44upx; color: $color-black;
    }
    .dec{
      margin-bottom: 24upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: $color-gray;
    }
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
  .banner{
    padding: 32upx 0; margin-bottom: 20upx; background-color: $color-white;
    swiper{
      height: 228upx;
    }
    .swiper-item{
      padding: 0 20upx;
      image{
        width: 100%; border-radius: $border-radius;
      }
    }
  }
  .pop-activity{
    .pop-con{
      height: 100%;
      .pop-box{
        height: calc(100% - 120upx); padding: 0 20upx;
        .caption{
          padding: 36upx 0 34upx; font-size: $font-size-36; font-weight: normal; line-height: 50upx; color: $default-color;
        }
        image{
          width: 100%; margin-bottom: 20upx; border-radius: $border-radius;
        }
      }
    }
  }
</style>
