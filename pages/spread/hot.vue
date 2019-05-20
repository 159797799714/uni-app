<template>
	<view class="container">
    <view class="nav uni-pr uni-txc">
    	<view class="lists uni-pr uni-flex">
    		<view class="item uni-flex-item" v-for="(item, index) in navLists" :key="index" :class="{'on': navIndex === index}" @click="navChange(index)">{{ item.name }}</view>
    	</view>
    	<view class="actived uni-pa" :style="{'width': 100 / navLists.length + '%', 'left': navIndex * 100 / navLists.length + '%'}"></view>
    </view>
		<view class="content">
			<scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scroll="scrollUpdate">
				<view class="lists" v-if="hotLists.length > 0">
          <view class="item uni-flex" v-for="(item, index) in hotLists" :key="index" @click="gotoContent(item.id)">
            <view class="pic uni-ovh">
              <image :src="item.logo_url" mode="aspectFill"></image>
            </view>
            <view class="text uni-flex-item">
              <view class="name uni-textover-box">{{ item.title }}</view>
              <view class="other uni-flex">
                <view><toDecima :str="item.create_time" :type="1"></toDecima></view>
                <view>{{ item.view_count }}人看过</view>
              </view>
            </view>
          </view>
        </view>
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view>尚无{{ navLists[navIndex].name }}热文</view>
        </view>
			</scroll-view>
		</view>
	</view>
</template>
<script>
	export default {
		data(){
			return{
				navLists: [
          {
            name: '推荐',
            status: 0
          },
          {
            name: '信用卡',
            status: 16
          },
          {
            name: '贷款',
            status: 17
          },
          {
            name: '保险',
            status: 18
          }
        ],
        navIndex: 0,
        hotLists: [],
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false // 下拉加载中
			}
		},
    computed: {
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.hotLists.length > 0
      },
      showNoRecord() {
        return this.hotLists.length <= 0 && !this.loading
      }
    },
		onLoad(){
			this.getLists()
		},
		methods:{
			navChange(n) {
        if (this.navIndex === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.loading = false
        this.navIndex = n
        this.hotLists = []
        this.currentPage = 1
        this.maxPage = 1
        this.getLists()
      },
      getLists() {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.hotLists = []
        }
        let dataObj = {}
        if (this.navLists[this.navIndex].status === 0) {
          dataObj.hot_recommend = 1
          dataObj.cat_id = ''
        } else {
          dataObj.cat_id = this.navLists[this.navIndex].status
        }
        dataObj.page = this.currentPage
        this.$http({
          url: this.$apis.articleList,
          method: 'GET',
          data: dataObj,
          cb: (err, data) => {
            if (!err && data.success) {
              this.currentPage = data.data.current_page
              this.maxPage = data.data.last_page
              let oldArr = this.hotLists
              let newArr = data.data.data
              this.hotLists = oldArr.concat(newArr)
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
        if (!this.loading && !this.isLoad && this.hotLists.length > 0) {
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
  .nav{
    margin-bottom: 0;
  }
  .content{
    height: calc(100% - 88upx);
    .lists{
      .item{
        height: 140upx; padding: 20upx 30upx; background-color: $color-white; border-bottom: $border-1;
        .pic{
          width: 220upx; height: 100%; margin-right: 30upx; border-radius: $border-radius;
          image{
            width: 100%; height: 100%;
          }
        }
        .name{
          height: 84upx; padding-top: 12upx; margin-bottom: 10upx; font-size: $font-size-30; font-weight: 700; line-height: 42upx; color: $color-gray-4;
        }
        .other{
          justify-content: space-between; font-size: $font-size-24; line-height: 34upx; color: $color-spread;
        }
      }
    }
  }
</style>