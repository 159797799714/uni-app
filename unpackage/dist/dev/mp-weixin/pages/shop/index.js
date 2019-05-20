(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/shop/index"],{

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=script&lang=js&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/shop/index.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _methods;function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var _default =


















































































































































































{
  data: function data() {
    return {
      noticeLists: [],
      noticeTimer: null,
      animate: false,
      welfareInfo: {
        type: 0,
        people: '150,000',
        money: '1,000,000',
        quota: '000',
        redpacket: 0,
        invite: {
          title: '邀请<span style="color: #D2A100;">0个</span>用户',
          reward: '最高<span style="color: #D2A100;">0元</span>' } },


      welfareInfoTimer: null,
      superiority: {
        lists: [
        {
          url: '../../static/images/home/superiority-1.png',
          name: '佣金高' },

        {
          url: '../../static/images/home/superiority-2.png',
          name: '业务全' },

        {
          url: '../../static/images/home/superiority-3.png',
          name: '结算快' },

        {
          url: '../../static/images/home/superiority-4.png',
          name: '收益久' }],


        explain: {
          show: false,
          timer: null,
          index: -1,
          arr: ['全网最高佣金，信用卡单张佣金高达150元！', '四大核心业务：信用卡、保险、贷款、理财等综合服务！', '最快当天结算，佣金提现秒到账，直接到微信钱包！', '全行业最高收益，同级永久享受5%提成，躺着赚钱！'] } },


      advLists: [], // 活动
      recomLists: [], // 最新推荐
      cooperaLists: [] // 合作单位
    };
  },
  computed: {
    userInfo: function userInfo() {
      return this.$store.state.userInfo;
    },
    config: function config() {
      return this.$store.state.config;
    },
    constant: function constant() {
      return this.$constant;
    },
    defaultAvatar: function defaultAvatar() {
      return '../../static/images/avatar.png';
    } },

  onLoad: function onLoad() {var _this = this;
    // 获取公告
    this.$http({
      url: this.$apis.notices,
      method: 'GET',
      data: null,
      cb: function cb(err, data) {
        if (!err && data.success) {
          data.data.forEach(function (item, index) {
            item.index = index;
            _this.noticeLists.push(item);
          });
          if (_this.noticeLists.length > 1) {
            _this.noticeTimer = setInterval(_this.noticeScroll, 4000);
          }
        } else {
          console.log('获取公告失败');
        }
      } });

    this.countNumber();
    this.welfareInfoTimer = setInterval(this.countNumber, 300000);
    // 判断用户身份显示内容
    if (this.userInfo.role > 0) {
      this.welfareInfo.type = 1;
      // 检查是否完成新手任务
      this.$http({
        url: this.$apis.task,
        method: 'GET',
        data: {
          type: 1 },

        cb: function cb(err, data) {
          if (!err && data.success) {
            if (!data.data.is_finish) {
              // 没有完成
              var isFinish = 0;
              data.data.data.forEach(function (item) {
                if (item.is_finish && item.red_envelope_amount !== '0.00') isFinish++;
              });
              _this.welfareInfo.redpacket = data.data.data.length - isFinish;
            } else {
              // 完成
              _this.welfareInfo.type = 2;
              _this.$http({
                url: _this.$apis.task,
                method: 'GET',
                data: {
                  type: 4 },

                cb: function cb(err1, data1) {
                  if (!err1 && data1.success === true) {
                    var reg = /^(\.|\d)?$/;
                    var str1 = data1.data.reward;
                    var str2 = data1.data.title;
                    var res = '';
                    for (var i = 0; i < str1.length; i++) {
                      if (reg.test(str1[i]) || i > 0 && reg.test(str1[i - 1]) && !reg.test(str1[i])) {
                        res += '<span style="color: #D2A100;">' + str1[i] + '</span>';
                      } else {
                        res += str1[i];
                      }
                    }
                    _this.welfareInfo.invite.reward = res;
                    res = '';
                    for (var _i = 0; _i < str2.length; _i++) {
                      if (reg.test(str2[_i]) || _i > 0 && reg.test(str2[_i - 1]) && !reg.test(str2[_i])) {
                        res += '<span style="color: #D2A100;">' + str2[_i] + '</span>';
                      } else {
                        res += str2[_i];
                      }
                    }
                    _this.welfareInfo.invite.title = res;
                  }
                } });

            }
          }
        } });

    }
    // 活动
    this.$http({
      url: this.$apis.adverts,
      method: 'GET',
      data: {
        place: 1 },

      cb: function cb(err, data) {
        if (!err && data.success) {
          _this.advLists = data.data;
        }
      } });

    // 推荐
    this.$http({
      url: this.$apis.adverts,
      method: 'GET',
      data: {
        place: 5 },

      cb: function cb(err, data) {
        if (!err && data.success) {
          _this.recomLists = data.data;
          _this.recomLists.forEach(function (item) {
            _this.$set(item, 'tagArr', _this.handleStr(item.labels));
          });
        }
      } });

    // 合作单位
    this.$http({
      url: this.$apis.adverts,
      method: 'GET',
      data: {
        place: 10 },

      cb: function cb(err, data) {
        if (!err && data.success) {
          _this.cooperaLists = data.data;
        }
      } });

  },
  onShow: function onShow() {
    if (this.noticeLists.length > 1 && this.noticeTimer === null) {
      this.noticeTimer = setInterval(this.noticeScroll, 4000);
    }
    if (this.welfareInfoTimer === null) {
      this.welfareInfoTimer = setInterval(this.countNumber, 300000);
    }
  },
  onHide: function onHide() {
    clearInterval(this.noticeTimer);
    this.noticeTimer = null;
    clearInterval(this.welfareInfoTimer);
    this.welfareInfoTimer = null;
  },
  methods: (_methods = {
    gotoNotice: function gotoNotice(item, index) {
      if (this.animate) return;
      this.$navigateTo({
        url: '/pages/mine/notice' });

    },
    noticeScroll: function noticeScroll() {var _this2 = this;
      this.animate = true;
      setTimeout(function () {
        // this.noticeLists.push(this.noticeLists[0])
        _this2.$set(_this2.noticeLists, _this2.noticeLists.length, _this2.noticeLists[0]);
        _this2.noticeLists.shift();
        _this2.animate = false;
      }, 700);
    },
    gotoMine: function gotoMine() {
      uni.switchTab({
        url: '/pages/mine/index' });

    },
    gotoCredit: function gotoCredit() {
      if (this.config.module_control_card === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/credit/index' });

      } else {
        uni.showToast({
          title: '信用卡暂未开放',
          icon: 'none' });

      }
    },
    gotoLoan: function gotoLoan() {
      if (this.config.module_control_loan === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/loan/index' });

      } else {
        uni.showToast({
          title: '贷款暂未开放',
          icon: 'none' });

      }
    },
    gotoInsurance: function gotoInsurance() {
      if (this.config.module_control_insurance === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/insurance/index' });

      } else {
        uni.showToast({
          title: '保险暂未开放',
          icon: 'none' });

      }
    },
    gotoAutoinsurance: function gotoAutoinsurance() {
      if (this.config.module_control_insurance_car === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/autoinsurance/index' });

      } else {
        uni.showToast({
          title: '车险暂未开放',
          icon: 'none' });

      }
    },
    gotoTask: function gotoTask() {
      if (this.config.module_control_task === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/task/index' });

      } else {
        uni.showToast({
          title: '任务活动暂未开放',
          icon: 'none' });

      }
    },
    gotoInvites: function gotoInvites() {
      if (this.config.module_control_invite === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/invite/index' });

      } else {
        uni.showToast({
          title: '邀请活动暂未开放',
          icon: 'none' });

      }
    },
    gotoReport: function gotoReport() {
      if (this.config.module_control_report === this.constant.MODULE_STATE_OPEN) {
        this.$navigateTo({
          url: '/pages/report/index' });

      } else {
        uni.showToast({
          title: '信用报告暂未开放',
          icon: 'none' });

      }
    } }, _defineProperty(_methods, "gotoMine", function gotoMine()
  {
    uni.switchTab({
      url: '/pages/mine/index' });

  }), _defineProperty(_methods, "gotoAgent", function gotoAgent()
  {
    this.$navigateTo({
      url: '/pages/mine/agent' });

  }), _defineProperty(_methods, "showExplain", function showExplain(
  n) {var _this3 = this;
    clearTimeout(this.superiority.explain.timer);
    if (this.superiority.explain.index === n) {
      this.superiority.explain.show = false;
      this.superiority.explain.index = -1;
    } else {
      this.superiority.explain.index = n;
      this.superiority.explain.show = true;
      this.superiority.explain.timer = setTimeout(function () {
        _this3.superiority.explain.show = false;
        _this3.superiority.explain.index = -1;
      }, 4000);
    }
  }), _defineProperty(_methods, "gotoActivity", function gotoActivity(
  url) {
    this.$navigateTo({
      url: url });

  }), _defineProperty(_methods, "countNumber", function countNumber()
  {
    // 计算
    var startTime = new Date('2018/09/07 00:00:00').getTime();
    var startTime2 = new Date().setHours(0, 0, 0, 0);
    var nowTime = new Date().getTime();
    var cha = Math.ceil((nowTime - startTime) / 1000 / 60);
    var cha2 = Math.ceil((nowTime - startTime2) / 1000 / 60);
    this.welfareInfo.people = this.toThousands(Math.ceil(150000 + cha / 5 * 3));
    this.welfareInfo.money = this.toThousands(Math.ceil(5000000 + cha / 5 * 89));
    var surplus = '' + (288 - Math.ceil(cha2 / 5));
    if (surplus.length === 1) {
      surplus = '00' + surplus;
    } else if (surplus.length === 2) {
      surplus = '0' + surplus;
    }
    this.welfareInfo.quota = surplus;
  }), _defineProperty(_methods, "toThousands", function toThousands(
  number) {
    return (number || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  }), _defineProperty(_methods, "handleStr", function handleStr(
  str) {
    return str.split(',');
  }), _methods) };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true&":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/shop/index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=template&id=69a84760&scoped=true&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/shop/index.vue?vue&type=template&id=69a84760&scoped=true& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
            _c("view", { staticClass: "header uni-pr uni-ovh" }, [
              _c("image", {
                staticClass: "bg uni-pa",
                attrs: { src: "../../static/images/bg.png", mode: "widthFix" }
              }),
              _c("view", { staticClass: "logo uni-pr uni-flex" }, [
                _c("image", {
                  attrs: {
                    src: "../../static/images/logo.png",
                    mode: "widthFix"
                  }
                })
              ]),
              _c(
                "view",
                {
                  staticClass: "avatar uni-pa",
                  attrs: { eventid: "112766c8-0" },
                  on: { click: _vm.gotoMine }
                },
                [
                  _c("image", {
                    attrs: { src: _vm.userInfo.avatar_url || _vm.defaultAvatar }
                  })
                ]
              ),
              _vm.noticeLists.length > 0
                ? _c("view", { staticClass: "notice uni-pr uni-flex" }, [
                    _c("image", {
                      attrs: { src: "../../static/images/icon/icon-notice.png" }
                    }),
                    _c(
                      "view",
                      { staticClass: "notice-con uni-flex-item uni-ovh" },
                      [
                        _c(
                          "view",
                          {
                            staticClass: "lists",
                            class: { animate: _vm.animate }
                          },
                          _vm._l(_vm.noticeLists, function(item, index) {
                            return _c(
                              "view",
                              {
                                key: index,
                                staticClass: "item uni-textover",
                                attrs: { eventid: "112766c8-1-" + index },
                                on: {
                                  click: function($event) {
                                    _vm.gotoNotice(item, index)
                                  }
                                }
                              },
                              [_c("text", [_vm._v(_vm._s(item.title))])]
                            )
                          })
                        )
                      ]
                    )
                  ])
                : _vm._e(),
              _c("view", { staticClass: "enter uni-pr" }, [
                _c(
                  "view",
                  { staticClass: "enter-con uni-flex uni-flex-wrap" },
                  [
                    _vm.config.module_control_card !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-2" },
                            on: { click: _vm.gotoCredit }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src: "../../static/images/icon/icon-ccard.png"
                              }
                            }),
                            _c("text", [_vm._v("办信用卡")])
                          ]
                        )
                      : _vm._e(),
                    _vm.config.module_control_loan !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-3" },
                            on: { click: _vm.gotoLoan }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src: "../../static/images/icon/icon-loan.png"
                              }
                            }),
                            _c("text", [_vm._v("贷款")])
                          ]
                        )
                      : _vm._e(),
                    _vm.config.module_control_insurance !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-4" },
                            on: { click: _vm.gotoInsurance }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src:
                                  "../../static/images/icon/icon-insurance.png"
                              }
                            }),
                            _c("text", [_vm._v("保险")])
                          ]
                        )
                      : _vm._e(),
                    _vm.config.module_control_insurance_car !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-5" },
                            on: { click: _vm.gotoAutoinsurance }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src: "../../static/images/icon/icon-auto.png"
                              }
                            }),
                            _c("text", [_vm._v("车险")])
                          ]
                        )
                      : _vm._e(),
                    _c(
                      "view",
                      {
                        staticClass: "item uni-flex uni-column uni-box uni-pr",
                        attrs: { eventid: "112766c8-6" },
                        on: { click: _vm.gotoTask }
                      },
                      [
                        _c("image", {
                          attrs: {
                            src: "../../static/images/icon/icon-task.png"
                          }
                        }),
                        _c("text", [_vm._v("做任务")]),
                        _c("view", { staticClass: "uni-pa" }, [
                          _vm._v("领红包")
                        ])
                      ]
                    ),
                    _vm.config.module_control_invite !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-7" },
                            on: { click: _vm.gotoInvites }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src: "../../static/images/icon/icon-invite3.png"
                              }
                            }),
                            _c("text", [_vm._v("邀请好友")])
                          ]
                        )
                      : _vm._e(),
                    _vm.config.module_control_report !==
                    _vm.constant.MODULE_STATE_CLOSE
                      ? _c(
                          "view",
                          {
                            staticClass:
                              "item uni-flex uni-column uni-box uni-pr",
                            attrs: { eventid: "112766c8-8" },
                            on: { click: _vm.gotoReport }
                          },
                          [
                            _c("image", {
                              attrs: {
                                src: "../../static/images/icon/icon-report.png"
                              }
                            }),
                            _c("text", [_vm._v("信用报告")])
                          ]
                        )
                      : _vm._e(),
                    _c(
                      "view",
                      {
                        staticClass: "item uni-flex uni-column uni-box uni-pr",
                        attrs: { eventid: "112766c8-9" },
                        on: { click: _vm.gotoMine }
                      },
                      [
                        _c("image", {
                          attrs: {
                            src: "../../static/images/icon/icon-mine.png"
                          }
                        }),
                        _c("text", [_vm._v("用户中心")])
                      ]
                    )
                  ]
                )
              ])
            ]),
            _c("view", { staticClass: "welcome" }, [
              _c("view", { staticClass: "welcome-con uni-ovh" }, [
                _c("view", { staticClass: "welcome-title uni-txc" }, [
                  _vm._v("欢迎加入" + _vm._s(_vm.config.system_name))
                ]),
                _c("view", { staticClass: "welcome-data uni-flex uni-txc" }, [
                  _c("view", { staticClass: "item uni-box" }, [
                    _c("view", { staticClass: "num" }, [
                      _c("text", { staticClass: "font-number" }, [
                        _vm._v(_vm._s(_vm.welfareInfo.people))
                      ]),
                      _c("text", { staticClass: "tag" }, [_vm._v("人")])
                    ]),
                    _c("view", [
                      _vm._v(
                        "已在" + _vm._s(_vm.config.system_nick_name) + "赚钱"
                      )
                    ])
                  ]),
                  _c("view", { staticClass: "item uni-box" }, [
                    _c("view", { staticClass: "num" }, [
                      _c("text", { staticClass: "tag font-number" }, [
                        _vm._v("¥")
                      ]),
                      _c("text", { staticClass: "font-number" }, [
                        _vm._v(_vm._s(_vm.welfareInfo.money))
                      ])
                    ]),
                    _c("view", [_vm._v("累计发放佣金")])
                  ])
                ]),
                _vm.welfareInfo.type === 0
                  ? _c("view", { staticClass: "welfare" }, [
                      _c("view", { staticClass: "welfare-con uni-flex" }, [
                        _vm._v("今日免费申请名额仅剩："),
                        _c(
                          "text",
                          { staticClass: "chunk font-number uni-txc" },
                          [_vm._v(_vm._s(_vm.welfareInfo.quota[0]))]
                        ),
                        _c(
                          "text",
                          { staticClass: "chunk font-number uni-txc" },
                          [_vm._v(_vm._s(_vm.welfareInfo.quota[1]))]
                        ),
                        _c(
                          "text",
                          { staticClass: "chunk font-number uni-txc" },
                          [_vm._v(_vm._s(_vm.welfareInfo.quota[2]))]
                        ),
                        _vm._v("名")
                      ]),
                      _c(
                        "view",
                        { staticClass: "welfare-btn uni-flex uni-txc" },
                        [
                          _c(
                            "view",
                            {
                              attrs: { eventid: "112766c8-10" },
                              on: { click: _vm.gotoAgent }
                            },
                            [_vm._v("免费升级赚钱")]
                          )
                        ]
                      )
                    ])
                  : _vm.welfareInfo.type === 1 &&
                    _vm.config.module_control_invite !==
                      _vm.constant.MODULE_STATE_CLOSE
                    ? _c("view", { staticClass: "welfare-redpacket" }, [
                        _c("view", { staticClass: "welfare-con uni-flex" }, [
                          _c("image", {
                            attrs: {
                              src: "../../static/images/redpacket/redpacket.png"
                            }
                          }),
                          _vm._v("您有"),
                          _c("text", [
                            _vm._v(_vm._s(_vm.welfareInfo.redpacket) + "个")
                          ]),
                          _vm._v("红包待激活")
                        ]),
                        _c(
                          "view",
                          { staticClass: "welfare-btn uni-flex uni-txc" },
                          [
                            _c(
                              "view",
                              {
                                attrs: { eventid: "112766c8-11" },
                                on: { click: _vm.gotoTask }
                              },
                              [_vm._v("立即领红包")]
                            )
                          ]
                        )
                      ])
                    : _vm.welfareInfo.type === 2 &&
                      _vm.config.module_control_invite !==
                        _vm.constant.MODULE_STATE_CLOSE
                      ? _c("view", { staticClass: "welfare-redpacket" }, [
                          _c(
                            "view",
                            { staticClass: "welfare-con uni-flex" },
                            [
                              _c("image", {
                                attrs: {
                                  src:
                                    "../../static/images/redpacket/redpacket.png"
                                }
                              }),
                              _c("rich-text", {
                                attrs: {
                                  nodes: _vm.welfareInfo.invite.title,
                                  mpcomid: "112766c8-0"
                                }
                              }),
                              _vm._v("即得"),
                              _c("rich-text", {
                                attrs: {
                                  nodes: _vm.welfareInfo.invite.reward,
                                  mpcomid: "112766c8-1"
                                }
                              }),
                              _vm._v("红包")
                            ],
                            1
                          ),
                          _c(
                            "view",
                            { staticClass: "welfare-btn uni-flex uni-txc" },
                            [
                              _c(
                                "view",
                                {
                                  attrs: { eventid: "112766c8-12" },
                                  on: { click: _vm.gotoInvites }
                                },
                                [_vm._v("立即领红包")]
                              )
                            ]
                          )
                        ])
                      : _vm._e()
              ])
            ]),
            _c("view", { staticClass: "superiority" }, [
              _c("view", { staticClass: "title-2 uni-flex" }, [
                _c("view", { staticClass: "uni-pr" }, [
                  _vm._v("平台优势"),
                  _c("image", {
                    staticClass: "line line-left uni-pa",
                    attrs: { src: "../../static/images/icon/icon-title.png" }
                  }),
                  _c("image", {
                    staticClass: "line line-right uni-pa",
                    attrs: { src: "../../static/images/icon/icon-title.png" }
                  })
                ])
              ]),
              _c("view", { staticClass: "superiority-con uni-pr" }, [
                _c(
                  "view",
                  { staticClass: "lists uni-flex" },
                  _vm._l(_vm.superiority.lists, function(item, index) {
                    return _c(
                      "view",
                      {
                        key: index,
                        staticClass: "item uni-flex uni-column uni-flex-item",
                        attrs: { eventid: "112766c8-13-" + index },
                        on: {
                          click: function($event) {
                            _vm.showExplain(index)
                          }
                        }
                      },
                      [
                        _c("image", { attrs: { src: item.url } }),
                        _c("text", [_vm._v(_vm._s(item.name))])
                      ]
                    )
                  })
                ),
                _vm.superiority.explain.show
                  ? _c(
                      "view",
                      {
                        staticClass: "explain uni-pa",
                        class: "explain-" + (_vm.superiority.explain.index + 1)
                      },
                      [
                        _c(
                          "view",
                          { staticClass: "explain-con uni-pr uni-flex" },
                          [
                            _c("image", {
                              staticClass: "uni-pr",
                              attrs: {
                                src: "../../static/images/icon/icon-lamp.png"
                              }
                            }),
                            _c("text", [
                              _vm._v(
                                _vm._s(
                                  _vm.superiority.explain.arr[
                                    _vm.superiority.explain.index
                                  ]
                                )
                              )
                            ])
                          ]
                        ),
                        _c("view", { staticClass: "bg uni-pa" }),
                        _c("view", { staticClass: "arrow uni-pa" })
                      ]
                    )
                  : _vm._e()
              ])
            ]),
            _vm.advLists.length > 0 || _vm.recomLists.length > 0
              ? _c("view", { staticClass: "activity" }, [
                  _vm.advLists.length > 0
                    ? _c("view", { staticClass: "banner" }, [
                        _c("view", { staticClass: "title" }, [
                          _c("view", { staticClass: "uni-pr" }, [
                            _c("image", {
                              staticClass: "uni-pa",
                              attrs: {
                                src:
                                  "../../static/images/icon/icon-title-line.png"
                              }
                            }),
                            _vm._v("最新活动")
                          ])
                        ]),
                        _c(
                          "view",
                          { staticClass: "lists uni-ovh" },
                          _vm._l(_vm.advLists, function(item, index) {
                            return _c(
                              "view",
                              {
                                key: index,
                                staticClass: "item uni-ovh",
                                attrs: { eventid: "112766c8-14-" + index },
                                on: {
                                  click: function($event) {
                                    _vm.gotoActivity(item.link_to_app)
                                  }
                                }
                              },
                              [
                                _c("image", {
                                  attrs: { src: item.url, mode: "widthFix" }
                                })
                              ]
                            )
                          })
                        )
                      ])
                    : _vm._e(),
                  _c("view", { staticClass: "recommend" }, [
                    _c("view", { staticClass: "title" }, [
                      _c("view", { staticClass: "uni-pr" }, [
                        _c("image", {
                          staticClass: "uni-pa",
                          attrs: {
                            src: "../../static/images/icon/icon-title-line.png"
                          }
                        }),
                        _vm._v("最新推荐")
                      ])
                    ]),
                    _c(
                      "view",
                      { staticClass: "lists" },
                      _vm._l(_vm.recomLists, function(item, index) {
                        return _c(
                          "view",
                          {
                            key: index,
                            staticClass: "item uni-pr uni-box",
                            attrs: { eventid: "112766c8-15-" + index },
                            on: {
                              click: function($event) {
                                _vm.gotoActivity(item.link_to_app)
                              }
                            }
                          },
                          [
                            _c(
                              "view",
                              { staticClass: "pic-box uni-pa uni-ovh" },
                              [
                                _c("image", {
                                  attrs: { src: item.url, mode: "aspectFill" }
                                })
                              ]
                            ),
                            _c(
                              "view",
                              { staticClass: "name uni-flex uni-ovh" },
                              [
                                _vm._v(_vm._s(item.title)),
                                _c("text", [_vm._v(_vm._s(item.tips))])
                              ]
                            ),
                            _c("view", { staticClass: "sub uni-textover" }, [
                              _vm._v(_vm._s(item.sub_title))
                            ]),
                            item.tagArr.length > 0
                              ? _c(
                                  "view",
                                  { staticClass: "tag uni-flex" },
                                  _vm._l(item.tagArr, function(
                                    tagitem,
                                    tagindex
                                  ) {
                                    return _c(
                                      "view",
                                      {
                                        key: tagindex,
                                        staticClass: "tag-item uni-box"
                                      },
                                      [_vm._v(_vm._s(tagitem))]
                                    )
                                  })
                                )
                              : _vm._e(),
                            _c("image", {
                              staticClass: "arrow uni-pa",
                              attrs: {
                                src: "../../static/images/icon/icon-more.png"
                              }
                            })
                          ]
                        )
                      })
                    )
                  ])
                ])
              : _vm._e(),
            _vm.cooperaLists.length > 0
              ? _c("view", { staticClass: "cooperation" }, [
                  _c("view", { staticClass: "title-2 uni-flex" }, [
                    _c("view", { staticClass: "uni-pr" }, [
                      _vm._v("合作单位"),
                      _c("image", {
                        staticClass: "line line-left uni-pa",
                        attrs: {
                          src: "../../static/images/icon/icon-title.png"
                        }
                      }),
                      _c("image", {
                        staticClass: "line line-right uni-pa",
                        attrs: {
                          src: "../../static/images/icon/icon-title.png"
                        }
                      })
                    ])
                  ]),
                  _c(
                    "view",
                    { staticClass: "lists uni-flex uni-flex-wrap" },
                    _vm._l(_vm.cooperaLists, function(item, index) {
                      return index < 10
                        ? _c(
                            "view",
                            {
                              key: index,
                              staticClass: "item uni-flex uni-column uni-box"
                            },
                            [
                              _c("image", {
                                attrs: { src: item.url, mode: "aspectFill" }
                              }),
                              _c("text", [_vm._v(_vm._s(item.title))])
                            ]
                          )
                        : _vm._e()
                    })
                  ),
                  _vm.cooperaLists.length > 10
                    ? _c("view", { staticClass: "more" }, [
                        _c("view", { staticClass: "uni-txc" }, [
                          _vm._v(
                            "等" + _vm._s(_vm.cooperaLists.length) + "家机构"
                          )
                        ])
                      ])
                    : _vm._e()
                ])
              : _vm._e()
          ]
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "F:\\dinghui\\app\\main.js?{\"page\":\"pages%2Fshop%2Findex\"}":
/*!**************************************************************!*\
  !*** F:/dinghui/app/main.js?{"page":"pages%2Fshop%2Findex"} ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
__webpack_require__(/*! uni-pages */ "F:\\dinghui\\app\\pages.json");
var _mpvuePageFactory = _interopRequireDefault(__webpack_require__(/*! mpvue-page-factory */ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js"));
var _index = _interopRequireDefault(__webpack_require__(/*! ./pages/shop/index.vue */ "F:\\dinghui\\app\\pages\\shop\\index.vue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
Page((0, _mpvuePageFactory.default)(_index.default));

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\shop\\index.vue":
/*!*******************************************!*\
  !*** F:/dinghui/app/pages/shop/index.vue ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.vue?vue&type=template&id=69a84760&scoped=true& */ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=template&id=69a84760&scoped=true&");
/* harmony import */ var _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true& */ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "69a84760",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/pages/shop/index.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=script&lang=js&":
/*!********************************************************************!*\
  !*** F:/dinghui/app/pages/shop/index.vue?vue&type=script&lang=js& ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true&":
/*!*****************************************************************************************************!*\
  !*** F:/dinghui/app/pages/shop/index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true& ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=style&index=0&id=69a84760&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_style_index_0_id_69a84760_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=template&id=69a84760&scoped=true&":
/*!**************************************************************************************!*\
  !*** F:/dinghui/app/pages/shop/index.vue?vue&type=template&id=69a84760&scoped=true& ***!
  \**************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./index.vue?vue&type=template&id=69a84760&scoped=true& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\shop\\index.vue?vue&type=template&id=69a84760&scoped=true&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_index_vue_vue_type_template_id_69a84760_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

},[["F:\\dinghui\\app\\main.js?{\"page\":\"pages%2Fshop%2Findex\"}","common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/shop/index.js.map