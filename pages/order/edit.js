import newData from '../../utils/DataURL.js';
var conf = require('./../../config');
var app = getApp();
var maps = ['52YBZ-SNZ6X-TCO4C-7KBUO-IXAI5-CIFVP', 'CQTBZ-G7G6S-PK2OI-6RTUX-7WVRK-K6BOB',
  'MHTBZ-BHOKW-T43RD-RSR2R-L2NJT-UDFIB',
  'OF7BZ-HRBC6-SRGS4-MVBTO-MR2KS-ZFBMI',
  '4BIBZ-J3FW6-NHHSL-EAZH3-L5FOJ-XVBWZ'
];
var mapi = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    farmerData: {
      name: '',
      address: '',
      phone: '',
      provinceName: '',
      cityName: '',
      countyName: '',
      townName: '',
      detailInfo: '',
      villageInfo: '',
      latitude: '',
      longitude: '',
    },
    seedlingData: {
      prod_id: '',
      start_at: '',
      start_time: '',
      end_at: '',
      end_time: '',
      counts: '0',
      unit_price: '0',
      total_price: '0',
      fee_earnest: '0',
      fee_earnest_at: '',
      fee_actual: '0'
    },
    note_sell: '',
    startWeekDay: '',
    endWeekDay: '',



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
    listId: '',
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
  onLoad: function (options) {
    //初始化内容
    let order = {
      API_URL: conf.orderUrl + options.id,
      method: "GET"
    };
    newData.result(order).then(res => {
      console.log(res.data)
      this.setData({
        id: res.data.id,
        'farmerData.name': res.data.name,
        'farmerData.address': res.data.address,
        'farmerData.phone': res.data.phone,
        'farmerData.provinceName': res.data.provinceName,
        'farmerData.cityName': res.data.cityName,
        'farmerData.countyName': res.data.countyName,
        'farmerData.townName': res.data.townName,
        'farmerData.detailInfo': res.data.detailInfo,
        'farmerData.villageInfo': res.data.villageInfo,
        'farmerData.latitude': res.data.latitude,
        'farmerData.longitude': res.data.longitude,
        'seedlingData.prod_id': res.data.prod_id,
        'seedlingData.start_at': res.data.start_at,
        'seedlingData.start_time': res.data.start_time,
        'seedlingData.end_at': res.data.end_at,
        'seedlingData.end_time': res.data.end_time,
        'seedlingData.counts': res.data.counts,
        'seedlingData.unit_price': res.data.unit_price,
        'seedlingData.total_price': res.data.total_price,
        'seedlingData.fee_earnest': res.data.fee_earnest,
        'seedlingData.fee_earnest_at': res.data.fee_earnest_at,
        'seedlingData.fee_actual': res.data.fee_actual,


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
  
  /**
   * 监听数量输入
   */
  listenerCountsInput: function (e) {
    this.data.Counts = e.detail.value;
    let countsNum = this.data.Counts * this.data.UnitPrice
    this.setData({
      totalPrice: ' 总价：' + countsNum.toFixed(2) + '元'
    })

  },

  /**
   * 监听单价输入
   */
  listenerUnitPriceInput: function (e) {
    this.data.UnitPrice = e.detail.value;
    let unitNum = this.data.Counts * this.data.UnitPrice
    this.setData({
      totalPrice: ' 总价：' + unitNum.toFixed(2) + '元'
    })
  },
  /**
   * 监听备注输入
   */
  listenerNoteSellInput: function (e) {
    this.setData({
      note_sell: e.detail.value
    })
  },
  bindstartDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  bindendDateChange: function (e) {
    var weekday = e.detail.value;
    this.setData({
      endDate: e.detail.value,
      weekDay: ("周" + "日一二三四五六 ".charAt(new Date(weekday).getDay()))
    })
  },
  bindTagsChange: function (e) {
    this.setData({
      tagsIndex: e.detail.value,
      tagName: e.detail.value
    })
  },

  
  

  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
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
      fail: function (err) {
        console.log(err)
      }
    });
  },
  addPhoneUser: function () {
    var that = this;
    wx.chooseAddress({
      success: function (res) {

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
  /**
   * 监听姓名输入
   */
  listenerNameInput: function (e) {
    this.setData({
      'farmerData.name': e.detail.value
    })
  },
  /**
   * 监听手机输入
   */
  listenerPhoneInput: function (e) {
    this.setData({
      'farmerData.phone': e.detail.value
    })
    console.log(this.data.farmerData.phone)
  },
  //选择位置
  setLocation: function (e) {
    let that = this
    wx.chooseLocation({
      success: function (res) {
        that.doLocal(res);
      }
    });
  },
  doLocal: function (res) {
    var that = this;
    var latitude = res.latitude
    var longitude = res.longitude
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=' + maps[mapi],
      header: {
        'Content-Type': 'ication/json'
      },
      success: function (res) {
        if (res.data.status == 121) {
          mapi++;
          that.data.globalData.mapKey = maps[mapi + 1];
          that.doLocal(latitude, longitude);
        }
        that.setData({
          'farmerData.address': res.data.result.address,
          'farmerData.provinceName': res.data.result.address_component.province,
          'farmerData.cityName': res.data.result.address_component.city,
          'farmerData.countyName': res.data.result.address_component.district,
          'farmerData.townName': res.data.result.address_reference.town.title,
          'farmerData.villageInfo': res.data.result.address_reference.landmark_l2.title,
          'farmerData.latitude': res.data.result.location.lat,
          'farmerData.longitude': res.data.result.location.lng,
          'farmerData.detailInfo': res.data.result.address_reference.landmark_l2._dir_desc,
        })
        console.log(that.data.farmerData)
      },
      fail: function () {
        wx.showToast({
          title: "获取位置失败",
          image: '/images/use/tip.png',
          duration: 2000
        })
        return;
      },
    })
  },
  // 选择品种
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
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
      data.listId = '1'
      this.setData({
        'seedlingData.prod_id': productIds[0]
      });
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
      this.setData({
        'seedlingData.prod_id': productId[0]
      });
    }
    this.setData(data);
  },
  //监听数量输入
  listenerCountsInput: function (e) {
    let fee_actual = e.detail.value * this.data.seedlingData.unit_price - this.data.seedlingData.fee_earnest
    let fee_earnest = this.data.seedlingData.fee_earnest
    this.setData({
      'seedlingData.counts': e.detail.value,
      'seedlingData.fee_actual': fee_actual.toFixed(2),
      'seedlingData.total_price': (Number(fee_earnest) + Number(fee_actual))
    })
  },

  /**
   * 监听单价输入
   */
  listenerUnitPriceInput: function (e) {
    let fee_actual = e.detail.value * this.data.seedlingData.counts - this.data.seedlingData.fee_earnest
    let fee_earnest = this.data.seedlingData.fee_earnest
    this.setData({
      'seedlingData.unit_price': e.detail.value,
      'seedlingData.fee_actual': fee_actual.toFixed(2),
      'seedlingData.total_price': (Number(fee_earnest) + Number(fee_actual))
    })
  },
  /**
   * 监听订金输入
   */
  listenerFeeEarnestInput: function (e) {
    let fee_actual = (this.data.seedlingData.unit_price * this.data.seedlingData.counts - e.detail.value)
    let fee_earnest = this.data.seedlingData.fee_earnest
    this.setData({
      'seedlingData.fee_earnest': e.detail.value,
      'seedlingData.fee_actual': fee_actual.toFixed(2),
    })
  },
  /**
   * 监听总价输入
   */
  listenerFeeActualInput: function (e) {
    let fee_actual = (this.data.seedlingData.unit_price * this.data.seedlingData.counts - this.data.seedlingData.fee_earnest)
    let fee_earnest = this.data.seedlingData.fee_earnest
    this.setData({
      'seedlingData.fee_actual': e.detail.value,
    })
  },
  /**
   * 监听备注输入
   */
  listenerNoteSellInput: function (e) {
    this.setData({
      note_sell: e.detail.value
    })
  },
  bindStartDateChange: function (e) {
    let weekday = e.detail.value;
    this.setData({
      'seedlingData.start_at': e.detail.value,
      startWeekDay: ("周" + "日一二三四五六 ".charAt(new Date(weekday).getDay()))
    })
  },
  bindStartTimeChange: function (e) {
    this.setData({
      'seedlingData.start_time': e.detail.value
    })
  },
  bindEndDateChange: function (e) {
    let weekday = e.detail.value;
    this.setData({
      'seedlingData.end_at': weekday,
      endWeekDay: ("周" + "日一二三四五六 ".charAt(new Date(weekday).getDay()))
    })
  },
  bindEndTimeChange: function (e) {
    this.setData({
      'seedlingData.end_time': e.detail.value
    })
  },
  updateOrder: function () {
    if (this.data.farmerData.name == '') {
      wx.showToast({
        title: "姓名不能为空",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.seedlingData.counts == 0) {
      wx.showToast({
        title: "请填写数量",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }

    let data = {
      id:this.data.id,
      name: this.data.farmerData.name,
      address: this.data.farmerData.address,
      phone: this.data.farmerData.phone,
      provinceName: this.data.farmerData.provinceName,
      cityName: this.data.farmerData.cityName,
      countyName: this.data.farmerData.countyName,
      townName: this.data.farmerData.townName,
      detailInfo: this.data.farmerData.detailInfo,
      villageInfo: this.data.farmerData.villageInfo,
      latitude: this.data.farmerData.latitude,
      longitude: this.data.farmerData.longitude,
      prod_id: this.data.seedlingData.prod_id,
      start_at: this.data.seedlingData.start_at + ' ' + this.data.seedlingData.start_time,
      end_at: this.data.seedlingData.end_at + ' ' + this.data.seedlingData.end_time,
      counts: this.data.seedlingData.counts,
      unit_price: this.data.seedlingData.unit_price,
      total_price: this.data.seedlingData.total_price,
      fee_earnest: this.data.seedlingData.fee_earnest,
      fee_actual: this.data.seedlingData.fee_actual,
      note_sell: this.data.note_sell,
    };

    let param = {
      API_URL: conf.shopOrderUpdate,
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