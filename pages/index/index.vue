<template>
  <view class="container">
    <view class="content">
    	<scroll-view scroll-y class="scroll-view">
    		<view class="banner" v-if="isIndex">
    			<image src="/static/images/index/index-bg.png" ></image>
					<view class="store" @click="gotoPlay"></view>
					<view class="content-btn">
						<view class="addTeam" @click="goAddteam" ></view>
						<view class="activation" @click="goActivation"></view>
					</view>
    		</view>
    	</scroll-view>
    </view>
    <!-- 实名认证 -->
    <view class="alert" v-if="isAlert">
    	<!-- 实名认证弹窗提示页 -->
    	<view class="person" v-if="move==1">
    		<view class="alert-person">
    			<image src="/static/images/person/pop.png" class="head-img"></image>
    			<text class="title">实名认证</text>
    			<text class="words">您暂未实名认证，无法进行观看</text>
    			<text class="words">完成实名认证后，获得会员权益</text>
    			<view class="btn" @click="gotoInput">立即认证</view>
    		</view>
    		<image src="/static/images/person/close.png" class="close" @click="closeAct"></image>
    	</view>
    	<!-- 实名认证信息填写 -->
    	<view class="person" v-if="move==2">
    		<view class="person-form">
    			<view class="head">
    				<text>实名认证</text>
    				<image src="/static/images/person/close2.png" class="small-close" @click="closeAct"></image>
    			</view>
    			<view class="ipt name">
    				<image src="/static/images/person/icon1.png" class="icon" v-model="name"></image>
    				<input type="text" placeholder="请输入您的真实姓名"/>
    			</view>
    			<view class="ipt identityID">
    				<image src="/static/images/person/icon2.png" class="icon" v-model="idcard"></image>
    				<input type="idcard" placeholder="请输入您的身份证号码"/>
    			</view>
    			<view class="ipt phone">
    				<image src="/static/images/person/icon3.png" class="icon"></image>
    				<input type="text" placeholder="请输入您的手机号码"/>
    			</view>
    			<view class="ipt phone">
    				<image src="/static/images/person/icon3.png" class="icon"></image>
    				<view class="code-btn">
							<input type="text" placeholder="请输入验证码"/>
							<span>获取验证码</span>
						</view>
    			</view>
    		<!-- 	<view class="agree">
    				<radio/>
    			</view> -->
    			<view class="submit" @click="InputOver">提交资料</view>
    		</view>
    	</view>
    	<view class="person success"  v-if="move==3">
    		<view class="person-suss">
    			<image src="/static/images/person/autonym.png" class="suss-img"></image>
    			<view class="suss-title">身份认证成功</view>
    			<view class="suss-words">系统已成功审核您的实名认证</view>
    			<view class="over" @click="closeAct">完成</view>
    		</view>
    		<image src="/static/images/person/close.png" class="close" @click="closeAct"></image>
    	</view>
    </view>
  </view>
</template>
<script>
	export default{
		data() {
			return {
				isIndex:true,
				selItem:0,
				move:2,
				isAlert: false,
				name:'',
				idcard:'',
        playUrl: '',
        getPlayUrling: false
			};
		},
    onLoad: function (option) { 
//       console.log(option.isLogin); 
//     	if(isLogin == true){
//     		this.isAlert = true;
//     	}
    },
    onHide() {
    	this.closeAct()
    },
		methods:{
			goAddteam(){
        this.$navigateTo({
          url: '/pages/index/member'
        })
			},
			goActivation(){
				this.$navigateTo({
					url:'activate'
				})
			},
			// 关闭身份认证
			closeAct(){
				this.isAlert = false;
			},
			gotoInput(){
				this.move = 2;
			},
			InputOver(){
				console.log(this.idcard);
				var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
        if(reg.test(this.idcard) === false) {
					 uni.showToast({
						title: '请输入正确的身份证号码',
					  icon: 'none'
					})
					return
				} 
				else{
					uni.request({
						url: this.$apis.realNameAuth,
						method:'GET',
						header: {
							 Authorization:this.$store.state.jwt,
						},
						data:{
							'real_name':this.name,
							'id_card' :this.idcard
						},
						success: (res) => {
							console.log(res);
						}
					});
				}
			},
      gotoPlay() {
        if (this.getPlayUrling) return
        if (!this.playUrl) {
          this.getPlayUrling = true
          this.$http({
            url: this.$apis.adverts,
            method: 'GET',
            data: {
              place: 11
            },
            cb: (err, data) => {
              if (!err && data.success && data.data[0].link_to_app) {
                this.playUrl = data.data[0].link_to_app
                uni.setStorageSync('webSrc', this.playUrl)
                this.$navigateTo({
                	url: '/pages/web/index'
                })
              }
              this.getPlayUrling = false
            }
          })
        } else {
          uni.setStorageSync('webSrc', this.playUrl)
          this.$navigateTo({
          	url: '/pages/web/index'
          })
        }
      }
		}
	}
