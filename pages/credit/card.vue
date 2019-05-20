<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
        <view v-if="cardInfo">
        	<!-- 卡种 S -->
          <view class="classify">
            <view class="pic">
              <image :src="cardInfo.logo_url" mode="aspectFit"></image>
            </view>
            <view class="btn uni-flex uni-flex-wrap">
              <view v-for="(item, index) in classiy" :key="index" class="uni-box" :class="{'on': classiyfIndex === index}" @click="changeCard(index)">{{ item }}</view>
            </view>
          </view>
          <!-- 卡种 E -->
          <!-- 其他信息 S -->
          <view class="other-box">
          	<view class="other uni-flex uni-txc">
          		<view class="other-left uni-flex-item uni-flex">
          			<view class="other-con uni-flex-item">
          				<view class="val uni-textover">{{ cardInfo.card_level }}</view>
          				<view class="txt">卡片级别</view>
          			</view>
          			<view class="other-con uni-flex-item">
          				<view class="val uni-textover">{{ cardInfo.nofee_days }}天</view>
          				<view class="txt">最长免息期</view>
          			</view>
          			<view class="other-con uni-flex-item">
          				<view class="val uni-textover">{{ classiy[classiyfIndex] }}</view>
          				<view class="txt">发卡组织</view>
          			</view>
          		</view>
          		<view class="other-right" v-if="userInfo.role >= 1">
          			<view class="other-con uni-flex-item" @click="showRule(cardInfo)">
          				<view class="val uni-flex">{{ cardInfo.earn }}元<view class="tri"></view></view>
          				<view class="txt">奖金</view>
          			</view>
          		</view>
          	</view>
            <view class="other other-2 uni-flex uni-txc">
            	<view class="other-left uni-flex-item uni-flex">
            		<view class="other-con uni-flex-item">
            			<view class="val uni-textover">{{ cardInfo.fee_desc_arr[0] }}</view>
            			<view class="txt uni-textover">{{ cardInfo.fee_desc_arr[1] }}</view>
            		</view>
            		<view class="other-con uni-flex-item">
            			<view class="val uni-textover">{{ cardInfo.score_desc_arr[0] }}</view>
            			<view class="txt uni-textover">{{ cardInfo.score_desc_arr[1] }}</view>
            		</view>
            	</view>
            </view>
          </view>
          <!-- 其他信息 E -->
          <!-- 优惠 S -->
          <div class="discount">
            <view class="h3">优惠权益</view>
            <view class="p" v-for="(item, index) in cardInfo.power_desc_arr" :key="index">{{ item }}</view>
          </div>
          <!-- 优惠 E -->
        </view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item gray" @click="showSharePop">我要推广</view>
        <view class="uni-flex-item" @click="gotoHandle">我要办卡</view>
      </view>
    </view>
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
        cardId: '',
        cardInfo: null,
        classiy: [],
        classiyfIndex: 0,
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
      this.cardId = query.id
      this.$http({
        url: this.$apis.cardInfo,
        method: 'GET',
        data: {
          id: this.cardId
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.cardInfo = data.data
            this.classiy = this.infoStr(this.cardInfo.group_tags, ',')
            this.$set(this.cardInfo, 'fee_desc_arr', this.infoStr(this.cardInfo.fee_desc, '\n'))
            this.$set(this.cardInfo, 'score_desc_arr', this.infoStr(this.cardInfo.score_desc, '\n'))
            this.$set(this.cardInfo, 'power_desc_arr', this.infoStr(this.cardInfo.power_desc, '\n'))
            uni.setNavigationBarTitle({
            	title: this.cardInfo.card_name
            })
          } else {
            uni.setNavigationBarTitle({
            	title: '信用卡'
            })
          }
        }
      })
		},
    methods: {
      infoStr(str, reg) {
        return str.split(reg)
      },
      changeCard(n) {
        this.classiyfIndex = n
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
      gotoAdd() {
        this.addData = {
          show: true,
          productId: this.cardInfo.id,
          link: this.cardInfo.card_link,
          state: 0,
          type: 'xyk',
          card: true
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
            		productId: this.cardInfo.id,
            		link: this.cardInfo.card_link,
            		state: 0,
            		type: 'xyk',
            		index: -1,
            		card: true
            	}
            }
            this.reqing = false
          }
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
          code: this.cardInfo.bank_code,
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
  .classify{
    padding: 50upx 20upx 40upx; background-color: $color-white;
    .pic{
      height: 280upx;
      image{
        width: 100%; height: 100%;
      }
    }
    .btn{
      justify-content: center; padding-top: 40upx;
      view{
        height: 64upx; padding: 0 20upx; margin: 0 24upx 20upx; font-size: $font-size-28; line-height: 64upx; color: $color; white-space: nowrap; border: $border-1; border-color: $color; border-radius: 64upx;
        &.on{
          color: $color-white; background-color: $color;
        }
      }
    }
  }
  .other-box{
    padding: 0 20upx 20upx; margin-bottom: 20upx; background-color: $color-white;
    .other-2{
      margin-top: 20upx;
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
  .discount{
    padding: 40upx 20upx; margin-bottom: 20upx; font-size: $font-size-26; line-height: 36upx; color: $default-color; background-color: $color-white;
    .h3{
      margin-bottom: 20upx; font-size: $font-size-28; font-weight: 700; line-height: 40upx;
    }
  }
</style>
