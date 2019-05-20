<template>
  <view class="container">
    <view class="content">
    	<scroll-view scroll-y class="scroll-view">
    		<view class="li">
    			<view class="vip-img">
    				<image src="../../static/images/vip/card1.png"></image>
    			</view>
    			<view class="vip-info" v-if="goodlist[2]">
    				<view class="h3">{{goodlist[2].goods_name}} VIP 特权</view>
    				<view class="price" >￥{{goodlist[2].goods_price}}.00
							<text>{{goodlist[2].originalPrice}}</text>
						</view>
    				<view class="h4" >
							<text class="btn" v-if="role<=3" @click="toBuy(goodlist[2].goods_name)">立即购买</text>
							<text class="cannot" v-if="role>3">立即购买</text>
						</view>
    				<view class="h5" @click="lookInfo(2)">购买率：{{goodlist[2].purchaseRate}}</view>
    				<view class="detail" @click="lookInfo(2)">
    					<text>查看权益详情</text>
							<image src="../../static/images/icon/jiantou.png"  :class="{'detail-img':true,'open':infoIndex===2}"></image>
    				</view>
    			</view>
    		</view>
				<view class="power-info" v-if="infoIndex===2">
					<view class="series one" >
						<text style="color: #E4DBBD">————</text>
						<text>佣金比例</text>
						<text>激活码赠送</text>
						<text>激活码购买</text>
						<text>锁粉奖励</text>
						<text>代理费退还</text>
						<text>代理权时间</text>
					</view>
					<view class="series">
						<text>普通</text>
						<text>30%</text>
						<text>0个</text>
						<text>无折扣</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series">
						<text>黄金</text>
						<text>60%</text>
						<text>30个</text>
						<text>9折</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series">
						<text>铂金</text>
						<text>80%</text>
						<text>200个</text>
						<text>8折</text>
						<text>10/2元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
					<view class="series zuanshi" >
						<text>钻石</text>
						<text>95%</text>
						<text>500个</text>
						<text>7折</text>
						<text>10/3元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
				</view>
    		<view class="li">
    			<view class="vip-img">
    				<image src="../../static/images/vip/card2.png"></image>
    			</view>
    			<view class="vip-info" v-if="goodlist[1]">
    				<view class="h3">{{goodlist[1].goods_name}} VIP 特权</view>
    				<view class="price" >￥{{goodlist[1].goods_price}}.00
							<text>{{goodlist[1].originalPrice}}</text>
						</view>
    				<view class="h4" >
							<text class="btn" v-if="role<=2" @click="toBuy(goodlist[1].goods_name)">立即购买</text>
							<text class="cannot" v-if="role>2">立即购买</text>
						</view>
    				<view class="h5" @click="lookInfo(1)">购买率：{{goodlist[1].purchaseRate}}</view>
    				<view class="detail" @click="lookInfo(1)">
    					<text>查看权益详情</text>
							<image src="../../static/images/icon/jiantou.png" :class="{'detail-img':true,'open':infoIndex===1}"></image>
    				</view>
    			</view>
    		</view>
				<view class="power-info" v-if="infoIndex===1">
					<view class="series one" >
						<text style="color: #E4DBBD">————</text>
						<text>佣金比例</text>
						<text>激活码赠送</text>
						<text>激活码购买</text>
						<text>锁粉奖励</text>
						<text>代理费退还</text>
						<text>代理权时间</text>
					</view>
					<view class="series">
						<text>普通</text>
						<text>30%</text>
						<text>0个</text>
						<text>无折扣</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series">
						<text>黄金</text>
						<text>60%</text>
						<text>30个</text>
						<text>9折</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series bojin">
						<text>铂金</text>
						<text>80%</text>
						<text>200个</text>
						<text>8折</text>
						<text>10/2元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
					<view class="series last" >
						<text>钻石</text>
						<text>95%</text>
						<text>500个</text>
						<text>7折</text>
						<text>10/3元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
				</view>
    		<view class="li">
    			<view class="vip-img">
    				<image src="../../static/images/vip/card3.png"></image>
    			</view>
    			<view class="vip-info" v-if="goodlist[0]">
    				<view class="h3">{{goodlist[0].goods_name}} VIP 特权</view>
    				<view class="price" >￥{{goodlist[0].goods_price}}.00<text>{{goodlist[0].originalPrice}}</text></view>
    				<view class="h4" >
							<text class="btn" v-if="role<=1" @click="toBuy(goodlist[0].goods_name)">立即购买</text>
							<text class="cannot" v-if="role>1">立即购买</text>
						</view>
    				<view class="h5" @click="lookInfo(0)">购买率：{{goodlist[0].purchaseRate}}</view>
    				<view class="detail" @click="lookInfo(0)">
    					<text>查看权益详情</text>
							<image src="../../static/images/icon/jiantou.png" :class="{'detail-img':true,'open':infoIndex===0}"></image>
    				</view>
    			</view>
    		</view>
				<view class="power-info" v-if="infoIndex===0">
					<view class="series one" >
						<text style="color: #E4DBBD">————</text>
						<text>佣金比例</text>
						<text>激活码赠送</text>
						<text>激活码购买</text>
						<text>锁粉奖励</text>
						<text>代理费退还</text>
						<text>代理权时间</text>
					</view>
					<view class="series">
						<text>普通</text>
						<text>30%</text>
						<text>0个</text>
						<text>无折扣</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series huangjin">
						<text>黄金</text>
						<text>60%</text>
						<text>30个</text>
						<text>9折</text>
						<text>0元</text>
						<text>无</text>
						<text>永久</text>
					</view>
					<view class="series ">
						<text>铂金</text>
						<text>80%</text>
						<text>200个</text>
						<text>8折</text>
						<text>10/2元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
					<view class="series last" >
						<text>钻石</text>
						<text>95%</text>
						<text>500个</text>
						<text>7折</text>
						<text>10/3元</text>
						<text>全额</text>
						<text>永久</text>
					</view>
				</view>
    		<view class="rule uni-flex">
    			<image src="/static/images/index/rule.png" mode="widthFix"></image>
    		</view>
    	</scroll-view>
    </view>
  	<!-- 点击立即购买温馨提示 -->
  	<view class="alert" v-if="isAlert">
  		<view class="alert-info">
  			<view class="alert-title">温馨提示</view>
  			<view class="alert-words">尊敬的会员：您现在点击的是（{{grade}}VIP会员）永久卡，购买成功后您将享受平台所有业务佣金{{scale}}%的分润，您的拓展的团队级别低于自身等级则获得{{scale2}}的间接收益，若团成员等级与自身平级则获得5%育成奖励；{{grade==='黄金永久'?'非押金形式，无退费规则！':'名下钻石VIP达成8名即可全额退还代理费！'}}</view>
  			<view class="alert-btn">
  				<view @click="alertCancel" class="btn">取  消</view>
  				<view @click="alertSure" class="btn btn-sure">确  认</view>
  			</view>
  		</view>
  	</view>
  	<!-- 确认升级支付页面 -->
  	<view class="sure-buy-alert" v-if="isSureAlert">
			<view class="white-space" @click="cancelBuy"></view>
  		<view class="sure-rase">
  			<view class="title">确认升级</view>
  			<view class="rase-info">
  				<view class="higher-img">
						<image :src="father.avatar_url" mode=""></image>
					</view>
  				<view class="higher-info">
  					<text>上级推荐人</text>
  					<view class="higher-name">{{father.username}}</view>
  					<text>工号：{{father.id}}</text>
  				</view>
  				<view class="higher-remind">
  					<image src="../../static/images/buy/remind-bg.png" class="remind-bg"></image>
  					<view class="text">HI! 我是您的上级 <text>{{father.username}}</text> 邀请您成为创业合伙人，一起看大舞台，有梦你就来</view>
  				</view>
  			</view>
  			<view class="buy-detail">
  				<view class="money">￥{{money}}.00</view>
  				<view class="h4 detail-name"><text class="text">购买商品</text>{{grade}} VIP</view>
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
  	<!-- 购买会员成功 -->
  	<view class="buy-success" v-if="isSuccess">
  		<image src="../../static/images/pay/certain.png" ></image>
  		<view class="success-words">恭喜成为{{grade}}会员</view>
  		<view class="btn look-acti" @click="gotoLookActi">查看激活码</view>
  		<view class="btn goFirst" @click="gotoIndex">返回首页</view>
  	</view>
  </view>
