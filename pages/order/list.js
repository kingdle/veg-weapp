import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp();

Page({
  data: {
    userData: {},
    orderList: [],
    meta: [],
    links:'',
    tabNum:'4012',
    state: '4',
    queryText:'',
    currentTab:'0',
    is_all:false,
  },
  onLoad: function (options) {
    let self = this;
    self.setData({
      userData: wx.getStorageSync('userData'),
    })
    self.loadOrderList()
  },
  onChange(event) {
    let self = this;
    let type_num = event.detail.index
    if (type_num ==0){
      self.setData({
        state: '4',
      });
      self.loadOrderList()
    }
    if (type_num == 1) {
      self.setData({
        state: '0',
      });
      self.loadOrderList()
    }
    if (type_num == 2) {
      self.setData({
        state: '1',
      });
      self.loadOrderList()
    }
    if (type_num == 3) {
      self.setData({
        state: '2',
      });
      self.loadOrderList()
    }
  },
  onClose(event) {
    let that=this
    const { position, instance } = event.detail;
    switch (position) {
      case 'left':
        let redirectUrl = '/pages/order/copy?id=' + event.target.id
        wx.navigateTo({
          url: redirectUrl
        })
        instance.close();
        break;
      case 'cell':
        instance.close();
        break;
      case 'right':
        let data = {
          id:event.target.id
        };
        wx.showModal({
          title: '提示',
          content: '确定要取消订单吗？',
          success: function (res) {
            if (res.confirm) {
              let param = {
                API_URL: conf.orderDestroy,
                data: data,
                method: "POST"
              };
              newData.result(param).then(res => {
                if (res.data.status_code == '200') {
                  instance.close();
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
        break;
    }
  },
  //加载统计数据
  loadOrderCount: function () {
    let that = this;
    let param = {
      API_URL: conf.orderCount,
    };

    newData.result(param).then(res => {
      that.setData({
        orderCount: res.data.orderList
      });
    });
  },
  //加载苗厂所有账单
  loadOrderList: function () {
    let that = this;
    let data={
      queryText:that.data.queryText,
      state:that.data.state
    }
    let param = {
      API_URL: conf.orderListByPhoneName,
      data:data,
      method: "POST"
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderList: res.data.data,
          meta: res.data.meta,
          links: res.data.links
        });
        console.log(res.data)
        if (res.data.meta.current_page == res.data.meta.last_page) {
          that.setData({
            is_all: true,
          });
        }
      } else {
        that.setData({
          orderList: [],
          meta: []
        });
      }
    });
  },
  inputTyping: function (event) {
    let that = this;
    that.setData({
      queryText: event.detail,
    });
  },
  onSearch: function () {
    let that = this;
    let data = {
      queryText: that.data.queryText,
      state: that.data.state
    }
    let param = {
      API_URL: conf.orderListByPhoneName,
      data: data,
      method: "POST"
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderList: res.data.data,
          meta: res.data.meta
        });

      } else {
        that.setData({
          orderList: [],
          meta: []
        });
      }
    });
  },
  //加载已送苗账单
  loadOrderSend: function () {
    let that = this;
    let param = {
      API_URL: conf.orderListState,
    };
    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderList: res.data.data,
          meta: res.data.meta
        });

      } else {
        that.setData({
          orderList: [],
          meta: []
        });
      }
    });
  },
  //加载已收款账单
  loadOrderPayment: function () {
    let that = this;
    let param = {
      API_URL: conf.orderListPayment,
    };

    newData.result(param).then(res => {
      if (res.data.status_code != 404) {
        that.setData({
          orderList: res.data.data,
          meta: res.data.meta
        });

      } else {
        that.setData({
          orderList: [],
          meta: []
        });
      }
    });
  },

  // onPageScroll: function (e) {
  //   console.log(e);//{scrollTop:99}
  // },

  //页面上拉触底事件的处理函数
  onReachBottom: function (e) {
    var that = this;
      // 页数+1
      let page = that.data.meta.current_page;
      console.log(page)

      if (page < that.data.meta.last_page) {
        // 显示加载图标
        // wx.showLoading({
        //   title: '加载中...',
        // })

        let data = {
          queryText: that.data.queryText,
          state: that.data.state
        }
        let param = {
          API_URL: that.data.meta.path + '?page=' + (page + 1),
          data: data,
          method: "POST"
        };
        newData.result(param).then(res => {
          let orderData = that.data.orderList.concat(res.data.data)
          that.setData({
            orderList: orderData,
            links: res.data.links,
            meta: res.data.meta,
          });
          if (res.data.meta.current_page == res.data.meta.last_page) {
            that.setData({
              is_all: true,
            });
          }
          // 隐藏加载框
          // wx.hideLoading();
        })
      }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var self = this;
    self.setData({
      is_all: false,
      queryText:''
    });
    self.loadOrderList()
    
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  //取消订单
  removeOrder: function (e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: function (res) {
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
  stateOrder: function (e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.state = '1';
    wx.showModal({
      title: '提示',
      content: '确定已送苗吗？',
      success: function (res) {
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
  editOrder: function (event) {
    let redirectUrl = '/pages/order/edit?id='+event.target.id
      wx.navigateTo({
        url: redirectUrl
      })
  },
  copyOrder: function (event) {
    let redirectUrl = '/pages/order/copy?id=' + event.target.id
    wx.navigateTo({
      url: redirectUrl
    })
  },
  noStateOrder: function (e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.state = '0';
    wx.showModal({
      title: '提示',
      content: '确定没送苗吗？',
      success: function (res) {
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
  paymentOrder: function (e) {
    let that = this;
    let data = {};
    data.id = e.target.id;
    data.payment = '1';
    wx.showModal({
      title: '提示',
      content: '确定已收到钱了吗？',
      success: function (res) {
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

  initSystemInfo: function () {
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  bindChange: function (e) {
    var that = this;
    let TabNumState = that.data.TabNumState
    let TabNumSend = that.data.TabNumSend
    let TabNumPayment = that.data.TabNumPayment
    if (that.data.TabNumState <= 9) {
      if (that.data.orderList.length == 0) {
        TabNumState = 9
      } else {
        TabNumState = that.data.orderList.length
      }
    }
    if (that.data.TabNumSend <= 9) {
      if (that.data.orderListOne.length == 0) {
        TabNumSend = 4
      } else {
        TabNumSend = that.data.orderListOne.length
      }
    }
    if (that.data.TabNumPayment <= 9) {
      if (that.data.orderListTwo.length == 0) {
        TabNumPayment = 4
      } else {
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
  swichNav: function (e) {
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
  makePhoneCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.target.id
    })
  },
  openlocation: function (event) {
    console.log(event)
    this.setData({
      locationArr: event.target.dataset,
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
  setlocation: function (e) {
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