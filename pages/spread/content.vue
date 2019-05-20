<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true">
        <canvas canvas-id="qrcodeCanvas" class="canvas-qrocde uni-pa"></canvas>
				<view class="tips uni-flex" v-if="userInfo.role === -1">你分享本文，文中广告名片自动换成你的，还可锁粉！<view class="arrow uni-pr" v-if="false"><view class="uni-pa"></view></view></view>
        <view class="header" v-if="essayContent">
          <view class="tit">{{ essayContent.title }}</view>
          <view class="info uni-flex"><view class=""><text>{{ essayContent.username }}</text><toDecima :str="essayContent.create_time" :type="1"></toDecima></view></view>
        </view>
        <view class="author" v-if="essayContent">
          <view class="author-con uni-flex">
            <view class="avatar">
              <image :src="essayContent.avatar_url ? essayContent.avatar_url : defaultAvatar" mode=""></image>
            </view>
            <view class="text uni-flex-item">
              <view class="name"><text>我是</text><text class="yel">{{ essayContent.username }}</text>（{{ config.system_nick_name }}<toDecima :str="essayContent.role" :type="4"></toDecima>）</view>
              <view class="explain uni-ovh">我提供信用卡办理，保险，理财办理及咨询，欢迎联系！</view>
              <view class="contact-box uni-flex">
                <view class="uni-flex btn-call" @click="call(essayContent.mobile)"><image src="/static/images/icon/icon-call.png"></image>拨打电话</view>
                <view class="uni-flex" @click="showWechat(essayContent.wechat)" :class="{'gray': !essayContent.wechat}"><image src="/static/images/icon/icon-wechat.png" mode=""></image>微信联系</view>
              </view>
            </view>
            <view class="qrcode uni-txc">
              <view class="uni-pr img-box" v-if="isAuthor">
                <image :src="qrcodeUrl" mode=""></image>
                <image src="/static/images/invite/poster-ewm-logo.png" mode="widthFix" class="qrcode-logo uni-pa"></image>
              </view>
              <img :src="qrcodeUrl" v-else>
              <view>{{ essayContent.qr_tip }}</view> 
            </view>
          </view>
        </view>
        <view class="main" v-if="essayContent">
          <view>
          	<rich-text :nodes="essayContent.content"></rich-text>
          </view>
        </view>
        <view class="author" v-if="essayContent">
          <view class="author-con uni-flex">
            <view class="avatar">
              <image :src="essayContent.avatar_url ? essayContent.avatar_url : defaultAvatar" mode=""></image>
            </view>
            <view class="text uni-flex-item">
              <view class="name"><text>我是</text><text class="yel">{{ essayContent.username }}</text>（{{ config.system_nick_name }}<toDecima :str="essayContent.role" :type="4"></toDecima>）</view>
              <view class="explain uni-ovh">我提供信用卡办理，保险，理财办理及咨询，欢迎联系！</view>
              <view class="contact-box uni-flex">
                <view class="uni-flex btn-call" @click="call(essayContent.mobile)"><image src="/static/images/icon/icon-call.png"></image>拨打电话</view>
                <view class="uni-flex" @click="showWechat(essayContent.wechat)" :class="{'gray': !essayContent.wechat}"><image src="/static/images/icon/icon-wechat.png" mode=""></image>微信联系</view>
              </view>
            </view>
            <view class="qrcode uni-txc">
              <view class="uni-pr img-box" v-if="isAuthor">
                <image :src="qrcodeUrl" mode=""></image>
                <image src="/static/images/invite/poster-ewm-logo.png" mode="widthFix" class="qrcode-logo uni-pa"></image>
              </view>
              <img :src="qrcodeUrl" v-else>
              <view>{{ essayContent.qr_tip }}</view> 
            </view>
          </view>
        </view>
        <view class="footer" v-if="essayContent">
          <image src="/static/images/footer-bg.png" mode="widthFix" class="bg uni-pa"></image>
          <view class="footer-con uni-pr uni-box uni-ovh">
            <image src="/static/images/material/footer-logo.png" mode="widthFix" class="logo"></image>
            <view class="text">提供信用卡办理，贷款，保险，理财办理及分销，做VIP，轻松赚钱。</view>
            <view class="qrcode uni-pa uni-txc">
              <image :src="qrcode" mode=""></image>
              <p>扫码有惊喜</p>
            </view>
          </view>
        </view>
        <view class="other" v-if="essayContent">
          <text>阅读 {{ essayContent.view_count ? essayContent.view_count : 0 }}</text>
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
	</view>
