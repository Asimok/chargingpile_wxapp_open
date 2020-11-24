//获取应用实例
const app = getApp()

Page({
    data: {
        //判断小程序的API，回调，参数，组件等是否在当前版本可用。
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        isHide: false,
        user_openid: '',
    
    },
    onLoad: function () {
     this.get_openid()
    },
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
                user_openid: openid
              })
            
            } else {
              that.setData({
                user_openid: ""
              })
              that.get_openid()
            }
          }
        });
    
      },
    bindGetUserInfo: function (e) {
        this.UserLogin(this.data.user_openid)
    },
    UserLogin: function () {
        var temp_send_data = {
            openId: this.data.user_openid
        };
        console.log("发送到后端的用户信息： ");
        console.log(temp_send_data);
        wx.request({
            url: 'https://www.hzsmartnet.com:8082/login/open',
            method: "POST",
            data: temp_send_data,
            // 解析注册状态
            success: (res) => {
                console.log(res.data)
                var status = res.data.status
                console.log(res.data.status)
                if (status == -1) {
                    // 注册
                    this.register();
                }
                else
                {
                     // 登录 跳转
                     wx.reLaunch({
                        url: '/pages/main/main',
                    })
                }
            }
        })
    },
    register: function () {
        console.log("手机号注册");
        console.log("openid  to verification_code:" + this.data.user_openid);
        wx.navigateTo({
            url: '/pages/verification_code/verification_code?openid=' + this.data.user_openid,
        })
    },

})