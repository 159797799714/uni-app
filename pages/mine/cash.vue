<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="canbe" v-show="!hasRes">
          <view class="canbe-con">
            <view class="tit">可提现金额（元）</view>
            <view class="opra uni-flex">
              <text class="font-number">{{ balance }}</text>
              <view class="btn uni-box" @click="gotoEarning">提现记录</view>
            </view>
          </view>
        </view>
        <view class="cash" v-show="!hasRes">
          <view class="money">
            <view class="tit">{{ isAgent ? '输入提现金额' : '选择提现金额' }}</view>
            <view class="input-cash input-box uni-flex" v-if="isAgent">
              <view>&yen;</view>
              <input class="uni-flex-item font-number" type="number" placeholder="输入整数金额" placeholder-class="input-placeholder-2" v-model="money" confirm-type="done" @confirm="withdraw">
            </view>
            <view class="choice-num uni-flex" v-else>
              <view v-for="(item, index) in choiceArr" :key="index" class="uni-box uni-txc" :class="{'on': choiceIndex === index, 'gray': !item.optional}" @click="choiceNum(index)">{{ item.num }}元</view>
            </view>
            <view class="operable">
              <view v-if="quotaing">&nbsp;</view>
              <view v-else-if="!quotaing && !quota.can_withdraw" class="warn">超过每天可以提现的额度</view>
              <view v-else-if="err === 0">今日可提现金额：&yen;{{ canWithdrawNum }}，可提现次数：{{ quota.time_limit }}</view>
              <view v-else-if="err === 1" class="warn">请输入小于等于{{ config.withdraw_amount_limit }}的整数，请重新输入</view>
              <view v-else-if="err === 2" class="warn uni-pr">超过可提现额度</view>
              <view v-else-if="err === 3" class="warn">您已经申请过提现，不能重复申请。</view>
            </view>
            <view class="operation-2">
              <view :class="{'disabled': isDisabled}" @click="withdraw">确定</view>
            </view>
            <view class="choice-explain" v-if="!isAgent">
              <view class="uni-flex">
                <view class="choiced uni-box"></view>
                <text>已选择的提现金额</text>
              </view>
              <view class="uni-flex">
                <view class="gray uni-box"></view>
                <text>已提现过的金额</text>
              </view>
              <view class="uni-flex">
                <view class="uni-box"></view>
                <text>可以选择的提现金额</text>
              </view>
            </view>
          </view>
        </view>
        <view class="res uni-ovh" v-show="hasRes">
          <view class="res-text uni-flex uni-column">
            <image v-if="stateClass" :src="'../../static/images/icon/' + stateClass + '.png'"></image>
            <view>{{ tipsTitle }}</view>
            <view class="text">{{ msg }}</view>
          </view>
        </view>
        <view class="tips">
          <view>注意事项：</view>
          <view v-if="isAgent">1、每天限额{{ config.withdraw_amount_limit }}元，每天最多可提现{{ config.withdraw_times }}次；</view>
          <view v-else>1、临时用户和普通会员仅可选择以上金额进行提现，并且每个金额仅可提现一次。 </view>
          <view>2、申请提现1-2个小时内将发放至您的微信钱包，18点以后提现，将在次日上午到发放；</view>
          <view>3、请随时关注提现申请的处理状态、留意您的客服信息。</view>
        </view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				quota: {
          can_withdraw: false,
          balance: 0,
          amount_limit: 0,
          time_limit: 0
        },
        quotaing: true,
        balance: 0,
        hasRes: false,
        money: '',
        err: 0,
        choiceArr: [
          {
            num: 1,
            optional: false
          },
          {
            num: 10,
            optional: false
          },
          {
            num: 30,
            optional: false
          }
        ],
        choiceIndex: -1,
        choiceTimer: null,
        withdrawing: false,
        msg: '请稍后至微信钱包查看',
        success: 0 // 提现状态，0失败，1成功，2等待
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      constant() {
        return this.$constant
      },
      userInfo() {
        return this.$store.state.userInfo
      },
      isRole() {
        return this.userInfo.role > 0
      },
      isAgent() {
        return this.userInfo.role > 1
      },
      isDisabled() {
        return this.money.length <= 0 || this.err !== 0 || (this.isAgent && (this.quotaing || !this.quota.can_withdraw))
      },
      stateClass() {
        if (this.success === 1) {
          return 'icon-wait'
        } else if (this.success === 2) {
          return 'icon-wait'
        } else if (this.success === 3) {
          return 'icon-suc'
        } else {
          return 'icon-err'
        }
      },
      tipsTitle() {
        if (this.success === 1) {
          return '申请已提交'
        } else if (this.success === 2) {
          return '提交中'
        } else if (this.success === 3) {
          return '提现成功'
        } else {
          return '申请提现失败'
        }
      },
      isSubscribe() {
        return this.userInfo.is_subscribe === 1
      },
      canWithdrawNum() {
        if (this.isAgent) {
          return Math.min(parseFloat(this.userInfo.balance), parseFloat(this.quota.amount_limit), parseFloat(this.quota.amount_limit))
        } else {
          return parseFloat(this.userInfo.balance)
        }
      }
    },
		onLoad() {
      this.balance = this.userInfo.balance
      // 检查是否可以提现
      if (!this.isAgent) {
        this.quotaing = false
        this.quota.can_withdraw = true
        let arr = []
        this.choiceArr.forEach((item) => {
          arr.push(item.num)
        })
        this.$http({
          url: this.$apis.checkWithdraw,
          method: 'POST',
          data: {
            amount: arr
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.choiceArr.forEach((item) => {
                if (data.data.indexOf(item.num) !== -1) {
                  item.optional = true
                }
              })
            } else {
              uni.showToast({
              	title: '服务器繁忙，请稍后再试',
                icon: 'none'
              })
            }
          }
        })
      } else {
        // 检查今天还可以提现的额度
        this.$http({
          url: this.$apis.withdrawQuota,
          method: 'GET',
          data: null,
          cb: (err, data) => {
            if (!err && data.success) {
              this.quota = data.data
            } else {
              uni.showToast({
              	title: '服务器繁忙，请稍后再试',
                icon: 'none'
              })
            }
            this.quotaing = false
          }
        })
      }
		},
    methods: {
      choiceNum(index) {
        clearTimeout(this.choiceTimer)
        if (this.choiceIndex === index) return
        this.err = 0
        this.choiceIndex = index
        if (!this.choiceArr[index].optional) {
          this.money = ''
          this.choiceTimer = setTimeout(() => {
            this.err = 3
          }, 16.67)
          return
        }
        let num = this.choiceArr[index].num
        this.money = num
      },
      withdraw() {
        if (this.isDisabled) return
        if (!this.userInfo.is_bind_wx) {
          uni.showModal({
          	title: '提示',
          	content: '提现功能要绑定微信或者支付宝',
          	cancelText: '取消',
          	confirmText: '去绑定',
          	success: res => {
              if (res.confirm) {
                this.$navigateTo({
                  url: '/pages/mine/account'
                })
              }
            }
          });
          return
        }
        // 提现
        let _this = this
        _this.hasRes = true
        _this.success = 2
        _this.msg = '申请提交中，请耐心等待'
        _this.title = '提交中'
        _this.$http({
          url: this.$apis.withdraw,
          method: 'POST',
          data: {
            amount: _this.money
          },
          cb: (err, data) => {
            if (!err && data.success) {
              if (_this.isSubscribe) {
                _this.success = 3
                _this.msg = '请稍后至微信钱包查看'
                _this.title = '提现成功'
                _this.withdrawing = true
              } else {
                _this.success = 1
                _this.msg = '请留意您的客服信息'
                _this.title = '申请已提交'
                _this.withdrawing = true
              }
              _this.$getInfo(() => {
                _this.balance = _this.userInfo.balance
              })
            } else {
              if (data.data && data.data.is_subscribe === false) {
                _this.success = 1
                _this.msg = '请留意您的客服信息'
                _this.title = '申请已提交'
                _this.withdrawing = true
              } else {
                _this.success = 0
                _this.msg = data.message
                _this.title = '申请提现失败'
                _this.withdrawing = false
              }
            }
          }
        })
      },
      gotoEarning() {
        this.$navigateTo({
          url: '/pages/mine/earning?tab=2'
        })
      }
    },
    watch: {
      money(val) {
        if ((!/^\d{0,3}?$/g.test(val) && val !== '')) {
          this.err = 1
        } else if (parseFloat(val) > this.canWithdrawNum) {
          this.err = 2
        } else {
          this.err = 0
        }
      }
    }
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .content{
    background-color: $color-white;
    .canbe{
      padding: 20upx 20upx 10upx;
      .canbe-con{
        padding: 40upx 30upx; background-color: $color-2; border-radius: $border-radius;
        .tit{
          margin-bottom: 10upx; font-size: $font-size-24; line-height: 34upx; color: #786011;
        }
        .opra{
          justify-content: space-between; align-items: center; font-size: 60upx; line-height: 70upx; color: #786011;
          .btn{
            height: 44upx; padding: 0 20upx; font-size: $font-size-24; line-height: 44upx; color: #786011; border: $border-1; border-color: #786011; border-radius: 44upx;
          }
        }
      }
    }
    .cash{
      padding: 20upx 20upx 0;
      .money{
        padding: 0 30upx 30upx; margin-bottom: 20upx; background-color: $color-white; border-radius: $border-radius;
        .tit{
          font-size: $font-size-32; line-height: 120upx; color: $default-color;
        }
        .input-cash{
          align-items: flex-end; height: 100upx; margin-bottom: 40upx;
          view{
            margin-right: 20upx; font-size: $font-size-64; color: $default-color;
          }
          input{
            height: 100upx; font-size: 96upx; color: $default-color;
          }
        }
        .choice-num{
          justify-content: space-between; height: 100upx; padding: 0 20upx; margin-bottom: 40upx;
          view{
            width: 180upx; height: 100upx; font-size: $font-size-40; line-height: 100upx; color: $color-2; text-align: center; border: $border-1; border-color: $color-2; border-radius: $border-radius;
            &.gray{
              color: $default-color; background-color: #F3F3F3; border-color: #F3F3F3;
            }
            &.on{
              color: $default-color; background-color: $color-2;
            }
            &.on.gray{
              background-color: #F3F3F3; border-color: $color-2;
            }
          }
        }
        .choice-explain{
          padding-top: 20upx;
          .uni-flex{
            margin-top: 20upx; font-size: $font-size-24; line-height: 36upx; color: $color-gray;
            view{
              width: 70upx; height: 36upx; margin-right: 20upx; border: $border-1; border-color: $color-2; border-radius: $border-radius;
              &.choiced{
                background-color: $color-2;
              }
              &.gray{
                background-color: #F3F3F3; border-color: #F3F3F3;
              }
            }
          }
        }
        .operable{
          margin-bottom: 24upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
          .warn{
            color: $color-err;
          }
          .btn-packet{
            top: 50%; right: 0; height: 52upx; padding: 0 34upx; font-size: $font-size-24; line-height: 52upx; color: $default-color; background: $default-btn-linear; border-radius: 52upx; transform: translateY(-50%);
          }
        }
      }
    }
    .res{
      padding: 58upx 30upx 100upx; font-size: $font-size-32; line-height: 44upx; color: $default-color; border-radius: $border-radius;
      .res-text{
        align-items: center; margin-bottom: 20upx;
        image{
          width: 144upx; height: 144upx;
        }
        .text{
          margin-top: 4upx; font-size: $font-size-24; line-height: 34upx; color: $color-gray;
        }
      }
    }
    .tips{
      padding: 4upx 40upx 20upx; font-size: $font-size-24; line-height: 40upx; color: $color-gray;
    }
  }
  .operation-2{
    height: auto; padding: 0;
    view{
      margin: 0;
    }
  }
</style>
