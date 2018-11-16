import newData from '../../../utils/DataURL.js';
var conf = require('./../../../config');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    TotalPrice: '',
    Counts: '0',
    UnitPrice: '0',
    startDate: '2018-07-01',
    endDate: '2018-08-10',
    weekDay: '',
    multiArray: [
      ['茄果类', '豆类'],
      ['西红柿', '茄子']
    ],
    multiIndex: [0, 0],
    products: [],
    productD: [],
    productIds: [],
    listId:'',
    productId: '',
    productTitle: '',
    focus: false,
    mobileLocation: { //移动选择位置数据
      address: '',
      name: '',
      longitude: '',
      latitude: '',
      sellerLongitude: '',
      sellerLatitude: '',
      is_true_location: '0'
    },
    user: {
      userName: '',
      phoneNumber: '',
      address: '',
      provinceName: '山东省',
      cityName: '寿光市',
      countyName: '稻田镇',
      detailInfo: '北慈村'
    },
    note_sell: ''
  },
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', this.data.productTitle)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function(e) {
    console.log('列', e.detail.column, '，值', e.detail.value);
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex,
    };
    data.multiIndex[e.detail.column] = e.detail.value;

    if (e.detail.column == '0') {
      let products = this.data.products
      let productD = []
      let productIds = []
      let productId = ''
      for (let j = 0; j < products.length; j++) {
        if (this.data.multiArray[0][e.detail.value] === products[j]['sort']) {
          productD.push(products[j]['title']);
          productIds.push(products[j]['id']);
        }
      }
      data.multiArray[1] = productD
      data.multiIndex[1] = 0
      data.productId = productIds[0]
      data.listId='1'
    }
    data.productTitle = data.multiArray[1][data.multiIndex[1]]
    if (e.detail.column == '1') {
      let productId = []
      for (let j = 0; j < this.data.products.length; j++) {
        if (data.productTitle === this.data.products[j]['title']) {
          productId.push(this.data.products[j]['id']);
        }
      }
      data.productId = productId[0]
      data.listId = '1'
    }

    this.setData(data);
  },
  /**
   * 监听数量输入
   */
  listenerCountsInput: function(e) {
    this.data.Counts = e.detail.value;
    let countsNum = this.data.Counts * this.data.UnitPrice
    this.setData({
      totalPrice: ' 总价：' + countsNum.toFixed(2) + '元'
    })

  },

  /**
   * 监听单价输入
   */
  listenerUnitPriceInput: function(e) {
    this.data.UnitPrice = e.detail.value;
    let unitNum = this.data.Counts * this.data.UnitPrice
    this.setData({
      totalPrice: ' 总价：' + unitNum.toFixed(2) + '元'
    })
  },
  /**
   * 监听备注输入
   */
  listenerNoteSellInput: function(e) {
    this.setData({
      note_sell: e.detail.value
    })
  },
  bindstartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  bindendDateChange: function(e) {
    var weekday = e.detail.value;
    this.setData({
      endDate: e.detail.value,
      weekDay: ("周" + "日一二三四五六 ".charAt(new Date(weekday).getDay()))
    })
  },
  bindTagsChange: function(e) {
    this.setData({
      tagsIndex: e.detail.value,
      tagName: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //初始化内容
    let order = {
      API_URL: conf.orderUrl + options.id,
      method: "GET"
    };
    newData.result(order).then(res => {
      console.log(res.data)
      this.setData({
        orderId: options.id,
        endDate: res.data.end_at,
        Counts: res.data.counts,
        UnitPrice: res.data.unit_price,
        user: {
          userName: res.data.name,
          phoneNumber: res.data.phone,
          address: res.data.address,
          provinceName: res.data.provinceName,
          cityName: res.data.cityName,
          countyName: res.data.countyName,
          villagInfo: res.data.villageInfo,
          detailInfo: res.data.detailInfo
        },
        productId: res.data.prod_id,
        sort: res.data.sort,
        prod: res.data.prod,
        note_sell: res.data.note_sell
      })
    })
    //获取prods列表
    let param = {
      API_URL: conf.ProductUrl,
      method: "GET"
    };
    newData.result(param).then(res => {
      let res_data = res.data
      
      let Sort = [];
      let SortData = [];

      for (let i = 0; i < res_data.length; i++) {
        Sort.push(res_data[i].sort);
        if (res_data[0].sort_id == res_data[i].sort_id) {
          SortData.push(res_data[i].title);
        }
      }
      let Sorts = new Set(Sort);
      this.setData({
        multiArray: [
          [...Sorts], SortData
        ],
        productTitle: this.data.multiArray[1][0],
        products: res_data
      })
    })

  },
  
  moveToLocation: function() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        let mobileLocation = {
          address: res.address,
          name: res.name,
          longitude: res.longitude,
          latitude: res.latitude,
        };
        that.setData({
          mobileLocation: mobileLocation,
        });
      },
      fail: function(err) {
        console.log(err)
      }
    });
  },
  addPhoneUser: function() {
    var that = this;
    wx.chooseAddress({
      success: function(res) {

        let user = {
          userName: res.userName,
          phoneNumber: res.telNumber,
          address: res.provinceName + res.cityName + res.countyName + res.detailInfo,
          provinceName: res.provinceName,
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo
        }
        // let mobileLocation = {
        //   address:'',
        //   sellerLongitude: wx.getStorageSync('location').location.lng,
        //   sellerLatitude: wx.getStorageSync('location').location.lat,
        // };
        that.setData({
          // mobileLocation: mobileLocation,
          user: user
        });
      }
    })
    // wx.getPhoneContact({
    //   success: function (res) {
    //     let user={
    //       name: res.firstName,
    //       phoneNumber: res.mobilePhoneNumber
    //     }
    //     that.setData({
    //       user: user,
    //     });
    //   },
    //   fail: function (err) {
    //     console.log(err)
    //   }
    // })
  },
  updateOrder: function() {
    if (this.data.Counts == 0) {
      wx.showToast({
        title: "请填写数量",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }

    if (this.data.UnitPrice == 0) {
      wx.showToast({
        title: "请填写单价",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.user.userName == '') {
      wx.showToast({
        title: "姓名不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.user.phoneNumber == '') {
      wx.showToast({
        title: "手机不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    let data = {};
    if (this.data.mobileLocation.latitude == '' || this.data.mobileLocation.longitude == '') {
      let mobileLocation = {
        address: '',
        longitude: wx.getStorageSync('location').location.lng,
        latitude: wx.getStorageSync('location').location.lat,
        is_true_location: '1'
      };
      this.setData({
        mobileLocation: mobileLocation,
      });
    }
    data.id = this.data.orderId
    data.name = this.data.user.userName
    data.phone = this.data.user.phoneNumber
    data.prod_id = this.data.productId
    data.counts = this.data.Counts
    data.unit_price = this.data.UnitPrice
    data.end_at = this.data.endDate
    data.provinceName = this.data.user.provinceName
    data.cityName = this.data.user.cityName
    data.countyName = this.data.user.countyName
    data.detailInfo = this.data.user.detailInfo
    data.longitude = wx.getStorageSync('location').location.lng
    data.latitude = wx.getStorageSync('location').location.lat
    data.note_sell = this.data.note_sell
    data.is_true_location = this.data.mobileLocation.is_true_location
    console.log(data)
    let param = {
      API_URL: conf.sellerOrderUpdate,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code == 200) {
        wx.showToast({
          title: '编辑成功',
          duration: 500,
          success() {
            wx.navigateBack()
            //更新上页
            var pages = getCurrentPages();
            if (pages.length > 1) {
              //上一个页面实例对象
              var prePage = pages[pages.length - 2];
              //关键在这里
              prePage.setData({
                orderList: [],
                nextPage: 0,
              })
              prePage.onLoad();
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})