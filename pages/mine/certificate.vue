<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
				<view class="pic uni-pr uni-box">
					<image :src="resSrc" mode="aspectFit" v-if="resSrc"></image>
          <canvas canvas-id="canvas" class="canvas uni-pa"></canvas>
				</view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="/static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item" :class="{'disabled': downloading}" @click="download">保存到手机</view>
      </view>
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
        resSrc: '',
				downloading: false
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      config() {
        return this.$store.state.config
      },
      bgImg() {
        if (this.userInfo.role === 3) {
          return this.$store.state.config.certificate2
        } else if (this.userInfo.role === 4) {
          return this.$store.state.config.certificate3
        } else {
          return this.$store.state.config.certificate1
        }
      },
      showName() {
        if (this.userInfo.real_name) {
          return this.userInfo.real_name
        } else if (this.userInfo.username) {
          return this.userInfo.username
        } else {
          return this.config.system_nick_name ? this.config.system_nick_name : '临时用户'
        }
      }
    },
		onReady() {
			if (!this.resSrc) {
        uni.showLoading({
        	title: '正在下载证书',
          mask: true
        })
        let context = uni.createCanvasContext('canvas', this)
        context.clearRect(0, 0, 1356, 1920)
        context.drawImage(this.bgImg, 0, 0, 1356, 1920)
        context.font = 'bold 50px STSong'
        context.fillStyle = '#414238'
        context.fillText(this.showName, 432, 829)
        context.font = 'bold 36px STSong'
        context.fillStyle = '#414238'
        context.fillText(this.$utils.formatTimes(this.userInfo.agent_time, 3), 622, 1479)
        context.draw(true, () => {
          uni.canvasToTempFilePath({
          	canvasId: 'canvas',
            destWidth: 1356,
            destHeight: 1920,
            success: res => {
              this.resSrc = res.tempFilePath
            },
            fail: err => {
              this.reqing = false
            	uni.showToast({
            		title: err,
                icon: 'none'
            	})
            },
            complete: () => {
            	uni.hideLoading()
            }
          })
        })
      }
		},
    methods: {
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      },
      download() {
        if (this.downloading) {
          uni.showToast({
          	title: '正在下载图片，请勿频繁操作',
            icon: 'none'
          })
          return
        }
        this.downloading = true
        uni.saveImageToPhotosAlbum({
        	filePath: this.resSrc,
          success: res => {
          	uni.showModal({
          		title: '提示',
              content: `文件已保存到相册`,
              showCancel: false,
              confirmText: '知道了'
          	})
          },
          fail: err => {
          	uni.showToast({
          		title: '图片保存失败，请稍后再试\n' + JSON.stringify(err),
          	  icon: 'none'
          	})
          },
          complete: () => {
          	this.downloading = false
          }
        })
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .content{
    background-color: $color-white;
    .pic{
      width: 100%; height: 100%; padding: 20upx;
      image{
        width: 100%; height: 100%;
      }
      .canvas{
        top: -2000px; left: -2000px; width: 1356px; height: 1920px; pointer-events: none;
      }
    }
  }
</style>