</template>
<script>
	export default {
		data(){
			return{
				title:'会员购买',
				isAlert:false, //弹窗
				isNav:true, //控制底部导航栏显示
				isSureAlert:false, //控制确认升级页面显示
				grade:'',
				isSuccess:false, //购买成功页面显示
				way:'weichat',
				money:'',
				father:{
					id:1,
					username:'',
					avatar_url:''
				},
				infoIndex:3,
			  scale:30,
				goodlist:[],
				goodsId:'',
				role:'',
				scale2:''
			}
		},
		methods:{
			lookInfo(index){
				if(index === this.infoIndex){
					this.infoIndex = '';
				}
				else{
					this.infoIndex = index;
				}
			},
			toBuy(data){
				this.isAlert = true;
				this.grade = data;
				if(data === this.goodlist[0].goods_name){
					this.money = this.goodlist[0].goods_price;
					this.scale = 60;
					this.scale2 = '30%';
					this.goodsId = this.goodlist[0].goods_id;
				}
				else if(data === this.goodlist[1].goods_name){
					this.money = this.goodlist[1].goods_price;
					this.scale = 80;
					this.scale2 = '20%-50%';
					this.goodsId = this.goodlist[1].goods_id;
					
				}
				else {
					this.money = this.goodlist[2].goods_price;
					this.scale = 95;
					this.scale2 = '15%-65%';
					this.goodsId = this.goodlist[2].goods_id;
				}
			},
			alertCancel(){
				this.isAlert = false;
			},
			alertSure(){
				this.isAlert = false;
				this.isNav = false;
				this.isSureAlert = true;
			},
			cancelBuy(){
				this.isSureAlert = false;
			},
			payAct(){
				this.isSureAlert = false;
				this.isNav = true;
					uni.request({
						url: this.$apis.weixinpay, 
						method: 'GET',
						data: {
							type:0,
							goods_id:this.goodsId
						},
						header: {
							'Authorization': uni.getStorageSync('jwt') //获取token值
						},
						success: function(res) {
							let def = res.data.data;
							let timestamp = JSON.stringify(def.timestamp);
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: timestamp,
								nonceStr: def.noncestr,
								package: def.package,
								signType: 'MD5',
								paySign: def.sign,
								orderInfo:def,
								success: function (res) {
									this.$getInfo();
									this.isSuccess = true;
								}.bind(this),
								fail: function (err) {
									uni.showModal({
										content: '支付失败',
										showCancel: false
									})
								}
							});
						}.bind(this)
				})
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
			},
			sleWay(data){
				this.way = data;
			}
		},
		computed: {
			
		},
		onLoad() {
			//初始化商品列表
			this.role = this.$store.state.userInfo.role;
			this.$http({
			  url: this.$apis.goodlist,
			  method: 'GET',
				data:{
					type:2,
				},
			  cb: (err, data) => {
			    if (!err && data.success) {
						this.goodlist = data.data;
			    } 
					else {
			     
			    }
			  }
			})
			// 获取上级信息
			this.$http({
			  url: this.$apis.kf,
			  method: 'GET',
			  cb: (err, data) => {
			    if (!err && data.success) {
						this.father = data.data;
			    } 
					else {
			     
			    }
			  }
			})
		}
	}
