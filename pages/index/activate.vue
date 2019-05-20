<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="acti-list">
					<view class="acti-title">激活码购买(个) <text>享收购双倍大优惠</text></view>
					<view class="acti-discount">
						<text>黄金:9折；铂金:8折；钻石:7折</text>
					</view>
					<view class="acti-type">
						<view  class="acti-type-party" v-for="(item,index) in actiList" :key="index" v-if="actiList[1][1]">
							<view :class="{'acti-li':true,'actived':selIndex==index+'0'}"  @click="clickLi({index:index,num:0})">
								<view class="acti-li-info" >
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">首购双倍</text>
								</view>
								<view class="acti-li-info" v-if="index===2">
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">永久双倍</text>
								</view>
								<view class="acti-li-main">
									<text>{{item[0][0]}}</text>
									<text class="em">￥:{{item[0][1]}}</text>
								</view>
							</view>
							<view :class="{'acti-li':true,'actived':selIndex==index+'1'}" @click="clickLi({index:index,num:1})">
								<view class="acti-li-info" >
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">首购双倍</text>
								</view>
								<view class="acti-li-info" v-if="index===2">
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">永久双倍</text>
								</view>
								<view class="acti-li-main">
									<text>{{item[1][0]}}</text>
									<text class="em">￥:{{item[1][1]}}</text>
								</view>
							</view>
							<view  :class="{'acti-li':true,'actived':selIndex==index+'2'}" @click="clickLi({index:index,num:2})">
								<view class="acti-li-info" >
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">首购双倍</text>
								</view>
								<view class="acti-li-info" v-if="index===2">
									<image src="../../static/images/buy/juxin.png"></image>
									<text class="text">永久双倍</text>
								</view>
								<view class="acti-li-main">
									<text>{{item[2][0]}}</text>
									<text class="em">￥:{{item[2][1]}}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="buy-now" @click="gotoBuy">立即购买</view>
				</view>
				<view class="acti-info">
					<view class="acti-info-title">温馨提示</view>
					<view>会员激活码购买成功后自动发放至个人激活码库，各等级购买享受不同折扣；</view>
					<view>电子商品一经购买不以任何理由退款，激活码有效期为1年，通知用户账号密码保存好，若影视账号遗失更换账号后续重新购买激活码！</view>
					<view>黄金会员（含）级别以上联系客服加入会员群聊，共同创薪，赢领2019!</view>
				</view>
			</scroll-view>
		</view>
    <!-- 确认购买 -->
    <view class="sure-buy-alert" v-if="isSure">
			<view class="white-space" @click="cancelBuy"></view>
    	<view class="sure-rase">
    		<view class="title"><text>确认购买</text></view>
    		<view class="buy-detail">
    			<view class="money">￥{{def[1]}}{{def[1]>1?'.00':''}}</view>
    			<view class="h4 detail-name"><text class="text">购买商品</text>{{def[0]}}个激活码</view>
    		</view>
    		<view class="h4 pay-type">
    			<text class="text">付款类型</text> 
    			<image src="../../static/images/buy/yes.png" mode=""></image>
    			<text class="span">在线支付</text>	
    		</view>
    		<view class="h4 pay-way">
    			<text class="text">付款方式</text> 
    			<view :class="{'span':true,'actived':way=='ablipay'}" @click="sleWay('ablipay')" v-if="false">
    				<image src="../../static/images/buy/zhifubao.png" mode=""></image>
    				<text>支付宝</text>
    			</view> 
    			<view :class="{'span':true,'actived':way=='weichat'}" @click="sleWay('weichat')">
    				<image src="../../static/images/buy/weixin.png" mode=""></image>
    				<text>微信</text>
    			</view>
    		</view>
    		<view class="pay">
    			<text @click="payAct"> 立即支付</text>
    		</view>
    	</view>
    </view>
    <!-- 购买激活码成功 -->
    <view class="buy-success" v-if="isSuccess">
    	<image src="../../static/images/pay/certain.png" ></image>
    	<view class="success-words">激活码购买成功</view>
    	<view class="btn look-acti" @click="gotoLookActi">查看激活码</view>
    	<view class="btn goFirst" @click="gotoIndex">返回首页</view>
    </view>
	</view>
</template>

