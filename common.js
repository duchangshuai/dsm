var config = require('config.js');
//数据转化  
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
function doLogin(fun) {
  wx.login({
    success: function (res) {
      if (res.code) {
        var code = res.code;
        //存在微信群信息
        if (wx.getStorageSync("shareTicket") != undefined && wx.getStorageSync("shareTicket") != '') {
          wx.login({
            success: function (shareLogin) {
              wx.getShareInfo({
                shareTicket: wx.getStorageSync("shareTicket"),
                success: function (shareInfo) {
                  loginAction(fun, code, shareLogin.code, shareInfo.encryptedData, shareInfo.iv);
                },
                fail: function (res) {
                  loginAction(fun, code);
                }
              });
            }
          })
        } else {
          loginAction(fun, code);
        }
      } else {
        wx.showToast({
          title: "登录失败",
          icon: "none"
        })
      }
    },
    fail: function () {
      wx.showToast({
        title: "登录失败",
        icon: "none"
      })
    }
  })
}
function loginAction(fun, code, groupCode, groupEncryptedData, groupIv) {
  wx.getUserInfo({//getUserInfo流程
    success: function (userInfo) {
      var encryptedData = userInfo.encryptedData;//一定要把加密串转成URI编码
      var iv = userInfo.iv;
      var param = {
        encryptedData: encryptedData,
        code: code,
        iv: iv
      };
      var shareId = wx.getStorageSync("shareId");
      if (shareId != undefined && shareId != "") {
        param.shareUserId = shareId;
      }
      var scene = wx.getStorageSync("scene");
      if (scene != undefined && scene != "") {
        param.scene = scene;
      }
      if (groupCode != undefined && groupEncryptedData != undefined && groupIv != undefined) {
        param.groupEncryptedData = groupEncryptedData;
        param.groupIv = groupIv;
        param.groupCode = groupCode;
      }
      commonRequest({
        url: config.loginUrl,
        data: param,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
        successFun: function (res) {
          wx.removeStorageSync("shareId");
          wx.removeStorageSync("shareTicket");
          var now = Date.now();
          wx.setStorageSync('sessionIdExpire', now + res.data.data - 60000);
          if (res.header.sessionid == undefined) {
            wx.setStorageSync('sessionId', res.header.sessionId)
          } else {
            wx.setStorageSync('sessionId', res.header.sessionid)
          }
          if (res.header.dsmtoken == undefined) {
            wx.setStorageSync('dsmToken', res.header.dsmToken)
          } else {
            wx.setStorageSync('dsmToken', res.header.dsmtoken)
          }
          if (fun) {
            fun();
          }
        }
      });
    },
    fail: function (e) {
      wx.navigateTo({
        url: '/pages/userInfoAuth/userInfoAuth',
      })
    }
  })
}
function shareIndex(tit, url) {
  var dsmToken = wx.getStorageSync("dsmToken");
  var path = '/pages/index/index';
  if (dsmToken != undefined && dsmToken != "") {
    path = path + "?shareId=" + dsmToken;
  }
  var title = '德施曼官方微商城';
  if (tit != undefined) {
    title = tit;
  }
  var imageUrl = '';
  if (url != undefined) {
    imageUrl = url;
  }
  return {
    title: title,
    path: path,
    imageUrl: imageUrl,
    success: function (res) {
      // 转发成功时获取shareTickets
      var shareTickets = res.shareTickets;
      if (shareTickets != undefined) {
        wx.login({
          success: function (r) {
            if (r.code) {
              postGroup(r.code, shareTickets[0]);
            }
          }
        })
      }
    },
    fail: function (res) {
      // 转发失败
      wx.showToast({
        title: "转发失败",
        icon: "none"
      })
    }
  }
}
function postGroup(code, shareTicket) {
  //获取分享的群信息  
  if (haveLogin()) {
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        if (res.encryptedData) {
          wx.request({
            url: config.gropPostUrl,
            data: {
              code: code,
              encryptedData: res.encryptedData,
              iv: res.iv
            },
            header: {
              "content-type": "application/x-www-form-urlencoded",
              "sessionId": wx.getStorageSync("sessionId")
            },
            method: "post",
            success: function (res) {

            }
          })
        }
      }
    });
  }
}
function commonRequest(config) {
  if (config.data == undefined) {
    config.data = {};
  }
  if (config.header == undefined) {
    config.header = {};
  }
  if (config.login) {
    if (haveLogin()) {
      config.header.sessionId = wx.getStorageSync("sessionId");
      doRequest(config);
    } else {
      doLogin(function () {
        config.header.sessionId = wx.getStorageSync("sessionId");
        doRequest(config);
      });
    }
  } else {
    doRequest(config);
  }

}
function doRequest(config) {
  wx.request({
    url: config.url,
    method: config.method,
    data: config.data,
    header: config.header,
    success: function (res) {
      if (res.data.code == "000000") {
        if (config.successFun) {
          config.successFun(res);
        }
      } else {
        wx.showToast({
          title: res.data.message,
          icon: "none"
        })
        if (config.failFun) {
          config.failFun(res);
        }
      }
    },
    fail: function (e) {
      wx.showToast({
        title: "服务器开了个小差，请稍后重试",
        icon: "none"
      })
      if (config.failFun) {
        config.failFun(e);
      }
    }
  });
}
function haveLogin() {
  var sessionId = wx.getStorageSync("sessionId");
  var sessionIdExpire = wx.getStorageSync("sessionIdExpire");
  var now = Date.now();
  if (sessionId != undefined && sessionId != ""
    && sessionIdExpire != undefined && sessionIdExpire != '' && now < sessionIdExpire) {
    return true;
  } else {
    return false;
  }
}
function commonShare(data, successFun) {
  wx.request({
    url: config.shareUrl,
    method: 'GET',
    data: data,
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    success: function (res) {
      if (res.data.code == "000000") {
        if (successFun) {
          successFun(res);
        }
      }
    },
    fail: function (e) {

    }
  })
}

function format(str, args) {
  if (args.length == 0) return str;
  for (var s = str, i = 0; i < args.length; i++) {
    s = s.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
  }
  return s;
}

module.exports = {
  formatTime: formatTime,
  doLogin: doLogin,
  postGroup: postGroup,
  shareIndex: shareIndex,
  haveLogin: haveLogin,
  commonRequest: commonRequest,
  commonShare: commonShare,
  format: format
}  