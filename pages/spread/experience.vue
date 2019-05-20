<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @click="scrollUpdate">
				<view class="lists" v-if="experienceLists.length > 0">
          <view class="item" v-for="(item, index) in experienceLists" :key="index" @click="gotoContent(item.id)">
            <view class="time uni-flex"><view><toDecima :str="item.create_time" :type="1"></toDecima></view></view>
            <view class="details uni-ovh">
              <view class="pic uni-pr">
                <image :src="item.logo_url" mode="aspectFill"></image>
                <text class="uni-pa">{{ item.view_count }}人看过</text>
              </view>
              <view class="text uni-textover-box">{{ item.title }}</view>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view>尚无推广经验文章</view>
        </view>
			</scroll-view>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				experienceLists: [],
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false // 下拉加载中
			}
		},
    computed: {
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.experienceLists.length > 0
      },
      showNoRecord() {
        return this.experienceLists.length <= 0 && !this.loading
      }
    },
		onLoad(query) {
			this.getLists()
		},
		methods: {
      getLists() {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.experienceLists = []
        }
        this.$http({
          url: this.$apis.articleList,
          method: 'GET',
          data: {
            page: this.currentPage,
            cat_id: 19
          },
          cb: (err, data) => {
            if (!err && data.success === true) {
              this.currentPage = data.data.current_page
              this.maxPage = data.data.last_page
              let oldArr = this.experienceLists
              let newArr = data.data.data
              this.experienceLists = oldArr.concat(newArr)
            } else {
              uni.showToast({
              	title: '获取热文推荐失败',
                icon: 'none'
              })
            }
            this.loading = false
          }
        })
      },
      // 下拉刷新
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.experienceLists.length > 0) {
          this.currentPage ++
          this.getLists()
        }
      },
      gotoContent(id) {
        this.$navigateTo({
        	url: '/pages/spread/content?aId=' + id
        })
      }
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../common/var';
  .lists{
    padding-bottom: 30upx;
    .item{
      padding: 30upx 20upx 0; margin-bottom: 10upx;
      .time{
        justify-content: center; margin-bottom: 20upx;
        view{
          height: 40upx; padding: 0 20upx; font-size: $font-size-24; line-height: 40upx; color: $color-white; background-color: $color-gray-5; border-radius: 4upx;
        }
      }
      .details{
        background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
        .pic{
          width: 100%; height: 330upx;
          image{
            width: 100%; height: 100%;
          }
          text{
            right: 20upx; bottom: 20upx; z-index: 3; font-size: $font-size-24; line-height: 34upx; color: $color-white; text-shadow: $text-shadow;
          }
        }
        .text{
          max-height: 88upx; padding: 30upx 20upx; font-size: $font-size-32; font-weight: 700; line-height: 44upx; color: $color-gray-4;
        }
      }
    }
  }
</style>
