import getData from '../../../utils/DataURL.js';
var conf = require('./../../../config');
var app = getApp();
var maps = ['52YBZ-SNZ6X-TCO4C-7KBUO-IXAI5-CIFVP', 'CQTBZ-G7G6S-PK2OI-6RTUX-7WVRK-K6BOB',
  'MHTBZ-BHOKW-T43RD-RSR2R-L2NJT-UDFIB',
  'OF7BZ-HRBC6-SRGS4-MVBTO-MR2KS-ZFBMI',
  '4BIBZ-J3FW6-NHHSL-EAZH3-L5FOJ-XVBWZ'
];
var mapi = 0;
function getNowTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  if (month < 10) {
    month = '0' + month;
  };
  if (day < 10) {
    day = '0' + day;
  };
  //  如果需要时分秒，就放开
  // var h = now.getHours();
  // var m = now.getMinutes();
  // var s = now.getSeconds();
  var formatDate = year + '-' + month + '-' + day;
  return formatDate;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    farmerData:{
      name:'',
      address:'',
      phone:'',
      provinceName:'',
      cityName:'',
      countyName: '',
      townName: '',
      detailInfo:'',
      villageInfo:'',
      latitude:'',
      longitude:'',
    },
    seedlingData:{
      prod_id:'',
      start_at: getNowTime(),
      start_time: '08:01',
      end_at: getNowTime(),
      end_time: '08:01',
      counts:'0',
      unit_price: '0',
      total_price: '0',
      fee_earnest: '0',
      fee_earnest_at: getNowTime(),
      fee_actual: '0'
    },
    note_sell: '',
    startWeekDay: '',
    endWeekDay: '',


    TotalPrice: '',
    Counts: '0',
    UnitPrice: '0',
    multiArray: [
      ['茄果类', '豆类'],
      ['西红柿', '茄子']
    ],
    multiIndex: [0, 0],
    products: [],
    productD: [],
    productIds: [],
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
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取40天以后的endDate日期
    var myDate = new Date();
    myDate.setDate(myDate.getDate() + 40);
    var smonth = myDate.getMonth() + 1;
    var sdate = myDate.getDate();
    if (smonth < 10) {
      smonth = "0" + smonth;
    }
    if (sdate < 10) {
      sdate = "0" + sdate;
    }
    var endD = myDate.getFullYear() + '-' + smonth + '-' + sdate
    this.setData({
      endDate: endD,
    })
    //获取prods列表
    let param = {
      API_URL: conf.ProductUrl,
      method: "GET"
    };
    getData.result(param).then(res => {
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
        productId: res_data[0]['id'],
        'seedlingData.prod_id': res_data[0]['id'],
        products: res_data
      })
      console.log(this.data.seedlingData.prod_id)
    })

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
    let that=this
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
  //选择品种
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
      console.log(productIds[0])
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
      console.log(productId[0])
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
  bindTagsChange: function (e) {
    this.setData({
      tagsIndex: e.detail.value,
      tagName: e.detail.value
    })
    console.log(this.data.tagsIndex)
  },


  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
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
  selectUser: function () {
    var that = this;
    wx.chooseAddress({
      success: function (res) {
        
        let user = {
          name: res.userName,
          phone: res.telNumber,
          address: res.provinceName + res.cityName + res.countyName + res.detailInfo,
          provinceName: res.provinceName,
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo
        }
        that.setData({
          farmerData: user
        });
      }
    })
  },
  addOrder: function () {
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
      fee_earnest_at: getNowTime(),
      fee_actual: this.data.seedlingData.fee_actual,
      note_sell: this.data.note_sell,
    };
    
    let param = {
      API_URL: conf.shopStore,
      data: data,
      method: "POST"
    };
    getData.result(param).then(res => {
      console.log(res)

      // wx.navigateTo({
      //   url: '../order'
      // })
      wx.redirectTo({ url: '../order' })
      this.setData({
        Counts: '0',
        UnitPrice: '0'
      });
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
})