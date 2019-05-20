(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/spread/poster"],{

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/spread/poster.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;





















































































var _qrcodeMin = _interopRequireDefault(__webpack_require__(/*! ../../common/qrcode.min.js */ "F:\\dinghui\\app\\common\\qrcode.min.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

{
  data: function data() {
    return {
      text: {
        0: '选择银行查看海报',
        1: '定义海报内容' },

      bgImg: '',
      textIndex: 0,
      bankLists: [],
      shareUrl: '',
      bankIndex: -1,
      type: {
        name: 2,
        way: 2 },

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
      bankListsWidth: '100%' };

  },
  computed: {
    userInfo: function userInfo() {
      return this.$store.state.userInfo;
    },
    defaultAvatar: function defaultAvatar() {
      return '../../static/images/avatar.png';
    },
    showName: function showName() {
      var str = '';
      if (this.userInfo.real_name) {
        if (this.type.name === 2) {
          str = this.userInfo.username + ' (' + this.userInfo.real_name + ')';
        } else if (this.type.name === 0) {
          str = this.userInfo.real_name;
        } else {
          str = this.userInfo.username;
        }
      } else {
        str = this.userInfo.username;
      }
      return str;
    },
    showIdentity: function showIdentity() {
      if (this.userInfo.role === 1) {
        return '普通会员';
      } else if (this.userInfo.role === 2) {
        return '黄金VIP';
      } else if (this.userInfo.role === 3) {
        return '铂金VIP';
      } else if (this.userInfo.role === 4) {
        return '钻石VIP';
      } else {
        return '临时用户';
      }
    },
    showId: function showId() {
      return '会员ID：' + this.userInfo.id;
    },
    showWay: function showWay() {
      var str = '';
      if (this.type.way === 0 || this.type.way === 2) {
        str = '电话：' + this.userInfo.mobile;
      } else {
        if (this.userInfo.wx_number) {
          str = '微信号：' + this.userInfo.wx_number;
        }
      }
      return str;
    },
    showWay2: function showWay2() {
      var str = '';
      if (this.type.way === 2 && this.userInfo.wx_number) {
        str = '微信号：' + this.userInfo.wx_number;
      }
      return str;
    } },

  onLoad: function onLoad() {var _this2 = this;
    this.$http({
      url: this.$apis.banks,
      method: 'GET',
      data: null,
      cb: function cb(err, data) {
        if (!err && data.success) {
          _this2.bankLists = data.data;
          var configInfo = _this2.$store.state.config;
          _this2.bankLists.unshift({
            logo_url: configInfo.logo,
            background_img: configInfo.background_img,
            code: '' });

          _this2.bankListsWidth = uni.upx2px(_this2.bankLists.length * 150 + 30) + 'px';
          _this2.choiceBank(0);
        }
      } });

  },
  onReady: function onReady() {var _this3 = this;
    uni.createSelectorQuery().select('#resbox').fields({
      size: true },
    function (data) {
      _this3.scale = data.height / 1920;
    }).exec();
  },
  methods: {
    // 生成二维码
    qrcode: function qrcode(url, cb) {
      (0, _qrcodeMin.default)({
        width: 230,
        height: 230,
        canvasId: 'qrcodebox',
        text: url });

      setTimeout(function () {
        uni.canvasToTempFilePath({
          canvasId: 'qrcodebox',
          success: function success(res) {
            if (typeof cb === 'function') {
              cb(res.tempFilePath);
            }
          } });

      }, 300);
    },
    choiceBank: function choiceBank(n) {var _this4 = this;
      if (this.bankIndex === n) return;
      if (this.reqing) {
        uni.showToast({
          title: '正在生成海报...',
          icon: 'none' });

        return false;
      }
      this.bankIndex = n;
      this.bgImg = '';
      if (n === 0) {
        this.shareUrl = this.$constant.shareUrl + '?pid=' + this.userInfo.id;
      } else {
        this.shareUrl = this.$constant.shareUrl + '?pid=' + this.userInfo.id;
      }
      this.isEdit = true;
      this.bgLoad = true;
      this.isLoad = true;
      this.resSrc = '';
      uni.showLoading({
        title: this.loadingMsg,
        mask: true });

      uni.downloadFile({
        url: this.bankLists[this.bankIndex].background_img,
        success: function success(res) {
          if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
            _this4.bgImg = res.tempFilePath;
          } else {
            _this4.bgLoad = false;
            uni.hideLoading();
            uni.showToast({
              title: '背景图下载失败，请稍后再试',
              icon: 'none' });

          }
        },
        fail: function fail(err) {
          _this4.bgLoad = false;
          uni.hideLoading();
          uni.showToast({
            title: '背景图下载失败，请稍后再试',
            icon: 'none' });

        } });

    },
    loadedBg: function loadedBg() {
      this.isLoad = false;
      this.bgLoad = false;
      uni.hideLoading();
    },
    gotoEdit: function gotoEdit() {
      if (this.reqing) {
        uni.showToast({
          title: '正在生成海报...',
          icon: 'none' });

        return false;
      }
      this.textIndex = 1;
      this.isEdit = true;
      this.oldType = null;
      this.oldType = this.$utils.cloneObj(this.type);
      this.choiceBank(this.bankIndex);
    },
    cancalEdit: function cancalEdit() {
      this.textIndex = 0;
      this.type = null;
      this.type = this.$utils.cloneObj(this.oldType);
    },
    savaOption: function savaOption() {
      this.textIndex = 0;
      this.resSrc = '';
    },
    choiceName: function choiceName(n, name) {
      // 没有真实姓名
      if (!name) {
        return false;
      } else {
        if (this.type.name === 2) {
          if (n === 0) {
            this.type.name = 1;
          } else {
            this.type.name = 0;
          }
        } else if (this.type.name === 1) {
          if (n === 0) {
            this.type.name = 2;
          } else {
            return false;
          }
        } else {
          if (n === 0) {
            return false;
          } else {
            this.type.name = 2;
          }
        }
      }
    },
    choiceWay: function choiceWay(n, name) {
      if (!name) {
        return false;
      } else {
        if (this.type.way === 2) {
          if (n === 0) {
            this.type.way = 1;
          } else {
            this.type.way = 0;
          }
        } else if (this.type.way === 1) {
          if (n === 0) {
            this.type.way = 2;
          } else {
            return false;
          }
        } else {
          if (n === 0) {
            return false;
          } else {
            this.type.way = 2;
          }
        }
      }
    },
    produceImg: function produceImg(cb) {var _this5 = this;
      var _this = this;
      _this.reqing = true;
      uni.showLoading({
        title: this.produceMsg,
        mask: true });

      var context = uni.createCanvasContext('canvas', this);
      context.clearRect(0, 0, 1080, 1920);
      context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
      context.draw(true, function () {
        context.save();
        context.beginPath();
        context.arc(150, 1155, 50, 0, 2 * Math.PI);
        context.clip();
        context.drawImage(_this.userInfo.avatar_url ? _this.userInfo.avatar_url : _this.defaultAvatar, 100, 1105, 100, 100);
        context.restore();
        context.drawImage(_this.qrcodeSrc, 230, 1463, 230, 230);
        context.font = 'bold 40px PingFangSC';
        context.fillStyle = '#242424';
        context.fillText(_this.showName, 240, 1172);
        context.font = 'normal 36px PingFangSC';
        context.fillStyle = '#242424';
        context.fillText(_this.showIdentity, 100, 1265);
        context.font = 'normal 36px PingFangSC';
        context.fillStyle = '#242424';
        context.fillText(_this.showId, 560, 1265);
        context.font = 'normal 36px PingFangSC';
        context.fillStyle = '#242424';
        context.fillText(_this.showWay, 100, 1326);
        context.font = 'normal 36px PingFangSC';
        context.fillStyle = '#242424';
        context.fillText(_this.showWay2, 560, 1326);
        setTimeout(function () {
          context.draw(true, function () {
            uni.canvasToTempFilePath({
              canvasId: 'canvas',
              destWidth: 1080,
              destHeight: 1920,
              success: function success(res) {
                if (typeof cb === 'function') {
                  cb(res.tempFilePath);
                }
              },
              fail: function fail(err) {
                _this5.reqing = false;
                uni.showToast({
                  title: err,
                  icon: 'none' });

              },
              complete: function complete() {
                uni.hideLoading();
              } });

          });
        }, 100);
      });
    },
    savaImg: function savaImg() {var _this6 = this;
      var _this = this;
      if (_this.isLoad) return;
      if (_this.reqing) {
        uni.showToast({
          title: this.produceMsg,
          icon: 'none' });

        return false;
      }
      if (_this.isEdit && !this.resSrc) {
        _this.qrcode(_this.shareUrl, function (res) {
          _this6.qrcodeSrc = res;
          _this.produceImg(function (base) {
            _this.isEdit = false;
            _this.reqing = false;
            _this.resSrc = base;
            _this.showPosterPop();
          });
        });
      } else {
        _this.showPosterPop();
      }
    },
    showPosterPop: function showPosterPop() {
      this.popPoster = true;
    },
    hidePosterPop: function hidePosterPop() {
      this.popPoster = false;
    },
    download: function download() {var _this7 = this;
      if (this.downloading) {
        uni.showToast({
          title: '正在下载图片，请勿频繁操作',
          icon: 'none' });

        return;
      }
      this.downloading = true;
      uni.saveImageToPhotosAlbum({
        filePath: this.resSrc,
        success: function success(res) {
          uni.showModal({
            title: '提示',
            content: "\u6587\u4EF6\u5DF2\u4FDD\u5B58\u5230\u76F8\u518C",
            showCancel: false,
            confirmText: '知道了' });

        },
        fail: function fail(err) {
          uni.showToast({
            title: '图片保存失败，请稍后再试\n' + JSON.stringify(err),
            icon: 'none' });

        },
        complete: function complete() {
          _this7.downloading = false;
        } });

    },
    shareFriend: function shareFriend() {var _this8 = this;
      if (this.shareFriending) {
        uni.showToast({
          title: '正在启动分享，请勿频繁操作',
          icon: 'none' });

        return;
      }
      this.shareFriending = true;
      uni.getProvider({
        service: 'share',
        success: function success(res) {
          if (~res.provider.indexOf('weixin')) {
            uni.share({
              provider: 'weixin',
              type: 2,
              scene: 'WXSceneSession',
              imageUrl: _this8.resSrc,
              success: function success(res) {
                console.log(res);
              },
              fail: function fail(err) {
                uni.showToast({
                  title: err.errMsg,
                  icon: 'none' });

              },
              complete: function complete() {
                _this8.shareFriending = false;
              } });

          } else {
            uni.showToast({
              title: '分享失败，未检测到微信',
              icon: 'none' });

            _this8.shareFriending = false;
          }
        },
        fail: function fail() {
          uni.showToast({
            title: '分享失败，再稍后再试',
            icon: 'none' });

          _this8.shareFriending = false;
        } });

    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/spread/poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=template&id=36a2a452&scoped=true&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/spread/poster.vue?vue&type=template&id=36a2a452&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("view", { staticClass: "container" }, [
    _c(
      "view",
      { staticClass: "content" },
      [
        _c(
          "scroll-view",
          { staticClass: "scroll-view", attrs: { "scroll-y": "" } },
          [
            _c("view", { staticClass: "pic-box uni-box" }, [
              _c("view", { staticClass: "canvas-box uni-pr" }, [
                _c(
                  "view",
                  { staticClass: "res-box uni-pr", attrs: { id: "resbox" } },
                  [
                    _vm.resSrc
                      ? _c("image", {
                          attrs: { src: _vm.resSrc, mode: "aspectFit" }
                        })
                      : _vm._e()
                  ]
                ),
                _c(
                  "view",
                  {
                    staticClass: "demo uni-pa",
                    class: { edit: _vm.isEdit },
                    style:
                      "transform: scale(" +
                      _vm.scale +
                      ");-webkit-transform: scale(" +
                      _vm.scale +
                      ");"
                  },
                  [
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.isEdit && !_vm.bgLoad && _vm.bgImg,
                            expression: "isEdit && !bgLoad && bgImg"
                          }
                        ],
                        staticClass: "demo-con uni-pr"
                      },
                      [
                        _c("image", {
                          staticClass: "bg uni-pr",
                          attrs: {
                            src: _vm.bgImg,
                            mode: "aspectFill",
                            eventid: "98ca1e8c-0"
                          },
                          on: { load: _vm.loadedBg }
                        }),
                        _c("image", {
                          staticClass: "avatar uni-pa",
                          attrs: {
                            src: _vm.userInfo.fans_avatar_local_url
                              ? _vm.userInfo.fans_avatar_local_url
                              : _vm.defaultAvatar,
                            mode: ""
                          }
                        }),
                        _c("image", {
                          staticClass: "qrcode uni-pa",
                          attrs: {
                            src: _vm.userInfo.invite_qrcode_url,
                            mode: ""
                          }
                        }),
                        _c("view", { staticClass: "name uni-pa" }, [
                          _vm._v(_vm._s(_vm.showName))
                        ]),
                        _c("view", { staticClass: "identity uni-pa" }, [
                          _vm._v(_vm._s(_vm.showIdentity))
                        ]),
                        _c("view", { staticClass: "id uni-pa" }, [
                          _vm._v(_vm._s(_vm.showId))
                        ]),
                        _c("view", { staticClass: "way uni-pa" }, [
                          _vm._v(_vm._s(_vm.showWay))
                        ]),
                        _c("view", { staticClass: "way way2 uni-pa" }, [
                          _vm._v(_vm._s(_vm.showWay2))
                        ])
                      ]
                    )
                  ]
                ),
                _c("canvas", {
                  staticClass: "canvas uni-pa",
                  attrs: { "canvas-id": "canvas" }
                }),
                _c("canvas", {
                  staticClass: "qrcodebox uni-pa",
                  attrs: { "canvas-id": "qrcodebox" }
                })
              ])
            ])
          ]
        )
      ],
      1
    ),
    _c("view", { staticClass: "choice-wrap uni-pa" }, [
      _c("view", { staticClass: "tit" }, [
        _vm._v(_vm._s(_vm.text[_vm.textIndex]))
      ]),
      _c(
        "view",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.textIndex === 0,
              expression: "textIndex === 0"
            }
          ],
          staticClass: "bank"
        },
        [
          _c(
            "scroll-view",
            { staticClass: "bank-lists", attrs: { "scroll-x": "" } },
            [
              _c(
                "view",
                {
                  staticClass: "lists uni-flex uni-box",
                  style: "width:" + _vm.bankListsWidth
                },
                _vm._l(_vm.bankLists, function(item, index) {
                  return _c(
                    "view",
                    {
                      key: index,
                      staticClass: "item uni-pr uni-ovh",
                      class: { on: index === _vm.bankIndex },
                      attrs: { eventid: "98ca1e8c-1-" + index },
                      on: {
                        click: function($event) {
                          _vm.choiceBank(index)
                        }
                      }
                    },
                    [
                      _c("image", {
                        staticClass: "uni-pr",
                        attrs: { src: item.logo_url, mode: "" }
                      }),
                      _c("view", { staticClass: "uni-pa uni-box" })
                    ]
                  )
                })
              )
            ]
          ),
          _c("view", { staticClass: "operation-2" }, [
            _c(
              "view",
              { attrs: { eventid: "98ca1e8c-2" }, on: { click: _vm.gotoEdit } },
              [_vm._v("修改内容")]
            ),
            _c(
              "view",
              {
                class: { disabled: _vm.isLoad },
                attrs: { eventid: "98ca1e8c-3" },
                on: { click: _vm.savaImg }
              },
              [_vm._v("生成海报")]
            )
          ])
        ],
        1
      ),
      _c(
        "view",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.textIndex === 1,
              expression: "textIndex === 1"
            }
          ],
          staticClass: "modify"
        },
        [
          _c("view", { staticClass: "modify-type" }, [
            _c("view", { staticClass: "type uni-flex" }, [
              _c("view", { staticClass: "txt" }, [_vm._v("称呼方式")]),
              _c("view", { staticClass: "option uni-flex uni-txc" }, [
                _c(
                  "view",
                  {
                    class: {
                      on: _vm.type.name === 0 || _vm.type.name === 2,
                      gray: !_vm.userInfo.real_name
                    },
                    attrs: { eventid: "98ca1e8c-4" },
                    on: {
                      click: function($event) {
                        _vm.choiceName(0, _vm.userInfo.real_name)
                      }
                    }
                  },
                  [_vm._v("真实姓名")]
                ),
                _c(
                  "view",
                  {
                    class: { on: _vm.type.name === 1 || _vm.type.name === 2 },
                    attrs: { eventid: "98ca1e8c-5" },
                    on: {
                      click: function($event) {
                        _vm.choiceName(1, _vm.userInfo.real_name)
                      }
                    }
                  },
                  [_vm._v("微信昵称")]
                )
              ])
            ]),
            _c("view", { staticClass: "type uni-flex" }, [
              _c("view", { staticClass: "txt" }, [_vm._v("联系方式")]),
              _c("view", { staticClass: "option uni-flex uni-txc" }, [
                _c(
                  "view",
                  {
                    staticClass: "uni-box",
                    class: { on: _vm.type.way === 0 || _vm.type.way === 2 },
                    attrs: { eventid: "98ca1e8c-6" },
                    on: {
                      click: function($event) {
                        _vm.choiceWay(0, _vm.userInfo.wx_number)
                      }
                    }
                  },
                  [_vm._v("手机号")]
                ),
                _c(
                  "view",
                  {
                    staticClass: "uni-box",
                    class: {
                      on: _vm.type.way === 1 || _vm.type.way === 2,
                      gray: !_vm.userInfo.wx_number
                    },
                    attrs: { eventid: "98ca1e8c-7" },
                    on: {
                      click: function($event) {
                        _vm.choiceWay(1, _vm.userInfo.wx_number)
                      }
                    }
                  },
                  [_vm._v("微信号")]
                )
              ])
            ])
          ]),
          _c("view", { staticClass: "operation-2" }, [
            _c(
              "view",
              {
                staticClass: "gray",
                attrs: { eventid: "98ca1e8c-8" },
                on: { click: _vm.cancalEdit }
              },
              [_vm._v("取消")]
            ),
            _c(
              "view",
              {
                attrs: { eventid: "98ca1e8c-9" },
                on: { click: _vm.savaOption }
              },
              [_vm._v("保存")]
            )
          ])
        ]
      )
    ]),
    _c(
      "view",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.popPoster,
            expression: "popPoster"
          }
        ],
        staticClass: "pop pop-poster"
      },
      [
        _c("view", {
          staticClass: "mask",
          attrs: { eventid: "98ca1e8c-10" },
          on: { click: _vm.hidePosterPop }
        }),
        _c("view", { staticClass: "pop-con uni-flex uni-column" }, [
          _c("view", { staticClass: "tit" }, [_vm._v("海报")]),
          _c("view", { staticClass: "pic uni-flex-item" }, [
            _vm.resSrc
              ? _c("image", { attrs: { src: _vm.resSrc, mode: "aspectFit" } })
              : _vm._e()
          ]),
          _c("view", { staticClass: "operation uni-flex uni-box" }, [
            _c(
              "view",
              { staticClass: "right uni-flex uni-flex-item uni-txc uni-ovh" },
              [
                _c(
                  "view",
                  {
                    staticClass: "uni-flex-item gray",
                    attrs: { eventid: "98ca1e8c-11" },
                    on: { click: _vm.hidePosterPop }
                  },
                  [_vm._v("关闭")]
                ),
                _c(
                  "view",
                  {
                    staticClass: "uni-flex-item",
                    class: { disabled: _vm.downloading },
                    attrs: { eventid: "98ca1e8c-12" },
                    on: { click: _vm.download }
                  },
                  [_vm._v("保存到手机")]
                ),
                _c(
                  "view",
                  {
                    staticClass: "uni-flex-item",
                    class: { disabled: _vm.shareFriending },
                    attrs: { eventid: "98ca1e8c-13" },
                    on: { click: _vm.shareFriend }
                  },
                  [_vm._v("分享给好友")]
                )
              ]
            )
          ])
        ])
      ]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "F:\\dinghui\\app\\main.js?{\"page\":\"pages%2Fspread%2Fposter\"}":
