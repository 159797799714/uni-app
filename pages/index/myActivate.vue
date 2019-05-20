<template>
	<view class="container">
		<view class="content">
				<view class="header">
					<image src="../../static/images/myActivate/card.png" class="header_bg"></image>
					<view class="header_hover">
						<image src="../../static/images/myActivate/icon.png" mode=""></image>
						<view class="count">
							<text class="sum">总数(个)</text>
							<text class="sum-num">{{sum.code_total}}</text>
							<text class="count-info">激活码领取后请在10天内激活</text>
						</view>
						<view class="usable" @click="copyBtn">
							<text class="words">可用(个)</text>
							<text class="num">{{sum.use_code_total}}</text>
							<text :class="{'uasble-get':true,'unable':isAble}" >立即领取</text>
						</view>
					</view>
				</view>
				<view class="list-head">
					<text>序号</text><text>激活码</text>
				</view>
				<scroll-view scroll-y="true" class="list" @scrolltolower="upper">
					<view class="list-code" v-for="(item,index) in used_num" :key="index"  v-if="total!=index">
						<text >{{total-index}}</text>
						<text class="list-code-info" >{{item.code_content}}</text>
						<text class="copy" @click="copyActi(item.code_content)">复制</text>
					</view>
				</scroll-view>
			<!-- 复制激活码弹窗 -->
			<view class="alert" v-if="isAlert">
				<view class="alert-main">
					<view class="alert-info">
						<text class="acti-mun">{{used_num[0].code_content}}</text>
							<text class="copy-btn" @click="copyActi(used_num[0])">复制激活码</text>
					</view>
					<view class="alert-close">
						<image src="../../static/images/myActivate/close.png" @click="cancelAlert"></image>
					</view>
				</view>
			</view>
			<view class="copy-suss" v-if="isSuccess">
				<image src="../../static/images/myActivate/success.png" ></image>
				<view>复制成功</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				used_num:[],
				isAlert:false,
				sum:{
					'code_content':0,
					'use_code_total':0
				},
				isAble:false,
				isSuccess:false,
				total:'',
				page:1,
				isScroll:false
			};
		},
		methods:{
			// 页面复制或者立即领取事件
			copyBtn(){
				uni.request({
					url: this.$apis.getActivation,
					method:'GET',
					header: {
						Authorization: uni.getStorageSync('jwt'),
					},
					success: (res) => {
						let data = res.data.data;
						this.used_num = [{code_content:data.code_content},...this.used_num,];
						this.total++;
						this.sum.use_code_total = data.surplus_total;
						if(data.use_code_total == 0){
							this.copyBtn = null;
							this.isAble = true;
						}
						this.isAlert = true;
					}
				});
			},
			//弹窗复制按钮事件
			copyActi(obj){
				//判断传入的数据
				let data;
				if(typeof(obj) == 'string'){
					data = obj;
				}
				else{data = obj.code_content};
				// 复制到剪贴板
				uni.setClipboardData({
					data: data,
					success: function () {
						this.isSuccess = true;
						let timer = setTimeout(function(){
							this.isSuccess = false;
							}.bind(this),500)
					}.bind(this)
				});
				this.isAlert = false;
			},
			cancelAlert(){
				this.isAlert = false;
			},
			// 上拉加载更多
			upper(){
				this.page = this.page+1;
				this.isScroll = true;
				uni.request({
					url: this.$apis.uesdActivation, 
					method:'POST',
					data:{
						page:this.page,
					},
					header: {
						 Authorization: uni.getStorageSync('jwt'),
					},
					success: (res) => {
						let data = res.data.data;
						if(this.page>data.last_page){
							this.upper=null;
							uni.showToast({
								title: '没有更多数据了',
							  icon: 'none'
							})
						}
						this.total = data.total;
						this.used_num = [...this.used_num,...data.data];
					}
				});
			}
		},
		onLoad(){
			// 首页激活码数量
			let value = uni.getStorageSync('jwt');
			uni.request({
				url: this.$apis.activation, 
				method:'GET',
				header: {
					 Authorization:value,
				},
				success: (res) => {
					let data = res.data.data;
					this.sum = data;
					if(data.use_code_total == 0){
						this.copyBtn = null;
						this.isAble = true;
					}
				}
			});
		// 初始化已用激活码列表
			uni.request({
				url: this.$apis.uesdActivation, 
				method:'POST',
				data:{
					page:1,
				},
				header: {
					 Authorization:value,
				},
				success: (res) => {
					this.total = res.data.data.total;
					let data = res.data.data.data;
					this.used_num = data;
				}
			});
		}
	}
