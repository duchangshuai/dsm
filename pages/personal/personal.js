const app = getApp();
var config = require('../../config.js');
var common = require('../../common.js');
var bloolean = false;
var qrCodePath;
var codeUrl;
var shareImage;
var options;
var title = app.globalData.title;
var imageUrl;
var indexTitle = app.globalData.title;
var indexUrl = "";
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    showView: "",
    showInvite: "",
    showCanvas: false,
    addCart: false,
    showSharePic: false,
    animationData: {}
  },
  onLoad: function (opt) {
    options = opt;
    //佣金
    common.commonShare({
      type: 103
    }, function (res) {
      if (res.data.data != null) {
        title = res.data.data.title;
        imageUrl = res.data.data.pic;
      }
    });
    //主页
    common.commonShare(
      {
        type: 100
      },
      function (res) {
        if (res.data.data != null) {
          indexTitle = res.data.data.title;
          indexUrl = res.data.data.pic
        }
      }
    );
  },
  onShow: function () {
    var that = this;
    if (options != undefined && options.shareId != undefined) {
      if (wx.getStorageSync("shareId") == undefined || wx.getStorageSync("shareId") == '') {
        wx.setStorageSync("shareId", options.shareId);
      }
    }
    that.getData(options);
  },
  getData: function (options) {
    var that = this;
    showView: (options.showView == "true" ? true : false)
    showView: (options.showInvite == "true" ? true : false)
    showSharePic: (options.showSharePic == "true" ? true : false)
    showCanvas: (options.showCanvas == "true" ? true : false)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    common.commonRequest({
      url: config.myauthUrl,
      method: "GET",
      login: true,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      successFun: function (res) {
        that.setData({
          showView: res.data.data.commission,
          showInvite: res.data.data.invite,
          userId: res.data.data.userId
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from == "button") {
      var dsmToken = wx.getStorageSync("dsmToken");
      var path = '/pages/invitation/invitation?invitationId=' + this.data.userId;
      if (dsmToken != undefined) {
        path = path + "&shareId=" + dsmToken;
      }
      // 来自页面内转发按钮
      return {
        title: title,
        path: path,
        imageUrl: imageUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      wx.showShareMenu({
        withShareTicket: true
      });
      return common.shareIndex(indexTitle, indexUrl);
    }
  },
  // 拨打电话
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: '400-880-1889',
      success: function () {
      },
      fail: function () {
      }
    })
  },
  addCart: function (e) {
    var that = this;
    var animation = wx.createAnimation({  // 创建一个动画实例
      duration: 500,  // 动画持续时间
      timingFunction: 'linear'   // 定义动画效果，当前是匀速
    })
    that.animation = animation  // 将该变量赋值给当前动画
    animation.translateY(200).step()   // 先在y轴偏移，然后用step()完成一个动画
    that.setData({
      animationData: animation.export(),  // 通过export()方法导出数据
      addCart: true
    })
    setTimeout(function () {    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        addCart: false,
        showSharePic: false,
        showCanvas: false
      })
    }, 200)
  },
  // 生成二维码
  generateCode: function () {
    this.addCart()
    var that = this;
    common.commonRequest({
      url: config.codeUrl,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      login: true,
      method: 'GET',
      successFun: function (res) {
        that.setData({
          codeUrl: res.data.data,
          showCanvas: true
        })
        wx.getImageInfo({
          src: res.data.data,
          success: function (res) {
            qrCodePath = res.path;
            //y方向的偏移量，因为是从上往下绘制的，所以y一直向下偏移，不断增大。
            let yOffset = 20;
            const codeText = '长按识别小程序码查看详情';
            const imgWidth = 780;
            const imgHeight = 1600;
            const canvasCtx = wx.createCanvasContext('shareCanvas');
            //绘制背景
            canvasCtx.setFillStyle('white');
            canvasCtx.fillRect(0, 0, 250, 250);
            //绘制二维码
            canvasCtx.drawImage(qrCodePath, 0, 0, 250, 250);
            canvasCtx.draw();
            //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width: 250,
              height: 250,
              destWidth: 250,
              destHeight: 250,
              canvasId: 'shareCanvas',
              success: function (res) {
                that.setData({
                  shareImage: res.tempFilePath,
                  showSharePic: true,

                })
                shareImage = res.tempFilePath,
                  wx.hideLoading();
              },
              fail: function (res) {
                wx.hideLoading();
              }
            })
          }
        })
      }
    })
  },
  // 保存图片并分享
  sharePic: function () {
    var that = this;
    const canvasCtx = wx.createCanvasContext('shareCanvas');
    wx.saveImageToPhotosAlbum({
      filePath: shareImage,
      success(res) {
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: '#72B9C3',
          success: function (res) {
            if (res.confirm) {
              that.setData({
                showSharePic: false,
                showCanvas: false,
                addCart: false

              })
              canvasCtx.clearRect(0, 0, 250, 250)
              canvasCtx.draw()
            } else {

            }
          }, fail: function (res) {
          }
        })
      },
      fail: function (res) {
        console.info(res);
        if (res.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
          wx.showModal({
            content: '未授权使用相册，您将不能保存图片到本地，前往授权？',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {

                    } else {

                    }
                  }
                })

              } else if (res.cancel) {
                // console.log('用户点击取消')
                that.setData({
                  showSharePic: false,
                  showCanvas: false,
                  addCart: false
                })
              }
            }
          })
        }
        else if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          wx.showModal({
            content: '未授权使用相册，您将不能保存图片到本地，前往授权？',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success(settingdata) {
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {

                    } else {
                      that.setData({
                        showSharePic: false,
                        showCanvas: false
                      })
                    }
                  }
                })
              } else if (res.cancel) {
                // console.log('用户点击取消')                
                that.setData({
                  showSharePic: false,
                  showCanvas: false,
                  addCart: false
                })
              }
            }
          })
        }
      }
    })
  }
})