</template>
<script>
  import drawQrcode from '../../common/qrcode.min.js'
  
	export default {
		data() {
			return {
				qrcode: '', // 平台二维码
        author: '',
        wechatFlag: false,
        wechatStr: '',
        wechatQrCode: '',
        essayContent: null,
        qrcodeUrl: ''
			}
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      userInfo() {
        return this.$store.state.userInfo
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      isAuthor() {
        return this.author
      }
    },
		onLoad(query) {
			this.qrcode = this.config.wx_qr_code
      this.author = this.userInfo.id
      this.$http({
        url: this.$apis.articleInfo,
        method: 'GET',
        data: {
          id: query.aId,
          uid: this.author
        },
        cb: (err, data) => {
          if (!err && data.success === true) {
            this.essayContent = data.data
            this.essayContent.content = this.essayContent.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
            // 生成二维码
            if (this.isAuthor) {
              let url = this.$constant.shareUrl + '?pid=' + this.author
              this.createQrcode(url, 364, (res) => {
                this.qrcodeUrl = res
              })
            } else {
              this.qrcodeUrl = data.data.qr_code
            }
          } else {
            uni.showToast({
            	title: '获取文章详情失败',
              icon: 'none'
            })
          }
        }
      })
		},
		methods: {
      createQrcode(url, w, cb) {
        drawQrcode({
          width: uni.upx2px(w),
          height: uni.upx2px(w),
          canvasId: 'qrcodeCanvas',
          text: url
        })
        setTimeout(() => {
          uni.canvasToTempFilePath({
          	canvasId: 'qrcodeCanvas',
            success: res => {
            	if (typeof cb === 'function') {
            	  cb(res.tempFilePath)
            	}
            }
          })
        }, 300)
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
      }
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .canvas-qrocde{
    top: -10000upx; width: 364upx; height: 364upx;
  }
  .content{
    background-color: $color-white;
    .tips{
      justify-content: space-between; align-items: center; height: 68upx; padding: 0 30upx 0 20upx; font-size: $font-size-26; line-height: 68upx; color: $color-white; background-color: $color;
      .arrow{
        width: 4upx; height: 23upx; padding-top: 8upx; background-color: $color-white; border-radius: 4upx;
        view{
          top: 0; left: 50%; width: 0; height: 0; border-width: 0 14upx 14upx; border-style: solid; border-color: transparent transparent $color-white; transform: translateX(-50%);
        }
      }
    }
    .header{
      padding: 30upx 30upx 0; margin-bottom: 20upx;
      .tit{
        margin-bottom: 24upx; font-size: 44upx; line-height: 60upx; color: $default-color;
      }
      .info{
        justify-content: space-between; align-items: center; height: 40upx; font-size: $font-size-28; color: $color-gray-2;
        text{
          margin-right: 20upx; color: $color;
        }
      }
    }
    .author{
      padding: 0 20upx;
      .author-con{
        padding: 30upx 30upx 30upx 20upx; background-color: $color-author; border-radius: $border-radius;
        .avatar{
          width: 80upx; height: 80upx; margin-right: 20upx;
          image{
            width: 100%; height: 100%; border-radius: 100%;
          }
        }
        .text{
          .name{
            margin-bottom: 16upx; font-size: $font-size-24; line-height: 44upx; color: $default-color;
            text{
              font-size: $font-size-32;
              &.yel{
                color: $color;
              }
            }
          }
          .explain{
            height: 68upx; margin-bottom: 16upx; font-size: $font-size-24; line-height: 34upx; color: $color-text;
          }
          .contact-box{
            align-items: center; height: 48upx;
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
        .qrcode{
          padding-top: 10upx; font-size: $font-size-20; line-height: 28upx; color: $default-color;
          image{
            width: 160upx; height: 160upx;
          }
          .img-box{
            width: 140upx; height: 140upx; padding: 10upx; background-color: $color-white;
            image{
              width: 140upx; height: 140upx;
              &.qrcode-logo{
                top: 50%; left: 50%; width: 25%; transform: translate(-50%, -50%);
              }
            }
          }
        }
      }
    }
    .main{
      padding: 40upx; font-size: $font-size-30; line-height: 42upx; color: $default-color;
    }
    .footer{
      margin-top: 40upx; padding: 0 20upx;
      .bg{
        width: 710upx; left: 20upx;
      }
      .footer-con{
        width: 100%; height: 276upx; padding: 50upx 50upx 0; font-size: $font-size-20; line-height: 28upx; color: $color-white;
        .logo{
          width: 212upx; margin-bottom: 20upx;
        }
        .text{
          width: 346upx;
        }
        .qrcode{
          top: 40upx; right: 50upx;
          image{
            width: 160upx; height: 160upx; margin-bottom: 6upx;
          }
        }
      }
    }
    .other{
      padding: 46upx 30upx 30upx; font-size: $font-size-28; line-height: 40upx; color: $color-gray-2;
    }
  }
</style>
