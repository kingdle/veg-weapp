var conf = require('../../config');
var app = getApp();
Page({
  data: {
    showModalStatus: true,
    butn_show_loading: false,
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    let that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              app.doLogin(res);
            }
          })
        }
      }
    })
  },
  bindGetUserInfo: function (res) {
    let that = this;
    const encryptedData = res.detail.encryptedData;
    const iv = res.detail.iv;

    if (encryptedData && iv) {
      this.setData({
        butn_show_loading: true
      })
      // console.log("允许")
      app.doLogin(res.detail.userInfo);
    } else {
      // console.log("拒绝")      
      wx.showToast({
        title: "请点击允许按钮",
        image: '/images/use/tip.png',
        duration: 800
      })
    }

  },

})