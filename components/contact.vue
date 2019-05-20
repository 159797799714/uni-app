<template name="contact">
	<view class="pop contact" v-show="isShow">
    <view class="mask" @click="hide"></view>
    <view class="pop-con">
      <view class="pop-title uni-box" v-if="type === 'xyk'">申请人列表</view>
      <view class="pop-title uni-box" v-else-if="type === 'bx'">投保人信息</view>
      <view class="pop-title uni-box" v-else-if="type === 'dk'">贷款人信息</view>
      <view class="add-user uni-flex">
      	<view class="uni-flex" @click="addContact">
      		<image src="/static/images/icon/icon-add.png"></image>
          <text v-if="type === 'xyk'">填写申请人</text>
          <text v-else-if="type === 'bx'">填写投保人信息</text>
          <text v-else-if="type === 'dk'">填写贷款人信息</text>
      	</view>
      </view>
      <view class="lists">
      	<scroll-view scroll-y class="scroll-view">
      		<view class="item uni-flex" v-for="(item, index) in lists" :key="item.id" @click="choose(index)">
      			<image class="dot" :src="index === chooseIndex ? '/static/images/icon/icon-dot-2.png' : '/static/images/icon/icon-dot-1.png'"></image>
            <view class="info uni-flex-item">
            	<view class="uni-flex"><text>姓名：</text>{{ item.name }}</view>
            	<view class="uni-flex"><text>身份证：</text>{{ item.id_card }}</view>
            	<view class="uni-flex"><text>手机号：</text>{{ item.mobile }}</view>
            </view>
            <view class="delete" @click.stop="deletePop(index)">
            	<image src="/static/images/icon/icon-delete.png"></image>
            </view>
      		</view>
      	</scroll-view>
      </view>
      <view class="agreement uni-flex uni-box">
      	<image :src="agree ? '/static/images/icon/icon-check-2.png' : '/static/images/icon/icon-check-1.png'" @click="checkAgree"></image>
      	本人已阅读并同意
      	<view @click="showAgree">《{{ config.system_nick_name }}用户协议》</view>
      </view>
      <view class="operation uni-flex uni-box">
      	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
      		<view class="uni-flex-item gray" @click="hide">取消</view>
      		<view class="uni-flex-item" :class="{'disabled': disabled || submiting}" @click="checkInfo">立即申请</view>
      	</view>
      </view>
    </view>
    <vueagreement :agreeData="agreeData"></vueagreement>
  </view>
</template>

