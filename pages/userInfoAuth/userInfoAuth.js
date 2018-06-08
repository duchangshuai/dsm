Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {

  },
  bindGetUserInfo: function (e) {
    wx.navigateBack({
      delta: 1
    })
  }
})