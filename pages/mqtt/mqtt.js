//支付成功后跳转
const mqtt = require('../../utils/mqtt.min.js');
const clientId = "wx_open" + Date.parse(new Date());

var url = 'wxs://www.hzsmartnet.com:443/mqtt';
var client = mqtt.connect(url, {
  clientId: clientId
});
client.on('connect', function () {
  console.log('MQTT连接成功');
  // wx.showToast({
  //   title: "MQTT连接成功", // 标题
  //   icon: "success", // 图标类型，默认success
  //   duration: 2000 // 提示窗停留时间，默认1500ms
  // })
});

Page({
  data: {
    isShow: true,
    status: "点击开始充电",
    topic_y2i: "",
    topic_i2y: "",
    topic: "",
    bsName: "",
    bsID: "",
    chargeID: "",
    chargePort: "",
    grp: "",
    restTime: "",
    openId: "",
    charge_time: "",
    fee: ""
  },
  onLoad: function (e) {
    console.log("mqtt界面收到的参数")
    // var test = '{"bsID":"250","chargeID":"3EAD57DF543423ED","grp":"D002","chargePort":"RT01","restTime":216000000,"openId":"oxiix4rhiv1av9T834QExcFmcbRA","topic":"3EAD57DF543423ED","charge_time":"240","fee":1}'
  var test = e.data
    this.connectMqtt(test)
  },
  connectMqtt: function (test) {
    var rec_data = JSON.parse(test)
    console.log(rec_data)
    this.setData({
      topic_y2i: rec_data.topic + "_Y2I",
      topic_i2y: rec_data.topic + "_I2Y",

      bsID: rec_data.bsID,
      chargeID: rec_data.chargeID,
      chargePort: rec_data.chargePort,
      grp: rec_data.grp,
      restTime: rec_data.restTime,
      openId: rec_data.openId,

      charge_time: rec_data.charge_time,
      fee: rec_data.fee
    })

    this.suscribeTopic();
  },
  suscribeTopic: function () {
    var that = this
    var topic_i2y = this.data.topic_i2y;
    console.log("订阅>>>>>>>" + topic_i2y)
    client.subscribe(topic_i2y)
    //开放式小程序上线
    client.publish("wxapp_open_status", '小程序上线');

    client.on('message', function (topic, payload) {
      console.log(topic.toString() + "收到消息");
      // console.log(payload.toString());
      var rec_message = payload.toString()
      //判断包含字符串
      if (rec_message.indexOf("AckWriteData") >= 0) {
        var rec = rec_message;
        var ack = JSON.parse(rec)
        var no_ack = ack.AckWriteData
        var No = no_ack.No
        // console.log(no_ack)
        console.log("解析消息");
        //console.log(No)
        //No相同的话开始充电成功

       
        that.setData({
          isShow: false,
          status: "正在充电"
        })
      

        that.show_opened_chargingpile()
      }
    })

  },
  onUnload: function () {
    // 关闭连接
    client.end();
  },
  //充电成功 推送消息 从订阅开始
  show_opened_chargingpile: function () {
    wx.showToast({
      title: "开始充电", // 标题
      icon: "success", // 图标类型，默认success
      duration: 2000 // 提示窗停留时间，默认1500ms
    })
    this.openbook()
  },
  //下发充电指令
  btn_charge_open: function () {

    var topic = this.data.topic_y2i;
    console.log("下发指令topic>>>>> " + topic)
    //充电指令
    // var code = '{"WriteData": {"No": ' + Date.parse(new Date()) + ',"Node": [{"Name": "D001.RT05","Value": "5"}]}}'
    var code = '{"WriteData": {"No": ' + Date.parse(new Date()) + ',"Node": [{"Name": ' + this.data.grp + "." + this.data.chargePort + ',"Value": ' + this.data.charge_time + '}]}}'
    client.publish(topic, code);
  },

  //订阅
  subscribe: function () {
    var that = this
    const tmplids = ["_XkeRL42L12IeT01G0n6BdIYJlh3s23yPMOK0dM83nQ","ESYI5HQSnW-5Ts27iyp1NwnyVrIgKgMS_2alhYw6JXM"]
    console.log("订阅")
    console.log(tmplids)
    wx.requestSubscribeMessage({
      tmplIds: tmplids,
      success(res) {
        console.log("订阅成功")
        console.log(res)
        that.getName()
      },
      fail(res) {
        console.log("订阅失败")
        console.log(res);
      }
    })

  },

  //获取车棚名称
  getName() {
    var that = this
    //获取车棚名称
    wx.request({
      url: 'https://www.hzsmartnet.com:8082/bikeshed/name',
      method: "GET",
      data: {
        "bsId": that.data.bsID
      },
      success: function (res) {
        console.log("获取车棚名称")
        console.log(res)
        if (res.data.bsName == "-1") {
          that.data.bsName = "暂未录入车棚名称"

        } else {
          that.data.bsName = res.data.bsName
          // that.send(ACCESS_TOKEN)
          //  that.sendNew()
          
          that.btn_charge_open()
        }
      }
    })
    console.log("车棚名称    " + that.data.bsName)

  },
  //推送
  send: function (ACCESS_TOKEN) {
    console.log("推送")
    console.log("获取车棚名称")

    var that = this
    console.log(that.data.fee)
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + ACCESS_TOKEN,
      method: 'POST',
      data: {
        "touser": that.data.openId,
        "template_id": "_XkeRL42L12IeT01G0n6BdIYJlh3s23yPMOK0dM83nQ",
        "page": "main",
        "miniprogram_state": "developer",
        "lang": "zh_CN",
        "data": {
          "thing1": {
            "value": that.data.bsName
          },
          "character_string2": {
            "value": that.data.chargeID
          },
          "thing14": {
            "value": that.data.chargePort
          },
          "thing5": {
            "value": that.data.charge_time + "分钟"
          },
          "amount10": {
            "value": that.data.fee + "元"
          }
        }
      },

      success: function (res) {
        console.log("推送成功")
        console.log(res)
        that.setData({
          isShow: false,
          status: "正在充电"
        })
        that.btn_charge_open()
      }
    })
  },
  send_yun: function () {

    console.log("进行推送")
    var that = this
    exports.main = async (event, context) => {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": that.data.openId,
      page: 'main',
      lang: 'zh_CN',
      data: {
        thing1: {
          value: that.data.bsName
        },
        character_string2: {
          value: that.data.chargeID
        },
        thing14: {
          value: that.data.chargePort
        },
        thing5: {
          value: that.data.charge_time + "分钟"
        },
        amount10: {
          value: that.data.fee + "元"
        }

      },
      templateId: 'T_XkeRL42L12IeT01G0n6BdIYJlh3s23yPMOK0dM83nQ',
      miniprogramState: 'developer'
    })

    console.log("云函数")
    console.log(result)
  }

  },
  sendNew:function(){
    var that = this
    
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'sendNew',
      // 传递给云函数的参数
      data: {
        openid: that.data.openId,
        thing11:that.data.bsName,
        character_string21:that.data.chargeID,
        thing141:that.data.chargePort,
        thing51:that.data.charge_time + "分钟",
        amount101:that.data.fee + "元"
      },
     
      success: res => {
      
        console.log("推送成功")
        console.log(res)
        that.setData({
          isShow: false,
          status: "正在充电"
        })
        that.btn_charge_open()
      },
      fail: err => {
        console.log(err)
        console.log("推送失败")

      },
    })
},
  //调用充电接口
  openbook: function () {
var that =this
    wx.request({
      url: 'https://www.hzsmartnet.com:8082/open/book',
      method: "POST",
      data: {
        "bsId": this.data.bsID,
        "cpId": this.data.chargeID,
        "grp": this.data.grp,
        "portWay": this.data.chargePort,
        "restTime": this.data.charge_time * 60 * 1000,
        "openId": this.data.openId,
        "price": this.data.fee
      },
      success: function (res) {
        console.log("充电成功接口")
        console.log(res)
       
      }
    })
  },
  //开始充电
  open_tap: function () {
    this.subscribe()
    // this.sendNew()
    // this.btn_charge_open()
  },

})