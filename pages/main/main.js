const type = 1
Page({

  data: {
    onLoad: true,
    listArr: [],
    latitude: '',
    longitude: '',
    openId: "",
    is_auth: false,
    is_regist: false
  },
  onLoad: function (options) {
    // wx.showLoading({
    //   title: '加载中...',
    // })

    this.get_is_auth()
    //获得openid之后判断是否登录过
    this.getloc()

  },
  //   onShow(){
  //     //调用函数、方法
  //     var that=this;
  //     that.onLoad();
  // },
  //获取位置
  getloc: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res);
        var latitude = res.latitude
        var longitude = res.longitude
        that.setData({
          latitude: latitude,
          longitude: longitude
        })
        that.getRequest()
      },
      fail: function (res) {
        console.log(res);
      }
    })

  },
  //获取openid
  get_is_auth: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'get_openId',
      complete: res => {
        console.log('云函数获取到的openid:')
        console.log(res.result)
        var openid = res.result.openId;
        if (openid != "") {

          that.setData({
            openId: openid,
            is_auth: true
          })
          console.log("已授权");
          that.isLogin(openid)
        } else {
          console.log("未授权");
          that.setData({
            openId: "",
            is_auth: false
          })
          that.get_is_auth()
        }
      }
    });

  },

  // 网络请求核心函数
  getRequest: function () {

    var that = this;
    var newsListArr = [];
    wx.request({

      url: 'https://www.hzsmartnet.com/bikeshed/closebs?longitude=' + that.data.longitude + '&latitude=' + that.data.latitude + '&number=-1',
      method: "GET",
      success: function (res) {
        // console.log("首页——获取的附近车棚数据")
        console.log(res)
        for (var i = 0; i < res.data.data.length; i++) {
          var tempd = parseFloat(res.data.data[i].distance).toFixed(0);

          if (tempd < 1000) {
            res.data.data[i].distance = String(tempd) + "m"
          } else {
            res.data.data[i].distance = String((tempd / 1000).toFixed(2)) + "km"
          }

          if (i == res.data.data.length - 1)
            that.setData({
              onLoad: false
            })
        }
        var templist = []
        for (var i = 0; i < res.data.data.length; i++) {
          if (res.data.data[i].type == type) {
            templist.push(res.data.data[i])
          }
        }
        // console.log("首页——获取的附近车棚数据>>>>>>>处理后数据")
        // console.log(templist)
        if (templist.length > 2) {
          newsListArr.push(templist[0]);
          newsListArr.push(templist[1]);
        } else
          newsListArr.push(templist[0])

        if (!res.data.length) {
          that.setData({
            onLoad: false
          })
        }
        that.setData({
          listArr: newsListArr,
        })
        // console.log("展示车棚信息")
        // console.log(newsListArr)
        // wx.hideLoading()
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  //扫码 跳转
  getScancode: function () {
    // this.get_openid()
    var that = this
    var can_use = this.data.is_regist
    if (can_use)
      wx.scanCode({
        success: (res) => {
          var scan_data = res.result;
          var scan_data_json = JSON.parse(scan_data)
          //二维码内容
          var send_scan_data = {
            bsID: scan_data_json.bsID,
            chargeID: scan_data_json.chargeID,
            grp: scan_data_json.grp,
            chargePort: scan_data_json.chargePort,
            topic: scan_data_json.topic,
            openId: that.data.openId
          }
          var str = JSON.stringify(send_scan_data);
          console.log("二维码数据")
          console.log(send_scan_data)
          //跳转
          wx.navigateTo({
            url: '/pages/pay/pay?data=' + str,
          })
        }
      })
    else {
      wx.showModal({
        title: '提示',
        content: '此功能需要授权登录！',
        success(res) {
          if (res.confirm) {

            that.bindGetUserInfo()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },


  isLogin: function (temp_openid) {
    var that = this
    var temp_send_data = {
      openId: temp_openid
    };
    console.log("判断是否注册： ");
    console.log(temp_send_data);
    wx.request({
      url: 'https://www.hzsmartnet.com/login/open',
      method: "POST",
      data: temp_send_data,
      // 解析注册状态
      success: (res) => {
        console.log(res.data)
        var status = res.data.status
        if (status == -1) {
          that.setData({
            is_regist: false
          })
          console.log("未注册")
          // 登录
          // wx.reLaunch({
          //   url: '/pages/login/login',
          // })
        } else if (status == 0) {
          that.setData({
            is_regist: true
          })
          console.log("已注册")
        }
      }
    })
  },
  bindGetUserInfo: function () {
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
  is_near_canuse: function () {
    var can_use = this.data.is_regist
    if (!can_use)
      wx.showModal({
        title: '提示',
        content: '此功能需要授权登录！',
        success(res) {
          if (res.confirm) {
            // 登录
            wx.reLaunch({
              url: '/pages/login/login',
            })
          } else if (res.cancel) {
            // 登录
            wx.reLaunch({
              url: '/pages/main/main',
            })
          }
        }
      })

  },

})