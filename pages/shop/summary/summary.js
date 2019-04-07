import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopData:'',
    summary: '',
    disabled:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
    that.setData({
      shopData: wx.getStorageSync('shopData'),
      summary: wx.getStorageSync('shopData').summary
    })

  },
  summaryInput: function (event) {
    let that = this;
    console.log(event.detail)
    that.setData({
      summary: event.detail
    })
    if (that.data.shopData.summary != event.detail){
      if (event.detail != '') {
        that.setData({
          disabled: false
        })
      }else{
        that.setData({
          disabled: true
        })
      }
    }else{
      that.setData({
        disabled: true
      })
    }
  },
  summaryUpdate: function () {
    let that = this;
    let data = {}
    if (that.data.summary == '') {
      wx.showToast({
        title: "内容不能为空",
        image: '/images/use/tip.png',
        duration: 1000
      })
      return;
    }
    data.summary = that.data.summary
    let param = {
      API_URL: conf.userShop,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        wx.setStorageSync('shopData', res.data.data)
        wx.showToast({
          title: "更新成功",
          icon: 'success',
          duration: 1000
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