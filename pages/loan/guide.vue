<template>
  <view class="container">
    <view class="content content-has-operation">
      <scroll-view scroll-y class="scroll-view">
        <rich-text v-for="(item, index) in infoContent" :key="index" :nodes="item.content"></rich-text>
      </scroll-view>
    </view>
    <view class="operation uni-flex uni-box">
    	<view class="right uni-flex uni-flex-item uni-txc uni-ovh">
    		<view class="uni-flex-item gray" @click="gotoBack">知道了</view>
    		<view class="uni-flex-item" :class="{'disabled': reqing}" @click="gotoHandle">我要办卡</view>
    	</view>
    </view>
    <addContact :addData="addData"></addContact>
    <contact :contactData="contactData" @success="applySuccess" @add="gotoAdd"></contact>
  </view>
</template>

<script>
  import addContact from '../../components/addContact.vue'
  import contact from '../../components/contact.vue'
  
  export default {
    components: {
    	addContact,
    	contact
    },
    data() {
      return {
        infoContent: '',
        loanInfo: null,
        reqing: false,
        addData: {},
        contactData: {}
      }
    },
    onLoad(query) {
      if (!query.loanId) this.gotoBack()
      this.$http({
        url: this.$apis.articles,
        method: 'GET',
        data: {
          cat_id: 14
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.infoContent = data.data
            this.infoContent.forEach(item => {
              item.content = item.content.replace(/\<img/gi, '<img style="display:block;max-width:100%;height:auto" ')
            })
          }
        }
      })
      this.$http({
        url: this.$apis.loanDetails,
        method: 'GET',
        data: {
          id: query.loanId
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.loanInfo = data.data
          }
        }
      })
    },
    methods: {
      gotoBack() {
        uni.navigateBack({
          delta: 1,
        });
      },
      gotoAdd() {
      	this.addData = {
      	  show: true,
      	  productId: this.loanInfo.id,
      	  link: this.loanInfo.channel_url_link,
      	  state: 0,
      	  type: 'dk'
      	}
      },
      gotoHandle() {
      	if (this.reqing) return
      	this.reqing = true
      	this.$http({
      		url: this.$apis.contactList,
      		method: 'GET',
      		data: null,
      		cb: (err, data) => {
      			if (err || data.data.data.length <= 0) {
      				this.gotoAdd()
      			} else {
      				this.contactData = {
      				  show: true,
      				  productId: this.loanInfo.id,
      				  link: this.loanInfo.channel_url_link,
      				  state: 0,
      				  type: 'dk',
      				  index: -1
      				}
      			}
      			this.reqing = false
      		}
      	})
      }
    }
  }
</script>
