(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["common/vendor"],{

/***/ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js":
/*!************************************************************!*\
  !*** ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function isFn (fn) {
  return typeof fn === 'function'
}

function isStr (str) {
  return typeof str === 'string'
}

function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

const SYNC_API_RE = /hideKeyboard|upx2px|canIUse|^create|Sync$|Manager$/;

const CONTEXT_API_RE = /^create|Manager$/;

const CALLBACK_API_RE = /^on/;

function isContextApi (name) {
  return CONTEXT_API_RE.test(name)
}
function isSyncApi (name) {
  return SYNC_API_RE.test(name)
}

function isCallbackApi (name) {
  return CALLBACK_API_RE.test(name)
}

function handlePromise (promise) {
  return promise.then(data => {
    return [null, data]
  })
    .catch(err => [err])
}

function shouldPromise (name) {
  if (isSyncApi(name)) {
    return false
  }
  if (isCallbackApi(name)) {
    return false
  }
  return true
}

function promisify (name, api) {
  if (!shouldPromise(name)) {
    return api
  }
  return function promiseApi (options = {}, ...params) {
    if (isFn(options.success) || isFn(options.fail) || isFn(options.complete)) {
      return api(options, ...params)
    }
    return handlePromise(new Promise((resolve, reject) => {
      api(Object.assign({}, options, {
        success: resolve,
        fail: reject
      }), ...params);
      /* eslint-disable no-extend-native */
      Promise.prototype.finally = function (callback) {
        const promise = this.constructor;
        return this.then(
          value => promise.resolve(callback()).then(() => value),
          reason => promise.resolve(callback()).then(() => {
            throw reason
          })
        )
      };
    }))
  }
}

const EPS = 1e-4;
const BASE_DEVICE_WIDTH = 750;
let isIOS = false;
let deviceWidth = 0;
let deviceDPR = 0;

function checkDeviceWidth () {
  const {
    platform,
    pixelRatio,
    windowWidth
  } = wx.getSystemInfoSync(); // uni=>wx runtime 编译目标是 uni 对象，内部不允许直接使用 uni

  deviceWidth = windowWidth;
  deviceDPR = pixelRatio;
  isIOS = platform === 'ios';
}

function upx2px (number, newDeviceWidth) {
  if (deviceWidth === 0) {
    checkDeviceWidth();
  }

  number = Number(number);
  if (number === 0) {
    return 0
  }
  number = (number / BASE_DEVICE_WIDTH) * (newDeviceWidth || deviceWidth);
  number = Math.floor(number + EPS);
  if (number === 0) {
    if (deviceDPR === 1 || !isIOS) {
      return 1
    } else {
      return 0.5
    }
  }
  return number
}

var protocols = {};

const CALLBACKS = ['success', 'fail', 'cancel', 'complete'];

function processCallback (methodName, method, returnValue) {
  return function (res) {
    return method(processReturnValue(methodName, res, returnValue))
  }
}

function processArgs (methodName, fromArgs, argsOption = {}, returnValue = {}, keepFromArgs = false) {
  if (isPlainObject(fromArgs)) { // 一般 api 的参数解析
    const toArgs = keepFromArgs === true ? fromArgs : {}; // returnValue 为 false 时，说明是格式化返回值，直接在返回值对象上修改赋值
    if (isFn(argsOption)) {
      argsOption = argsOption(fromArgs, toArgs) || {};
    }
    for (let key in fromArgs) {
      if (hasOwn(argsOption, key)) {
        let keyOption = argsOption[key];
        if (isFn(keyOption)) {
          keyOption = keyOption(fromArgs[key], fromArgs, toArgs);
        }
        if (!keyOption) { // 不支持的参数
          console.warn(`微信小程序 ${methodName}暂不支持${key}`);
        } else if (isStr(keyOption)) { // 重写参数 key
          toArgs[keyOption] = fromArgs[key];
        } else if (isPlainObject(keyOption)) { // {name:newName,value:value}可重新指定参数 key:value
          toArgs[keyOption.name ? keyOption.name : key] = keyOption.value;
        }
      } else if (CALLBACKS.includes(key)) {
        toArgs[key] = processCallback(methodName, fromArgs[key], returnValue);
      } else {
        if (!keepFromArgs) {
          toArgs[key] = fromArgs[key];
        }
      }
    }
    return toArgs
  } else if (isFn(fromArgs)) {
    fromArgs = processCallback(methodName, fromArgs, returnValue);
  }
  return fromArgs
}

function processReturnValue (methodName, res, returnValue, keepReturnValue = false) {
  if (isFn(protocols.returnValue)) { // 处理通用 returnValue
    res = protocols.returnValue(methodName, res);
  }
  return processArgs(methodName, res, returnValue, {}, keepReturnValue)
}

function wrapper (methodName, method) {
  if (hasOwn(protocols, methodName)) {
    const protocol = protocols[methodName];
    if (!protocol) { // 暂不支持的 api
      return function () {
        console.error(`微信小程序 暂不支持${methodName}`);
      }
    }
    return function (arg1, arg2) { // 目前 api 最多两个参数
      let options = protocol;
      if (isFn(protocol)) {
        options = protocol(arg1);
      }

      arg1 = processArgs(methodName, arg1, options.args, options.returnValue);

      const returnValue = wx[options.name || methodName](arg1, arg2);
      if (isSyncApi(methodName)) { // 同步 api
        return processReturnValue(methodName, returnValue, options.returnValue, isContextApi(methodName))
      }
      return returnValue
    }
  }
  return method
}

const todoApis = Object.create(null);

const TODOS = [
  'subscribePush',
  'unsubscribePush',
  'onPush',
  'offPush',
  'share'
];

function createTodoApi (name) {
  return function todoApi ({
    fail,
    complete
  }) {
    const res = {
      errMsg: `${name}:fail:暂不支持 ${name} 方法`
    };
    isFn(fail) && fail(res);
    isFn(complete) && complete(res);
  }
}

TODOS.forEach(function (name) {
  todoApis[name] = createTodoApi(name);
});

var providers = {
  oauth: ['weixin'],
  share: ['weixin'],
  payment: ['wxpay'],
  push: ['weixin']
};

function getProvider ({
  service,
  success,
  fail,
  complete
}) {
  let res = false;
  if (providers[service]) {
    res = {
      errMsg: 'getProvider:ok',
      service,
      provider: providers[service]
    };
    isFn(success) && success(res);
  } else {
    res = {
      errMsg: 'getProvider:fail:服务[' + service + ']不存在'
    };
    isFn(fail) && fail(res);
  }
  isFn(complete) && complete(res);
}

var extraApi = /*#__PURE__*/Object.freeze({
  getProvider: getProvider
});



var api = /*#__PURE__*/Object.freeze({

});

let uni = {};

if (typeof Proxy !== 'undefined') {
  uni = new Proxy({}, {
    get (target, name) {
      if (name === 'upx2px') {
        return upx2px
      }
      if (api[name]) {
        return promisify(name, api[name])
      }
      if (extraApi[name]) {
        return promisify(name, extraApi[name])
      }
      if (todoApis[name]) {
        return promisify(name, todoApis[name])
      }
      if (!hasOwn(wx, name) && !hasOwn(protocols, name)) {
        return
      }
      return promisify(name, wrapper(name, wx[name]))
    }
  });
} else {
  uni.upx2px = upx2px;

  Object.keys(todoApis).forEach(name => {
    uni[name] = promisify(name, todoApis[name]);
  });

  Object.keys(extraApi).forEach(name => {
    uni[name] = promisify(name, todoApis[name]);
  });

  Object.keys(api).forEach(name => {
    uni[name] = promisify(name, api[name]);
  });

  Object.keys(wx).forEach(name => {
    if (hasOwn(wx, name) || hasOwn(protocols, name)) {
      uni[name] = promisify(name, wrapper(name, wx[name]));
    }
  });
}

var uni$1 = uni;

/* harmony default export */ __webpack_exports__["default"] = (uni$1);


/***/ }),

/***/ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue-page-factory/index.js ***!
  \****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);


function callHook$1(vm, hook, params) {
  var handlers = vm.$options[hook];
  if (hook === 'onError' && handlers) {
    handlers = [handlers];
  }

  var ret;
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
//      try {
        ret = handlers[i].call(vm, params);
//       } catch (e) {//fixed by xxxxxx
//         handleError(e, vm, (hook + " hook"));
//       }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }

  // for child
  if (vm.$children.length) {
    vm.$children.forEach(function (v) {
      return callHook$1(v, hook, params);
    });
  }

  return ret
}

function getRootVueVm(page) {
  return page.$vm.$root;
}

/* harmony default export */ __webpack_exports__["default"] = (function (App) {
  return {
    // 页面的初始数据
    data: {
      $root: {}
    },

    // mp lifecycle for vue
    // 生命周期函数--监听页面加载
    onLoad:function onLoad(query) {
      //页面加载的时候
      var app = new vue__WEBPACK_IMPORTED_MODULE_0___default.a(App);
      // 挂载Vue对象到page上
      this.$vm = app;
      var rootVueVM = app.$root;
      rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
      
      //初始化mp对象
      if (!rootVueVM.$mp) {
        rootVueVM.$mp = {};
      }
      var mp = rootVueVM.$mp;
      mp.mpType = 'page';
      mp.page = this;
      mp.query = query;
      mp.status = 'load';
      //mount 要在 mp.status = 'load';赋值之后，不然mount方法会重复添加微信Page
      //具体原因参考mpvue核心库源码，_initMP方法
      app.$mount();
    },

    handleProxy: function handleProxy(e) {
      var rootVueVM = getRootVueVm(this);
      return rootVueVM.$handleProxyWithVue(e)
    },

    // 生命周期函数--监听页面显示
    onShow:function onShow() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'show';
      callHook$1(rootVueVM, 'onShow');
      //   // 只有页面需要 setData
      rootVueVM.$nextTick(function () {
        rootVueVM._initDataToMP();
      });
    },

    // 生命周期函数--监听页面初次渲染完成
    onReady:function onReady() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'ready';
      callHook$1(rootVueVM, 'onReady');
    },

    // 生命周期函数--监听页面隐藏
    onHide: function onHide() {
      var rootVueVM = getRootVueVm(this);
      var mp = rootVueVM.$mp;
      mp.status = 'hide';
      callHook$1(rootVueVM, 'onHide');
    },

    // 生命周期函数--监听页面卸载
    onUnload: function onUnload() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onUnload');
      rootVueVM.$destroy();
    },

    // 页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh: function onPullDownRefresh() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onPullDownRefresh');
    },

    // 页面上拉触底事件的处理函数
    onReachBottom: function onReachBottom() {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onReachBottom');
    },

    // Do something when page scroll
    onPageScroll: function onPageScroll(options) {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onPageScroll', options);
    },

    // 当前是 tab 页时，点击 tab 时触发
    onTabItemTap: function onTabItemTap(options) {
      var rootVueVM = getRootVueVm(this);
      callHook$1(rootVueVM, 'onTabItemTap', options);
    },
		
    // // 用户点击右上角分享
    onShareAppMessage: App.onShareAppMessage ?
      function (options) {
        var rootVueVM = getRootVueVm(this);
        return callHook$1(rootVueVM, 'onShareAppMessage', options);
      } : null,

    //fixed by xxxxxx
    onNavigationBarButtonTap: function onNavigationBarButtonTap(options) {
        var rootVueVM = getRootVueVm(this);
    		callHook$1(rootVueVM, "onNavigationBarButtonTap", options)
    },
    onBackPress: function onBackPress(options) {
        var rootVueVM = getRootVueVm(this);
    		return callHook$1(rootVueVM, "onBackPress",options)
    },
		$getAppWebview:function (e) {
				return plus.webview.getWebviewById('' + this.__wxWebviewId__)
		}
  };
});


/***/ }),

/***/ "./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/mpvue/index.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// fix env
try {
    if (!global) global = {}
    global.process = global.process || {}
    global.process.env = global.process.env || {}
    global.App = global.App || App
    global.Page = global.Page || Page
    global.Component = global.Component || Component
    global.getApp = global.getApp || getApp
} catch (e) {}

