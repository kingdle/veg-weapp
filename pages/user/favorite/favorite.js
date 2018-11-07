import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.loadFavoriteList()
  },
  loadFavoriteList: function () {
    let that = this;
    let data = {};
    data.latitude = wx.getStorageSync('locLat');
    data.longitude = wx.getStorageSync('locLng');
    let param = {
      API_URL: conf.followShopList,
      method: "POST",
      data: data
    };
    newData.result(param).then(res => {
      console.log(res.data.data)
      if (res.data.status_code != 401) {
        that.setData({
          shopList: res.data.data
        });
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})