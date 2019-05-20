<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="scroll-view">
				<view class="mine uni-pr">
          <image src="../../static/images/bg.png" mode="widthFix" class="bg uni-pa"></image>
					<view class="userinfo uni-pr uni-flex uni-box" @click="gotoAccount">
						<image :src="userInfo.avatar_url ? userInfo.avatar_url : defaultAvatar" class="avatar"></image>
            <view class="box uni-flex-item">
            	<view class="name uni-flex">
            		<view class="text uni-textover">{{ userInfo.username }}</view>
                <view class="tag user-level uni-flex" :class="[levelImg ? 'has' : '', 'user-level-' + (userInfo.role + 1)]" @click.prevent.stop="showVipExplain(true)">
                  <image :src="levelImg" v-if="levelImg"></image>
                  {{ roleText }}
                </view>
                <view class="qrcode uni-flex" v-if="isRole" @click.prevent.stop="showUserQrcode">
                	<image src="../../static/images/icon/icon-qrcode.png"></image>
                </view>
            	</view>
              <view class="uid">ID：{{ userInfo.id }}</view>
              <view class="no-qrcode uni-flex" v-if="!userInfo.wx_number && isRole">
              	<view class="no-qrcode-con uni-flex uni-box">
              		未填写微信号<view class="tri uni-box"></view>
              	</view>
              </view>
            </view>
            <image src="../../static/images/icon/icon-arrow-3.png" class="arrow"></image>
					</view>
          <!-- 合伙人 S -->
          <view class="partner uni-pr" v-if="false">
          	<view class="partner-enter uni-flex uni-box" @click="gotoPartner">
          		<image src="../../static/images/icon/icon-tips.png"></image>
          		<text class="uni-flex-item">您是{{ config.system_nick_name }}合伙人，可享受旗下全局合伙收益</text>
          		<view class="btn uni-txc">点击查看</view>
          	</view>
          </view>
          <!-- 合伙人 E -->
          <!-- 收益明细 S -->
          <view class="profit uni-pr uni-box uni-txc">
            <view class="total uni-pa" @click="explain(0)">
              <view class="num font-number">{{ userInfo.bonus }}</view>
              <view class="text">总收入(元)</view>
            </view>
            <view class="stay uni-flex uni-box">
              <view class="stay-con uni-flex-item" @click="explain(1)">
                <view class="num font-number">{{ userInfo.balance }}</view>
                <view class="text">可提现金额(元)</view>
              </view>
              <view class="stay-con uni-flex-item" @click="explain(2)">
                <view class="num font-number">{{ userInfo.djs }}</view>
                <view class="text">待结算佣金(元)</view>
              </view>
              <view class="stay-con uni-flex-item" @click="explain(3)">
                <view class="num font-number">{{ userInfo.expect }}</view>
                <view class="text">预期佣金(元)</view>
              </view>
            </view>
            <view class="btn-put uni-pa uni-flex uni-box" @click="gotoCash">提现<image src="/static/images/icon/icon-arrow-g.png"></image></view>
          </view>
          <!-- 收益明细 E -->
          <!-- 实习进度和周任务 S -->
          <view class="task uni-pr" v-if="isRole && config.module_control_task !== constant.MODULE_STATE_CLOSE">
            <view class="explain uni-pa" v-show="sxjdExplainShow">
              <view class="explain-con uni-pr uni-flex">
                <image class="icon-lamp" src="/static/images/icon/icon-lamp.png"></image>
                <view>锁粉30人，邀请<text>1名</text>VIP，可升级。</view>
              </view>
              <view class="bg uni-pa"></view>
              <view class="arrow uni-pa"></view>
            </view>
            <view class="task-con uni-pr uni-flex">
              <image src="/static/images/icon/icon-sign.png" class="sign uni-pa" mode=""></image>
              <view class="task-name">
                <view v-if="userInfo.role === 1" @touchstart="showExplain"><image src="/static/images/mine/sxjd.png" mode="widthFix"></image></view>
                <view @click="gotoTask" v-else><image src="/static/images/mine/bzrw.png" mode="widthFix"></image></view>
              </view>
              <view class="line"></view>
              <view class="progress uni-flex uni-flex-item uni-box uni-txc" v-if="userInfo.role === 1">
                <view class="uni-flex-item" v-if="pregressArr.child_toward">
                  <view class="num">{{ pregressArr.child }}/{{ pregressArr.child_toward }}人</view>
                  <view>锁粉</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num">{{ pregressArr.apply }}/{{ pregressArr.apply_toward }}张</view>
                  <view>信用卡</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num">{{ pregressArr.banker }}/{{ pregressArr.banker_toward }}名</view>
                  <view>VIP</view>
                </view>
                <view class="btn" @click="gotoBanker">立即升级</view>
              </view>
              <view class="progress uni-flex uni-flex-item uni-box uni-txc" v-if="userInfo.role >= 2 && userInfo.task_level > 0" @click="gotoTask">
                <view class="uni-flex-item">
                  <view class="num">{{ weekTask.invite_newer ? weekTask.invite_newer.finish_num : 0 }}/{{ weekTask.invite_newer ? weekTask.invite_newer.toward : 0 }}</view>
                  <view>锁粉</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num">{{ weekTask.banker_init ? weekTask.banker_init.finish_num : 0 }}/{{ weekTask.banker_init ? weekTask.banker_init.toward : 0 }}</view>
                  <view>普通会员</view>
                </view>
                <view class="uni-flex-item">
                  <view class="num">{{ weekTask.team_apply ? weekTask.team_apply.finish_num : 0 }}/{{ weekTask.team_apply ? weekTask.team_apply.toward : 0 }}</view>
                  <view>新增订单</view>
                </view>
              </view>
              <view class="progress progress-not uni-flex uni-flex-item uni-box uni-txc" v-if="userInfo.role >= 2 && userInfo.task_level === 0">
                <view class="btn" @click="gotoTask">去设置梦想收入</view>
              </view>
            </view>
          </view>
          <!-- 实习进度和周任务 E -->
          <!-- 入口 S -->
          <view class="enter uni-pr">
          	<view class="enter-con uni-flex uni-flex-wrap">
          		<view class="item uni-flex uni-column uni-box uni-pr" @click="gotoOrder">
          			<image src="../../static/images/icon/icon-orders.png"></image>
          			<text>订单管理</text>
          		</view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoEarning">
              	<image src="../../static/images/icon/icon-income.png"></image>
              	<text>收入明细</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoTeam" v-if="isRole">
              	<image src="../../static/images/icon/icon-myteam.png"></image>
              	<text>我的团队</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoAgentIntro" v-else>
              	<image src="../../static/images/icon/icon-upgrade.png"></image>
              	<text>升级VIP</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoInvites" v-if="config.module_control_invite !== constant.MODULE_STATE_CLOSE">
              	<image src="../../static/images/icon/icon-invite3.png"></image>
              	<text>邀请好友</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoCdkey" v-if="isRole">
              	<image src="../../static/images/icon/icon-key.png"></image>
              	<text>我的激活码</text>
              </view>
              <!-- <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoPoster" v-if="isRole">
              	<image src="../../static/images/icon/icon-poster.png"></image>
              	<text>推广海报</text>
              </view> -->
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoMaterial" v-if="isRole">
              	<image src="../../static/images/icon/icon-notice2.png"></image>
              	<text>推广</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoCertificate" v-if="isAgent && isRole">
              	<image src="../../static/images/icon/icon-certificate.png"></image>
              	<text>授权证书</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoNotice">
              	<image src="../../static/images/icon/icon-board.png"></image>
              	<text>消息公告</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoKf">
              	<image src="../../static/images/icon/icon-service.png"></image>
              	<text>专属客服</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoHelp">
              	<image src="../../static/images/icon/icon-help.png"></image>
              	<text>培训中心</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoAbout">
              	<image src="../../static/images/icon/icon-about.png"></image>
              	<text>关于我们</text>
              </view>
              <view class="item uni-flex uni-column uni-box uni-pr" @click="gotoSetting" v-if="false">
              	<image src="../../static/images/icon/icon-settings.png"></image>
              	<text>设置</text>
              </view>
          	</view>
          </view>
          <!-- 入口 E -->
				</view>
			</scroll-view>
		</view>
    <!-- 提醒设置微信和二维码 S -->
    <view class="pop pop-tips-wx" v-if="tipsWxShow">
      <view class="mask" @click="closeTipsWxPop"></view>
      <view class="pop-con-2 uni-flex uni-column uni-txc">
        <image class="btn-close uni-pa" src="../../static/images/icon/icon-close.png" @click="closeTipsWxPop"></image>
        <image class="pic" src="../../static/images/mine/pop-tips.png" mode="widthFix"></image>
        <view class="tit">您旗下共有</view>
        <view class="num"><text>{{ tipsWxSx }}名</text>普通会员，<text>{{ tipsWxSf }}名</text>锁粉客户</view>
        <view class="avatar-box uni-pr" v-if="tipsWxAvatar.length > 0">
        	<view class="avatar uni-flex">
        		<image :src="item" class="uni-pr" v-for="(item, index) in tipsWxAvatar" :key="index" :style="{'z-index': index}"></image>
        	</view>
        </view>
        <view class="text">为了更好的服务客户，让他们及时联<text>\n</text>系到您，请在“<text>账户信息</text>”添加您的<text><text>\n</text>个人微信号及二维码</text>。</view>
        <view class="btn" @click="popGotoAccount">去添加</view>
      </view>
    </view>
    <!-- 提醒设置微信和二维码 E -->
    <!-- 提醒实名制 S -->
    <view class="pop pop-tips-real" v-if="tipsRealShow">
      <view class="mask pr" @click="closeTipsRealPop"></view>
      <view class="pop-con-2 uni-flex uni-column uni-txc">
        <image class="btn-close uni-pa" src="../../static/images/icon/icon-close.png" @click="closeTipsRealPop"></image>
        <image class="pic" src="../../static/images/mine/pop-tips2.png" mode="widthFix"></image>
        <view class="tit">您已经升级为</view>
        <view class="tag uni-flex uni-column">
          <view class="tag-line"></view>
          <text>{{ roleText }}</text>
          <view class="tag-line"></view>
        </view>
        <view class="text">为保障您账户的资金安全，请先完成实名认证</view>
        <view class="btn" @click="popGotoReal">去实名认证</view>
      </view>
    </view>
    <!-- 提醒实名制 E -->
    <!-- 我的二维码 S -->
    <view class="pop pop-mine-qrcode" v-show="mineQrcodeShow">
      <view class="mask" @click="mineQrcodeShow = false"></view>
      <view class="pop-con-2" @click="mineQrcodeShow = false">
        <image src="/static/images/icon/icon-close.png" class="btn-close uni-pa" @click="mineQrcodeShow = false"></image>
        <image src="/static/images/mine/my-qrcode.png" class="pop-bg uni-pa" mode="widthFix"></image>
        <view class="pop-data uni-pr">
          <view class="data-avatar uni-flex">
            <image :src="userInfo.avatar_url ? userInfo.avatar_url : defaultAvatar"></image>
            <view>我是 <text>{{ userInfo.username }}</text></view>
          </view>
          <view class="data-text uni-txc">推荐您了解一下<text>“{{ config.system_nick_name }}”</text>社交金融平台</view>
          <view class="data-explain uni-txc">“一个能赚钱的平台，分享给你，我也在用”</view>
          <view class="data-qrcode uni-pr uni-flex">
            <image src="/static/images/invite/poster-ewm-logo.png" mode="" class="logo uni-pa" v-if="myqrcode"></image>
            <image :src="myqrcode" mode="" v-if="myqrcode" class="qrcode"></image>
            <canvas canvas-id="qrcodeCanvas" class="uni-pa"></canvas>
          </view>
          <view class="data-tips uni-txc">打开微信扫一扫进入<text>“{{ config.system_nick_name }}”</text>平台，或<br>搜索公众号<text>“{{ config.system_name }}”</text></view>
        </view>
      </view>
    </view>
    <!-- 我的二维码 E -->
    <!-- 权益介绍 S -->
    <relation :relationData="relationData"></relation>
    <!-- 权益介绍 E -->
	</view>
