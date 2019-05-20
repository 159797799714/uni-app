import store from '../store'
  
export default function http (obj) {
  let http = null
  http = uni.request({
  	url: obj.url,
  	method: obj.method,
  	data: obj.data,
    header: {
      Authorization: store.state.jwt
    },
  	success: res => {
      if (res.data.code === 401) {
        store.commit('logout')
        uni.removeStorageSync('jwt')
        uni.reLaunch({
        	url: '../pages/login/index'
        })
        return
      }
      obj.cb(null, res.data)
    },
  	fail: err => {
      obj.cb(err, null)
    }
  });
  return http
}
