const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    current: 0,
    items2: [],
    recentItems: [],
    itemrecitals: {}, //记录最新背诵情况
    itemrecitals2: {}, //记录本次背诵情况
    state: 0,
    comments: [],
  },

  /*
   *  state:
   *  0: init
   *  1: unknown
   *  2: know
   * */

  onShow: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 2000)
    } else {
      that.init()
    }
  },

  init: function() {
    var that = this
    console.log("init")
    var str1 = wx.getStorageSync("itemrecitals2")
    if (str1.length > 0) {
      that.data.itemrecitals2 = JSON.parse(str1)
    } else {
      that.data.itemrecitals2 = {}
    }

    that.data.items2 = []
    for (var key in app.globalData.items) {
      var v = app.globalData.items[key]
      v.infavorite = false
      if (v.Id in app.globalData.favorites) {
        v.infavorite = true
      }
      v.Bookname = app.globalData.books[v.Bid].Name
      that.data.items2.push(v)
    }
    that.setData({
      items2: that.data.items2,
      current: wx.getStorageSync("currentItem")
    })
    that.moveToNext()
  },

  moveToNext: function() {
    var that = this
    if (that.data.items2.length == 0) {
      util.showHint("无词条可背！")
      return
    }

    var v = that.data.items2[that.data.current]
    if (that.data.itemrecitals[v.Id] == undefined) {
      that.data.itemrecitals[v.Id] = 0
      that.data.itemrecitals2[v.Id] = 0
      if (app.globalData.itemrecitals[v.Id] != undefined)
        that.data.itemrecitals[v.Id] = app.globalData.itemrecitals[v.Id].Status
    }
    app.dbGetItemComments(v.Id, function(comments) {
      that.setData({
        comments: comments,
      })
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  onClick: function(e) {
    var that = this
    //没有词条
    if (that.data.items2.length == 0) {
      return
    }

    var v = that.data.items2[that.data.current]
    if (that.data.itemrecitals[v.Id] == undefined) {
      console.error(that.data.itemrecitals, v.Id + " should have got itemrecitals!")
    }
    var src = e.target.dataset.src
    switch (src) {
      case "1": //认识
      case "3": // 太简单
        if (src == "1") {
          that.data.itemrecitals[v.Id] += 2
          that.data.itemrecitals2[v.Id] += 2
        } else {
          that.data.itemrecitals[v.Id] += 10
          that.data.itemrecitals2[v.Id] += 10
        }
        app.dbUpdateItemRecital(v.Id, that.data.itemrecitals[v.Id])
        wx.setStorageSync("itemrecitals2", JSON.stringify(that.data.itemrecitals2))
        that.setData({
          state: 2,
        })
        break

      case "2": //不认识        
        that.setData({
          state: 1,
        })
        break

      case "4": // 下一条!
        var orig = that.data.current
        var newid = that.data.items2[that.data.current].Id
        var isInGroup = (that.data.recentItems.indexOf(newid) > -1)

        if (!isInGroup)
          that.data.recentItems.push(that.data.items2[that.data.current].Id)

        if (that.data.recentItems.length == 10) {
          wx.navigateTo({
            url: '../itemlist/itemlist?items=' + JSON.stringify(that.data.recentItems),
          })
          that.data.recentItems = []
          break
        }

        do {
          that.data.current = (that.data.current + that.data.items2.length + 1) % that.data.items2.length
          v = that.data.items2[that.data.current]
        } while (that.data.current != orig && that.data.itemrecitals2[v.Id] > 1)

        if (orig == that.data.current && that.data.itemrecitals2[v.Id] > 1) {
          if (that.data.recentItems.length > 1) {
            wx.navigateTo({
              url: '../itemlist/itemlist?items=' + JSON.stringify(that.data.recentItems),
            })
            that.data.recentItems = []
            break
          }
          console.log("nothing to do")
          if (!app.globalData.punched) {
            wx.showModal({
              title: '提示',
              content: '已背完所有词条，需要打卡吗？',
              success: function(sm) {
                if (sm.confirm) {
                  console.log('用户点击确认')
                  wx.navigateTo({
                    url: '../punch/punch?bid=' + that.data.items2[0].Bid + '&itemnum=' + that.data.items2.length,
                  })
                } else if (sm.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '已背完所有词条，需要退出当前界面吗？',
              success: function(sm) {
                if (sm.confirm) {
                  console.log('用户点击确认')
                  var pages = getCurrentPages(); // 当前页面
                  var beforePage = pages[pages.length - 2]; // 前一个页面
                  wx.navigateBack({
                    success: function() {
                      if (beforePage != undefined)
                        beforePage.onLoad(); // 执行前一个页面的onLoad方法
                    }
                  })
                } else if (sm.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
          break
        }

        that.moveToNext()

        that.setData({
          items2: that.data.items2,
          current: that.data.current,
          state: 0,
        })
        wx.setStorageSync("currentItem", that.data.current)
        break

      case "5": // 词条需改善!
        wx.navigateTo({
          url: '../itemcomments/itemcomments?mode=0&itemid=' + v.Id,
        })
        break;

      case "6": // 取消!
        that.data.itemrecitals[v.Id] -= that.data.itemrecitals2[v.Id]
        that.data.itemrecitals2[v.Id] = 0
        app.dbUpdateItemRecital(v.Id, that.data.itemrecitals[v.Id])
        that.setData({
          state: 1,
        })
        wx.setStorageSync("itemrecitals2", JSON.stringify(that.data.itemrecitals2))
        break;

      case "7": // 添加收藏
        app.dbNewFavorites(that.data.items2[that.data.current].Id)
        that.data.items2[that.data.current].infavorite = true
        that.setData({
          items2: that.data.items2
        })
        break

      case "8": // 取消收藏
        app.dbDeleteFavorites(that.data.items2[that.data.current].Id)
        that.data.items2[that.data.current].infavorite = false
        that.setData({
          items2: that.data.items2
        })
        break

      default:
        console.log("default")
    }
  },
})