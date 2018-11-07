import newData from '../../utils/DataURL.js';
import util from '../../utils/util.js';
var conf = require('../../config');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    pstart_at:'2018-06-01',
    pend_at:'2018-06-01',
    order: {},
    pageBackgroundColor: 'rgba(0, 0, 0, .4)',
    vkinds: [],
    vkind: "",
    vtps: [],
    vtp: "",
    value: [0, 0, 0],
    values: [0, 0, 0],
    condition: false,
  },

  /*
   生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //检查页面层级       
    let self = this;
    if (options != null) {
      let or = self.data.order;
      or.name = options.nickname;
      or.phone = options.phone;
      if (options.address != 'null') {
        or.address = options.address;
      }

      self.setData({
        orderId: options.orderId,
        order: or,
      })
    }

    self.getSort();
  },

  getSort: function(e) {
    let val = 0;
    let sec = 0;
    if (e != undefined) {
      val = e.detail.value[0];
      sec = e.detail.value[1];
    }

    const vkinds = [];
    const vtps = [];

    let that = this;
    let param = {
      API_URL: conf.sortUrl,
    };

    newData.result(param).then(res => {
      let dd = res.data;

      for (let i = 0; i < dd.length; i++) {
        vkinds.push(dd[i].name);
      }
      that.setData({
        'vkinds': vkinds,
        'vkind': vkinds[val]
      })

      //默认项
      let pp = {
        API_URL: conf.sortUrl + dd[val].id,
      }
      newData.result(pp).then(res => {
        let mm = res.data;
        for (let j = 0; j < mm.length; j++) {
          let aa = {};
          aa.name = mm[j].name;
          aa.id = mm[j].id;
          vtps.push(aa);

        }
        //不知道为什么，必须在循环结束后赋值
        that.setData({
          'vtps': vtps,
          'vtp': vtps[sec]
        })
      })
    });
    console.log('初始化完成');
  },

  open: function() {
    this.setData({
      condition: !this.data.condition,
      pageBackgroundColor: 'rgba(0, 0, 0, .4)',
    })
  },

  //字数
  countSelfFun: function(e) {
    var eValueLen = e.detail.value.length,
      eValue = e.detail.value;
    this.setData({
      selfLen: eValueLen,
      myself: eValue
    })
  },
  //保存
  formSubmit: function(e) {
    let self = this;
    let order = e.detail.value;
    if (order.name == '' || order.name == undefined) {
      wx.showToast({
        title: "姓名必填",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return false;
    }
    if (order.counts == '' || order.counts == undefined) {
      wx.showToast({
        title: "数量必填",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return false;
    }
    if (order.phone == '' || order.phone == undefined) {
      wx.showToast({
        title: "手机号码必填",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return false;
    }
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(order.phone))) {
      wx.showToast({
        title: "号码格式错误",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return false;
    }

    let url = '';
    let orderId = self.data.orderId;
    if (orderId != '') {
      url = conf.orderSureUrl;
      order.id = orderId;
    } else
      url = conf.orderUrl;
    console.log(order);

    order.start_at = self.data.pstart_at;
    order.end_at = self.data.pend_at;
    order.state=0;
    order.payment=0;

    let param = {
      API_URL: url,
      data: order,
      method: "POST"
    };

    newData.result(param).then(res => {
      console.log(res)
      if (res.statusCode == 200) {
        //写入缓存
        getApp().globalData.userData.is_active = 1;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面

        let pUserData = app.globalData.userData;
        pUserData.is_active = 1;

        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        // prevPage.setData({
        //   userData: pUserData,
        // })

        //弹窗跳转
        if (orderId == '') {
          wx.showModal({
            title: '操作成功',
            confirmText: '继续添加',
            cancelText: '返回上页',
            success: function(res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: "/pages/order/edit"
                })
              } else if (res.cancel) {
                wx.navigateBack();
              }
            }
          })
        } else {
          wx.showModal({
            title: '操作成功',
            showCancel: false,
            confirmText: '确定',
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          })
        }

      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none',
          duration: 4000
        })
      }
    })
  },

  //  点击日期组件确定事件  
  bindDateChangeStart: function (e) {
    let self = this;
    this.setData({
      pstart_at: e.detail.value
    })
  }, 
  //  点击日期组件确定事件  
  bindDateChangeEnd: function (e) {
    let self = this;
    this.setData({
      pend_at: e.detail.value
    })
  }, 
})