;(function(global, factory) {
     true
        ? (module.exports = factory())
        : undefined
})(this, function() {
    "use strict"

    //fixed by xxxxxx
    function calcDiff(holder, key, newObj, oldObj) {
        if (newObj === oldObj || newObj === undefined) {
            return
        }

        if (newObj == null || oldObj == null || typeof newObj !== typeof oldObj) {
            holder[key] = newObj
        } else if (Array.isArray(newObj) && Array.isArray(oldObj)) {
            if (newObj.length === oldObj.length) {
                for (var i = 0, len = newObj.length; i < len; ++i) {
                    calcDiff(holder, key + "[" + i + "]", newObj[i], oldObj[i])
                }
            } else {
                holder[key] = newObj
            }
        } else if (typeof newObj === "object" && typeof oldObj === "object") {
            var newKeys = Object.keys(newObj)
            var oldKeys = Object.keys(oldObj)

            if (newKeys.length !== oldKeys.length) {
                holder[key] = newObj
            } else {
                var allKeysSet = Object.create(null)
                for (var i = 0, len = newKeys.length; i < len; ++i) {
                    allKeysSet[newKeys[i]] = true
                    allKeysSet[oldKeys[i]] = true
                }
                if (Object.keys(allKeysSet).length !== newKeys.length) {
                    holder[key] = newObj
                } else {
                    for (var i = 0, len = newKeys.length; i < len; ++i) {
                        var k = newKeys[i]
                        calcDiff(holder, key + "." + k, newObj[k], oldObj[k])
                    }
                }
            }
        } else if (newObj !== oldObj) {
            holder[key] = newObj
        }
    }

    function diff(newObj, oldObj) {
        var keys = Object.keys(newObj)
        var diffResult = {}
        for (var i = 0, len = keys.length; i < len; ++i) {
            var k = keys[i]
            var oldKeyPath = k.split(".")
            var oldValue = oldObj[oldKeyPath[0]]
            for (var j = 1, jlen = oldKeyPath.length; j < jlen && oldValue !== undefined; ++j) {
                oldValue = oldValue[oldKeyPath[j]]
            }
            calcDiff(diffResult, k, newObj[k], oldValue)
        }
        return diffResult
    }

    /*  */

    // these helpers produces better vm code in JS engines due to their
    // explicitness and function inlining
    function isUndef(v) {
        return v === undefined || v === null
    }

    function isDef(v) {
        return v !== undefined && v !== null
    }

    function isTrue(v) {
        return v === true
    }

    function isFalse(v) {
        return v === false
    }

    /**
     * Check if value is primitive
     */
    function isPrimitive(value) {
        return typeof value === "string" || typeof value === "number"
    }

    /**
     * Quick object check - this is primarily used to tell
     * Objects from primitive values when we know the value
     * is a JSON-compliant type.
     */
    function isObject(obj) {
        return obj !== null && typeof obj === "object"
    }

    var _toString = Object.prototype.toString

    /**
     * Strict object type check. Only returns true
     * for plain JavaScript objects.
     */
    function isPlainObject(obj) {
        return _toString.call(obj) === "[object Object]"
    }

    function isRegExp(v) {
        return _toString.call(v) === "[object RegExp]"
    }

    /**
     * Check if val is a valid array index.
     */
    function isValidArrayIndex(val) {
        var n = parseFloat(val)
        return n >= 0 && Math.floor(n) === n && isFinite(val)
    }

    /**
     * Convert a value to a string that is actually rendered.
     */
    function toString(val) {
        return val == null
            ? ""
            : typeof val === "object"
                ? JSON.stringify(val, null, 2)
                : String(val)
    }

    /**
     * Convert a input value to a number for persistence.
     * If the conversion fails, return original string.
     */
    function toNumber(val) {
        var n = parseFloat(val)
        return isNaN(n) ? val : n
    }

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     */
    function makeMap(str, expectsLowerCase) {
        var map = Object.create(null)
        var list = str.split(",")
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true
        }
        return expectsLowerCase
            ? function(val) {
                  return map[val.toLowerCase()]
              }
            : function(val) {
                  return map[val]
              }
    }

    /**
     * Check if a tag is a built-in tag.
     */
    var isBuiltInTag = makeMap("slot,component", true)

    /**
     * Check if a attribute is a reserved attribute.
     */
    var isReservedAttribute = makeMap("key,ref,slot,is")

    /**
     * Remove an item from an array
     */
    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item)
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Check whether the object has the property.
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty

    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    /**
     * Create a cached version of a pure function.
     */
    function cached(fn) {
        var cache = Object.create(null)
        return function cachedFn(str) {
            var hit = cache[str]
            return hit || (cache[str] = fn(str))
        }
    }

    /**
     * Camelize a hyphen-delimited string.
     */
    var camelizeRE = /-(\w)/g
    var camelize = cached(function(str) {
        return str.replace(camelizeRE, function(_, c) {
            return c ? c.toUpperCase() : ""
        })
    })

    /**
     * Capitalize a string.
     */
    var capitalize = cached(function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    })

    /**
     * Hyphenate a camelCase string.
     */
    var hyphenateRE = /([^-])([A-Z])/g
    var hyphenate = cached(function(str) {
        return str
            .replace(hyphenateRE, "$1-$2")
            .replace(hyphenateRE, "$1-$2")
            .toLowerCase()
    })

    /**
     * Simple bind, faster than native
     */
    function bind(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length
            return l ? (l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a)) : fn.call(ctx)
        }
        // record original fn length
        boundFn._length = fn.length
        return boundFn
    }

    /**
     * Convert an Array-like object to a real Array.
     */
    function toArray(list, start) {
        start = start || 0
        var i = list.length - start
        var ret = new Array(i)
        while (i--) {
            ret[i] = list[i + start]
        }
        return ret
    }

    /**
     * Mix properties into target object.
     */
    function extend(to, _from) {
        for (var key in _from) {
            to[key] = _from[key]
        }
        return to
    }

    /**
     * Merge an Array of Objects into a single Object.
     */
    function toObject(arr) {
        var res = {}
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i])
            }
        }
        return res
    }

    /**
     * Perform no operation.
     * Stubbing args to make Flow happy without leaving useless transpiled code
     * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
     */
    function noop(a, b, c) {}

    /**
     * Always return false.
     */
    var no = function(a, b, c) {
        return false
    }

    /**
     * Return same value
     */
    var identity = function(_) {
        return _
    }

    /**
     * Generate a static keys string from compiler modules.
     */

    /**
     * Check if two values are loosely equal - that is,
     * if they are plain objects, do they have the same shape?
     */
    function looseEqual(a, b) {
        var isObjectA = isObject(a)
        var isObjectB = isObject(b)
        if (isObjectA && isObjectB) {
            try {
                return JSON.stringify(a) === JSON.stringify(b)
            } catch (e) {
                // possible circular reference
                return a === b
            }
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) {
                return i
            }
        }
        return -1
    }

    /**
     * Ensure a function is called only once.
     */
    function once(fn) {
        var called = false
        return function() {
            if (!called) {
                called = true
                fn.apply(this, arguments)
            }
        }
    }

    var SSR_ATTR = "data-server-rendered"

    var ASSET_TYPES = ["component", "directive", "filter"]

    var LIFECYCLE_HOOKS = [
        "beforeCreate",
        "created",
        "beforeMount",
        "mounted",
        "beforeUpdate",
        "updated",
        "beforeDestroy",
        "destroyed",
        "activated",
        "deactivated",
        "onLaunch",
        "onLoad",
        "onShow",
        "onReady",
        "onHide",
        "onUnload",
        "onPullDownRefresh",
        "onReachBottom",
        "onShareAppMessage",
        "onPageScroll",
        "onTabItemTap",
        "attached",
        "ready",
        "moved",
        "detached",
        "onUniNViewMessage", //fixed by xxxxxx
        "onNavigationBarButtonTap", //fixed by xxxxxx
        "onBackPress",//fixed by xxxxxx
    ]

    /*  */

    var config = {
        /**
         * Option merge strategies (used in core/util/options)
         */
        optionMergeStrategies: Object.create(null),

        /**
         * Whether to suppress warnings.
         */
        silent: false,

        /**
         * Show production mode tip message on boot?
         */
        productionTip: "production" !== "production",

        /**
         * Whether to enable devtools
         */
        devtools: "production" !== "production",

        /**
         * Whether to record perf
         */
        performance: false,

        /**
         * Error handler for watcher errors
         */
        errorHandler: null,

        /**
         * Warn handler for watcher warns
         */
        warnHandler: null,

        /**
         * Ignore certain custom elements
         */
        ignoredElements: [],

        /**
         * Custom user key aliases for v-on
         */
        keyCodes: Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         */
        isReservedTag: no,

        /**
         * Check if an attribute is reserved so that it cannot be used as a component
         * prop. This is platform-dependent and may be overwritten.
         */
        isReservedAttr: no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         */
        isUnknownElement: no,

        /**
         * Get the namespace of an element
         */
        getTagNamespace: noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName: identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp: no,

        /**
         * Exposed for legacy reasons
         */
        _lifecycleHooks: LIFECYCLE_HOOKS
    }

    /*  */

    var emptyObject = Object.freeze({})

    /**
     * Check if a string starts with $ or _
     */
    function isReserved(str) {
        var c = (str + "").charCodeAt(0)
        return c === 0x24 || c === 0x5f
    }

    /**
     * Define a property.
     */
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        })
    }

    /**
     * Parse simple path.
     */
    var bailRE = /[^\w.$]/

    function parsePath(path) {
        if (bailRE.test(path)) {
            return
        }
        var segments = path.split(".")
        return function(obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj) {
                    return
                }
                obj = obj[segments[i]]
            }
            return obj
        }
    }

    /*  */

    var warn = noop

    var formatComponentName = null // work around flow check

    /*  */

    function handleError(err, vm, info) {
        if (config.errorHandler) {
            config.errorHandler.call(null, err, vm, info)
        } else {
            if (inBrowser && typeof console !== "undefined") {
                console.error(err)
            } else {
                throw err
            }
        }
    }

    /*  */

    // can we use __proto__?
    var hasProto = "__proto__" in {}

    // Browser environment sniffing
    var inBrowser = typeof window !== "undefined"
    var UA = ["mpvue-runtime"].join()
    var isIE = UA && /msie|trident/.test(UA)
    var isIE9 = UA && UA.indexOf("msie 9.0") > 0
    var isEdge = UA && UA.indexOf("edge/") > 0
    var isAndroid = UA && UA.indexOf("android") > 0
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

    // Firefix has a "watch" function on Object.prototype...
    var nativeWatch = {}.watch

    var supportsPassive = false
    if (inBrowser) {
        try {
            var opts = {}
            Object.defineProperty(opts, "passive", {
                get: function get() {
                    /* istanbul ignore next */
                    supportsPassive = true
                }
            }) // https://github.com/facebook/flow/issues/285
            window.addEventListener("test-passive", null, opts)
        } catch (e) {}
    }

    // this needs to be lazy-evaled because vue may be required before
    // vue-server-renderer can set VUE_ENV
    var _isServer
    var isServerRendering = function() {
        if (_isServer === undefined) {
            /* istanbul ignore if */
            if (!inBrowser && typeof global !== "undefined") {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global["process"].env.VUE_ENV === "server"
            } else {
                _isServer = false
            }
        }
        return _isServer
    }

    // detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

    /* istanbul ignore next */
    function isNative(Ctor) {
        return typeof Ctor === "function" && /native code/.test(Ctor.toString())
    }

    var hasSymbol =
        typeof Symbol !== "undefined" &&
        isNative(Symbol) &&
        typeof Reflect !== "undefined" &&
        isNative(Reflect.ownKeys)

    /**
     * Defer a task to execute it asynchronously.
     */
    var nextTick = (function() {
        var callbacks = []
        var pending = false
        var timerFunc

        function nextTickHandler() {
            pending = false
            var copies = callbacks.slice(0)
            callbacks.length = 0
            for (var i = 0; i < copies.length; i++) {
                copies[i]()
            }
        }

        // the nextTick behavior leverages the microtask queue, which can be accessed
        // via either native Promise.then or MutationObserver.
        // MutationObserver has wider support, however it is seriously bugged in
        // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
        // completely stops working after triggering a few times... so, if native
        // Promise is available, we will use it:
        /* istanbul ignore if */
        if (typeof Promise !== "undefined" && isNative(Promise)) {
            var p = Promise.resolve()
            var logError = function(err) {
                console.error(err)
            }
            timerFunc = function() {
                p.then(nextTickHandler).catch(logError)
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if (isIOS) {
                    setTimeout(noop)
                }
            }
            // } else if (typeof MutationObserver !== 'undefined' && (
            //   isNative(MutationObserver) ||
            //   // PhantomJS and iOS 7.x
            //   MutationObserver.toString() === '[object MutationObserverConstructor]'
            // )) {
            //   // use MutationObserver where native Promise is not available,
            //   // e.g. PhantomJS IE11, iOS7, Android 4.4
            //   var counter = 1
            //   var observer = new MutationObserver(nextTickHandler)
            //   var textNode = document.createTextNode(String(counter))
            //   observer.observe(textNode, {
            //     characterData: true
            //   })
            //   timerFunc = () => {
            //     counter = (counter + 1) % 2
            //     textNode.data = String(counter)
            //   }
        } else {
            // fallback to setTimeout
            /* istanbul ignore next */
            timerFunc = function() {
                setTimeout(nextTickHandler, 0)
            }
        }

        return function queueNextTick(cb, ctx) {
            var _resolve
            callbacks.push(function() {
                if (cb) {
                    try {
                        cb.call(ctx)
                    } catch (e) {
                        handleError(e, ctx, "nextTick")
                    }
                } else if (_resolve) {
                    _resolve(ctx)
                }
            })
            if (!pending) {
                pending = true
                timerFunc()
            }
            if (!cb && typeof Promise !== "undefined") {
                return new Promise(function(resolve, reject) {
                    _resolve = resolve
                })
            }
        }
    })()

    var _Set
    /* istanbul ignore if */
    if (typeof Set !== "undefined" && isNative(Set)) {
        // use native Set when available.
        _Set = Set
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        _Set = (function() {
            function Set() {
                this.set = Object.create(null)
            }
            Set.prototype.has = function has(key) {
                return this.set[key] === true
            }
            Set.prototype.add = function add(key) {
                this.set[key] = true
            }
            Set.prototype.clear = function clear() {
                this.set = Object.create(null)
            }

            return Set
        })()
    }

    /*  */

    var uid$1 = 0

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */
    var Dep = function Dep() {
        this.id = uid$1++
        this.subs = []
    }

    Dep.prototype.addSub = function addSub(sub) {
        this.subs.push(sub)
    }

    Dep.prototype.removeSub = function removeSub(sub) {
        remove(this.subs, sub)
    }

    Dep.prototype.depend = function depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }

    Dep.prototype.notify = function notify() {
        // stabilize the subscriber list first
        var subs = this.subs.slice()
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update()
        }
    }

    // the current target watcher being evaluated.
    // this is globally unique because there could be only one
    // watcher being evaluated at any time.
    Dep.target = null
    var targetStack = []

    function pushTarget(_target) {
        if (Dep.target) {
            targetStack.push(Dep.target)
        }
        Dep.target = _target
    }

    function popTarget() {
        Dep.target = targetStack.pop()
    }

    /*
     * not type checking this file because flow doesn't play well with
     * dynamically accessing methods on Array prototype
     */

    var arrayProto = Array.prototype
    var arrayMethods = Object.create(arrayProto)
    ;["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function(method) {
        // cache original method
        var original = arrayProto[method]
        def(arrayMethods, method, function mutator() {
            var args = [],
                len = arguments.length
            while (len--) args[len] = arguments[len]

            var result = original.apply(this, args)
            var ob = this.__ob__
            var inserted
            switch (method) {
                case "push":
                case "unshift":
                    inserted = args
                    break
                case "splice":
                    inserted = args.slice(2)
                    break
            }
            if (inserted) {
                ob.observeArray(inserted)
            }
            // notify change
            ob.dep.notify()
            return result
        })
    })

    /*  */

    var arrayKeys = Object.getOwnPropertyNames(arrayMethods)

    /**
     * By default, when a reactive property is set, the new value is
     * also converted to become reactive. However when passing down props,
     * we don't want to force conversion because the value may be a nested value
     * under a frozen data structure. Converting it would defeat the optimization.
     */
    var observerState = {
        shouldConvert: true
    }

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     */
    var Observer = function Observer(value) {
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0
        def(value, "__ob__", this)
        if (Array.isArray(value)) {
            var augment = hasProto ? protoAugment : copyAugment
            augment(value, arrayMethods, arrayKeys)
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj)
        for (var i = 0; i < keys.length; i++) {
            defineReactive$$1(obj, keys[i], obj[keys[i]])
        }
    }

    /**
     * Observe a list of Array items.
     */
    Observer.prototype.observeArray = function observeArray(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
    }

    // helpers

    /**
     * Augment an target Object or Array by intercepting
     * the prototype chain using __proto__
     */
    function protoAugment(target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src
        /* eslint-enable no-proto */
    }

    /**
     * Augment an target Object or Array by defining
     * hidden properties.
     */
    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i]
            def(target, key, src[key])
        }
    }

    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     */
    function observe(value, asRootData) {
        if (!isObject(value)) {
            return
        }
        var ob
        if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
            ob = value.__ob__
        } else if (
            observerState.shouldConvert &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            !value._isVue
        ) {
            ob = new Observer(value)
        }
        if (asRootData && ob) {
            ob.vmCount++
        }
        return ob
    }

    /**
     * Define a reactive property on an Object.
     */
    function defineReactive$$1(obj, key, val, customSetter, shallow) {
        var dep = new Dep()

        var property = Object.getOwnPropertyDescriptor(obj, key)
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get
        var setter = property && property.set

        var childOb = !shallow && observe(val)
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val
                if (Dep.target) {
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                    }
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
                return value
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if (false) {}
                if (setter) {
                    setter.call(obj, newVal)
                } else {
                    val = newVal
                }
                childOb = !shallow && observe(newVal)
                dep.notify()
            }
        })
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     */
    function set(target, key, val) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.length = Math.max(target.length, key)
            target.splice(key, 1, val)
            return val
        }
        if (hasOwn(target, key)) {
            target[key] = val
            return val
        }
        var ob = target.__ob__
        if (target._isVue || (ob && ob.vmCount)) {
             false &&
                false
            return val
        }
        if (!ob) {
            target[key] = val
            return val
        }
        defineReactive$$1(ob.value, key, val)
        ob.dep.notify()
        return val
    }

    /**
     * Delete a property and trigger change if necessary.
     */
    function del(target, key) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1)
            return
        }
        var ob = target.__ob__
        if (target._isVue || (ob && ob.vmCount)) {
             false &&
                false
            return
        }
        if (!hasOwn(target, key)) {
            return
        }
        delete target[key]
        if (!ob) {
            return
        }
        ob.dep.notify()
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for (var e = void 0, i = 0, l = value.length; i < l; i++) {
            e = value[i]
            e && e.__ob__ && e.__ob__.dep.depend()
            if (Array.isArray(e)) {
                dependArray(e)
            }
        }
    }

    /*  */

    /**
     * Option overwriting strategies are functions that handle
     * how to merge a parent option value and a child option
     * value into the final value.
     */
    var strats = config.optionMergeStrategies

    /**
     * Options with restrictions
     */
    /**
     * Helper that recursively merges two data objects together.
     */
    function mergeData(to, from) {
        if (!from) {
            return to
        }
        var key, toVal, fromVal
        var keys = Object.keys(from)
        for (var i = 0; i < keys.length; i++) {
            key = keys[i]
            toVal = to[key]
            fromVal = from[key]
            if (!hasOwn(to, key)) {
                set(to, key, fromVal)
            } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
                mergeData(toVal, fromVal)
            }
        }
        return to
    }

    /**
     * Data
     */
    function mergeDataOrFn(parentVal, childVal, vm) {
        if (!vm) {
            // in a Vue.extend merge, both should be functions
            if (!childVal) {
                return parentVal
            }
            if (!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn() {
                return mergeData(
                    typeof childVal === "function" ? childVal.call(this) : childVal,
                    parentVal.call(this)
                )
            }
        } else if (parentVal || childVal) {
            return function mergedInstanceDataFn() {
                // instance merge
                var instanceData = typeof childVal === "function" ? childVal.call(vm) : childVal
                var defaultData = typeof parentVal === "function" ? parentVal.call(vm) : undefined
                if (instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    }

    strats.data = function(parentVal, childVal, vm) {
        if (!vm) {
            if (childVal && typeof childVal !== "function") {
                 false &&
                    false

                return parentVal
            }
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    }

    /**
     * Hooks and props are merged as arrays.
     */
    function mergeHook(parentVal, childVal) {
        return childVal
            ? parentVal
                ? parentVal.concat(childVal)
                : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
            : parentVal
    }

    LIFECYCLE_HOOKS.forEach(function(hook) {
        strats[hook] = mergeHook
    })

    /**
     * Assets
     *
     * When a vm is present (instance creation), we need to do
     * a three-way merge between constructor options, instance
     * options and parent options.
     */
    function mergeAssets(parentVal, childVal) {
        var res = Object.create(parentVal || null)
        return childVal ? extend(res, childVal) : res
    }

    ASSET_TYPES.forEach(function(type) {
        strats[type + "s"] = mergeAssets
    })

    /**
     * Watchers.
     *
     * Watchers hashes should not overwrite one
     * another, so we merge them as arrays.
     */
    strats.watch = function(parentVal, childVal) {
        // work around Firefox's Object.prototype.watch...
        if (parentVal === nativeWatch) {
            parentVal = undefined
        }
        if (childVal === nativeWatch) {
            childVal = undefined
        }
        /* istanbul ignore if */
        if (!childVal) {
            return Object.create(parentVal || null)
        }
        if (!parentVal) {
            return childVal
        }
        var ret = {}
        extend(ret, parentVal)
        for (var key in childVal) {
            var parent = ret[key]
            var child = childVal[key]
            if (parent && !Array.isArray(parent)) {
                parent = [parent]
            }
            ret[key] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child]
        }
        return ret
    }

    /**
     * Other object hashes.
     */
    strats.props = strats.methods = strats.inject = strats.computed = function(
        parentVal,
        childVal
    ) {
        if (!childVal) {
            return Object.create(parentVal || null)
        }
        if (!parentVal) {
            return childVal
        }
        var ret = Object.create(null)
        extend(ret, parentVal)
        extend(ret, childVal)
        return ret
    }
    strats.provide = mergeDataOrFn

    /**
     * Default strategy.
     */
    var defaultStrat = function(parentVal, childVal) {
        return childVal === undefined ? parentVal : childVal
    }

    /**
     * Ensure all props option syntax are normalized into the
     * Object-based format.
     */
    function normalizeProps(options) {
        var props = options.props
        if (!props) {
            return
        }
        var res = {}
        var i, val, name
        if (Array.isArray(props)) {
            i = props.length
            while (i--) {
                val = props[i]
                if (typeof val === "string") {
                    name = camelize(val)
                    res[name] = {
                        type: null
                    }
                } else {
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key]
                name = camelize(key)
                res[name] = isPlainObject(val)
                    ? val
                    : {
                          type: val
                      }
            }
        }
        options.props = res
    }

    /**
     * Normalize all injections into Object-based format
     */
    function normalizeInject(options) {
        var inject = options.inject
        if (Array.isArray(inject)) {
            var normalized = (options.inject = {})
            for (var i = 0; i < inject.length; i++) {
                normalized[inject[i]] = inject[i]
            }
        }
    }

    /**
     * Normalize raw function directives into object format.
     */
    function normalizeDirectives(options) {
        var dirs = options.directives
        if (dirs) {
            for (var key in dirs) {
                var def = dirs[key]
                if (typeof def === "function") {
                    dirs[key] = {
                        bind: def,
                        update: def
                    }
                }
            }
        }
    }

    /**
     * Merge two option objects into a new one.
     * Core utility used in both instantiation and inheritance.
     */
    function mergeOptions(parent, child, vm) {
        if (typeof child === "function") {
            child = child.options
        }

        normalizeProps(child)
        normalizeInject(child)
        normalizeDirectives(child)
        var extendsFrom = child.extends
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm)
        }
        if (child.mixins) {
            for (var i = 0, l = child.mixins.length; i < l; i++) {
                parent = mergeOptions(parent, child.mixins[i], vm)
            }
        }
        var options = {}
        var key
        for (key in parent) {
            mergeField(key)
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key)
            }
        }

        function mergeField(key) {
            var strat = strats[key] || defaultStrat
            options[key] = strat(parent[key], child[key], vm, key)
        }
        return options
    }

    /**
     * Resolve an asset.
     * This function is used because child instances need access
     * to assets defined in its ancestor chain.
     */
    function resolveAsset(options, type, id, warnMissing) {
        /* istanbul ignore if */
        if (typeof id !== "string") {
            return
        }
        var assets = options[type]
        // check local registration variations first
        if (hasOwn(assets, id)) {
            return assets[id]
        }
        var camelizedId = camelize(id)
        if (hasOwn(assets, camelizedId)) {
            return assets[camelizedId]
        }
        var PascalCaseId = capitalize(camelizedId)
        if (hasOwn(assets, PascalCaseId)) {
            return assets[PascalCaseId]
        }
        // fallback to prototype chain
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
        if (false) {}
        return res
    }

    /*  */

    function validateProp(key, propOptions, propsData, vm) {
        var prop = propOptions[key]
        var absent = !hasOwn(propsData, key)
        var value = propsData[key]
        // handle boolean props
        if (isType(Boolean, prop.type)) {
            if (absent && !hasOwn(prop, "default")) {
                value = false
            } else if (!isType(String, prop.type) && (value === "" || value === hyphenate(key))) {
                value = true
            }
        }
        // check default value
        if (value === undefined) {
            value = getPropDefaultValue(vm, prop, key)
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert
            observerState.shouldConvert = true
            observe(value)
            observerState.shouldConvert = prevShouldConvert
        }
        return value
    }

    /**
     * Get the default value of a prop.
     */
    function getPropDefaultValue(vm, prop, key) {
        // no default, return undefined
        if (!hasOwn(prop, "default")) {
            return undefined
        }
        var def = prop.default
        // warn against non-factory defaults for Object & Array
        if (false) {}
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if (
            vm &&
            vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm._props[key] !== undefined
        ) {
            return vm._props[key]
        }
        // call factory function for non-Function types
        // a value is Function if its prototype is function even across different execution context
        return typeof def === "function" && getType(prop.type) !== "Function" ? def.call(vm) : def
    }

    /**
     * Use function string name to check built-in types,
     * because a simple equality check will fail when running
     * across different vms / iframes.
     */
    function getType(fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/)
        return match ? match[1] : ""
    }

    function isType(type, fn) {
        if (!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for (var i = 0, len = fn.length; i < len; i++) {
            if (getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }

    /*  */

    /* not type checking this file because flow doesn't play well with Proxy */

    var mark
    var measure

    /*  */

    var VNode = function VNode(
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions,
        asyncFactory
    ) {
        this.tag = tag
        this.data = data
        this.children = children
        this.text = text
        this.elm = elm
        this.ns = undefined
        this.context = context
        this.functionalContext = undefined
        this.key = data && data.key
        this.componentOptions = componentOptions
        this.componentInstance = undefined
        this.parent = undefined
        this.raw = false
        this.isStatic = false
        this.isRootInsert = true
        this.isComment = false
        this.isCloned = false
        this.isOnce = false
        this.asyncFactory = asyncFactory
        this.asyncMeta = undefined
        this.isAsyncPlaceholder = false
    }

    var prototypeAccessors = {
        child: {}
    }

    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    prototypeAccessors.child.get = function() {
        return this.componentInstance
    }

    Object.defineProperties(VNode.prototype, prototypeAccessors)

    var createEmptyVNode = function(text) {
        if (text === void 0) text = ""

        var node = new VNode()
        node.text = text
        node.isComment = true
        return node
    }

    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

    // optimized shallow clone
    // used for static nodes and slot nodes because they may be reused across
    // multiple renders, cloning them avoids errors when DOM manipulations rely
    // on their elm reference.
    function cloneVNode(vnode) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions,
            vnode.asyncFactory
        )
        cloned.ns = vnode.ns
        cloned.isStatic = vnode.isStatic
        cloned.key = vnode.key
        cloned.isComment = vnode.isComment
        cloned.isCloned = true
        return cloned
    }

    function cloneVNodes(vnodes) {
        var len = vnodes.length
        var res = new Array(len)
        for (var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i])
        }
        return res
    }

    /*  */

    var normalizeEvent = cached(function(name) {
        var passive = name.charAt(0) === "&"
        name = passive ? name.slice(1) : name
        var once$$1 = name.charAt(0) === "~" // Prefixed last, checked first
        name = once$$1 ? name.slice(1) : name
        var capture = name.charAt(0) === "!"
        name = capture ? name.slice(1) : name
        return {
            name: name,
            once: once$$1,
            capture: capture,
            passive: passive
        }
    })

    function createFnInvoker(fns) {
        function invoker() {
            var arguments$1 = arguments

            var fns = invoker.fns
            if (Array.isArray(fns)) {
                var cloned = fns.slice()
                for (var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1)
                }
            } else {
                // return handler return value for single handlers
                return fns.apply(null, arguments)
            }
        }
        invoker.fns = fns
        return invoker
    }

    function updateListeners(on, oldOn, add, remove$$1, vm) {
        var name, cur, old, event
        for (name in on) {
            cur = on[name]
            old = oldOn[name]
            event = normalizeEvent(name)
            if (isUndef(cur)) {
                 false &&
                    false
            } else if (isUndef(old)) {
                if (isUndef(cur.fns)) {
                    cur = on[name] = createFnInvoker(cur)
                }
                add(event.name, cur, event.once, event.capture, event.passive)
            } else if (cur !== old) {
                old.fns = cur
                on[name] = old
            }
        }
        for (name in oldOn) {
            if (isUndef(on[name])) {
                event = normalizeEvent(name)
                remove$$1(event.name, oldOn[name], event.capture)
            }
        }
    }

    /*  */

    /*  */

    function extractPropsFromVNodeData(data, Ctor, tag) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        var propOptions = Ctor.options.props
        if (isUndef(propOptions)) {
            return
        }
        var res = {}
        var attrs = data.attrs
        var props = data.props
        if (isDef(attrs) || isDef(props)) {
            for (var key in propOptions) {
                var altKey = hyphenate(key)
                checkProp(res, props, key, altKey, true) ||
                    checkProp(res, attrs, key, altKey, false)
            }
        }
        return res
    }

    function checkProp(res, hash, key, altKey, preserve) {
        if (isDef(hash)) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key]
                if (!preserve) {
                    delete hash[key]
                }
                return true
            } else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey]
                if (!preserve) {
                    delete hash[altKey]
                }
                return true
            }
        }
        return false
    }

    /*  */

    // The template compiler attempts to minimize the need for normalization by
    // statically analyzing the template at compile time.
    //
    // For plain HTML markup, normalization can be completely skipped because the
    // generated render function is guaranteed to return Array<VNode>. There are
    // two cases where extra normalization is needed:

    // 1. When the children contains components - because a functional component
    // may return an Array instead of a single root. In this case, just a simple
    // normalization is needed - if any child is an Array, we flatten the whole
    // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
    // because functional components already normalize their own children.
    function simpleNormalizeChildren(children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

    // 2. When the children contains constructs that always generated nested Arrays,
    // e.g. <template>, <slot>, v-for, or when the children is provided by user
    // with hand-written render functions / JSX. In such cases a full normalization
    // is needed to cater to all possible types of children values.
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined
    }

    function isTextNode(node) {
        return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = []
        var i, c, last
        for (i = 0; i < children.length; i++) {
            c = children[i]
            if (isUndef(c) || typeof c === "boolean") {
                continue
            }
            last = res[res.length - 1]
            //  nested
            if (Array.isArray(c)) {
                res.push.apply(res, normalizeArrayChildren(c, (nestedIndex || "") + "_" + i))
            } else if (isPrimitive(c)) {
                if (isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    last.text += String(c)
                } else if (c !== "") {
                    // convert primitive to vnode
                    res.push(createTextVNode(c))
                }
            } else {
                if (isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[res.length - 1] = createTextVNode(last.text + c.text)
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if (
                        isTrue(children._isVList) &&
                        isDef(c.tag) &&
                        isUndef(c.key) &&
                        isDef(nestedIndex)
                    ) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__"
                    }
                    res.push(c)
                }
            }
        }
        return res
    }

    /*  */

    function ensureCtor(comp, base) {
        if (comp.__esModule && comp.default) {
            comp = comp.default
        }
        return isObject(comp) ? base.extend(comp) : comp
    }

    function createAsyncPlaceholder(factory, data, context, children, tag) {
        var node = createEmptyVNode()
        node.asyncFactory = factory
        node.asyncMeta = {
            data: data,
            context: context,
            children: children,
            tag: tag
        }
        return node
    }

    function resolveAsyncComponent(factory, baseCtor, context) {
        if (isTrue(factory.error) && isDef(factory.errorComp)) {
            return factory.errorComp
        }

        if (isDef(factory.resolved)) {
            return factory.resolved
        }

        if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
            return factory.loadingComp
        }

        if (isDef(factory.contexts)) {
            // already pending
            factory.contexts.push(context)
        } else {
            var contexts = (factory.contexts = [context])
            var sync = true

            var forceRender = function() {
                for (var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate()
                }
            }

            var resolve = once(function(res) {
                // cache resolved
                factory.resolved = ensureCtor(res, baseCtor)
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if (!sync) {
                    forceRender()
                }
            })

            var reject = once(function(reason) {
                 false &&
                    false
                if (isDef(factory.errorComp)) {
                    factory.error = true
                    forceRender()
                }
            })

            var res = factory(resolve, reject)

            if (isObject(res)) {
                if (typeof res.then === "function") {
                    // () => Promise
                    if (isUndef(factory.resolved)) {
                        res.then(resolve, reject)
                    }
                } else if (isDef(res.component) && typeof res.component.then === "function") {
                    res.component.then(resolve, reject)

                    if (isDef(res.error)) {
                        factory.errorComp = ensureCtor(res.error, baseCtor)
                    }

                    if (isDef(res.loading)) {
                        factory.loadingComp = ensureCtor(res.loading, baseCtor)
                        if (res.delay === 0) {
                            factory.loading = true
                        } else {
                            setTimeout(function() {
                                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                                    factory.loading = true
                                    forceRender()
                                }
                            }, res.delay || 200)
                        }
                    }

                    if (isDef(res.timeout)) {
                        setTimeout(function() {
                            if (isUndef(factory.resolved)) {
                                reject(null)
                            }
                        }, res.timeout)
                    }
                }
            }

            sync = false
            // return in case resolved synchronously
            return factory.loading ? factory.loadingComp : factory.resolved
        }
    }

    /*  */

    function getFirstComponentChild(children) {
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                var c = children[i]
                if (isDef(c) && isDef(c.componentOptions)) {
                    return c
                }
            }
        }
    }

    /*  */

    /*  */

    function initEvents(vm) {
        vm._events = Object.create(null)
        vm._hasHookEvent = false
        // init parent attached events
        var listeners = vm.$options._parentListeners
        if (listeners) {
            updateComponentListeners(vm, listeners)
        }
    }

    var target

    function add(event, fn, once$$1) {
        if (once$$1) {
            target.$once(event, fn)
        } else {
            target.$on(event, fn)
        }
    }

    function remove$1(event, fn) {
        target.$off(event, fn)
    }

    function updateComponentListeners(vm, listeners, oldListeners) {
        target = vm
        updateListeners(listeners, oldListeners || {}, add, remove$1, vm)
    }

    function eventsMixin(Vue) {
        var hookRE = /^hook:/
        Vue.prototype.$on = function(event, fn) {
            var this$1 = this

            var vm = this
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this$1.$on(event[i], fn)
                }
            } else {
                ;(vm._events[event] || (vm._events[event] = [])).push(fn)
                // optimize hook:event cost by using a boolean flag marked at registration
                // instead of a hash lookup
                if (hookRE.test(event)) {
                    vm._hasHookEvent = true
                }
            }
            return vm
        }

        Vue.prototype.$once = function(event, fn) {
            var vm = this

            function on() {
                vm.$off(event, on)
                fn.apply(vm, arguments)
            }
            on.fn = fn
            vm.$on(event, on)
            return vm
        }

        Vue.prototype.$off = function(event, fn) {
            var this$1 = this

            var vm = this
            // all
            if (!arguments.length) {
                vm._events = Object.create(null)
                return vm
            }
            // array of events
            if (Array.isArray(event)) {
                for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
                    this$1.$off(event[i$1], fn)
                }
                return vm
            }
            // specific event
            var cbs = vm._events[event]
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null
                return vm
            }
            // specific handler
            var cb
            var i = cbs.length
            while (i--) {
                cb = cbs[i]
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1)
                    break
                }
            }
            return vm
        }

        Vue.prototype.$emit = function(event) {
            var vm = this
            var cbs = vm._events[event]
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs
                var args = toArray(arguments, 1)
                for (var i = 0, l = cbs.length; i < l; i++) {
                    try {
                        cbs[i].apply(vm, args)
                    } catch (e) {
                        handleError(e, vm, 'event handler for "' + event + '"')
                    }
                }
            }
            return vm
        }
    }

    /*  */

    /**
     * Runtime helper for resolving raw children VNodes into a slot object.
     */
    function resolveSlots(children, context) {
        var slots = {}
        if (!children) {
            return slots
        }
        var defaultSlot = []
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i]
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if (
                (child.context === context || child.functionalContext === context) &&
                child.data &&
                child.data.slot != null
            ) {
                var name = child.data.slot
                var slot = slots[name] || (slots[name] = [])
                if (child.tag === "template") {
                    slot.push.apply(slot, child.children)
                } else {
                    slot.push(child)
                }
            } else {
                defaultSlot.push(child)
            }
        }
        // ignore whitespace
        if (!defaultSlot.every(isWhitespace)) {
            slots.default = defaultSlot
        }
        return slots
    }

    function isWhitespace(node) {
        return node.isComment || node.text === " "
    }

    function resolveScopedSlots(
        fns, // see flow/vnode
        res
    ) {
        res = res || {}
        for (var i = 0; i < fns.length; i++) {
            if (Array.isArray(fns[i])) {
                resolveScopedSlots(fns[i], res)
            } else {
                res[fns[i].key] = fns[i].fn
            }
        }
        return res
    }

    /*  */

    var activeInstance = null

    function initLifecycle(vm) {
        var options = vm.$options

        // locate first non-abstract parent
        var parent = options.parent
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent
            }
            parent.$children.push(vm)
        }

        vm.$parent = parent
        vm.$root = parent ? parent.$root : vm

        vm.$children = []
        vm.$refs = {}

        vm._watcher = null
        vm._inactive = null
        vm._directInactive = false
        vm._isMounted = false
        vm._isDestroyed = false
        vm._isBeingDestroyed = false
    }

    function lifecycleMixin(Vue) {
        Vue.prototype._update = function(vnode, hydrating) {
            var vm = this
            if (vm._isMounted) {
                callHook(vm, "beforeUpdate")
            }
            var prevEl = vm.$el
            var prevVnode = vm._vnode
            var prevActiveInstance = activeInstance
            activeInstance = vm
            vm._vnode = vnode
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if (!prevVnode) {
                // initial render
                vm.$el = vm.__patch__(
                    vm.$el,
                    vnode,
                    hydrating,
                    false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                )
                // no need for the ref nodes after initial patch
                // this prevents keeping a detached DOM tree in memory (#5851)
                vm.$options._parentElm = vm.$options._refElm = null
            } else {
                // updates
                vm.$el = vm.__patch__(prevVnode, vnode)
            }
            activeInstance = prevActiveInstance
            // update __vue__ reference
            if (prevEl) {
                prevEl.__vue__ = null
            }
            if (vm.$el) {
                vm.$el.__vue__ = vm
            }
            // if parent is an HOC, update its $el as well
            if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        }

        Vue.prototype.$forceUpdate = function() {
            var vm = this
            if (vm._watcher) {
                vm._watcher.update()
            }
        }

        Vue.prototype.$destroy = function() {
            var vm = this
            if (vm._isBeingDestroyed) {
                return
            }
            callHook(vm, "beforeDestroy")
            vm._isBeingDestroyed = true
            // remove self from parent
            var parent = vm.$parent
            if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                remove(parent.$children, vm)
            }
            // teardown watchers
            if (vm._watcher) {
                vm._watcher.teardown()
            }
            var i = vm._watchers.length
            while (i--) {
                vm._watchers[i].teardown()
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if (vm._data.__ob__) {
                vm._data.__ob__.vmCount--
            }
            // call the last hook...
            vm._isDestroyed = true
            // invoke destroy hooks on current rendered tree
            vm.__patch__(vm._vnode, null)
            // fire destroyed hook
            callHook(vm, "destroyed")
            // turn off all instance listeners.
            vm.$off()
            // remove __vue__ reference
            if (vm.$el) {
                vm.$el.__vue__ = null
            }
        }
    }

    function mountComponent(vm, el, hydrating) {
        vm.$el = el
        if (!vm.$options.render) {
            vm.$options.render = createEmptyVNode
        }
        callHook(vm, "beforeMount")

        var updateComponent
        /* istanbul ignore if */
        if (false) {} else {
            updateComponent = function() {
                vm._update(vm._render(), hydrating)
            }
        }

        vm._watcher = new Watcher(vm, updateComponent, noop)
        hydrating = false

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (vm.$vnode == null) {
            vm._isMounted = true
            callHook(vm, "mounted")
        }
        return vm
    }

    function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
        var hasChildren = !!(
            renderChildren || // has new static slots
            vm.$options._renderChildren || // has old static slots
            parentVnode.data.scopedSlots || // has new scoped slots
            vm.$scopedSlots !== emptyObject
        ) // has old scoped slots

        vm.$options._parentVnode = parentVnode
        vm.$vnode = parentVnode // update vm's placeholder node without re-render

        if (vm._vnode) {
            // update child tree's parent
            vm._vnode.parent = parentVnode
        }
        vm.$options._renderChildren = renderChildren

        // update $attrs and $listensers hash
        // these are also reactive so they may trigger child update if the child
        // used them during render
        vm.$attrs = parentVnode.data && parentVnode.data.attrs
        vm.$listeners = listeners

        // update props
        if (propsData && vm.$options.props) {
            observerState.shouldConvert = false
            var props = vm._props
            var propKeys = vm.$options._propKeys || []
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i]
                props[key] = validateProp(key, vm.$options.props, propsData, vm)
            }
            observerState.shouldConvert = true
            // keep a copy of raw propsData
            vm.$options.propsData = propsData
        }

        // update listeners
        if (listeners) {
            var oldListeners = vm.$options._parentListeners
            vm.$options._parentListeners = listeners
            updateComponentListeners(vm, listeners, oldListeners)
        }
        // resolve slots + force update if has children
        if (hasChildren) {
            vm.$slots = resolveSlots(renderChildren, parentVnode.context)
            vm.$forceUpdate()
        }
    }

    function isInInactiveTree(vm) {
        while (vm && (vm = vm.$parent)) {
            if (vm._inactive) {
                return true
            }
        }
        return false
    }

    function activateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = false
            if (isInInactiveTree(vm)) {
                return
            }
        } else if (vm._directInactive) {
            return
        }
        if (vm._inactive || vm._inactive === null) {
            vm._inactive = false
            for (var i = 0; i < vm.$children.length; i++) {
                activateChildComponent(vm.$children[i])
            }
            callHook(vm, "activated")
        }
    }

    function deactivateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = true
            if (isInInactiveTree(vm)) {
                return
            }
        }
        if (!vm._inactive) {
            vm._inactive = true
            for (var i = 0; i < vm.$children.length; i++) {
                deactivateChildComponent(vm.$children[i])
            }
            callHook(vm, "deactivated")
        }
    }

    function callHook(vm, hook) {
        var handlers = vm.$options[hook]
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm)
                } catch (e) {
                    handleError(e, vm, hook + " hook")
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit("hook:" + hook)
        }
    }

    /*  */

    var MAX_UPDATE_COUNT = 100

    var queue = []
    var activatedChildren = []
    var has = {}
    var circular = {}
    var waiting = false
    var flushing = false
    var index = 0

    /**
     * Reset the scheduler's state.
     */
    function resetSchedulerState() {
        index = queue.length = activatedChildren.length = 0
        has = {}
        waiting = flushing = false
    }

    /**
     * Flush both queues and run the watchers.
     */
    function flushSchedulerQueue() {
        flushing = true
        var watcher, id

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function(a, b) {
            return a.id - b.id
        })

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index]
            id = watcher.id
            has[id] = null
            watcher.run()
            // in dev build, check and stop circular updates.
            if (false) {}
        }

        // keep copies of post queues before resetting state
        var activatedQueue = activatedChildren.slice()
        var updatedQueue = queue.slice()

        resetSchedulerState()

        // call component updated and activated hooks
        callActivatedHooks(activatedQueue)
        callUpdatedHooks(updatedQueue)

        // devtool hook
        /* istanbul ignore if */
        if (devtools && config.devtools) {
            devtools.emit("flush")
        }
    }

    function callUpdatedHooks(queue) {
        var i = queue.length
        while (i--) {
            var watcher = queue[i]
            var vm = watcher.vm
            if (vm._watcher === watcher && vm._isMounted) {
                callHook(vm, "updated")
            }
        }
    }

    /**
     * Queue a kept-alive component that was activated during patch.
     * The queue will be processed after the entire tree has been patched.
     */
    function queueActivatedComponent(vm) {
        // setting _inactive to false here so that a render function can
        // rely on checking whether it's in an inactive tree (e.g. router-view)
        vm._inactive = false
        activatedChildren.push(vm)
    }

    function callActivatedHooks(queue) {
        for (var i = 0; i < queue.length; i++) {
            queue[i]._inactive = true
            activateChildComponent(queue[i], true /* true */)
        }
    }

    /**
     * Push a watcher into the watcher queue.
     * Jobs with duplicate IDs will be skipped unless it's
     * pushed when the queue is being flushed.
     */
    function queueWatcher(watcher) {
        var id = watcher.id
        if (has[id] == null) {
            has[id] = true
            if (!flushing) {
                queue.push(watcher)
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1
                while (i > index && queue[i].id > watcher.id) {
                    i--
                }
                queue.splice(i + 1, 0, watcher)
            }
            // queue the flush
            if (!waiting) {
                waiting = true
                nextTick(flushSchedulerQueue)
            }
        }
    }

    /*  */

    var uid$2 = 0

    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     */
    var Watcher = function Watcher(vm, expOrFn, cb, options) {
        this.vm = vm
        vm._watchers.push(this)
        // options
        if (options) {
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid$2 // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        this.newDeps = []
        this.depIds = new _Set()
        this.newDepIds = new _Set()
        this.expression = ""
        // parse expression for getter
        if (typeof expOrFn === "function") {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn)
            if (!this.getter) {
                this.getter = function() {}
                 false &&
                    false
            }
        }
        this.value = this.lazy ? undefined : this.get()
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    Watcher.prototype.get = function get() {
        pushTarget(this)
        var value
        var vm = this.vm
        try {
            value = this.getter.call(vm, vm)
        } catch (e) {
            if (this.user) {
                handleError(e, vm, 'getter for watcher "' + this.expression + '"')
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value)
            }
            popTarget()
            this.cleanupDeps()
        }
        return value
    }

    /**
     * Add a dependency to this directive.
     */
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                dep.addSub(this)
            }
        }
    }

    /**
     * Clean up for dependency collection.
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps() {
        var this$1 = this

        var i = this.deps.length
        while (i--) {
            var dep = this$1.deps[i]
            if (!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1)
            }
        }
        var tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    Watcher.prototype.update = function update() {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            this.run()
        } else {
            queueWatcher(this)
        }
    }

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    Watcher.prototype.run = function run() {
        if (this.active) {
            var value = this.get()
            if (
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                isObject(value) ||
                this.deep
            ) {
                // set new value
                var oldValue = this.value
                this.value = value
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue)
                    } catch (e) {
                        handleError(e, this.vm, 'callback for watcher "' + this.expression + '"')
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    Watcher.prototype.evaluate = function evaluate() {
        this.value = this.get()
        this.dirty = false
    }

    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend() {
        var this$1 = this

        var i = this.deps.length
        while (i--) {
            this$1.deps[i].depend()
        }
    }

    /**
     * Remove self from all dependencies' subscriber list.
     */
    Watcher.prototype.teardown = function teardown() {
        var this$1 = this

        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            var i = this.deps.length
            while (i--) {
                this$1.deps[i].removeSub(this$1)
            }
            this.active = false
        }
    }

    /**
     * Recursively traverse an object to evoke all converted
     * getters, so that every nested property inside the object
     * is collected as a "deep" dependency.
     */
    var seenObjects = new _Set()

    function traverse(val) {
        seenObjects.clear()
        _traverse(val, seenObjects)
    }

    function _traverse(val, seen) {
        var i, keys
        var isA = Array.isArray(val)
        if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id
            if (seen.has(depId)) {
                return
            }
            seen.add(depId)
        }
        if (isA) {
            i = val.length
            while (i--) {
                _traverse(val[i], seen)
            }
        } else {
            keys = Object.keys(val)
            i = keys.length
            while (i--) {
                _traverse(val[keys[i]], seen)
            }
        }
    }

    /*  */

    var sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    }

    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return this[sourceKey][key]
        }
        sharedPropertyDefinition.set = function proxySetter(val) {
            this[sourceKey][key] = val
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }

    function initState(vm) {
        vm._watchers = []
        var opts = vm.$options
        if (opts.props) {
            initProps(vm, opts.props)
        }
        if (opts.methods) {
            initMethods(vm, opts.methods)
        }
        if (opts.data) {
            initData(vm)
        } else {
            observe((vm._data = {}), true /* asRootData */)
        }
        if (opts.computed) {
            initComputed(vm, opts.computed)
        }
        if (opts.watch && opts.watch !== nativeWatch) {
            initWatch(vm, opts.watch)
        }
    }

    function checkOptionType(vm, name) {
        var option = vm.$options[name]
        if (!isPlainObject(option)) {
            warn('component option "' + name + '" should be an object.', vm)
        }
    }

    function initProps(vm, propsOptions) {
        var propsData = vm.$options.propsData || {}
        var props = (vm._props = {})
        // cache prop keys so that future props updates can iterate using Array
        // instead of dynamic object key enumeration.
        var keys = (vm.$options._propKeys = [])
        var isRoot = !vm.$parent
        // root instance props should be converted
        observerState.shouldConvert = isRoot
        var loop = function(key) {
            keys.push(key)
            var value = validateProp(key, propsOptions, propsData, vm)
            /* istanbul ignore else */
            {
                defineReactive$$1(props, key, value)
            }
            // static props are already proxied on the component's prototype
            // during Vue.extend(). We only need to proxy props defined at
            // instantiation here.
            if (!(key in vm)) {
                proxy(vm, "_props", key)
            }
        }

        for (var key in propsOptions) loop(key)
        observerState.shouldConvert = true
    }

    function initData(vm) {
        var data = vm.$options.data
        data = vm._data = typeof data === "function" ? getData(data, vm) : data || {}
        if (!isPlainObject(data)) {
            data = {}
             false &&
                false
        }
        // proxy data on instance
        var keys = Object.keys(data)
        var props = vm.$options.props
        var methods = vm.$options.methods
        var i = keys.length
        while (i--) {
            var key = keys[i]
            if (props && hasOwn(props, key)) {
                 false &&
                    false
            } else if (!isReserved(key)) {
                proxy(vm, "_data", key)
            }
        }
        // observe data
        observe(data, true /* asRootData */)
    }

    function getData(data, vm) {
        try {
            return data.call(vm)
        } catch (e) {
            handleError(e, vm, "data()")
            return {}
        }
    }

    var computedWatcherOptions = {
        lazy: true
    }

    function initComputed(vm, computed) {
         false && false
        var watchers = (vm._computedWatchers = Object.create(null))

        for (var key in computed) {
            var userDef = computed[key]
            var getter = typeof userDef === "function" ? userDef : userDef.get
            watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)

            // component-defined computed properties are already defined on the
            // component prototype. We only need to define computed properties defined
            // at instantiation here.
            if (!(key in vm)) {
                defineComputed(vm, key, userDef)
            } else {
            }
        }
    }

    function defineComputed(target, key, userDef) {
        if (typeof userDef === "function") {
            sharedPropertyDefinition.get = createComputedGetter(key)
            sharedPropertyDefinition.set = noop
        } else {
            sharedPropertyDefinition.get = userDef.get
                ? userDef.cache !== false
                    ? createComputedGetter(key)
                    : userDef.get
                : noop
            sharedPropertyDefinition.set = userDef.set ? userDef.set : noop
        }
        Object.defineProperty(target, key, sharedPropertyDefinition)
    }

    function createComputedGetter(key) {
        return function computedGetter() {
            var watcher = this._computedWatchers && this._computedWatchers[key]
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate()
                }
                if (Dep.target) {
                    watcher.depend()
                }
                return watcher.value
            }
        }
    }

    function initMethods(vm, methods) {
         false && false
        var props = vm.$options.props
        for (var key in methods) {
            vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
        }
    }

    function initWatch(vm, watch) {
         false && false
        for (var key in watch) {
            var handler = watch[key]
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i])
                }
            } else {
                createWatcher(vm, key, handler)
            }
        }
    }

    function createWatcher(vm, keyOrFn, handler, options) {
        if (isPlainObject(handler)) {
            options = handler
            handler = handler.handler
        }
        if (typeof handler === "string") {
            handler = vm[handler]
        }
        return vm.$watch(keyOrFn, handler, options)
    }

    function stateMixin(Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {}
        dataDef.get = function() {
            return this._data
        }
        var propsDef = {}
        propsDef.get = function() {
            return this._props
        }
        Object.defineProperty(Vue.prototype, "$data", dataDef)
        Object.defineProperty(Vue.prototype, "$props", propsDef)

        Vue.prototype.$set = set
        Vue.prototype.$delete = del

        Vue.prototype.$watch = function(expOrFn, cb, options) {
            var vm = this
            if (isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options)
            }
            options = options || {}
            options.user = true
            var watcher = new Watcher(vm, expOrFn, cb, options)
            if (options.immediate) {
                cb.call(vm, watcher.value)
            }
            return function unwatchFn() {
                watcher.teardown()
            }
        }
    }

    /*  */

    function initProvide(vm) {
        var provide = vm.$options.provide
        if (provide) {
            vm._provided = typeof provide === "function" ? provide.call(vm) : provide
        }
    }

    function initInjections(vm) {
        var result = resolveInject(vm.$options.inject, vm)
        if (result) {
            observerState.shouldConvert = false
            Object.keys(result).forEach(function(key) {
                /* istanbul ignore else */
                {
                    defineReactive$$1(vm, key, result[key])
                }
            })
            observerState.shouldConvert = true
        }
    }

    function resolveInject(inject, vm) {
        if (inject) {
            // inject is :any because flow is not smart enough to figure out cached
            var result = Object.create(null)
            var keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i]
                var provideKey = inject[key]
                var source = vm
                while (source) {
                    if (source._provided && provideKey in source._provided) {
                        result[key] = source._provided[provideKey]
                        break
                    }
                    source = source.$parent
                }
                if (false) {}
            }
            return result
        }
    }

    /*  */

    function createFunctionalComponent(Ctor, propsData, data, context, children) {
        var props = {}
        var propOptions = Ctor.options.props
        if (isDef(propOptions)) {
            for (var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData || {})
            }
        } else {
            if (isDef(data.attrs)) {
                mergeProps(props, data.attrs)
            }
            if (isDef(data.props)) {
                mergeProps(props, data.props)
            }
        }
        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var _context = Object.create(context)
        var h = function(a, b, c, d) {
            return createElement(_context, a, b, c, d, true)
        }
        var vnode = Ctor.options.render.call(null, h, {
            data: data,
            props: props,
            children: children,
            parent: context,
            listeners: data.on || {},
            injections: resolveInject(Ctor.options.inject, context),
            slots: function() {
                return resolveSlots(children, context)
            }
        })
        if (vnode instanceof VNode) {
            vnode.functionalContext = context
            vnode.functionalOptions = Ctor.options
            if (data.slot) {
                ;(vnode.data || (vnode.data = {})).slot = data.slot
            }
        }
        return vnode
    }

    function mergeProps(to, from) {
        for (var key in from) {
            to[camelize(key)] = from[key]
        }
    }

    /*  */

    // hooks to be invoked on component VNodes during patch
    var componentVNodeHooks = {
        init: function init(vnode, hydrating, parentElm, refElm) {
            if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
                var child = (vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance,
                    parentElm,
                    refElm
                ))
                child.$mount(hydrating ? vnode.elm : undefined, hydrating)
            } else if (vnode.data.keepAlive) {
                // kept-alive components, treat as a patch
                var mountedNode = vnode // work around flow
                componentVNodeHooks.prepatch(mountedNode, mountedNode)
            }
        },

        prepatch: function prepatch(oldVnode, vnode) {
            var options = vnode.componentOptions
            var child = (vnode.componentInstance = oldVnode.componentInstance)
            updateChildComponent(
                child,
                options.propsData, // updated props
                options.listeners, // updated listeners
                vnode, // new parent vnode
                options.children // new children
            )
        },

        insert: function insert(vnode) {
            var context = vnode.context
            var componentInstance = vnode.componentInstance

            if (!componentInstance._isMounted) {
                componentInstance._isMounted = true
                callHook(componentInstance, "mounted")
            }
            if (vnode.data.keepAlive) {
                if (context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance)
                } else {
                    activateChildComponent(componentInstance, true /* direct */)
                }
            }
        },

        destroy: function destroy(vnode) {
            var componentInstance = vnode.componentInstance
            if (!componentInstance._isDestroyed) {
                if (!vnode.data.keepAlive) {
                    componentInstance.$destroy()
                } else {
                    deactivateChildComponent(componentInstance, true /* direct */)
                }
            }
        }
    }

    var hooksToMerge = Object.keys(componentVNodeHooks)

    function createComponent(Ctor, data, context, children, tag) {
        if (isUndef(Ctor)) {
            return
        }

        var baseCtor = context.$options._base

        // plain options object: turn it into a constructor
        if (isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor)
        }

        // if at this stage it's not a constructor or an async component factory,
        // reject.
        if (typeof Ctor !== "function") {
            return
        }

        // async component
        var asyncFactory
        if (isUndef(Ctor.cid)) {
            asyncFactory = Ctor
            Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
            if (Ctor === undefined) {
                // return a placeholder node for async component, which is rendered
                // as a comment node but preserves all the raw information for the node.
                // the information will be used for async server-rendering and hydration.
                return createAsyncPlaceholder(asyncFactory, data, context, children, tag)
            }
        }

        data = data || {}

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor)

        // transform component v-model data into props & events
        if (isDef(data.model)) {
            transformModel(Ctor.options, data)
        }

        // extract props
        var propsData = extractPropsFromVNodeData(data, Ctor, tag)

        // functional component
        if (isTrue(Ctor.options.functional)) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // keep listeners
        var listeners = data.on

        if (isTrue(Ctor.options.abstract)) {
            // abstract components do not keep anything
            // other than props & listeners & slot

            // work around flow
            var slot = data.slot
            data = {}
            if (slot) {
                data.slot = slot
            }
        }

        // merge component management hooks onto the placeholder node
        mergeHooks(data)

        // return a placeholder vnode
        var name = Ctor.options.name || tag
        var vnode = new VNode(
            "vue-component-" + Ctor.cid + (name ? "-" + name : ""),
            data,
            undefined,
            undefined,
            undefined,
            context,
            {
                Ctor: Ctor,
                propsData: propsData,
                listeners: listeners,
                tag: tag,
                children: children
            },
            asyncFactory
        )
        return vnode
    }

    function createComponentInstanceForVnode(
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent, // activeInstance in lifecycle state
        parentElm,
        refElm
    ) {
        var vnodeComponentOptions = vnode.componentOptions
        var options = {
            _isComponent: true,
            parent: parent,
            propsData: vnodeComponentOptions.propsData,
            _componentTag: vnodeComponentOptions.tag,
            _parentVnode: vnode,
            _parentListeners: vnodeComponentOptions.listeners,
            _renderChildren: vnodeComponentOptions.children,
            _parentElm: parentElm || null,
            _refElm: refElm || null
        }
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate
        if (isDef(inlineTemplate)) {
            options.render = inlineTemplate.render
            options.staticRenderFns = inlineTemplate.staticRenderFns
        }
        return new vnodeComponentOptions.Ctor(options)
    }

    function mergeHooks(data) {
        if (!data.hook) {
            data.hook = {}
        }
        for (var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i]
            var fromParent = data.hook[key]
            var ours = componentVNodeHooks[key]
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours
        }
    }

    function mergeHook$1(one, two) {
        return function(a, b, c, d) {
            one(a, b, c, d)
            two(a, b, c, d)
        }
    }

    // transform component v-model info (value and callback) into
    // prop and event handler respectively.
    function transformModel(options, data) {
        var prop = (options.model && options.model.prop) || "value"
        var event = (options.model && options.model.event) || "input"
        ;(data.props || (data.props = {}))[prop] = data.model.value
        var on = data.on || (data.on = {})
        if (isDef(on[event])) {
            on[event] = [data.model.callback].concat(on[event])
        } else {
            on[event] = data.model.callback
        }
    }

    /*  */

    var SIMPLE_NORMALIZE = 1
    var ALWAYS_NORMALIZE = 2

    // wrapper function for providing a more flexible interface
    // without getting yelled at by flow
    function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children
            children = data
            data = undefined
        }
        if (isTrue(alwaysNormalize)) {
            normalizationType = ALWAYS_NORMALIZE
        }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement(context, tag, data, children, normalizationType) {
        if (isDef(data) && isDef(data.__ob__)) {
             false &&
                false
            return createEmptyVNode()
        }
        // object syntax in v-bind
        if (isDef(data) && isDef(data.is)) {
            tag = data.is
        }
        if (!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // warn against non-primitive key
        if (
            false
        ) {}
        // support single function children as default scoped slot
        if (Array.isArray(children) && typeof children[0] === "function") {
            data = data || {}
            data.scopedSlots = {
                default: children[0]
            }
            children.length = 0
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children)
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children)
        }
        var vnode, ns
        if (typeof tag === "string") {
            var Ctor
            ns = config.getTagNamespace(tag)
            if (config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag),
                    data,
                    children,
                    undefined,
                    undefined,
                    context
                )
            } else if (isDef((Ctor = resolveAsset(context.$options, "components", tag)))) {
                // component
                vnode = createComponent(Ctor, data, context, children, tag)
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(tag, data, children, undefined, undefined, context)
            }
        } else {
            // direct component options / constructor
            vnode = createComponent(tag, data, context, children)
        }
        if (isDef(vnode)) {
            if (ns) {
                applyNS(vnode, ns)
            }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS(vnode, ns) {
        vnode.ns = ns
        if (vnode.tag === "foreignObject") {
            // use default namespace inside foreignObject
            return
        }
        if (isDef(vnode.children)) {
            for (var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i]
                if (isDef(child.tag) && isUndef(child.ns)) {
                    applyNS(child, ns)
                }
            }
        }
    }

    /*  */

    /**
     * Runtime helper for rendering v-for lists.
     */
    function renderList(val, render) {
        var ret, i, l, keys, key
        if (Array.isArray(val) || typeof val === "string") {
            ret = new Array(val.length)
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i)
            }
        } else if (typeof val === "number") {
            ret = new Array(val)
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i)
            }
        } else if (isObject(val)) {
            keys = Object.keys(val)
            ret = new Array(keys.length)
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i]
                ret[i] = render(val[key], key, i)
            }
        }
        if (isDef(ret)) {
            ret._isVList = true
        }
        return ret
    }

    /*  */

    /**
     * Runtime helper for rendering <slot>
     */
    function renderSlot(name, fallback, props, bindObject) {
        var scopedSlotFn = this.$scopedSlots[name]
        if (scopedSlotFn) {
            // scoped slot
            props = props || {}
            if (bindObject) {
                props = extend(extend({}, bindObject), props)
            }
            return scopedSlotFn(props) || fallback
        } else {
            var slotNodes = this.$slots[name]
            // warn duplicate slot usage
            if (slotNodes && "production" !== "production") {
                slotNodes._rendered &&
                    warn(
                        'Duplicate presence of slot "' +
                            name +
                            '" found in the same render tree ' +
                            "- this will likely cause render errors.",
                        this
                    )
                slotNodes._rendered = true
            }
            return slotNodes || fallback
        }
    }

    /*  */

    /**
     * Runtime helper for resolving filters
     */
    function resolveFilter(id) {
        return resolveAsset(this.$options, "filters", id, true) || identity
    }

    /*  */

    /**
     * Runtime helper for checking keyCodes from config.
     */
    function checkKeyCodes(eventKeyCode, key, builtInAlias) {
        var keyCodes = config.keyCodes[key] || builtInAlias
        if (Array.isArray(keyCodes)) {
            return keyCodes.indexOf(eventKeyCode) === -1
        } else {
            return keyCodes !== eventKeyCode
        }
    }

    /*  */

    /**
     * Runtime helper for merging v-bind="object" into a VNode's data.
     */
    function bindObjectProps(data, tag, value, asProp, isSync) {
        if (value) {
            if (!isObject(value)) {
                 false &&
                    false
            } else {
                if (Array.isArray(value)) {
                    value = toObject(value)
                }
                var hash
                var loop = function(key) {
                    if (key === "class" || key === "style" || isReservedAttribute(key)) {
                        hash = data
                    } else {
                        var type = data.attrs && data.attrs.type
                        hash =
                            asProp || config.mustUseProp(tag, type, key)
                                ? data.domProps || (data.domProps = {})
                                : data.attrs || (data.attrs = {})
                    }
                    if (!(key in hash)) {
                        hash[key] = value[key]

                        if (isSync) {
                            var on = data.on || (data.on = {})
                            on["update:" + key] = function($event) {
                                value[key] = $event
                            }
                        }
                    }
                }

                for (var key in value) loop(key)
            }
        }
        return data
    }

    /*  */

    /**
     * Runtime helper for rendering static trees.
     */
    function renderStatic(index, isInFor) {
        var tree = this._staticTrees[index]
        // if has already-rendered static tree and not inside v-for,
        // we can reuse the same tree by doing a shallow clone.
        if (tree && !isInFor) {
            return Array.isArray(tree) ? cloneVNodes(tree) : cloneVNode(tree)
        }
        // otherwise, render a fresh tree.
        tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(
            this._renderProxy
        )
        markStatic(tree, "__static__" + index, false)
        return tree
    }

    /**
     * Runtime helper for v-once.
     * Effectively it means marking the node as static with a unique key.
     */
    function markOnce(tree, index, key) {
        markStatic(tree, "__once__" + index + (key ? "_" + key : ""), true)
        return tree
    }

    function markStatic(tree, key, isOnce) {
        if (Array.isArray(tree)) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] && typeof tree[i] !== "string") {
                    markStaticNode(tree[i], key + "_" + i, isOnce)
                }
            }
        } else {
            markStaticNode(tree, key, isOnce)
        }
    }

    function markStaticNode(node, key, isOnce) {
        node.isStatic = true
        node.key = key
        node.isOnce = isOnce
    }

    /*  */

    function bindObjectListeners(data, value) {
        if (value) {
            if (!isPlainObject(value)) {
                 false &&
                    false
            } else {
                var on = (data.on = data.on ? extend({}, data.on) : {})
                for (var key in value) {
                    var existing = on[key]
                    var ours = value[key]
                    on[key] = existing ? [].concat(ours, existing) : ours
                }
            }
        }
        return data
    }

    /*  */

    function initRender(vm) {
        vm._vnode = null // the root of the child tree
        vm._staticTrees = null
        var parentVnode = (vm.$vnode = vm.$options._parentVnode) // the placeholder node in parent tree
        var renderContext = parentVnode && parentVnode.context
        vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext)
        vm.$scopedSlots = emptyObject
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, false)
        }
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, true)
        }

        // $attrs & $listeners are exposed for easier HOC creation.
        // they need to be reactive so that HOCs using them are always updated
        var parentData = parentVnode && parentVnode.data
        /* istanbul ignore else */
        {
            defineReactive$$1(vm, "$attrs", parentData && parentData.attrs, null, true)
            defineReactive$$1(vm, "$listeners", parentData && parentData.on, null, true)
        }
    }

    function renderMixin(Vue) {
        Vue.prototype.$nextTick = function(fn) {
            return nextTick(fn, this)
        }

        Vue.prototype._render = function() {
            var vm = this
            var ref = vm.$options
            var render = ref.render
            var staticRenderFns = ref.staticRenderFns
            var _parentVnode = ref._parentVnode

            if (vm._isMounted) {
                // clone slot nodes on re-renders
                for (var key in vm.$slots) {
                    vm.$slots[key] = cloneVNodes(vm.$slots[key])
                }
            }

            vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject

            if (staticRenderFns && !vm._staticTrees) {
                vm._staticTrees = []
            }
            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            vm.$vnode = _parentVnode
            // render self
            var vnode
            try {
                vnode = render.call(vm._renderProxy, vm.$createElement)
            } catch (e) {
                handleError(e, vm, "render function")
                // return error render result,
                // or previous vnode to prevent render error causing blank component
                /* istanbul ignore else */
                {
                    vnode = vm._vnode
                }
            }
            // return empty vnode in case the render function errored out
            if (!(vnode instanceof VNode)) {
                if (false) {}
                vnode = createEmptyVNode()
            }
            // set parent
            vnode.parent = _parentVnode
            return vnode
        }

        // internal render helpers.
        // these are exposed on the instance prototype to reduce generated render
        // code size.
        Vue.prototype._o = markOnce
        Vue.prototype._n = toNumber
        Vue.prototype._s = toString
        Vue.prototype._l = renderList
        Vue.prototype._t = renderSlot
        Vue.prototype._q = looseEqual
        Vue.prototype._i = looseIndexOf
        Vue.prototype._m = renderStatic
        Vue.prototype._f = resolveFilter
        Vue.prototype._k = checkKeyCodes
        Vue.prototype._b = bindObjectProps
        Vue.prototype._v = createTextVNode
        Vue.prototype._e = createEmptyVNode
        Vue.prototype._u = resolveScopedSlots
        Vue.prototype._g = bindObjectListeners
    }

    /*  */

    var uid = 0

    function initMixin(Vue) {
        Vue.prototype._init = function(options) {
            var vm = this
            // a uid
            vm._uid = uid++

            var startTag, endTag
            /* istanbul ignore if */
            if (false) {}

            // a flag to avoid this being observed
            vm._isVue = true
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options)
            } else {
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                )
            }
            /* istanbul ignore else */
            {
                vm._renderProxy = vm
            }
            // expose real self
            vm._self = vm
            initLifecycle(vm)
            initEvents(vm)
            initRender(vm)
            callHook(vm, "beforeCreate")
            initInjections(vm) // resolve injections before data/props
            initState(vm)
            initProvide(vm) // resolve provide after data/props
            callHook(vm, "created")

            /* istanbul ignore if */
            if (false) {}

            if (vm.$options.el) {
                vm.$mount(vm.$options.el)
            }
        }
    }

    function initInternalComponent(vm, options) {
        var opts = (vm.$options = Object.create(vm.constructor.options))
        // doing this because it's faster than dynamic enumeration.
        opts.parent = options.parent
        opts.propsData = options.propsData
        opts._parentVnode = options._parentVnode
        opts._parentListeners = options._parentListeners
        opts._renderChildren = options._renderChildren
        opts._componentTag = options._componentTag
        opts._parentElm = options._parentElm
        opts._refElm = options._refElm
        if (options.render) {
            opts.render = options.render
            opts.staticRenderFns = options.staticRenderFns
        }
    }

    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options
        if (Ctor.super) {
            var superOptions = resolveConstructorOptions(Ctor.super)
            var cachedSuperOptions = Ctor.superOptions
            if (superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                Ctor.superOptions = superOptions
                // check if there are any late-modified/attached options (#4976)
                var modifiedOptions = resolveModifiedOptions(Ctor)
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions)
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
                if (options.name) {
                    options.components[options.name] = Ctor
                }
            }
        }
        return options
    }

    function resolveModifiedOptions(Ctor) {
        var modified
        var latest = Ctor.options
        var extended = Ctor.extendOptions
        var sealed = Ctor.sealedOptions
        for (var key in latest) {
            if (latest[key] !== sealed[key]) {
                if (!modified) {
                    modified = {}
                }
                modified[key] = dedupe(latest[key], extended[key], sealed[key])
            }
        }
        return modified
    }

    function dedupe(latest, extended, sealed) {
        // compare latest and sealed to ensure lifecycle hooks won't be duplicated
        // between merges
        if (Array.isArray(latest)) {
            var res = []
            sealed = Array.isArray(sealed) ? sealed : [sealed]
            extended = Array.isArray(extended) ? extended : [extended]
            for (var i = 0; i < latest.length; i++) {
                // push original options and not sealed options to exclude duplicated options
                if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i])
                }
            }
            return res
        } else {
            return latest
        }
    }

    function Vue$3(options) {
        if (false) {}
        this._init(options)
    }

    initMixin(Vue$3)
    stateMixin(Vue$3)
    eventsMixin(Vue$3)
    lifecycleMixin(Vue$3)
    renderMixin(Vue$3)

    /*  */

    function initUse(Vue) {
        Vue.use = function(plugin) {
            var installedPlugins = this._installedPlugins || (this._installedPlugins = [])
            if (installedPlugins.indexOf(plugin) > -1) {
                return this
            }

            // additional parameters
            var args = toArray(arguments, 1)
            args.unshift(this)
            if (typeof plugin.install === "function") {
                plugin.install.apply(plugin, args)
            } else if (typeof plugin === "function") {
                plugin.apply(null, args)
            }
            installedPlugins.push(plugin)
            return this
        }
    }

    /*  */

    function initMixin$1(Vue) {
        Vue.mixin = function(mixin) {
            this.options = mergeOptions(this.options, mixin)
            return this
        }
    }

    /*  */

    function initExtend(Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        Vue.cid = 0
        var cid = 1

        /**
         * Class inheritance
         */
        Vue.extend = function(extendOptions) {
            extendOptions = extendOptions || {}
            var Super = this
            var SuperId = Super.cid
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
            if (cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }

            var name = extendOptions.name || Super.options.name
            var Sub = function VueComponent(options) {
                this._init(options)
            }
            Sub.prototype = Object.create(Super.prototype)
            Sub.prototype.constructor = Sub
            Sub.cid = cid++
            Sub.options = mergeOptions(Super.options, extendOptions)
            Sub["super"] = Super

            // For props and computed properties, we define the proxy getters on
            // the Vue instances at extension time, on the extended prototype. This
            // avoids Object.defineProperty calls for each instance created.
            if (Sub.options.props) {
                initProps$1(Sub)
            }
            if (Sub.options.computed) {
                initComputed$1(Sub)
            }

            // allow further extension/mixin/plugin usage
            Sub.extend = Super.extend
            Sub.mixin = Super.mixin
            Sub.use = Super.use

            // create asset registers, so extended classes
            // can have their private assets too.
            ASSET_TYPES.forEach(function(type) {
                Sub[type] = Super[type]
            })
            // enable recursive self-lookup
            if (name) {
                Sub.options.components[name] = Sub
            }

            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options
            Sub.extendOptions = extendOptions
            Sub.sealedOptions = extend({}, Sub.options)

            // cache constructor
            cachedCtors[SuperId] = Sub
            return Sub
        }
    }

    function initProps$1(Comp) {
        var props = Comp.options.props
        for (var key in props) {
            proxy(Comp.prototype, "_props", key)
        }
    }

    function initComputed$1(Comp) {
        var computed = Comp.options.computed
        for (var key in computed) {
            defineComputed(Comp.prototype, key, computed[key])
        }
    }

    /*  */

    function initAssetRegisters(Vue) {
        /**
         * Create asset registration methods.
         */
        ASSET_TYPES.forEach(function(type) {
            Vue[type] = function(id, definition) {
                if (!definition) {
                    return this.options[type + "s"][id]
                } else {
                    /* istanbul ignore if */
                    if (type === "component" && isPlainObject(definition)) {
                        definition.name = definition.name || id
                        definition = this.options._base.extend(definition)
                    }
                    if (type === "directive" && typeof definition === "function") {
                        definition = {
                            bind: definition,
                            update: definition
                        }
                    }
                    this.options[type + "s"][id] = definition
                    return definition
                }
            }
        })
    }

    /*  */

    var patternTypes = [String, RegExp, Array]

    function getComponentName(opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    function matches(pattern, name) {
        if (Array.isArray(pattern)) {
            return pattern.indexOf(name) > -1
        } else if (typeof pattern === "string") {
            return pattern.split(",").indexOf(name) > -1
        } else if (isRegExp(pattern)) {
            return pattern.test(name)
        }
        /* istanbul ignore next */
        return false
    }

    function pruneCache(cache, current, filter) {
        for (var key in cache) {
            var cachedNode = cache[key]
            if (cachedNode) {
                var name = getComponentName(cachedNode.componentOptions)
                if (name && !filter(name)) {
                    if (cachedNode !== current) {
                        pruneCacheEntry(cachedNode)
                    }
                    cache[key] = null
                }
            }
        }
    }

    function pruneCacheEntry(vnode) {
        if (vnode) {
            vnode.componentInstance.$destroy()
        }
    }

    var KeepAlive = {
        name: "keep-alive",
        abstract: true,

        props: {
            include: patternTypes,
            exclude: patternTypes
        },

        created: function created() {
            this.cache = Object.create(null)
        },

        destroyed: function destroyed() {
            var this$1 = this

            for (var key in this$1.cache) {
                pruneCacheEntry(this$1.cache[key])
            }
        },

        watch: {
            include: function include(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return matches(val, name)
                })
            },
            exclude: function exclude(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return !matches(val, name)
                })
            }
        },

        render: function render() {
            var vnode = getFirstComponentChild(this.$slots.default)
            var componentOptions = vnode && vnode.componentOptions
            if (componentOptions) {
                // check pattern
                var name = getComponentName(componentOptions)
                if (
                    name &&
                    ((this.include && !matches(this.include, name)) ||
                        (this.exclude && matches(this.exclude, name)))
                ) {
                    return vnode
                }
                var key =
                    vnode.key == null
                        ? // same constructor may get registered as different local components
                          // so cid alone is not enough (#3269)
                          componentOptions.Ctor.cid +
                          (componentOptions.tag ? "::" + componentOptions.tag : "")
                        : vnode.key
                if (this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance
                } else {
                    this.cache[key] = vnode
                }
                vnode.data.keepAlive = true
            }
            return vnode
        }
    }

    var builtInComponents = {
        KeepAlive: KeepAlive
    }

    /*  */

    function initGlobalAPI(Vue) {
        // config
        var configDef = {}
        configDef.get = function() {
            return config
        }
        Object.defineProperty(Vue, "config", configDef)

        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn: warn,
            extend: extend,
            mergeOptions: mergeOptions,
            defineReactive: defineReactive$$1
        }

        Vue.set = set
        Vue.delete = del
        Vue.nextTick = nextTick

        Vue.options = Object.create(null)
        ASSET_TYPES.forEach(function(type) {
            Vue.options[type + "s"] = Object.create(null)
        })

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue

        extend(Vue.options.components, builtInComponents)

        initUse(Vue)
        initMixin$1(Vue)
        initExtend(Vue)
        initAssetRegisters(Vue)
    }

    initGlobalAPI(Vue$3)

    Object.defineProperty(Vue$3.prototype, "$isServer", {
        get: isServerRendering
    })

    Object.defineProperty(Vue$3.prototype, "$ssrContext", {
        get: function get() {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    })

    Vue$3.version = "2.4.1"
    Vue$3.mpvueVersion = "1.0.12"

    /* globals renderer */

    var isReservedTag = makeMap(
        "template,script,style,element,content,slot,link,meta,svg,view," +
            "a,div,img,image,text,span,richtext,input,switch,textarea,spinner,select," +
            "slider,slider-neighbor,indicator,trisition,trisition-group,canvas," +
            "list,cell,header,loading,loading-indicator,refresh,scrollable,scroller," +
            "video,web,embed,tabbar,tabheader,datepicker,timepicker,marquee,countdown",
        true
    )

    // these are reserved for web because they are directly compiled away
    // during template compilation
    var isReservedAttr = makeMap("style,class")

    // Elements that you can, intentionally, leave open (and which close themselves)
    // more flexable than web
    var canBeLeftOpenTag = makeMap(
        "web,spinner,switch,video,textarea,canvas," + "indicator,marquee,countdown",
        true
    )

    var isUnaryTag = makeMap("embed,img,image,input,link,meta", true)

    function mustUseProp() {
        /* console.log('mustUseProp') */
    }

    function getTagNamespace() {
        /* console.log('getTagNamespace') */
    }

    function isUnknownElement() {
        /* console.log('isUnknownElement') */
    }

    function getComKey(vm) {
        return vm && vm.$attrs ? vm.$attrs["mpcomid"] : "0"
    }

    // 用于小程序的 event type 到 web 的 event
    var eventTypeMap = {
        tap: ["tap", "click"],
        touchstart: ["touchstart"],
        touchmove: ["touchmove"],
        touchcancel: ["touchcancel"],
        touchend: ["touchend"],
        longtap: ["longtap"],
        input: ["input"],
        blur: ["change", "blur"],
        submit: ["submit"],
        focus: ["focus"],
        scrolltoupper: ["scrolltoupper"],
        scrolltolower: ["scrolltolower"],
        scroll: ["scroll"]
    }

    /*  */

    // import { namespaceMap } from 'mp/util/index'

    var obj = {}

    function createElement$1(tagName, vnode) {
        return obj
    }

    function createElementNS(namespace, tagName) {
        return obj
    }

    function createTextNode(text) {
        return obj
    }

    function createComment(text) {
        return obj
    }

    function insertBefore(parentNode, newNode, referenceNode) {}

    function removeChild(node, child) {}

    function appendChild(node, child) {}

    function parentNode(node) {
        return obj
    }

    function nextSibling(node) {
        return obj
    }

    function tagName(node) {
        return "div"
    }

    function setTextContent(node, text) {
        return obj
    }

    function setAttribute(node, key, val) {
        return obj
    }

    var nodeOps = Object.freeze({
        createElement: createElement$1,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        setAttribute: setAttribute
    })

    /*  */

    var ref = {
        create: function create(_, vnode) {
            registerRef(vnode)
        },
        update: function update(oldVnode, vnode) {
            if (oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true)
                registerRef(vnode)
            }
        },
        destroy: function destroy(vnode) {
            registerRef(vnode, true)
        }
    }

    function registerRef(vnode, isRemoval) {
        var key = vnode.data.ref
        if (!key) {
            return
        }

        var vm = vnode.context
        var ref = vnode.componentInstance || vnode.elm
        var refs = vm.$refs
        if (isRemoval) {
            if (Array.isArray(refs[key])) {
                remove(refs[key], ref)
            } else if (refs[key] === ref) {
                refs[key] = undefined
            }
        } else {
            if (vnode.data.refInFor) {
                if (!Array.isArray(refs[key])) {
                    refs[key] = [ref]
                } else if (refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref)
                }
            } else {
                refs[key] = ref
            }
        }
    }

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/paldepind/snabbdom/blob/master/LICENSE
     *
     * modified by Evan You (@yyx990803)
     *

    /*
     * Not type-checking this because this file is perf-critical and the cost
     * of making flow understand it is not worth it.
     */

    var emptyNode = new VNode("", {}, [])

    var hooks = ["create", "activate", "update", "remove", "destroy"]

    function sameVnode(a, b) {
        return (
            a.key === b.key &&
            ((a.tag === b.tag &&
                a.isComment === b.isComment &&
                isDef(a.data) === isDef(b.data) &&
                sameInputType(a, b)) ||
                (isTrue(a.isAsyncPlaceholder) &&
                    a.asyncFactory === b.asyncFactory &&
                    isUndef(b.asyncFactory.error)))
        )
    }

    // Some browsers do not support dynamically changing type for <input>
    // so they need to be treated as different nodes
    function sameInputType(a, b) {
        if (a.tag !== "input") {
            return true
        }
        var i
        var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type
        var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type
        return typeA === typeB
    }

    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var i, key
        var map = {}
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key
            if (isDef(key)) {
                map[key] = i
            }
        }
        return map
    }

    function createPatchFunction(backend) {
        var i, j
        var cbs = {}

        var modules = backend.modules
        var nodeOps = backend.nodeOps

        for (i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = []
            for (j = 0; j < modules.length; ++j) {
                if (isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]])
                }
            }
        }

        function emptyNodeAt(elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb(childElm, listeners) {
            function remove$$1() {
                if (--remove$$1.listeners === 0) {
                    removeNode(childElm)
                }
            }
            remove$$1.listeners = listeners
            return remove$$1
        }

        function removeNode(el) {
            var parent = nodeOps.parentNode(el)
            // element may have already been removed due to v-html / v-text
            if (isDef(parent)) {
                nodeOps.removeChild(parent, el)
            }
        }

        var inPre = 0

        function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested // for transition enter check
            if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }

            var data = vnode.data
            var children = vnode.children
            var tag = vnode.tag
            if (isDef(tag)) {
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode)
                setScope(vnode)

                /* istanbul ignore if */
                {
                    createChildren(vnode, children, insertedVnodeQueue)
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue)
                    }
                    insert(parentElm, vnode.elm, refElm)
                }

                if (false) {}
            } else if (isTrue(vnode.isComment)) {
                vnode.elm = nodeOps.createComment(vnode.text)
                insert(parentElm, vnode.elm, refElm)
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text)
                insert(parentElm, vnode.elm, refElm)
            }
        }

        function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i = vnode.data
            if (isDef(i)) {
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive
                if (isDef((i = i.hook)) && isDef((i = i.init))) {
                    i(vnode, false /* hydrating */, parentElm, refElm)
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue)
                    if (isTrue(isReactivated)) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
                    }
                    return true
                }
            }
        }

        function initComponent(vnode, insertedVnodeQueue) {
            if (isDef(vnode.data.pendingInsert)) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
                vnode.data.pendingInsert = null
            }
            vnode.elm = vnode.componentInstance.$el
            if (isPatchable(vnode)) {
                invokeCreateHooks(vnode, insertedVnodeQueue)
                setScope(vnode)
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode)
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode)
            }
        }

        function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode
            while (innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode
                if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode)
                    }
                    insertedVnodeQueue.push(innerNode)
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm)
        }

        function insert(parent, elm, ref$$1) {
            if (isDef(parent)) {
                if (isDef(ref$$1)) {
                    if (ref$$1.parentNode === parent) {
                        nodeOps.insertBefore(parent, elm, ref$$1)
                    }
                } else {
                    nodeOps.appendChild(parent, elm)
                }
            }
        }

        function createChildren(vnode, children, insertedVnodeQueue) {
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true)
                }
            } else if (isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
            }
        }

        function isPatchable(vnode) {
            while (vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode
            }
            return isDef(vnode.tag)
        }

        function invokeCreateHooks(vnode, insertedVnodeQueue) {
            for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode)
            }
            i = vnode.data.hook // Reuse variable
            if (isDef(i)) {
                if (isDef(i.create)) {
                    i.create(emptyNode, vnode)
                }
                if (isDef(i.insert)) {
                    insertedVnodeQueue.push(vnode)
                }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope(vnode) {
            var i
            var ancestor = vnode
            while (ancestor) {
                if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
                    nodeOps.setAttribute(vnode.elm, i, "")
                }
                ancestor = ancestor.parent
            }
            // for slot content they should also get the scopeId from the host instance.
            if (
                isDef((i = activeInstance)) &&
                i !== vnode.context &&
                isDef((i = i.$options._scopeId))
            ) {
                nodeOps.setAttribute(vnode.elm, i, "")
            }
        }

        function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm)
            }
        }

        function invokeDestroyHook(vnode) {
            var i, j
            var data = vnode.data
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.destroy))) {
                    i(vnode)
                }
                for (i = 0; i < cbs.destroy.length; ++i) {
                    cbs.destroy[i](vnode)
                }
            }
            if (isDef((i = vnode.children))) {
                for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j])
                }
            }
        }

        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx]
                if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                        removeAndInvokeRemoveHook(ch)
                        invokeDestroyHook(ch)
                    } else {
                        // Text node
                        removeNode(ch.elm)
                    }
                }
            }
        }

        function removeAndInvokeRemoveHook(vnode, rm) {
            if (isDef(rm) || isDef(vnode.data)) {
                var i
                var listeners = cbs.remove.length + 1
                if (isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners
                } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners)
                }
                // recursively invoke hooks on child component root node
                if (
                    isDef((i = vnode.componentInstance)) &&
                    isDef((i = i._vnode)) &&
                    isDef(i.data)
                ) {
                    removeAndInvokeRemoveHook(i, rm)
                }
                for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm)
                }
                if (isDef((i = vnode.data.hook)) && isDef((i = i.remove))) {
                    i(vnode, rm)
                } else {
                    rm()
                }
            } else {
                removeNode(vnode.elm)
            }
        }

        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            var oldStartIdx = 0
            var newStartIdx = 0
            var oldEndIdx = oldCh.length - 1
            var oldStartVnode = oldCh[0]
            var oldEndVnode = oldCh[oldEndIdx]
            var newEndIdx = newCh.length - 1
            var newStartVnode = newCh[0]
            var newEndVnode = newCh[newEndIdx]
            var oldKeyToIdx, idxInOld, elmToMove, refElm

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly

            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
                } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx]
                } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
                    oldStartVnode = oldCh[++oldStartIdx]
                    newStartVnode = newCh[++newStartIdx]
                } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newEndVnode = newCh[--newEndIdx]
                } else if (sameVnode(oldStartVnode, newEndVnode)) {
                    // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
                    canMove &&
                        nodeOps.insertBefore(
                            parentElm,
                            oldStartVnode.elm,
                            nodeOps.nextSibling(oldEndVnode.elm)
                        )
                    oldStartVnode = oldCh[++oldStartIdx]
                    newEndVnode = newCh[--newEndIdx]
                } else if (sameVnode(oldEndVnode, newStartVnode)) {
                    // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newStartVnode = newCh[++newStartIdx]
                } else {
                    if (isUndef(oldKeyToIdx)) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
                    }
                    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
                    if (isUndef(idxInOld)) {
                        // New element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
                        newStartVnode = newCh[++newStartIdx]
                    } else {
                        elmToMove = oldCh[idxInOld]
                        /* istanbul ignore if */
                        if (false) {}
                        if (sameVnode(elmToMove, newStartVnode)) {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
                            oldCh[idxInOld] = undefined
                            canMove &&
                                nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm)
                            newStartVnode = newCh[++newStartIdx]
                        } else {
                            // same key but different element. treat as new element
                            createElm(
                                newStartVnode,
                                insertedVnodeQueue,
                                parentElm,
                                oldStartVnode.elm
                            )
                            newStartVnode = newCh[++newStartIdx]
                        }
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
            }
        }

        function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            if (oldVnode === vnode) {
                return
            }

            var elm = (vnode.elm = oldVnode.elm)

            if (isTrue(oldVnode.isAsyncPlaceholder)) {
                if (isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
                } else {
                    vnode.isAsyncPlaceholder = true
                }
                return
            }

            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            if (
                isTrue(vnode.isStatic) &&
                isTrue(oldVnode.isStatic) &&
                vnode.key === oldVnode.key &&
                (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
            ) {
                vnode.componentInstance = oldVnode.componentInstance
                return
            }

            var i
            var data = vnode.data
            if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
                i(oldVnode, vnode)
            }

            var oldCh = oldVnode.children
            var ch = vnode.children
            if (isDef(data) && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) {
                    cbs.update[i](oldVnode, vnode)
                }
                if (isDef((i = data.hook)) && isDef((i = i.update))) {
                    i(oldVnode, vnode)
                }
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) {
                        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
                    }
                } else if (isDef(ch)) {
                    if (isDef(oldVnode.text)) {
                        nodeOps.setTextContent(elm, "")
                    }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
                } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1)
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, "")
                }
            } else if (oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text)
            }
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.postpatch))) {
                    i(oldVnode, vnode)
                }
            }
        }

        function invokeInsertHook(vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if (isTrue(initial) && isDef(vnode.parent)) {
                vnode.parent.data.pendingInsert = queue
            } else {
                for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i])
                }
            }
        }

        var bailed = false
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap("attrs,style,class,staticClass,staticStyle,key")

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate(elm, vnode, insertedVnodeQueue) {
            if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                vnode.elm = elm
                vnode.isAsyncPlaceholder = true
                return true
            }
            vnode.elm = elm
            var tag = vnode.tag
            var data = vnode.data
            var children = vnode.children
            if (isDef(data)) {
                if (isDef((i = data.hook)) && isDef((i = i.init))) {
                    i(vnode, true /* hydrating */)
                }
                if (isDef((i = vnode.componentInstance))) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue)
                    return true
                }
            }
            if (isDef(tag)) {
                if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue)
                    } else {
                        var childrenMatch = true
                        var childNode = elm.firstChild
                        for (var i$1 = 0; i$1 < children.length; i$1++) {
                            if (
                                !childNode ||
                                !hydrate(childNode, children[i$1], insertedVnodeQueue)
                            ) {
                                childrenMatch = false
                                break
                            }
                            childNode = childNode.nextSibling
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if (!childrenMatch || childNode) {
                            if (
                                false
                            ) {}
                            return false
                        }
                    }
                }
                if (isDef(data)) {
                    for (var key in data) {
                        if (!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue)
                            break
                        }
                    }
                }
            } else if (elm.data !== vnode.text) {
                elm.data = vnode.text
            }
            return true
        }

        return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            if (isUndef(vnode)) {
                if (isDef(oldVnode)) {
                    invokeDestroyHook(oldVnode)
                }
                return
            }

            var isInitialPatch = false
            var insertedVnodeQueue = []

            if (isUndef(oldVnode)) {
                // empty mount (likely as component), create new root element
                isInitialPatch = true
                createElm(vnode, insertedVnodeQueue, parentElm, refElm)
            } else {
                var isRealElement = isDef(oldVnode.nodeType)
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
                } else {
                    if (isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                            oldVnode.removeAttribute(SSR_ATTR)
                            hydrating = true
                        }
                        if (isTrue(hydrating)) {
                            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true)
                                return oldVnode
                            } else {
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        oldVnode = emptyNodeAt(oldVnode)
                    }
                    // replacing existing element
                    var oldElm = oldVnode.elm
                    var parentElm$1 = nodeOps.parentNode(oldElm)
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    )

                    if (isDef(vnode.parent)) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent
                        while (ancestor) {
                            ancestor.elm = vnode.elm
                            ancestor = ancestor.parent
                        }
                        if (isPatchable(vnode)) {
                            for (var i = 0; i < cbs.create.length; ++i) {
                                cbs.create[i](emptyNode, vnode.parent)
                            }
                        }
                    }

                    if (isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0)
                    } else if (isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode)
                    }
                }
            }

            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
            return vnode.elm
        }
    }

    /*  */

    // import baseModules from 'core/vdom/modules/index'
    // const platformModules = []
    // import platformModules from 'web/runtime/modules/index'

    // the directive module should be applied last, after all
    // built-in modules have been applied.
    // const modules = platformModules.concat(baseModules)
    var modules = [ref]

    var corePatch = createPatchFunction({
        nodeOps: nodeOps,
        modules: modules
    })

    function patch() {
        corePatch.apply(this, arguments)
        this.$updateDataToMP()
    }

    function callHook$1(vm, hook, params) {
        var handlers = vm.$options[hook]
        if (hook === "onError" && handlers) {
            handlers = [handlers]
        }

        var ret
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    ret = handlers[i].call(vm, params)
                } catch (e) {
                    handleError(e, vm, hook + " hook")
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit("hook:" + hook)
        }

        // for child
        if (vm.$children.length) {
            vm.$children.forEach(function(v) {
                return callHook$1(v, hook, params)
            })
        }

        return ret
    }

    // mpType 小程序实例的类型，可能的值是 'app', 'page'
    // rootVueVM 是 vue 的根组件实例，子组件中访问 this.$root 可得
    function getGlobalData(app, rootVueVM) {
        var mp = rootVueVM.$mp
        if (app && app.globalData) {
            mp.appOptions = app.globalData.appOptions
        }
    }

    // 格式化 properties 属性，并给每个属性加上 observer 方法

    // properties 的 一些类型 https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html
    // properties: {
    //   paramA: Number,
    //   myProperty: { // 属性名
    //     type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
    //     value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
    //     observer: function(newVal, oldVal, changedPath) {
    //        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    //        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
    //     }
    //   },
    // }

    // props 的一些类型 https://cn.vuejs.org/v2/guide/components-props.html#ad
    // props: {
    //   // 基础的类型检查 (`null` 匹配任何类型)
    //   propA: Number,
    //   // 多个可能的类型
    //   propB: [String, Number],
    //   // 必填的字符串
    //   propC: {
    //     type: String,
    //     required: true
    //   },
    //   // 带有默认值的数字
    //   propD: {
    //     type: Number,
    //     default: 100
    //   },
    //   // 带有默认值的对象
    //   propE: {
    //     type: Object,
    //     // 对象或数组且一定会从一个工厂函数返回默认值
    //     default: function () {
    //       return { message: 'hello' }
    //     }
    //   },
    //   // 自定义验证函数
    //   propF: {
    //     validator: function (value) {
    //       // 这个值必须匹配下列字符串中的一个
    //       return ['success', 'warning', 'danger'].indexOf(value) !== -1
    //     }
    //   }
    // }

    // core/util/options
    function normalizeProps$1(props, res, vm) {
        if (!props) {
            return
        }
        var i, val, name
        if (Array.isArray(props)) {
            i = props.length
            while (i--) {
                val = props[i]
                if (typeof val === "string") {
                    name = camelize(val)
                    res[name] = {
                        type: null
                    }
                } else {
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key]
                name = camelize(key)
                res[name] = isPlainObject(val)
                    ? val
                    : {
                          type: val
                      }
            }
        }

        // fix vueProps to properties
        for (var key$1 in res) {
            if (res.hasOwnProperty(key$1)) {
                var item = res[key$1]
                if (item.default) {
                    item.value = item.default
                }
                var oldObserver = item.observer
                item.observer = function(newVal, oldVal) {
                    vm[name] = newVal
                    // 先修改值再触发原始的 observer，跟 watch 行为保持一致
                    if (typeof oldObserver === "function") {
                        oldObserver.call(vm, newVal, oldVal)
                    }
                }
            }
        }

        return res
    }

    function normalizeProperties(vm) {
        var properties = vm.$options.properties
        var vueProps = vm.$options.props
        var res = {}

        normalizeProps$1(properties, res, vm)
        normalizeProps$1(vueProps, res, vm)

        return res
    }

    /**
     * 把 properties 中的属性 proxy 到 vm 上
     */
    function initMpProps(vm) {
        var mpProps = (vm._mpProps = {})
        var keys = Object.keys(vm.$options.properties || {})
        keys.forEach(function(key) {
            if (!(key in vm)) {
                proxy(vm, "_mpProps", key)
                mpProps[key] = undefined // for observe
            }
        })
        observe(mpProps, true)
    }

    function initMP(mpType, next) {
        var rootVueVM = this.$root
        if (!rootVueVM.$mp) {
            rootVueVM.$mp = {}
        }

        var mp = rootVueVM.$mp

        // Please do not register multiple Pages
        // if (mp.registered) {
        if (mp.status) {
            // 处理子组件的小程序生命周期
            if (mpType === "app") {
                callHook$1(this, "onLaunch", mp.appOptions)
            } else {
                callHook$1(this, "onLoad", mp.query)
                // callHook$1(this, "onReady") // 避免 onReady触发两次
            }
            return next()
        }
        // mp.registered = true

        mp.mpType = mpType
        mp.status = "register"

        if (mpType === "app") {
            global.App({
                // 页面的初始数据
                globalData: {
                    appOptions: {}
                },

                handleProxy: function handleProxy(e) {
                    return rootVueVM.$handleProxyWithVue(e)
                },

                // Do something initial when launch.
                onLaunch: function onLaunch(options) {
                    if (options === void 0) options = {}

                    mp.app = this
                    mp.status = "launch"
                    this.globalData.appOptions = mp.appOptions = options
                    callHook$1(rootVueVM, "onLaunch", options)
                    next()
                },

                // Do something when app show.
                onShow: function onShow(options) {
                    if (options === void 0) options = {}

                    mp.status = "show"
                    this.globalData.appOptions = mp.appOptions = options
                    callHook$1(rootVueVM, "onShow", options)
                },

                // Do something when app hide.
                onHide: function onHide() {
                    mp.status = "hide"
                    callHook$1(rootVueVM, "onHide")
                },

                onError: function onError(err) {
                    callHook$1(rootVueVM, "onError", err)
                },
                //fixed by xxxxxx
                onUniNViewMessage: function onUniNViewMessage(e) {
                    callHook$1(rootVueVM, "onUniNViewMessage", e)
                }
            })
        } else if (mpType === "component") {
            initMpProps(rootVueVM)

            global.Component({
                // 小程序原生的组件属性
                properties: normalizeProperties(rootVueVM),
                // 页面的初始数据
                data: {
                    $root: {}
                },
                methods: {
                    handleProxy: function handleProxy(e) {
                        return rootVueVM.$handleProxyWithVue(e)
                    }
                },
                // mp lifecycle for vue
                // 组件生命周期函数，在组件实例进入页面节点树时执行，注意此时不能调用 setData
                created: function created() {
                    mp.status = "created"
                    mp.page = this
                },
                // 组件生命周期函数，在组件实例进入页面节点树时执行
                attached: function attached() {
                    mp.status = "attached"
                    callHook$1(rootVueVM, "attached")
                },
                // 组件生命周期函数，在组件布局完成后执行，此时可以获取节点信息（使用 SelectorQuery ）
                ready: function ready() {
                    mp.status = "ready"

                    callHook$1(rootVueVM, "ready")
                    next()

                    // 只有页面需要 setData
                    rootVueVM.$nextTick(function() {
                        rootVueVM._initDataToMP()
                    })
                },
                // 组件生命周期函数，在组件实例被移动到节点树另一个位置时执行
                moved: function moved() {
                    callHook$1(rootVueVM, "moved")
                },
                // 组件生命周期函数，在组件实例被从页面节点树移除时执行
                detached: function detached() {
                    mp.status = "detached"
                    callHook$1(rootVueVM, "detached")
                }
            })
        } else {
            var app = global.getApp()
    
            
            global.Page({
                // 页面的初始数据
                data: {
                    $root: {}
                },

                handleProxy: function handleProxy(e) {
                    return rootVueVM.$handleProxyWithVue(e)
                },

                // mp lifecycle for vue
                // 生命周期函数--监听页面加载
                onLoad: function onLoad(query) {
                    rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
                    mp.page = this
                    mp.query = query
                    mp.status = "load"
                    getGlobalData(app, rootVueVM)
                    //仅load时重置数据
                    if (rootVueVM.$options && typeof rootVueVM.$options.data === "function") {
                    		Object.assign(rootVueVM.$data, rootVueVM.$options.data())
                    }
                    callHook$1(rootVueVM, "onLoad", query)
                },

                // 生命周期函数--监听页面显示
                onShow: function onShow() {
                    rootVueVM.__wxWebviewId__ = this.__wxWebviewId__//fixed by xxxxxx(createIntersectionObserver)
                    mp.page = this
                    mp.status = "show"
                
                    callHook$1(rootVueVM, "onShow")
                    
                    //   // 只有页面需要 setData
                    rootVueVM.$nextTick(function () {
                    	rootVueVM._initDataToMP();
                    });
                },

                // 生命周期函数--监听页面初次渲染完成
                onReady: function onReady() {
                    mp.status = "ready"

                    callHook$1(rootVueVM, "onReady")
                    next()
                },

                // 生命周期函数--监听页面隐藏
                onHide: function onHide() {
                    mp.status = "hide"
                    callHook$1(rootVueVM, "onHide")
                },

                // 生命周期函数--监听页面卸载
                onUnload: function onUnload() {
                    mp.status = "unload"
                    callHook$1(rootVueVM, "onUnload")
                    mp.page = null
                },

                // 页面相关事件处理函数--监听用户下拉动作
                onPullDownRefresh: function onPullDownRefresh() {
                    callHook$1(rootVueVM, "onPullDownRefresh")
                },

                // 页面上拉触底事件的处理函数
                onReachBottom: function onReachBottom() {
                    callHook$1(rootVueVM, "onReachBottom")
                },

                // 用户点击右上角分享
                onShareAppMessage: rootVueVM.$options.onShareAppMessage
                    ? function(options) {
                          return callHook$1(rootVueVM, "onShareAppMessage", options)
                      }
                    : null,

                // Do something when page scroll
                onPageScroll: function onPageScroll(options) {
                    callHook$1(rootVueVM, "onPageScroll", options)
                },

                // 当前是 tab 页时，点击 tab 时触发
                onTabItemTap: function onTabItemTap(options) {
                    callHook$1(rootVueVM, "onTabItemTap", options)
                }
            })
        }
    }

    // 节流方法，性能优化
    // 全局的命名约定，为了节省编译的包大小一律采取形象的缩写，说明如下。
    // $c === $child
    // $k === $comKey

    // 新型的被拍平的数据结构
    // {
    //   $root: {
    //     '1-1'{
    //       // ... data
    //     },
    //     '1.2-1': {
    //       // ... data1
    //     },
    //     '1.2-2': {
    //       // ... data2
    //     }
    //   }
    // }

    function getVmData(vm) {
        // 确保当前 vm 所有数据被同步
        var dataKeys = [].concat(
            Object.keys(vm._data || {}),
            Object.keys(vm._props || {}),
            Object.keys(vm._mpProps || {}),
            Object.keys(vm._computedWatchers || {})
        )
        return dataKeys.reduce(function(res, key) {
            res[key] = vm[key]
            return res
        }, {})
    }

    function getParentComKey(vm, res) {
        if (res === void 0) res = []

        var ref = vm || {}
        var $parent = ref.$parent
        if (!$parent) {
            return res
        }
        res.unshift(getComKey($parent))
        if ($parent.$parent) {
            return getParentComKey($parent, res)
        }
        return res
    }

    function formatVmData(vm) {
        var $p = getParentComKey(vm).join(",")
        var $k = $p + ($p ? "," : "") + getComKey(vm)

        // getVmData 这儿获取当前组件内的所有数据，包含 props、computed 的数据
        // 改动 vue.runtime 所获的的核心能力
        var data = Object.assign(getVmData(vm), {
            $k: $k,
            $kk: $k + ",",
            $p: $p
        })
        var key = "$root." + $k
        var res = {}
        res[key] = data
        return res
    }

    function collectVmData(vm, res) {
        if (res === void 0) res = {}

        var vms = vm.$children
        if (vms && vms.length) {
            vms.forEach(function(v) {
                return collectVmData(v, res)
            })
        }
        return Object.assign(res, formatVmData(vm))
    }

    /**
     * 频率控制 返回函数连续调用时，func 执行频率限定为 次 / wait
     * 自动合并 data
     *
     * @param  {function}   func      传入函数
     * @param  {number}     wait      表示时间窗口的间隔
     * @param  {object}     options   如果想忽略开始边界上的调用，传入{leading: false}。
     *                                如果想忽略结尾边界上的调用，传入{trailing: false}
     * @return {function}             返回客户调用函数
     */
    function throttle(func, wait, options) {
        var context, args, result
        var timeout = null
        // 上次执行时间点
        var previous = 0
        if (!options) {
            options = {}
        }
        // 延迟执行函数
        function later() {
            // 若设定了开始边界不执行选项，上次执行时间始终为0
            previous = options.leading === false ? 0 : Date.now()
            timeout = null
            result = func.apply(context, args)
            if (!timeout) {
                context = args = null
            }
        }
        return function(handle, data) {
            var now = Date.now()
            // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
            if (!previous && options.leading === false) {
                previous = now
            }
            // 延迟执行时间间隔
            var remaining = wait - (now - previous)
            context = this
            args = args ? [handle, Object.assign(args[1], data)] : [handle, data]
            // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
            // remaining大于时间窗口wait，表示客户端系统时间被调整过
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout)
                timeout = null
                previous = now
                result = func.apply(context, args)
                if (!timeout) {
                    context = args = null
                }
                // 如果延迟执行不存在，且没有设定结尾边界不执行选项
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining)
            }
            return result
        }
    }

    // 优化频繁的 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
    var throttleSetData = throttle(function(handle, data) {
        handle(data)
    }, 50)

    function getPage(vm) {
        var rootVueVM = vm.$root
        var ref = rootVueVM.$mp || {}
        var mpType = ref.mpType
        if (mpType === void 0) mpType = ""
        var page = ref.page

        // 优化后台态页面进行 setData: https://mp.weixin.qq.com/debug/wxadoc/dev/framework/performance/tips.html
        if (mpType === "app" || !page || typeof page.setData !== "function") {
            return
        }
        return page
    }

    // 优化每次 setData 都传递大量新数据
    function updateDataToMP() {
        var page = getPage(this)
        if (!page) {
            return
        }

        var data = JSON.parse(JSON.stringify(formatVmData(this)))
        //fixed by xxxxxx
        throttleSetData(page.setData.bind(page), diff(data, page.data))
    }

    function initDataToMP() {
        var page = getPage(this)
        if (!page) {
            return
        }

        var data = collectVmData(this.$root)
        //fixed by xxxxxx
        page.setData(JSON.parse(JSON.stringify(data)))
    }

    function getVM(vm, comkeys) {
        if (comkeys === void 0) comkeys = []

        var keys = comkeys.slice(1)
        if (!keys.length) {
            return vm
        }

        return keys.reduce(function(res, key) {
            var len = res.$children.length
            for (var i = 0; i < len; i++) {
                var v = res.$children[i]
                var k = getComKey(v)
                if (k === key) {
                    res = v
                    return res
                }
            }
            return res
        }, vm)
    }

    function getHandle(vnode, eventid, eventTypes) {
        if (eventTypes === void 0) eventTypes = []

        var res = []
        if (!vnode || !vnode.tag) {
            return res
        }

        var ref = vnode || {}
        var data = ref.data
        if (data === void 0) data = {}
        var children = ref.children
        if (children === void 0) children = []
        var componentInstance = ref.componentInstance
        if (componentInstance) {
            // 增加 slot 情况的处理
            // Object.values 会多增加几行编译后的代码
            Object.keys(componentInstance.$slots).forEach(function(slotKey) {
                var slot = componentInstance.$slots[slotKey]
                var slots = Array.isArray(slot) ? slot : [slot]
                slots.forEach(function(node) {
                    res = res.concat(getHandle(node, eventid, eventTypes))
                })
            })
        } else {
            // 避免遍历超出当前组件的 vm
            children.forEach(function(node) {
                res = res.concat(getHandle(node, eventid, eventTypes))
            })
        }

        var attrs = data.attrs
        var on = data.on
        if (attrs && on && attrs["eventid"] === eventid) {
            eventTypes.forEach(function(et) {
                var h = on[et]
                if (typeof h === "function") {
                    res.push(h)
                } else if (Array.isArray(h)) {
                    res = res.concat(h)
                }
            })
            return res
        }

        return res
    }

    function getWebEventByMP(e) {
        var type = e.type
        var timeStamp = e.timeStamp
        var touches = e.touches
        var detail = e.detail
        if (detail === void 0) detail = {}
        var target = e.target
        if (target === void 0) target = {}
        var currentTarget = e.currentTarget
        if (currentTarget === void 0) currentTarget = {}
        var x = detail.x
        var y = detail.y
        var event = {
            mp: e,
            type: type,
            timeStamp: timeStamp,
            x: x,
            y: y,
            target: Object.assign({}, target, detail),
            detail: detail, //fixed by xxxxxx
            currentTarget: currentTarget,
            stopPropagation: noop,
            preventDefault: noop
        }

        if (touches && touches.length) {
            Object.assign(event, touches[0])
            event.touches = touches
        }
        return event
    }

    function handleProxyWithVue(e) {
        var rootVueVM = this.$root
        var type = e.type
        var target = e.target
        if (target === void 0) target = {}
        var currentTarget = e.currentTarget
        var ref = currentTarget || target
        var dataset = ref.dataset
        if (dataset === void 0) dataset = {}
        var comkey = dataset.comkey
        if (comkey === void 0) comkey = ""
        var eventid = dataset.eventid
        var vm = getVM(rootVueVM, comkey.split(","))

        if (!vm) {
            return
        }

        var webEventTypes = eventTypeMap[type] || [type]
        var handles = getHandle(vm._vnode, eventid, webEventTypes)

        // TODO, enevt 还需要处理更多
        // https://developer.mozilla.org/zh-CN/docs/Web/API/Event
        if (handles.length) {
            var event = getWebEventByMP(e)
            if (handles.length === 1) {
                var result = handles[0](event)
                return result
            }
            handles.forEach(function(h) {
                return h(event)
            })
        }
    }

    // for platforms
    // import config from 'core/config'
    // install platform specific utils
    Vue$3.config.mustUseProp = mustUseProp
    Vue$3.config.isReservedTag = isReservedTag
    Vue$3.config.isReservedAttr = isReservedAttr
    Vue$3.config.getTagNamespace = getTagNamespace
    Vue$3.config.isUnknownElement = isUnknownElement

    // install platform patch function
    Vue$3.prototype.__patch__ = patch

    // public mount method
    Vue$3.prototype.$mount = function(el, hydrating) {
        var this$1 = this

        // el = el && inBrowser ? query(el) : undefined
        // return mountComponent(this, el, hydrating)

        // 初始化小程序生命周期相关
        var options = this.$options

        if (options && (options.render || options.mpType)) {
            var mpType = options.mpType
            if (mpType === void 0) mpType = "page"
            return this._initMP(mpType, function() {
                return mountComponent(this$1, undefined, undefined)
            })
        } else {
            return mountComponent(this, undefined, undefined)
        }
    }

    // for mp
    Vue$3.prototype._initMP = initMP

    Vue$3.prototype.$updateDataToMP = updateDataToMP
    Vue$3.prototype._initDataToMP = initDataToMP

    Vue$3.prototype.$handleProxyWithVue = handleProxyWithVue

    /*  */

    return Vue$3
})

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=script&lang=js&":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/addContact.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;





































































































