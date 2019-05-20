export default function updateInfo (cb) {
  uni.request({
    url: this.$apis.userInfo,
    method: 'GET',
    header: {
      Authorization: this.$store.state.jwt
    },
    data: {},
    success: res => {
      if (res.data.success) {
        if (res.data.code === 401) {
          this.$store.commit('logout')
          uni.reLaunch({
          	url: '/pages/login/index'
          })
          return
        }
        this.$store.commit('savaUserInfo', res.data.data)
        if (typeof cb === 'function') cb(true)
      }
    },
    fail: () => {
      this.$store.commit('logout')
      uni.reLaunch({
      	url: '/pages/login/index'
      })
    }
  });
}