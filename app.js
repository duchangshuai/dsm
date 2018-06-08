var config = require('config.js');
var sessionId = "";
App({
  data: {},
  onLaunch: function (options) {
    console.log(options)
    if (options != undefined && options.shareTicket != undefined && options.shareTicket != "") {
      if (wx.getStorageSync("shareTicket") == undefined || wx.getStorageSync("shareTicket") == "") {
        wx.setStorageSync('shareTicket', options.shareTicket);
      }
    }
    if (options != undefined && options.scene != undefined && options.scene != "") {
      if (wx.getStorageSync("scene") == undefined || wx.getStorageSync("scene") == "") {
        wx.setStorageSync('scene', options.scene);
      }
    }
  },
  onShow: function (options) {

  },
  globalData: {
    userInfo: null,
    title:"德施曼官方微商城"
  }
})