</template>

<script>
  import drawQrcodeMine from '../../common/qrcode.min.js'
  import relation from '../../components/relation.vue'
  
	export default {
    components: {
      relation
    },
		data() {
			return {
        tipsWxShow: false,
        tipsWxSx: 0,
        tipsWxSf: 0,
        tipsWxAvatar: [],
        mineQrcodeShow: false,
        myqrcode: '',
        hasQrcode: false,
        pregressArr: {
          apply: 0,
          apply_toward: 0,
          banker: 0,
          banker_toward: 0,
          canLevelUp: false
        }, // 实习进度
        sxjdExplainShow: false,
        sxjdExplainTimer: null,
        weekTask: {
          banker_init: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          invite_newer: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          team_apply: {
            finish_num: 0,
            is_finish: false,
            toward: 0
          },
          is_finish: false
        }, // 周任务
        tipsRealShow: false, // 实名弹窗
        relationData: {}
			};
		},
    computed: {
      config() {
        return this.$store.state.config
      },
      userInfo() {
        return this.$store.state.userInfo
      },
      constant() {
      	return this.$constant
      },
      isRole() {
        return this.userInfo.role !== 0
      },
      isAgent() {
        return this.userInfo.role > 1
      },
      isPartner() {
        return this.userInfo.is_partner !== 0
      },
      defaultAvatar() {
        return '../../static/images/avatar.png'
      },
      levelImg() {
        if (this.userInfo.role === 2) {
          return '../../static/images/mine/level-1.png'
        } else if (this.userInfo.role === 3) {
          return '../../static/images/mine/level-2.png'
        } else if (this.userInfo.role === 4) {
          return '../../static/images/mine/level-3.png'
        } else {
          return ''
        }
      },
      roleText() {
        if (this.userInfo.role === 1) {
          return '普通会员'
        } else if (this.userInfo.role === 2) {
          return '黄金VIP'
        } else if (this.userInfo.role === 3) {
          return '铂金VIP'
        } else if (this.userInfo.role === 4) {
          return '钻石VIP'
        } else {
          return '临时用户'
        }
      },
    },
		onLoad() {
			// 提示填写微信和二维码
      if ((!this.userInfo.wx_number || !this.userInfo.wx_qrcode_url) && this.isRole) {
        this.$http({
          url: this.$apis.myTeam,
          method: 'GET',
          data: {
            type: 1,
            role: 1,
            order: 3,
            page: 1,
            keyword: ''
          },
          cb: (err1, data1) => {
            if (!err1 && data1.success) {
              if (data1.data.total > 0) {
                if (uni.getStorageSync('mineTipsWx')) {
                  let oldtime = uni.getStorageSync('mineTipsWx')
                  let nowtime = new Date().getTime()
                  let cha = parseInt((nowtime - parseInt(oldtime)) / 1000)
                  if (cha > 1800) {
                    this.tipsWxHandler(data1)
                  } else {
                    this.tipsRealHandler()
                  }
                } else {
                  this.tipsWxHandler(data1)
                }
              } else {
                this.tipsRealHandler()
              }
            } else {
              this.tipsRealHandler()
            }
          }
        })
      } else {
        this.tipsRealHandler()
      }
      // 实习进度
      if (this.userInfo.role >= 1 && this.userInfo.role <= 3) {
        this.$http({
          url: this.$apis.sxProgress,
          method: 'GET',
          data: {
            id: this.userInfo.id
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.pregressArr = data.data
            } else {
              uni.showToast({
              	title: data ? data.message : '获取实习进度数据失败',
                icon: 'none'
              })
            }
          }
        })
      }
      // 周任务
      if (this.userInfo.role >= 2 && this.userInfo.task_level > 0) {
        this.$http({
          url: this.$apis.task,
          method: 'GET',
          data: {
            type: 3
          },
          cb: (err, data) => {
            if (!err && data.success) {
              this.weekTask = data.data.data
              this.weekTask.is_finish = data.data.is_finish
            } else {
              uni.showToast({
              	title: data ? data.message : '周任务获取失败',
                icon: 'none'
              })
            }
          }
        })
      }
		},
    onHide() {
      this.tipsWxShow = false
      this.tipsRealShow = false
      this.mineQrcodeShow = false
      this.showVipExplain(false)
    },
    methods: {
      gotoAccount() {
        this.$navigateTo({
        	url: '/pages/mine/account'
        })
      },
      gotoOrder() {
        this.$navigateTo({
        	url: '/pages/mine/order'
        })
      },
      gotoEarning() {
        this.$navigateTo({
        	url: '/pages/mine/earning'
        })
      },
      gotoAgentIntro() {
        this.$navigateTo({
        	url: '/pages/mine/agentIntro'
        })
      },
      gotoTeam() {
        this.$navigateTo({
        	url: '/pages/mine/team'
        })
      },
      gotoInvite() {
        this.$navigateTo({
        	url: '/pages/mine/invite'
        })
      },
      gotoInvites() {
        if (this.config.module_control_invite === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/invite/index'
          })
        } else {
          uni.showToast({
          	title: '邀请活动暂未开放',
            icon: 'none'
          })
        }
      },
      gotoCdkey() {
        this.$navigateTo({
        	url: '/pages/index/myActivate'
        })
      },
      gotoPoster() {
        this.$navigateTo({
        	url: '/pages/spread/poster'
        })
      },
      gotoMaterial() {
        this.$navigateTo({
        	url: '/pages/spread/index'
        })
      },
      gotoCertificate() {
        this.$navigateTo({
        	url: '/pages/mine/certificate'
        })
      },
      gotoNotice() {
        this.$navigateTo({
        	url: '/pages/mine/notice'
        })
      },
      gotoKf() {
        this.$navigateTo({
        	url: '/pages/mine/kf'
        })
      },
      gotoHelp() {
        this.$navigateTo({
        	url: '/pages/mine/help'
        })
      },
      gotoAbout() {
        this.$navigateTo({
        	url: '/pages/mine/about'
        })
      },
      gotoTask() {
        if (this.config.module_control_task === this.constant.MODULE_STATE_OPEN) {
          this.$navigateTo({
          	url: '/pages/task/index'
          })
        } else {
          uni.showToast({
          	title: '任务活动暂未开放',
            icon: 'none'
          })
        }
      },
      gotoSetting() {
        this.$navigateTo({
        	url: '/pages/mine/setting'
        })
      },
      gotoCash() {
        this.$navigateTo({
        	url: '/pages/mine/cash'
        })
      },
      gotoPartner() {
        this.$navigateTo({
        	url: '/pages/partner/index'
        })
      },
      gotoBanker() {
        this.$navigateTo({
        	url: '/pages/index/member'
        })
      },
      explain(type) {
        switch (type) {
          case 0:
            uni.showModal({
            	title: '总收入',
              content: `表示您加入${this.config.system_nick_name}平台以来，所有的收入金额总和。`,
              confirmText: '知道了',
              showCancel: false
            })
            break
          case 1:
            uni.showModal({
            	title: '可提现金额',
            	content: `表示您目前在${this.config.system_nick_name}账户中能够提现的金额总和。`,
            	confirmText: '知道了',
            	showCancel: false
            })
            break
          case 2:
            uni.showModal({
            	title: '待结算佣金',
            	content: `表示您和您的团队办理的业务，银行已经审批完成，${this.config.system_nick_name}正在核实的提成金额。`,
            	confirmText: '知道了',
            	showCancel: false
            })
            break
          case 3:
            uni.showModal({
            	title: '预期佣金',
            	content: `表示您和您的团队正在提交的业务，银行还未审批的业务提成。【 请督促您的客户尽快提交资料和查询进度，以便将预期佣金转化为可提现佣金！】`,
            	confirmText: '知道了',
            	showCancel: false
            })
            break
        }
      },
      showUserQrcode() {
        let _this = this
        _this.mineQrcodeShow = true
        if (!_this.hasQrcode) {
          let url = this.$constant.shareUrl + '?pid=' + this.$store.state.userInfo.id
          _this.createQrcode(url, 364, res => {
            this.myqrcode = res
            this.hasQrcode = true
          })
        }
      },
      createQrcode(url, w, cb) {
        drawQrcodeMine({
          width: uni.upx2px(w),
          height: uni.upx2px(w),
          canvasId: 'qrcodeCanvas',
          text: url
        })
        setTimeout(() => {
          uni.canvasToTempFilePath({
          	canvasId: 'qrcodeCanvas',
            success: res => {
            	if (typeof cb === 'function') {
            	  cb(res.tempFilePath)
            	}
            }
          })
        }, 300)
      },
      closeTipsWxPop() {
        this.tipsWxShow = false
        uni.setStorageSync('mineTipsWx', (new Date().getTime()).toString())
      },
      tipsWxHandler(data1) {
        this.tipsWxSx = data1.data.total
        data1.data.data.forEach(item => {
          if (this.tipsWxAvatar.length < 5) {
            this.tipsWxAvatar.push(item.avatar_url)
          }
        })
        this.$http({
          url: this.$apis.myTeam,
          method: 'GET',
          data: {
            type: 1,
            role: 0,
            order: 1,
            page: 1,
            keyword: ''
          },
          cb: (err2, data2) => {
            if (!err2 && data2.success) {
              this.tipsWxSf = data2.data.total
              data2.data.data.forEach(item2 => {
                if (this.tipsWxAvatar.length < 5 && this.tipsWxAvatar.indexOf(item2.avatar_url) === -1) {
                  this.tipsWxAvatar.push(item2.avatar_url)
                }
              })
            }
            this.tipsWxShow = true
          }
        })
      },
      popGotoAccount() {
        this.closeTipsWxPop()
        this.gotoAccount()
      },
      closeTipsRealPop() {
        this.tipsRealShow = false
        uni.setStorageSync('mineTipsReal', (new Date().getTime()).toString())
      },
      tipsRealHandler() {
        return
        if (this.isRole && this.userInfo.is_real === 0) {
          if (uni.getStorageSync('mineTipsReal')) {
            let nowTimeStamp = new Date().setHours(0, 0, 0, 0)
            let timeStamp = uni.getStorageSync('mineTipsReal')
            let cha = nowTimeStamp - timeStamp
            if (cha >= 0) {
              this.tipsRealShow = true
            }
          } else {
            this.tipsRealShow = true
          }
        }
      },
      popGotoReal() {
        this.closeTipsRealPop()
        this.$navigateTo({
        	url: '/pages/mine/account?real=true'
        })
      },
      showExplain() {
        clearTimeout(this.sxjdExplainTimer)
        if (this.sxjdExplainShow) {
          this.sxjdExplainShow = false
        } else {
          this.sxjdExplainShow = true
          this.sxjdExplainTimer = setTimeout(() => {
            this.sxjdExplainShow = false
          }, 4000)
        }
      },
      showVipExplain(b) {
        this.relationData = {
          show: b
        }
      }
    }
	}
