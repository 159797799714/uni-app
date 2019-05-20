<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
        <view class="intro" v-if="inviteInfo" v-for="(item, index) in inviteInfo" :key="index">
          <rich-text :nodes="item.content"></rich-text>
        </view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="/static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item" @click="showSharePop">分享邀请</view>
      </view>
    </view>
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
  import poster from '../../components/poster.vue'
  
	export default {
    components: {
      poster
    },
		data() {
			return {
				inviteInfo: null,
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
		onLoad() {
      if (this.userInfo.role !== 0) {
        uni.setNavigationBarTitle({
        	title: 'VIP邀请'
        })
      } else {
        uni.setNavigationBarTitle({
        	title: '邀请好友'
        })
      }
      this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: this.userInfo.role !== 0 ? 4 : 3
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.inviteInfo = data.data
            this.inviteInfo.forEach(item => {
              item.content = item.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
            })
          } else {
            uni.showToast({
            	title: '获取信息失败',
              icon: 'none'
            })
          }
        }
      })
		},
    methods: {
      showTips() {
        uni.showModal({
        	title: '提示',
          content: '您是临时用户，无权使用此功能，请先免费升级为普通会员继续使用。',
          cancelText: '知道了',
          confirmText: '去升级',
          success: res => {
          	if (res.confirm) {
              this.$navigateTo({
              	url: '/pages/mine/agent'
              })
            }
          }
        })
      },
      showSharePop() {
        if (this.userInfo.role === 0) {
          this.showTips()
          return
        }
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
          code: 'platform',
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
      },
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      }
    }
	}
</script>
