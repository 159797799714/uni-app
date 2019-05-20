<template>
	<view class="container">
    <view class="tab-hd uni-flex uni-box">
    	<view class="box uni-pr uni-flex-item uni-txc">
    		<view class="lists uni-pr uni-flex">
    			<view class="item uni-flex-item" v-for="(item, index) in tabLists" :key="index" :class="{'on': index === activeId, 'off': index !== activeId}" @click="tabChange(index, item.status)">{{ item.name }}</view>
    		</view>
    		<view class="actived uni-pa" :style="{'width': 100 / tabLists.length + '%', 'left': activeId * 100 / tabLists.length + '%'}"></view>
    	</view>
      <view class="btn-sort uni-flex" @click="showSortPop"><image src="/static/images/icon/icon-order.png" mode=""></image></view>
    </view>
		<view class="content">
		  <scroll-view scroll-y class="scroll-view" enable-back-to-top="true" @scrolltolower="scrollUpdate">
        <!-- 选中的分类 S -->
        <view class="choice uni-pr uni-flex uni-box" v-show="sortStatusArr.length > 0">
          <view class="text">已筛选</view>
          <view class="item uni-box" v-for="(item, index) in sortLists" :key="index" v-show="item.choice">{{ item.name }}</view>
          <view class="btn uni-pa" @click="clearSort"><image src="/static/images/icon/icon-clear-2.png" mode=""></image></view>
        </view>
        <!-- 选中的分类 E -->
		  	<!-- 搜索 S -->
		  	<view class="search" v-show="showSearch">
		  	  <view class="uni-pr">
		  	    <input class="uni-box" type="search" placeholder="请输入关键字搜索文案和标题" placeholder-class="input-placeholder" v-model="searchStr" @confirm="search">
		  	    <image class="icon-search uni-pa" src="/static/images/icon/icon-search.png"></image>
		  	    <view class="btn-search uni-pa uni-txc" @click="search" v-if="!searching || inputing">搜索</view>
		  	    <view class="btn-search uni-pa uni-txc" @click="resetSearch" v-else>重置</view>
		  	  </view>
		  	</view>
		  	<!-- 搜索 E -->
        <!-- 列表 S -->
        <view class="lists" v-show="lists.length > 0">
          <view class="item uni-flex" v-for="(item, index) in lists" :key="index">
            <view class="avatar">
              <img :src="item.avatar_url ? item.avatar_url : defaultAvatar">
            </view>
            <view class="info uni-flex-item uni-ovh">
              <view class="author uni-textover">{{ item.username }}</view>
              <view class="intro">
                <view class="intro-con uni-ovh" :class="{'close': item.opened === 1}" ref="introCon">{{ item.content }}</view>
                <text v-if="item.opened !== 0" @click="introShow(item)">{{ item.opened === 1 ? '全文' : '收起' }}</text>
              </view>
              <view class="link uni-flex" v-if="item.link_img_url || item.link_title" @click="gotoContent(item.id)">
                <view v-if="item.v_url" class="vid uni-pr uni-ovh">
                  <image :src="item.link_img_url ? item.link_img_url : defaultAvatar" mode="aspectFill"></image>
                  <view class="mask uni-pa"></view>
                  <image src="/static/images/icon/icon-play-1.png" mode="" class="icon-play uni-pa"></image>
                </view>
                <view class="pic uni-ovh" v-else>
                  <image :src="item.link_img_url ? item.link_img_url : defaultAvatar" mode="aspectFill"></image>
                </view>
                <view class="text uni-flex-item uni-textover-box">{{ item.link_title }}</view>
              </view>
              <view class="resource" v-if="item.v_url || item.p_urls.length > 0">
                <view class="video-box uni-flex" v-if="item.v_url">
                  <view class="vid uni-pr" @click="showPopVideo(item.v_url)">
                    <image :src="item.v_img_url ? item.v_img_url : defaultAvatar" mode="widthFix"></image>
                    <view class="mask uni-pa"></view>
                    <image src="/static/images/icon/icon-play-2.png" mode="" class="icon-play uni-pa"></image>
                  </view>
                </view>
                <view class="cover-box" v-if="item.p_urls.length === 1">
                  <image :src="item.p_urls_thumb[0]" mode="widthFix" @click="showPopPicture(item.p_urls, 0)"></image>
                </view>
                <view class="picture-box uni-flex uni-flex-wrap" v-if="item.p_urls.length > 1">
                  <image :src="sitem ? sitem : defaultAvatar" mode="aspectFill" :class="sindex + 1" v-for="(sitem, sindex) in item.p_urls_thumb" :key="sindex" @click="showPopPicture(item.p_urls, sindex)"></image>
                </view>
              </view>
              <view class="other uni-flex">
                <view><toDecima :str="item.create_time" :type="1"></toDecima></view>
                <view class="opra-box uni-flex">
                  <view class="btn-zan uni-flex" @click="clickZan(item)"><image :src="item.has_star ? '/static/images/icon/icon-zan-2.png' : '/static/images/icon/icon-zan-1.png'" mode=""></image>{{ item.star >= 5000 ? '5000+' : item.star }}</view>
                  <view class="btn-copy uni-box uni-txc" @click="copy(item.content, item.type)">复制文案</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 列表 E -->
        <view class="no-record uni-flex uni-column" v-show="showNoRecord">
          <image src="/static/images/icon/icon-empty.png"></image>
          <view>尚无相关文章</view>
        </view>
		  </scroll-view>
		</view>
    <view class="pop pop-sort" v-show="showSort">
      <view class="mask" @click="hideSortPop"></view>
      <view class="pop-con">
        <view class="sort-lists uni-txc">
        	<view class="uni-pr" :class="{'on': item.choice}" v-for="(item, index) in sortLists" :key="index" @click="clickSort(index)">{{ item.name }}<image src="/static/images/icon/icon-select.png" class="uni-pa" mode=""></image></view>
        </view>
      </view>
    </view>
    <view class="pop pop-show-video" v-show="videoShow">
      <view class="mask"></view>
      <view class="pop-close uni-pa" @click="closePopVideo"><image src="/static/images/icon/icon-delete.png" mode=""></image></view>
      <view class="pop-con-2">
        <video id="popVideo" :src="videoUrl" controls="false" autoplay="true"></video>
      </view>
      <!-- <view class="pop-tips pa txc">
        <a @click.prevent.stop="downloadVideo">
          <i class="spr-icon icon-download db bc"></i>
          <span>下载视频</span>
        </a>
      </view> -->
    </view>
	</view>