/*!*****************************************************************!*\
  !*** F:/dinghui/app/main.js?{"page":"pages%2Fspread%2Fposter"} ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
__webpack_require__(/*! uni-pages */ "F:\\dinghui\\app\\pages.json");
var _mpvuePageFactory = _interopRequireDefault(__webpack_require__(/*! mpvue-page-factory */ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js"));
var _poster = _interopRequireDefault(__webpack_require__(/*! ./pages/spread/poster.vue */ "F:\\dinghui\\app\\pages\\spread\\poster.vue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
Page((0, _mpvuePageFactory.default)(_poster.default));

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\spread\\poster.vue":
/*!**********************************************!*\
  !*** F:/dinghui/app/pages/spread/poster.vue ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./poster.vue?vue&type=template&id=36a2a452&scoped=true& */ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=template&id=36a2a452&scoped=true&");
/* harmony import */ var _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./poster.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true& */ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "36a2a452",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/pages/spread/poster.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=script&lang=js&":
/*!***********************************************************************!*\
  !*** F:/dinghui/app/pages/spread/poster.vue?vue&type=script&lang=js& ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true&":
/*!********************************************************************************************************!*\
  !*** F:/dinghui/app/pages/spread/poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true& ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=style&index=0&id=36a2a452&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_36a2a452_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=template&id=36a2a452&scoped=true&":
/*!*****************************************************************************************!*\
  !*** F:/dinghui/app/pages/spread/poster.vue?vue&type=template&id=36a2a452&scoped=true& ***!
  \*****************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=template&id=36a2a452&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\spread\\poster.vue?vue&type=template&id=36a2a452&scoped=true&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_36a2a452_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

},[["F:\\dinghui\\app\\main.js?{\"page\":\"pages%2Fspread%2Fposter\"}","common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spread/poster.js.map