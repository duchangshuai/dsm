// pages/commission/commission.js
var config = require('../../config.js');
var common = require('../../common.js');
var pageSize = 15;
var pageNumber = 1;
var count = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemlist: [],
    count:0,
    haveOrderUser:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pageNumber=1;
    this.getData();
  },
  getData:function(){
    var that = this;
    common.commonRequest({
      url: config.recommendUrl + '?pageNumber=' + pageNumber + '&pageSize=' + pageSize,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      successFun: function (res) {
        var list = res.data.data.detail;
        var itemlist = that.data.itemlist;
        var loadMoreData;
        if (list.length == pageSize) {
          loadMoreData = "下拉加载更多……";
        } else {
          loadMoreData = "已经到底了……";
        }
        if (res.data.data.count == 0) {
          loadMoreData = "";
        }
        if (list.length > 0) {
          for (var index in list) {
            itemlist.push(list[index])
            var sjc = list[index].createDate;
            var createDate = common.formatTime(sjc, 'Y/M/D h:m:s')
            list[index].createDate = createDate;
          }
          that.setData({
            list: res.data.data.detail,
            itemlist: itemlist,           
            count: res.data.data.count,
            haveOrderUser: res.data.data.haveOrderUser,
            loadMoreData: loadMoreData,
            hideBottom: false
          });
          pageNumber++;
        } else {
          if (res.data.data.count == 0) {
            loadMoreData = "";
          } else {
            loadMoreData = "已经到底了……";
          }
          that.setData({
            loadMoreData: loadMoreData,
            hideBottom: false
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  //加载更多
  onReachBottom: function () {
    this.getData();
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    var that = this;
    setTimeout(function () {
      pageNumber = 1;  
      that.data.itemlist=[];
      that.onLoad();
    }, 300);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})