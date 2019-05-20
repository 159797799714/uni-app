<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<web-view :src="src"></web-view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				src: ''
			};
		},
		onLoad() {
      if (uni.getStorageSync('webSrc')) {
        this.src = uni.getStorageSync('webSrc')
        uni.removeStorageSync('webSrc')
      } else {
        uni.navigateBack()
      }
		},
    onShow() {
    	//#ifdef APP-PLUS
    	/* 5+环境解锁屏幕方向 */
    	plus.screen.unlockOrientation() // 解锁屏幕锁定
    	//#endif
    },
    onHide() {
    	//#ifdef APP-PLUS
    	/* 5+环境锁定屏幕方向 */
    	plus.screen.lockOrientation('portrait-primary'); //锁定
    	//#endif
    },
    onUnload() {
      //#ifdef APP-PLUS
      /* 5+环境锁定屏幕方向 */
      plus.screen.lockOrientation('portrait-primary'); //锁定
      //#endif
    }
	}
</script>
