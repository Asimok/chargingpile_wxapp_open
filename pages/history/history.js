const comm = require("../../utils/comm.js")

Page({
  data: {
    onLoad: true,
    listArr: [],
    open_id: "",
  },
  onLoad: function (options) {

    wx.showLoading({
      title: '加载中...',
    })
    this.get_openid()
  },
  //   onShow(){
  //     //调用函数、方法
  //     var that=this;
  //     that.onLoad();
  // },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
       //在当前页面显示导航条加载动画
       wx.showNavigationBarLoading();
       //显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
       wx.showLoading({
         title: '刷新中...',
       })
       var that = this;
       that.onLoad();
  },

  // 网络请求核心函数
  getRequest: function () {
    console.log("request里的openid")
    console.log(this.data.open_id)
    var that = this;
    var newsListArr = [];

    wx.request({
      url: 'https://www.hzsmartnet.com:8082/open/history',
      data: {
        "openId": that.data.open_id
      },
      method: "GET",
      success: function (res) {
        console.log("历史数据")
        console.log(res)
        newsListArr = res.data.data;
        that.setData({
          onLoad: false
        })
        for (var i = 0; i < newsListArr.length; i++) {
          newsListArr[i].endTime = comm.js_date_time(newsListArr[i].endTime)
          newsListArr[i].startTime = comm.js_date_time(newsListArr[i].startTime)
          newsListArr[i].percent = (((newsListArr[i].restTime - newsListArr[i].RTime) * 1.0 / newsListArr[i].restTime) * 100).toFixed(0)
          newsListArr[i].restTime = newsListArr[i].restTime / 60000 + " 分钟"
          newsListArr[i].RTime = (newsListArr[i].RTime / 60000).toFixed(0) + " 分钟"

          if (newsListArr[i].chargeStatus == "0") {
            newsListArr[i].chargeStatus = "正在充电"
          } else
            newsListArr[i].chargeStatus = "已完成"
          newsListArr[i].price = newsListArr[i].price + " 元"

        }

        that.setData({
          listArr: newsListArr,
        })
        console.log("展示历史信息")
        console.log(that.data.listArr)

        wx.hideLoading()
      }
    })
  },
  //获取openid
  get_openid: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'get_openId',
      complete: res => {
        console.log('云函数获取到的openid:')
        console.log(res.result)
        var openid = res.result.openId;
        if (openid != "") {
          that.setData({
            open_id: openid
          })
          that.getRequest()
        } else {
          that.setData({
            open_id: ""
          })
          that.get_openid()
        }
      }
    });

  },
})