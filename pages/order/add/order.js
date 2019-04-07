import getData from '../../../utils/DataURL.js';
var conf = require('./../../../config');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    TotalPrice: '',
    Counts: '0',
    UnitPrice: '0',
    startDate: '2018-07-01',
    endDate: '2018-08-10',
    weekDay:'',
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
      is_true_location:'0'
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
    note_sell:''
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
        products: res_data
      })
      console.log(this.data.productId)
    })

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
      console.log(productIds[0])
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
  listenerNoteSellInput: function (e) {
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
    console.log(this.data.tagsIndex)
  },

  
  moveToLocation: function() {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
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
      fail: function(err) {
        console.log(err)
      }
    });
  },
  addPhoneUser: function() {
    var that = this;
    wx.chooseAddress({
      success: function(res) {
        // console.log(res.userName)
        // console.log(res.postalCode)
        // console.log(res.provinceName)
        // console.log(res.cityName)
        // console.log(res.countyName)
        // console.log(res.detailInfo)
        // console.log(res.nationalCode)
        // console.log(res.telNumber)
        // console.log(app.globalData.locationInfo)
        let user = {
          userName: res.userName,
          phoneNumber: res.telNumber,
          address: res.provinceName + res.cityName + res.countyName + res.detailInfo,
          provinceName: res.provinceName,
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo
        }
        // console.log(app.globalData.locationInfo.location.lng)
        // let mobileLocation = {
        //   address:'',
        //   sellerLongitude: app.globalData.locationInfo.location.lng,
        //   sellerLatitude: app.globalData.locationInfo.location.lat,
        // };
        that.setData({
          // mobileLocation: mobileLocation,
          user: user
        });
      }
    })
    // wx.getPhoneContact({
    //   success: function (res) {
    //     console.log(res)
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
  addOrder: function() {
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
    if (this.data.mobileLocation.latitude == '' || this.data.mobileLocation.longitude == ''){
      let mobileLocation = {
        address: '',
        longitude: wx.getStorageSync('location').latitude,
        latitude: wx.getStorageSync('location').longitude,
        is_true_location:'1'
      };
      this.setData({
        mobileLocation: mobileLocation,
      });
    }
    
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

    data.address = this.data.user.provinceName + this.data.user.cityName + this.data.user.countyName + ',' + this.data.user.detailInfo + ',' + this.data.user.cityName + ',' + this.data.mobileLocation.latitude + ',' + this.data.mobileLocation.longitude
    data.note_sell = this.data.note_sell
    data.is_true_location = this.data.mobileLocation.is_true_location
    console.log(data)
    let param = {
      API_URL: conf.sellerStore,
      data: data,
      method: "POST"
    };
    getData.result(param).then(res => {
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
})