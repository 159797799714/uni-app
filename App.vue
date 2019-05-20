<script>
  import { userInfo } from 'api/apis.js'
  import store from './store'
  
  export default {
    data() {
      return {
        timer: null
      }
    },
    onLaunch: () => {
    	//#ifdef APP-PLUS
    	/* 5+环境锁定屏幕方向 */
    	plus.screen.lockOrientation('portrait-primary'); //锁定
      // plus.screen.unlockOrientation() // 解锁屏幕锁定
    	//#endif
    },
		onShow: function () {
      // 定时器更新用户数据
			this.timer = setInterval(() => {
        this.updateInfo()
      }, 30000)
		},
		onHide: function () {
			clearInterval(this.timer)
		},
    methods: {
      updateInfo() {
        uni.request({
          url: userInfo,
          method: 'GET',
          header: {
            Authorization: store.state.jwt
          },
          data: {},
          success: res => {
            if (res.data.success) {
              if (res.data.code === 401) {
                return
              }
              store.commit('savaUserInfo', res.data.data)
            }
          }
        });
      }
    }
	}
</script>

<style lang="scss">
	@import './common/common.scss';
</style>
