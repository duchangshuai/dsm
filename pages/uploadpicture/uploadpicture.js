// pages/uploadpicture/uploadpicture.js
var config = require('../../config.js');
var common = require('../../common.js');

var orderid;
var picType;
var tempFilePaths = [];
var all;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: [
      { 'uploaddetail': '图片包括开门方向信息', 'uploadtitle': '上传开门方向图' },
      { 'uploaddetail': '图片包括测量导向片长度及门的厚度信息', 'uploadtitle': '上传测量导向片长度及门的厚度图' },
      { 'uploaddetail': '图片包括门上是否有天地钩信息', 'uploadtitle': '上传门上是否有天地钩' },
    ],
    tempFilePaths: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    orderid = options.orderid;
    common.commonRequest({
      url: config.queryDoorPicUrl + '/' + orderid,
      method: 'GET',
      data: {
        picType: 'all'
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      login: true,
      successFun: function (res) {
        var tempFilePaths = that.data.tempFilePaths;
        for (var index in res.data.data) {
          if (res.data.data[index].type == '30') {
            tempFilePaths[0] = res.data.data[index].pic;
          } else if (res.data.data[index].type == '40') {
            tempFilePaths[1] = res.data.data[index].pic;
          } else if (res.data.data[index].type == '50') {
            tempFilePaths[2] = res.data.data[index].pic;
          }
        }
        that.setData({
          tempFilePaths: tempFilePaths
        })

      }
    });
  },
  //选择图片
  chooseImage: function (e) {
    var index = e.currentTarget.dataset.idx;
    if (index == 0) {
      picType = 30;
    }
    if (index == 1) {
      picType = 40;
    }
    if (index == 2) {
      picType = 50;
    }
    var that = this;
    wx.chooseImage({
      sourceType: ['camera', 'album'],
      sizeType: ['compressed', 'original'],
      count: 1,
      success: function (res) {
        var tempFilePaths = res.tempFilePaths[0];
        wx.uploadFile({
          url: config.uploadDoorPicUrl + '/' + orderid,
          formData: {
            picType: picType
          },
          filePath: tempFilePaths,
          name: 'file',
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            "sessionId": wx.getStorageSync("sessionId")
          },
          success: function (res) {
            var data
            try {
              data = JSON.parse(res.data);
            } catch (e) {
              wx.showToast({
                title: "上传图片失败",
                icon: 'none'
              })
              return;
            }
            if (data.code == "000000") {
              common.commonRequest({
                url: config.queryDoorPicUrl + '/' + orderid,
                method: 'GET',
                data: {
                  picType: picType
                },
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                login: true,
                successFun: function (res) {
                  var list = res.data.data;
                  var picUrl = list[0].pic;
                  var tempFilePaths = that.data.tempFilePaths;
                  var picUrl = res.data.data[0].pic;
                  tempFilePaths[index] = picUrl;
                  that.setData({
                    tempFilePaths: tempFilePaths,
                  })
                }
              });
            } else {
              wx.showToast({
                title: data.message,
                icon: 'none'
              })
            }
          },
          fail: function (e) {
            wx.showToast({
              title: "网络异常",
              icon: 'none'
            })
          },
          complete: function (res) {

          }
        })
      }
    })
  },
  //预览图片
  previewImage: function (e) {

    var index = e.currentTarget.dataset.idx;
    var urls = e.target.dataset.src;
    var current = urls[index];
    var tmpUrls = [];
    for (var index in urls) {
      if (urls[index] != null && urls[index] != "") {
        tmpUrls.push(urls[index]);
      }
    }
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: tmpUrls // 需要预览的图片http链接列表      
    })
  }
})