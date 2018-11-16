import getData from '../../utils/DataURL.js';
var conf = require('../../config');

function getRandomColor() {
  const rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    introduce: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.loadMessageList()
    this.getConfigs()
  },
  getConfigs: function () {
    let param = {
      API_URL: conf.configUrl,
      method: "GET"
    };

    getData.result(param).then(response => {
      wx.setStorageSync('configs', response.data)
      console.log(response.data['1'])
      this.setData({
        introduce: response.data['1'],
        });
    })
  },
  //加载留言列表
  // loadMessageList: function () {
  //   let that = this;
  //   let param = {
  //     API_URL: conf.messageUrl,
  //   };

  //   getData.result(param).then(res => {
  //     console.log(res.data)
  //     if (res.data.status_code != 404) {
  //       that.setData({
  //         messageData: res.data.data,
  //         links: res.data.links,
  //         meta: res.data.meta,
  //         last_page: res.data.meta.last_page,
  //         current_page: res.data.meta.current_page,
  //         slogan: res.data.slogan,
  //       });
  //     } else {
  //       that.setData({
  //         messageData: []
  //       });
  //     }
  //   });
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  
  bindSendDanmu: function () {

  },
  bindPlay: function () {
    this.videoContext.play()
  },
  bindPause: function () {
    this.videoContext.pause()
  },
  videoErrorCallback: function (e) {
   
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
    this.loadMessageList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  goHome: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  makePhoneCall: function () {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.introduce.shop_auto_play
    })
  },
  openlocationS: function () {
    let self = this;
    wx.openLocation({
      latitude: Number(self.data.introduce.header_auto_play),
      longitude: Number(self.data.introduce.header_interval),
      scale: 17,
      name: '苗果科技',
      address: self.data.introduce.header_indicator_dots
    })
  },
  openlocationQ: function () {
    let self = this;
    wx.openLocation({
      latitude: Number(self.data.introduce.header_circular),
      longitude: Number(self.data.introduce.shop_indicator_dots),
      scale: 17,
      name: '苗果科技',
      address: self.data.introduce.header_duration
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '苗果简介',
      // desc: '谢谢您，拿出了生命中的1分钟，来了解我们...',
      // path: '/pages/introduce/introduce',
      // imageUrl: "/images/use/logo.png",
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
})