var _agreement = _interopRequireDefault(__webpack_require__(/*! ./agreement.vue */ "F:\\dinghui\\app\\components\\agreement.vue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var COUNTSECEND = 60;var _default =

{
  props: {
    addData: {
      type: Object,
      required: true } },


  components: {
    vueagreement: _agreement.default },

  data: function data() {
    return {
      isShow: false,
      type: '',
      productId: '',
      link: '',
      confirmState: 0,
      errorDefault: '',
      error: {
        msg: '',
        type: false },

      errorTimer: null,
      username: '', // 姓名
      idcard: '', // 身份证号码
      mobile: '', // 手机号码
      code: '', // 验证码
      agree: true, // 是否同意协议
      isSave: 1,
      hasSendCode: false,
      isClickCode: false,
      sending: false,
      countNum: COUNTSECEND,
      countTimer: null,
      agreeData: {},
      submiting: false, // 是否在提交中
      blankShow: false,
      clearShow: [],
      clearTimer: null,
      isCardApply: false };

  },
  computed: {
    config: function config() {
      return this.$store.state.config;
    } },

  onShow: function onShow() {var _this = this;
    // 是否处于验证码获取倒计时状态
    if (uni.getStorageInfoSync('addCodeStamp')) {
      var oldtime = uni.getStorageInfoSync('addCodeStamp');
      var nowtime = new Date().getTime();
      var cha = parseInt((nowtime - parseInt(oldtime)) / 1000);
      if (cha < COUNTSECEND) {
        this.sending = true;
        this.countNum = COUNTSECEND - cha;
        this.countTimer = setInterval(function () {
          _this.countNum--;
          if (_this.countNum <= 0) {
            clearInterval(_this.countTimer);
            _this.countNum = COUNTSECEND;
            _this.sending = false;
            _this.isClickCode = false;
          }
        }, 1000);
        this.hasSendCode = true;
      }
    }
  },
  methods: {
    hide: function hide() {
      this.isShow = false;
      this.$emit('close');
    },
    callPhone: function callPhone(num) {
      uni.makePhoneCall({
        phoneNumber: num });

    },
    checkAgree: function checkAgree() {
      this.agree = !this.agree;
    },
    showAgree: function showAgree() {
      this.agreeData = {
        show: true };

    },
    checkSave: function checkSave() {
      if (this.isSave === 0) {
        this.isSave = 1;
      } else {
        this.isSave = 0;
      }
    },
    sendCode: function sendCode() {var _this2 = this;
      if (this.isClickCode) return;
      if (!this.$utils.validatePhone(this.mobile)) {
        this.error = {
          msg: '请输入正确的手机号码',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this2.error = {
            msg: _this2.errorDefault,
            type: false };

        }, 2000);
      } else {
        this.isClickCode = true;
        if (!this.hasSendCode) this.hasSendCode = true;
        this.$http({
          url: this.$apis.phone,
          method: 'POST',
          data: {
            'type': 3,
            'mobile': this.mobile },

          cb: function cb(err, data) {
            if (!err && data.success) {
              _this2.sending = true;
              _this2.countTimer = setInterval(function () {
                _this2.countNum--;
                if (_this2.countNum <= 0) {
                  clearInterval(_this2.countTimer);
                  _this2.countNum = COUNTSECEND;
                  _this2.sending = false;
                  _this2.isClickCode = false;
                }
              }, 1000);
              // 保存发送时间
              uni.setStorageSync('addCodeStamp', new Date().getTime().toString());
            } else {
              _this2.error = {
                msg: data.message,
                type: true };

              clearTimeout(_this2.errorTimer);
              _this2.errorTimer = setTimeout(function () {
                _this2.error = {
                  msg: _this2.errorDefault,
                  type: false };

              }, 2000);
              _this2.sending = false;
              _this2.isClickCode = false;
            }
          } });

      }
    },
    confirm: function confirm() {var _this3 = this;
      if (!this.$utils.validateName(this.username)) {
        this.error = {
          msg: '请输入正确的姓名',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else if (!this.$utils.validateIdCard(this.idcard)) {
        this.error = {
          msg: '请输入正确的身份证号码',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else if (!this.$utils.validatePhone(this.mobile)) {
        this.error = {
          msg: '请输入正确的手机号码',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else if (!this.hasSendCode) {
        this.error = {
          msg: '验证码已失效，请重新发送',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else if (this.code.length <= 0) {
        this.error = {
          msg: '请输入验证码',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else if (!this.agree) {
        this.error = {
          msg: '请阅读并勾选《' + this.$store.state.config.system_nick_name + '用户协议》',
          type: true };

        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(function () {
          _this3.error = {
            msg: _this3.errorDefault,
            type: false };

        }, 2000);
      } else {
        if (this.submiting) return;
        this.confirmState = 1;
      }
    },
    submit: function submit() {var _this4 = this;
      if (this.submiting) return;
      this.submiting = true;
      switch (this.type) {
        case 'xyk':
          if (this.isCardApply) {
            this.$http({
              url: this.$apis.create,
              method: 'POST',
              data: {
                name: this.username,
                id_card: this.idcard,
                mobile: this.mobile,
                verify_code: this.code,
                card_id: this.productId,
                is_save: this.isSave },

              cb: function cb(err, data) {
                if (!err && data.success) {
                  uni.removeStorageSync('addCodeStamp');
                  _this4.hide();
                  _this4.submiting = false;
                  _this4.$emit('success');
                  setTimeout(function () {
                    uni.setStorageSync('webSrc', data.data.apply_link);
                    _this4.$navigateTo({
                      url: '/pages/web/index' });

                  }, 50);
                } else {
                  _this4.error = {
                    msg: data.message ? data.message : '申请失败',
                    type: true };

                  clearTimeout(_this4.errorTimer);
                  _this4.errorTimer = setTimeout(function () {
                    _this4.error = {
                      msg: _this4.errorDefault,
                      type: false };

                  }, 2000);
                  _this4.code = '';
                  _this4.submiting = false;
                  _this4.confirmState = 0;
                }
              } });

          } else {
            this.$http({
              url: this.$apis.create,
              method: 'POST',
              data: {
                name: this.username,
                id_card: this.idcard,
                mobile: this.mobile,
                verify_code: this.code,
                bank_id: this.productId,
                is_save: this.isSave },

              cb: function cb(err, data) {
                if (!err && data.success) {
                  uni.removeStorageSync('addCodeStamp');
                  _this4.hide();
                  _this4.submiting = false;
                  _this4.$emit('success');
                  setTimeout(function () {
                    uni.setStorageSync('webSrc', data.data.apply_link);
                    _this4.$navigateTo({
                      url: '/pages/web/index' });

                  }, 50);
                } else {
                  _this4.error = {
                    msg: data.message ? data.message : '申请失败',
                    type: true };

                  clearTimeout(_this4.errorTimer);
                  _this4.errorTimer = setTimeout(function () {
                    _this4.error = {
                      msg: _this4.errorDefault,
                      type: false };

                  }, 2000);
                  _this4.code = '';
                  _this4.submiting = false;
                  _this4.confirmState = 0;
                }
              } });

          }
          break;
        case 'bx':
          this.$http({
            url: this.$apis.insuranceOrder,
            method: 'POST',
            data: {
              name: this.username,
              id_card: this.idcard,
              mobile: this.mobile,
              verify_code: this.code,
              id: this.productId,
              is_save: this.isSave },

            cb: function cb(err, data) {
              if (!err && data.success) {
                uni.removeStorageSync('addCodeStamp');
                _this4.hide();
                _this4.submiting = false;
                _this4.$emit('success');
                setTimeout(function () {
                  uni.setStorageSync('webSrc', _this4.link ? _this4.link : data.data.apply_link);
                  _this4.$navigateTo({
                    url: '/pages/web/index' });

                }, 50);
              } else {
                _this4.error = {
                  msg: data.message ? data.message : '申请失败',
                  type: true };

                clearTimeout(_this4.errorTimer);
                _this4.errorTimer = setTimeout(function () {
                  _this4.error = {
                    msg: _this4.errorDefault,
                    type: false };

                }, 2000);
                _this4.code = '';
                _this4.submiting = false;
                _this4.confirmState = 0;
              }
            } });

          break;
        case 'dk':
          this.$http({
            url: this.$apis.loanOrder,
            method: 'POST',
            data: {
              name: this.username,
              id_card: this.idcard,
              mobile: this.mobile,
              verify_code: this.code,
              id: this.productId,
              is_save: this.isSave },

            cb: function cb(err, data) {
              if (!err && data.success) {
                uni.removeStorageSync('addCodeStamp');
                _this4.hide();
                _this4.submiting = false;
                _this4.$emit('success');
                setTimeout(function () {
                  uni.setStorageSync('webSrc', _this4.link ? _this4.link : data.data.apply_link);
                  _this4.$navigateTo({
                    url: '/pages/web/index' });

                }, 50);
              } else {
                _this4.error = {
                  msg: data.message ? data.message : '申请失败',
                  type: true };

                clearTimeout(_this4.errorTimer);
                _this4.errorTimer = setTimeout(function () {
                  _this4.error = {
                    msg: _this4.errorDefault,
                    type: false };

                }, 2000);
                _this4.code = '';
                _this4.submiting = false;
                _this4.confirmState = 0;
              }
            } });

          break;}

    } },

  watch: {
    addData: function addData(val) {
      this.isShow = val.show;
      this.type = val.type;
      this.confirmState = val.state;
      this.productId = val.productId;
      this.link = val.link;
      this.username = '';
      this.idcard = '';
      this.mobile = '';
      this.code = '';
      this.agree = true;
      this.isSave = 1;
      this.isCardApply = val.card;
      switch (this.type) {
        case 'xyk':
          this.errorDefault = '请填写申请人信息(必须与信用卡申请列表所填信息一致)';
          break;
        case 'bx':
          this.errorDefault = '请填写投保人信息(必须与保险申请列表所填信息一致)';
          break;
        case 'dk':
          this.errorDefault = '请填写贷款人信息(必须与贷款申请列表所填信息一致)';
          break;}

      this.error = {
        msg: this.errorDefault,
        type: false };

    },
    idcard: function idcard(val) {
      this.idcard = val.replace(/x/g, 'X');
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=script&lang=js&":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/agreement.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _default =









































































































































{
  props: {
    agreeData: {
      type: Object,
      required: true } },


  data: function data() {
    return {
      isShow: false };

  },
  computed: {
    config: function config() {
      return this.$store.state.config;
    } },

  methods: {
    confirm: function confirm() {
      this.isShow = false;
    } },

  watch: {
    agreeData: function agreeData(val) {
      this.isShow = val.show;
    } } };exports.default = _default;

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=script&lang=js&":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/contact.vue?vue&type=script&lang=js& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;














































var _agreement = _interopRequireDefault(__webpack_require__(/*! ./agreement.vue */ "F:\\dinghui\\app\\components\\agreement.vue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

{
  props: {
    contactData: {
      type: Object,
      required: true } },


  components: {
    vueagreement: _agreement.default },

  data: function data() {
    return {
      isShow: false,
      type: '',
      productId: '',
      link: '',
      lists: [], // 申请人列表
      agree: true, // 是否同意协议
      chooseIndex: -1, // 当前选择申请人
      deleteIndex: 0,
      deleting: false,
      submiting: false,
      agreeData: {},
      isCardApply: false };

  },
  computed: {
    config: function config() {
      return this.$store.state.config;
    },
    disabled: function disabled() {
      return this.lists.length <= 0 || !this.agree || this.chooseIndex === -1;
    } },

  methods: {
    hide: function hide() {
      this.isShow = false;
      this.$emit('close');
    },
    addContact: function addContact() {
      this.hide();
      this.$emit('add');
    },
    choose: function choose(n) {
      if (this.chooseIndex === n) {
        this.chooseIndex = -1;
      } else {
        this.chooseIndex = n;
      }
    },
    checkAgree: function checkAgree() {
      this.agree = !this.agree;
    },
    showAgree: function showAgree() {
      this.agreeData = {
        show: true };

    },
    getLIsts: function getLIsts(b) {var _this = this;
      this.$http({
        url: this.$apis.contactList,
        method: 'GET',
        data: null,
        cb: function cb(err, data) {
          if (!err && data.success && data.data.data.length > 0) {
            _this.lists = data.data.data;
          } else {
            _this.addContact();
          }
        } });

    },
    deletePop: function deletePop(n) {var _this2 = this;
      this.deleteIndex = n;
      uni.showModal({
        title: '提示',
        content: "'\u60A8\u786E\u5B9A\u8981\u5220\u9664\u7533\u8BF7\u4EBA ".concat(this.lists[this.deleteIndex].name, " \u5417\uFF1F'"),
        success: function success(res) {
          if (res.confirm) {
            if (_this2.deleting) return;
            _this2.deleting = true;
            _this2.$http({
              url: _this2.$apis.contactDelete,
              method: 'DELETE',
              data: {
                id: _this2.lists[_this2.deleteIndex].id },

              cb: function cb(err, data) {
                if (!err && data.success) {
                  _this2.getLIsts(false);
                } else {
                  uni.showToast({
                    title: data.message ? data.message : '删除成功',
                    icon: 'none' });

                }
                _this2.deleting = false;
              } });

          }
        } });

    },
    checkInfo: function checkInfo() {
      if (this.disabled || this.submiting) return;
      this.submit();
    },
    submit: function submit() {var _this3 = this;
      if (this.submiting || !this.type) return;
      this.submiting = true;
      switch (this.type) {
        case 'xyk':
          if (this.isCardApply) {
            this.$http({
              url: this.$apis.createContact,
              method: 'POST',
              data: {
                id: this.lists[this.chooseIndex].id,
                card_id: this.productId },

              cb: function cb(err, data) {
                if (!err && data.success) {
                  _this3.hide();
                  _this3.submiting = false;
                  _this3.$emit('success');
                  setTimeout(function () {
                    uni.setStorageSync('webSrc', data.data.apply_link);
                    _this3.$navigateTo({
                      url: '/pages/web/index' });

                  }, 50);
                } else {
                  uni.showToast({
                    title: data && data.message ? data.message : '申请失败',
                    icon: 'none' });

                  _this3.submiting = false;
                }
              } });

          } else {
            this.$http({
              url: this.$apis.createContact,
              method: 'POST',
              data: {
                id: this.lists[this.chooseIndex].id,
                bank_id: this.productId },

              cb: function cb(err, data) {
                if (!err && data.success) {
                  _this3.hide();
                  _this3.submiting = false;
                  _this3.$emit('success');
                  setTimeout(function () {
                    uni.setStorageSync('webSrc', data.data.apply_link);
                    _this3.$navigateTo({
                      url: '/pages/web/index' });

                  }, 50);
                } else {
                  uni.showToast({
                    title: data && data.message ? data.message : '申请失败',
                    icon: 'none' });

                  _this3.submiting = false;
                }
              } });

          }
          break;
        case 'bx':
          this.$http({
            url: this.$apis.insuranceOrder,
            method: 'POST',
            data: {
              contact_id: this.lists[this.chooseIndex].id,
              id: this.productId },

            cb: function cb(err, data) {
              if (!err && data.success) {
                _this3.hide();
                _this3.submiting = false;
                _this3.$emit('success');
                setTimeout(function () {
                  uni.setStorageSync('webSrc', _this3.link);
                  _this3.$navigateTo({
                    url: '/pages/web/index' });

                }, 50);
              } else {
                uni.showToast({
                  title: data && data.message ? data.message : '申请失败',
                  icon: 'none' });

                _this3.submiting = false;
              }
            } });

          break;
        case 'dk':
          this.$http({
            url: this.$apis.loanOrder,
            method: 'POST',
            data: {
              contact_id: this.lists[this.chooseIndex].id,
              id: this.productId },

            cb: function cb(err, data) {
              if (!err && data.success) {
                _this3.hide();
                _this3.submiting = false;
                _this3.$emit('success');
                setTimeout(function () {
                  uni.setStorageSync('webSrc', _this3.link);
                  _this3.$navigateTo({
                    url: '/pages/web/index' });

                }, 50);
              } else {
                uni.showToast({
                  title: data && data.message ? data.message : '申请失败',
                  icon: 'none' });

                _this3.submiting = false;
              }
            } });

          break;}

    } },

  watch: {
    contactData: function contactData(val) {
      this.isShow = val.show;
      this.type = val.type;
      this.productId = val.productId;
      this.link = val.link;
      this.chooseIndex = val.index;
      this.isCardApply = val.card;
      if (this.isShow) {
        this.getLIsts(true);
      }
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=script&lang=js&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/poster.vue?vue&type=script&lang=js& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;





















var _qrcodeMin = _interopRequireDefault(__webpack_require__(/*! ../common/qrcode.min.js */ "F:\\dinghui\\app\\common\\qrcode.min.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

{
  props: {
    posterData: {
      type: Object,
      required: true } },


  data: function data() {
    return {
      isShow: false,
      code: '',
      shareUrl: '',
      bgImg: '',
      type: {
        name: 2,
        way: 2 },

      qrcodeSrc: '',
      resSrc: '',
      downloading: false,
      shareFriending: false };

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

  methods: {
    hide: function hide() {
      this.isShow = false;
    },
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
    produceImg: function produceImg(cb) {var _this2 = this;
      var _this = this;
      var context = uni.createCanvasContext('canvas', this);
      context.clearRect(0, 0, 1080, 1920);
      context.drawImage(this.bgImg, 0, 0, 1080, 1920);
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
                _this2.reqing = false;
                uni.showToast({
                  title: err,
                  icon: 'none' });

                _this.hide();
              },
              complete: function complete() {
                uni.hideLoading();
              } });

          });
        }, 100);
      });
    },
    savaImg: function savaImg() {var _this3 = this;
      var _this = this;
      if (_this.isLoad) return;
      if (_this.reqing) {
        uni.showToast({
          title: this.produceMsg,
          icon: 'none' });

        return false;
      }
      if (!this.resSrc) {
        _this.qrcode(_this.shareUrl, function (res) {
          _this3.qrcodeSrc = res;
          _this.produceImg(function (base) {
            _this.resSrc = base;
          });
        });
      }
    },
    download: function download() {var _this4 = this;
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
          _this4.downloading = false;
        } });

    },
    shareFriend: function shareFriend() {var _this5 = this;
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
              imageUrl: _this5.resSrc,
              success: function success(res) {
                console.log(res);
              },
              fail: function fail(err) {
                uni.showToast({
                  title: err.errMsg,
                  icon: 'none' });

              },
              complete: function complete() {
                _this5.shareFriending = false;
              } });

          } else {
            uni.showToast({
              title: '分享失败，未检测到微信',
              icon: 'none' });

            _this5.shareFriending = false;
          }
        },
        fail: function fail() {
          uni.showToast({
            title: '分享失败，再稍后再试',
            icon: 'none' });

          _this5.shareFriending = false;
        } });

    } },

  watch: {
    posterData: function posterData(val) {var _this6 = this;
      this.isShow = val.show;
      if (this.code !== val.code) {
        this.code = val.code;
        this.shareUrl = val.url;
        if (this.isShow) {
          uni.showLoading({
            title: '正在生成海报',
            mask: true });

          uni.downloadFile({
            url: this.$store.state.config.background_img,
            success: function success(res) {
              if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
                _this6.bgImg = res.tempFilePath;
                _this6.savaImg();
              } else {
                uni.hideLoading();
                _this6.reqing = false;
                uni.showToast({
                  title: '海报生成失败，请稍后再试',
                  icon: 'none' });

                _this.hide();
              }
            },
            fail: function fail() {
              uni.hideLoading();
              _this6.reqing = false;
              uni.showToast({
                title: '海报生成失败，请稍后再试',
                icon: 'none' });

              _this.hide();
            } });

        }
      }
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/relation.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _default =

















































































{
  props: {
    relationData: {
      type: Object,
      required: true } },


  data: function data() {
    return {
      isShow: false };

  },
  computed: {
    config: function config() {
      return this.$store.state.config;
    } },

  methods: {
    hide: function hide() {
      this.isShow = false;
      this.$emit('close');
    } },

  watch: {
    relationData: function relationData(val) {
      this.isShow = val.show;
    } } };exports.default = _default;

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=script&lang=js&":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/rewardRule.vue?vue&type=script&lang=js& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _default =


























































































{
  name: 'rewardRule',
  props: {
    rewardData: {
      type: Object,
      required: true } },


  data: function data() {
    return {
      isShow: false,
      total: 0,
      conditionTitle: '',
      conditionDec: '',
      type: 0,
      name: 'bk',
      frPercent: 4 // 贷款分成
    };
  },
  computed: {
    role: function role() {
      return this.$store.state.userInfo.role;
    },
    config: function config() {
      return this.$store.state.config;
    },
    btnText: function btnText() {
      if (this.name === 'bk') {
        return '去办卡';
      } else if (this.name === 'bx') {
        return '去投保';
      } else if (this.name === 'dk') {
        return '去贷款';
      }
    },
    percent: function percent() {
      var arr = [0, 0, 0, 0];
      arr[0] = parseFloat(this.config.earning_main_ordinary);
      arr[1] = parseFloat(this.config.earning_main_banker);
      arr[2] = parseFloat(this.config.earning_main_banker_advance);
      arr[3] = parseFloat(this.config.earning_main_banker_chief);
      return arr;
    } },

  methods: {
    hide: function hide() {
      this.isShow = false;
      this.$emit('closeRule');
    },
    gotoAgent: function gotoAgent() {
      this.isShow = false;
      this.$navigateTo({
        url: '/pages/mine/agent' });

    },
    gotoBanker: function gotoBanker() {
      this.isShow = false;
      this.$navigateTo({
        url: '/pages/index/member' });

    },
    gotoCreate: function gotoCreate() {
      this.isShow = false;
      this.$emit('gotoCreate');
    } },

  watch: {
    rewardData: function rewardData(val) {
      this.isShow = val.show;
      if (val.total.toString().indexOf('万') !== -1) {
        this.total = parseFloat(val.total) * 10000;
      } else {
        this.total = parseFloat(val.total);
      }
      this.conditionTitle = val.conditionTitle;
      this.conditionDec = val.conditionDec;
      this.type = val.type || 0;
      this.name = val.name || 'bk';
      this.frPercent = val.frPercent || 4;
    } } };exports.default = _default;

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/credit/poster.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;





















var _qrcodeMin = _interopRequireDefault(__webpack_require__(/*! ../../common/qrcode.min.js */ "F:\\dinghui\\app\\common\\qrcode.min.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

{
  props: {
    posterData: {
      type: Object,
      required: true } },


  data: function data() {
    return {
      isShow: false,
      code: '',
      posterUrl: '',
      shareUrl: '',
      bgImg: '',
      type: {
        name: 2,
        way: 2 },

      qrcodeSrc: '',
      resSrc: '',
      downloading: false,
      shareFriending: false };

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

  methods: {
    hide: function hide() {
      this.isShow = false;
    },
    returnBg: function returnBg(code) {
      if (code) {
        return this.posterUrl;
      } else {
        return this.$store.state.config.background_img;
      }
    },
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
    produceImg: function produceImg(cb) {var _this2 = this;
      var _this = this;
      var context = uni.createCanvasContext('canvas', this);
      context.clearRect(0, 0, 1080, 1920);
      context.drawImage(this.bgImg, 0, 0, 1080, 1920);
      context.draw(true, function () {
        context.save();
        context.beginPath();
        context.arc(150, 1155, 50, 0, 2 * Math.PI);
        context.clip();
        context.drawImage(_this.userInfo.avatar_url ? _this.userInfo.avatar_url : _this.defaultAvatar, 100, 1105, 100, 100);
        context.restore();
        setTimeout(function () {
          context.draw(true, function () {
            context.drawImage(_this.qrcodeSrc, 230, 1463, 230, 230);
            setTimeout(function () {
              context.draw(true, function () {
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
                        _this2.reqing = false;
                        uni.showToast({
                          title: err,
                          icon: 'none' });

                        _this.hide();
                      },
                      complete: function complete() {
                        uni.hideLoading();
                      } });

                  });
                }, 100);
              });
            }, 50);
          });
        }, 50);
      });
    },
    savaImg: function savaImg() {var _this3 = this;
      var _this = this;
      if (_this.isLoad) return;
      if (_this.reqing) {
        uni.showToast({
          title: '正在生成海报...',
          icon: 'none' });

        return false;
      }
      if (!this.resSrc) {
        _this.qrcode(_this.shareUrl, function (res) {
          _this3.qrcodeSrc = res;
          _this.produceImg(function (base) {
            _this.resSrc = base;
          });
        });
      }
    },
    download: function download() {var _this4 = this;
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
          _this4.downloading = false;
        } });

    },
    shareFriend: function shareFriend() {var _this5 = this;
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
              imageUrl: _this5.resSrc,
              success: function success(res) {
                console.log(res);
              },
              fail: function fail(err) {
                uni.showToast({
                  title: err.errMsg,
                  icon: 'none' });

              },
              complete: function complete() {
                _this5.shareFriending = false;
              } });

          } else {
            uni.showToast({
              title: '分享失败，未检测到微信',
              icon: 'none' });

            _this5.shareFriending = false;
          }
        },
        fail: function fail() {
          uni.showToast({
            title: '分享失败，再稍后再试',
            icon: 'none' });

          _this5.shareFriending = false;
        } });

    } },

  watch: {
    posterData: function posterData(val) {var _this6 = this;
      this.isShow = val.show;
      if (this.code !== val.code) {
        this.code = val.code;
        this.shareUrl = val.url;
        this.posterUrl = val.posterUrl;
        if (this.isShow) {
          uni.showLoading({
            title: '正在生成海报',
            mask: true });

          uni.downloadFile({
            url: this.returnBg(this.code),
            success: function success(res) {
              if (res.tempFilePath.indexOf('.png') !== -1 || res.tempFilePath.indexOf('.png') !== -1) {
                _this6.bgImg = res.tempFilePath;
                _this6.savaImg();
              } else {
                uni.hideLoading();
                _this6.reqing = false;
                uni.showToast({
                  title: '海报生成失败，请稍后再试',
                  icon: 'none' });

                _this6.hide();
              }
            },
            fail: function fail() {
              uni.hideLoading();
              _this6.reqing = false;
              uni.showToast({
                title: '海报生成失败，请稍后再试',
                icon: 'none' });

              _this6.hide();
            } });

        }
      }
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=script&lang=js&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/invite/poster.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;






















var _qrcodeMin = _interopRequireDefault(__webpack_require__(/*! ../../common/qrcode.min.js */ "F:\\dinghui\\app\\common\\qrcode.min.js"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

{
  props: {
    posterData: {
      type: Object,
      required: true } },


  data: function data() {
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
      shareFriending: false };

  },
  computed: {
    config: function config() {
      return this.$store.state.config;
    },
    userInfo: function userInfo() {
      return this.$store.state.userInfo;
    },
    defaultAvatar: function defaultAvatar() {
      return '../../static/images/avatar.png';
    },
    userAvatar: function userAvatar() {
      return this.userInfo.avatar_url ? this.userInfo.avatar_url : this.defaultAvatar;
    },
    qrcodeLogo: function qrcodeLogo() {
      return '../../static/images/invite/poster-ewm-logo.png';
    },
    qrcodeBg1: function qrcodeBg1() {
      return '../../static/images/invite/poster-ewm-1.png';
    },
    qrcodeBg2: function qrcodeBg2() {
      return '../../static/images/invite/poster-ewm-2.png';
    },
    posterLine: function posterLine() {
      return '../../static/images/invite/poster-line.png';
    } },

  methods: {
    hide: function hide() {
      this.isShow = false;
    },
    returnBg: function returnBg(num) {
      return '../../static/images/invite/poster-bg-' + num + '.png';
    },
    returnTitle: function returnTitle(num) {
      return '../../static/images/invite/poster-t-' + num + '.png';
    },
    // 生成二维码
    createQrcode: function createQrcode(url, w, cb) {
      this.canvasSize = w;
      (0, _qrcodeMin.default)({
        width: w,
        height: w,
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
    loadImageCb: function loadImageCb(e) {
      this.loadIndex++;
      if (this.loadIndex < this.loadArr.length) {
        this.loadImageSrc = this.loadArr[this.loadIndex];
      } else {
        this.produceImg();
      }
    },
    createLoadArr: function createLoadArr() {
      var _this = this;
      this.loadArr = [];
      this.loadIndex = 0;
      switch (_this.type) {
        case 1:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 2:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 3:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 4:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 5:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 6:
          this.loadArr = [_this.returnBg(1), _this.returnTitle(_this.type)];
          break;
        case 7:
          this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)];
          break;
        case 8:
          this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)];
          break;
        case 9:
          this.loadArr = [_this.returnBg(2), _this.returnTitle(_this.type)];
          break;}

      this.loadImageSrc = this.loadArr[this.loadIndex];
    },
    produceImg: function produceImg() {
      var _this = this;
      var context = uni.createCanvasContext('canvas', this);
      context.clearRect(0, 0, 1080, 1920);
      context.setTextBaseline('top');
      context.draw(false, function () {
        switch (_this.type) {
          case 1:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 758, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.save();
                        context.beginPath();
                        context.arc(191, 500, 60, 0, 2 * Math.PI);
                        context.clip();
                        context.drawImage(_this.userAvatar, 131, 440, 120, 120);
                        context.restore();
                        setTimeout(function () {
                          context.draw(true, function () {
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#333';
                            context.fillText('我是', 271, 465);
                            context.fillStyle = '#D2A100';
                            context.fillText(_this.userInfo.username, 390, 465);
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '“能赚钱的公众号，我也关注了。”',
                                color: '#616586',
                                size: 50 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 630 });

                            context.font = 'normal 45px PingFangSC';
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '长按识别，或',
                                color: '#4A90E2',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1402 });

                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '搜索公众号',
                                color: '#4A90E2',
                                size: 45 },

                              {
                                str: '“' + _this.config.gzh_number + '”',
                                color: '#E9B325',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1465 });

                            setTimeout(function () {
                              context.draw(true, function () {
                                _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, function (res) {
                                  _this.qrcodeSrc = res;
                                  context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498);
                                  setTimeout(function () {
                                    context.draw(true, function () {
                                      context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424);
                                      setTimeout(function () {
                                        context.draw(true, function () {
                                          context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100);
                                          setTimeout(function () {
                                            context.draw(true, function () {
                                              uni.canvasToTempFilePath({
                                                canvasId: 'canvas',
                                                destWidth: 1080,
                                                destHeight: 1920,
                                                success: function success(res) {
                                                  _this.resSrc = res.tempFilePath;
                                                },
                                                fail: function fail(err) {
                                                  _this.reqing = false;
                                                  uni.showToast({
                                                    title: err,
                                                    icon: 'none' });

                                                  _this.hide();
                                                },
                                                complete: function complete() {
                                                  uni.hideLoading();
                                                } });

                                            });
                                          }, 30);
                                        });
                                      }, 30);
                                    });
                                  }, 30);
                                });
                              });
                            }, 30);
                          });
                        }, 30);
                      });
                    });
                  });
                }, 30);
              });
            }, 30);
            break;
          case 2:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 758, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        _this.$http({
                          url: _this.$apis.sfProfile,
                          method: 'GET',
                          data: {
                            id: '' },

                          cb: function cb(err, data) {
                            if (!err && data.success) {
                              context.save();
                              context.beginPath();
                              context.arc(191, 500, 60, 0, 2 * Math.PI);
                              context.clip();
                              _this.userAvatar = data.data.avatar_url ? data.data.avatar_url : _this.defaultAvatar;
                              context.drawImage(_this.userAvatar, 131, 440, 120, 120);
                              context.restore();
                              setTimeout(function () {
                                context.draw(true, function () {
                                  context.font = 'normal 50px PingFangSC';
                                  context.fillStyle = '#333';
                                  context.fillText('我是', 271, 465);
                                  context.fillStyle = '#D2A100';
                                  context.fillText(data.data.username ? data.data.username : _this.userInfo.username, 390, 465);
                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '“我锁了',
                                      color: '#616586',
                                      size: 50 },

                                    {
                                      str: data.data.invite_num + '个',
                                      color: '#D2A100',
                                      size: 50 },

                                    {
                                      str: '好友粉丝，他们共',
                                      color: '#616586',
                                      size: 50 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 595 });

                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '领了',
                                      color: '#616586',
                                      size: 50 },

                                    {
                                      str: data.data.red_envelop_amount + '元',
                                      color: '#D2A100',
                                      size: 50 },

                                    {
                                      str: '”',
                                      color: '#616586',
                                      size: 50 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 667 });

                                  context.font = 'normal 45px PingFangSC';
                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '长按识别，进入免费',
                                      color: '#4A90E2',
                                      size: 45 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 1402 });

                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '发红包页面',
                                      color: '#4A90E2',
                                      size: 45 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 1465 });

                                  _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, function (res) {
                                    _this.qrcodeSrc = res;
                                    context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498);
                                    setTimeout(function () {
                                      context.draw(true, function () {
                                        context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424);
                                        setTimeout(function () {
                                          context.draw(true, function () {
                                            context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100);
                                            setTimeout(function () {
                                              context.draw(true, function () {
                                                uni.canvasToTempFilePath({
                                                  canvasId: 'canvas',
                                                  destWidth: 1080,
                                                  destHeight: 1920,
                                                  success: function success(res) {
                                                    _this.resSrc = res.tempFilePath;
                                                  },
                                                  fail: function fail(err) {
                                                    _this.reqing = false;
                                                    uni.showToast({
                                                      title: err,
                                                      icon: 'none' });

                                                    _this.hide();
                                                  },
                                                  complete: function complete() {
                                                    uni.hideLoading();
                                                  } });

                                              });
                                            }, 30);
                                          });
                                        }, 30);
                                      });
                                    }, 30);
                                  });
                                });
                              }, 30);
                            } else {
                              context.save();
                              context.beginPath();
                              context.arc(191, 500, 60, 0, 2 * Math.PI);
                              context.clip();
                              context.drawImage(_this.userAvatar, 131, 440, 120, 120);
                              context.restore();
                              setTimeout(function () {
                                context.draw(true, function () {
                                  context.font = 'normal 50px PingFangSC';
                                  context.fillStyle = '#333';
                                  context.fillText('我是', 271, 465);
                                  context.fillStyle = '#D2A100';
                                  context.fillText(_this.userInfo.username, 390, 465);
                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '“我锁了',
                                      color: '#616586',
                                      size: 50 },

                                    {
                                      str: '120个',
                                      color: '#D2A100',
                                      size: 50 },

                                    {
                                      str: '好友粉丝，他们共',
                                      color: '#616586',
                                      size: 50 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 595 });

                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '领了',
                                      color: '#616586',
                                      size: 50 },

                                    {
                                      str: '658元',
                                      color: '#D2A100',
                                      size: 50 },

                                    {
                                      str: '”',
                                      color: '#616586',
                                      size: 50 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 665 });

                                  context.font = 'normal 45px PingFangSC';
                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '长按识别，进入免费',
                                      color: '#4A90E2',
                                      size: 45 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 1402 });

                                  _this.drawDiffText({
                                    context: context,
                                    text: [
                                    {
                                      str: '发红包页面',
                                      color: '#4A90E2',
                                      size: 45 }],


                                    letterSpacing: 0,
                                    width: 1080,
                                    y: 1465 });

                                  _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, function (res) {
                                    _this.qrcodeSrc = res;
                                    context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498);
                                    setTimeout(function () {
                                      context.draw(true, function () {
                                        context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424);
                                        setTimeout(function () {
                                          context.draw(true, function () {
                                            context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100);
                                            setTimeout(function () {
                                              context.draw(true, function () {
                                                uni.canvasToTempFilePath({
                                                  canvasId: 'canvas',
                                                  destWidth: 1080,
                                                  destHeight: 1920,
                                                  success: function success(res) {
                                                    _this.resSrc = res.tempFilePath;
                                                  },
                                                  fail: function fail(err) {
                                                    _this.reqing = false;
                                                    uni.showToast({
                                                      title: err,
                                                      icon: 'none' });

                                                    _this.hide();
                                                  },
                                                  complete: function complete() {
                                                    uni.hideLoading();
                                                  } });

                                              });
                                            }, 30);
                                          });
                                        }, 30);
                                      });
                                    }, 30);
                                  });
                                });
                              }, 30);
                            }
                          } });

                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 3:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 758, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.save();
                        context.beginPath();
                        context.arc(191, 500, 60, 0, 2 * Math.PI);
                        context.clip();
                        context.drawImage(_this.userAvatar, 131, 440, 120, 120);
                        context.restore();
                        setTimeout(function () {
                          context.draw(true, function () {
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#333';
                            context.fillText('我是', 271, 465);
                            context.fillStyle = '#D2A100';
                            context.fillText(_this.userInfo.username, 390, 465);
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '“高额秒批速来！”',
                                color: '#616586',
                                size: 50 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 630 });

                            context.font = 'normal 45px PingFangSC';
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '长按识别，进入信用卡',
                                color: '#4A90E2',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1402 });

                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '快速申请通道',
                                color: '#4A90E2',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1465 });

                            _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, function (res) {
                              _this.qrcodeSrc = res;
                              context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498);
                              setTimeout(function () {
                                context.draw(true, function () {
                                  context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424);
                                  setTimeout(function () {
                                    context.draw(true, function () {
                                      context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100);
                                      setTimeout(function () {
                                        context.draw(true, function () {
                                          uni.canvasToTempFilePath({
                                            canvasId: 'canvas',
                                            destWidth: 1080,
                                            destHeight: 1920,
                                            success: function success(res) {
                                              _this.resSrc = res.tempFilePath;
                                            },
                                            fail: function fail(err) {
                                              _this.reqing = false;
                                              uni.showToast({
                                                title: err,
                                                icon: 'none' });

                                              _this.hide();
                                            },
                                            complete: function complete() {
                                              uni.hideLoading();
                                            } });

                                        });
                                      }, 30);
                                    });
                                  }, 30);
                                });
                              }, 30);
                            });
                          });
                        }, 30);
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 4:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 758, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.save();
                        context.beginPath();
                        context.arc(191, 500, 60, 0, 2 * Math.PI);
                        context.clip();
                        context.drawImage(_this.userAvatar, 131, 440, 120, 120);
                        context.restore();
                        setTimeout(function () {
                          context.draw(true, function () {
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#333';
                            context.fillText('我是', 271, 465);
                            context.fillStyle = '#D2A100';
                            context.fillText(_this.userInfo.username, 390, 465);
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '“',
                                color: '#616586',
                                size: 50 },

                              {
                                str: _this.config.system_name,
                                color: '#D2A100',
                                size: 50 },

                              {
                                str: '，',
                                color: '#616586',
                                size: 50 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 595 });

                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '一个赚钱的平台，推荐给你！”',
                                color: '#616586',
                                size: 50 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 665 });

                            context.font = 'normal 45px PingFangSC';
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '长按识别，获取',
                                color: '#4A90E2',
                                size: 45 },

                              {
                                str: _this.config.system_nick_name,
                                color: '#E9B325',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1402 });

                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '升级通道',
                                color: '#4A90E2',
                                size: 45 }],


                              letterSpacing: 0,
                              width: 1080,
                              y: 1465 });

                            _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 424, function (res) {
                              _this.qrcodeSrc = res;
                              context.drawImage(_this.qrcodeBg1, 290, 858, 500, 498);
                              setTimeout(function () {
                                context.draw(true, function () {
                                  context.drawImage(_this.qrcodeSrc, 328, 895, 424, 424);
                                  setTimeout(function () {
                                    context.draw(true, function () {
                                      context.drawImage(_this.qrcodeLogo, 490, 1057, 100, 100);
                                      setTimeout(function () {
                                        context.draw(true, function () {
                                          uni.canvasToTempFilePath({
                                            canvasId: 'canvas',
                                            destWidth: 1080,
                                            destHeight: 1920,
                                            success: function success(res) {
                                              _this.resSrc = res.tempFilePath;
                                            },
                                            fail: function fail(err) {
                                              _this.reqing = false;
                                              uni.showToast({
                                                title: err,
                                                icon: 'none' });

                                              _this.hide();
                                            },
                                            complete: function complete() {
                                              uni.hideLoading();
                                            } });

                                        });
                                      }, 30);
                                    });
                                  }, 30);
                                });
                              }, 30);
                            });
                          });
                        }, 30);
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 5:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 1219, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.save();
                        context.beginPath();
                        context.arc(178, 528, 60, 0, 2 * Math.PI);
                        context.clip();
                        context.drawImage(_this.userAvatar, 118, 468, 120, 120);
                        context.restore();
                        setTimeout(function () {
                          context.draw(true, function () {
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#333';
                            context.fillText('我是', 267, 468);
                            context.fillStyle = '#D2A100';
                            context.fillText(_this.userInfo.username, 386, 468);
                            context.font = 'normal 45px PingFangSC';
                            context.fillStyle = '#616586';
                            context.fillText('“本月有米兔收益前3名！”', 267, 538);
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#4A90E2';
                            context.fillText('长按识别二维码', 481, 1352);
                            _this.drawDiffText({
                              context: context,
                              text: [
                              {
                                str: '回',
                                color: '#4A90E2',
                                size: 50 },

                              {
                                str: _this.config.system_nick_name,
                                color: '#E9B325',
                                size: 50 },

                              {
                                str: '看看',
                                color: '#4A90E2',
                                size: 50 }],


                              letterSpacing: 0,
                              width: 1080,
                              x: 481,
                              y: 1435 });

                            _this.$http({
                              url: _this.$apis.monthTop,
                              method: 'GET',
                              data: null,
                              cb: function cb(err, data) {
                                if (!err && data.success) {
                                  var y = 629;
                                  data.data.forEach(function (item, index) {
                                    context.drawImage('../../static/images/invite/poster-m-' + (index + 1) + '.png', 133, y + 58, 60, 85);
                                    context.draw(true);
                                    context.drawImage(item.img ? item.img : _this.defaultAvatar, 243, y + 40, 120, 120);
                                    context.draw(true);
                                    context.font = 'normal 45px PingFangSC';
                                    context.fillStyle = '#333';
                                    context.fillText(item.name, 415, y + 73);
                                    context.setTextAlign('right');
                                    context.font = 'normal 60px PingFangSC';
                                    context.fillStyle = '#D2A100';
                                    context.fillText('￥' + item.amount, 954, y + 65);
                                    context.setTextAlign('left');
                                    if (index < 2) {
                                      context.moveTo(95, y + 200);
                                      context.lineTo(981, y + 200);
                                      context.lineWidth = 5;
                                      context.strokeStyle = '#f1f1f1';
                                      context.stroke();
                                    }
                                    y += 201;
                                  });
                                }
                                _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 234, function (res) {
                                  _this.qrcodeSrc = res;
                                  context.drawImage(_this.qrcodeBg2, 153, 1289, 280, 279);
                                  setTimeout(function () {
                                    context.draw(true, function () {
                                      context.drawImage(_this.qrcodeSrc, 176, 1312, 234, 234);
                                      setTimeout(function () {
                                        context.draw(true, function () {
                                          context.drawImage(_this.qrcodeLogo, 261, 1397, 62, 62);
                                          setTimeout(function () {
                                            context.draw(true, function () {
                                              uni.canvasToTempFilePath({
                                                canvasId: 'canvas',
                                                destWidth: 1080,
                                                destHeight: 1920,
                                                success: function success(res) {
                                                  _this.resSrc = res.tempFilePath;
                                                },
                                                fail: function fail(err) {
                                                  _this.reqing = false;
                                                  uni.showToast({
                                                    title: err,
                                                    icon: 'none' });

                                                  _this.hide();
                                                },
                                                complete: function complete() {
                                                  uni.hideLoading();
                                                } });

                                            });
                                          }, 30);
                                        });
                                      }, 30);
                                    });
                                  }, 30);
                                });
                              } });

                          });
                        }, 30);
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 6:
            _this.bgImg = _this.returnBg(1);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 0, 1080, 372);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.drawImage(_this.posterLine, 0, 1219, 1080, 59);
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.save();
                        context.beginPath();
                        context.arc(178, 528, 60, 0, 2 * Math.PI);
                        context.clip();
                        context.drawImage(_this.userAvatar, 118, 468, 120, 120);
                        context.restore();
                        setTimeout(function () {
                          context.draw(true, function () {
                            context.setTextAlign('left');
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#333';
                            context.fillText('我是', 267, 468);
                            context.fillStyle = '#D2A100';
                            context.fillText(_this.userInfo.username, 386, 468);
                            context.font = 'normal 45px PingFangSC';
                            context.fillStyle = '#616586';
                            context.fillText('“ 你的账号里还有钱，可以提现', 233, 538);
                            context.fillText('到微信钱包哦。”', 267, 601);
                            context.font = 'normal 50px PingFangSC';
                            context.fillStyle = '#4A90E2';
                            context.fillText('长按识别二维码', 481, 1352);
                            context.fillText('立即查看', 481, 1435);
                            context.drawImage('../../static/images/invite/poster-b.png', 425, 729, 230, 230);
                            setTimeout(function () {
                              context.draw(true, function () {
                                _this.$http({
                                  url: _this.$apis.sfProfile,
                                  method: 'GET',
                                  data: {
                                    id: _this.uid },

                                  cb: function cb(err, data) {
                                    if (!err && data.success) {
                                      context.setTextAlign('center');
                                      context.font = 'normal 46px PingFangSC';
                                      context.fillStyle = '#333';
                                      context.fillText('账户余额', 540, 998);
                                      context.font = 'normal 90px PingFangSC';
                                      context.fillText('￥' + data.data.balance + '元', 540, 1076);
                                    }
                                    _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 234, function (res) {
                                      _this.qrcodeSrc = res;
                                      context.drawImage(_this.qrcodeBg2, 153, 1289, 280, 279);
                                      setTimeout(function () {
                                        context.draw(true, function () {
                                          context.drawImage(_this.qrcodeSrc, 176, 1312, 234, 234);
                                          setTimeout(function () {
                                            context.draw(true, function () {
                                              context.drawImage(_this.qrcodeLogo, 261, 1397, 62, 62);
                                              setTimeout(function () {
                                                context.draw(true, function () {
                                                  uni.canvasToTempFilePath({
                                                    canvasId: 'canvas',
                                                    destWidth: 1080,
                                                    destHeight: 1920,
                                                    success: function success(res) {
                                                      _this.resSrc = res.tempFilePath;
                                                    },
                                                    fail: function fail(err) {
                                                      _this.reqing = false;
                                                      uni.showToast({
                                                        title: err,
                                                        icon: 'none' });

                                                      _this.hide();
                                                    },
                                                    complete: function complete() {
                                                      uni.hideLoading();
                                                    } });

                                                });
                                              }, 30);
                                            });
                                          }, 30);
                                        });
                                      }, 30);
                                    });
                                  } });

                              });
                            }, 30);
                          });
                        }, 30);
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 7:
            _this.bgImg = _this.returnBg(2);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.save();
                    context.beginPath();
                    context.arc(150, 164, 60, 0, 2 * Math.PI);
                    context.clip();
                    context.drawImage(_this.userAvatar, 90, 104, 120, 120);
                    context.restore();
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.font = 'normal 50px PingFangSC';
                        context.fillStyle = '#fff';
                        context.fillText('我是', 250, 129);
                        context.fillText(_this.userInfo.username, 369, 129);
                        context.font = 'bold 50px PingFangSC';
                        _this.drawDiffText({
                          context: context,
                          text: [
                          {
                            str: '8.80',
                            color: '#FBE39C',
                            size: 150 },

                          {
                            str: '元',
                            color: '#FBE39C',
                            size: 80 }],


                          letterSpacing: 0,
                          width: 1080,
                          y: 701 });

                        _this.$http({
                          url: _this.$apis.newestRedId,
                          method: 'GET',
                          data: null,
                          cb: function cb(err, data) {
                            if (!err && data.success) {
                              _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, function (res) {
                                _this.qrcodeSrc = res;
                                context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452);
                                setTimeout(function () {
                                  context.draw(true, function () {
                                    context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118);
                                    setTimeout(function () {
                                      context.draw(true, function () {
                                        uni.canvasToTempFilePath({
                                          canvasId: 'canvas',
                                          destWidth: 1080,
                                          destHeight: 1920,
                                          success: function success(res) {
                                            _this.resSrc = res.tempFilePath;
                                          },
                                          fail: function fail(err) {
                                            _this.reqing = false;
                                            uni.showToast({
                                              title: err,
                                              icon: 'none' });

                                          },
                                          complete: function complete() {
                                            uni.hideLoading();
                                          } });

                                      });
                                    }, 30);
                                  });
                                }, 30);
                              });
                            } else {
                              uni.showToast({
                                title: '海报生成失败，请稍后再试',
                                icon: 'none' });

                              _this.reqing = false;
                              uni.hideLoading();
                              _this.hide();
                            }
                          } });

                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 8:
            _this.bgImg = _this.returnBg(2);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.save();
                    context.beginPath();
                    context.arc(150, 164, 60, 0, 2 * Math.PI);
                    context.clip();
                    context.drawImage(_this.userAvatar, 90, 104, 120, 120);
                    context.restore();
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.font = 'normal 50px PingFangSC';
                        context.fillStyle = '#fff';
                        context.fillText('我是', 250, 129);
                        context.fillText(_this.userInfo.username, 369, 129);
                        context.setTextAlign('center');
                        context.font = 'normal 40px PingFangSC';
                        context.fillStyle = '#FBE39C';
                        context.fillText('我在这里领了88元红包', 540, 649);
                        context.setTextAlign('left');
                        context.font = 'bold 50px PingFangSC';
                        _this.drawDiffText({
                          context: context,
                          text: [
                          {
                            str: '88',
                            color: '#FBE39C',
                            size: 150 },

                          {
                            str: '元',
                            color: '#FBE39C',
                            size: 80 }],


                          letterSpacing: 0,
                          width: 1080,
                          y: 739 });

                        _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, function (res) {
                          _this.qrcodeSrc = res;
                          context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452);
                          setTimeout(function () {
                            context.draw(true, function () {
                              context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118);
                              setTimeout(function () {
                                context.draw(true, function () {
                                  uni.canvasToTempFilePath({
                                    canvasId: 'canvas',
                                    destWidth: 1080,
                                    destHeight: 1920,
                                    success: function success(res) {
                                      _this.resSrc = res.tempFilePath;
                                    },
                                    fail: function fail(err) {
                                      _this.reqing = false;
                                      uni.showToast({
                                        title: err,
                                        icon: 'none' });

                                    },
                                    complete: function complete() {
                                      uni.hideLoading();
                                    } });

                                });
                              }, 30);
                            });
                          }, 30);
                        });
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;
          case 9:
            _this.bgImg = _this.returnBg(2);
            context.drawImage(_this.bgImg, 0, 0, 1080, 1920);
            setTimeout(function () {
              context.draw(true, function () {
                context.drawImage(_this.returnTitle(_this.type), 0, 250, 1080, 300);
                setTimeout(function () {
                  context.draw(true, function () {
                    context.save();
                    context.beginPath();
                    context.arc(150, 164, 60, 0, 2 * Math.PI);
                    context.clip();
                    context.drawImage(_this.userAvatar, 90, 104, 120, 120);
                    context.restore();
                    setTimeout(function () {
                      context.draw(true, function () {
                        context.font = 'normal 50px PingFangSC';
                        context.fillStyle = '#fff';
                        context.fillText('我是', 250, 129);
                        context.fillText(_this.userInfo.username, 369, 129);
                        context.setTextAlign('center');
                        context.font = 'normal 40px PingFangSC';
                        context.fillStyle = '#FBE39C';
                        context.fillText('您有168元红包待领取', 540, 649);
                        context.setTextAlign('left');
                        context.font = 'bold 50px PingFangSC';
                        _this.drawDiffText({
                          context: context,
                          text: [
                          {
                            str: '168',
                            color: '#FBE39C',
                            size: 150 },

                          {
                            str: '元',
                            color: '#FBE39C',
                            size: 80 }],


                          letterSpacing: 0,
                          width: 1080,
                          y: 739 });

                        _this.createQrcode(_this.$constant.shareUrl + '?pid=' + _this.userInfo.id, 452, function (res) {
                          _this.qrcodeSrc = res;
                          context.drawImage(_this.qrcodeSrc, 314, 1101, 452, 452);
                          setTimeout(function () {
                            context.draw(true, function () {
                              context.drawImage(_this.qrcodeLogo, 481, 1268, 118, 118);
                              setTimeout(function () {
                                context.draw(true, function () {
                                  uni.canvasToTempFilePath({
                                    canvasId: 'canvas',
                                    destWidth: 1080,
                                    destHeight: 1920,
                                    success: function success(res) {
                                      _this.resSrc = res.tempFilePath;
                                    },
                                    fail: function fail(err) {
                                      _this.reqing = false;
                                      uni.showToast({
                                        title: err,
                                        icon: 'none' });

                                    },
                                    complete: function complete() {
                                      uni.hideLoading();
                                    } });

                                });
                              }, 30);
                            });
                          }, 30);
                        });
                      });
                    }, 30);
                  });
                }, 30);
              });
            }, 30);
            break;}

      });
    },
    drawDiffText: function drawDiffText(obj) {
      var context = obj.context;
      if (obj.text.length <= 1 && obj.letterSpacing === 0) {
        var align = context.textAlign || 'left';
        context.setTextAlign('center');
        context.fillStyle = obj.text[0].color;
        context.fillText(obj.text[0].str, obj.width / 2, obj.y);
        context.setTextAlign(align);
      } else {
        var allText = '';
        var originWidth = 0;
        var maxSize = 0;
        obj.text.forEach(function (item) {
          allText += item.str;
          context.setFontSize(item.size);
          maxSize = item.size > maxSize ? item.size : maxSize;
          originWidth += context.measureText(item.str).width;
        });
        originWidth += obj.letterSpacing * (allText.split('').length - 1);
        var start = obj.x ? obj.x : (obj.width - originWidth) / 2;
        obj.text.forEach(function (item) {
          item.x = start;
          item.str.split('').forEach(function (sitem) {
            context.setFontSize(item.size);
            context.fillStyle = item.color;
            context.fillText(sitem, item.x, item.size >= maxSize ? obj.y : obj.y + (maxSize - item.size));
            item.x += context.measureText(sitem).width + obj.letterSpacing;
          });
          start += context.measureText(item.str).width + item.str.split('').length * obj.letterSpacing;
        });
      }
    },
    download: function download() {var _this2 = this;
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
          _this2.downloading = false;
        } });

    },
    shareFriend: function shareFriend() {var _this3 = this;
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
              imageUrl: _this3.resSrc,
              success: function success(res) {
                console.log(res);
              },
              fail: function fail(err) {
                uni.showToast({
                  title: err.errMsg,
                  icon: 'none' });

              },
              complete: function complete() {
                _this3.shareFriending = false;
              } });

          } else {
            uni.showToast({
              title: '分享失败，未检测到微信',
              icon: 'none' });

            _this3.shareFriending = false;
          }
        },
        fail: function fail() {
          uni.showToast({
            title: '分享失败，再稍后再试',
            icon: 'none' });

          _this3.shareFriending = false;
        } });

    } },

  watch: {
    posterData: function posterData(val) {
      this.isShow = val.show;
      if (this.uid !== val.uid && this.type !== val.type) {
        this.type = val.type || 8;
        this.uid = val.uid || this.userInfo.id;
        this.resSrc = '';
        this.qrcodeSrc = '';
        if (this.isShow) {
          uni.showLoading({
            title: '正在生成海报',
            mask: true });

          this.createLoadArr();
        }
      }
    } } };exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ "./node_modules/@dcloudio/uni-mp-weixin/dist/index.js")["default"]))

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true&":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true&":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true&":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true&":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/credit/poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true&":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/invite/poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact&":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop add-contact"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "229be834-0" },
        on: { click: _vm.hide }
      }),
      _c(
        "view",
        {
          staticClass: "pop-con",
          class: { "pop-con-1": _vm.confirmState === 0 }
        },
        [
          _c(
            "view",
            { staticClass: "box" },
            [
              _c(
                "scroll-view",
                { staticClass: "scroll-view", attrs: { "scroll-y": "" } },
                [
                  _c("view", { staticClass: "write" }, [
                    _vm.type === "xyk"
                      ? _c("view", { staticClass: "pop-title uni-box" }, [
                          _vm._v(
                            _vm._s(_vm.confirmState === 0 ? "填写" : "确认") +
                              "信用卡申请人"
                          )
                        ])
                      : _vm.type === "bx"
                        ? _c("view", { staticClass: "pop-title uni-box" }, [
                            _vm._v(
                              _vm._s(_vm.confirmState === 0 ? "填写" : "确认") +
                                "投保申请人"
                            )
                          ])
                        : _vm.type === "dk"
                          ? _c("view", { staticClass: "pop-title uni-box" }, [
                              _vm._v(
                                _vm._s(
                                  _vm.confirmState === 0 ? "填写" : "确认"
                                ) + "贷款申请人"
                              )
                            ])
                          : _vm._e(),
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.confirmState === 0,
                            expression: "confirmState === 0"
                          }
                        ],
                        staticClass: "msg uni-box",
                        class: { err: _vm.error.type }
                      },
                      [_vm._v(_vm._s(_vm.error.msg))]
                    ),
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.confirmState === 0,
                            expression: "confirmState === 0"
                          }
                        ],
                        staticClass: "lists"
                      },
                      [
                        _c("view", { staticClass: "item uni-flex uni-box" }, [
                          _c("image", {
                            staticClass: "input-icon",
                            attrs: { src: "/static/images/icon/icon-user.png" }
                          }),
                          _c(
                            "view",
                            { staticClass: "input-box uni-flex-item uni-pr" },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.username,
                                    expression: "username"
                                  }
                                ],
                                attrs: {
                                  type: "text",
                                  placeholder: "请输入姓名",
                                  "placeholder-class": "input-placeholder",
                                  "confirm-type": "next",
                                  eventid: "229be834-1"
                                },
                                domProps: { value: _vm.username },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.username = $event.target.value
                                  }
                                }
                              })
                            ]
                          )
                        ]),
                        _c("view", { staticClass: "item uni-flex uni-box" }, [
                          _c("image", {
                            staticClass: "input-icon",
                            attrs: {
                              src: "/static/images/icon/icon-idcard.png"
                            }
                          }),
                          _c(
                            "view",
                            { staticClass: "input-box uni-flex-item uni-pr" },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.idcard,
                                    expression: "idcard"
                                  }
                                ],
                                attrs: {
                                  type: "idcard",
                                  placeholder: "请输入身份证号码",
                                  "placeholder-class": "input-placeholder",
                                  "confirm-type": "next",
                                  eventid: "229be834-2"
                                },
                                domProps: { value: _vm.idcard },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.idcard = $event.target.value
                                  }
                                }
                              })
                            ]
                          )
                        ]),
                        _c(
                          "view",
                          { staticClass: "item uni-flex uni-box uni-pr" },
                          [
                            _c("image", {
                              staticClass: "input-icon",
                              attrs: {
                                src: "/static/images/icon/icon-phone.png"
                              }
                            }),
                            _c(
                              "view",
                              {
                                staticClass:
                                  "input-box input-box-code uni-flex-item uni-pr"
                              },
                              [
                                _c("input", {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.mobile,
                                      expression: "mobile"
                                    }
                                  ],
                                  attrs: {
                                    type: "number",
                                    placeholder: "请输入手机号码",
                                    "placeholder-class": "input-placeholder",
                                    "confirm-type": "next",
                                    eventid: "229be834-3"
                                  },
                                  domProps: { value: _vm.mobile },
                                  on: {
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.mobile = $event.target.value
                                    }
                                  }
                                })
                              ]
                            ),
                            _c(
                              "view",
                              { staticClass: "send-code uni-pa uni-txc" },
                              [
                                _c(
                                  "view",
                                  {
                                    directives: [
                                      {
                                        name: "show",
                                        rawName: "v-show",
                                        value: !_vm.sending,
                                        expression: "!sending"
                                      }
                                    ],
                                    staticClass: "btn uni-box uni-txc",
                                    class: { disabled: _vm.isClickCode },
                                    attrs: { eventid: "229be834-4" },
                                    on: { click: _vm.sendCode }
                                  },
                                  [_vm._v("发送验证码")]
                                ),
                                _c(
                                  "view",
                                  {
                                    directives: [
                                      {
                                        name: "show",
                                        rawName: "v-show",
                                        value: _vm.sending,
                                        expression: "sending"
                                      }
                                    ],
                                    staticClass: "text"
                                  },
                                  [_vm._v(_vm._s(_vm.countNum) + "s")]
                                )
                              ]
                            )
                          ]
                        ),
                        _c("view", { staticClass: "item uni-flex uni-box" }, [
                          _c("image", {
                            staticClass: "input-icon",
                            attrs: { src: "/static/images/icon/icon-code.png" }
                          }),
                          _c(
                            "view",
                            { staticClass: "input-box uni-flex-item uni-pr" },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.code,
                                    expression: "code"
                                  }
                                ],
                                attrs: {
                                  type: "text",
                                  placeholder: "请输入验证码",
                                  "placeholder-class": "input-placeholder",
                                  "confirm-type": "done",
                                  eventid: "229be834-5"
                                },
                                domProps: { value: _vm.code },
                                on: {
                                  confirm: _vm.confirm,
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.code = $event.target.value
                                  }
                                }
                              })
                            ]
                          )
                        ])
                      ]
                    ),
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.confirmState === 0,
                            expression: "confirmState === 0"
                          }
                        ],
                        staticClass: "agreement uni-flex uni-box"
                      },
                      [
                        _c("image", {
                          attrs: {
                            src: _vm.agree
                              ? "/static/images/icon/icon-check-2.png"
                              : "/static/images/icon/icon-check-1.png",
                            eventid: "229be834-6"
                          },
                          on: { click: _vm.checkAgree }
                        }),
                        _vm._v("本人已阅读并同意"),
                        _c(
                          "view",
                          {
                            attrs: { eventid: "229be834-7" },
                            on: { click: _vm.showAgree }
                          },
                          [
                            _vm._v(
                              "《" +
                                _vm._s(_vm.config.system_nick_name) +
                                "用户协议》"
                            )
                          ]
                        )
                      ]
                    ),
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.confirmState === 1,
                            expression: "confirmState === 1"
                          }
                        ],
                        staticClass: "info"
                      },
                      [
                        _c("view", { staticClass: "uni-flex" }, [
                          _c("text", { staticClass: "name" }, [
                            _vm._v("姓名：")
                          ]),
                          _c("text", { staticClass: "uni-flex-item" }, [
                            _vm._v(_vm._s(_vm.username))
                          ])
                        ]),
                        _c("view", { staticClass: "uni-flex" }, [
                          _c("text", { staticClass: "name" }, [
                            _vm._v("身份证：")
                          ]),
                          _c("text", { staticClass: "uni-flex-item" }, [
                            _vm._v(_vm._s(_vm.idcard))
                          ])
                        ]),
                        _c("view", { staticClass: "uni-flex" }, [
                          _c("text", { staticClass: "name" }, [
                            _vm._v("手机号：")
                          ]),
                          _c("text", { staticClass: "uni-flex-item" }, [
                            _vm._v(_vm._s(_vm.mobile))
                          ])
                        ])
                      ]
                    ),
                    _c(
                      "view",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.confirmState === 1,
                            expression: "confirmState === 1"
                          }
                        ],
                        staticClass: "agreement uni-flex uni-box",
                        attrs: { eventid: "229be834-9" },
                        on: { click: _vm.checkSave }
                      },
                      [
                        _c("image", {
                          attrs: {
                            src:
                              _vm.isSave === 1
                                ? "/static/images/icon/icon-check-2.png"
                                : "/static/images/icon/icon-check-1.png",
                            eventid: "229be834-8"
                          },
                          on: { click: _vm.checkAgree }
                        }),
                        _vm._v("保存申请人信息")
                      ]
                    ),
                    _vm.type === "xyk"
                      ? _c("view", { staticClass: "tips" }, [
                          _c("view", [_vm._v("温馨提示")]),
                          _c("view", [
                            _vm._v(
                              "1、请确保申请人信息真实并与银行申请填写的信息一致，否则申请成功后，将无法获取相关奖励。"
                            )
                          ]),
                          _c("view", [
                            _vm._v(
                              "2、请确保申请人未持有本银行信用卡，或在其他平台机构同时申请信用卡，将会影响您的会员信用。"
                            )
                          ]),
                          _c("view", [
                            _vm._v(
                              "3、在" +
                                _vm._s(_vm.config.system_name) +
                                "申请信用卡不收取任何费用，如有向您索要手续费情况，请拨及时打电话"
                            ),
                            _c(
                              "text",
                              {
                                attrs: { eventid: "229be834-10" },
                                on: {
                                  click: function($event) {
                                    _vm.callPhone(_vm.config.kf_phone)
                                  }
                                }
                              },
                              [_vm._v(_vm._s(_vm.config.kf_phone))]
                            ),
                            _vm._v(
                              "向" + _vm._s(_vm.config.system_name) + "举报。"
                            )
                          ])
                        ])
                      : _vm.type === "bx"
                        ? _c("view", { staticClass: "tips" }, [
                            _c("view", [_vm._v("温馨提示")]),
                            _c("view", [
                              _vm._v(
                                "1、请确保申请人信息真实并与保险申请填写的信息一致，否则申请成功后，将无法获取相关奖励。"
                              )
                            ]),
                            _c("view", [
                              _vm._v(
                                "2、在" +
                                  _vm._s(_vm.config.system_name) +
                                  "购买保险平台不收取任何额外费用，如有向您索要手续费情况，请拨及时打电话"
                              ),
                              _c(
                                "text",
                                {
                                  attrs: { eventid: "229be834-11" },
                                  on: {
                                    click: function($event) {
                                      _vm.callPhone(_vm.config.kf_phone)
                                    }
                                  }
                                },
                                [_vm._v(_vm._s(_vm.config.kf_phone))]
                              ),
                              _vm._v(
                                "向" + _vm._s(_vm.config.system_name) + "举报。"
                              )
                            ])
                          ])
                        : _vm.type === "dk"
                          ? _c("view", { staticClass: "tips" }, [
                              _c("view", [_vm._v("温馨提示")]),
                              _c("view", [
                                _vm._v(
                                  "1、请确保申请人信息真实并与贷款申请填写的信息一致，否则申请成功后，将无法获取相关奖励。"
                                )
                              ]),
                              _c("view", [
                                _vm._v(
                                  "2、在" +
                                    _vm._s(_vm.config.system_name) +
                                    "购买贷款平台不收取任何额外费用，如有向您索要手续费情况，请拨及时打电话"
                                ),
                                _c(
                                  "text",
                                  {
                                    attrs: { eventid: "229be834-12" },
                                    on: {
                                      click: function($event) {
                                        _vm.callPhone(_vm.config.kf_phone)
                                      }
                                    }
                                  },
                                  [_vm._v(_vm._s(_vm.config.kf_phone))]
                                ),
                                _vm._v(
                                  "向" +
                                    _vm._s(_vm.config.system_name) +
                                    "举报。"
                                )
                              ])
                            ])
                          : _vm._e()
                  ])
                ]
              )
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
                  value: _vm.confirmState === 0,
                  expression: "confirmState === 0"
                }
              ],
              staticClass: "operation uni-flex uni-box"
            },
            [
              _c(
                "view",
                { staticClass: "right uni-flex uni-flex-item uni-txc uni-ovh" },
                [
                  _c(
                    "view",
                    {
                      staticClass: "uni-flex-item gray",
                      attrs: { eventid: "229be834-13" },
                      on: { click: _vm.hide }
                    },
                    [_vm._v("取消")]
                  ),
                  _c(
                    "view",
                    {
                      staticClass: "uni-flex-item",
                      attrs: { eventid: "229be834-14" },
                      on: { click: _vm.confirm }
                    },
                    [_vm._v("立即申请")]
                  )
                ]
              )
            ]
          ),
          _c(
            "view",
            {
              directives: [
                {
                  name: "show",
                  rawName: "v-show",
                  value: _vm.confirmState === 1,
                  expression: "confirmState === 1"
                }
              ],
              staticClass: "operation uni-flex uni-box"
            },
            [
              _c(
                "view",
                { staticClass: "right uni-flex uni-flex-item uni-txc uni-ovh" },
                [
                  _c(
                    "view",
                    {
                      staticClass: "uni-flex-item gray",
                      attrs: { eventid: "229be834-15" },
                      on: {
                        click: function($event) {
                          _vm.confirmState = 0
                        }
                      }
                    },
                    [_vm._v("取消")]
                  ),
                  _c(
                    "view",
                    {
                      staticClass: "uni-flex-item",
                      class: { disabled: _vm.submiting },
                      attrs: { eventid: "229be834-16" },
                      on: { click: _vm.submit }
                    },
                    [_vm._v("确定")]
                  )
                ]
              )
            ]
          )
        ]
      ),
      _c("vueagreement", {
        attrs: { agreeData: _vm.agreeData, mpcomid: "229be834-0" }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement&":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "ffcbd916-0" },
        on: { click: _vm.confirm }
      }),
      _c("view", { staticClass: "pop-con" }, [
        _c(
          "view",
          { staticClass: "box uni-box" },
          [
            _c("view", { staticClass: "pop-title" }, [
              _vm._v(_vm._s(_vm.config.system_name) + "用户服务协议")
            ]),
            _c(
              "scroll-view",
              { staticClass: "scroll-view", attrs: { "scroll-y": "" } },
              [
                _c("view", { staticClass: "tag" }, [
                  _vm._v(
                    _vm._s(_vm.config.system_name) +
                      "由" +
                      _vm._s(_vm.config.company_name) +
                      "及其关联实体(以下简称“我们”、“" +
                      _vm._s(_vm.config.system_nick_name) +
                      "”)运营，我们依照以下服务协议向您提供本服务协议涉及的相关服务。请您使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务前仔细阅读本服务协议。 您只有完全同意所有服务协议，才能成为" +
                      _vm._s(_vm.config.system_nick_name) +
                      '的用户（"用户"）并使用相应服务。您在使用' +
                      _vm._s(_vm.config.system_nick_name) +
                      '服务前点击"'
                  ),
                  _c("text", [
                    _vm._v(
                      "同意《" +
                        _vm._s(_vm.config.system_nick_name) +
                        "用户服务协议》"
                    )
                  ]),
                  _vm._v(
                    '"按钮即表示您已仔细阅读并明确同意遵守本服务协议以及经参引而并入其中的所有条款、政策以及指南，并受该等规则的约束（合称"本服务协议"）。我们可能根据法律法规的要求或业务运营的需要，对本服务协议不时进行修改。除非另有规定，否则任何变更或修改将在修订内容于' +
                      _vm._s(_vm.config.system_nick_name) +
                      "发布之时立即生效，您对" +
                      _vm._s(_vm.config.system_nick_name) +
                      "的使用、继续使用将表明您接受此等变更或修改。如果您不同意本服务协议（包括我们可能不定时对其或其中引述的其他规则所进行的任何修改）的全部规定，则请勿使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "提供的所有服务。"
                  )
                ]),
                _c("view", { staticClass: "tag" }, [
                  _vm._v(
                    "为了便于您了解适用于您使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "的条款和条件，我们将在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "上发布我们对本服务协议的修改，您应不时地审阅本服务协议以及经参引而并入其中的其他规则。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [_vm._v("一、服务内容")]),
                _c("view", [
                  _vm._v(
                    _vm._s(_vm.config.system_nick_name) +
                      "的具体服务内容由我们根据实际情况提供并不时更新，包括但不限于信息、图片、文章、评论、链接等，我们将定期或不定期根据用户的意愿以电子邮件、短信、电话或站内信等方式为用户提供活动信息，并向用户提供相应服务。我们对提供的服务拥有最终解释权。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "1.1 " +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务仅供个人用户使用。除我们书面同意，您或其他用户均不得将" +
                      _vm._s(_vm.config.system_nick_name) +
                      "上的任何信息用于商业目的。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "1.2 您使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务时所需的相关的设备以及网络资源等（如个人电脑及其他与接入互联网或移动网有关的装置）及所需的费用（如为接入互联网而支付的电话费及上网费）均由您自行负担。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [
                  _vm._v("二、信息提供和隐私保护")
                ]),
                _c("view", [
                  _vm._v(
                    "您在访问、使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "或申请使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务时，必须提供本人真实的个人信息，且您应该根据实际变动情况及时更新个人信息。保护用户隐私是我们的重点原则，我们通过各种技术手段和强化内部管理等办法提供隐私保护服务功能，充分保护您的个人信息安全。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "2.1 " +
                      _vm._s(_vm.config.system_nick_name) +
                      "不负责审核您提供的个人信息的真实性、准确性或完整性，因信息不真实、不准确或不完整而引起的任何问题及其后果，由您自行承担，且您应保证我们免受由此而产生的任何损害或责任。若我们发现您提供的个人信息是虚假、不准确或不完整的，我们有权自行决定终止向您提供服务。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "2.2 您已明确授权，为提供服务、履行协议、解决争议、保障交易安全等目的，我们对您提供的、我们自行收集的及通过第三方收集的您的个人信息、您申请服务时的相关信息、您在使用服务时储存在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "的非公开内容以及您的其他个人资料（以下简称“个人资料”）享有留存、整理加工、使用和披露的权利，具体方式包括但不限于："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "2.3 （1）出于为您提供服务的需要在本网站公示您的个人资料；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（2）由人工或自动程序对您的个人资料进行获取、评估、整理、存储；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（3）使用您的个人资料以改进本网站的设计和推广；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（4）使用您提供的联系方式与您联络并向您传递有关服务和管理方面的信息；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（5）对您的个人资料进行分析整合并向为您提供服务的第三方提供为完成该项服务必要的信息。当为您提供服务的第三方与您电话核实信息时，为保证为您服务的质量，请您同意" +
                        _vm._s(_vm.config.system_nick_name) +
                        "对上述核实电话进行录音。"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（6）在您违反与我们或我们的其他用户签订的协议时，披露您的个人资料及违约事实，将您的违约信息写入黑名单并与必要的第三方共享数据，以供我们及第三方审核、追索之用。"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（7）其他必要的使用及披露您个人资料的情形。您已明确同意本条款不因您终止使用" +
                        _vm._s(_vm.config.system_nick_name) +
                        "服务而失效。如因我们行使本条款项下权利使您遭受损失，我们对该等损失免责。"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（8）使用个人资料 进行申请信用卡进度查询，收集的个人资料与第三方合作机构没有关系（银行、小贷机构等），由平台独立承担数据保密和使用的权利。当使用完查询申卡进度之后，平台将不再使用此条数据。"
                    )
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "为更好地为您提供服务，您同意并授权" +
                      _vm._s(_vm.config.system_nick_name) +
                      "可与其合作的第三方进行联合研究，并可将通过本协议获得的您的信息投入到该等联合研究中。但" +
                      _vm._s(_vm.config.system_nick_name) +
                      "与其合作的第三方在开展上述联合研究前，应要求其合作的第三方对在联合研究中所获取的您的信息予以保密。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "2.4 我们不会向与您无关的第我们不会向与您无关的第三方恶意出售或免费提供您的个人资料，但下列情况除外："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v("2.5 （1）事先获得您的明确授权；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（2）按照相关司法机构或政府主管部门的要求；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（3）以维护我们合法权益之目的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（4）维护社会公众利益；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（5）为了确保" +
                        _vm._s(_vm.config.system_nick_name) +
                        "业务和系统的完整与操作；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（6）符合其他合法要求。")
                  ])
                ]),
                _c("view", { staticClass: "h3" }, [_vm._v("三、使用准则")]),
                _c("view", [
                  _vm._v(
                    "您在使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务过程中，必须遵循国家的相关法律法规，不通过" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发布、复制、上传、散播、分发、存储、创建或以其它方式公开含有以下内容的信息："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v("3.1 （1）反对宪法所确定的基本原则的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（2）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（3）损害国家荣誉和利益的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（4）煽动民族仇恨、民族歧视，破坏民族团结的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（5）破坏国家宗教政策，宣扬邪教和封建迷信的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（6）散布谣言，扰乱社会秩序，破坏社会稳定的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（7）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的、欺诈性的或以其它令人反感的讯息、数据、信息、文本、音乐、声音、照片、图形、代码或其它材料；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（8）侮辱或者诽谤他人，侵害他人合法权益的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（9）其他违反宪法和法律、行政法规或规章制度的；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（10）可能侵犯他人的专利、商标、商业秘密、版权或其它知识产权或专有权利的内容；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（11）假冒任何人或实体或以其它方式歪曲您与任何人或实体之关联性的内容；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（12）未经请求而擅自提供的促销信息、政治活动、广告或意见征集；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（13）任何第三方的私人信息，包括但不限于地址、电话号码、电子邮件地址、身份证号以及信用卡卡号；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（14）病毒、不可靠数据或其它有害的、破坏性的或危害性的文件；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（15）与内容所在的互动区域的话题不相关的内容；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（16）依我们的自行判断，足以令人反感的内容，或者限制或妨碍他人使用或享受互动区域或" +
                        _vm._s(_vm.config.system_nick_name) +
                        "的内容，或者可能使我们或我们关联方或其他用户遭致任何类型损害或责任的内容；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（17）包含法律或行政法规禁止内容的其他内容。")
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "用户不得利用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "的服务从事下列危害互联网信息网络安全的活动："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "3.2 （1）未经允许，进入计算机信息网络或者使用计算机信息网络资源；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（2）未经允许，对计算机信息网络功能进行删除、修改或者增加；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（3）未经允许，对进入计算机信息网络中存储、处理或者传输的数据和应用程序进行删除、修改或者增加；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（4）故意制作、传播计算机病毒等破坏性程序；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（5）其他危害计算机信息网络安全的行为。")
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "我们保留在任何时候为任何理由而不经通知地过滤、移除、筛查或编辑本网站上发布或存储的任何内容的权利，您须自行负责备份和替换在本网站发布或存储的任何内容，成本和费用自理。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "3.3 您须对自己在使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务过程中的行为承担法律责任。若您为限制行为能力或无行为能力者，则您的法定监护人应承担相应的法律责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "3.4 如您的操作影响系统总体稳定性或完整性，我们将暂停或终止您的操作，直到相关问题得到解决。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [_vm._v("四、免责声明")]),
                _c("view", [
                  _vm._v(
                    _vm._s(_vm.config.system_nick_name) +
                      "是一个开放平台，用户将文章或照片等个人资料上传到互联网上，有可能会被其他组织或个人复制、转载、擅改或做其它非法用途，用户必须充分意识此类风险的存在。作为网络服务的提供者，我们对用户在任何论坛、个人主页或其它互动区域提供的任何陈述、声明或内容均不承担责任。您明确同意使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务所存在的风险或产生的一切后果将完全由您自身承担，我们对上述风险或后果不承担任何责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.1 您违反本服务协议、违反道德或法律的，侵犯他人权利（包括但不限于知识产权）的，我们不承担任何责任。同时，我们对任何第三方通过" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发送服务或包含在服务中的任何内容不承担责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.2 对您、其他用户或任何第三方发布、存储或上传的任何内容或由该等内容导致的任何损失或损害，我们不承担责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.3 对任何第三方通过" +
                      _vm._s(_vm.config.system_nick_name) +
                      "可能对您造成的任何错误、中伤、诽谤、诬蔑、不作为、谬误、淫秽、色情或亵渎，我们不承担责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.4 对黑客行为、计算机病毒、或因您保管疏忽致使帐号、密码被他人非法使用、盗用、篡改的或丢失，或由于与本网站链接的其它网站所造成您个人资料的泄露，我们不承担责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.5 如您发现任何非法使用用户帐号或安全漏洞的情况，请立即与我们联系。因任何非" +
                      _vm._s(_vm.config.system_nick_name) +
                      "原因造成的网络服务中断或其他缺陷，我们不承担任何责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.6 我们不保证服务一定能满足您的要求；不保证服务不会中断，也不保证服务的及时性、安全性、准确性。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.7 任何情况下，因使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "而引起或与使用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "有关的而产生的由我们负担的责任总额，无论是基于合同、保证、侵权、产品责任、严格责任或其它理论，均不得超过您因访问或使用本网站而向" +
                      _vm._s(_vm.config.system_nick_name) +
                      "支付的任何报酬（如果有的话）。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "4.8 " +
                      _vm._s(_vm.config.system_nick_name) +
                      "提供免费的推荐信用卡办卡服务和贷款推荐服务，办信用卡、贷款、过程中遇到的任何预先收费均为诈骗行为，请保持警惕避免损失。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [
                  _vm._v("五、服务变更、中断或终止")
                ]),
                _c("view", [
                  _vm._v(
                    "如因升级的需要而需暂停网络服务、或调整服务内容，我们将尽可能在网站上进行通告。由于用户未能及时浏览通告而造成的损失，我们不承担任何责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "5.1 您明确同意，我们保留根据实际情况随时调整" +
                      _vm._s(_vm.config.system_nick_name) +
                      "家提供的服务内容、种类和形式，或自行决定授权第三方向您提供原本我们提供的服务。因业务调整给您或其他用户造成的损失，我们不承担任何责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "5.2同时，我们保留随时变更、中断或终止" +
                      _vm._s(_vm.config.system_nick_name) +
                      "全部或部分服务的权利。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "发生下列任何一种情形，我们有权单方面中断或终止向您提供服务而无需通知您，且无需对您或第三方承担任何责任："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v("5.3 （1）您提供的个人资料不真实；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v("（2）您违反本服务条款；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（3）未经我们书面同意，将" +
                        _vm._s(_vm.config.system_nick_name) +
                        "平台用于商业目的。"
                    )
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "您可随时通知我们终止向您提供服务或直接取消" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务。自您终止或取消服务之日起，我们不再向您承担任何形式的责任。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [
                  _vm._v("六、知识产权及其它权利")
                ]),
                _c("view", [
                  _vm._v(
                    "用户可以充分利用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "平台共享信息。您可以在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发布从" +
                      _vm._s(_vm.config.system_nick_name) +
                      "个人主页或其他网站复制的图片和信息等内容，但这些内容必须属于公共领域或者您拥有以上述使用方式使用该等内容的权利，且您有权对该等内容作出本条款下之授权、同意、认可或承诺。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "6.1 对您在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发布或以其它方式传播的内容，您作如下声明和保证："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v("6.2 （I）对于该等内容，您具有所有权或使用权；")
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（II）该等内容是合法的、真实的、准确的、非误导性的；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（III）使用和发布此等内容或以其它方式传播此等内容不违反本服务条款，也不侵犯任何人或实体的任何权利或造成对任何人或实体的伤害。"
                    )
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "未经相关内容权利人的事先书面同意，您不得擅自复制、传播在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "的该等内容，或将其用于任何商业目的，所有这些资料或资料的任何部分仅可作为个人或非商业用途而保存在某台计算机内。否则，我们及/或权利人将追究您的法律责任。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "6.3 您在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发布或传播的自有内容或具有使用权的内容，您特此同意如下："
                  )
                ]),
                _c("view", { staticClass: "lists" }, [
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "6.4 （1）授予我们使用、复制、修改、改编、翻译、传播、发表此等内容，从此等内容创建派生作品，以及在全世界范围内通过任何媒介（现在已知的或今后发明的）公开展示和表演此等内容的权利；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（2）授予" +
                        _vm._s(_vm.config.system_nick_name) +
                        "及其关联方和再许可人一项权利，可依他们的选择而使用用户有关此等内容而提交的名称；"
                    )
                  ]),
                  _c("view", { staticClass: "item" }, [
                    _vm._v(
                      "（3）授予我们在第三方侵犯您在" +
                        _vm._s(_vm.config.system_nick_name) +
                        "的权益、或您发布在" +
                        _vm._s(_vm.config.system_nick_name) +
                        "的内容情况下，依法追究其责任的权利（但这并非我们的义务）；"
                    )
                  ])
                ]),
                _c("view", [
                  _vm._v(
                    "您在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "公开发布或传播的内容、图片等为非保密信息，我们没有义务将此等信息作为您的保密信息对待。在不限制前述规定的前提下，我们保留以适当的方式使用内容的权利，包括但不限于删除、编辑、更改、不予采纳或拒绝发布。我们无义务就您提交的内容而向您付款。一旦内容已在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "家发布，我们也不保证向您提供对在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "家发布内容进行编辑、删除或作其它修改的机会。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "6.5 如有权利人发现您在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "发表的内容侵犯其权利，并依相关法律、行政法规的规定向我们发出书面通知的，" +
                      _vm._s(_vm.config.system_nick_name) +
                      "有权在不事先通知您的情况下自行移除相关内容，并依法保留相关数据。您同意不因该种移除行为向我们主张任何赔偿，如我们因此遭受任何损失，您应向赔偿我们的损失（包括但不限于赔偿各种费用及律师费）。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "6.6 若您认为您发布第6.6条指向内容并未侵犯其他方的权利，您可以向我们以书面方式说明被移除内容不侵犯其他方权利的书面通知，该书面通知应包含如下内容：您详细的身份证明、住址、联系方式、您认为被移除内容不侵犯其他方权利的证明、被移除内容在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "上的位置以及书面通知内容的真实性声明。我们收到该书面通知后，有权决定是否恢复被移除内容。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "6.7 您特此同意，如果6.7条中的书面通知的陈述失实，您将承担由此造成的全部法律责任，如我们因此遭受任何损失，您应向赔偿我们的损失（包括但不限于赔偿各种费用及律师费）。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [
                  _vm._v("七、推广宣传方面的约定")
                ]),
                _c("view", [
                  _vm._v(
                    "7.1 任何注册会员推广人员不得在转介绍客户时向客户承诺一定可以下卡或承诺一定可以审批多少额度。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "7.2 不得以银行或" +
                      _vm._s(_vm.config.system_nick_name) +
                      "合作方的名义进行任何的推广宣传，如需要以" +
                      _vm._s(_vm.config.system_nick_name) +
                      "合作方的名义进行推广宣传，需提前报备，经书面同意方可进行。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "7.3 本次推广宣传仅限移动互联网、互联网线上推广宣传，在未经允许情况下不得进行任何市场推广宣传。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "7.4 完全知悉" +
                      _vm._s(_vm.config.system_nick_name) +
                      "对网页物料享有完全的知识产权，保证未经同意，不得擅自更改合作银行制作的物料页面内容，亦不得把物料用于本约定之外的任何其他用途，不得有任何侵犯" +
                      _vm._s(_vm.config.system_nick_name) +
                      "知识产权的行为。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "7.5 必须严格按照本协议约定的方式为合作银行宣传推广信用卡，其宣传渠道必须为推广人员自身朋友圈、微信好友、微信群、微博及移动端。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "7.6 不得恶意代替用户包装用户资料或指导用户提供虚假资料进行注册。推广人员仅限推荐引流至平台，由用户自行申请办理。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "如有违反推广宣传方面的约定，" +
                      _vm._s(_vm.config.system_nick_name) +
                      "将有权关闭账号同时保留追回以前有在" +
                      _vm._s(_vm.config.system_nick_name) +
                      "平台获利的收入的权利。"
                  )
                ]),
                _c("view", { staticClass: "h3" }, [_vm._v("八、特别约定")]),
                _c("view", [
                  _vm._v(
                    "您使用本服务的行为若有任何违反国家法律法规或侵犯任何第三方的合法权益的情形时，我们有权直接删除该等违反规定之信息，并可以暂停或终止向您提供服务。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.1 若您利用" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务从事任何违法或侵权行为，由您自行承担全部责任，因此给我们或任何第三方造成任何损失，您应负责全额赔偿，并使我们免受由此产生的任何损害。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.2 您同意我们通过重要页面的公告、通告、电子邮件以及常规信件的形式向您传送与" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务有关的任何通知和通告。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.3 如您有任何有关与" +
                      _vm._s(_vm.config.system_nick_name) +
                      "服务的个人信息保护相关投诉，请您与我们联系，我们将在接到投诉之日起15日内进行答复。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.4 本服务条款之效力、解释、执行均适用中华人民共和国法律。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.5 如就本协议内容或其执行发生任何争议，应尽量友好协商解决；协商不成时，任何一方均可向深圳市咔咔网络有限公司所在地的人民法院提起诉讼。"
                  )
                ]),
                _c("view", [
                  _vm._v(
                    "8.6 本服务条款中的标题仅为方便而设，不影响对于条款本身的解释。本服务条款最终解释权归深圳咔咔网络有限公司所有。"
                  )
                ]),
                _c("view", { staticClass: "h2" }, [
                  _vm._v("请仔细阅读此协议，并完全同意协议内容，无异议。")
                ])
              ]
            )
          ],
          1
        ),
        _c("view", { staticClass: "operation uni-flex uni-box" }, [
          _c(
            "view",
            { staticClass: "right uni-flex uni-flex-item uni-txc uni-ovh" },
            [
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  attrs: { eventid: "ffcbd916-1" },
                  on: { click: _vm.confirm }
                },
                [_vm._v("知道了")]
              )
            ]
          )
        ])
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop contact"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "7c2f444b-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
        _vm.type === "xyk"
          ? _c("view", { staticClass: "pop-title uni-box" }, [
              _vm._v("申请人列表")
            ])
          : _vm.type === "bx"
            ? _c("view", { staticClass: "pop-title uni-box" }, [
                _vm._v("投保人信息")
              ])
            : _vm.type === "dk"
              ? _c("view", { staticClass: "pop-title uni-box" }, [
                  _vm._v("贷款人信息")
                ])
              : _vm._e(),
        _c("view", { staticClass: "add-user uni-flex" }, [
          _c(
            "view",
            {
              staticClass: "uni-flex",
              attrs: { eventid: "7c2f444b-1" },
              on: { click: _vm.addContact }
            },
            [
              _c("image", {
                attrs: { src: "/static/images/icon/icon-add.png" }
              }),
              _vm.type === "xyk"
                ? _c("text", [_vm._v("填写申请人")])
                : _vm.type === "bx"
                  ? _c("text", [_vm._v("填写投保人信息")])
                  : _vm.type === "dk"
                    ? _c("text", [_vm._v("填写贷款人信息")])
                    : _vm._e()
            ]
          )
        ]),
        _c(
          "view",
          { staticClass: "lists" },
          [
            _c(
              "scroll-view",
              { staticClass: "scroll-view", attrs: { "scroll-y": "" } },
              _vm._l(_vm.lists, function(item, index) {
                return _c(
                  "view",
                  {
                    key: item.id,
                    staticClass: "item uni-flex",
                    attrs: { eventid: "7c2f444b-3-" + index },
                    on: {
                      click: function($event) {
                        _vm.choose(index)
                      }
                    }
                  },
                  [
                    _c("image", {
                      staticClass: "dot",
                      attrs: {
                        src:
                          index === _vm.chooseIndex
                            ? "/static/images/icon/icon-dot-2.png"
                            : "/static/images/icon/icon-dot-1.png"
                      }
                    }),
                    _c("view", { staticClass: "info uni-flex-item" }, [
                      _c("view", { staticClass: "uni-flex" }, [
                        _c("text", [_vm._v("姓名：")]),
                        _vm._v(_vm._s(item.name))
                      ]),
                      _c("view", { staticClass: "uni-flex" }, [
                        _c("text", [_vm._v("身份证：")]),
                        _vm._v(_vm._s(item.id_card))
                      ]),
                      _c("view", { staticClass: "uni-flex" }, [
                        _c("text", [_vm._v("手机号：")]),
                        _vm._v(_vm._s(item.mobile))
                      ])
                    ]),
                    _c(
                      "view",
                      {
                        staticClass: "delete",
                        attrs: { eventid: "7c2f444b-2-" + index },
                        on: {
                          click: function($event) {
                            $event.stopPropagation()
                            _vm.deletePop(index)
                          }
                        }
                      },
                      [
                        _c("image", {
                          attrs: { src: "/static/images/icon/icon-delete.png" }
                        })
                      ]
                    )
                  ]
                )
              })
            )
          ],
          1
        ),
        _c("view", { staticClass: "agreement uni-flex uni-box" }, [
          _c("image", {
            attrs: {
              src: _vm.agree
                ? "/static/images/icon/icon-check-2.png"
                : "/static/images/icon/icon-check-1.png",
              eventid: "7c2f444b-4"
            },
            on: { click: _vm.checkAgree }
          }),
          _vm._v("本人已阅读并同意"),
          _c(
            "view",
            { attrs: { eventid: "7c2f444b-5" }, on: { click: _vm.showAgree } },
            [_vm._v("《" + _vm._s(_vm.config.system_nick_name) + "用户协议》")]
          )
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
                  attrs: { eventid: "7c2f444b-6" },
                  on: { click: _vm.hide }
                },
                [_vm._v("取消")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.disabled || _vm.submiting },
                  attrs: { eventid: "7c2f444b-7" },
                  on: { click: _vm.checkInfo }
                },
                [_vm._v("立即申请")]
              )
            ]
          )
        ])
      ]),
      _c("vueagreement", {
        attrs: { agreeData: _vm.agreeData, mpcomid: "7c2f444b-0" }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster&":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop pop-poster"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "09aeabc2-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
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
                  attrs: { eventid: "09aeabc2-1" },
                  on: { click: _vm.hide }
                },
                [_vm._v("关闭")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.downloading },
                  attrs: { eventid: "09aeabc2-2" },
                  on: { click: _vm.download }
                },
                [_vm._v("保存到手机")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.shareFriending },
                  attrs: { eventid: "09aeabc2-3" },
                  on: { click: _vm.shareFriend }
                },
                [_vm._v("分享给好友")]
              )
            ]
          )
        ]),
        _c("canvas", {
          staticClass: "canvas uni-pa",
          attrs: { "canvas-id": "canvas" }
        }),
        _c("canvas", {
          staticClass: "qrcodebox uni-pa",
          attrs: { "canvas-id": "qrcodebox" }
        })
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation&":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation& ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop pop-relation"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "0a7fdf31-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
        _c("view", { staticClass: "intro" }, [
          _vm._m(0),
          _vm._m(1),
          _c("view", { staticClass: "item uni-flex" }, [
            _vm._m(2),
            _vm._m(3),
            _c("view", { staticClass: "col col-3 uni-txc" }, [
              _c("view", {}, [
                _vm._v(_vm._s(_vm.config.earning_main_ordinary * 100) + "%")
              ])
            ])
          ]),
          _c("view", { staticClass: "item uni-flex" }, [
            _vm._m(4),
            _c("view", { staticClass: "col col-2 uni-flex-item" }, [
              _vm._m(5),
              _c("view", {}, [
                _vm._v("方式2:缴纳"),
                _c("text", [_vm._v(_vm._s(_vm.config.agent_deposit3) + "元")])
              ])
            ]),
            _c("view", { staticClass: "col col-3 uni-txc" }, [
              _c("view", {}, [
                _vm._v(_vm._s(_vm.config.earning_main_banker * 100) + "%")
              ])
            ])
          ]),
          _c("view", { staticClass: "item uni-flex" }, [
            _vm._m(6),
            _c("view", { staticClass: "col col-2 uni-flex-item" }, [
              _vm._m(7),
              _c("view", {}, [
                _vm._v("方式2:缴纳"),
                _c("text", [_vm._v(_vm._s(_vm.config.agent_deposit2) + "元")]),
                _vm._v("押金【可退】")
              ])
            ]),
            _c("view", { staticClass: "col col-3 uni-txc" }, [
              _c("view", {}, [
                _vm._v(
                  _vm._s(_vm.config.earning_main_banker_advance * 100) + "%"
                )
              ])
            ])
          ]),
          _c("view", { staticClass: "item uni-flex" }, [
            _vm._m(8),
            _c("view", { staticClass: "col col-2 uni-flex-item" }, [
              _vm._m(9),
              _c("view", {}, [
                _vm._v("方式2:缴纳"),
                _c("text", [_vm._v(_vm._s(_vm.config.agent_deposit) + "元")]),
                _vm._v("押金【可退】")
              ])
            ]),
            _c("view", { staticClass: "col col-3 uni-txc" }, [
              _c("view", {}, [
                _vm._v(_vm._s(_vm.config.earning_main_banker_chief * 100) + "%")
              ])
            ])
          ])
        ]),
        _vm._m(10),
        _c("view", { staticClass: "operation-2" }, [
          _c(
            "view",
            { attrs: { eventid: "0a7fdf31-1" }, on: { click: _vm.hide } },
            [_vm._v("知道了")]
          )
        ])
      ])
    ]
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "tit uni-flex uni-txc" }, [
      _c("view", { staticClass: "col col-1" }, [_vm._v("会员等级")]),
      _c("view", { staticClass: "col col-2 uni-flex-item" }, [
        _vm._v("升级条件")
      ]),
      _c("view", { staticClass: "col col-3" }, [_vm._v("直推业务")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "item uni-flex" }, [
      _c("view", { staticClass: "col col-1 uni-flex" }, [
        _c("view", { staticClass: "agent agent-1 uni-flex" }, [
          _vm._v("临时用户")
        ])
      ]),
      _c("view", { staticClass: "col col-2 uni-flex-item" }, [
        _c("view", {}, [_vm._v("注册即可")])
      ]),
      _c("view", { staticClass: "col col-3 uni-txc" }, [
        _c("view", {}, [_vm._v("无收益")])
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "col col-1 uni-flex" }, [
      _c("view", { staticClass: "agent agent-2 uni-flex" }, [
        _vm._v("普通会员")
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "col col-2 uni-flex-item" }, [
      _c("view", {}, [_vm._v("手机号验证或者手机号登录")])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "col col-1 uni-flex" }, [
      _c("view", { staticClass: "agent agent-3 uni-flex" }, [
        _c("image", {
          attrs: { src: "/static/images/mine/level-1.png", mode: "" }
        }),
        _vm._v("黄金VIP")
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", {}, [
      _vm._v("方式1:成功锁粉"),
      _c("text", [_vm._v("30人")]),
      _vm._v("，邀请"),
      _c("text", [_vm._v("1名")]),
      _vm._v("VIP")
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "col col-1 uni-flex" }, [
      _c("view", { staticClass: "agent agent-4 uni-flex" }, [
        _c("image", {
          attrs: { src: "/static/images/mine/level-2.png", mode: "" }
        }),
        _vm._v("铂金VIP")
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", {}, [
      _vm._v("方式1:成功锁粉"),
      _c("text", [_vm._v("50人")]),
      _vm._v("，邀请"),
      _c("text", [_vm._v("4名")]),
      _vm._v("VIP")
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "col col-1 uni-flex" }, [
      _c("view", { staticClass: "agent agent-5 uni-flex" }, [
        _c("image", {
          attrs: { src: "/static/images/mine/level-3.png", mode: "" }
        }),
        _vm._v("钻石VIP")
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", {}, [
      _vm._v("方式1:成功锁粉"),
      _c("text", [_vm._v("100人")]),
      _vm._v("，邀请"),
      _c("text", [_vm._v("15名")]),
      _vm._v("VIP")
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "tips" }, [
      _c("view", [_vm._v("温馨提示：")]),
      _c("view", [
        _vm._v("1.VIP还可享受下级VIP的"),
        _c("text", [_vm._v("级差收益")]),
        _vm._v("，即你的直推收益减去下级VIP直推收益的差额。")
      ]),
      _c("view", [
        _vm._v("2.如您的下级与您同等级，平台会给出"),
        _c("text", [_vm._v("5%")]),
        _vm._v("的平级收益奖励。")
      ])
    ])
  }
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule&":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/components/rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule& ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop pop-rule"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "4616d280-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
        _c("view", { staticClass: "caption" }, [_vm._v("奖励规则")]),
        _c("view", { staticClass: "state uni-flex" }, [
          _vm.role === 1
            ? _c(
                "view",
                { staticClass: "level" },
                [
                  _vm._v("您当前是："),
                  _c("text", [_vm._v("普通会员")]),
                  _vm._v("，"),
                  _c("br"),
                  _vm._v(
                    "可享受" +
                      _vm._s(_vm.percent[0] * 100 + "%") +
                      "业务佣金奖励。"
                  )
                ],
                1
              )
            : _vm.role === 2
              ? _c(
                  "view",
                  { staticClass: "level" },
                  [
                    _vm._v("您当前是："),
                    _c("text", [_vm._v("黄金VIP")]),
                    _vm._v("，"),
                    _c("br"),
                    _vm._v(
                      "可享受" +
                        _vm._s(_vm.percent[1] * 100 + "%") +
                        "业务佣金奖励。"
                    )
                  ],
                  1
                )
              : _vm.role === 3
                ? _c(
                    "view",
                    { staticClass: "level" },
                    [
                      _vm._v("您当前是："),
                      _c("text", [_vm._v("铂金VIP")]),
                      _vm._v("，"),
                      _c("br"),
                      _vm._v(
                        "可享受" +
                          _vm._s(_vm.percent[2] * 100 + "%") +
                          "业务佣金奖励。"
                      )
                    ],
                    1
                  )
                : _vm.role === 4
                  ? _c(
                      "view",
                      { staticClass: "level" },
                      [
                        _vm._v("您当前是："),
                        _c("text", [_vm._v("钻石VIP")]),
                        _vm._v("，"),
                        _c("br"),
                        _vm._v(
                          "可享受" +
                            _vm._s(_vm.percent[3] * 100 + "%") +
                            "业务佣金奖励。"
                        )
                      ],
                      1
                    )
                  : _vm._e(),
          _vm.role < 4
            ? _c(
                "view",
                {
                  staticClass: "btn uni-txc",
                  attrs: { eventid: "4616d280-1" },
                  on: { click: _vm.gotoBanker }
                },
                [_vm._v("申请升级")]
              )
            : _vm._e()
        ]),
        _c("view", { staticClass: "table-box uni-pr" }, [
          _c("view", { staticClass: "min-caption" }, [_vm._v("直推收益")]),
          _c("view", { staticClass: "lists uni-flex uni-txc" }, [
            _c(
              "view",
              {
                staticClass: "item uni-pr uni-flex uni-column uni-box",
                class: { on: _vm.role === 1 }
              },
              [
                _vm.type === 0
                  ? _c(
                      "view",
                      { staticClass: "num" },
                      [
                        _c("text", [_vm._v("¥")]),
                        _c("toDecima", {
                          attrs: {
                            str: _vm.total * _vm.percent[0],
                            mpcomid: "4616d280-0"
                          }
                        })
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1 || _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "num num-2" },
                      [
                        _c("toDecima", {
                          attrs: {
                            str: _vm.percent[0] * _vm.frPercent,
                            mpcomid: "4616d280-1"
                          }
                        }),
                        _vm._v("%")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("(最高"),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[0] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-2"
                          }
                        }),
                        _vm._v("元)")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("("),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[0] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-3"
                          }
                        }),
                        _vm._v("元起)")
                      ],
                      1
                    )
                  : _vm._e(),
                _c("view", [_vm._v("普通会员")]),
                _vm.role === 1
                  ? _c("view", { staticClass: "sign uni-pa uni-ovh" }, [
                      _c("image", {
                        staticClass: "uni-pa",
                        attrs: { src: "/static/images/icon/icon-sign.png" }
                      })
                    ])
                  : _vm._e()
              ]
            ),
            _c(
              "view",
              {
                staticClass: "item uni-pr uni-flex uni-column uni-box",
                class: { on: _vm.role === 2 }
              },
              [
                _vm.type === 0
                  ? _c(
                      "view",
                      { staticClass: "num" },
                      [
                        _c("text", [_vm._v("¥")]),
                        _c("toDecima", {
                          attrs: {
                            str: _vm.total * _vm.percent[1],
                            mpcomid: "4616d280-4"
                          }
                        })
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1 || _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "num num-2" },
                      [
                        _c("toDecima", {
                          attrs: {
                            str: _vm.percent[1] * _vm.frPercent,
                            mpcomid: "4616d280-5"
                          }
                        }),
                        _vm._v("%")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("(最高"),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[1] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-6"
                          }
                        }),
                        _vm._v("元)")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("("),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[1] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-7"
                          }
                        }),
                        _vm._v("元起)")
                      ],
                      1
                    )
                  : _vm._e(),
                _c("view", [_vm._v("黄金VIP")]),
                _vm.role === 2
                  ? _c("view", { staticClass: "sign uni-pa uni-ovh" }, [
                      _c("image", {
                        staticClass: "uni-pa",
                        attrs: { src: "/static/images/icon/icon-sign.png" }
                      })
                    ])
                  : _vm._e()
              ]
            ),
            _c(
              "view",
              {
                staticClass: "item uni-pr uni-flex uni-column uni-box",
                class: { on: _vm.role === 3 }
              },
              [
                _vm.type === 0
                  ? _c(
                      "view",
                      { staticClass: "num" },
                      [
                        _c("text", [_vm._v("¥")]),
                        _c("toDecima", {
                          attrs: {
                            str: _vm.total * _vm.percent[2],
                            mpcomid: "4616d280-8"
                          }
                        })
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1 || _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "num num-2" },
                      [
                        _c("toDecima", {
                          attrs: {
                            str: _vm.percent[2] * _vm.frPercent,
                            mpcomid: "4616d280-9"
                          }
                        }),
                        _vm._v("%")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("(最高"),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[2] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-10"
                          }
                        }),
                        _vm._v("元)")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("("),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[2] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-11"
                          }
                        }),
                        _vm._v("元起)")
                      ],
                      1
                    )
                  : _vm._e(),
                _c("view", [_vm._v("铂金VIP")]),
                _vm.role === 3
                  ? _c("view", { staticClass: "sign uni-pa uni-ovh" }, [
                      _c("image", {
                        staticClass: "uni-pa",
                        attrs: { src: "/static/images/icon/icon-sign.png" }
                      })
                    ])
                  : _vm._e()
              ]
            ),
            _c(
              "view",
              {
                staticClass: "item uni-pr uni-flex uni-column uni-box",
                class: { on: _vm.role === 4 }
              },
              [
                _vm.type === 0
                  ? _c(
                      "view",
                      { staticClass: "num" },
                      [
                        _c("text", [_vm._v("¥")]),
                        _c("toDecima", {
                          attrs: {
                            str: _vm.total * _vm.percent[3],
                            mpcomid: "4616d280-12"
                          }
                        })
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1 || _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "num num-2" },
                      [
                        _c("toDecima", {
                          attrs: {
                            str: _vm.percent[3] * _vm.frPercent,
                            mpcomid: "4616d280-13"
                          }
                        }),
                        _vm._v("%")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 1
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("(最高"),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[3] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-14"
                          }
                        }),
                        _vm._v("元)")
                      ],
                      1
                    )
                  : _vm._e(),
                _vm.type === 2
                  ? _c(
                      "view",
                      { staticClass: "high" },
                      [
                        _vm._v("("),
                        _c("toDecima", {
                          attrs: {
                            str:
                              (_vm.total * _vm.percent[3] * _vm.frPercent) /
                              100,
                            mpcomid: "4616d280-15"
                          }
                        }),
                        _vm._v("元起)")
                      ],
                      1
                    )
                  : _vm._e(),
                _c("view", [_vm._v("钻石VIP")]),
                _vm.role === 4
                  ? _c("view", { staticClass: "sign uni-pa uni-ovh" }, [
                      _c("image", {
                        staticClass: "uni-pa",
                        attrs: { src: "/static/images/icon/icon-sign.png" }
                      })
                    ])
                  : _vm._e()
              ]
            )
          ])
        ]),
        _c("view", { staticClass: "explain" }, [
          _c("view", { staticClass: "item uni-flex" }, [
            _c("view", { staticClass: "label" }, [_vm._v("结算标准：")]),
            _c("view", { staticClass: "right uni-flex-item" }, [
              _c("view", { staticClass: "tag uni-flex" }, [
                _c("view", { staticClass: "uni-pr uni-box" }, [
                  _vm._v(_vm._s(_vm.conditionTitle))
                ])
              ]),
              _vm._v(_vm._s(_vm.conditionDec))
            ])
          ]),
          _c("view", { staticClass: "item uni-flex" }, [
            _c("view", { staticClass: "label" }, [_vm._v("直推收益：")]),
            _c(
              "view",
              { staticClass: "right uni-flex-item" },
              [
                _vm._v("指自己或旗下临时用户办卡的收益："),
                _c("br"),
                _vm._v("普通会员："),
                _c("text", [_vm._v(_vm._s(_vm.percent[0] * 100) + "%")]),
                _vm._v("；黄金VIP："),
                _c("text", [_vm._v(_vm._s(_vm.percent[1] * 100) + "%")]),
                _vm._v("；"),
                _c("br"),
                _vm._v("铂金VIP："),
                _c("text", [_vm._v(_vm._s(_vm.percent[2] * 100) + "%")]),
                _vm._v("；钻石VIP："),
                _c("text", [_vm._v(_vm._s(_vm.percent[3] * 100) + "%")]),
                _vm._v("。")
              ],
              1
            )
          ]),
          _c("view", { staticClass: "item uni-flex" }, [
            _c("view", { staticClass: "label" }, [_vm._v("间推收益：")]),
            _c(
              "view",
              { staticClass: "right uni-flex-item" },
              [
                _vm._v("指旗下VIP办理业务的间接收益："),
                _c("br"),
                _vm._v("间推收益=自身直推收益比例-下级直推收益比例")
              ],
              1
            )
          ]),
          _vm._m(0)
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
                  attrs: { eventid: "4616d280-2" },
                  on: { click: _vm.hide }
                },
                [_vm._v("知道了")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  attrs: { eventid: "4616d280-3" },
                  on: { click: _vm.gotoCreate }
                },
                [_vm._v(_vm._s(_vm.btnText))]
              )
            ]
          )
        ])
      ])
    ]
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("view", { staticClass: "item uni-flex" }, [
      _c("view", { staticClass: "label" }, [_vm._v("平级收益：")]),
      _c("view", { staticClass: "right uni-flex-item" }, [
        _vm._v("下级等级如果与自己等级一样，那么间推收益为零；但平台会给出"),
        _c("text", [_vm._v("5%")]),
        _vm._v("的平级收益奖励。")
      ])
    ])
  }
]
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/credit/poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop pop-poster"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "771d9474-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
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
                  attrs: { eventid: "771d9474-1" },
                  on: { click: _vm.hide }
                },
                [_vm._v("关闭")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.downloading },
                  attrs: { eventid: "771d9474-2" },
                  on: { click: _vm.download }
                },
                [_vm._v("保存到手机")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.shareFriending },
                  attrs: { eventid: "771d9474-3" },
                  on: { click: _vm.shareFriend }
                },
                [_vm._v("分享给好友")]
              )
            ]
          )
        ]),
        _c("canvas", {
          staticClass: "canvas uni-pa",
          attrs: { "canvas-id": "canvas" }
        }),
        _c("canvas", {
          staticClass: "qrcodebox uni-pa",
          attrs: { "canvas-id": "qrcodebox" }
        })
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster&":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!F:/dinghui/app/pages/invite/poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster& ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
  return _c(
    "view",
    {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.isShow,
          expression: "isShow"
        }
      ],
      staticClass: "pop pop-poster"
    },
    [
      _c("view", {
        staticClass: "mask",
        attrs: { eventid: "3e714338-0" },
        on: { click: _vm.hide }
      }),
      _c("view", { staticClass: "pop-con" }, [
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
                  attrs: { eventid: "3e714338-1" },
                  on: { click: _vm.hide }
                },
                [_vm._v("关闭")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.downloading },
                  attrs: { eventid: "3e714338-2" },
                  on: { click: _vm.download }
                },
                [_vm._v("保存到手机")]
              ),
              _c(
                "view",
                {
                  staticClass: "uni-flex-item",
                  class: { disabled: _vm.shareFriending },
                  attrs: { eventid: "3e714338-3" },
                  on: { click: _vm.shareFriend }
                },
                [_vm._v("分享给好友")]
              )
            ]
          )
        ]),
        _vm.isShow
          ? _c("canvas", {
              staticClass: "canvas uni-pa",
              attrs: { "canvas-id": "canvas" }
            })
          : _vm._e(),
        _c("canvas", {
          staticClass: "qrcodebox uni-pa",
          style: {
            width: _vm.canvasSize + "px;",
            height: _vm.canvasSize + "px;"
          },
          attrs: { "canvas-id": "qrcodebox" }
        }),
        _c("image", {
          staticClass: "load-image",
          attrs: { src: _vm.loadImageSrc, eventid: "3e714338-4" },
          on: { load: _vm.loadImageCb }
        })
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponent; });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "F:\\dinghui\\app\\common\\qrcode.min.js":
/*!*******************************************!*\
  !*** F:/dinghui/app/common/qrcode.min.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var hasOwn = Object.prototype.hasOwnProperty,toStr = Object.prototype.toString,defineProperty = Object.defineProperty,gOPD = Object.getOwnPropertyDescriptor,isArray = function isArray(t) {return "function" == typeof Array.isArray ? Array.isArray(t) : "[object Array]" === toStr.call(t);},isPlainObject = function isPlainObject(t) {if (!t || "[object Object]" !== toStr.call(t)) return !1;var e,r = hasOwn.call(t, "constructor"),o = t.constructor && t.constructor.prototype && hasOwn.call(t.constructor.prototype, "isPrototypeOf");if (t.constructor && !r && !o) return !1;for (e in t) {;}return void 0 === e || hasOwn.call(t, e);},setProperty = function setProperty(t, e) {defineProperty && "__proto__" === e.name ? defineProperty(t, e.name, { enumerable: !0, configurable: !0, value: e.newValue, writable: !0 }) : t[e.name] = e.newValue;},getProperty = function getProperty(t, e) {if ("__proto__" === e) {if (!hasOwn.call(t, e)) return;if (gOPD) return gOPD(t, e).value;}return t[e];},extend = function t() {var e,r,o,n,i,a,s = arguments[0],u = 1,l = arguments.length,h = !1;for ("boolean" == typeof s && (h = s, s = arguments[1] || {}, u = 2), (null == s || "object" != typeof s && "function" != typeof s) && (s = {}); u < l; ++u) {if (null != (e = arguments[u])) for (r in e) {o = getProperty(s, r), s !== (n = getProperty(e, r)) && (h && n && (isPlainObject(n) || (i = isArray(n))) ? (i ? (i = !1, a = o && isArray(o) ? o : []) : a = o && isPlainObject(o) ? o : {}, setProperty(s, { name: r, newValue: t(h, a, n) })) : void 0 !== n && setProperty(s, { name: r, newValue: n }));}}return s;};function QR8bitByte(t) {this.mode = QRMode.MODE_8BIT_BYTE, this.data = t;}function QRCode(t, e) {this.typeNumber = t, this.errorCorrectLevel = e, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.dataList = new Array();}QR8bitByte.prototype = { getLength: function getLength(t) {return this.data.length;}, write: function write(t) {for (var e = 0; e < this.data.length; e++) {t.put(this.data.charCodeAt(e), 8);}} }, QRCode.prototype = { addData: function addData(t) {var e = new QR8bitByte(t);this.dataList.push(e), this.dataCache = null;}, isDark: function isDark(t, e) {if (t < 0 || this.moduleCount <= t || e < 0 || this.moduleCount <= e) throw new Error(t + "," + e);return this.modules[t][e];}, getModuleCount: function getModuleCount() {return this.moduleCount;}, make: function make() {if (this.typeNumber < 1) {var t = 1;for (t = 1; t < 40; t++) {for (var e = QRRSBlock.getRSBlocks(t, this.errorCorrectLevel), r = new QRBitBuffer(), o = 0, n = 0; n < e.length; n++) {o += e[n].dataCount;}for (n = 0; n < this.dataList.length; n++) {var i = this.dataList[n];r.put(i.mode, 4), r.put(i.getLength(), QRUtil.getLengthInBits(i.mode, t)), i.write(r);}if (r.getLengthInBits() <= 8 * o) break;}this.typeNumber = t;}this.makeImpl(!1, this.getBestMaskPattern());}, makeImpl: function makeImpl(t, e) {this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount);for (var r = 0; r < this.moduleCount; r++) {this.modules[r] = new Array(this.moduleCount);for (var o = 0; o < this.moduleCount; o++) {this.modules[r][o] = null;}}this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(t, e), this.typeNumber >= 7 && this.setupTypeNumber(t), null == this.dataCache && (this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, e);}, setupPositionProbePattern: function setupPositionProbePattern(t, e) {for (var r = -1; r <= 7; r++) {if (!(t + r <= -1 || this.moduleCount <= t + r)) for (var o = -1; o <= 7; o++) {e + o <= -1 || this.moduleCount <= e + o || (this.modules[t + r][e + o] = 0 <= r && r <= 6 && (0 == o || 6 == o) || 0 <= o && o <= 6 && (0 == r || 6 == r) || 2 <= r && r <= 4 && 2 <= o && o <= 4);}}}, getBestMaskPattern: function getBestMaskPattern() {for (var t = 0, e = 0, r = 0; r < 8; r++) {this.makeImpl(!0, r);var o = QRUtil.getLostPoint(this);(0 == r || t > o) && (t = o, e = r);}return e;}, createMovieClip: function createMovieClip(t, e, r) {var o = t.createEmptyMovieClip(e, r);this.make();for (var n = 0; n < this.modules.length; n++) {for (var i = 1 * n, a = 0; a < this.modules[n].length; a++) {var s = 1 * a;this.modules[n][a] && (o.beginFill(0, 100), o.moveTo(s, i), o.lineTo(s + 1, i), o.lineTo(s + 1, i + 1), o.lineTo(s, i + 1), o.endFill());}}return o;}, setupTimingPattern: function setupTimingPattern() {for (var t = 8; t < this.moduleCount - 8; t++) {null == this.modules[t][6] && (this.modules[t][6] = t % 2 == 0);}for (var e = 8; e < this.moduleCount - 8; e++) {null == this.modules[6][e] && (this.modules[6][e] = e % 2 == 0);}}, setupPositionAdjustPattern: function setupPositionAdjustPattern() {for (var t = QRUtil.getPatternPosition(this.typeNumber), e = 0; e < t.length; e++) {for (var r = 0; r < t.length; r++) {var o = t[e],n = t[r];if (null == this.modules[o][n]) for (var i = -2; i <= 2; i++) {for (var a = -2; a <= 2; a++) {this.modules[o + i][n + a] = -2 == i || 2 == i || -2 == a || 2 == a || 0 == i && 0 == a;}}}}}, setupTypeNumber: function setupTypeNumber(t) {for (var e = QRUtil.getBCHTypeNumber(this.typeNumber), r = 0; r < 18; r++) {var o = !t && 1 == (e >> r & 1);this.modules[Math.floor(r / 3)][r % 3 + this.moduleCount - 8 - 3] = o;}for (r = 0; r < 18; r++) {o = !t && 1 == (e >> r & 1);this.modules[r % 3 + this.moduleCount - 8 - 3][Math.floor(r / 3)] = o;}}, setupTypeInfo: function setupTypeInfo(t, e) {for (var r = this.errorCorrectLevel << 3 | e, o = QRUtil.getBCHTypeInfo(r), n = 0; n < 15; n++) {var i = !t && 1 == (o >> n & 1);n < 6 ? this.modules[n][8] = i : n < 8 ? this.modules[n + 1][8] = i : this.modules[this.moduleCount - 15 + n][8] = i;}for (n = 0; n < 15; n++) {i = !t && 1 == (o >> n & 1);n < 8 ? this.modules[8][this.moduleCount - n - 1] = i : n < 9 ? this.modules[8][15 - n - 1 + 1] = i : this.modules[8][15 - n - 1] = i;}this.modules[this.moduleCount - 8][8] = !t;}, mapData: function mapData(t, e) {for (var r = -1, o = this.moduleCount - 1, n = 7, i = 0, a = this.moduleCount - 1; a > 0; a -= 2) {for (6 == a && a--;;) {for (var s = 0; s < 2; s++) {if (null == this.modules[o][a - s]) {var u = !1;i < t.length && (u = 1 == (t[i] >>> n & 1)), QRUtil.getMask(e, o, a - s) && (u = !u), this.modules[o][a - s] = u, -1 == --n && (i++, n = 7);}}if ((o += r) < 0 || this.moduleCount <= o) {o -= r, r = -r;break;}}}} }, QRCode.PAD0 = 236, QRCode.PAD1 = 17, QRCode.createData = function (t, e, r) {for (var o = QRRSBlock.getRSBlocks(t, e), n = new QRBitBuffer(), i = 0; i < r.length; i++) {var a = r[i];n.put(a.mode, 4), n.put(a.getLength(), QRUtil.getLengthInBits(a.mode, t)), a.write(n);}var s = 0;for (i = 0; i < o.length; i++) {s += o[i].dataCount;}if (n.getLengthInBits() > 8 * s) throw new Error("code length overflow. (" + n.getLengthInBits() + ">" + 8 * s + ")");for (n.getLengthInBits() + 4 <= 8 * s && n.put(0, 4); n.getLengthInBits() % 8 != 0;) {n.putBit(!1);}for (; !(n.getLengthInBits() >= 8 * s || (n.put(QRCode.PAD0, 8), n.getLengthInBits() >= 8 * s));) {n.put(QRCode.PAD1, 8);}return QRCode.createBytes(n, o);}, QRCode.createBytes = function (t, e) {for (var r = 0, o = 0, n = 0, i = new Array(e.length), a = new Array(e.length), s = 0; s < e.length; s++) {var u = e[s].dataCount,l = e[s].totalCount - u;o = Math.max(o, u), n = Math.max(n, l), i[s] = new Array(u);for (var h = 0; h < i[s].length; h++) {i[s][h] = 255 & t.buffer[h + r];}r += u;var f = QRUtil.getErrorCorrectPolynomial(l),g = new QRPolynomial(i[s], f.getLength() - 1).mod(f);a[s] = new Array(f.getLength() - 1);for (h = 0; h < a[s].length; h++) {var c = h + g.getLength() - a[s].length;a[s][h] = c >= 0 ? g.get(c) : 0;}}var d = 0;for (h = 0; h < e.length; h++) {d += e[h].totalCount;}var R = new Array(d),m = 0;for (h = 0; h < o; h++) {for (s = 0; s < e.length; s++) {h < i[s].length && (R[m++] = i[s][h]);}}for (h = 0; h < n; h++) {for (s = 0; s < e.length; s++) {h < a[s].length && (R[m++] = a[s][h]);}}return R;};for (var QRMode = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 }, QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 }, QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 }, QRUtil = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo: function getBCHTypeInfo(t) {for (var e = t << 10; QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G15) >= 0;) {e ^= QRUtil.G15 << QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G15);}return (t << 10 | e) ^ QRUtil.G15_MASK;}, getBCHTypeNumber: function getBCHTypeNumber(t) {for (var e = t << 12; QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G18) >= 0;) {e ^= QRUtil.G18 << QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G18);}return t << 12 | e;}, getBCHDigit: function getBCHDigit(t) {for (var e = 0; 0 != t;) {e++, t >>>= 1;}return e;}, getPatternPosition: function getPatternPosition(t) {return QRUtil.PATTERN_POSITION_TABLE[t - 1];}, getMask: function getMask(t, e, r) {switch (t) {case QRMaskPattern.PATTERN000:return (e + r) % 2 == 0;case QRMaskPattern.PATTERN001:return e % 2 == 0;case QRMaskPattern.PATTERN010:return r % 3 == 0;case QRMaskPattern.PATTERN011:return (e + r) % 3 == 0;case QRMaskPattern.PATTERN100:return (Math.floor(e / 2) + Math.floor(r / 3)) % 2 == 0;case QRMaskPattern.PATTERN101:return e * r % 2 + e * r % 3 == 0;case QRMaskPattern.PATTERN110:return (e * r % 2 + e * r % 3) % 2 == 0;case QRMaskPattern.PATTERN111:return (e * r % 3 + (e + r) % 2) % 2 == 0;default:throw new Error("bad maskPattern:" + t);}}, getErrorCorrectPolynomial: function getErrorCorrectPolynomial(t) {for (var e = new QRPolynomial([1], 0), r = 0; r < t; r++) {e = e.multiply(new QRPolynomial([1, QRMath.gexp(r)], 0));}return e;}, getLengthInBits: function getLengthInBits(t, e) {if (1 <= e && e < 10) switch (t) {case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:" + t);} else if (e < 27) switch (t) {case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:" + t);} else {if (!(e < 41)) throw new Error("type:" + e);switch (t) {case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:" + t);}}}, getLostPoint: function getLostPoint(t) {for (var e = t.getModuleCount(), r = 0, o = 0; o < e; o++) {for (var n = 0; n < e; n++) {for (var i = 0, a = t.isDark(o, n), s = -1; s <= 1; s++) {if (!(o + s < 0 || e <= o + s)) for (var u = -1; u <= 1; u++) {n + u < 0 || e <= n + u || 0 == s && 0 == u || a == t.isDark(o + s, n + u) && i++;}}i > 5 && (r += 3 + i - 5);}}for (o = 0; o < e - 1; o++) {for (n = 0; n < e - 1; n++) {var l = 0;t.isDark(o, n) && l++, t.isDark(o + 1, n) && l++, t.isDark(o, n + 1) && l++, t.isDark(o + 1, n + 1) && l++, 0 != l && 4 != l || (r += 3);}}for (o = 0; o < e; o++) {for (n = 0; n < e - 6; n++) {t.isDark(o, n) && !t.isDark(o, n + 1) && t.isDark(o, n + 2) && t.isDark(o, n + 3) && t.isDark(o, n + 4) && !t.isDark(o, n + 5) && t.isDark(o, n + 6) && (r += 40);}}for (n = 0; n < e; n++) {for (o = 0; o < e - 6; o++) {t.isDark(o, n) && !t.isDark(o + 1, n) && t.isDark(o + 2, n) && t.isDark(o + 3, n) && t.isDark(o + 4, n) && !t.isDark(o + 5, n) && t.isDark(o + 6, n) && (r += 40);}}var h = 0;for (n = 0; n < e; n++) {for (o = 0; o < e; o++) {t.isDark(o, n) && h++;}}return r += 10 * (Math.abs(100 * h / e / e - 50) / 5);} }, QRMath = { glog: function glog(t) {if (t < 1) throw new Error("glog(" + t + ")");return QRMath.LOG_TABLE[t];}, gexp: function gexp(t) {for (; t < 0;) {t += 255;}for (; t >= 256;) {t -= 255;}return QRMath.EXP_TABLE[t];}, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) }, i = 0; i < 8; i++) {QRMath.EXP_TABLE[i] = 1 << i;}for (i = 8; i < 256; i++) {QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];}for (i = 0; i < 255; i++) {QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;}function QRPolynomial(t, e) {if (void 0 == t.length) throw new Error(t.length + "/" + e);for (var r = 0; r < t.length && 0 == t[r];) {r++;}this.num = new Array(t.length - r + e);for (var o = 0; o < t.length - r; o++) {this.num[o] = t[o + r];}}function QRRSBlock(t, e) {this.totalCount = t, this.dataCount = e;}function QRBitBuffer() {this.buffer = new Array(), this.length = 0;}function utf16to8(t) {var e, r, o, n;for (e = "", o = t.length, r = 0; r < o; r++) {(n = t.charCodeAt(r)) >= 1 && n <= 127 ? e += t.charAt(r) : n > 2047 ? (e += String.fromCharCode(224 | n >> 12 & 15), e += String.fromCharCode(128 | n >> 6 & 63), e += String.fromCharCode(128 | n >> 0 & 63)) : (e += String.fromCharCode(192 | n >> 6 & 31), e += String.fromCharCode(128 | n >> 0 & 63));}return e;}function drawQrcode(t) {t = t || {}, (t = extend(!0, { width: 256, height: 256, x: 0, y: 0, typeNumber: -1, correctLevel: QRErrorCorrectLevel.H, background: "#ffffff", foreground: "#000000", image: { imageResource: "", dx: 0, dy: 0, dWidth: 100, dHeight: 100 } }, t)).canvasId || t.ctx ? function () {var e,r = new QRCode(t.typeNumber, t.correctLevel);r.addData(utf16to8(t.text)), r.make(), e = t.ctx ? t.ctx : t._this ? wx.createCanvasContext && wx.createCanvasContext(t.canvasId, t._this) : wx.createCanvasContext && wx.createCanvasContext(t.canvasId);for (var o = t.width / r.getModuleCount(), n = t.height / r.getModuleCount(), i = 0; i < r.getModuleCount(); i++) {for (var a = 0; a < r.getModuleCount(); a++) {var s = r.isDark(i, a) ? t.foreground : t.background;e.setFillStyle(s);var u = Math.ceil((a + 1) * o) - Math.floor(a * o),l = Math.ceil((i + 1) * o) - Math.floor(i * o);e.fillRect(Math.round(a * o) + t.x, Math.round(i * n) + t.y, u, l);}}t.image.imageResource && e.drawImage(t.image.imageResource, t.image.dx, t.image.dy, t.image.dWidth, t.image.dHeight);e.draw(!1, function (e) {t.callback && t.callback(e);});}() : console.warn("please set canvasId or ctx!");}QRPolynomial.prototype = { get: function get(t) {return this.num[t];}, getLength: function getLength() {return this.num.length;}, multiply: function multiply(t) {for (var e = new Array(this.getLength() + t.getLength() - 1), r = 0; r < this.getLength(); r++) {for (var o = 0; o < t.getLength(); o++) {e[r + o] ^= QRMath.gexp(QRMath.glog(this.get(r)) + QRMath.glog(t.get(o)));}}return new QRPolynomial(e, 0);}, mod: function mod(t) {if (this.getLength() - t.getLength() < 0) return this;for (var e = QRMath.glog(this.get(0)) - QRMath.glog(t.get(0)), r = new Array(this.getLength()), o = 0; o < this.getLength(); o++) {r[o] = this.get(o);}for (o = 0; o < t.getLength(); o++) {r[o] ^= QRMath.gexp(QRMath.glog(t.get(o)) + e);}return new QRPolynomial(r, 0).mod(t);} }, QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], QRRSBlock.getRSBlocks = function (t, e) {var r = QRRSBlock.getRsBlockTable(t, e);if (void 0 == r) throw new Error("bad rs block @ typeNumber:" + t + "/errorCorrectLevel:" + e);for (var o = r.length / 3, n = new Array(), i = 0; i < o; i++) {for (var a = r[3 * i + 0], s = r[3 * i + 1], u = r[3 * i + 2], l = 0; l < a; l++) {n.push(new QRRSBlock(s, u));}}return n;}, QRRSBlock.getRsBlockTable = function (t, e) {switch (e) {case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 3];default:return;}}, QRBitBuffer.prototype = { get: function get(t) {var e = Math.floor(t / 8);return 1 == (this.buffer[e] >>> 7 - t % 8 & 1);}, put: function put(t, e) {for (var r = 0; r < e; r++) {this.putBit(1 == (t >>> e - r - 1 & 1));}}, getLengthInBits: function getLengthInBits() {return this.length;}, putBit: function putBit(t) {var e = Math.floor(this.length / 8);this.buffer.length <= e && this.buffer.push(0), t && (this.buffer[e] |= 128 >>> this.length % 8), this.length++;} };var _default = drawQrcode;exports.default = _default;

/***/ }),

