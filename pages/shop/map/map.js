// pages/shop/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0,
    center: [113.324520, 23.099994],
    shops: [{
      iconPath: "../../../images/use/map5.png",
      id: 0,
      latitude: 36.06623,
      longitude: 120.38299,
      width: 32,
      height: 32
    },{
        iconPath: "../../../images/use/map.png",
        id: 1,
        latitude: 35.951587,
        longitude: 120.191352,
        width: 32,
        height: 32
      }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const system = wx.getSystemInfoSync()
    this.setData({
      height: system.windowHeight
    })
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          center: [res.longitude, res.latitude]
        })
        console.log(res.longitude, res.latitude)
        wx.request({
          url: '',
          data: {
            lat: res.latitude,
            lng: res.longitude,
            page: 1
          },
          success: (res) => {
            res.data.data.map((e) => {
              e.iconPath = "../../../images/use/map5.png"
              e.width = 32
              e.height = 32
              e.latitude = e.location.lat
              e.longitude = e.location.lng
            })
            this.setData({
              markers: res.data.data
            })
            console.log(res.data.data)
          }
        })
      }
    })
  },
  markertap(e) {
    console.log(e)
    // let mark = {}
    // this.data.markers.map((ele) => {
    //   if (ele.id == e.markerId)
    //     mark = ele
    // })
    // wx.navigateTo({
    //   url: '../logs/logs?lat=' + mark.latitude + '&lng=' + mark.longitude + '&address=' + mark.address + '&distance=' + mark._distance
    // })
    // return
    // wx.showModal({
    //   title: '厕所地址',
    //   content: mark.address + ' (' + mark._distance.toFixed(0) + 'm)',
    //   showCancel: false,
    //   success: function (res) {
    //     if (res.confirm) {
    //       console.log('用户点击确定')
    //     }
    //   }
    // })
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