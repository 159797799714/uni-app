<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="card" v-if="cardLists.length > 0">
					<view class="lists">
						<view class="item uni-flex uni-box" v-for="item in cardLists" :key="item.id" @click="gotoCard(item.id)">
							<image :src="item.logo_url" mode="aspectFill"></image>
							<view class="box uni-flex-item">
								<view class="name uni-textover">{{ item.card_name }}</view>
								<view class="gray uni-textover">{{ item.short_desc }}</view>
								<view class="tag uni-flex" v-if="item.tagArr.length > 0">
									<view class="tag-item uni-box" v-for="(tagitem, tagindex) in item.tagArr" :key="tagindex">{{ tagitem }}</view>
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
	export default {
		data() {
			return {
				cardLists: []
			};
		},
		onLoad(query) {
      this.$http({
        url: this.$apis.card,
        method: 'GET',
        data: {
          recommened: query.id
        },
        cb: (err, data) => {
          if (!err && data.success) {
            this.cardLists = data.data
            this.cardLists.forEach(item => {
            	this.$set(item, 'tagArr', this.handleStr(item.show_tags))
            })
          }
          uni.setNavigationBarTitle({
          	title: query.title || '精选推荐'
          })
        }
      })
		},
    methods: {
      handleStr: function (str) {
        return str.split(',')
      },
      gotoCard(id) {
      	this.$navigateTo({
      		url: '/pages/credit/card?id=' + id
      	})
      }
    }
	}
</script>
