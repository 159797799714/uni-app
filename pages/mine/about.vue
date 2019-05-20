<template>
	<view class="container">
		<view class="content" >
			<scroll-view scroll-y class="scroll-view">
        <view class="box uni-pr uni-txc">
        	<view class="logo uni-flex">
        		<image src="/static/images/about/logo.png" mode="widthFix"></image>
        	</view>
          <view class="name">{{ config.system_nick_name }}</view>
          <view class="version">V {{ config.version }}</view>
          <view class="intro">你身边观影好帮手<text>\n</text>分享赚佣金</view>
          <view class="phone">加盟代理：<text @click="call(config.kf_phone)">{{ config.kf_phone }}</text></view>
        </view>
      </scroll-view>
		</view>
    <view class="footer uni-flex uni-column">
      <view>{{ config.company_name }} 版权所有</view>
      <view class="eng">Copyright of Dinghui Technology Co., Ltd. All rights reserved</view>
    </view>
	</view>
</template>
<script>
	export default{
		data(){
			return{
				
			}
		},
    computed: {
      config() {
        return this.$store.state.config
      }
    },
    onLoad() {
    	
    },
		methods:{
      call(num) {
        if (!num) {
          uni.showToast({
          	title: '号码不存在',
            icon: 'none'
          })
        } else {
          uni.makePhoneCall({
          	phoneNumber: num
          })
        }
      }
		}
	}
</script>
<style lang="scss" scoped="">
	@import '../../common/var';
  .content{
    height: calc(100% - 100upx); background-color: $color-white;
    .logo{
      justify-content: center; padding: 82upx 0 60upx;
      image{
        width: 210upx; height: 210upx;
      }
    }
    .name{
      margin-bottom: 10upx; font-size: 50upx; line-height: 78upx; color: $default-color;
    }
    .version{
      margin-bottom: 35upx; font-size: 40upx; line-height: 50upx; color: $color-gray-3;
    }
    .intro{
      margin-bottom: 130upx; font-size: 40upx; line-height: 60upx; color: $default-color;
    }
    .phone{
      font-size: 34upx; line-height: 44upx; color: $default-color;
      text{
        color: #008BE2;
      }
    }
  }
  .footer{
    justify-content: center; align-items: center; height: 100upx; font-size: 26upx; line-height: 30upx; color: $color-gray-3; background-color: $color-white;
    .eng{
      margin-top: 10upx; font-size: 20upx;
    }
  }
</style>