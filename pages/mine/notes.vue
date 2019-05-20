<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
        <rich-text v-if="notesInfo[nowIndex]" :nodes="notesInfo[nowIndex].content"></rich-text>
      </scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item gray" @click="gotoBack" v-if="nowIndex <= 0">返回</view>
        <view class="uni-flex-item" @click="prevPage" v-else>上一页</view>
        <view class="uni-flex-item" @click="nextPage" v-if="showBtn">下一页</view>
        <view class="uni-flex-item gray" @click="gotoBack" v-else>知道了</view>
      </view>
    </view>
	</view>
</template>
<script>
	export default{
		data(){
			return{
				notesInfo: [],
        nowIndex: 0,
        notesLength: 0,
        reqing: true
			}
		},
    computed: {
      showBtn() {
        if (this.reqing) {
          return false
        } else {
          if (this.nowIndex < this.notesLength - 1) {
            return true
          } else {
            return false
          }
        }
      }
    },
    onLoad() {
    	this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: 8
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.notesInfo = data.data
            this.notesInfo.forEach(item => {
              item.content = item.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
            })
            this.notesLength = this.notesInfo.length
          } else {
            uni.showToast({
            	title: '请求数据失败',
              icon: 'none'
            })
          }
          this.reqing = false
        }
      })
    },
		methods:{
      prevPage() {
        if (this.nowIndex >= 1) {
          this.nowIndex --
        }
      },
      nextPage() {
        if (this.nowIndex < this.notesLength - 1) {
          this.nowIndex ++
        }
      },
      gotoBack() {
        uni.navigateBack()
      }
		}
	}
</script>
