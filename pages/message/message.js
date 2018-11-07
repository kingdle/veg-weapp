import newData from '../../utils/DataURL.js';
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
    src: '',
    inputValue: '',
    messageData: {},
    links: {},
    meta: {},
    slogan: [],
    TabNum: '16',
    danmuList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadMessageList()
  },
  //加载留言列表
  loadMessageList: function() {
    let that = this;
    let param = {
      API_URL: conf.messageUrl,
    };

    newData.result(param).then(res => {
      console.log(res.data)
      if (res.data.status_code != 404) {
        that.setData({
          messageData: res.data.data,
          links: res.data.links,
          meta: res.data.meta,
          last_page: res.data.meta.last_page,
          current_page: res.data.meta.current_page,
          slogan: res.data.slogan
        });
      } else {
        that.setData({
          messageData: []
        });
      }
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  bindInputBlur: function(e) {
    let that = this;
    that.data.inputValue = e.detail.value
    let data = {}
    if (that.data.inputValue == '') {
      wx.showToast({
        title: "建议内容不能为空",
        icon: 'none',
        duration: 500
      })
      return;
    }
    data.messageContent = that.data.inputValue
    
    data.color = getRandomColor()
    let param = {
      API_URL: conf.messageUrl,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        this.loadMessageList()
        this.videoContext.sendDanmu({
          text: that.data.inputValue,
          color: getRandomColor()
        })
        this.setData({
          inputValue: '',
        })
        wx.showToast({
          title: "留言成功",
          icon: 'success',
          duration: 2000
        })
      }
    });
  },
  bindSendDanmu: function() {


  },
  bindPlay: function() {
    this.videoContext.play()
  },
  bindPause: function() {
    this.videoContext.pause()
  },
  videoErrorCallback: function(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadMessageList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    let page = that.data.meta.current_page;
    if (page < that.data.meta.last_page) {
      let param = {
        API_URL: conf.messageUrl + '?page=' + (page + 1),
      };
      newData.result(param).then(res => {
        let messageData = that.data.messageData.concat(res.data.data)
        that.setData({
          messageData: messageData,
          links: res.data.links,
          meta: res.data.meta,
          TabNum: messageData.length,
        });
      })
    }
  },
  goHome: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  introduce: function () {
    wx.redirectTo({ url: '../introduce/introduce' })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '苗果数据就是生产力',
      // desc: '欢迎提出宝贵建议...',
      // path: '/pages/message/message',
      // imageUrl: "/images/use/logo.png",
      // success: function(res) {
      //   // 分享成功
      // },
      // fail: function(res) {
      //   // 分享失败
      // }
    }
  },
})