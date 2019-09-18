var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    disabled: false,
  },

  onLoad: function (options) { },

  name: function (e) { //获取input输入的值
    var that = this

    that.setData({
      name: e.detail.value
    })
    var name = that.data.name
    if (name.length < 2) {
      util.showHintBad('姓名不正确')
      return
    }

  },
  phonenum: function (e) { //获取input输入的值
    var that = this
    that.setData({
      phonenum: e.detail.value
    })
    var phonenum = that.data.phonenum
    if (phonenum.length !== 11) {
      util.showHintBad('手机号码不正确')
      return
    }
  },

  formSubmit: function (e) {
    var that = this
    var callback = function (filename) {
      that.formSubmit2(e, filename)
    }
    app.dbUploadUrl(app.globalData.userInfo.avatarUrl, callback)
  },

  formSubmit2: function (e, filename) {
    var that = this
    var name2 = e.detail.value.name2 //获取input初始值
    var phonenum2 = e.detail.value.phonenum2 //获取input初始值
    var name = that.data.name ? that.data.name : name2
    var phonenum = that.data.phonenum ? that.data.phonenum : phonenum2

    if (name.length < 2) {
      util.showHintBad('姓名不正确')
      return
    }

    if (phonenum.length !== 11) {
      util.showHintBad('手机号码不正确')
      return
    }
    that.setData({
      disabled: true,
    })
    var index = e.currentTarget.dataset.index
    app.dbNewUser(name, phonenum, filename, function () {
      app.Login()
      util.showHint('注册成功')
      wx.switchTab({
        url: '../index/index'
      })
    })
  }
})
