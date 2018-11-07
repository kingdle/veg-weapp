import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
var app = getApp()
// pages/user/code/code.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userData: {},
    userInfo: {},
    shop: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getShop();
    that.setData({
      userData: app.globalData.userData,
      userInfo: app.globalData.userInfo,
    })
  },
  getShop: function () {
    let that = this;
    let param = {
      API_URL: conf.userShop,
    };
    newData.result(param).then(res => {
      if (res.statusCode == 200) {
        let pp = res.data;
        that.setData({
          shop: pp
        })
        console.log(this.data.shop)
      }
    })

  },
  saveImgToPhotosAlbumTap: function () {
    let self = this;
    wx.downloadFile({
      url: self.data.shop.code,
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (res) {
            wx.showToast({
              title: "保存失败",
              image: '/images/use/tip.png',
              duration: 2000
            })
          }
        })
      },
      fail: function () {
        console.log('fail')
      }
    })
  },
  makePhoneCall: function () {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.shop.user.phone
    })
  },
  makePhoneCallMiaoguo: function () {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: '18661737287'
    })
  },
  openAddress: function () {
    let self = this;
    let ss = self.data.shop;
    wx.openLocation({
      latitude: Number(ss.latitude),
      longitude: Number(ss.longitude),
      scale: 17,
      name: ss.title,
      address: ss.address
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  
})