</script>

<style lang="scss" scoped>
.content{height: 100%;width: 100%; padding:46upx 40upx 100upx 35upx; box-sizing: border-box;background: #fff;display: flex;flex-direction: column;
  .header{height: 200upx; width: 100%;position: relative;
	  .header_bg{height: 100%;width: 100%;}
		.header_hover{position: absolute;top: 0;left: 0;width: 100%;height: 100%;display: flex;align-items: center; padding-left: 25upx;
		  image{height: 104upx;width: 118upx;margin-right: 21upx;}
			.count{height: 100%;width: 237upx;box-sizing: border-box;padding: 32upx 0 35upx 0upx; margin-right: 55upx; display: flex;flex-direction: column;
			  .sum{height: 34upx;width: 103upx;border:1px solid #FF5957;border-radius:3upx;font-size: 20upx;line-height: 34upx;color: #FF5957;text-align: center;}
			  .sum-num{font-size: 60upx;height: 75upx;color: #FF5957;font-weight: 500;line-height: 45upx;margin-top: 15upx;}
				.count-info{font-size: 16upx;line-height: 16upx;color: #9A9A9A;margin-top: 23upx;}
			}
		  .usable{height: 147upx;width: 222upx;box-sizing: border-box;padding-left: 20upx;display: flex;flex-direction: column;align-items: center;border-left: 1px dashed #FF0000;
				.words{font-size: 22upx;font-weight: bold;color: #F58A89;font-family:PingFang-SC-Bold;margin-bottom: 12upx;}
				.num{font-size: 44upx;font-weight: bold;color: #FF0300;font-family:PingFang-SC-Bold;margin-bottom: 20upx;height: 33upx;line-height: 33upx;}
				.uasble-get{color: #fff;font-size:24upx;background: #FF0300; width: 138upx; height: 40upx;text-align: center;border-radius: 20upx;line-height: 40upx;}
			  .unable{background: #ccc;}
			}
		}
	}
	.list-head{width: 100%;box-sizing: border-box; padding-left: 44upx;margin-top: 52upx; height: 51upx;background: #F5F5F5;font-size: 30upx;line-height: 51upx;font-weight: bold;color: #333333;font-family:PingFang-SC-Bold;
	  text{margin-right: 176upx;}
	}
	.list{height:780upx;width: 100%;
		.list-code{height: 78upx;line-height: 78upx;border-bottom: 2px solid #E8E8E8;width: 602upx;margin-left: 44upx;display: flex;align-items: center;justify-content: space-between;
			text{font-size: 26upx;width: 80upx;overflow: hidden;}
			.list-code-info{flex: 1;text-align: left;}
			.copy{height: 38upx;width: 97upx;background: #F75100;line-height: 38upx;text-align: center;color: #fff; font-size: 25upx;font-family:PingFang-SC-Regular;border-radius: 3upx;}
		}
	}
	.alert{height:100%;width: 100%;box-sizing:border-box;padding-bottom: 100upx;background:rgba(0,0,0,0.3);position: absolute;top: 0;left: 0;
		.alert-main{margin-top: 629upx;padding-left: 33upx;padding-right: 38upx;
		  .alert-info{height: 129upx;background: #fff;display: flex;justify-content: center;align-items: center;border-radius: 10upx;
			  .acti-mun{width: 320upx;height: 60upx;background: #E0E0E0;color: #000000;font-size: 25upx;line-height: 60upx;text-align: center; border-radius:3upx;margin-right: 55upx;overflow: hidden;}
			  .copy-btn{background: #FFAE00;border-radius: 3upx;height: 60upx;width: 215upx;color: #fff;font-size: 30upx;font-family:PingFang-SC-Bold;font-weight: bold;line-height: 60upx;text-align: center;}
			}
			.alert-close{height:60upx; width: 100%;display: flex;justify-content: center;margin-top: 48upx;
			  image{height: 100%;width: 60upx;}
			}
		}
	}
	.copy-suss{position: absolute;top: 50%;left: 50%; height: 200upx;width: 200upx;transform: translate(-50%); background: rgba(0,0,0,0.7);border-radius: 20upx;
	  image{height:80upx;width: 120upx;margin-left: 40upx;margin-top: 30upx;}
		view{text-align: center;color: #fff;line-height: 80upx;font-size: 30upx;}
	}
}
</style>
