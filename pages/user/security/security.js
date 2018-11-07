import newData from '../../../utils/DataURL.js';
var conf = require('../../../config');
var app = getApp()

Page({
  /**
   * 初始化数据
   */
  data: {
    password: '',
    passwordConfirm: '',
  },

  /**
   * 监听手机号输入
   */
  listenerPasswordInput: function(e) {
    this.data.password = e.detail.value;
  },

  /**
   * 监听密码输入
   */
  listenerPasswordConfirmInput: function(e) {
    this.data.passwordConfirm = e.detail.value;
  },

  /**
   * 监听保存按钮
   */
  listenerSave: function() {
    //条件判断
    if (this.data.password == '' || this.data.passwordConfirm == '') {
      wx.showToast({
        title: "密码不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.password.length < 6) {
      wx.showToast({
        title: "密码不少于6位",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.password != this.data.passwordConfirm) {
      wx.showToast({
        title: "确认密码不符",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    let data = {};
    data.password = this.data.password
    let param = {
      API_URL: conf.upPassword,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code == 200){
        wx.showToast({
          title: res.data.message,
          duration: 2000,
        });
      }else{
        wx.showToast({
          title: '密码更新失败',
          duration: 2000,
        });
      }
      
    })
  },

  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})