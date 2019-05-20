<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="pic-box uni-box">
          <view class="canvas-box uni-pr">
            <view class="res-box uni-pr" id="resbox">
              <image :src="resSrc" mode="aspectFit" v-if="resSrc"></image>
            </view>
            <view class="demo uni-pa" :class="{'edit': isEdit}" :style="'transform: scale(' + scale + ');-webkit-transform: scale(' + scale + ');'">
              <view class="demo-con uni-pr" v-show="isEdit && !bgLoad && bgImg">
                <image :src="bgImg" mode="aspectFill" class="bg uni-pr" @load="loadedBg"></image>
                <image :src="userInfo.fans_avatar_local_url ? userInfo.fans_avatar_local_url : defaultAvatar" mode="" class="avatar uni-pa"></image>
                <image :src="userInfo.invite_qrcode_url" mode="" class="qrcode uni-pa"></image>
                <view class="name uni-pa">{{ showName }}</view>
                <view class="identity uni-pa">{{ showIdentity }}</view>
                <view class="id uni-pa">{{ showId }}</view>
                <view class="way uni-pa">{{ showWay }}</view>
                <view class="way way2 uni-pa">{{ showWay2 }}</view>
              </view>
            </view>
            <canvas canvas-id="canvas" class="canvas uni-pa"></canvas>
            <canvas canvas-id="qrcodebox" class="qrcodebox uni-pa"></canvas>
          </view>
        </view>
			</scroll-view>
		</view>
    <view class="choice-wrap uni-pa">
      <view class="tit">{{ text[textIndex] }}</view>
      <view class="bank" v-show="textIndex === 0">
        <scroll-view scroll-x class="bank-lists">
        	<view class="lists uni-flex uni-box" :style="'width:' + bankListsWidth">
        		<view class="item uni-pr uni-ovh" :class="{'on': index === bankIndex}" v-for="(item, index) in bankLists" :key="index" @click="choiceBank(index)">
              <image :src="item.logo_url" mode="" class="uni-pr"></image>
              <view class="uni-pa uni-box"></view>
            </view>
        	</view>
        </scroll-view>
        <view class="operation-2">
          <view @click="gotoEdit">修改内容</view>
          <view @click="savaImg" :class="{'disabled': isLoad}">生成海报</view>
        </view>
      </view>
      <view class="modify" v-show="textIndex === 1">
        <view class="modify-type">
          <view class="type uni-flex">
            <view class="txt">称呼方式</view>
            <view class="option uni-flex uni-txc">
              <view @click="choiceName(0, userInfo.real_name)" :class="{'on': type.name === 0 || type.name === 2, 'gray': !userInfo.real_name}">真实姓名</view>
              <view @click="choiceName(1, userInfo.real_name)" :class="{'on': type.name === 1 || type.name === 2}">微信昵称</view>
            </view>
          </view>
          <view class="type uni-flex">
            <view class="txt">联系方式</view>
            <view class="option uni-flex uni-txc">
              <view @click="choiceWay(0, userInfo.wx_number)" class="uni-box" :class="{'on': type.way === 0 || type.way === 2}">手机号</view>
              <view @click="choiceWay(1, userInfo.wx_number)" class="uni-box" :class="{'on': type.way === 1 || type.way === 2, 'gray': !userInfo.wx_number}">微信号</view>
            </view>
          </view>
        </view>
        <view class="operation-2">
          <view class="gray" @click="cancalEdit">取消</view>
          <view @click="savaOption">保存</view>
        </view>
      </view>
    </view>
    <view class="pop pop-poster" v-show="popPoster">
      <view class="mask" @click="hidePosterPop"></view>
      <view class="pop-con uni-flex uni-column">
        <view class="tit">海报</view>
        <view class="pic uni-flex-item">
        	<image :src="resSrc" mode="aspectFit" v-if="resSrc"></image>
        </view>
        <view class="operation uni-flex uni-box">
          <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
            <view class="uni-flex-item gray" @click="hidePosterPop">关闭</view>
            <view class="uni-flex-item" :class="{'disabled': downloading}" @click="download">保存到手机</view>
            <view class="uni-flex-item" :class="{'disabled': shareFriending}" @click="shareFriend">分享给好友</view>
          </view>
        </view>
      </view>
    </view>
	</view>
