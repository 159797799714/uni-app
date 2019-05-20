<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true">
        <view class="header uni-pr uni-ovh">
          <image src="/static/images/spread/header.png" mode="widthFix" class="bg uni-pa"></image>
          <view class="spread uni-pr">
            <view class="spread-con uni-flex">
              <view class="btn uni-flex-item uni-flex uni-column" :class="{'disabled': clickShareLinking}" @click="clickShareLink">
                <image src="/static/images/spread/share.png" mode=""></image>
                <text>链接分享</text>
              </view>
              <view class="line"></view>
              <view class="btn uni-flex-item uni-flex uni-column" @click="clickSharePoster">
                <image src="/static/images/spread/poster.png" mode=""></image>
                <text>生成海报</text>
              </view>
            </view>
          </view>
          <view class="enter-lists uni-pr uni-flex uni-flex-wrap">
            <view class="item uni-pr uni-ovh" @click="gotoPoster">
              <image src="/static/images/spread/classify-1.png" mode="widthFix" class="uni-pa"></image>
              <view class="tit uni-pr">海报库</view>
              <view class="uni-pr">信用卡、贷款、保险海报</view>
            </view>
            <view class="item uni-pr uni-ovh" @click="gotoMaterial">
              <image src="/static/images/spread/classify-2.png" mode="widthFix" class="uni-pa"></image>
              <view class="tit uni-pr">素材库</view>
              <view class="uni-pr">文章、图片资源、朋友圈文案</view>
            </view>
            <view class="item uni-pr uni-ovh" @click="gotoExp">
              <image src="/static/images/spread/classify-3.png" mode="widthFix" class="uni-pa"></image>
              <view class="tit uni-pr">推广经验谈</view>
              <view class="uni-pr">同行宝贵经验分享</view>
            </view>
          </view>
        </view>
        <view class="main uni-pr">
          <view class="title uni-flex">
            <view class="uni-pr"><image src="../../static/images/icon/icon-title-line.png" class="uni-pa"></image>推荐热文</view>
            <text @click="gotoHot">查看全部</text>
          </view>
          <view class="lists" v-if="hotLists.length > 0">
            <view class="item uni-flex" v-for="(item, index) in hotLists" :key="index" @click="gotoContent(item.id)">
              <view class="pic uni-ovh">
                <image :src="item.logo_url" mode="aspectFill"></image>
              </view>
              <view class="text uni-flex-item">
                <view class="name uni-textover-box">{{ item.title }}</view>
                <view class="other uni-flex">
                  <view><toDecima :str="item.create_time" :type="1"></toDecima></view>
                  <view>{{ item.view_count }}人看过</view>
                </view>
              </view>
            </view>
          </view>
          <view class="more" v-if="hotLists.length > 0">
            <view class="db uni-txc" @click="gotoHot">查看全部</view>
          </view>
        </view>
      </scroll-view>
		</view>
    <poster :posterData="posterData"></poster>
	</view>
</template>
<script>
  import poster from '../../components/poster.vue'
  
	export default{
    components: {
      poster
    },
		data(){
			return{
				hotLists: [],
        shareData: {},
        shareTipsData: {},
        posterData: {},
        clickShareLinking: false
			}
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      config() {
        return this.$store.state.config
      },
      constant() {
        return this.$constant
      },
      isRole() {
        return this.userInfo.role > 0
      }
    },
    onLoad() {
    	this.$http({
        url: this.$apis.articleList,
        method: 'GET',
        data: {
          hot_recommend: 1
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.hotLists = data.data.data
          }
        }
      })
    },
		methods:{
      gotoPoster() {
        if (!this.isRole) {
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
          return
        }
        this.$navigateTo({
        	url: '/pages/spread/poster'
        })
      },
      gotoMaterial() {
        this.$navigateTo({
        	url: '/pages/spread/material'
        })
      },
      gotoExp() {
        this.$navigateTo({
        	url: '/pages/spread/experience'
        })
      },
      gotoHot() {
        this.$navigateTo({
        	url: '/pages/spread/hot'
        })
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
        let str = this.$constant.shareUrl + '?pid=' + this.userInfo.id;
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
                  this.clickShareLinking = false
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
          fail: err => {
            this.clickShareLinking = false
          	this.copy(str)
          }
        })
      },
      clickSharePoster() {
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
          }
        })
      },
      gotoContent(id) {
        this.$navigateTo({
        	url: '/pages/spread/content?aId=' + id
        })
      }
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .header{
    padding-top: 220upx; margin-bottom: 20upx; background-color: $color-white;
    .bg{
      top: 0; left: 0; width: 100%;
    }
    .spread{
      padding: 0 30upx; margin-bottom: 30upx;
      .spread-con{
        align-items: center; height: 264upx; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
        .btn{
          justify-content: center; align-items: center; height: 100%; font-size: $font-size-28; line-height: 40upx; color: $color-gray-4;
          image{
            width: 116upx; height: 116upx; margin-bottom: 20upx;
          }
        }
        .line{
          width: 4upx; height: 80upx; background-color: $color-gray-5; opacity: .3;
        }
      }
    }
    .enter-lists{
      justify-content: space-between; padding: 0 30upx; margin-bottom: 16upx;
      .item{
        width: 290upx; height: 150upx; padding: 60upx 24upx 0; margin-bottom: 14upx;
        image{
          top: 0; left: 0; width: 100%;
        }
        view{
          width: 170upx; font-size: $font-size-22; line-height: 32upx; color: $color-spread;
          &.tit{
            width: auto; height: 44upx; margin-bottom: 12upx; font-size: $font-size-32; font-weight: 700; line-height: 44upx; color: $color-gray-4;
          }
        }
      }
    }
  }
  .main{
    margin-bottom: 20upx; background-color: $color-white;
    .title{
      justify-content: space-between; align-items: center; border-bottom: $border-1;
      text{
        font-size: $font-size-28; line-height: 80upx; color: $color;
      }
    }
    .lists{
      .item{
        height: 140upx; padding: 20upx 30upx; border-bottom: $border-1;
        .pic{
          width: 220upx; height: 100%; margin-right: 30upx; border-radius: $border-radius;
          image{
            width: 100%; height: 100%;
          }
        }
        .name{
          height: 84upx; padding-top: 12upx; margin-bottom: 10upx; font-size: $font-size-30; font-weight: 700; line-height: 42upx; color: $color-gray-4;
        }
        .other{
          justify-content: space-between; font-size: $font-size-24; line-height: 34upx; color: $color-spread;
        }
      }
    }
  }
  .more{
    padding: 0 30upx;
    view{
      height: 80upx; font-size: $font-size-28; line-height: 80upx; color: $color;
    }
  }
</style>
