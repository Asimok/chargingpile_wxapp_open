// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        touser: event.openid,
        page: 'pages/main/main',
        lang: 'zh_CN',
        data: {
          thing1: {
            value: event.thing11
          },
          character_string2: {
            value: event.character_string21
          },
          thing14: {
            value: event.thing141
          },
          thing5: {
            value: event.thing51
          },
          amount10: {
            value: event.amount101
          }
        },
        templateId: '_XkeRL42L12IeT01G0n6BdIYJlh3s23yPMOK0dM83nQ',
        miniprogramState: 'developer'
      })
    return result
  } catch (err) {
    return err
  }
}
