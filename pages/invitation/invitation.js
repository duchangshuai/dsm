// pages/invitation/invitation.js
var config = require('../../config.js');
var common = require('../../common.js');
var userId;
Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    userId = options.invitationId;
  },
  Agree: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          var code = res.code;
          wx.getUserInfo({//getUserInfo流程
            success: function (res) {
              var encryptedData = res.encryptedData;
              var iv = res.iv;
              var data = {
                encryptedData: encryptedData,
                code: code,
                iv: iv,
                inviteId: userId
              };
              var scene = wx.getStorageSync("scene");
              if (scene != undefined && scene != "") {
                data.scene = scene;
              }
              common.commonRequest({
                url: config.loginUrl,
                data: data,
                method: 'POST',
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                successFun: function (res) {
                  wx.showToast({
                    title: "邀约成功",
                    duration: 5000,
                    success: function () {
                      wx.switchTab({
                        url: '/pages/index/index',
                      })
                    }
                  })
                }
              })
            },
            fail: function (e) {
              wx.navigateTo({
                url: '/pages/userInfoAuth/userInfoAuth',
              })
            }            
          })
        } else {
          wx.showToast({
            title: "邀约失败",
          })
        }
      }
    });
  }
})