</template>

<script>
  import drawQrcodeSpread from '../../common/qrcode.min.js'
  
	export default {
		data() {
			return {
				text: {
          0: '选择银行查看海报',
          1: '定义海报内容'
        },
        bgImg: '',
        textIndex: 0,
        bankLists: [],
        shareUrl: '',
        bankIndex: -1,
        type: {
          name: 2,
          way: 2
        },
        oldType: {},
        isEdit: false,
        reqing: false,
        isLoad: false,
        bgLoad: false,
        qrcodeSrc: '',
        produceMsg: '正在生成海报...',
        loadingMsg: '正在加载背景图...',
        resSrc: '',
        popPoster: '',
        downloading: false,
        shareFriending: false,
        scale: 1,
        bankListsWidth: '100%'
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
		onLoad() {
      this.$http({
        url: this.$apis.banks,
        method: 'GET',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            this.bankLists = data.data
            let configInfo = this.$store.state.config
            this.bankLists.unshift({
              logo_url: configInfo.logo,
              background_img: configInfo.background_img,
              code: ''
            })
            this.bankListsWidth = uni.upx2px(this.bankLists.length * 150 + 30) + 'px'
            this.choiceBank(0)
          }
        }
      })
		},
    onReady() {
    	uni.createSelectorQuery().select('#resbox').fields({
    	  size: true
    	}, data => {
    	  this.scale = data.height / 1920
    	}).exec()
    },
    methods: {
      // 生成二维码
      qrcode(url, cb) {
        drawQrcodeSpread({
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
      choiceBank(n) {
        if (this.bankIndex === n) return
        if (this.reqing) {
          uni.showToast({
          	title: '正在生成海报...',
            icon: 'none'
          })
          return false
        }
        this.bankIndex = n
        this.bgImg = ''
        if (n === 0) {
          this.shareUrl = this.$constant.shareUrl + '?pid=' + this.userInfo.id
        } else {
          this.shareUrl = this.$constant.shareUrl + '?pid=' + this.userInfo.id
        }
        this.isEdit = true
        this.bgLoad = true
        this.isLoad = true
        this.resSrc = ''
        uni.showLoading({
          title: this.loadingMsg,
          mask: true
        })
        uni.downloadFile({
        	url: this.bankLists[this.bankIndex].background_img,
          success: res => {
            if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
              this.bgImg = res.tempFilePath
            } else {
              this.bgLoad = false
              uni.hideLoading()
              uni.showToast({
              	title: '背景图下载失败，请稍后再试',
                icon: 'none'
              })
            }
          },
          fail: err => {
          	this.bgLoad = false
            uni.hideLoading()
            uni.showToast({
            	title: '背景图下载失败，请稍后再试',
              icon: 'none'
            })
          }
        })
      },
      loadedBg() {
        this.isLoad = false
        this.bgLoad = false
        uni.hideLoading()
      },
      gotoEdit() {
        if (this.reqing) {
          uni.showToast({
          	title: '正在生成海报...',
            icon: 'none'
          })
          return false
        }
        this.textIndex = 1
        this.isEdit = true
        this.oldType = null
        this.oldType = this.$utils.cloneObj(this.type)
        this.choiceBank(this.bankIndex)
      },
      cancalEdit() {
        this.textIndex = 0
        this.type = null
        this.type = this.$utils.cloneObj(this.oldType)
      },
      savaOption() {
        this.textIndex = 0
        this.resSrc = ''
      },
      choiceName(n, name) {
        // 没有真实姓名
        if (!name) {
          return false
        } else {
          if (this.type.name === 2) {
            if (n === 0) {
              this.type.name = 1
            } else {
              this.type.name = 0
            }
          } else if (this.type.name === 1) {
            if (n === 0) {
              this.type.name = 2
            } else {
              return false
            }
          } else {
            if (n === 0) {
              return false
            } else {
              this.type.name = 2
            }
          }
        }
      },
      choiceWay(n, name) {
        if (!name) {
          return false
        } else {
          if (this.type.way === 2) {
            if (n === 0) {
              this.type.way = 1
            } else {
              this.type.way = 0
            }
          } else if (this.type.way === 1) {
            if (n === 0) {
              this.type.way = 2
            } else {
              return false
            }
          } else {
            if (n === 0) {
              return false
            } else {
              this.type.way = 2
            }
          }
        }
      },
      produceImg(cb) {
        let _this = this
        _this.reqing = true
        uni.showLoading({
        	title: this.produceMsg,
          mask: true
        })
        let context = uni.createCanvasContext('canvas', this)
        context.clearRect(0, 0, 1080, 1920)
        context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
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
        if (_this.isEdit && !this.resSrc) {
          _this.qrcode(_this.shareUrl, res => {
            this.qrcodeSrc = res
            _this.produceImg((base) => {
              _this.isEdit = false
              _this.reqing = false
              _this.resSrc = base
              _this.showPosterPop()
            })
          })
        } else {
          _this.showPosterPop()
        }
      },
      showPosterPop() {
        this.popPoster = true
      },
      hidePosterPop() {
        this.popPoster = false
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
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .canvas{
    top: -2000px; left: -2000px; z-index: 1; width: 1080px; height: 1920px; pointer-events: none;
  }
  .qrcodebox{
    top: -2000px; left: -2000px; width: 230px; height: 230px;
  }
  .content{
    height: calc(100% - 360upx);
    .pic-box{
      height: 100%; padding: 20upx;
      .canvas-box{
        z-index: 1; width: 100%; height: 100%;
        .res-box{
          z-index: 4; width: 100%; height: 100%;
          image{
            width: 100%; height: 100%;
          }
        }
        .demo{
          top: 0; left: 50%; z-index: 1; width: 1080px; height: 1920px; margin-left: -540px; transform-origin: center top;
          .demo-con{
            width: 100%; height: 100%;
            .bg{
              z-index: 1; width: 100%; height: 100%;
            }
            .avatar{
              top: 1105px; left: 100px; z-index: 3; width: 100px; height: 100px; border-radius: 100%;
            }
            .qrcode{
              top: 1463px; left: 230px; z-index: 3; width: 230px; height: 230px;
            }
            .name{
              top: 1136px; left: 240px; z-index: 3; font-size: 40px; font-weight: bold; line-height: 40px; color: #242424;
            }
            .identity{
              top: 1229px; left: 100px; z-index: 3; font-size: 36px; line-height: 36px; color: #242424;
            }
            .id{
              top: 1229px; left: 560px; z-index: 3; font-size: 36px; line-height: 36px; color: #242424;
            }
            .way{
              top: 1290px; left: 100px; z-index: 3; font-size: 36px; line-height: 36px; color: #242424;
            }
            .way2{
              left: 560px;
            }
          }
          &.edit{
            z-index: 99;
          }
        }
      }
    }
  }
  .choice-wrap{
    bottom: 0; left: 0; z-index: 9; width: 100%; background-color: $color-white;
    .tit{
      height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
    }
    .bank-lists{
      width: 100%; height: 120upx;
      .lists{
        padding-left: 30upx;
        .item{
          width: 120upx; height: 120upx; margin-right: 30upx; border-radius: $border-radius;
          image{
            width: 100%; height: 100%;
          }
          view{
            top: 0; left: 0; z-index: -1; display: none; width: 100%; height: 100%; background: rgba(255, 240, 200, .4); border: 4upx solid rgba(210, 161, 0, 1);
          }
          &.on view{
            display: block;
          }
        }
      }
    }
    .modify-type{
      padding: 0 30upx 30upx;
      .type{
        align-items: center;
        .txt{
          width: 144upx; font-size: $font-size-28; line-height: 96upx; color: $default-color;
        }
        .option{
          view{
            width: 160upx; height: 48upx; margin-right: 24upx; font-size: $font-size-26; line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: .48rem;
            &.on{
              color: $color-white; background-color: $color;
            }
            &.gray{
              color: $color-4; background: $level-1-bg; border: none; pointer-events: none;
            }
          }
        }
      }
    }
  }
  .pop-poster{
    .pop-con{
      height: calc(100% - 166upx);
      .tit{
        height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
      }
      .pic{
        image{
          width: 100%; height: 100%;
        }
      }
    }
  }
</style>