<script>
  import vueagreement from './agreement.vue'
  
	export default {
    props: {
      contactData: {
        type: Object,
        required: true
      }
    },
    components: {
      vueagreement
    },
		data() {
			return {
				isShow: false,
        type: '',
        productId: '',
        link: '',
        lists: [], // 申请人列表
        agree: true, // 是否同意协议
        chooseIndex: -1, // 当前选择申请人
        deleteIndex: 0,
        deleting: false,
        submiting: false,
        agreeData: {},
        isCardApply: false
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      disabled() {
        return this.lists.length <= 0 || !this.agree || this.chooseIndex === -1
      }
    },
    methods: {
      hide() {
      	this.isShow = false
      	this.$emit('close')
      },
      addContact() {
        this.hide()
        this.$emit('add')
      },
      choose(n) {
        if (this.chooseIndex === n) {
          this.chooseIndex = -1
        } else {
          this.chooseIndex = n
        }
      },
      checkAgree() {
        this.agree = !this.agree
      },
      showAgree() {
        this.agreeData = {
          show: true
        }
      },
      getLIsts(b) {
        this.$http({
        	url: this.$apis.contactList,
        	method: 'GET',
        	data: null,
        	cb: (err, data) => {
        		if (!err && data.success && data.data.data.length > 0) {
        			this.lists = data.data.data
        		} else {
              this.addContact()
        		}
        	}
        })
      },
      deletePop(n) {
        this.deleteIndex = n
        uni.showModal({
        	title: '提示',
          content: `'您确定要删除申请人 ${this.lists[this.deleteIndex].name} 吗？'`,
          success: (res) => {
          	if (res.confirm) {
              if (this.deleting) return
              this.deleting = true
              this.$http({
                url: this.$apis.contactDelete,
                method: 'DELETE',
                data: {
                  id: this.lists[this.deleteIndex].id
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                    this.getLIsts(false)
                  } else {
                    uni.showToast({
                    	title: data.message ? data.message : '删除成功',
                      icon: 'none'
                    })
                  }
                  this.deleting = false
                }
              })
            }
          }
        })
      },
      checkInfo() {
        if (this.disabled || this.submiting) return
        this.submit()
      },
      submit() {
        if (this.submiting || !this.type) return
        this.submiting = true
        switch (this.type) {
          case 'xyk':
            if (this.isCardApply) {
              this.$http({
                url: this.$apis.createContact,
                method: 'POST',
                data: {
                  id: this.lists[this.chooseIndex].id,
                  card_id: this.productId
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                    this.hide()
                    this.submiting = false
                    this.$emit('success')
                    setTimeout(() => {
                      uni.setStorageSync('webSrc', data.data.apply_link)
                      this.$navigateTo({
                      	url: '/pages/web/index'
                      })
                    }, 50)
                  } else {
                    uni.showToast({
                    	title: data && data.message ? data.message : '申请失败',
                      icon: 'none'
                    })
                    this.submiting = false
                  }
                }
              })
            } else {
              this.$http({
                url: this.$apis.createContact,
                method: 'POST',
                data: {
                  id: this.lists[this.chooseIndex].id,
                  bank_id: this.productId
                },
                cb: (err, data) => {
                  if (!err && data.success) {
                    this.hide()
                    this.submiting = false
                    this.$emit('success')
                    setTimeout(() => {
                      uni.setStorageSync('webSrc', data.data.apply_link)
                    	this.$navigateTo({
                    		url: '/pages/web/index'
                    	})
                    }, 50)
                  } else {
                    uni.showToast({
                      title: data && data.message ? data.message : '申请失败',
                      icon: 'none'
                    })
                    this.submiting = false
                  }
                }
              })
            }
            break
          case 'bx':
            this.$http({
              url: this.$apis.insuranceOrder,
              method: 'POST',
              data: {
                contact_id: this.lists[this.chooseIndex].id,
                id: this.productId
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  this.hide()
                  this.submiting = false
                  this.$emit('success')
                  setTimeout(() => {
                    uni.setStorageSync('webSrc', this.link)
                  	this.$navigateTo({
                  		url: '/pages/web/index'
                  	})
                  }, 50)
                } else {
                  uni.showToast({
                  	title: data && data.message ? data.message : '申请失败',
                  	icon: 'none'
                  })
                  this.submiting = false
                }
              }
            })
            break
          case 'dk':
            this.$http({
              url: this.$apis.loanOrder,
              method: 'POST',
              data: {
                contact_id: this.lists[this.chooseIndex].id,
                id: this.productId
              },
              cb: (err, data) => {
                if (!err && data.success) {
                  this.hide()
                  this.submiting = false
                  this.$emit('success')
                  setTimeout(() => {
                    uni.setStorageSync('webSrc', this.link)
                  	this.$navigateTo({
                  		url: '/pages/web/index' 
                  	})
                  }, 50)
                } else {
                  uni.showToast({
                    title: data && data.message ? data.message : '申请失败',
                    icon: 'none'
                  })
                  this.submiting = false
                }
              }
            })
            break
        }
      }
    },
    watch: {
      contactData: function (val) {
        this.isShow = val.show
        this.type = val.type
        this.productId = val.productId
        this.link = val.link
        this.chooseIndex = val.index
        this.isCardApply = val.card
        if (this.isShow) {
          this.getLIsts(true)
        }
      }
    }
	}
</script>

<style lang="scss" scoped>
  @import '../common/var';
	.pop-title{
		height: 120upx; padding: 0 30upx; font-size: $font-size-36; line-height: 120upx; color: $default-color; border-bottom: $border-1;
	}
  .add-user{
    padding: 26upx 56upx; border-bottom: $border-1;
    view{
      justify-content: center; align-items: center; width: 100%; height: 108upx; font-size: $font-size-28; color: $color; background-color: $bonus-bg; border-radius: $border-radius;
      image{
        width: 72upx; height: 72upx; margin-right: 8upx;
      }
    }
  }
  .lists{
    .scroll-view{
      max-height: 450upx;
    }
    .item{
      align-items: center; height: 180upx; padding-left: 30upx; border-bottom: $border-1;
      .dot{
        width: 48upx; height: 48upx; margin-right: 20upx;
      }
      .info{
        font-size: $font-size-28; line-height: 40upx; color: $color-gray;
        text{
          width: 120upx; color: $default-color;
        }
      }
      .delete{
        align-self: flex-start; width: 48upx; height: 48upx; padding: 8upx;
        image{
          width: 48upx; height: 48upx;
        }
      }
    }
  }
  .agreement{
  	align-items: center; height: 64upx; padding: 0 30upx; font-size: $font-size-24; color: $color-gray; border-top: $border-1;
  	image{
  		width: 48upx; height: 48upx; margin-right: 8upx;
  	}
  }
</style>