/***/ "F:\\dinghui\\app\\components\\addContact.vue":
/*!************************************************!*\
  !*** F:/dinghui/app/components/addContact.vue ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact& */ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact&");
/* harmony import */ var _addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./addContact.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__["render"],
  _addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "ec786268",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/addContact.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=script&lang=js&":
/*!*************************************************************************!*\
  !*** F:/dinghui/app/components/addContact.vue?vue&type=script&lang=js& ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./addContact.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true&":
/*!**********************************************************************************************************!*\
  !*** F:/dinghui/app/components/addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true& ***!
  \**********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=style&index=0&id=ec786268&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_style_index_0_id_ec786268_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact&":
/*!***********************************************************************************************************!*\
  !*** F:/dinghui/app/components/addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact& ***!
  \***********************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\addContact.vue?vue&type=template&id=ec786268&scoped=true&name=addContact&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_addContact_vue_vue_type_template_id_ec786268_scoped_true_name_addContact___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\components\\agreement.vue":
/*!***********************************************!*\
  !*** F:/dinghui/app/components/agreement.vue ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement& */ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement&");
/* harmony import */ var _agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./agreement.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__["render"],
  _agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "4b31d58d",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/agreement.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=script&lang=js&":
/*!************************************************************************!*\
  !*** F:/dinghui/app/components/agreement.vue?vue&type=script&lang=js& ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./agreement.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true&":
/*!*********************************************************************************************************!*\
  !*** F:/dinghui/app/components/agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true& ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=style&index=0&id=4b31d58d&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_style_index_0_id_4b31d58d_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement&":
/*!*********************************************************************************************************!*\
  !*** F:/dinghui/app/components/agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement& ***!
  \*********************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\agreement.vue?vue&type=template&id=4b31d58d&scoped=true&name=agreement&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_agreement_vue_vue_type_template_id_4b31d58d_scoped_true_name_agreement___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\components\\contact.vue":
/*!*********************************************!*\
  !*** F:/dinghui/app/components/contact.vue ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact& */ "F:\\dinghui\\app\\components\\contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact&");
