<template>
	<view class="container">
		<view class="content">
		  <scroll-view scroll-y class="scroll-view">
		  	<view class="notice uni-box">
          <view class="item uni-ovh" v-for="(item, index) in lists" :key="item.id" :class="{'show': item.show}">
            <view class="question-hd uni-pr uni-flex uni-box uni-ovh" @click="slideToggle(item)">
              <view class="num font-number uni-flex">
                {{ (lists.length - index ) > 10 ? lists.length - index : '0' + (lists.length - index) }}
              </view>
              <view class="txt uni-flex-item uni-flex uni-column uni-box uni-ovh">
                <view class="uni-textover">{{ item.title }}</view>
                <view class="times"><toDecima :str="item.create_time" :type="1"></toDecima></view>
              </view>
              <image src="/static/images/icon/icon-arrow-1.png" class="arrow uni-pa"></image>
            </view>
            <view class="question-bd uni-ovh">
              <view class="bd-con">
                <rich-text :nodes="item.content"></rich-text>
                <view class="sign uni-txr">
                  <view>{{ item.author ? item.author : config.system_name }}</view>
                  <view><toDecima :str="item.create_time" :type="1"></toDecima></view>
                </view>
              </view>
            </view>
          </view>
        </view>
		  </scroll-view>
		</view>
	</view>
</template>
<script>
	export default{
		data(){
			return{
				lists: []
			}
		},
    computed: {
      config() {
        this.$store.state.config
      }
    },
    onLoad(query) {
    	this.$http({
        url: this.$apis.notices,
        method: 'GET',
        data: null,
        cb: (err, data) => {
          if (!err && data.success) {
            this.lists = data.data
            this.lists.forEach(item => {
              this.$set(item, 'show', false)
            })
            let id = parseInt(query.id)
            if (id >= 0 && id <= this.lists.length - 1) {
              this.lists[id].show = true
            }
          }
        }
      })
    },
		methods:{
			slideToggle(that) {
        this.lists.forEach((item, i) => {
          if (item.id === that.id) {
            item.show = !item.show
          } else {
            item.show = false
          }
        })
      }
		}
	}
	
</script>
<style lang="scss" scoped>
  @import '../../common/var';
	.notice{
    padding: 20upx;
    .item{
      margin-bottom: 20upx; background-color: $color-white; border-radius: .08rem;
      .question-hd{
        height: 112upx; padding: 14upx 80upx 14upx 0;
        .num{
          justify-content: center; align-items: center; width: 120upx; height: 100%; margin-right: 16upx; font-size: $font-size-64; color: $color; border-right: $border-1; border-color: $color;
        }
        .txt{
          justify-content: center; height: 100%; font-size: $font-size-30; line-height: 42upx; color: $default-color;
          .times{
            margin-top: 4upx; font-size: $font-size-22; line-height: 32upx; color: $color-gray;
          }
        }
        .arrow{
          top: 50%; right: 22upx; width: 48upx; height: 48upx; margin-top: -24upx; transition: all .4s ease;
        }
      }
      .question-bd{
        height: 0;
        .bd-con{
          padding: 20upx 30upx 40upx; font-size: $font-size-24; line-height: 64upx; color: $color-gray;
        }
        .sign{
          padding-top: 20upx;
        }
      }
      &.show{
        .question-hd .arrow{
          transform: rotate(180deg);
        }
        .question-bd{
          height: auto;
        }
      }
    }
  }
</style>