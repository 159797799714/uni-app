<template name="poster">
	<view class="pop pop-poster" v-show="isShow">
    <view class="mask" @click="hide"></view>
    <view class="pop-con">
      <view class="tit">海报</view>
      <view class="pic uni-flex-item">
      	<image :src="resSrc" mode="aspectFit" v-if="resSrc"></image>
      </view>
      <view class="operation uni-flex uni-box">
        <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
          <view class="uni-flex-item gray" @click="hide">关闭</view>
          <view class="uni-flex-item" :class="{'disabled': downloading}" @click="download">保存到手机</view>
          <view class="uni-flex-item" :class="{'disabled': shareFriending}" @click="shareFriend">分享给好友</view>
        </view>
      </view>
      <canvas canvas-id="canvas" class="canvas uni-pa"></canvas>
      <canvas canvas-id="qrcodebox" class="qrcodebox uni-pa"></canvas>
    </view>
  </view>
</template>

<script>
  import drawQrcode from '../common/qrcode.min.js'
  
	export default {
    props: {
      posterData: {
        type: Object,
        required: true
      }
    },
		data() {
			return {
				isShow: false,
        code: '',
        shareUrl: '',
        bgImg: '',
        type: {
          name: 2,
          way: 2
        },
        qrcodeSrc: '',
        resSrc: '',
        downloading: false,
        shareFriending: false
			};
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      showName() {
        let str = ''
        if (this.userInfo.real_name) {
          if (this.type.name === 2) {
            str = this.userInfo.username + ' (' + this.userInfo.real_name + ')'
          } else if (this.type.name === 0) {
            str = this.userInfo.real_name
          } else {
            str = this.userInfo.username
          }
        } else {
          str = this.userInfo.username
        }
        return str
      },
      showIdentity() {
        if (this.userInfo.role === 1) {
          return '普通会员'
        } else if (this.userInfo.role === 2) {
          return '黄金VIP'
        } else if (this.userInfo.role === 3) {
          return '铂金VIP'
        } else if (this.userInfo.role === 4) {
          return '钻石VIP'
        } else {
          return '临时用户'
        }
      },
      showId() {
        return '会员ID：' + this.userInfo.id
      },
      showWay() {
        let str = ''
        if (this.type.way === 0 || this.type.way === 2) {
          str = '电话：' + this.userInfo.mobile
        } else {
          if (this.userInfo.wx_number) {
            str = '微信号：' + this.userInfo.wx_number
          }
        }
        return str
      },
      showWay2() {
        let str = ''
        if (this.type.way === 2 && this.userInfo.wx_number) {
          str = '微信号：' + this.userInfo.wx_number
        }
        return str
      }
    },
    methods: {
      hide() {
      	this.isShow = false
      },
      // 生成二维码
      qrcode(url, cb) {
        drawQrcode({
          width: 230,
          height: 230,
          canvasId: 'qrcodebox',
          text: url
        })
        setTimeout(() => {
          uni.canvasToTempFilePath({
          	canvasId: 'qrcodebox',
            success: res => {
            	if (typeof cb === 'function') {
            	  cb(res.tempFilePath)
            	}
            }
          })
        }, 300)
      },
      produceImg(cb) {
        let _this = this
        let context = uni.createCanvasContext('canvas', this)
        context.clearRect(0, 0, 1080, 1920)
        context.drawImage(this.bgImg, 0, 0, 1080, 1920)
        context.draw(true, () => {
          context.save()
          context.beginPath()
          context.arc(150, 1155, 50, 0, 2 * Math.PI)
          context.clip()
          context.drawImage(_this.userInfo.avatar_url ? _this.userInfo.avatar_url : _this.defaultAvatar, 100, 1105, 100, 100)
          context.restore()
          context.drawImage(_this.qrcodeSrc, 230, 1463, 230, 230)
          context.font = 'bold 40px PingFangSC'
          context.fillStyle = '#242424'
          context.fillText(_this.showName, 240, 1172)
          context.font = 'normal 36px PingFangSC'
          context.fillStyle = '#242424'
          context.fillText(_this.showIdentity, 100, 1265)
          context.font = 'normal 36px PingFangSC'
          context.fillStyle = '#242424'
          context.fillText(_this.showId, 560, 1265)
          context.font = 'normal 36px PingFangSC'
          context.fillStyle = '#242424'
          context.fillText(_this.showWay, 100, 1326)
          context.font = 'normal 36px PingFangSC'
          context.fillStyle = '#242424'
          context.fillText(_this.showWay2, 560, 1326)
          setTimeout(() => {
            context.draw(true, () => {
              uni.canvasToTempFilePath({
              	canvasId: 'canvas',
                destWidth: 1080,
                destHeight: 1920,
                success: res => {
                	if (typeof cb === 'function') {
                	  cb(res.tempFilePath)
                	}
                },
                fail: err => {
                  this.reqing = false
                	uni.showToast({
                		title: err,
                    icon: 'none'
                	})
                  _this.hide()
                },
                complete: () => {
                	uni.hideLoading()
                }
              })
            })
          }, 100)
        })
      },
      savaImg() {
        let _this = this
        if (_this.isLoad) return
        if (_this.reqing) {
          uni.showToast({
          	title: this.produceMsg,
            icon: 'none'
          })
          return false
        }
        if (!this.resSrc) {
          _this.qrcode(_this.shareUrl, res => {
            this.qrcodeSrc = res
            _this.produceImg((base) => {
              _this.resSrc = base
            })
          })
        }
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
      },
      shareFriend() {
        if (this.shareFriending) {
          uni.showToast({
          	title: '正在启动分享，请勿频繁操作',
            icon: 'none'
          })
          return
        }
        this.shareFriending = true
        uni.getProvider({
        	service: 'share',
          success: res => {
            if (~res.provider.indexOf('weixin')) {
              uni.share({
              	provider: 'weixin',
              	type: 2,
                scene: 'WXSceneSession',
              	imageUrl: this.resSrc,
              	success: res => {
                  console.log(res)
                },
              	fail: err => {
                  uni.showToast({
                  	title: err.errMsg,
                    icon: 'none'
                  })
                },
              	complete: () => {
                  this.shareFriending = false
                }
              });
            } else {
              uni.showToast({
              	title: '分享失败，未检测到微信',
                icon: 'none'
              })
              this.shareFriending = false
            }
          },
          fail: () => {
          	uni.showToast({
          		title: '分享失败，再稍后再试',
          	  icon: 'none'
          	})
            this.shareFriending = false
          }
        })
      }
    },
    watch: {
      posterData: function (val) {
        this.isShow = val.show
        if (this.code !== val.code) {
          this.code = val.code
          this.shareUrl = val.url
          if (this.isShow) {
            uni.showLoading({
            	title: '正在生成海报',
              mask: true
            })
            uni.downloadFile({
            	url: this.$store.state.config.background_img,
              success: res => {
                if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
                  this.bgImg = res.tempFilePath
                  this.savaImg()
                } else {
                  uni.hideLoading()
                  this.reqing = false
                  uni.showToast({
                  	title: '海报生成失败，请稍后再试',
                    icon: 'none'
                  })
                  _this.hide()
                }
              },
              fail: () => {
              	uni.hideLoading()
              	this.reqing = false
              	uni.showToast({
              		title: '海报生成失败，请稍后再试',
              	  icon: 'none'
              	})
              	_this.hide()
              }
            })
          }
        }
      }
    }
	}
</script>

<style lang="scss" scoped>
  @import '../common/var';
	.pop-poster{
    .canvas{
      top: -2000px; left: -2000px; z-index: 9; width: 1080px; height: 1920px; pointer-events: none;
    }
    .qrcodebox{
      top: -2000px; left: -2000px; width: 230px; height: 230px;
    }
    .pop-con{
      height: calc(100% - 166upx);
      .tit{
        height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
      }
      .pic{
        height: calc(100% - 240upx);
        image{
          width: 100%; height: 100%;
        }
      }
    }
  }
</style>
