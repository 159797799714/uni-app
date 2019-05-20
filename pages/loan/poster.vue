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
  import drawQrcodeLoan from '../../common/qrcode.min.js'
  
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
        logoUrl: '',
        maxPrice: '',
        tag: '',
        shareUrl: '',
        bgImg: '',
        posterIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAApVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+4/eNVAAAANnRSTlMAf79A/AMS+bUG9uoNCfLu5eDZz0grIbqel4RZPTCqc08li3leNR3UycWvpY9uaWNfUzgaGGgxc+hkAAACXklEQVRo3u3Y527iQBSG4c/gghvdpvcOoSdz/5e2iuYYsuzixc4caSPN+5cRDyH2J2TodD+ycR/sLTznBOaWVSFEF0knI1+9NCNoiM+GIWQFka9SimGV5JlyxIi8ySPmGHzIgY6MwIc0TXmiAz4kqsgDLesRaSu7uuyaNOo2HpEiFOVupOHH4EN20nD64EMMIZuDD+mR0QUfcvGkMQQfEvvSWId8SLCSRu0dbIjVuq0iH9KhVWyCD9kL2R58yH0V+ZBBOVlFPuSdVnEVgA0J17dV5EOG0vAu4EO6QtYDHzInwwAf0neksQMfMqFV3Lh8iF2nVbTBhri0ipUIfMh9FbMj08lrxkjIDsiOdIQ/eMUY0yq+ISNCN1el//oqlqzMCH0HXhP/6FqVRiNAZiSi78DpIbWwIc9Vl8iO4ECK+YGUrC2t4gJ5EPQcIZvheVP6JGfkQ9D0SJniWcfb58iLoF8RsvaTC6fo0OvIj2DgkzJ0/7qK9CEK7ncQTGqktMLnq1i38S0Eyzopmz/eyS3QKk4e/vziZ0EGBHaDlMbjb9s23UjFlLd69ZWgQEo9xtdmQnaEAgRhSciqEe6dzeTyVoLA3ZHi32/rBd1DW0sRAqtDSjk5sExWMYQq5P6byhvL/1OyilcoRDAixZx/ffwzgFIER5OU/cPjH5UIzskoGx+3xz/KETTL4rfaYEBwoT1MVpEFQUQXLq0iD4K4lhh+DC4E19Xt8Q8fAntNj384EQQtevzDicDdiiG4EVizkBehNKIRjWhEIxpJQ9qGgmopiLo08oOQk6G4GDqd7r/sF2W0gef2I3XYAAAAAElFTkSuQmCC',
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
      showPrice() {
        return '最高可贷' + this.maxPrice + '元'
      },
      showName() {
        let str = this.userInfo.username
        if (this.userInfo.real_name) {
          str += '(' + this.userInfo.real_name + ')'
        }
        return str
      },
      showIdentity() {
        if (this.userInfo.role === 1) {
          return '职务：普通会员'
        } else if (this.userInfo.role === 2) {
          return '职务：黄金VIP'
        } else if (this.userInfo.role === 3) {
          return '职务：铂金VIP'
        } else if (this.userInfo.role === 4) {
          return '职务：钻石VIP'
        } else {
          return '职务：临时用户'
        }
      },
      showId() {
        return '会员ID：' + this.userInfo.id
      },
      showMobile() {
        let str = ''
        if (this.userInfo.mobile) {
          str = '电话：' + this.userInfo.mobile
        }
        return str
      },
      showWx() {
        let str = ''
        if (this.userInfo.wx_number) {
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
        drawQrcodeLoan({
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
          context.drawImage(this.logoUrl, 330, 66, 80, 80)
          context.save()
          context.beginPath()
          context.arc(580, 1374, 55, 0, 2 * Math.PI)
          context.clip()
          context.drawImage(_this.userInfo.avatar_url ? _this.userInfo.avatar_url : _this.defaultAvatar, 525, 1319, 110, 110)
          context.restore()
          context.drawImage(_this.qrcodeSrc, 129, 1339, 328, 328)
          // 处理文字居中，字间距和不同的颜色
          context.font = 'normal 65px PingFangSC'
          context.setTextBaseline('top')
          let letterSpacing = 31
          let textArr = this.showPrice.split('')
          let originWidth = context.measureText(this.showPrice).width + letterSpacing * (textArr.length - 1)
          let x = (1080 - originWidth) / 2
          let signLength = this.maxPrice.split('').length
          textArr.forEach((item, index) => {
            if (index <= 3 || index >= (4 + signLength)) {
              context.fillStyle = '#fff'
              context.fillText(item, x, 740)
              x += context.measureText(item).width + letterSpacing
            } else {
              context.fillStyle = '#FACD53'
              context.fillText(item, x, 740)
              x += context.measureText(item).width + letterSpacing
            }
          })
          // 绘制标签
          let tagArr = this.tag ? this.tag.split(',') : []
          if (tagArr.length > 0) {
            context.font = 'normal 46px/50px PingFangSC'
            context.fillStyle = '#fff'
            let tagStart = 871
            let tagH = 358
            let tagY = 871
            let length = tagArr.length >= 3 ? 3 : tagArr.length
            tagY = tagStart + (tagH - 50 * length - 65 * (length - 1)) / 2
            tagArr.forEach((item, index) => {
              if (index <= 2) {
                context.drawImage(_this.posterIcon, 152, tagY, 50, 50)
                context.fillText(item, 235, tagY - 10)
                tagY += 115
              }
            })
          }
          // 绘制个人信息
          let infoY = 1474
          context.font = 'normal 32px/32px PingFangSC'
          context.fillStyle = '#fff'
          context.fillText(this.showName, 525, infoY)
          infoY += 64
          context.fillText(this.showIdentity, 525, infoY)
          infoY += 64
          context.fillText(this.showId, 525, infoY)
          infoY += 64
          if (this.showMobile) {
            context.fillText(this.showMobile, 525, infoY)
            infoY += 64
          }
          if (this.showWx) {
            context.fillText(this.showWx, 525, infoY)
            infoY += 64
          }
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
        if (this.code !== val.code || this.shareUrl !== val.url || this.maxPrice !== val.maxPrice || this.tag !== val.tag || this.bgImg !== val.bgImg || this.logoUrl !== val.logoUrl) {
          this.code = val.code
          this.shareUrl = val.url
          this.maxPrice = val.maxPrice
          this.tag = val.tag
          if (this.isShow) {
            uni.showLoading({
            	title: '正在生成海报',
              mask: true
            })
            uni.downloadFile({
            	url: val.posterUrl,
              success: res => {
                if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
                  this.bgImg = res.tempFilePath
                  this.logoUrl = val.logoUrl
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
  @import '../../common/var';
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