</script>

<style lang="scss" scoped>
  @import '../../common/var';
	.bg{
    z-index: 1; width: 100%;
  }
  .userinfo{
    z-index: 3; align-items: center; height: 240upx; padding: 0 20upx 0 30upx;
    .avatar{
      width: 108upx; height: 108upx; margin-right: 30upx; border: $border-avatar; border-radius: 100%;
    }
    .box{
      .name{
        align-items: center; margin-bottom: 4upx; font-size: $font-size-32; line-height: 44upx; color: $color-3;
        .text{
          width: auto;
        }
        .tag{
          justify-content: center; align-items: center; min-width: 110upx; height: 52upx; padding: 0 20upx; margin-left: 12upx; font-size: $font-size-22; color: $color-4; background: $level-1-bg; border-radius: 52upx;
          &.user-level-2{
            min-width: 110upx; background: $level-2-bg;
          }
          &.user-level-3{
          	min-width: 160upx; color: $color-white; background: $level-3-bg;
          }
          &.user-level-4{
          	min-width: 160upx; color: $color-white; background: $level-4-bg;
          }
          &.user-level-5{
          	min-width: 160upx; color: $color-white; background: $level-5-bg;
          }
          image{
            width: 40upx; height: 40upx; margin-right: 8upx;
          }
        }
        .qrcode{
          margin-left: 12upx;
          image{
            width: 48upx; height: 48upx;
          }
        }
      }
      .uid{
        font-size: $font-size-24; line-height: $font-size-24 + 10upx; color: $color-3;
      }
      .no-qrcode{
        margin-top: 8upx;
        .no-qrcode-con{
          align-items: center; height: 40upx; padding: 0 16upx; font-size: $font-size-22; color: $color-white; border: $border-1; border-color: $color-white; border-radius: 40upx;
          .tri{
            width: 18upx; height: 18upx; margin-left: 6upx; border-top: 4upx solid $color-white; border-right: 4upx solid $color-white; transform: rotate(45deg);
          }
        }
      }
    }
    .arrow{
      width: 48upx; height: 48upx; margin-left: 20upx;
    }
  }
  .partner{
    z-index: 3; margin-bottom: 24upx;
    .partner-enter{
      align-items: center; height: 84upx; padding: 0 20upx; font-size: $font-size-24; color: $color-3; background-color: $partner-bg;
      image{
        width: 64upx; height: 64upx;
      }
      text{
        margin-left: 0upx;
      }
      .btn{
        width: 140upx; height: 52upx; line-height: 52upx; color: $default-color; background: $default-btn-linear; border-radius: 52upx;
      }
    }
  }
  .task{
    padding: 0 20upx; margin-bottom: 20upx;
    .task-con{
      align-items: center; height: 120upx; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
    }
    .sign{
      top: -2upx; left: 10upx; width: 20upx; height: 32upx;
    }
    .task-name{
      padding: 0 32upx 0 40upx;
      image{
        width: 66upx; pointer-events: none;
      }
    }
    .line{
      width: 4upx; height: 50upx; background-color: $input-bg;
    }
    .progress{
      align-items: center; padding: 0 20upx 0 10upx; font-size: $font-size-22; line-height: 32upx; color: $color-gray-2;
      .btn{
        width: 140upx; height: 52upx; margin-left: 10upx; font-size: $font-size-24; font-weight: 700; line-height: 52upx; color: $default-color; background: $default-btn-linear; border-radius: 52upx;
      }
      &.progress-not{
        .btn{
          width: 260upx; margin: 0 auto;
        }
      }
    }
    .num{
      font-size: $font-size-32; line-height: 44upx; color: $color;
    }
    .explain{
      bottom: calc(100% + 10upx); left: 20upx; z-index: 4; width: calc(100% - 40upx);
      .explain-con{
        z-index: 5; align-items: center; padding: 14upx 20upx; font-size: $font-size-24; line-height: 34upx; color: $color-title; background-color: $color-white; border-radius: 20upx;
        text{
          color: $color;
        }
        .icon-lamp{
          width: 48upx; height: 48upx; margin-right: 16upx;
        }
      }
      .bg{
        top: 0; left: 0; z-index: 1; width: 100%; height: 100%; border-radius: 20upx; box-shadow: $box-shadow;
      }
      .arrow{
        bottom: -13upx; left: 60upx; z-index: 2; width: 30upx; height: 30upx; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow; transform: rotate(45deg); 
      }
    }
  }
  .enter{
  	z-index: 3; padding: 0 20upx; margin-bottom: 20upx;
  	.enter-con{
  		padding: 20upx 0; background-color: $color-white; border-radius: $border-radius; box-shadow: $box-shadow;
  		.item{
  			align-items: center; width: 25%; height: 154upx; padding-top: 20upx; font-size: $font-size-24; line-height: $font-size-24 + 10upx;
  			image{
  				width: $icon-size; height: $icon-size; margin-bottom: 8upx;
  			}
  			navigator{
  				top: 0; left: 0; z-index: 3; width: 100%; height: 100%;
  			}
  		}
  	}
  }
  .pop-tips-wx{
    .pop-con-2{
      align-items: center; width: 600upx; padding-bottom: 40upx; border-radius: 20upx;
      .btn-close{
        top: -112upx; right: 0; width: 72upx; height: 72upx;
      }
      .pic{
        width: 100%;
      }
      .tit{
        padding: 55upx 0 25upx; font-size: $font-size-32; font-weight: 700; line-height: 42upx; color: $color;
      }
      .num{
        margin-bottom: 30upx; font-size: $font-size-28; line-height: 32upx; color: $default-color;
      }
      text{
        color: $color;
      }
      .avatar-box{
        height: 100upx; margin-bottom: 58upx;
        .avatar{
          margin-left: 20upx;
          image{
            width: 100upx; height: 100upx; margin-left: -20upx; border-radius: 100%;
          }
        }
      }
      .text{
        margin-bottom: 56upx; font-size: $font-size-28; lighting-color: 40upx; color: $color-gray-5;
      }
      .btn{
        width: 272upx; height: 72upx; font-size: $font-size-28; font-weight: 700; line-height: 72upx; color: $default-color; background: $default-btn-linear; border-radius: 72upx;
      }
    }
  }
  .pop-tips-real{
    .pop-con-2{
      align-items: center; width: 600upx; padding-bottom: 40upx; border-radius: 20upx;
      .btn-close{
        top: -112upx; right: 0; width: 72upx; height: 72upx;
      }
      .pic{
        width: 100%;
      }
      .tit{
        margin: 60upx 0 30upx; font-size: $font-size-28; line-height: 32upx; color: $default-color;
      }
      .tag{
        align-items: center; margin-bottom: 40upx; font-size: 40upx; line-height: 44upx; color: $color;
        .tag-line{
          width: 360upx; height: 4upx; background: $line-linear;
        }
        text{
          padding: 16upx 0;
        }
      }
      .text{
        width: 448upx; margin-bottom: 50upx; font-size: $font-size-28; line-height: 40upx; color: $color-gray-5;
      }
      .btn{
        width: 272upx; height: 72upx; font-size: $font-size-28; font-weight: 700; line-height: 72upx; color: $default-color; background: $default-btn-linear; border-radius: 72upx;
      }
    }
  }
  .pop-mine-qrcode{
    .pop-con-2{
      width: 670upx; height: 920upx; background: none;
      .btn-close{
        top: -74upx; right: 0; width: 72upx; height: 72upx;
      }
      .pop-bg{
        top: 0; left: 0; z-index: 1; width: 100%;
      }
      .pop-data{
        z-index: 3;
        .data-avatar{
          align-items: center; height: 78upx; padding: 88upx 72upx 30upx; font-size: $font-size-32; line-height: 44upx; color: $default-color;
          image{
            width: 78upx; height: 78upx; margin-right: 14upx; border-radius: 100%;
          }
        }
        text{
          color: $color;
        }
        .data-text{
          margin-bottom: 20upx; font-size: $font-size-30; line-height: 42upx; color: $color-text;
        }
        .data-explain{
          margin-bottom: 70upx; font-size: $font-size-26; line-height: 36upx; color: $color-title;
        }
        .data-qrcode{
          justify-content: center; height: 364upx; padding: 28upx;
          canvas{
            left: -10000upx; width: 364upx; height: 364upx;
          }
          .qrcode{
            width: 364upx; height: 364upx;
          }
          .logo{
            top: 50%; left: 50%; width: 80upx; height: 80upx; transform: translate(-50%, -50%);
          }
        }
        .data-tips{
          font-size: $font-size-26; line-height: 36upx; color: $color-gray-2;
        }
      }
    }
  }
</style>
