/**
 * 验证手机号码
 * @export
 * @param {Number} num 待判断的手机号码
 * @returns {Boolean}
*/
export function validatePhone (num) {
  return /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(num)
}

/**
 * 验证身份证号码
 * @export
 * @param {Number} idCard 待判断的身份证号码
 * @returns {Boolean}
*/
export function validateIdCard (idcard) {
  var vcity = {11: '北京', 12: '天津', 13: '河北', 14: '山西', 15: '内蒙古', 21: '辽宁', 22: '吉林', 23: '黑龙江', 31: '上海', 32: '江苏', 33: '浙江', 34: '安徽', 35: '福建', 36: '江西', 37: '山东', 41: '河南', 42: '湖北', 43: '湖南', 44: '广东', 45: '广西', 46: '海南', 50: '重庆', 51: '四川', 52: '贵州', 53: '云南', 54: '西藏', 61: '陕西', 62: '甘肃', 63: '青海', 64: '宁夏', 65: '新疆', 71: '台湾', 81: '香港', 82: '澳门', 91: '国外'}
  // 检查号码是否符合规范，包括长度，类型
  var isCardNo = function (obj) {
    var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/
    if (reg.test(obj) === false) {
      return false
    }
    return true
  }
  // 取身份证前两位,校验省份
  var checkProvince = function (obj) {
    var province = obj.substr(0, 2)
    if (vcity[province] === undefined) {
      return false
    }
    return true
  }
  // 校验位的检测
  var checkParity = function (obj) {
    // 15位转18位
    obj = changeFivteenToEighteen(obj)
    var len = obj.length
    if (len === 18) {
      var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
      var cardTemp = 0
      var valnum
      for (let i = 0; i < 17; i ++) {
        cardTemp += obj.substr(i, 1) * arrInt[i]
      }
      valnum = arrCh[cardTemp % 11]
      if (valnum === obj.substr(17, 1)) {
        return true
      }
      return false
    }
    return false
  }
  // 15位转18位身份证号
  var changeFivteenToEighteen = function (obj) {
    if (obj.length === 15) {
      var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
      var cardTemp = 0
      obj = obj.substr(0, 6) + '19' + obj.substr(6, obj.length - 6)
      for (let i = 0; i < 17; i ++) {
        cardTemp += obj.substr(i, 1) * arrInt[i]
      }
      obj += arrCh[cardTemp % 11]
      return obj
    }
    return obj
  }
  // 校验长度，类型
  if (isCardNo(idcard) === false) {
    return false
  }
  // 检查省份
  if (checkProvince(idcard) === false) {
    return false
  }
  // 检验位的检测
  if (checkParity(idcard) === false) {
    return false
  }
  return true
}

/**
 * 验证姓名
 * @export
 * @param {String} name 待判断的姓名
 * @returns {Boolean}
*/
export function validateName (name) {
  return /^[\u4e00-\u9fa5·]{2,20}$/.test(name)
}

/**
 * 验证微信号
 * @export
 * @param {String} name 待判断的微信号
 * @returns {Boolean}
*/
export function validateWeixin (name) {
  return /^[a-zA-Z0-9_-]{6,20}$/.test(name)
}

export function cloneObj (oldObj) {
  if (typeof (oldObj) !== 'object') return oldObj
  if (oldObj === null) return oldObj
  let newObj = {}
  for (const key in oldObj) {
    newObj[key] = cloneObj(oldObj[key])
  }
  return newObj
}
export function extendObj () {
  let args = arguments
  if (args.length < 2) return
  let temp = cloneObj(args[0])
  for (let n = 1; n < args.length; n ++) {
    for (let i in args[n]) {
      temp[i] = args[n][i]
    }
  }
  return temp
}

/**
 * 处理时间
 * @export
 * @param {str} 待处理时间
 * @returns {str}
*/
export function formatTimes (str, type) {
  if (!str) return
  let nowTimeStamp = new Date().setHours(0, 0, 0, 0)
  let newStr = str.replace(/-/g, '/')
  let time = new Date(newStr)
  let timeStamp = time.getTime()
  let dayMsec = 24 * 60 * 60 * 1000
  let cha = nowTimeStamp - timeStamp
  let year = time.getFullYear()
  let month = time.getMonth() + 1
  let day = time.getDate()
  let hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
  let minute = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
  if (!type) {
    if (cha < 0) {
      // 今天
      return hour + ':' + minute
    } else if (cha >= 0 && cha < dayMsec) {
      // 昨天
      return '昨天 ' + hour + ':' + minute
    } else {
      // 以前
      return year + '-' + month + '-' + day
    }
  } else if (type === 2) {
    return year + '-' + month + '-' + day
  } else {
    return year + '年' + month + '月' + day + '日'
  }
}
