import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp();

Page({
  data: {
    userData: {},
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    isStatus: 'pay', //10待付款，20待发货，30待收货 40、50已完成
    page: 0,
    refundpage: 0,
    orderList: [],
    orderListOne: [],
    orderListTwo: [],
    orderCount: '0',
    orderCountOne: '0',
    orderCountTwo: '0',
    links: [],
    meta: [],
    linksOne: [],
    metaOne: [],
    linksTwo: [],
    metaTwo: [],
    TabNum: '4',
    TabNumState: '4',
    TabNumSend: '4',
    TabNumPayment: '4'
  },
  onLoad: function(options) {
    let self = this;
    self.loadOrderList()
    self.loadOrderSend()
    self.loadOrderPayment()
    self.loadOrderCount()
    self.setData({
      userData: app.globalData.userData,
    })
  },
  // getOrderStatus: function() {
  //   return this.data.currentTab == 0 ? 1 : this.data.currentTab == 2 ? 2 : this.data.currentTab == 3 ? 3 : 0;
  // },
  //加载统计数据
  loadOrderCount: function() {
    let that = this;
    let param = {
      API_URL: conf.orderCount,
    };

    newData.result(param).then(res => {
      that.setData({
        orderCount: res.data.orderList,
        orderCountOne: res.data.ordersSend,
        orderCountTwo: res.data.payment,
      });
      console.log(res.data)
    });
  },
  //加载苗场未送苗和未付款账单
  loadOrderList: function() {
    let that = this;
    let param = {
      API_URL: conf.orderListSeller,
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404){
        that.setData({
          orderList: res.data.data,
          links: res.data.links,
          meta: res.data.meta
        });
        if (that.data.orderList.length == 0) {
          that.setData({
            TabNum: 4
          });
        } else {
          that.setData({
            TabNum: that.data.orderList.length
          });
        }
      }else{
        that.setData({
          orderList: [],
          links: [],
          meta: []
        });
      }
    });
  },
  //加载已送苗账单
  loadOrderSend: function() {
    let that = this;
    let param = {
      API_URL: conf.orderListState,
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderListOne: res.data.data,
          linksOne: res.data.links,
          metaOne: res.data.meta
        });
        
      } else {
        that.setData({
          orderListOne: [],
          linksOne: [],
          metaOne: []
        });
      }
    });
  },
  //加载已收款账单
  loadOrderPayment: function() {
    let that = this;
    let param = {
      API_URL: conf.orderListPayment,
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderListTwo: res.data.data,
          linksTwo: res.data.links,
          metaTwo: res.data.meta
        });
        
      } else {
        that.setData({
          orderListTwo: [],
          linksTwo: [],
          metaTwo: []
        });
      }
    });
  },

  // onPageScroll: function (e) {
  //   console.log(e);//{scrollTop:99}
  // },

  //页面上拉触底事件的处理函数
  onReachBottom: function(e) {
    var that = this;
    if (that.data.currentTab == 0) {
      // 页数+1
      let page = that.data.meta.current_page;
      if (page < that.data.meta.last_page) {
        // 显示加载图标
        // wx.showLoading({
        //   title: '加载中...',
        // })
        let param = {
          API_URL: conf.orderListSeller + '?page=' + (page + 1),
        };
        newData.result(param).then(res => {
          let orderData = that.data.orderList.concat(res.data.data)
          that.setData({
            orderList: orderData,
            links: res.data.links,
            meta: res.data.meta,
            TabNum: orderData.length,
            TabNumState: orderData.length
          });
          // 隐藏加载框
          // wx.hideLoading();
        })
      }
    }

    if (that.data.currentTab == 1) {
      // 页数+1
      let pageOne = that.data.metaOne.current_page;
      if (pageOne < that.data.metaOne.last_page) {
        // 显示加载图标
        // wx.showLoading({
        //   title: '加载中...',
        // })
        let param = {
          API_URL: conf.orderListState + '?page=' + (pageOne + 1),
        };
        newData.result(param).then(res => {
          let orderDataOne = that.data.orderListOne.concat(res.data.data)
          that.setData({
            orderListOne: orderDataOne,
            linksOne: res.data.links,
            metaOne: res.data.meta,
            TabNum: orderDataOne.length,
            TabNumSend: orderDataOne.length
          });
          // 隐藏加载框
          // wx.hideLoading();
        })
      }
    }
    if (that.data.currentTab == 2) {
      // 页数+1
      let pageTwo = that.data.metaTwo.current_page;
      if (pageTwo < that.data.metaTwo.last_page) {
        // 显示加载图标
        // wx.showLoading({
        //   title: '加载中...',
        // })
        let param = {
          API_URL: conf.orderListPayment + '?page=' + (pageTwo + 1),
        };
        newData.result(param).then(res => {
          let orderDataTwo = that.data.orderListTwo.concat(res.data.data)
          that.setData({
            orderListTwo: orderDataTwo,
            linksTwo: res.data.links,
            metaTwo: res.data.meta,
            TabNum: orderDataTwo.length,
            TabNumPayment: orderDataTwo.length
          });
          // 隐藏加载框
          // wx.hideLoading();
        })
      }
    }
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var self = this;
    self.loadOrderList()
    self.loadOrderSend()
    self.loadOrderPayment()
    self.loadOrderCount()
  },
  //取消订单
  removeOrder: function(e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: function(res) {
        if (res.confirm) {
          let param = {
            API_URL: conf.orderDestroy,
            data: data,
            method: "POST"
          };
          newData.result(param).then(res => {
            console.log(res.data)
            var status_code = res.data.status_code;
            if (status_code == '200') {
              // wx.showToast({
              //   title: '取消成功！',
              //   duration: 500
              // });
              that.loadOrderList();
            } else {
              wx.showToast({
                title: '取消失败',
                duration: 500
              });
            }
          })
        }

      }
    });
  },
  stateOrder: function(e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.state = '1';
    wx.showModal({
      title: '提示',
      content: '确定已送苗吗？',
      success: function(res) {
        if (res.confirm) {
          let param = {
            API_URL: conf.orderUpdateState,
            data: data,
            method: "POST"
          };
          newData.result(param).then(res => {
            console.log(res.data)
            var status_code = res.data.status_code;
            if (status_code == '200') {
              // wx.showToast({
              //   title: '标记成功！',
              //   duration: 500
              // });
              that.loadOrderList()
              that.loadOrderSend()
              that.loadOrderCount()
            } else {
              wx.showToast({
                title: '标记失败！',
                duration: 500
              });
            }
          })
        }
      }
    });
  },
  noStateOrder: function(e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.state = '0';
    wx.showModal({
      title: '提示',
      content: '确定没送苗吗？',
      success: function(res) {
        if (res.confirm) {
          let param = {
            API_URL: conf.orderUpdateState,
            data: data,
            method: "POST"
          };
          newData.result(param).then(res => {
            console.log(res.data)
            var status_code = res.data.status_code;
            if (status_code == '200') {
              // wx.showToast({
              //   title: '标记成功！',
              //   duration: 500
              // });
              that.loadOrderList()
              that.loadOrderSend()
              that.loadOrderCount()
            } else {
              wx.showToast({
                title: '标记失败！',
                duration: 500
              });
            }
          })
        }
      }
    });
  },
  paymentOrder: function(e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.payment = '1';
    wx.showModal({
      title: '提示',
      content: '确定已收到钱了吗？',
      success: function(res) {
        if (res.confirm) {
          let param = {
            API_URL: conf.orderUpdatePayment,
            data: data,
            method: "POST"
          };
          newData.result(param).then(res => {
            console.log(res.data)
            var status_code = res.data.status_code;
            if (status_code == '200') {
              // wx.showToast({
              //   title: '标记成功！',
              //   duration: 500
              // });
              that.loadOrderSend()
              that.loadOrderPayment()
              that.loadOrderCount()
            } else {
              wx.showToast({
                title: '标记失败！',
                duration: 500
              });
            }
          })
        }
      },
    });
  },

  initSystemInfo: function() {
    var that = this;

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  bindChange: function(e) {
    var that = this;
    let TabNumState = that.data.TabNumState
    let TabNumSend = that.data.TabNumSend
    let TabNumPayment = that.data.TabNumPayment
    if (that.data.TabNumState <= 9) {
      if (that.data.orderList.length == 0){
        TabNumState = 9
      }else{
        TabNumState = that.data.orderList.length
      }
    }
    if (that.data.TabNumSend <= 9) {
      if (that.data.orderListOne.length == 0){
        TabNumSend = 4
      }else{
        TabNumSend = that.data.orderListOne.length
      }
    }
    if (that.data.TabNumPayment <= 9) {
      if (that.data.orderListTwo.length == 0){
        TabNumPayment = 4
      }else{
        TabNumPayment = that.data.orderListTwo.length
      }
    }
    if (e.detail.current == 0) {
      that.setData({
        currentTab: e.detail.current,
        TabNum: TabNumState
      });
    }
    if (e.detail.current == 1) {
      that.setData({
        currentTab: e.detail.current,
        TabNum: TabNumSend
      });
    }
    if (e.detail.current == 2) {
      that.setData({
        currentTab: e.detail.current,
        TabNum: TabNumPayment
      });
    }
  },

  //切换tab
  swichNav: function(e) {
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      var current = e.target.dataset.current;
      that.setData({
        currentTab: parseInt(current),
        isStatus: e.target.dataset.otype,
      });

      //没有数据就进行加载
      switch (that.data.currentTab) {
        case 0:
          !that.data.orderList.length && that.loadOrderList();
          break;
        case 1:
          !that.data.orderListOne.length && that.loadOrderSend();
          break;
        case 2:
          !that.data.orderListTwo.length && that.loadOrderPayment();
          break;
      }
    };
  },
  makePhoneCall: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.target.id
    })
  },
  openlocation: function(e) {
    this.setData({
      locationArr: e.target.dataset,
    });
    let self = this;
    let ss = self.data.locationArr;
    console.log(ss)
    wx.openLocation({
      latitude: Number(ss.latitude),
      longitude: Number(ss.longitude),
      scale: 17,
      name: ss.name,
      address: ss.address
    })

  },
  setlocation:function(e){
    var that = this;
    let data = {};
    wx.chooseLocation({
      success: function (res) {
        data.id = e.target.id
        data.address = res.address
        data.name = res.name
        data.longitude = res.longitude
        data.latitude = res.latitude
          let param = {
            API_URL: conf.orderUpdateLocation,
            data: data,
            method: "POST"
          };
          newData.result(param).then(res => {
            console.log(res.data)
            var status_code = res.data.status_code;
            if (status_code == '200') {
              wx.showToast({
                title: '标记成功！',
                duration: 500
              });
              that.loadOrderList()
              that.loadOrderSend()
              that.loadOrderPayment()
            } else {
              wx.showToast({
                title: '标记失败！',
                duration: 500
              });
            }
          })
      }
    });
  }

})