/* harmony import */ var _contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contact.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\contact.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__["render"],
  _contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "73432b63",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/contact.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\contact.vue?vue&type=script&lang=js&":
/*!**********************************************************************!*\
  !*** F:/dinghui/app/components/contact.vue?vue&type=script&lang=js& ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./contact.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true&":
/*!*******************************************************************************************************!*\
  !*** F:/dinghui/app/components/contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true& ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=style&index=0&id=73432b63&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_style_index_0_id_73432b63_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact&":
/*!*****************************************************************************************************!*\
  !*** F:/dinghui/app/components/contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact& ***!
  \*****************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\contact.vue?vue&type=template&id=73432b63&scoped=true&name=contact&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_contact_vue_vue_type_template_id_73432b63_scoped_true_name_contact___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\components\\poster.vue":
/*!********************************************!*\
  !*** F:/dinghui/app/components/poster.vue ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster& */ "F:\\dinghui\\app\\components\\poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster&");
/* harmony import */ var _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./poster.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\poster.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"],
  _poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "6615c94c",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/poster.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\poster.vue?vue&type=script&lang=js&":
/*!*********************************************************************!*\
  !*** F:/dinghui/app/components/poster.vue?vue&type=script&lang=js& ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true&":
/*!******************************************************************************************************!*\
  !*** F:/dinghui/app/components/poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true& ***!
  \******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=style&index=0&id=6615c94c&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6615c94c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster&":
/*!***************************************************************************************************!*\
  !*** F:/dinghui/app/components/poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster& ***!
  \***************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\poster.vue?vue&type=template&id=6615c94c&scoped=true&name=poster&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6615c94c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\components\\relation.vue":
/*!**********************************************!*\
  !*** F:/dinghui/app/components/relation.vue ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation& */ "F:\\dinghui\\app\\components\\relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation&");
