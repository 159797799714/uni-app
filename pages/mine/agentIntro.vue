<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
        <rich-text v-if="agentInfo" :nodes="agentInfo.content"></rich-text>
      </scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item" @click="gotoAgent">立即升级</view>
      </view>
    </view>
	</view>
</template>
<script>
	export default{
		data(){
			return{
				agentInfo: null
			}
		},
    onLoad() {
    	this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: 2
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.agentInfo = data.data[0]
            this.agentInfo.content = this.agentInfo.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
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
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      },
      gotoAgent() {
        this.$navigateTo({
        	url: '/pages/mine/agent'
        })
      }
		}
	}
</script>
