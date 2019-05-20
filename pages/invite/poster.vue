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
      <canvas canvas-id="canvas" class="canvas uni-pa" v-if="isShow"></canvas>
      <canvas canvas-id="qrcodebox" :style="{'width': canvasSize + 'px;', 'height': canvasSize + 'px;'}" class="qrcodebox uni-pa"></canvas>
      <image :src="loadImageSrc" @load="loadImageCb" class="load-image"></image>
    </view>
  </view>
</template>

<script>
  import drawQrcodeInvite from '../../common/qrcode.min.js'
  
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
        type: -1,
        uid: null,
        bgImg: '',
        canvasSize: 500,
        qrcodeSrc: '',
        resSrc: '',
        loadArr: [],
        loadIndex: 0,
        loadImageSrc: '',
        downloading: false,
        shareFriending: false
			};
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
      userAvatar() {
        return this.userInfo.avatar_url ? this.userInfo.avatar_url : this.defaultAvatar
      },
      qrcodeLogo() {
        return '../../static/images/invite/poster-ewm-logo.png'
      },
      qrcodeBg1() {
        return '../../static/images/invite/poster-ewm-1.png'
      },
      qrcodeBg2() {
        return '../../static/images/invite/poster-ewm-2.png'
      },
      posterLine() {
        return '../../static/images/invite/poster-line.png'
      }
    },
    methods: {
      hide() {
      	this.isShow = false
      },
      returnBg(num) {
        return '../../static/images/invite/poster-bg-' + num + '.png'
      },
      returnTitle(num) {
        return '../../static/images/invite/poster-t-' + num + '.png'
      },
      // 生成二维码
      createQrcode(url, w, cb) {
        this.canvasSize = w
        drawQrcodeInvite({
          width: w,
          height: w,
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
      loadImageCb(e) {
        this.loadIndex ++
        if (this.loadIndex < this.loadArr.length) {
          this.loadImageSrc = this.loadArr[this.loadIndex]
        } else {
          this.produceImg()
        }
      },
      createLoadArr() {
        let _this = this
        this.loadArr = []
        this.loadIndex = 0
        switch (_this.type) {
          case 1:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 2:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 3:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 4:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 5:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 6:
            this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)]
            break
          case 7:
            this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)]
            break
          case 8:
            this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)]
            break
          case 9:
            this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)]
            break
        }
        this.loadImageSrc = this.loadArr[this.loadIndex]
      },
      produceImg() {
        let _this = this
        let context = uni.createCanvasContext('canvas', this)
        context.clearRect(0, 0, 1080, 1920)
        context.setTextBaseline('top')
        context.draw(false, () => {
          switch (_this.type) {
            case 1:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 758, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.save()
                          context.beginPath()
                          context.arc(191, 500, 60, 0, 2 * Math.PI)
                          context.clip()
                          context.drawImage(_this.userAvatar, 131, 440, 120, 120)
                          context.restore()
                          setTimeout(() => {
                            context.draw(true, () => {
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#333'
                              context.fillText('我是', 271, 465)
                              context.fillStyle = '#D2A100'
                              context.fillText(_this.userInfo.username, 390, 465)
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '“能赚钱的公众号，我也关注了。”',
                                    color: '#616586',
                                    size: 50
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 630
                              })
                              context.font = 'normal 45px PingFangSC'
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '长按识别，或',
                                    color: '#4A90E2',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1402
                              })
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '搜索公众号',
                                    color: '#4A90E2',
                                    size: 45
                                  },
                                  {
                                    str: '“' + _this.config.gzh_number + '”',
                                    color: '#E9B325',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1465
                              })
                              setTimeout(() => {
                                context.draw(true, () => {
                                  _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, res => {
                                    _this.qrcodeSrc = res
                                    context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498)
                                    setTimeout(() => {
                                      context.draw(true, () => {
                                        context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424)
                                        setTimeout(() => {
                                          context.draw(true, () => {
                                            context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100)
                                            setTimeout(() => {
                                              context.draw(true, () => {
                                                uni.canvasToTempFilePath({
                                                	canvasId: 'canvas',
                                                  destWidth: 1080,
                                                  destHeight: 1920,
                                                  success: res => {
                                                    _this.resSrc = res.tempFilePath
                                                  },
                                                  fail: err => {
                                                    _this.reqing = false
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
                                            }, 30)
                                          })
                                        }, 30)
                                      })
                                    }, 30)
                                  })
                                })
                              }, 30)
                            })
                          }, 30)
                        })
                      })
                    })
                  }, 30)
                })
              }, 30)
              break
            case 2:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 758, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          _this.$http({
                            url: _this.$apis.sfProfile,
                            method: 'GET',
                            data: {
                              id: ''
                            },
                            cb: (err, data) => {
                              if (!err && data.success) {
                                context.save()
                                context.beginPath()
                                context.arc(191, 500, 60, 0, 2 * Math.PI)
                                context.clip()
                                _this.userAvatar = data.data.avatar_url ? data.data.avatar_url : _this.defaultAvatar
                                context.drawImage(_this.userAvatar, 131, 440, 120, 120)
                                context.restore()
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    context.font = 'normal 50px PingFangSC'
                                    context.fillStyle = '#333'
                                    context.fillText('我是', 271, 465)
                                    context.fillStyle = '#D2A100'
                                    context.fillText(data.data.username ? data.data.username : _this.userInfo.username, 390, 465)
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '“我锁了',
                                          color: '#616586',
                                          size: 50
                                        },
                                        {
                                          str: data.data.invite_num + '个',
                                          color: '#D2A100',
                                          size: 50
                                        },
                                        {
                                          str: '好友粉丝，他们共',
                                          color: '#616586',
                                          size: 50
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 595
                                    })
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '领了',
                                          color: '#616586',
                                          size: 50
                                        },
                                        {
                                          str: data.data.red_envelop_amount + '元',
                                          color: '#D2A100',
                                          size: 50
                                        },
                                        {
                                          str: '”',
                                          color: '#616586',
                                          size: 50
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 667
                                    })
                                    context.font = 'normal 45px PingFangSC'
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '长按识别，进入免费',
                                          color: '#4A90E2',
                                          size: 45
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 1402
                                    })
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '发红包页面',
                                          color: '#4A90E2',
                                          size: 45
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 1465
                                    })
                                    _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, res => {
                                      _this.qrcodeSrc = res
                                      context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498)
                                      setTimeout(() => {
                                        context.draw(true, () => {
                                          context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424)
                                          setTimeout(() => {
                                            context.draw(true, () => {
                                              context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100)
                                              setTimeout(() => {
                                                context.draw(true, () => {
                                                  uni.canvasToTempFilePath({
                                                  	canvasId: 'canvas',
                                                    destWidth: 1080,
                                                    destHeight: 1920,
                                                    success: res => {
                                                      _this.resSrc = res.tempFilePath
                                                    },
                                                    fail: err => {
                                                      _this.reqing = false
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
                                              }, 30)
                                            })
                                          }, 30)
                                        })
                                      }, 30)
                                    })
                                  })
                                }, 30)
                              } else {
                                context.save()
                                context.beginPath()
                                context.arc(191, 500, 60, 0, 2 * Math.PI)
                                context.clip()
                                context.drawImage(_this.userAvatar, 131, 440, 120, 120)
                                context.restore()
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    context.font = 'normal 50px PingFangSC'
                                    context.fillStyle = '#333'
                                    context.fillText('我是', 271, 465)
                                    context.fillStyle = '#D2A100'
                                    context.fillText(_this.userInfo.username, 390, 465)
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '“我锁了',
                                          color: '#616586',
                                          size: 50
                                        },
                                        {
                                          str: '120个',
                                          color: '#D2A100',
                                          size: 50
                                        },
                                        {
                                          str: '好友粉丝，他们共',
                                          color: '#616586',
                                          size: 50
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 595
                                    })
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '领了',
                                          color: '#616586',
                                          size: 50
                                        },
                                        {
                                          str: '658元',
                                          color: '#D2A100',
                                          size: 50
                                        },
                                        {
                                          str: '”',
                                          color: '#616586',
                                          size: 50
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 665
                                    })
                                    context.font = 'normal 45px PingFangSC'
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '长按识别，进入免费',
                                          color: '#4A90E2',
                                          size: 45
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 1402
                                    })
                                    _this.drawDiffText({
                                      context: context,
                                      text: [
                                        {
                                          str: '发红包页面',
                                          color: '#4A90E2',
                                          size: 45
                                        }
                                      ],
                                      letterSpacing: 0,
                                      width: 1080,
                                      y: 1465
                                    })
                                    _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, res => {
                                      _this.qrcodeSrc = res
                                      context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498)
                                      setTimeout(() => {
                                        context.draw(true, () => {
                                          context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424)
                                          setTimeout(() => {
                                            context.draw(true, () => {
                                              context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100)
                                              setTimeout(() => {
                                                context.draw(true, () => {
                                                  uni.canvasToTempFilePath({
                                                  	canvasId: 'canvas',
                                                    destWidth: 1080,
                                                    destHeight: 1920,
                                                    success: res => {
                                                      _this.resSrc = res.tempFilePath
                                                    },
                                                    fail: err => {
                                                      _this.reqing = false
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
                                              }, 30)
                                            })
                                          }, 30)
                                        })
                                      }, 30)
                                    })
                                  })
                                }, 30)
                              }
                            }
                          })
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 3:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 758, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.save()
                          context.beginPath()
                          context.arc(191, 500, 60, 0, 2 * Math.PI)
                          context.clip()
                          context.drawImage(_this.userAvatar, 131, 440, 120, 120)
                          context.restore()
                          setTimeout(() => {
                            context.draw(true, () => {
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#333'
                              context.fillText('我是', 271, 465)
                              context.fillStyle = '#D2A100'
                              context.fillText(_this.userInfo.username, 390, 465)
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '“高额秒批速来！”',
                                    color: '#616586',
                                    size: 50
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 630
                              })
                              context.font = 'normal 45px PingFangSC'
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '长按识别，进入信用卡',
                                    color: '#4A90E2',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1402
                              })
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '快速申请通道',
                                    color: '#4A90E2',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1465
                              })
                              _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, res => {
                                _this.qrcodeSrc = res
                                context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498)
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424)
                                    setTimeout(() => {
                                      context.draw(true, () => {
                                        context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100)
                                        setTimeout(() => {
                                          context.draw(true, () => {
                                            uni.canvasToTempFilePath({
                                            	canvasId: 'canvas',
                                              destWidth: 1080,
                                              destHeight: 1920,
                                              success: res => {
                                                _this.resSrc = res.tempFilePath
                                              },
                                              fail: err => {
                                                _this.reqing = false
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
                                        }, 30)
                                      })
                                    }, 30)
                                  })
                                }, 30)
                              })
                            })
                          }, 30)
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 4:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 758, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.save()
                          context.beginPath()
                          context.arc(191, 500, 60, 0, 2 * Math.PI)
                          context.clip()
                          context.drawImage(_this.userAvatar, 131, 440, 120, 120)
                          context.restore()
                          setTimeout(() => {
                            context.draw(true, () => {
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#333'
                              context.fillText('我是', 271, 465)
                              context.fillStyle = '#D2A100'
                              context.fillText(_this.userInfo.username, 390, 465)
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '“',
                                    color: '#616586',
                                    size: 50
                                  },
                                  {
                                    str: _this.config.system_name,
                                    color: '#D2A100',
                                    size: 50
                                  },
                                  {
                                    str: '，',
                                    color: '#616586',
                                    size: 50
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 595
                              })
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '一个赚钱的平台，推荐给你！”',
                                    color: '#616586',
                                    size: 50
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 665
                              })
                              context.font = 'normal 45px PingFangSC'
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '长按识别，获取',
                                    color: '#4A90E2',
                                    size: 45
                                  },
                                  {
                                    str: _this.config.system_nick_name,
                                    color: '#E9B325',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1402
                              })
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '升级通道',
                                    color: '#4A90E2',
                                    size: 45
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                y: 1465
                              })
                              _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, res => {
                                _this.qrcodeSrc = res
                                context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498)
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424)
                                    setTimeout(() => {
                                      context.draw(true, () => {
                                        context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100)
                                        setTimeout(() => {
                                          context.draw(true, () => {
                                            uni.canvasToTempFilePath({
                                            	canvasId: 'canvas',
                                              destWidth: 1080,
                                              destHeight: 1920,
                                              success: res => {
                                                _this.resSrc = res.tempFilePath
                                              },
                                              fail: err => {
                                                _this.reqing = false
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
                                        }, 30)
                                      })
                                    }, 30)
                                  })
                                }, 30)
                              })
                            })
                          }, 30)
                        })
                      },30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 5:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 1219, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.save()
                          context.beginPath()
                          context.arc(178, 528, 60, 0, 2 * Math.PI)
                          context.clip()
                          context.drawImage(_this.userAvatar, 118, 468, 120, 120)
                          context.restore()
                          setTimeout(() => {
                            context.draw(true, () => {
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#333'
                              context.fillText('我是', 267, 468)
                              context.fillStyle = '#D2A100'
                              context.fillText(_this.userInfo.username, 386, 468)
                              context.font = 'normal 45px PingFangSC'
                              context.fillStyle = '#616586'
                              context.fillText('“本月有米兔收益前3名！”', 267, 538)
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#4A90E2'
                              context.fillText('长按识别二维码', 481, 1352)
                              _this.drawDiffText({
                                context: context,
                                text: [
                                  {
                                    str: '回',
                                    color: '#4A90E2',
                                    size: 50
                                  },
                                  {
                                    str: _this.config.system_nick_name,
                                    color: '#E9B325',
                                    size: 50
                                  },
                                  {
                                    str: '看看',
                                    color: '#4A90E2',
                                    size: 50
                                  }
                                ],
                                letterSpacing: 0,
                                width: 1080,
                                x: 481,
                                y: 1435
                              })
                              _this.$http({
                                url: _this.$apis.monthTop,
                                method: 'GET',
                                data: null,
                                cb: (err, data) => {
                                  if (!err && data.success) {
                                    let y = 629
                                    data.data.forEach((item, index) => {
                                      context.drawImage('../../static/images/invite/poster-m-' + (index + 1) + '.png', 133, y + 58, 60, 85)
                                      context.draw(true)
                                      context.drawImage(item.img ? item.img : _this.defaultAvatar, 243, y + 40, 120, 120)
                                      context.draw(true)
                                      context.font = 'normal 45px PingFangSC'
                                      context.fillStyle = '#333'
                                      context.fillText(item.name, 415, y + 73)
                                      context.setTextAlign('right')
                                      context.font = 'normal 60px PingFangSC'
                                      context.fillStyle = '#D2A100'
                                      context.fillText('￥' + item.amount, 954, y + 65)
                                      context.setTextAlign('left')
                                      if (index < 2) {
                                        context.moveTo(95, y + 200)
                                        context.lineTo(981, y + 200)
                                        context.lineWidth = 5
                                        context.strokeStyle = '#f1f1f1'
                                        context.stroke()
                                      }
                                      y += 201
                                    })
                                  }
                                  _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 234, res => {
                                    _this.qrcodeSrc = res
                                    context.drawImage(_this.qrcodeBg2, 153, 1289, 280, 279)
                                    setTimeout(() => {
                                      context.draw(true, () => {
                                        context.drawImage(_this.qrcodeSrc, 176, 1312, 234, 234)
                                        setTimeout(() => {
                                          context.draw(true, () => {
                                            context.drawImage(_this.qrcodeLogo, 261, 1397, 62, 62)
                                            setTimeout(() => {
                                              context.draw(true, () => {
                                                uni.canvasToTempFilePath({
                                                	canvasId: 'canvas',
                                                  destWidth: 1080,
                                                  destHeight: 1920,
                                                  success: res => {
                                                    _this.resSrc = res.tempFilePath
                                                  },
                                                  fail: err => {
                                                    _this.reqing = false
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
                                            }, 30)
                                          })
                                        }, 30)
                                      })
                                    }, 30)
                                  })
                                }
                              })
                            })
                          }, 30)
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 6:
              _this.bgImg = _this.returnBg(1)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.drawImage(_this.posterLine, 0, 1219, 1080, 59)
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.save()
                          context.beginPath()
                          context.arc(178, 528, 60, 0, 2 * Math.PI)
                          context.clip()
                          context.drawImage(_this.userAvatar, 118, 468, 120, 120)
                          context.restore()
                          setTimeout(() => {
                            context.draw(true, () => {
                              context.setTextAlign('left')
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#333'
                              context.fillText('我是', 267, 468)
                              context.fillStyle = '#D2A100'
                              context.fillText(_this.userInfo.username, 386, 468)
                              context.font = 'normal 45px PingFangSC'
                              context.fillStyle = '#616586'
                              context.fillText('“ 你的账号里还有钱，可以提现', 233, 538)
                              context.fillText('到微信钱包哦。”', 267, 601)
                              context.font = 'normal 50px PingFangSC'
                              context.fillStyle = '#4A90E2'
                              context.fillText('长按识别二维码', 481, 1352)
                              context.fillText('立即查看', 481, 1435)
                              context.drawImage('../../static/images/invite/poster-b.png', 425, 729, 230, 230)
                              setTimeout(() => {
                                context.draw(true, () => {
                                  _this.$http({
                                    url: _this.$apis.sfProfile,
                                    method: 'GET',
                                    data: {
                                      id: _this.uid
                                    },
                                    cb: (err, data) => {
                                      if (!err && data.success) {
                                        context.setTextAlign('center')
                                        context.font = 'normal 46px PingFangSC'
                                        context.fillStyle = '#333'
                                        context.fillText('账户余额', 540, 998)
                                        context.font = 'normal 90px PingFangSC'
                                        context.fillText('￥' + data.data.balance + '元', 540, 1076)
                                      }
                                      _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 234, res => {
                                        _this.qrcodeSrc = res
                                        context.drawImage(_this.qrcodeBg2, 153, 1289, 280, 279)
                                        setTimeout(() => {
                                          context.draw(true, () => {
                                            context.drawImage(_this.qrcodeSrc, 176, 1312, 234, 234)
                                            setTimeout(() => {
                                              context.draw(true, () => {
                                                context.drawImage(_this.qrcodeLogo, 261, 1397, 62, 62)
                                                setTimeout(() => {
                                                  context.draw(true, () => {
                                                    uni.canvasToTempFilePath({
                                                    	canvasId: 'canvas',
                                                      destWidth: 1080,
                                                      destHeight: 1920,
                                                      success: res => {
                                                        _this.resSrc = res.tempFilePath
                                                      },
                                                      fail: err => {
                                                        _this.reqing = false
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
                                                }, 30)
                                              })
                                            }, 30)
                                          })
                                        }, 30)
                                      })
                                    }
                                  })
                                })
                              }, 30)
                            })
                          }, 30)
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 7:
              _this.bgImg = _this.returnBg(2)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.save()
                      context.beginPath()
                      context.arc(150, 164, 60, 0, 2 * Math.PI)
                      context.clip()
                      context.drawImage(_this.userAvatar, 90, 104, 120, 120)
                      context.restore()
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.font = 'normal 50px PingFangSC'
                          context.fillStyle = '#fff'
                          context.fillText('我是', 250, 129)
                          context.fillText(_this.userInfo.username, 369, 129)
                          context.font = 'bold 50px PingFangSC'
                          _this.drawDiffText({
                            context: context,
                            text: [
                              {
                                str: '8.80',
                                color: '#FBE39C',
                                size: 150
                              },
                              {
                                str: '元',
                                color: '#FBE39C',
                                size: 80
                              }
                            ],
                            letterSpacing: 0,
                            width: 1080,
                            y: 701
                          })
                          _this.$http({
                            url: _this.$apis.newestRedId,
                            method: 'GET',
                            data: null,
                            cb: (err, data) => {
                              if (!err && data.success) {
                                _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, res => {
                                  _this.qrcodeSrc = res
                                  context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452)
                                  setTimeout(() => {
                                    context.draw(true, () => {
                                      context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118)
                                      setTimeout(() => {
                                        context.draw(true, () => {
                                          uni.canvasToTempFilePath({
                                          	canvasId: 'canvas',
                                            destWidth: 1080,
                                            destHeight: 1920,
                                            success: res => {
                                              _this.resSrc = res.tempFilePath
                                            },
                                            fail: err => {
                                              _this.reqing = false
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
                                      }, 30)
                                    })
                                  }, 30)
                                })
                              } else {
                                uni.showToast({
                                	title: '海报生成失败，请稍后再试',
                                  icon: 'none'
                                })
                                _this.reqing = false
                                uni.hideLoading()
                                _this.hide()
                              }
                            }
                          })
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 8:
              _this.bgImg = _this.returnBg(2)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.save()
                      context.beginPath()
                      context.arc(150, 164, 60, 0, 2 * Math.PI)
                      context.clip()
                      context.drawImage(_this.userAvatar, 90, 104, 120, 120)
                      context.restore()
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.font = 'normal 50px PingFangSC'
                          context.fillStyle = '#fff'
                          context.fillText('我是', 250, 129)
                          context.fillText(_this.userInfo.username, 369, 129)
                          context.setTextAlign('center')
                          context.font = 'normal 40px PingFangSC'
                          context.fillStyle = '#FBE39C'
                          context.fillText('我在这里领了88元红包', 540, 649)
                          context.setTextAlign('left')
                          context.font = 'bold 50px PingFangSC'
                          _this.drawDiffText({
                            context: context,
                            text: [
                              {
                                str: '88',
                                color: '#FBE39C',
                                size: 150
                              },
                              {
                                str: '元',
                                color: '#FBE39C',
                                size: 80
                              }
                            ],
                            letterSpacing: 0,
                            width: 1080,
                            y: 739
                          })
                          _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, res => {
                            _this.qrcodeSrc = res
                            context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452)
                            setTimeout(() => {
                              context.draw(true, () => {
                                context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118)
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    uni.canvasToTempFilePath({
                                    	canvasId: 'canvas',
                                      destWidth: 1080,
                                      destHeight: 1920,
                                      success: res => {
                                        _this.resSrc = res.tempFilePath
                                      },
                                      fail: err => {
                                        _this.reqing = false
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
                                }, 30)
                              })
                            }, 30)
                          })
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
            case 9:
              _this.bgImg = _this.returnBg(2)
              context.drawImage(_this.bgImg, 0, 0, 1080, 1920)
              setTimeout(() => {
                context.draw(true, () => {
                  context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300)
                  setTimeout(() => {
                    context.draw(true, () => {
                      context.save()
                      context.beginPath()
                      context.arc(150, 164, 60, 0, 2 * Math.PI)
                      context.clip()
                      context.drawImage(_this.userAvatar, 90, 104, 120, 120)
                      context.restore()
                      setTimeout(() => {
                        context.draw(true, () => {
                          context.font = 'normal 50px PingFangSC'
                          context.fillStyle = '#fff'
                          context.fillText('我是', 250, 129)
                          context.fillText(_this.userInfo.username, 369, 129)
                          context.setTextAlign('center')
                          context.font = 'normal 40px PingFangSC'
                          context.fillStyle = '#FBE39C'
                          context.fillText('您有168元红包待领取', 540, 649)
                          context.setTextAlign('left')
                          context.font = 'bold 50px PingFangSC'
                          _this.drawDiffText({
                            context: context,
                            text: [
                              {
                                str: '168',
                                color: '#FBE39C',
                                size: 150
                              },
                              {
                                str: '元',
                                color: '#FBE39C',
                                size: 80
                              }
                            ],
                            letterSpacing: 0,
                            width: 1080,
                            y: 739
                          })
                          _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, res => {
                            _this.qrcodeSrc = res
                            context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452)
                            setTimeout(() => {
                              context.draw(true, () => {
                                context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118)
                                setTimeout(() => {
                                  context.draw(true, () => {
                                    uni.canvasToTempFilePath({
                                    	canvasId: 'canvas',
                                      destWidth: 1080,
                                      destHeight: 1920,
                                      success: res => {
                                        _this.resSrc = res.tempFilePath
                                      },
                                      fail: err => {
                                        _this.reqing = false
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
                                }, 30)
                              })
                            }, 30)
                          })
                        })
                      }, 30)
                    })
                  }, 30)
                })
              }, 30)
              break
          }
        })
      },
      drawDiffText(obj) {
        let context = obj.context
        if (obj.text.length <= 1 && obj.letterSpacing === 0) {
          let align = context.textAlign || 'left'
          context.setTextAlign('center')
          context.fillStyle = obj.text[0].color
          context.fillText(obj.text[0].str, obj.width / 2, obj.y)
          context.setTextAlign(align)
        } else {
          let allText = ''
          let originWidth = 0
          let maxSize = 0
          obj.text.forEach(item => {
            allText += item.str
            context.setFontSize(item.size)
            maxSize = item.size > maxSize ? item.size : maxSize
            originWidth += context.measureText(item.str).width
          })
          originWidth += obj.letterSpacing * (allText.split('').length - 1)
          let start = obj.x ? obj.x : (obj.width - originWidth) / 2
          obj.text.forEach(item => {
            item.x = start
            item.str.split('').forEach(sitem => {
              context.setFontSize(item.size)
              context.fillStyle = item.color
              context.fillText(sitem, item.x, item.size >= maxSize ? obj.y : obj.y + (maxSize - item.size))
              item.x += context.measureText(sitem).width + obj.letterSpacing
            })
            start += context.measureText(item.str).width + item.str.split('').length * obj.letterSpacing
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
        if (this.uid !== val.uid && this.type !== val.type) {
          this.type = val.type || 8
          this.uid = val.uid || this.userInfo.id
          this.resSrc = ''
          this.qrcodeSrc = ''
          if (this.isShow) {
            uni.showLoading({
            	title: '正在生成海报',
              mask: true
            })
            this.createLoadArr()
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
      top: -2000px; left: -2000px; z-index: 9999; width: 1080px; height: 1920px; pointer-events: none;
    }
    .qrcodebox{
      top: -2000px; left: -2000px;
    }
    .load-image{
      top: -2000px; left: -2000px; z-index: 9; pointer-events: none;
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
