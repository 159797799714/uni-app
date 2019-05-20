<template>
	<view class="container">
		<view class="content content-has-operation">
			<scroll-view scroll-y class="scroll-view">
			  <view class="message">
          <view class="pr">
            <textarea v-model="message" placeholder="请输入您的问题，我们将会努力改进" placeholder-class="input-placeholder" maxlength="140" @confirm="submit" />
          </view>
        </view>
        <view class="upload">
        	<view class="lists uni-flex">
        		<view class="item uni-pr uni-ovh" v-for="(item, key, index) in uploadItem" :key="index">
        			<image :src="item.path" mode="aspectFill" class="pic"></image>
              <view class="btn-delete uni-pa" @click="deleteUpload(key)">
              	<image src="/static/images/icon/icon-delete-2.png" mode=""></image>
              </view>
              <view class="progress uni-pa uni-box uni-ovh" v-show="item.uploading">
                <view class="progress-con" :style="{'width': item.percent + '%'}"></view>
              </view>
        		</view>
            <view class="item uni-flex" @click="chooseImg" v-show="total > 0">
            	<image src="/static/images/icon/icon-add.png" mode="" class="add"></image>
            </view>
        	</view>
        </view>
			</scroll-view>
		</view>
    <view class="operation uni-flex uni-box">
      <view class="left uni-flex">
        <view class="uni-flex uni-column" @click="gotoIndex"><image src="/static/images/icon/nav-index.png"></image><text>返回首页</text></view>
      </view>
      <view class="right uni-flex uni-flex-item uni-txc uni-ovh">
        <view class="uni-flex-item" :class="{'disabled': isDisabled}" @click="submit">提交</view>
      </view>
    </view>
	</view>
</template>
<script>
	export default {
		data(){
			return{
				message: '',
        uploadItem: {},
        orderNum: 0, // 索引
        total: 5 // 最大图片上传框
			}
		},
    computed: {
      isDisabled() {
        return this.message.length <= 0
      }
    },
		methods:{
      chooseImg() {
        let index = this.orderNum
        uni.chooseImage({
        	count: 1,
          sizeType: ['compressed'],
          success: res => {
            if (res.tempFiles[0].size / 1024 / 1024 > 5) {
              uni.showModal({
              	title: '提示',
                content: '请选择小于5Mb的图片',
                showCancel: false,
                confirmText: '知道了'
              })
              return
            }
            this.$set(this.uploadItem, index, {
              path: res.tempFilePaths[0],
              req: null,
              uploading: true,
              percent: 0,
              url: ''
            })
            this.uploadItem[index].req = uni.uploadFile({
            	url: this.$apis.uploadPic,
              header: {
                Authorization: this.$store.state.jwt
              },
              fileType: 'image',
              filePath: res.tempFilePaths[0],
              name: 'image',
              formData: {
                type: 'feedback'
              },
              success: res2 => {
                let resData = JSON.parse(res2.data)
                if (!resData.success) {
                  uni.showToast({
                  	title: '图片上传失败，请重新上传',
                    icon: 'none'
                  })
                  if (this.uploadItem[index]) {
                    this.$delete(this.uploadItem, index)
                  }
                  return
                }
                this.uploadItem[index].url = resData.data.key
              },
              fail: () => {
              	uni.showToast({
              		title: '图片上传失败，请重新上传',
              	  icon: 'none'
              	})
                if (this.uploadItem[index]) {
                  this.$delete(this.uploadItem, index)
                }
              }
            })
            this.orderNum ++
            this.total --
            // 上传进度
            this.uploadItem[index].req.onProgressUpdate(taskRes => {
              this.uploadItem[index].percent = taskRes.progress
              if (taskRes.progress >= 100) {
                this.uploadItem[index].uploading = false
              }
            })
          },
          fail: () => {
          	uni.showToast({
          		title: '选择图片失败，请稍候再试',
              icon: 'none'
          	})
          }
        })
      },
			deleteUpload(key) {
        if (this.uploadItem[key]) {
          if (this.uploadItem[key].req && this.uploadItem[key].uploading) {
            this.uploadItem[key].req.abort()
            this.uploadItem[key].uploading = false
          }
          this.$delete(this.uploadItem, key)
          this.total ++
        }
      },
      submit() {
        if (this.isDisabled) return
        let arr = []
        let err = false
        for (let k in this.uploadItem) {
          console.log(this.uploadItem[k])
        	if (this.uploadItem[k].uploading || (this.uploadItem[k].percent >= 0 && !this.uploadItem[k].url)) {
        	  uni.showToast({
        	  	title: '请耐心等待图片上传',
        	    icon: 'none'
        	  })
        	  arr = []
        	  err = true
        	  break
        	}
        	if (this.uploadItem[k].url !== '') arr.push(this.uploadItem[k].url)
        }
        if (err) return
        this.$http({
          url: this.$apis.feedback,
          method: 'POST',
          data: {
            content: this.message,
            images: arr
          },
          cb: (err, data) => {
            if (!err && data.success === true) {
              uni.showModal({
              	title: '已提交',
                content: '感谢您的宝贵建议，我们将努力改进',
                showCancel: false,
                success: res => {
                	if (res.confirm) {
                    this.gotoBack()
                  }
                }
              })
            } else {
              uni.showToast({
              	title: data.message,
                icon: 'none'
              });
            }
          }
        })
      },
      gotoBack() {
        uni.navigateBack()
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
  .message{
    padding: 20upx;
    view{
      height: 280upx; padding: 20upx; background-color: $color-white; border-radius: $border-radius;
      textarea{
        width: 100%; height: 100%; font-size: $font-size-28; line-height: 40upx; color: $default-color; resize: none;
      }
    }
  }
  .upload .lists{
    padding-left: 20upx;
    .item{
      justify-content: center; align-items: center; width: 126upx; height: 126upx; margin-right: 20upx; background-color: $color-white; border-radius: $border-radius;
      .pic{
        width: 100%; height: 100%;
      }
      .add{
        width: 72upx; height: 72upx;
      }
      .btn-delete{
        top: 0; right: 0; padding: 0 0 8upx 8upx;
        image{
          width: 40upx; height: 40upx;
        }
      }
      .progress{
        right: 0; bottom: 20upx; left: 0; z-index: 4; width: 90%; margin: 0 auto; height: 16upx; border: $border-1; border-color: $color-3; border-radius: 16upx;
        .progress-con{
          height: 100%; background-color: $color-3;
        }
      }
    }
  }
</style>
