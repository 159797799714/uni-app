import Vue from 'vue'
import Vuex from 'vuex'
import constant from '../common/config'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false, // 是否登录
    loginType: -1,
		jwt: '',
		userInfo: {}, // 用户信息
		config: {}, // 系统配置
		agentSuccess: false ,// 是否可以升级
    agentSuccessIndex: 0 // 升级的级别
	},
	mutations: {
		login(state, obj) {
			state.hasLogin = true;
			state.jwt = obj.jwt
      state.loginType = obj.loginType
      uni.setStorageSync('jwt', obj.jwt)
      uni.setStorageSync('loginType', obj.loginType)
		},
		logout(state) {
			state.hasLogin = false
			state.loginType = constant.NOT_LOGIN
			state.jwt = ''
			state.userInfo = {}
			state.config = {}
      uni.removeStorageSync('jwt')
      uni.removeStorageSync('loginType')
		},
		savaUserInfo(state, obj) {
			for (let key in obj) {
        Vue.set(state.userInfo, key, obj[key])
			}
		},
    savaConfig(state, obj) {
      for (let key in obj) {
        Vue.set(state.config, key, obj[key])
      }
    },
    changeAgentSuccess(state, b) {
      state.agentSuccess = b
    },
    changeAgentIndex(state, n) {
    	state.agentSuccessIndex = n
    }
	},
	actions: {
		
	}
})

export default store
