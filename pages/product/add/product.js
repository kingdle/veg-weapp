import newData from '../../../utils/DataURL.js';
var conf = require('./../../../config');
// pages/product/add/product.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pics: [],
    rtImgUrl: [],
    pic: '',
    title: '',
    introduce: '',
    unitPrice: '',
    SortId: '',
    sorts: [],
    multiArray: [
      ['番茄类'],
      ['齐达利']
    ],
    multiIndex: [0, 0],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取prods列表
    let param = {
      API_URL: conf.wesortUrl,
      method: "GET"
    };
    newData.result(param).then(res => {
      let res_data = res.data
      let Sort = [];
      let SortID = [];
      let SortsID = [];
      let SortData = [];
      for (let i = 0; i < res_data.length; i++) {
        if (res_data[i].parent_id == 0) {
          Sort.push(res_data[i].name);
          SortID.push(res_data[i].id);
        }
      }
      for (let j = 0; j < res_data.length; j++) {

        if (SortID[0] === res_data[j].parent_id) {
          SortData.push(res_data[j].name);
          SortsID.push(res_data[j].id);
        }
      }

      let Sorts = new Set(Sort);
      this.setData({
        multiArray: [
          [...Sorts], SortData
        ],
        sorts: res_data,
        SortId: SortsID[0]
        //   productTitle: this.data.multiArray[1][0],
        //   productId: res_data[0]['id'],
        //   products: res_data
      })
      console.log(this.data.SortId)

    })
  },
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', this.data.multiIndex)
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
      let sorts = this.data.sorts
      let Sort = []
      let SortsId = ''
      let SortId = []
      for (let j = 0; j < sorts.length; j++) {
        if (sorts[j].name == this.data.multiArray[0][e.detail.value]) {
          SortsId = sorts[j].id;
        }
      }
      for (let i = 0; i < sorts.length; i++) {
        if (sorts[i].parent_id == SortsId) {
          Sort.push(sorts[i].name);
          SortId.push(sorts[i].id);
        }
      }
      data.multiArray[1] = Sort
      data.multiIndex[1] = 0
      data.SortId = SortId[0]
      console.log(data.SortId)
    }
    if (e.detail.column == '1') {
      let SortName = data.multiArray[1]
      let SortId = ''
      let SortTitle = data.multiArray[1][e.detail.value]
      for (let i = 0; i < this.data.sorts.length; i++) {
        if (SortTitle === this.data.sorts[i]['name']) {
          SortId = this.data.sorts[i].id;
        }
      }
      data.SortId = SortId
      console.log(SortId)
    }

    this.setData(data);
  },
  /**
   * 监听品种输入
   */
  listenerTitleInput: function(e) {
    this.setData({
      title: e.detail.value
    })

  },
  /**
   * 监听型号输入
   */
  listenerIntroduceInput: function(e) {
    this.setData({
      introduce: e.detail.value
    })

  },
  /**
   * 监听单价输入
   */
  listenerUnitPriceInput: function(e) {
    this.setData({
      unitPrice: e.detail.value
    })

  },
  chooseimage: function() { //这里是选取图片的方法
    var that = this,
      pics = this.data.pics;

    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res) {
        var imgsrc = res.tempFilePaths;
        that.uploadimg(imgsrc);

        pics = pics.concat(imgsrc);
        that.setData({
          pics: pics
        });
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })

  },
  uploadimg: function(pics) { //这里触发图片上传的方法
    // var pics = this.data.pics;
    let self = this;
    self.upimgs({
      path: pics //这里是选取的图片的地址数组
    });
  },
  //多张图片上传
  upimgs: function(dataPic) {
    wx.showLoading({
      title: '图片上传中...',
      icon: 'loading',
      mask: true
    })
    //测试usdata，应替换正式user和shopid
    var that = this,
      rtImgUrl = this.data.rtImgUrl,
      i = dataPic.i ? dataPic.i : 0, //当前上传的哪张图片
      success = dataPic.success ? dataPic.success : 0, //上传成功的个数
      fail = dataPic.fail ? dataPic.fail : 0; //上传失败的个数

    wx.uploadFile({
      url: conf.sortImageUrl,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      filePath: dataPic.path[i],
      name: 'file', //这里根据自己的实际情况改
      // formData: usData,//这里是上传图片时一起上传的数据
      success: (resp) => {
        success++; //图片上传成功，图片上传成功的变量+1
        var aa = JSON.parse(resp.data);
        rtImgUrl.push(aa.url);
        this.setData({
          pic: aa.photo
        });
      },
      fail: (res) => {
        fail++; //图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        i++; //这个图片执行完上传后，开始上传下一张
        if (i == dataPic.path.length) { //当图片传完时，停止调用
          // 隐藏加载框
          wx.hideLoading();
          console.log('执行完毕!成功：' + success + " 失败：" + fail);
        } else { //若图片还没有传完，则继续调用函数
          dataPic.i = i;
          dataPic.success = success;
          dataPic.fail = fail;
          that.upimgs(dataPic);
        }

      }
    })
  },
  // 删除图片
  deleteImg: function(e) {
    //一个是本地，一个是储存获取的返回值，两者是一致，所以可以根据index删掉
    var pics = this.data.pics;
    var rtImgUrl = this.data.rtImgUrl;
    var index = e.currentTarget.dataset.index;
    pics.splice(index, 1);
    rtImgUrl.splice(index, 1);

    this.setData({
      pics: pics,
      rtImgUrl: rtImgUrl
    });
  },
  addProduct: function () {
    if (this.data.title == '') {
      wx.showToast({
        title: "请填写品种",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }

    if (this.data.unitPrice == '') {
      wx.showToast({
        title: "请填写单价",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    if (this.data.pic == '') {
      wx.showToast({
        title: "请上传品种图",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    
    let data = {};
    
    data.sort_id = this.data.SortId
    data.title = this.data.title
    data.introduce = this.data.introduce
    data.unit_price = this.data.unitPrice
    data.pic = this.data.pic

    let param = {
      API_URL: conf.createProductUrl,
      data: data,
      method: "POST"
    };
    newData.result(param).then(res => {
      if (res.data.status_code != '200') {
        wx.showToast({
          title: res.data.message,
          image: '/images/use/tip.png',
          duration: 2000
        });
        return false;
      }
      wx.navigateBack()
      //更新上页
      var pages = getCurrentPages();
      if (pages.length > 1) {
        //上一个页面实例对象
        var prePage = pages[pages.length - 2];
        //关键在这里
        prePage.setData({
        })
        prePage.onLoad();
      }
      // wx.redirectTo({ url: './../../order/add/order' })
      this.setData({
        title: '',
        unitPrice: ''
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})