/* harmony import */ var _relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./relation.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\relation.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__["render"],
  _relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "c825016e",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/relation.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\relation.vue?vue&type=script&lang=js&":
/*!***********************************************************************!*\
  !*** F:/dinghui/app/components/relation.vue?vue&type=script&lang=js& ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./relation.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true&":
/*!********************************************************************************************************!*\
  !*** F:/dinghui/app/components/relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true& ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=style&index=0&id=c825016e&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_style_index_0_id_c825016e_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation&":
/*!*******************************************************************************************************!*\
  !*** F:/dinghui/app/components/relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation& ***!
  \*******************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\relation.vue?vue&type=template&id=c825016e&scoped=true&name=relation&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_relation_vue_vue_type_template_id_c825016e_scoped_true_name_relation___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\components\\rewardRule.vue":
/*!************************************************!*\
  !*** F:/dinghui/app/components/rewardRule.vue ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule& */ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule&");
/* harmony import */ var _rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rewardRule.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true& */ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__["render"],
  _rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "186b5150",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/components/rewardRule.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=script&lang=js&":
/*!*************************************************************************!*\
  !*** F:/dinghui/app/components/rewardRule.vue?vue&type=script&lang=js& ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./rewardRule.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true&":
/*!**********************************************************************************************************!*\
  !*** F:/dinghui/app/components/rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true& ***!
  \**********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=style&index=0&id=186b5150&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_style_index_0_id_186b5150_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule&":
/*!***********************************************************************************************************!*\
  !*** F:/dinghui/app/components/rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule& ***!
  \***********************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\components\\rewardRule.vue?vue&type=template&id=186b5150&scoped=true&name=rewardRule&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_rewardRule_vue_vue_type_template_id_186b5150_scoped_true_name_rewardRule___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\pages.json":
/*!*********************************!*\
  !*** F:/dinghui/app/pages.json ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/***/ }),

