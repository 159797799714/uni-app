<template>
	<view class="container">
		<view class="content">
      <scroll-view scroll-y class="scroll-view">
      	<view class="box uni-pr">
          <image src="/static/images/bg.png" mode="aspectFit" class="bg uni-pa"></image>
      		<view class="kf-info uni-pr uni-flex uni-column uni-box" v-if="kfInfo">
      		  <image :src="kfInfo.avatar_url ? kfInfo.avatar_url : defaultAvatar" mode="aspectFill"></image>
      		  <view class="name">{{ kfInfo.username }}</view>
      		  <view v-if="kfInfo.id !== 1">ID：{{ kfInfo.id }}</view>
      		</view>
      		<view class="call uni-flex" v-if="kfInfo">
      		  <view class="uni-flex" @click="call(kfInfo.mobile)"><image src="/static/images/icon/icon-call.png" mode=""></image>拨打电话</view>
      		  <view class="uni-flex" @click="showWx"><image src="/static/images/icon/icon-wechat.png" mode=""></image>微信联系</view>
      		</view>
      		<view class="tips">专属服务经理是{{ config.system_name }}面对用户第一责任人，在享有平台相关权益的同时，也肩负指导、培训和为用户解答问题的责任与义务。</view>
      	</view>
      </scroll-view>
    </view>
    <!-- 复制微信号码 S -->
    <view class="pop pop-wechat" v-if="kfInfo" v-show="wechatFlag">
      <view class="mask" @click="hideWx"></view>
      <view class="pop-con">
        <view class="tit">{{ kfInfo.wx_qrcode_url || kfInfo.wxq_qrcode_url ? '长按二维码关注微信' : '复制至微信添加' }}</view>
        <view class="qrcode uni-flex" v-if="kfInfo.wx_qrcode_url || kfInfo.wxq_qrcode_url">
          <view class="item uni-flex uni-column" v-if="kfInfo.wx_qrcode_url">
            <image :src="kfInfo.wx_qrcode_url" mode="aspectFit"></image>
            <view>添加客服</view>
          </view>
          <view class="item uni-flex uni-column" v-if="kfInfo.wxq_qrcode_url">
            <image :src="kfInfo.wxq_qrcode_url" mode="aspectFit"></image>
            <view>添加微信群</view>
          </view>
        </view>
        <view class="text" v-else>
          {{ kfInfo.wx_number ? kfInfo.wx_number : 'TA还没有添加微信号' }}
        </view>
        <view class="operation uni-flex uni-box">
        	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        		<view class="uni-flex-item" @click="hideWx" v-if="kfInfo.wx_qrcode_url || !kfInfo.wx_number">知道了</view>
        		<view class="uni-flex-item" v-else="" @click="copy(kfInfo.wx_number)">复制</view>
        	</view>
        </view>
      </view>
    </view>
    <!-- 复制微信号码 E -->
	</view>
</template>
<script>
	export default {
		data() {
			return {
				kfInfo: null,
        wechatFlag: false
			}
		},
		computed: {
      config() {
        return this.$store.state.config
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      }
    },
    onLoad() {
      this.$http({
        url: this.$apis.kf,
        method: 'GET',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            this.kfInfo = data.data
          } else {
            uni.showToast({
            	title: data.message,
              icon: 'none'
            })
          }
        }
      })
    },
		methods: {
			call(num) {
        if (!num) {
          uni.showToast({
          	title: '用户未填写手机号码',
            icon: 'none'
          })
        } else {
          uni.makePhoneCall({
          	phoneNumber: num
          })
        }
      },
      copy(str) {
        uni.setClipboardData({
        	data: str,
          success: () => {
            uni.showModal({
              title: '复制成功',
              content: '微信已复制，请打开微信查找添加',
              showCancel: false
            })
          },
          fail: () => {
            uni.showModal({
              title: '复制失败',
              content: str,
              showCancel: false
            })
          },
          complete: () => {
          	this.hideWx()
          }
        })
      },
      showWx() {
        this.wechatFlag = true
      },
      hideWx() {
      	this.wechatFlag = false
      }
		}
	}
</script>
<style lang="scss" scoped>
  @import '../../common/var';
  .bg{
    top: 0; left: 0; z-index: 1; width: 100%; height: 380upx;
  }
  .kf-info{
    z-index: 3; align-items: center; height: 380upx; padding-top: 80upx; font-size: $font-size-24; line-height: 34upx; color: $color-3;
    image{
      width: 108upx; height: 108upx; margin-bottom: 14upx; border: $border-avatar; border-radius: 100%;
    }
    .name{
      margin-bottom: 4upx; font-size: $font-size-32; line-height: 44upx;
    }
  }
  .call{
    justify-content: space-between; padding: 20upx;
    view{
      justify-content: center; align-items: center; width: 350upx; height: 120upx; font-size: $font-size-28; color: $default-color; background-color: $color-white; border-radius: $border-radius;
      image{
        width: 48upx; height: 48upx; margin-right: 24upx;
      }
    }
  }
  .tips{
    padding: 0 20upx 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
  }
  .pop-wechat{
    .tit{
      padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color;
    }
    .text{
      min-height: 120upx; padding: 0 30upx; font-size: $font-size-40; line-height: 56upx; color: $color;
    }
    .qrcode{
      justify-content: center; padding-bottom: 20upx;
      .item{
        justify-content: center; align-items: center; width: 320upx; margin: 0 24upx; font-size: $font-size-40; line-height: 56upx; color: $color;
        image{
          width: 320upx; height: 320upx;
        }
      }
    }
  }
</style>
