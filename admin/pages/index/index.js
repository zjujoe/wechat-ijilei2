const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    currentTab: 0,
    count: 0,
    users2: [],
    comments2: [],
  },
  //事件处理函数
  bindViewTap: function() {},

  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    wx.setStorageSync("userinfo", JSON.stringify(app.globalData.userInfo))

    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    app.Login()
  },

  onShow: function(options) {
    if (app.globalData.shouldNotInit)
      return
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 1000)
    } else {
      that.reloadData()
    }
  },

  callbackCount: function() {
    this.data.count++
      if (this.data.count == 1) {
        this.init()
      }
  },

  init: function() {
    var users2 = []
    var that = this

    for (var key in app.globalData.users) {
      users2.push(app.globalData.users[key])
    }

    that.setData({
      users2: users2
    })

    app.dbGetItemComments(function(comments) {
      that.setData({
        comments2: comments,
      })
    })

  },

  reloadData: function() {
    this.data.count = 0
    console.log("index，reloadData....")
    app.dbGetUsers(this.callbackCount)
  },

  resetCoreData: function() {
    app.globalData.dirty = {}
    util.showHint('重置成功 0.80')
  },

  removeUser: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除用户吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          that.doRemoveUser(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doRemoveUser: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var uid = that.data.users2[index].Id
    app.dbDeleteUser(
      that.data.users2[index].Id,
      function() {
        util.showHint('删除用户成功')
        that.reloadData()
      })

  },
  removeComment: function(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          console.log('用户点击确认')
          that.doRemoveComment(e)
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  doRemoveComment: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index

    app.dbDeleteUser(that.data.comments2[index].Id,
      function() {
        util.showHint('删除成功')
        that.reloadData()
      })
  },

  //滑动切换
  swiperTab: function(e) {
    var that = this
    that.setData({
      currentTab: e.detail.current
    })
  },
  //点击切换
  clickTab: function(e) {
    var that = this
    if (this.data.currentTab === e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
})
