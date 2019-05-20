<template name="toDecima">
	<span :class="['color-' + color]">{{ res }}</span>
</template>

<script>
	export default {
		name: 'toDecima',
		props: {
			str: {
				type: String,
				default: '0'
			},
      type: {
        type: Number,
        default: 0
      },
      color: {
        type: Number,
        default: 0
      }
		},
    computed: {
      res() {
        if (this.type === 1) {
          return this.$utils.formatTimes(this.str)
        } else if (this.type === 4) {
          let role = parseInt(this.str)
          if (role === 1) {
            return '普通会员'
          } else if (role === 2) {
            return '黄金VIP'
          } else if (role === 3) {
            return '铂金VIP'
          } else if (role === 4) {
            return '钻石VIP'
          } else {
            return '临时用户'
          }
        } else if (this.type === 5) {
          let num = parseInt(this.str) / 10000
          return num === 0 ? num : num + '万'
        } else {
          let f = parseInt(parseFloat(this.str) * 100) / 100
          return f.toFixed(2)
        }
      }
    }
	}
</script>
<style lang="scss" scoped>
  @import '../common/var';
  .color-1{
    color: $color;
  }
</style>