/***/ "F:\\dinghui\\app\\pages\\credit\\poster.vue":
/*!**********************************************!*\
  !*** F:/dinghui/app/pages/credit/poster.vue ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster& */ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster&");
/* harmony import */ var _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./poster.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true& */ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"],
  _poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "6c58db0c",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/pages/credit/poster.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=script&lang=js&":
/*!***********************************************************************!*\
  !*** F:/dinghui/app/pages/credit/poster.vue?vue&type=script&lang=js& ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true&":
/*!********************************************************************************************************!*\
  !*** F:/dinghui/app/pages/credit/poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true& ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=style&index=0&id=6c58db0c&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_6c58db0c_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster&":
/*!*****************************************************************************************************!*\
  !*** F:/dinghui/app/pages/credit/poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster& ***!
  \*****************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\credit\\poster.vue?vue&type=template&id=6c58db0c&scoped=true&name=poster&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_6c58db0c_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "F:\\dinghui\\app\\pages\\invite\\poster.vue":
/*!**********************************************!*\
  !*** F:/dinghui/app/pages/invite/poster.vue ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster& */ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster&");
/* harmony import */ var _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./poster.vue?vue&type=script&lang=js& */ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=script&lang=js&");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true& */ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"],
  _poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "11a7a608",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "F:/dinghui/app/pages/invite/poster.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=script&lang=js&":
