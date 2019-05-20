<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
				<view class="main">
					<view class="tit">您已交{{ deposit }}元押金，<text v-if="returnMoney > 0">其中{{ returnMoney }}元押金可以申请退还，</text>直推团队达到8名钻石VIP，即可申请100%退还押金。</view>
					<view class="caption">钻石VIP可享受以下权益：</view>
					<view class="intro">
					  <view class="intro-hd uni-flex"><image src="/static/images/icon/icon-deposit-1.png" mode=""></image>1.享受高额佣金</view>
					  <view class="intro-bd">您的客户或者您自己办理的业务可获得<strong>{{ config.earning_main_banker_chief * 100 }}%</strong>的奖金，您下级办理的业务，您将永久享受极差佣金；极差佣金=您自办业务佣金-您下级自办业务佣金！</view>
					</view>
					<view class="intro">
					  <view class="intro-hd uni-flex"><image src="/static/images/icon/icon-deposit-2.png" mode=""></image>2.团队快速裂变</view>
					  <view class="intro-bd">您的团队，每人将贡献<text>2名</text>VIP加入您的扩展团队，使得您的团队快速扩充，实现指数级裂变，为您打造超级团队！</view>
					</view>
				</view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="../../static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item" @click="confirm" v-if="isClick">申请退还押金{{ returnMoney }}元</view>
        <view class="uni-flex-item gray" v-else>{{ tipsText }}</view>
      </view>
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isReturn: false,
        returnMoney: 0,
        tipsText: '暂未达到申请退押金条件'
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      isClick() {
        return this.$store.state.userInfo.agent_type === 2 && this.isReturn
      },
      deposit() {
        return this.$store.state.userInfo.agent_fee
      }
    },
		onLoad() {
      this.$http({
        url: this.$apis.checkIsReturn,
        method: 'POST',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            this.returnMoney = data.data.refund_money
            this.isReturn = true
          } else {
            if (data.code === 2001) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else if (data.code === 2002) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else if (data.code === 2003) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else if (data.code === 2004) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else if (data.code === 2005) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else if (data.code === 2006) {
              this.tipsText = data.message ? data.message : '系统异常'
            } else {
              this.tipsText = data.message ? data.message : '系统异常'
            }
          }
        }
      })
		},
    methods: {
      confirm() {
        uni.showModal({
        	title: '是否退还押金？',
        	content: '您是' + this.config.system_name + '的尊贵会员，保留押金在平台是对平他莫大的支持，未来我们将从保留押金的用户中选择部分用户成为平台合伙人，如退还押金，将失去这个资格。',
        	cancelText: '先不退了',
        	confirmText: '申请退还',
        	success: res => {
            if (res.confirm) {
              this.$http({
                url: this.$apis.createDeposit,
                method: 'POST',
                data: null,
                cb: (err, data) => {
                  if (!err && data.success === true) {
                    uni.showModal({
                    	title: '申请成功',
                    	content: '申请成功，请等待后台审核，结果将推送通知您',
                    	showCancel: false,
                    	confirmText: '知道了',
                    	success: res => {
                        this.$getInfo(() => {
                          uni.switchTab({
                          	url: '/pages/mine/index'
                          })
                        })
                      }
                    });
                  } else {
                    uni.showModal({
                    	title: '申请失败',
                    	content: data && data.message ? data.message : '申请失败',
                    	showCancel: false,
                    	confirmText: '确定'
                    });
                  }
                }
              })
            }
          }
        });
      },
      gotoIndex() {
        uni.switchTab({
        	url: '/pages/shop/index'
        })
      }
    }
	}
</script>
<style lang="scss" scoped>
	@import '../../common/var';
  .content{
    background-color: $color-white;
    .main{
      padding: 48upx 30upx 0;
      .tit{
        margin-bottom: 34upx; font-size: $font-size-40; font-weight: 700; line-height: 56upx; color: $default-color;
      }
      .caption{
        margin-bottom: 32upx; font-size: $font-size-36; line-height: 50upx; color: $color;
      }
      .intro{
        margin-bottom: 20upx; border-radius: $border-radius; box-shadow: $box-shadow;
        .intro-hd{
          justify-content: center; align-items: center; height: 94upx; font-size: $font-size-40; font-weight: 700; color: $default-color; border: $border-1;
          image{
            width: 80upx; height: 80upx; margin-right: 16upx;
          }
        }
        .intro-bd{
          padding: 50upx 30upx; font-size: $font-size-32; line-height: 44upx; color: $default-color;
          text{
            font-weight: 700; color: $color;
          }
        }
      }
    }
  }
</style>