<script>
	export default {
		data(){
			return{
				title:'激活码超市',
				actiList:[[],[],[]],
				isFirst:true,
				selIndex:'00',
				isSure:false,
				isNav:true,
				count:1,
				way:'weichat',
				def:[],
				isSuccess:false,
				role:'',
				priceAll:'',
				goodsId:'',  // 商品id
				appid:'',
				
			}
		},
    onHide() {
    	this.isSuccess = false;
    },
		methods:{
			clickLi(data){
				this.selIndex = data.index+''+data.num;
				this.def = this.actiList[data.index][data.num];
				this.goodsId = this.actiList[data.index][data.num][2];
			},
			gotoBuy(){
				this.isNav = false;
				this.isSure = true;
			},
			sleWay(data){
				this.way = data;
			},
			payAct(){
				this.isSure = false;
				// 激活码订单提交
				uni.request({
					url: this.$apis.weixinpay, //仅为示例，并非真实接口地址。
					method: 'GET',
					data: {
						type:0,
						goods_id:this.goodsId
					},
					header: {
						'Authorization': uni.getStorageSync('jwt') //自定义请求头信息
					},
					success: function(res){
						let def = res.data.data;
						let timestamp = JSON.stringify(def.timestamp);
						uni.requestPayment({
							provider: 'wxpay',
							timeStamp: timestamp,
							nonceStr: def.noncestr,
							package: def.package,
							partnerid:def.partnerid,
							prepayid:def.prepayid,
							signType: 'MD5',
							paySign: def.sign,
							orderInfo:def,
							success: function (res) {
								this.$getInfo();
								this.isSuccess = true;  //支付成功页面
							}.bind(this),
							fail: function (err) {
								uni.showModal({
									content: '支付失败',
									showCancel: false
								})
							}.bind(this),
						})
					}.bind(this)
				});
			},
			cancelBuy(){
				this.isSure = false;
			},
			gotoLookActi(){
        this.$navigateTo({
          url: '/pages/index/myActivate'
        })
			},
			gotoIndex(){
				this.isSuccess = false;
        uni.switchTab({
        	url: '/pages/index/index'
        })
			}
		},
		onLoad() {
			// 激活码商品列表
			let role = this.$store.state.userInfo.role;
			// let role = 4;
			this.role = role;
			this.$http({
			  url: this.$apis.goodlist,
			  method: 'GET',
				data:{
					type:1,
				},
			  cb: (err, data) => {
			    if (!err && data.success) {
						//判断用户等级，变换成相应的价格
						this.role = role;
						data.data.map((item,index)=>{
							if(role === 2){
								item.goods_price = item.goods_price*0.9;
								this.def[1]=this.def[1]*0.9;
							}
							else if(role === 3){
								item.goods_price = item.goods_price*0.8;
								this.def[1]=this.def[1]*0.8;
							}
							else if(role === 4){
								item.goods_price = item.goods_price*0.7;
								this.def[1]=this.def[1]*0.7;
							}
							else{
								item.number = item.number;
								item.goods_price = item.goods_price;
							}
							if(index<3){
								let arr = [];
								arr.push(item.number);
								arr.push(item.goods_price);
								arr.push(item.goods_id);
								this.actiList[0].push(arr);
							}
							else if(index>=3 && index<6){
								let arr = [];
								arr.push(item.number);
								arr.push(item.goods_price);
								arr.push(item.goods_id);
								this.actiList[1].push(arr);
							}
							else if(index>=6){
								let arr = [];
								arr.push(item.number);
								arr.push(item.goods_price);
								arr.push(item.goods_id);
								this.actiList[2].push(arr);
							}
						})
						this.def = this.actiList[0][0];
						this.goodsId = this.actiList[0][0][2];
			    } 
					else {
			       uni.showToast({
			      	title: '数据请求失败，请重试',
			        icon: 'none'
			      })
			    }
			  }
			})
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
  .content{height: 100%; width: 100%; padding-bottom: 100upx;font-size: 28upx;display: flex;flex-direction: column; box-sizing: border-box;overflow: hidden;}
	.acti-list{padding: 63upx 38upx 35upx 36upx;background:#fff;
	  .acti-title{font-size: 36upx; font-weight: 500;height: 36upx;
			text{ background: #F84D5D;height: 34upx;font-weight:400;border-radius:3upx; padding: 8upx 17upx 7upx 23upx;color: #fff;font-size: 20upx;}
		}
		.acti-discount{font-size: 24upx; font-family: PingFang-SC-Regular;line-height: 40upx;margin-top: 29upx;margin-bottom: 41upx; opacity: 0.8;height: 23upx; color: #333333;}
		.acti-type{margin-top: 12upx;
			.acti-type-party{display: flex;justify-content: space-between;}
			.acti-li{margin-bottom: 18upx; width: 210upx; height: 104upx;border: 1px solid #01C12D;border-radius: 6upx;position: relative;
				.acti-li-info{width: 91upx;height: 86upx; position: absolute;top: 0;left: 0;
					image{height:100%;width: 100%;}
					.text{font-size: 16upx;position: absolute;top: 26upx;left: -1upx; transform: rotate(-45deg); font-weight: bold;color: #C1014E;line-height: 5upx;font-family:PingFang-SC-Bold;}
				}
				.acti-li-main{color: #01C12D; height: 100%; width: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center;
					text{font-size: 34upx;font-weight: bold;line-height: 50upx;}
					.em{font-size: 20upx;line-height: 50upx; font-weight: 400;}
				}
			}
			.actived{background:#01C12D;color: #fff;
				text{color:#fff;}
			}
		}
		.buy-now{width: 353upx;margin-left:50%;transform: translateX(-50%);font-weight:bold; height: 80upx;display: block;margin-top: 28upx; font-size: 32upx; background:linear-gradient(90deg,rgba(21,216,66,1),rgba(1,193,45,1));border-radius: 40upx; box-shadow:0 10upx 20upx 0 rgba(36,211,44,0.1);text-align: center;line-height: 80upx;color: #fff;}
	}
  .acti-info{flex:1;margin-top: 20upx;background: #fff;padding:32upx 35upx 0 36upx;
		.acti-info-title{line-height: 5upx;display: block; font-weight: bold;font-size: 36upx;color: #333333;font-family:PingFang-SC-Bold;height: 36upx; margin-bottom: 18upx;}
		view{font-size: 24upx;line-height: 40upx;}
	}
	.sure-buy-alert{height:100%; width:100%; background:rgba(0,0,0,0.3); position: absolute; top:0; left:0;display: flex;flex-direction: column;
	  .white-space{flex: 1;}
	  .sure-rase{height: 837upx; width: 100%; background: #fff;display: flex; flex-direction: column;
			.title{font-size: 34upx; text-align: center; height: 104upx;line-height: 104upx; font-weight:bold; font-family:PingFang-SC-Bold; border-bottom: 1px solid #C2C2C2;}
			.buy-detail{padding-top: 49upx; display: flex; flex-direction: column;border-bottom: 1px solid #C2C2C2;
				.money{text-align: center; font-size: 66upx; font-weight: 500;line-height: 66upx;}
				.detail-name{font-size: 28upx;line-height: 28upx;margin-top: 61upx; margin-bottom: 54upx; border: 0;}
		  }
			.h4{padding:0 38upx; font-size: 28upx; border-bottom: 1px solid #C2C2C2;font-weight: 500;
				.text{margin-right: 34upx;color: #666666;}
			}
			.pay-type{font-size: 28upx; line-height: 94upx;height: 94upx;display: flex;color: #666666;
			  image{height: 46upx;width: 46upx;margin-top: 20upx; margin-right: 9upx;}
				.span{font-size: 28upx; line-height: 94upx;height: 94upx;display: flex;font-weight: 500;color: #333333;}
			}
			.pay-way{display: flex; height: 104upx; line-height: 104upx; align-items: center;
				.span{display:flex;margin-right: 13upx; height: 54upx;width: 200upx; line-height: 54upx;align-items: center; justify-content: center; border:1px solid #ccc;border-radius: 27upx;box-sizing: border-box;}
			  image{height: 46upx;width: 46upx;margin-top: 4upx; margin-right: 11upx;}
				.actived{border-color: rgba(1,193,45,1);}
			}
			.pay{display: flex; flex:1; justify-content: center; align-items: center; justify-content: center; align-content: center;
				text{height: 86upx; width: 430upx; background:rgba(1,193,45,1);text-align: center;line-height: 86upx; border-radius: 10upx; color: #fff; display: block;font-size: 32upx; }
			}
		}
	}
	.buy-success {position: absolute;top: 0;left: 0;background: #fff; width: 100%; height:100%;padding-bottom: 100upx; display: flex;flex-direction: column;align-items: center;
		image{height: 330upx; width: 260upx;margin-top: 110upx; margin-bottom: 47upx;}
		.success-words{font-size: 38upx; font-weight: bold; font-family:PingFang-SC-Bold;color: #fd0101;margin-bottom: 62upx;}
		.btn{border:1px solid #FF0000;font-weight:500;margin-bottom: 28upx; height: 88upx; width: 500upx; border-radius: 14upx;line-height: 88upx; text-align: center; font-size: 30upx;}
		.look-acti{color: #fff; background: #FF0000;}
	}
</style>
