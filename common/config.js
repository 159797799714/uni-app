export default {
	apiRoot: 'http://api.topdinghui.com/index.php',
	apiRootNew: 'http://admin.topdinghui.com/index.php',
  shareUrl: 'http://share.topdinghui.com/register.html',
  CODE_SYS_ERR: 0, // 系统正在维护
  CODE_NOT_AUTH: 1, // 获取不到微信授权地址
  CODE_NOT_WX: 2, // 不是微信环境
  CODE_AUTH_ERR: 3, // 授权失败
  NOT_LOGIN: -1, // 未登录
  LOGIN_TYPE_MOBILE: 1, // 手机号登录
  LOGIN_TYPE_WECHAT: 2, // 微信登录
  MODULE_STATE_OPEN: '1', // 功能模块开启
  MODULE_STATE_PAUSE: '2', // 功能模块暂时关闭
  MODULE_STATE_CLOSE: '3' // 功能模块关闭
}