/*!***********************************************************************!*\
  !*** F:/dinghui/app/pages/invite/poster.vue?vue&type=script&lang=js& ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--12-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--18-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=script&lang=js&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_12_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_18_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true&":
/*!********************************************************************************************************!*\
  !*** F:/dinghui/app/pages/invite/poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true& ***!
  \********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-1!./node_modules/css-loader??ref--8-oneOf-1-2!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/sass-loader/lib/loader.js??ref--8-oneOf-1-4!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true& */ "./node_modules/mini-css-extract-plugin/dist/loader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/sass-loader/lib/loader.js?!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=style&index=0&id=11a7a608&lang=scss&scoped=true&");
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_1_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_index_js_ref_8_oneOf_1_2_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_stylePostLoader_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_sass_loader_lib_loader_js_ref_8_oneOf_1_4_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_style_index_0_id_11a7a608_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster&":
/*!*****************************************************************************************************!*\
  !*** F:/dinghui/app/pages/invite/poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster& ***!
  \*****************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib??vue-loader-options!./poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader/index.js?!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/vue-loader/lib/index.js?!F:\\dinghui\\app\\pages\\invite\\poster.vue?vue&type=template&id=11a7a608&scoped=true&name=poster&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_D_360_HBuilderX_1_5_4_20190127_full_HBuilderX_plugins_uniapp_cli_node_modules_vue_loader_lib_index_js_vue_loader_options_poster_vue_vue_type_template_id_11a7a608_scoped_true_name_poster___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

}]);
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/vendor.js.map