</script>

<style lang="scss" scoped>
	@import '../../common/var';
	.content{
	  .li{min-height:295upx;_height:295upx; width:100%;   background: #fff;display: flex;
		  .vip-img{height: 100%; width:510upx; box-sizing:border-box; padding:12upx 0 6upx 15upx;
				image{width:483upx; height:277upx;}
			}
		  .vip-info{flex:1; padding:31upx 0 19upx 27upx; box-sizing: border-box; font-size:24upx;display: flex; flex-direction: column;
			  .h3{color:#333333;font-size :24upx; font-weight: bold; }
				.price{color:#AE0021; height:19upx; font-weight:bold;margin-top: 18upx; margin-bottom: 34upx; box-sizing: border-box; padding-left:17upx;}
				.price text{color:#666666; font-size:22upx; height: 18upx; margin-left: 25upx; text-decoration: line-through;}
				.h4{display: flex; justify-content: center;}
				.h4 .btn,.cannot{text-align: center; width: 127upx;font-size:24upx;line-height:41upx; height:41upx;border-radius: 8upx; background:#AE0021; color:#fff; }
				.h4 .cannot{background: #ccc;}
				.h5{text-align: center; height:23upx; font-weight:400; font-size:$font-size-24; margin-top:16upx; border-top:1px solid #EDEDED; margin-right:24upx; padding:16upx 0; margin-bottom: 10upx;}
				.detail{display: flex; justify-content: center;width:174upx; height:29upx; border:1px solid #DBAA00; color:#DBAA00; border-radius: 14upx;
					text{display: block;  font-size:18upx; line-height:29upx; text-align: center;margin-right:10upx ;}
					.detail-img{height: 20upx;width: 20upx;margin-top: 4upx;transition: 500ms;}
					.open{transform: rotate(180deg);}
				}
      }
		}
		.power-info{height: auto;padding: 19upx 24upx;background: #fff;margin-bottom: 7upx;display: flex;
		  .series{display: flex;flex-direction: column;flex: 1;border-top: 1px solid #E4DBBD;color: #666666; border-left: 1px solid #E4DBBD;
			  text{font-size: 28upx; flex: 1;text-align: center;line-height: 60upx;border-bottom: 1px solid #E4DBBD;box-sizing: border-box;} 
			}
			.zuanshi{color: #584FEE;border-right: 1px solid #E4DBBD;background: #FFF7E4;}
			.bojin{color: #4CC7E2;background: #FFF7E4;}
			.huangjin{color: #E9B632;background: #FFF7E4;}
			.last{border-right: 1px solid #E4DBBD;}
			.one text{width: 174upx; }
		}
		.rule{margin-top: 14upx; width: 100%; padding: 35upx 0; margin-bottom: 20upx; justify-content: center; box-sizing: border-box; background-color: #fff;
		  image{ width: 711upx; }
		}
	}
  .alert,.sure-buy-alert{height:100%; width:100%; background:rgba(0,0,0,0.3); position: absolute; top:0; left:0;display: flex;flex-direction: column;
  	.alert-info{ position: absolute; top:347upx; left:96upx; width:558upx; height:477upx; background:#fff; border-radius: 16upx; box-sizing: border-box; padding-top: 31upx;}  
  	.alert-info .alert-title{font-size : 32upx; height:31upx; text-align: center;font-weight: bold;}
  	.alert-info .alert-words{ padding:36upx; font-size: 24upx; color:#333333; font-family: PingFang-SC-Regular; line-height: 40upx; height: 200upx; overflow: hidden;}
  	.alert-btn{display: flex; height:100upx; border-top: 1px solid #ccc; position:absolute; bottom:0; width: 100%;}
  	.alert-btn .btn{line-height: 100upx;flex: 1; text-align: center; font-size:$font-size-28; color: #666666; font-weight: 500;}
  	.alert-btn .btn-sure{color: #DE0000;border-left: 1px solid #ccc;}
  }
  .sure-buy-alert{
		.white-space{flex: 1;}
    .sure-rase{height: 983upx; width: 100%; background: #fff;display: flex; flex-direction: column;
  		.title{font-size: 34upx; text-align: center; line-height: 80upx;font-weight:bold;  font-family:PingFang-SC-Bold; border-bottom: 1px solid #C2C2C2;}
  		.rase-info{padding:20upx 33upx 17upx 38upx;display: flex; justify-content: center; align-items: center; border-bottom: 1px solid #C2C2C2;
  			.higher-img{height:68upx; width:68upx; border-radius: 68upx; overflow: hidden;background: #ccc;
				  image{height: 69upx; width: 68upx;border-radius: 68upx;}
				}
  			.higher-info{flex:1; display: flex; flex-direction: column; justify-content: center;font-size:28upx; margin-left: 22upx; color: #666666;
  				text{color: #666666;}
  				.higher-name{color: #333333; font-weight: bold;}
  			}
  		}
  		.rase-info .higher-remind{height:196upx; width :387upx; position: relative; display: flex;}
  		.higher-remind image{height:100%; width:100%; }
  		.higher-remind .text{position: absolute; flex:1; margin:46upx 25upx 10upx 59upx; font-size : 23upx; line-height:40upx;
  			text{color: #FF0B0B;}
  		}
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
  			text{height: 86upx; width: 430upx; background:rgba(1,193,45,1);text-align: center;line-height: 86upx; border-radius: 10upx; color: #fff; display: block;font-size: 32upx;}
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