</template>
<script>
	export default{
		data(){
			return{
				tabLists: [
          {
            name: '全部',
            status: ''
          },
          {
            name: '招代理',
            status: 1
          },
          {
            name: '拓业务',
            status: 2
          },
          {
            name: '正能量',
            status: 3
          },
          {
            name: '活动',
            status: 4
          }
        ],
        activeId: 0, // 当前选中tab
        lists: [],
        sortLists: [
          {
            name: '朋友圈文案',
            status: 20,
            choice: false
          },
          {
            name: '图文长文',
            status: 40,
            choice: false
          },
          {
            name: '视频资料',
            status: 30,
            choice: false
          },
          {
            name: '常用话术',
            status: 10,
            choice: false
          }
        ],
        sortStatusArr: [],
        showSort: false,
        zaning: false, // 点赞操作中
        currentPage: 1, // 当前页
        maxPage: 1, // 最大页
        loading: false, // 加载中
        searchStr: '', // 搜索字段
        searching: false, // 搜索状态
        inputing: false,
        pictureShow: false,
        pictureUrlArr: '',
        videoShow: false,
        videoUrl: '',
        popPlaying: false,
			}
		},
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      role() {
        return this.userInfo.role
      },
      isLoad() {
        return parseInt(this.maxPage) <= parseInt(this.currentPage) && this.lists.length > 0
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      showSearch() {
        return (this.lists.length > 0 && !this.loading) || this.searching
      },
      showNoRecord() {
        return this.lists.length <= 0 && !this.loading
      }
    },
    onLoad() {
    	this.updateLists(this.activeId)
    },
		methods:{
			tabChange(n) {
        if (this.activeId === n) return
        if (this.loading) {
          uni.showToast({
          	title: '正在加载数据',
            icon: 'none'
          })
          return
        }
        this.activeId = n
        this.sortStatus = 0
        this.sortType = 1
        this.searchStr = ''
        this.searching = false
        this.lists.length = 0
        this.currentPage = 1
        this.sortLists.forEach(item => {
          item.choice = false
        })
        this.sortStatusArr = []
        this.updateLists(n)
      },
      updateLists(n) {
        if (this.loading) return
        this.loading = true
        if (parseInt(this.currentPage) <= 1) {
          this.lists = []
        }
        let reqStr = `?label=${this.activeId}&search=${this.searchStr}&page=${this.currentPage}`
        let typeStr = ''
        if (this.sortStatusArr.length > 0) {
          this.sortStatusArr.forEach(item => {
            typeStr += `&type[]=${item}`
          })
          reqStr += typeStr
        }
        setTimeout(() => {
          this.$http({
            url: this.$apis.material + reqStr,
            method: 'GET',
            cb: (err, data) => {
              if (!err && data.success) {
                this.currentPage = data.data.current_page
                this.maxPage = data.data.last_page
                let oldArr = this.lists
                let newArr = data.data.data
                this.lists = oldArr.concat(newArr)
                this.lists.forEach(item => {
                  this.$set(item, 'opened', 0)
                })
                if (this.lists.length > 0) {
                  setTimeout(() => {
                    this.countIntroHeight()
                  }, 0)
                }
                if (this.searchStr.length > 0) this.searching = true
              } else {
                this.searching = false
                uni.showToast({
                	title: '数据获取失败',
                  icon: 'none'
                })
              }
              this.loading = false
            }
          })
        }, 50)
      },
      showSortPop() {
        this.showSort = true
      },
      hideSortPop() {
        this.showSort = false
      },
      clickSort(n) {
        this.hideSortPop()
        this.sortLists[n].choice = !this.sortLists[n].choice
        this.sortStatusArr = []
        this.sortLists.forEach(item => {
          if (item.choice) {
            this.sortStatusArr.push(item.status)
          }
        })
        this.searchStr = ''
        this.searching = false
        this.currentPage = 1
        this.updateLists(this.activeId)
      },
      clearSort() {
        this.sortLists.forEach(item => {
          item.choice = false
        })
        this.sortStatusArr = []
        this.updateLists(this.activeId)
      },
      search() {
        if (this.searchStr.length <= 0) {
          uni.showToast({
          	title: '请输入搜索内容',
            icon: 'none'
          })
          return
        }
        this.currentPage = 1
        this.updateLists(this.activeId)
      },
      resetSearch() {
        this.currentPage = 1
        this.searchStr = ''
        this.searching = false
        this.updateLists(this.activeId)
      },
      scrollUpdate() {
        if (!this.loading && !this.isLoad && this.lists.length > 0) {
          this.currentPage ++
          this.updateLists(this.activeId)
        }
      },
      copy(str, type) {
        uni.setClipboardData({
        	data: str,
          success: () => {
            if (type === '视频') {
              uni.showModal({
                title: '复制成功',
                content: '文案已复制，请下载视频去分享',
                showCancel: false
              })
            } else if (type === '图文') {
              uni.showModal({
                title: '复制成功',
                content: '文案已复制，请下载图片去分享',
                showCancel: false
              })
            } else if (type === '链接') {
              uni.showModal({
                title: '复制成功',
                content: '文案已复制，请打开链接去分享',
                showCancel: false
              })
            } else {
              uni.showModal({
                title: '复制成功',
                content: '文案已复制，请打开链接去分享',
                showCancel: false
              })
            }
          },
          fail: () => {
            uni.showModal({
              title: '复制失败',
              content: str,
              showCancel: false
            })
          }
        })
      },
      countIntroHeight() {
        
      },
      introShow(item) {
        if (item.opened === 1) {
          item.opened = 2
        } else {
          item.opened = 1
        }
      },
      clickZan(item) {
        this.$http({
          url: this.$apis.materialStar,
          method: 'POST',
          data: {
            id: item.id
          },
          cb: (err, data) => {
            if (!err && data.success) {
              item.star = data.data
              item.has_star = !item.has_star
            } else {
              uni.showToast({
              	title: '点赞失败，请稍后再试',
                icon: 'none'
              })
            }
          }
        })
      },
      showPopPicture(arr, index) {
        uni.previewImage({
          current: arr[index],
          indicator: 'default',
          urls: arr
        })
      },
      closePopPic() {
        
      },
      showPopVideo(url) {
        this.videoShow = true
        this.videoUrl = url
        uni.createVideoContext('popVideo').play()
      },
      closePopVideo() {
        this.videoShow = false
        uni.createVideoContext('popVideo').pause()
      },
      downloadVideo() {
        
      },
      gotoContent(id) {
        this.$navigateTo({
        	url: '/pages/spread/essay?eId=' + id
        })
      }
		}
	}
	
