import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopData: '',
    title: '',
    disabled: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      shopData: wx.getStorageSync('shopData'),
      title: wx.getStorageSync('shopData').title
    })

  },
  titleInput: function (event) {
    let that = this;
    console.log(event.detail)
    that.setData({
      title: event.detail
    })
    if (that.data.shopData.title != event.detail) {
      if (event.detail != '') {
        that.setData({
          disabled: false
        })
      } else {
        that.setData({
          disabled: true
        })
      }
    } else {
      that.setData({
        disabled: true
      })
    }
  },
  titleUpdate: function () {
    let that = this;
    let data = {}
    if (that.data.title == '') {
      wx.showToast({
        title: "内容不能为空",
        image: '/images/use/tip.png',
        duration: 1000
      })
      return;
    }
    data.title = that.data.title
    let param = {
      API_URL: conf.shopTitleUpdate,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      console.log(res)
      if (res.statusCode == 403) {
        wx.showToast({
          title: res.data.message,
          image: '/images/use/tip.png',
          duration: 2000
        })
        that.setData({
          title: wx.getStorageSync('shopData').title
        })
        return;
      }
      if (res.statusCode == 200) {
        wx.setStorageSync('shopData', res.data.data)
        wx.showToast({
          title: "更新成功",
          icon: 'success',
          duration: 1000
        })
        //更新上页
        var pages = getCurrentPages();
        if (pages.length > 1) {
          //上一个页面实例对象
          var prePage = pages[pages.length - 2];
          //关键在这里
          prePage.setData({
            shopTitle: wx.getStorageSync('shopData').title,
          })
        }
      }
      if (res.statusCode == 500) {
        wx.showToast({
          title: '服务器错误',
          image: '/images/use/tip.png',
          duration: 2000
        })
      }
    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})