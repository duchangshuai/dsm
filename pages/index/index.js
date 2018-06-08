//var json = require('../../lib/data/Home_data.js');   //数据
var config = require('../../config.js');
var common = require('../../common.js');
var app = getApp();
//var template = require('../../template/template.js');
var pageSize = 15;
var pageNumber = 1;
var dynamicList = [];
var imageUrl;
var title = app.globalData.title;
Page({
  data: {
    vertical: false,
    autoplay: true,
    interval: 5000,
    duration: 500,
    scrollTop: 0,
    swiperCurrent: 0,
    circular: true,
    noItem: false,
    dynamicList: [],
    loadMoreData: '加载更多……',
    hideBottom: true,
    hideHeader: true,  //下拉刷新 
    currentPage: 1,  // 当前页数  默认是1
  },
  /* 生命周期函数--监听页面加载 */
  onLoad: function (options) {
    pageNumber = 1;    
    var that = this;
    if (options != undefined && options.shareId != undefined && options.shareId != '') {
      wx.setStorageSync("shareId", options.shareId);
    }

    if (options != undefined && options.scene != undefined && options.scene != "") {
      if (wx.getStorageSync("shareId") == undefined || wx.getStorageSync("shareId") == "") {
        wx.setStorageSync('shareId', decodeURIComponent(options.scene));
      }
    }
    common.commonRequest({
      url: config.indexListUrl,
      method: 'GET',
      successFun: function (res) {
        that.setData({
          itemList: res.data.data.itemList,
          carousel: res.data.data.carousel,
          itemNew: res.data.data.itemNew,
          hot: res.data.data.hot,
          recommend: res.data.data.recommend,
          loadMoreData: '加载更多……',
          dynamicList: []
        })
      }
    });
    common.commonShare(
      {
        type: 100
      },
      function (res) {
        if (res.data.data != null) {
          title = res.data.data.title;
          imageUrl = res.data.data.pic
        }
      }
    );
  },
  // 跳转子页面 详情页面
  btn: function (e) {
    var HomeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../detail/detail?id=' + HomeId,
    })
  },
  /* 点击banner跳转页面*/
  kindToggle: function (e) {
    var sourceId = e.currentTarget.dataset.id;
    var isOpen = e.currentTarget.dataset.isopen;
    if (isOpen == true) {
      wx.navigateTo({
        url: '../detail/detail?id=' + sourceId,
      })
    }
  },
  goTop: function (e) {
    this.setData({
      scrollTop: 0
    })
  },
  scroll: function (e) {
    // 容器滚动时将此时的滚动距离赋值给 this.data.scrollTop
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
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
      that.data.dynamicList = [];
      that.onLoad();
    }, 300);
  },
  getData: function () {
    var that = this;
    common.commonRequest({
      url: config.itemListUrl + '?pageNumber=' + pageNumber + '&pageSize=' + pageSize,
      method: 'GET',
      successFun: function (res) {
        pageNumber++;
        var dynamicList = that.data.dynamicList;
        var itemList = res.data.data;
        if (itemList.length == 0) {
          that.setData({
            loadMoreData: "没有更多商品了",
            hideBottom: false
          })
        } else {
          for (var index in itemList) {
            dynamicList.push(itemList[index])
          }
          that.setData({
            dynamicList: dynamicList,
            loadMoreData: "加载更多……",
            hideBottom: false
          })
        }
        if (pageNumber == 1) {
          that.setData({
            hideHeader: true
          })
        }
      }
    });
  },
  //右上角分享

  onShareAppMessage: function (res) {
    wx.showShareMenu({
      withShareTicket: true
    });
    return common.shareIndex(title, imageUrl);
  },

  // 轮播样式滑动
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  }
})
