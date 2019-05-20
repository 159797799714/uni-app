<template name="levelImg">
  <image :src="src" mode="" v-if="src"></image>
</template>

<script>
	export default {
		name: 'levelImg',
		props: {
			role: {
				type: Number,
				default: 0
			}
		},
    computed: {
      src() {
        if (this.role === 2) {
          return '../../static/images/mine/level-1.png'
        } else if (this.role === 3) {
          return '../../static/images/mine/level-2.png'
        } else if (this.role === 4) {
          return '../../static/images/mine/level-3.png'
        } else {
          return ''
        }
      }
    }
	}
</script>
<style scoped>
  image{ width: 34upx; height: 34upx; margin-right: 8upx; }
</style>