</script>
<style lang="scss" scoped>
  @import '../../common/var';
  .tab-hd{
    align-items: center;
    .btn-sort{
      justify-content: center; align-items: center; width: 96upx; height: 100%;
      image{
        width: 48upx; height: 48upx;
      }
    }
  }
  .content{
    height: calc(100% - 120upx);
    .choice{
      align-items: center; height: 82upx; padding: 0 30upx; background-color: $color-white; border-top: $border-1; border-bottom: $border-1;
      .text{
        margin-right: 10upx; font-size: $font-size-28; line-height: 40upx; color: $default-color;
      }
      .item{
        height: 48upx; padding: 0 10upx; margin-right: 10upx; font-size: $font-size-24; line-height: 48upx; color: $color; border: $border-1; border-color: $color; border-radius: 48upx;
      }
      .btn{
        top: 50%; right: 26upx; transform: translateY(-50%);
        image{
          width: 48upx; height: 48upx;
        }
      }
    }
    .lists{
      .item{
        padding: 40upx 30upx 24upx 20upx; background-color: $color-white; border-bottom: $border-1;
        .avatar{
          width: 80upx; height: 80upx; margin-right: 20upx;
          image{
            width: 100%; height: 100%; border-radius: 100%;
          }
        }
        .info{
          padding-top: 10upx;
          .author{
            height: 44upx; margin-bottom: 10upx; font-size: $font-size-32; line-height: 44upx; color: $color;
          }
          .intro{
            .intro-con{
              margin-bottom: 20upx; font-size: $font-size-30; line-height: 42upx; color: $default-color;
              text{
                margin-bottom: 24upx; color: $color;
              }
              &.close{
                max-height: 210upx; display: -webkit-box; text-overflow: ellipsis; -webkit-line-clamp: 5; -webkit-box-orient: vertical;
              }
            }
          }
          .link{
            padding: 10upx 20upx 10upx 10upx; margin-bottom: 24upx; background-color: $color-author;
            .vid, .pic{
              width: 80upx; height: 80upx; margin-right: 10upx;
              image{
                width: 100%; height: 100%;
                &.icon-play{
                  top: 50%; left: 50%; z-index: 3; width: 52upx; height: 52upx; transform: translate(-50%, -50%);
                }
              }
              .mask{
                top: 0; left: 0; z-index: 1; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .3);
              }
            }
            .text{
              height: 72upx; padding-top: 4upx; font-size: $font-size-26; line-height: 36upx; color: $default-color;
            }
          }
          .resource{
            margin-bottom: 24upx;
            image{
              width: 320upx;
            }
            .video-box{
              .mask{
                top: 0; left: 0; z-index: 1; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .3);
              }
              .icon-play{
                top: 50%; left: 50%; z-index: 3; width: 96upx; height: 96upx; transform: translate(-50%, -50%);
              }
            }
            .picture-box{
              image{
                width: 160upx; height: 160upx; margin: 10upx 10upx 0 0;
                &.1, &.2, .3{
                  margin-top: 0;
                }
              }
            }
          }
          .other{
            justify-content: space-between; align-items: center; height: 48upx; font-size: $font-size-28; color: $color-gray;
            .opra-box{
              align-items: center;
              .btn-zan{
                align-items: center; margin-right: 20upx; font-size: $font-size-28; line-height: 40upx; color: $color;
                image{
                  width: 48upx; height: 48upx;
                }
              }
              .btn-copy{
                height: 40upx; padding: 0 20upx; font-size: $font-size-24; line-height: 40upx; color: $color; border: $border-1; border-color: $color; border-radius: 40upx;
              }
            }
          }
        }
      }
    }
  }
  .pop-sort{
    .sort-lists{
      view{
        height: 120upx; font-size: $font-size-32; line-height: 120upx; color: $default-color; border-bottom: $border-1;
        image{
          top: 50%; right: 30upx; display: none; width: 48upx; height: 48upx; transform: translateY(-50%);
        }
        &.on{
          color: $color;
          image{
            display: block;
          }
        }
      }
    }
  }
  .pop-show-video{
    .pop-close{
      top: 0; right: 0; z-index: 99; padding: 15upx; background-color: rgba(0, 0, 0, .3);
      image{
        width: 48upx; height: 48upx;
      }
    }
    .pop-con-2{
      width: 100%; height: 100%;
      video{
        display: block; width: 100%; height: 100%;
      }
    }
  }
</style>