</script>

<style lang="scss" scoped>
	$color:#0088FF;
	.content{height:100%; width : 100%;
		.banner{height: 100% ; width: 100%; background:#000000; display: flex; align-items: center; flex-direction: column; 
			image{height:100%; width:100%;}
			.addTeam,.activation{height: 150upx; width:415upx; border-radius: 35upx;}
		}
		.store{height:700upx;width:100%;position: absolute; top: 0;left: 0;}
		.content-btn{position: absolute;bottom: 55upx;left: 0;width: 100%;display: flex;flex-direction: column; align-items: center;}
		.addTeam{}
		.activation{margin-top:10upx;}
		
	}
	.alert{
    position: absolute; top: 0; left: 0; z-index: 3; width: 100%; height: 100%;
    .person{height: 100%;width: 100%;background: rgba(0,0,0,0.8);position: absolute;top: 0;left: 0;display: flex;align-items: center;flex-direction: column;
      .alert{position: absolute;top: 0;left: 0;}
      .alert-person{height: 570upx;width: 480upx;border-radius: 20upx;background: #fff;margin-top: 112upx;display: flex;flex-direction: column;align-items: center;
    	  .head-img{width: 100%;height: 177upx;} 
    		.title{font-size: 42upx;height: 42upx;line-height: 42upx;color: $color;font-weight: 500;margin-top: 42upx;margin-bottom: 30upx;}
    	  .words{font-size: 28upx;line-height: 36upx;color: #666666;}
    		.btn{height: 79upx;width: 430upx;background: $color;border-radius: 10upx;margin-top: 80upx; line-height: 79upx;text-align: center;font-size: 32upx; color: #fff;}
    	}
    	.close{height: 60upx;width: 60upx;margin-top: 63upx;}
      // 填写信息页面
    	.person-form{height: 570upx;width: 518upx;background: #fff;padding:0 24upx;box-sizing: border-box; border-radius: 20upx;margin-top: 112upx;overflow: hidden;
    	  .head{height: 64upx;width: 518upx;background: #F1F1F1;text-align: center;position: relative;left: -24upx;
    		  text{font-size: 28upx;line-height: 64upx;font-family:PingFang-SC-Regular;}
    			.small-close{height: 24upx;width: 24upx;position: absolute;top: 22upx;right: 30upx;}
    		}
    		.ipt{display: flex;align-items: center;height: 82upx;line-height: 82upx;
    		  .icon{height: 50upx;width: 50upx;margin-right: 26upx;box-sizing: border-box;}
    		  input{display: inline-block;flex: 1;border-bottom: 1px solid #C7C7C7;font-size: 24upx;}
    		}
    		.code{height: 82upx;width: 100%;display: flex;align-items: center;
    		  .icon{height: 50upx;width: 50upx;margin-right: 26upx;box-sizing: border-box;}
    			.code-btn{flex: 1;display: flex;align-items: center;height: 82upx;line-height: 82upx;border-bottom: 1px solid #C7C7C7;
    				input{flex: 1;display: inline-block;}
    				text{font-size: 24upx;color: $color;text-align: center;width: 155upx;height: 46upx;line-height: 46upx;border: 1px solid $color;border-radius: 8upx;}
    			}
    		}
    		.submit{font-size: 24upx;color: #fff; height: 60upx;width: 100%;border-radius: 10upx;background: $color;line-height: 60upx;text-align: center;margin-top: 77upx;}
    	}
    	// 认证成功
    	.person-suss{height: 454upx;width: 482upx;border-radius: 20upx;background: #fff;position: relative;margin-top: 226upx;display: flex;align-items: center;flex-direction: column;
    		.suss-img{position:absolute;height: 299upx;width: 336upx;top: -150upx; left: 85upx;}
    		.suss-title{font-size: 40upx;font-weight: bold;margin-top: 184upx;line-height: 40upx;}
    		.suss-words{font-size: 28upx;font-family: YouYuan;color: #666666;margin-top: 26upx;margin-bottom: 50upx;}
    		.over{height: 80upx;width: 434upx; text-align: center;line-height: 80upx;color: #fff;font-size: 32upx;background: $color;border-radius: 20upx;margin: 0 25upx;}
    	}
    }
  }
</style>
		