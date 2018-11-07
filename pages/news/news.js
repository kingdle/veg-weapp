import newData from '../../utils/DataURL.js';
var conf = require('../../config');
var app = getApp();

Page({
  data: {
    array: ['请选择育苗种类', '茄果类', '豆类', '叶菜类', '瓜类', '根茎类', '葱蒜类', '其他'],
    index: 0,
    pics: [],
    rtImgUrl: [],
    content: '',
    cno: 0,

    vegs: [],
    vlength: 5,
    pageBackgroundColor: 'rgba(0, 0, 0, .4)',
    vegKinds: [],
    vKind: "",
    vegTypes: [],
    vType: [],
    progress: '0',
    imgSuccess: '1',
    uploadResults: '0',
    condition: false,
    warn: false
  },
  onLoad: function (options) {
    //检查页面层级       
    let self = this;
    self.getSort();
    
  },

  getSort: function (e) {
    let val = 0;
    let sec = 0;
    if (e != undefined) {
      val = e.detail.value[0];
      sec = e.detail.value[1];
    }

    const vegKinds = [];
    const vegTypes = [];

    let that = this;
    let param = {
      API_URL: conf.sortUrl,
    };

    newData.result(param).then(res => {
      let dd = res.data;
      for (let i = 0; i < dd.length; i++) {
        vegKinds.push(dd[i].name);
      }
      that.setData({
        'vegKinds': vegKinds,
        'vKind': vegKinds[val]
      })

      //默认项
      let pp = {
        API_URL: conf.sortUrl + dd[val].id,
      }
      newData.result(pp).then(res => {
        let mm = res.data;
        let vegs = that.data.vegs;

        for (let j = 0; j < mm.length; j++) {
          let cc = {};
          cc.id = mm[j].id;
          cc.name = mm[j].name;
          cc.icon = mm[j].icon;
          cc.checked = false;

          vegs.forEach(function (vv) {
            if (vv.name == mm[j].name) {
              cc.checked = true;
            }
          });
          vegTypes.push(cc);
        }

        //还没改造
        that.setData({
          'vegTypes': vegTypes,
          'vType': vegTypes[sec],
          sec: sec,
        })
      })
    });
  },

  open: function () {
    this.setData({
      condition: !this.data.condition,
      pageBackgroundColor: '#f8f8f848',
    })
  },

  checkboxChange: function (e) {
    let self = this;
    let tp = e.detail.value;
    let vegs = self.data.vegs;
    let cts = self.data.vegTypes;
    let vlength = self.data.vlength;

    if (tp.length > 0) {
      let rt = {};
      rt.id = tp[0];
      cts.forEach(function (cc) {
        if (cc.id == tp[0]) {
          if (vegs.length < vlength) {
            rt.name = cc.name;
            vegs.push(rt);
            self.setData({
              vegs: vegs
            })
          }
          else {
            self.setData({
              warn: true
            });
            self.open();
          }

        }
      });
    } else if (tp.length == 0) {
      let cc = self.data.vType;
      let flag = 0;
      vegs.forEach(function (ct) {
        if (ct.id == cc.id) {
          vegs.splice(flag, 1);
          return
        } else {
          flag++;
        }
      });
      self.setData({
        vegs: vegs
      })
    }
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  chooseimage: function () {//这里是选取图片的方法
    var that = this,
      pics = this.data.pics;

    wx.chooseImage({
      count: 9 - pics.length, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        var imgsrc = res.tempFilePaths;
        that.uploadimg(imgsrc);
        pics = pics.concat(imgsrc);
        that.setData({
          pics: pics
        });
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },
  uploadimg: function (pics) {//这里触发图片上传的方法
    // var pics = this.data.pics;
    let self = this;
    self.upimgs({
      path: pics//这里是选取的图片的地址数组
    });
  },
  //多张图片上传
  upimgs: function (dataPic) {
    // wx.showLoading({
    //   title: '图片上传中...',
    //   icon: 'loading',
    //   mask: true
    // })
    //测试usdata，应替换正式user和shopid
    var that = this,
      rtImgUrl = this.data.rtImgUrl,
      i = dataPic.i ? dataPic.i : 0,//当前上传的哪张图片
      success = dataPic.success ? dataPic.success : 0,//上传成功的个数
      fail = dataPic.fail ? dataPic.fail : 0;//上传失败的个数

    const uploadTask = wx.uploadFile({
      url: conf.photoUrl,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('access_token')
      },
      filePath: dataPic.path[i],
      name: 'file',//这里根据自己的实际情况改
      // formData: usData,//这里是上传图片时一起上传的数据
      success: (resp) => {
        success++;//图片上传成功，图片上传成功的变量+1
        var aa = JSON.parse(resp.data);
        rtImgUrl.push(aa.url);
        this.setData({
          progress: '0'
        });
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        i++;//这个图片执行完上传后，开始上传下一张
        if (i == dataPic.path.length) {   //当图片传完时，停止调用
          // 隐藏加载框
          wx.hideLoading();
          console.log('执行完毕!成功：' + success + " 失败：" + fail);
          this.setData({
            uploadResults: success
          })
        } else {//若图片还没有传完，则继续调用函数
          dataPic.i = i;
          dataPic.success = success;
          dataPic.fail = fail;
          that.upimgs(dataPic);
          this.setData({
            imgSuccess: i+1
          });
        }

      }
    })
    uploadTask.onProgressUpdate((res) => {
      this.setData({
        progress: res.progress
      });
    })
  },
  // 删除图片
  deleteImg: function (e) {
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
  // 获取输入框的内容，这个是最保险的，并且可以计算字数
  bindKeyInput: function (e) {
    let val = e.detail.value;
    let cno = e.length;

    this.setData({
      content: val,
      cno: val.length
    })
  },
  formSubmit: function () {
    let that = this;
    let rt = [];
    let vs = that.data.vegs;
    vs.forEach(function (vv) {
      rt.push(vv.id);
    }, this);

    let cont = that.data.content;
    let cno = that.data.cno;
    let img = that.data.rtImgUrl;
    if (cno == 0 && img.length == 0) {
      wx.showToast({
        title: "动态或图片不能全为空！",
        image: '/images/use/tip.png',
        duration: 2000
      })
      return;
    }
    // if (vs.length == 0) {
    //   wx.showToast({
    //     title: "类别不能为空",
    //     image: '/images/use/tip.png',
    //     duration: 2000
    //   })
    //   return;
    // }
    let data = {};
    data.dynamicContent = cont;
    data.imageUrl = img;
    data.sorts = rt;

    let param = {
      API_URL: conf.dynAddUrl,
      data: data,
      method: "POST"
    };

    newData.result(param).then(res => {
      wx.showToast({
        title: '成功',
        duration: 1000,
        success() {
          wx.switchTab({
            url: '../index/index'
          })
          //更新上页
          var pages = getCurrentPages();
          if (pages.length > 1) {
            //上一个页面实例对象
            var prePage = pages[pages.length - 2];
            //关键在这里
            prePage.setData({
              newsList: [],
              nextPage: 0,
            })
            prePage.onLoad();
          }
        }
      });
    })
  }
})