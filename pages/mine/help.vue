<template>
	<view class="container">
    <view class="feedback uni-flex">
      <view class="uni-flex-item uni-flex" @click="gotoFeedback"><image src="/static/images/icon/icon-edit.png" mode=""></image>反馈问题</view>
    </view>
    <view class="tab-hd-2 uni-pr uni-flex uni-box uni-txc">
      <view @click="tabClick(index)" class="item uni-flex-item" :class="{'on': index === tabIndex}" v-for="(item, index) in tabLists" :key="index">{{ item.name }}</view>
      <view class="actived uni-pa" :style="{'left': tabIndex * 100 / tabLists.length + 50 / tabLists.length + '%'}"></view>
    </view>
		<view class="content" >
			<scroll-view scroll-y class="scroll-view">
				<view class="box">
          <view class="lists">
            <view class="item" v-for="(item, index) in lists" :key="item.id" :class="{'show': item.show}">
              <view class="question-hd uni-pr uni-flex" @click="slideToggle(item)">
                <view class="uni-textover-box">{{ index + 1 }}、{{ item.title }}</view>
                <image src="/static/images/icon/icon-arrow-1.png" class="arrow uni-pa"></image>
              </view>
              <view class="question-bd uni-ovh">
                <view><rich-text :nodes="item.content"></rich-text></view>
              </view>
            </view>
          </view>
				</view>
			</scroll-view>
		</view>  
	</view>
</template>
<script>
  export default {
		data(){
			return{
				tabLists: [
          {
            name: '办卡问题'
          },
          {
            name: 'VIP问题'
          }
        ],
        tabIndex: 0,
        loading: false,
        lists: []
			}
		},
    onLoad() {
    	this.updateLists(this.tabIndex)
    },
		methods:{
			gotoFeedback() {
        this.$navigateTo({
        	url: '/pages/mine/feedback'
        })
      },
      gotoNotes() {
        this.$navigateTo({
        	url: '/pages/mine/notes'
        })
      },
      updateLists(n) {
        if (this.loading) return
        this.loading = true
        this.$http({
          url: this.$apis.help,
          method: 'GET',
          data: {
            type: n + 1
          },
          cb: (err, data) => {
            if (!err && data.success === true) {
              this.lists = data.data.data
              this.lists.forEach(item => {
                this.$set(item, 'show', false)
              })
              setTimeout(() => {
                this.loading = false
              }, 600)
            } else {
              this.loading = false
              uni.showToast({
              	title: '数据获取失败',
                icon: 'none'
              })
            }
          }
        })
      },
      tabClick(n) {
        if (this.tabIndex === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.lists = []
        this.tabIndex = n
        this.updateLists(this.tabIndex)
      },
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
  .feedback{
    justify-content: center; padding: 20upx 0 20upx 20upx;
    view{
      justify-content: center; align-items: center; height: 160upx; margin-right: 20upx; font-size: $font-size-28; color: $color; background-color: $color-white; border: 4upx solid $color; border-radius: $border-radius;
      image{
        width: 72upx; height: 72upx; margin-right: 8upx;
      }
    }
  }
  .tab-hd-2{
    background-color: $color-white; border-bottom: $border-1;
  }
  .content{
    height: calc(100% - 286upx);
    .lists{
      padding-bottom: 20upx;
      .question-hd{
        align-items: center; height: 96upx; padding: 0 92upx 0 30upx; font-size: $font-size-28; color: $default-color; background-color: $color-white; border-bottom: $border-1;
        image{
          top: 50%; right: 22upx; width: 48upx; height: 48upx; margin-top: -24upx; transition: all .4s ease;
        }
      }
      .question-bd{
        height: 0;
        view{
          padding: 25upx 30upx; font-size: $font-size-26; line-height: 36upx; color: $color-gray;
        }
      }
    }
    .show{
      .question-hd image{
        transform: rotate(180deg);
      }
      .question-bd{
        height: auto;
      }
    }
  }
</style>