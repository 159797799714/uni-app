<template name="relation">
	<view class="pop pop-relation" v-show="isShow">
    <view class="mask" @click="hide"></view>
    <view class="pop-con">
      <view class="intro">
      	<view class="tit uni-flex uni-txc">
      		<view class="col col-1">会员等级</view>
      		<view class="col col-2 uni-flex-item">升级条件</view>
      		<view class="col col-3">直推业务</view>
      	</view>
        <view class="item uni-flex">
        	<view class="col col-1 uni-flex">
        		<view class="agent agent-1 uni-flex">临时用户</view>
        	</view>
          <view class="col col-2 uni-flex-item">
          	<view class="">注册即可</view>
          </view>
          <view class="col col-3 uni-txc">
          	<view class="">无收益</view>
          </view>
        </view>
        <view class="item uni-flex">
        	<view class="col col-1 uni-flex">
        		<view class="agent agent-2 uni-flex">普通会员</view>
        	</view>
          <view class="col col-2 uni-flex-item">
          	<view class="">手机号验证或者手机号登录</view>
          </view>
          <view class="col col-3 uni-txc">
          	<view class="">{{ config.earning_main_ordinary * 100 }}%</view>
          </view>
        </view>
        <view class="item uni-flex">
        	<view class="col col-1 uni-flex">
        		<view class="agent agent-3 uni-flex"><image src="/static/images/mine/level-1.png" mode=""></image>黄金VIP</view>
        	</view>
          <view class="col col-2 uni-flex-item">
          	<view class="">方式1:成功锁粉<text>30人</text>，邀请<text>1名</text>VIP</view>
            <view class="">方式2:缴纳<text>{{ config.agent_deposit3 }}元</text></view>
          </view>
          <view class="col col-3 uni-txc">
          	<view class="">{{ config.earning_main_banker * 100 }}%</view>
          </view>
        </view>
        <view class="item uni-flex">
        	<view class="col col-1 uni-flex">
        		<view class="agent agent-4 uni-flex"><image src="/static/images/mine/level-2.png" mode=""></image>铂金VIP</view>
        	</view>
          <view class="col col-2 uni-flex-item">
          	<view class="">方式1:成功锁粉<text>50人</text>，邀请<text>4名</text>VIP</view>
            <view class="">方式2:缴纳<text>{{ config.agent_deposit2 }}元</text>押金【可退】</view>
          </view>
          <view class="col col-3 uni-txc">
          	<view class="">{{ config.earning_main_banker_advance * 100 }}%</view>
          </view>
        </view>
        <view class="item uni-flex">
        	<view class="col col-1 uni-flex">
        		<view class="agent agent-5 uni-flex"><image src="/static/images/mine/level-3.png" mode=""></image>钻石VIP</view>
        	</view>
          <view class="col col-2 uni-flex-item">
          	<view class="">方式1:成功锁粉<text>100人</text>，邀请<text>15名</text>VIP</view>
          	<view class="">方式2:缴纳<text>{{ config.agent_deposit }}元</text>押金【可退】</view>
          </view>
          <view class="col col-3 uni-txc">
          	<view class="">{{ config.earning_main_banker_chief * 100 }}%</view>
          </view>
        </view>
      </view>
      <view class="tips">
        <view>温馨提示：</view>
        <view>1.VIP还可享受下级VIP的<text>级差收益</text>，即你的直推收益减去下级VIP直推收益的差额。</view>
        <view>2.如您的下级与您同等级，平台会给出<text>5%</text>的平级收益奖励。</view>
      </view>
      <view class="operation-2">
        <view @click="hide">知道了</view>
      </view>
    </view>
  </view>
</template>

<script>
	export default {
    props: {
      relationData: {
        type: Object,
        required: true
      }
    },
		data() {
			return {
				isShow: false
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      }
    },
    methods: {
      hide() {
        this.isShow = false
        this.$emit('close')
      }
    },
    watch: {
      relationData(val) {
        this.isShow = val.show
      }
    }
	}
</script>

<style lang="scss" scoped>
  @import '../common/var';
  .pop-relation{
    .intro{
      padding: 0 10upx;
      .tit{
        align-content: center; padding: 20upx 0; font-size: $font-size-32; line-height: 40upx; color: $default-color; border-bottom: $border-1;
      }
      .col-1{
        width: 190upx; padding: 0 10upx;
      }
      .col-2{
        padding: 0 10upx;
      }
      .col-3{
        width: 130upx; padding: 0 10upx;
      }
      .item{
        align-items: center; padding: 15upx 0; border-bottom: $border-1;
        .agent{
          justify-content: center; align-items: center; width: 150upx; height: 52upx; font-size: $font-size-22; color: $color-4; background: $level-1-bg; border-radius: 52upx;
          image{
            width: 40upx; height: 40upx; margin-right: 8upx;
          }
          &.agent-2{
            background: $level-2-bg;
          }
          &.agent-3{
            width: 190upx; color: $color-white; background: $level-3-bg;
          }
          &.agent-4{
            width: 190upx; color: $color-white; background: $level-4-bg;
          }
          &.agent-5{
            width: 190upx; color: $color-white; background: $level-5-bg;
          }
        }
      }
    }
    .tips{
      padding: 20upx 30upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
      text{
        color: $color;
      }
    }
  }
</style>
