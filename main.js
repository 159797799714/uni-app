import Vue from 'vue'
import App from './App'
import store from './store'
import proConfig from './common/config'
import * as utils from './common/utils'
import * as apis from './api/apis'
import http from './api/index'
import getInfo from './api/getInfo'
import toDecima from './components/toDecima.vue'
import levelImg from './components/levelImg.vue'

Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$constant = proConfig
Vue.prototype.$utils = utils
Vue.prototype.$apis = apis
Vue.prototype.$http = http
Vue.prototype.$getInfo = getInfo
Vue.prototype.$navigateTo = (obj) => {
  let pages = getCurrentPages()
  let n = -1
  if (pages.length > 0) {
    pages.forEach((item, index) => {
      if ('/' + item.route === obj.url.split('?')[0]) {
        n = pages.length - index - 1
      }
    })
  }
  if (n === -1) {
    if (pages.length >= 5) {
      uni.redirectTo({
      	url: obj.url,
        success: obj.success,
        fail: obj.fail,
        complete: obj.complete
      })
    } else {
      uni.navigateTo({
      	url: obj.url,
        success: obj.success,
        fail: obj.fail,
        complete: obj.complete
      })
    }
  } else {
    uni.navigateBack({
    	delta: n
    })
  }
}

Vue.component('toDecima', toDecima)
Vue.component('levelImg', levelImg)

App.mpType = 'app'

const app = new Vue({
	store,
  ...App
})
app.$mount()
