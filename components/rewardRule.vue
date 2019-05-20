<template name="rewardRule">
  <view class="pop pop-rule" v-show="isShow">
    <view class="mask" @click="hide"></view>
    <view class="pop-con">
      <view class="caption">奖励规则</view>
      <view class="state uni-flex">
        <view class="level" v-if="role === 1">您当前是：<text>普通会员</text>，<br>可享受{{ percent[0] * 100 + '%' }}业务佣金奖励。</view>
        <view class="level" v-else-if="role === 2">您当前是：<text>黄金VIP</text>，<br>可享受{{ percent[1] * 100 + '%' }}业务佣金奖励。</view>
        <view class="level" v-else-if="role === 3">您当前是：<text>铂金VIP</text>，<br>可享受{{ percent[2] * 100 + '%' }}业务佣金奖励。</view>
        <view class="level" v-else-if="role === 4">您当前是：<text>钻石VIP</text>，<br>可享受{{ percent[3] * 100 + '%' }}业务佣金奖励。</view>
        <view class="btn uni-txc" v-if="role < 4" @click="gotoBanker">申请升级</view>
      </view>
      <view class="table-box uni-pr">
        <view class="min-caption">直推收益</view>
        <view class="lists uni-flex uni-txc">
          <view class="item uni-pr uni-flex uni-column uni-box" :class="{'on': role === 1}">
            <view class="num" v-if="type === 0"><text>&yen;</text><toDecima :str="total * percent[0]"></toDecima></view>
            <view class="num num-2" v-if="type === 1 || type === 2"><toDecima :str="percent[0] * frPercent"></toDecima>%</view>
            <view class="high" v-if="type === 1">(最高<toDecima :str="total * percent[0] * frPercent / 100"></toDecima>元)</view>
            <view class="high" v-if="type === 2">(<toDecima :str="total * percent[0] * frPercent / 100"></toDecima>元起)</view>
            <view>普通会员</view>
            <view class="sign uni-pa uni-ovh" v-if="role === 1">
              <image src="/static/images/icon/icon-sign.png" class="uni-pa"></image>
            </view>
          </view>
          <view class="item uni-pr uni-flex uni-column uni-box" :class="{'on': role === 2}">
            <view class="num" v-if="type === 0"><text>&yen;</text><toDecima :str="total * percent[1]"></toDecima></view>
            <view class="num num-2" v-if="type === 1 || type === 2"><toDecima :str="percent[1] * frPercent"></toDecima>%</view>
            <view class="high" v-if="type === 1">(最高<toDecima :str="total * percent[1] * frPercent / 100"></toDecima>元)</view>
            <view class="high" v-if="type === 2">(<toDecima :str="total * percent[1] * frPercent / 100"></toDecima>元起)</view>
            <view>黄金VIP</view>
            <view class="sign uni-pa uni-ovh" v-if="role === 2">
              <image src="/static/images/icon/icon-sign.png" class="uni-pa"></image>
            </view>
          </view>
          <view class="item uni-pr uni-flex uni-column uni-box" :class="{'on': role === 3}">
            <view class="num" v-if="type === 0"><text>&yen;</text><toDecima :str="total * percent[2]"></toDecima></view>
            <view class="num num-2" v-if="type === 1 || type === 2"><toDecima :str="percent[2] * frPercent"></toDecima>%</view>
            <view class="high" v-if="type === 1">(最高<toDecima :str="total * percent[2] * frPercent / 100"></toDecima>元)</view>
            <view class="high" v-if="type === 2">(<toDecima :str="total * percent[2] * frPercent / 100"></toDecima>元起)</view>
            <view>铂金VIP</view>
            <view class="sign uni-pa uni-ovh" v-if="role === 3">
              <image src="/static/images/icon/icon-sign.png" class="uni-pa"></image>
            </view>
          </view>
          <view class="item uni-pr uni-flex uni-column uni-box" :class="{'on': role === 4}">
            <view class="num" v-if="type === 0"><text>&yen;</text><toDecima :str="total * percent[3]"></toDecima></view>
            <view class="num num-2" v-if="type === 1 || type === 2"><toDecima :str="percent[3] * frPercent"></toDecima>%</view>
            <view class="high" v-if="type === 1">(最高<toDecima :str="total * percent[3] * frPercent / 100"></toDecima>元)</view>
            <view class="high" v-if="type === 2">(<toDecima :str="total * percent[3] * frPercent / 100"></toDecima>元起)</view>
            <view>钻石VIP</view>
            <view class="sign uni-pa uni-ovh" v-if="role === 4">
              <image src="/static/images/icon/icon-sign.png" class="uni-pa"></image>
            </view>
          </view>
        </view>
      </view>
      <view class="explain">
        <view class="item uni-flex">
          <view class="label">结算标准：</view>
          <view class="right uni-flex-item">
            <view class="tag uni-flex">
              <view class="uni-pr uni-box">{{ conditionTitle }}</view>
            </view>
            {{ conditionDec }}
          </view>
        </view>
        <view class="item uni-flex">
          <view class="label">直推收益：</view>
          <view class="right uni-flex-item">指自己或旗下临时用户办卡的收益：<br>普通会员：<text>{{ percent[0] * 100 }}%</text>；黄金VIP：<text>{{ percent[1] * 100 }}%</text>；<br>铂金VIP：<text>{{ percent[2] * 100 }}%</text>；钻石VIP：<text>{{ percent[3] * 100 }}%</text>。</view>
        </view>
        <view class="item uni-flex">
          <view class="label">间推收益：</view>
          <view class="right uni-flex-item">指旗下VIP办理业务的间接收益：<br>间推收益=自身直推收益比例-下级直推收益比例</view>
        </view>
        <view class="item uni-flex">
          <view class="label">平级收益：</view>
          <view class="right uni-flex-item">下级等级如果与自己等级一样，那么间推收益为零；但平台会给出<text>5%</text>的平级收益奖励。</view>
        </view>
      </view>
      <view class="operation uni-flex uni-box">
        <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
          <view class="uni-flex-item gray" @click="hide">知道了</view>
          <view class="uni-flex-item" @click="gotoCreate">{{ btnText }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    name: 'rewardRule',
    props: {
      rewardData: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        isShow: false,
        total: 0,
        conditionTitle: '',
        conditionDec: '',
        type: 0,
        name: 'bk',
        frPercent: 4 // 贷款分成
      }
    },
    computed: {
      role() {
        return this.$store.state.userInfo.role
      },
      config() {
        return this.$store.state.config
      },
      btnText() {
        if (this.name === 'bk') {
          return '去办卡'
        } else if (this.name === 'bx') {
          return '去投保'
        } else if (this.name === 'dk') {
          return '去贷款'
        }
      },
      percent() {
        let arr = [0, 0, 0, 0]
        arr[0] = parseFloat(this.config.earning_main_ordinary)
        arr[1] = parseFloat(this.config.earning_main_banker)
        arr[2] = parseFloat(this.config.earning_main_banker_advance)
        arr[3] = parseFloat(this.config.earning_main_banker_chief)
        return arr
      }
    },
    methods: {
      hide() {
        this.isShow = false
        this.$emit('closeRule')
      },
      gotoAgent() {
        this.isShow = false
        this.$navigateTo({
          url: '/pages/mine/agent'
        })
      },
      gotoBanker() {
        this.isShow = false
        this.$navigateTo({
          url: '/pages/index/member'
        })
      },
      gotoCreate() {
        this.isShow = false
        this.$emit('gotoCreate')
      }
    },
    watch: {
      rewardData(val) {
        this.isShow = val.show
        if (val.total.toString().indexOf('万') !== -1) {
          this.total = parseFloat(val.total) * 10000
        } else {
          this.total = parseFloat(val.total)
        }
        this.conditionTitle = val.conditionTitle
        this.conditionDec = val.conditionDec
        this.type = val.type || 0
        this.name = val.name || 'bk'
        this.frPercent = val.frPercent || 4
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import '../common/var';
  .caption{
    height: 50upx; padding: 40upx 30upx 20upx; font-size: $font-size-36; line-height: 50upx; color: $default-color;
  }
  .state{
    justify-content: space-between; align-content: center; padding: 0 30upx 30upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
    .level{
      text{
        color: $color;
      }
    }
    .btn{
      width: 200upx; height: 68upx; font-weight: 700; line-height: 68upx; color: $color-4; background: $default-btn-linear; border-radius: 68upx;
    }
  }
  .table-box{
    padding: 20upx 30upx 30upx; background-color: $default-bg-color;
    .min-caption{
      height: 40upx; margin-bottom: 10upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
    }
    .lists{
      justify-content: space-between;
      .item{
        justify-content: center; align-items: center; width: 200upx; padding: 10upx 0; font-size: $font-size-28; line-height: 40upx; color: $color-gray; border-radius: $border-radius;
        .num{
          height: 56upx; margin-bottom: 6upx; font-size: $font-size-40; font-weight: 700; line-height: 56upx; color: $color-gray-2;
          text{
            font-size: $font-size-26;
          }
        }
        .high{
          margin-bottom: 4upx; font-size: $font-size-20; line-height: 28upx;
        }
        .sign{
          top: -2upx; left: 14upx; width: 100%; height: 100%; pointer-events: none;
          image{
            left: -18upx; width: 20upx; height: 32upx; filter: drop-shadow(20upx 0 $color);
          }
        }
        &.on{
          color: $color; border: $border-1; border-color: $color;
          .num, .hign{
          	color: $color;
          }
        }
      }
    }
  }
  .explain{
    padding: 20upx 30upx 0;
    .item{
      margin-bottom: 30upx;
      .label{
        width: 132upx; color: $default-color;
      }
      .right{
        .tag{
        	height: 48upx; padding-top: 7upx; margin-bottom: 10upx;
        	view{
        		top: -6upx; height: 48upx; padding: 0 10upx; line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: $border-radius;
        	}
        }
        text{
          color: $color;
        }
      }
    }
  }
</style>
