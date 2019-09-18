var util = require('utils/util')
App({
  onLaunch: function() {
    var str1 = wx.getStorageSync("userinfo")
    if (str1.length > 0) {
      this.globalData.userInfo = JSON.parse(str1)
      this.Login()
    }
  },

  dbGetItemsFromStorage: function(callback) {
    var app = this
    app.globalData.items = JSON.parse(wx.getStorageSync("items"))
    app.globalData.dirty["items"] = false
    if (callback) {
      console.log("dbGetItemsFromStorage", "call callback")
      callback()
    }
  },

  //获取需要背诵的词条
  dbGetItems: function(callback) {
    var app = this
    if (app.globalData.dirty["items"] == false) {
      if (callback)
        callback()
      return
    }

    //从storage中取数据
    if (wx.getStorageSync("itemsdate") == util.formatDate(new Date())) {
      console.log("dbGetItems:from storage!")
      app.dbGetItemsFromStorage(callback)
      return
    }

    console.log("dbGetItems:from web!")
    app.dbReset()
    wx.request({
      url: app.globalData.baseurl + "/cats/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: app.globalData.currentOrder,
        limit: app.globalData.currentLimit,
        query: "Bid:" + app.globalData.currentBid + ",Uid:" + app.globalData.userid,
      },
      success: function(res) {
        app.globalData.items = {}
        if (res.data != null)
          res.data.forEach(v => {
            app.globalData.items[v["Id"]] = v
          })

        //存入到storage中
        wx.setStorageSync("itemsdate", util.formatDate(new Date()))
        wx.setStorageSync("items", JSON.stringify(app.globalData.items))
        app.dbGetItemsFromStorage(callback)
      }
    })
  },

  //获取需要浏览的词条
  dbGetItems2: function(q, callback) {
    var app = this
    if (app.globalData.dirty["itemsBro"] == false) {
      if (callback)
        callback()
      return
    }
    wx.request({
      url: app.globalData.baseurl + "/items/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        limit: app.globalData.currentLimit2,
        query: q,
      },
      success: function(res) {
        app.globalData.itemsBro = {}
        if (res.data != null)
          res.data.forEach(v => {
            app.globalData.itemsBro[v["Id"]] = v
          })
        app.globalData.dirty["itemsBro"] = false
        if (callback)
          callback()
      }
    })
  },

  dbGetBookRecitals: function(callback) {
    var app = this
    if (app.globalData.dirty["bookrecitals"] == false) {
      if (callback)
        callback()
      return
    }
    wx.request({
      url: app.globalData.baseurl + "/bookrecitals/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        query: "uid:" + app.globalData.userid,
      },
      success: function(res) {
        app.globalData.bookrecitals = {}
        if (res.data != null)
          res.data.forEach(v => {
            app.globalData.bookrecitals[v.Bid] = v
          })
        app.globalData.dirty["bookrecitals"] = false
        if (callback) {
          console.log("dbGetBookRecitals", "call callback")
          callback()
        }
      }
    })
  },

  //step 1 寻找所有的词条记录
  dbDeleteBookRecitals: function(bid) {
    var app = this

    if (app.globalData.bookrecitals[bid] == undefined) {
      util.showHint('无需删除')
      return
    }

    var limit = app.globalData.books[bid].Items
    app.globalData.irCount = 0
    wx.request({
      url: app.globalData.baseurl + "/items/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        fields: "Id",
        query: "bid:" + bid,
        limit: limit,
      },
      success: function(res) {
        app.globalData.itemsBro = {}
        if (res.data != null)
          res.data.forEach(v => {
            app.dbDeleteBookRecitals2(bid, v.Id)
          })
      }
    })
  },

  //step 2 寻找所有的背诵记录
  dbDeleteBookRecitals2: function(bid, iid) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/itemrecitals/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        fields: "Id",
        query: "uid:" + this.globalData.userid + ",Iid:" + iid,
      },
      success: function(res) {
        if (res.data != null) {
          var v = res.data[0]
          app.globalData.irCount++
            app.dbDeleteBookRecitals3(bid, v.Id)
        }
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  //step 3 删除所有的背诵记录
  dbDeleteBookRecitals3: function(bid, rid) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/itemrecitals/" + rid,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      success: function(res) {
        app.globalData.irCount--
          console.log(res)
        if (app.globalData.irCount == 0) {
          app.dbDeleteBookRecitals4(bid)
        }
      },
      fail: function(res) {
        console.log('删除失败', rid, res)
      }
    })
  },

  //step 4 删除书背诵汇总（避免后台没有删除干净）
  dbDeleteBookRecitals4: function(bid) {
    var app = this
    var id = app.globalData.bookrecitals[bid].Id
    wx.request({
      url: app.globalData.baseurl + "/bookrecitals/" + id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      complete: function(res) {
        util.showHint('删除完成')
        console.log('删除完成')
        app.dbReset()
      }
    })
  },

  dbCheckDuplicateItem: function(name, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/items/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        order: "desc",
        fields: "Id",
        limit: 1,
        query: "name:" + name,
      },
      success: function(res) {
        var r = false
        if (res.data != null) {
          r = true
        }
        if (callback)
          callback(r)
      }
    })
  },

  dbGetItemRecitals: function(Iid, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/itemrecitals/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        limit: 1,
        query: "uid:" + this.globalData.userid + ",Iid:" + Iid,
      },
      success: function(res) {
        var r = 0
        if (res.data != null) {
          var v = res.data[0]
          app.globalData.itemrecitals[Iid] = v
          r = v.Status
        }
        if (callback)
          callback(r)
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbUpdateItemRecital: function(Iid, st) {
    var app = this
    if ((st == 0) && (app.globalData.itemrecitals[Iid] == undefined))
      return
    if (app.globalData.itemrecitals[Iid] == undefined) { //new
      var v = {}
      v.Iid = Iid
      v.Status = st
      v.Uid = this.globalData.userid
      wx.request({
        url: app.globalData.baseurl + "/itemrecitals",
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key,
          "Content-Type": "application/json"
        },
        method: "POST",
        data: {
          "Iid": v.Iid,
          "Status": v.Status,
          "Uid": v.Uid,
        },
        success: function(res) {
          app.globalData.itemrecitals[Iid] = res.data
          wx.setStorageSync("itemrecitals", JSON.stringify(app.globalData.itemrecitals))
          console.log("添加成功", res.data)
          app.globalData.dirty["bookrecitals"] = true
          app.dbGetBookRecitals()
        },
        fail: function(res) {
          console.log('错误' + ':' + res)
        }
      })

    } else if (st > 0) { //update
      var v = app.globalData.itemrecitals[Iid]
      v.CreateDate = util.formatTimeForDB(new Date(v.CreateDate))
      v.Status = st
      wx.setStorageSync("itemrecitals", JSON.stringify(app.globalData.itemrecitals))
      wx.request({
        url: app.globalData.baseurl + "/itemrecitals/" + v["Id"],
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key,
          "Content-Type": "application/json"
        },
        method: "PUT",
        data: {
          "CreateDate": v.CreateDate,
          "Iid": v.Iid,
          "Status": v.Status,
          "Uid": v.Uid,
        },
        success: function(res) {
          console.log("更新成功", res.data)
          app.globalData.dirty["bookrecitals"] = true
          app.dbGetBookRecitals()
        },
        fail: function(res) {
          console.log('错误' + ':' + res)
        }
      })
    } else { //remove
      var v = app.globalData.itemrecitals[Iid]
      wx.request({
        url: app.globalData.baseurl + "/itemrecitals/" + v.Id,
        method: "DELETE",
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key,
        },
        success: function(res) {
          util.showHint('删除成功')
          console.log('删除成功', res)
          delete app.globalData.itemrecitals[Iid]
          wx.setStorageSync("itemrecitals", JSON.stringify(app.globalData.itemrecitals))
          app.globalData.dirty["bookrecitals"] = true
          app.dbGetBookRecitals()
        },
        fail: function(res) {
          console.log('删除失败', res)
        }
      })

    }
  },

  dbNewItemComments: function(Iid, types, comments, callback) {
    var app = this
    var v = {}
    v.Uid = app.globalData.userid
    v.Iid = Iid
    v.Detail = comments
    v.Type = types
    wx.request({
      url: app.globalData.baseurl + "/itemcomments",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        "Uid": v.Uid,
        "Iid": v.Iid,
        "Detail": v.Detail,
        "Type": v.Type,
      },
      success: function(res) {
        console.log("添加成功", res)
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbGetPunches: function(callback) {
    var app = this
    if (app.globalData.dirty["punches"] == false) {
      if (callback)
        callback()
      return
    }

    wx.request({
      url: app.globalData.baseurl + "/punches/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: app.globalData.currentOrder,
        query: "Uid:" + app.globalData.userid,
      },
      success: function(res) {
        app.globalData.punches = {}
        if (res.data != null) {
          res.data.forEach(v => {
            app.globalData.punches[v.Id] = v
          })
        }
        app.globalData.dirty["punches"] = false
        if (callback)
          callback()
      }
    })
  },

  dbGetFavorites: function(callback) {
    var app = this
    if (app.globalData.dirty["favorites"] == false) {
      if (callback)
        callback()
      return
    }

    wx.request({
      url: app.globalData.baseurl + "/favorites/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: app.globalData.currentOrder,
        query: "Uid:" + app.globalData.userid,
      },
      success: function(res) {
        app.globalData.favorites = {}
        if (res.data != null) {
          console.log(res.data)
          res.data.forEach(v => {
            app.globalData.favorites[v.Iid] = v
          })
        }
        //console.log("f:", app.globalData.favorites)
        app.globalData.dirty["favorites"] = false
        if (callback)
          callback()
      }
    })
  },

  dbNewFavorites: function(Iid, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/favorites",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        "Uid": app.globalData.userid,
        "Iid": Iid,
      },
      success: function(res) {
        console.log("添加成功", res)
        var v = res.data
        app.globalData.favorites[v.Iid] = v
        if (app.globalData.itemsFavor[v.Iid] == undefined) {
          if (app.globalData.itemsBro[v.Iid] == undefined) {
            app.globalData.itemsFavor[v.Iid] = app.globalData.items[v.Iid]
          } else {
            app.globalData.itemsFavor[v.Iid] = app.globalData.itemsBro[v.Iid]
          }
        }
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbDeleteFavorites: function(Iid, callback) {
    var app = this
    var v = app.globalData.favorites[Iid]
    wx.request({
      url: app.globalData.baseurl + "/favorites/" + v.Id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      success: function(res) {
        console.log("删除成功", res)
        delete app.globalData.favorites[Iid]
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  Login: function() {
    var app = this
    wx.login({
      success: res => {
        if (res.code) {
          app.globalData.wxcode = res.code
          wx.request({
            url: app.globalData.baseurl + "/birds/",
            method: "GET",
            data: {
              type: 3,
              wxcode: app.globalData.wxcode
            },
            success: function(res) {
              wx.getSystemInfo({
                success: function(res) {
                  app.globalData.systemInfo = res
                },
              })
              app.globalData.openid = res.data.openid
              app.globalData.session_key = res.data.session_key
              // console.log("app.globalData.session_key:", app.globalData.session_key)
              app.globalData.dirty["users"] = true
              console.log("init user...")
              app.dbGetUser()
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  dbGetSthWithPhotos: function(key1, key2, callback, limit = 20, query = "") {
    var app = this

    if (app.globalData.dirty[key1] == false) {
      if (callback)
        callback()
      return
    }

    if (app.globalData.callbacks[key1] == undefined)
      app.globalData.callbacks[key1] = []
    if (callback)
      app.globalData.callbacks[key1].push(callback)
    if (app.globalData.locked[key1]) {
      return
    }

    app.globalData.locked[key1] = true
    app.globalData[key1] = {}
    var url2 = app.globalData.baseurl + "/" + key1 + "/"
    wx.request({
      url: url2,
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key
      },
      data: {
        sortby: "Id",
        order: "desc",
        limit: limit,
        query: query,
      },
      success: function(res) {
        if (res && res.data)
          res.data.forEach(v => {
            app.globalData[key1][v["Id"]] = v
          })
        app.globalData.dirty[key1] = false
        app.globalData.dirty[key2] = true
        app.globalData.callbacks[key1].forEach(callback2 => {
          callback2()
        })
        delete app.globalData.callbacks[key1]
        app.globalData.locked[key1] = false
      }
    })
  },

  dbGetPhotos: function(key1, key2, callback, key3 = "Photo") {
    var app = this
    var num = 0
    var num2 = 0
    var keys
    var current = 0

    console.log("dbGetPhotos", key1, key2)
    if (app.globalData.dirty[key2] == false) {
      if (callback)
        callback()
      return
    }
    if (app.globalData.callbacks[key2] == undefined)
      app.globalData.callbacks[key2] = []
    if (callback)
      app.globalData.callbacks[key2].push(callback)
    if (app.globalData.locked[key2]) {
      return
    }

    var downloadOnePhoto2 = function() {
      num--
      num2--
      if (num == 0) {
        app.globalData.dirty[key2] = false
        app.globalData.callbacks[key2].forEach(callback2 => {
          console.log("dbGetPhotos", "call callback")
          callback2()
        })
        app.globalData.callbacks[key2] = []
        app.globalData.locked[key2] = false
      } else if (num2 == 0) {
        downloadSeveralPhotos()
      }
    }
    var downloadOnePhoto = function(v) {
      var url2 = app.globalData.baseurl + "/birds/download?filename=" + v[key3].slice(1, -1)
      var str1 = wx.getStorageSync(v[key3].slice(1, -1))
      if (str1.length > 0) {
        //console.log("downloadOnePhoto:from local")
        v["filename"] = str1
        downloadOnePhoto2()
      } else {
        console.log("downloadOnePhoto:from web")
        wx.downloadFile({
          url: url2,
          method: "GET",
          header: {
            "Cookie": "JSESSIONID=" + app.globalData.session_key,
          },
          filePath: wx.env.USER_DATA_PATH + '/' + v[key3].slice(1, -1),
          success: function(res) {
            v["filename"] = res.filePath
            wx.setStorageSync(v[key3].slice(1, -1), v["filename"]); //将图片路径缓存到本地
            downloadOnePhoto2()
          },
          fail: function(res) {
            console.log("downloadOnePhoto fail...", res, v[key3].slice(1, -1))
          }
        })
      }
    }

    var downloadSeveralPhotos = function() {
      num2 = num > app.globalData.maxjobs ? app.globalData.maxjobs : num
      var num2b = num2
      for (var i = 0; i < num2b; i++) {
        downloadOnePhoto(app.globalData[key1][keys[current]])
        current++
      }
    }

    keys = Object.keys(app.globalData[key1])
    num = keys.length
    app.globalData.locked[key1] = true
    app.globalData.locked[key2] = true
    downloadSeveralPhotos()
  },

  getUserInfo: function(v) {
    var app = this
    app.globalData.userid = v.Id
    app.globalData.currentBid = v.Bid
    app.globalData.currentOrder = v.Order
    app.globalData.currentLimit = v.Limit
    app.globalData.currentLimit2 = v.Limit2
  },

  dbGetUser: function() {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/users/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        query: "Openid:" + app.globalData.openid,
      },
      success: function(res) {
        if (res && res.data && res.data[0]) {
          var v = res.data[0]
          app.globalData["users"] = {}
          app.globalData["users"][v.Id] = v
          app.getUserInfo(v)
          app.dbInit(function() {
            app.globalData.ready = true
          })
        } else {
          console.log(res)
          wx.redirectTo({
            url: "../register/register"
          })
        }
      }
    })
  },

  dbGetUserPhotos: function(callback) {
    this.dbGetPhotos("users", "userphotos", callback)
  },

  dbGetBooks: function(callback) {
    this.dbGetSthWithPhotos("books", "bookphotos", callback, 100, "Status__lt:100")
  },

  dbGetBookPhotos: function(callback) {
    this.dbGetPhotos("books", "bookphotos", callback)
  },

  dbDownloadOneFile: function(file1, callback) {
    var app = this
    var url2 = this.globalData.baseurl + "/birds/download?filename=" + file1
    var str1 = wx.getStorageSync(file1)
    if (str1.length > 0) {
      //console.log("dbDownloadOneFile:from local")
      if (callback)
        callback(str1)
    } else {
      console.log("dbDownloadOneFile:from web")
      wx.downloadFile({
        url: url2,
        method: "GET",
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key
        },
        filePath: wx.env.USER_DATA_PATH + '/' + file1,
        success: function(res) {
          wx.setStorageSync(file1, res.filePath); //将图片路径缓存到本地
          if (callback)
            callback(res.filePath)
        },
        fail: function(res) {
          console.log("dbDownloadOneFile fail...", res)
        }
      })
    }
  },

  dbUpdateUser: function(uid, bid, order, limit, limit2, callback) {
    var v = this.globalData.users[uid]
    v.Bid = bid
    v.Order = order
    v.Limit = limit
    v.Limit2 = limit2
    var app = this
    wx.request({
      url: this.globalData.baseurl + "/users/" + v.Id,
      method: "PUT",
      header: {
        "Content-Type": "application/json"
      },
      data: {
        "Id": v.Id,
        "CreateDate": util.formatTimeForDB(new Date(v.CreateDate)),
        "Name": v.Name,
        "Phonenumber": v.Phonenumber,
        "Openid": v.Openid,
        "Photo": v.Photo,
        "Bid": v.Bid,
        "Order": v.Order,
        "Limit": v.Limit,
        "Limit2": v.Limit2,
      },
      success: function(res) {
        app.getUserInfo(v)
        app.globalData.dirty["items"] = true
        app.globalData.dirty["itemsBro"] = true
        console.log("更新用户设置成功")
        if (callback)
          callback()
      }
    })
  },

  dbUploadUrl: function(url, callback) {
    var app = this
    app.globalData.shouldNotInit = true
    wx.downloadFile({
      url: url,
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key
      },
      success: function(res) {
        wx.uploadFile({
          url: app.globalData.baseurl + "/birds/",
          filePath: res.tempFilePath,
          name: 'img',
          header: {
            "Cookie": "JSESSIONID=" + app.globalData.session_key,
            "Content-Type": "multipart/form-data",
            'accept': 'application/json',
          },
          success: function(res) {
            if (callback)
              callback(res.data)
            app.globalData.shouldNotInit = false
          },
          fail: function(res) {
            console.log('fail', res)
            app.globalData.shouldNotInit = false
          },
        })
      }
    })
  },

  dbUploadFile: function(filePath, callback) {
    var app = this
    app.globalData.shouldNotInit = true
    wx.uploadFile({
      url: app.globalData.baseurl + "/birds/",
      filePath: filePath,
      name: 'img',
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "multipart/form-data",
        'accept': 'application/json',
      },
      success: function(res) {
        if (callback)
          callback(res.data)
        app.globalData.shouldNotInit = false
      },
      fail: function(res) {
        console.log('fail', res)
        app.globalData.shouldNotInit = false
      },
    })
  },

  dbGetItemComments: function(iid, callback) {
    var app = this
    var comments = []
    wx.request({
      url: app.globalData.baseurl + "/itemcomments/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        query: "Uid:" + app.globalData.userid + ",Iid:" + iid + ",Type:笔记"
      },
      success: function(res) {
        if (res.data != null) {
          console.log(res.data)
          res.data.forEach(v => {
            comments.push(v)
          })
        }
        if (callback)
          callback(comments)
      }
    })
  },

  dbDeleteItem: function(id, callback) {
    var app = this

    wx.request({
      url: app.globalData.baseurl + "/items/" + id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      success: function(res) {
        util.showHint('删除成功')
        console.log('删除成功', res)
        app.globalData.dirty["items"] = true
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('删除失败', res)
      }
    })
  },

  udateItem: function(id, creator, bid, name, descripton, photo, callback) {
    var app = this

    wx.request({
      url: app.globalData.baseurl + "/items/" + id,
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "PUT",
      data: {
        "Creator": creator,
        "Bid": bid,
        "Name": name,
        "Description": description,
        "Photo": photo
      },
      success: function(res) {
        util.showHint('更新成功')
        console.log("更新成功", res)
        app.globalData.dirty["items"] = true
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbNewUser: function(name, phonenum, filename, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/users",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        "CreateDate": util.formatTimeForDB(new Date()),
        "Openid": app.globalData.openid,
        'Name': name,
        'Phonenumber': phonenum,
        "Photo": filename,
        "bid": 1,
        "Order": "asc",
        "Limit": 5,
        "Limit2": 5,
      },
      success: function(res) {
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('新建用户失败', res)
      }
    })
  },

  dbNewPunch: function(duration, bid, num, lon, lat, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/punches",
      method: "POST",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      data: {
        "CreateDate": util.formatTimeForDB(new Date()),
        "Duration": duration,
        "Uid": app.globalData.userid,
        "Bid": bid,
        "Num": num,
        "Longitude": lon,
        "Latitude": lat,
      },

      success: function(res) {
        app.globalData.dirty["punches"] = true
        app.globalData.punched = true
        app.dbGetPunches(app.dbGetPunchSummary)

        console.log('成功！', res)
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误!', res)
      }
    })
  },

  callbackCount: function() {
    var app = this
    var key1 = "dbInit"
    app.globalData.count++
      //console.log("callbackCount:", app.globalData.count, app.globalData.countTarget)
      if (app.globalData.count == app.globalData.countTarget) {
        app.globalData.callbacks[key1].forEach(callback2 => {
          callback2()
        })
        delete app.globalData.callbacks[key1]
        app.globalData.locked[key1] = false
        console.log("dbInit finished", (new Date()).valueOf())
      }
  },

  callInittBookPhotos: function() {
    this.dbGetBookPhotos(this.callbackCount)
  },

  dbGetPunchSummary: function() {
    var app = this
    app.globalData.punchSummary = {}
    if (0 == Object.keys(app.globalData.punches).length) {
      app.callbackCount()
      return
    }

    wx.request({
      url: app.globalData.baseurl + "/punchsummaries/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        query: "Uid:" + app.globalData.userid,
      },
      success: function(res) {
        if (res.data != null) {
          var v = res.data
          app.globalData.punchSummary = v[0]
        }
        app.callbackCount()
      }
    })
  },


  dbGetAllFavoriteItems: function() {
    var app = this
    app.globalData.itemsFavor = {}
    app.globalData.ifCount = 0
    if (0 == Object.keys(app.globalData.favorites).length) {
      app.callbackCount()
      return
    }
    for (var key in app.globalData.favorites) {
      wx.request({
        url: app.globalData.baseurl + "/items/" + key,
        method: "GET",
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key,
        },
        success: function(res) {
          if (res.data != null) {
            var v = res.data
            app.globalData.itemsFavor[v["Id"]] = v
          }
          app.globalData.ifCount++
            if (app.globalData.ifCount == Object.keys(app.globalData.favorites).length) {
              app.callbackCount()
            }
        }
      })
    }
  },

  dbGetAllItemRecitalsAndPhotosCallbackCount: function() {
    var app = this
    app.globalData.irCount++
      if (app.globalData.irCount == Object.keys(app.globalData.items).length) {
        wx.setStorageSync("itemrecitals", JSON.stringify(app.globalData.itemrecitals))
        app.callbackCount()
      }
  },

  dbGetAllItemRecitalsAndPhotos: function() {
    var app = this
    app.globalData.itemrecitals = {}
    var str1 = wx.getStorageSync("itemrecitals")
    console.log("dbGetAllItemRecitalsAndPhotos")
    if (str1.length > 0) {
      console.log("dbGetAllItemRecitalsAndPhotos:from storage!")
      app.globalData.itemrecitals = JSON.parse(str1)
      app.callbackCount()
    } else {
      console.log("dbGetAllItemRecitalsAndPhotos:from web!")
      app.globalData.irCount = 0
      for (var key in app.globalData.items) {
        var v = app.globalData.items[key]
        //下载背诵信息
        app.dbGetItemRecitals(v.Id, app.dbGetAllItemRecitalsAndPhotosCallbackCount)
      }
    }
    for (var key in app.globalData.items) {
      var v = app.globalData.items[key]
      if (v.Photo.length > 0) {
        v["filename"] = []
        var imageList = v.Photo.split(";")
        for (var key2 in imageList) {
          //下载图片
          app.dbDownloadOneFile(imageList[key2].slice(1, -1))
          v["filename"].push(wx.env.USER_DATA_PATH + '/' + imageList[key2].slice(1, -1))
        }
      }
      if (util.checkExplainbyphoto(v.Description)) {
        app.dbDownloadOneFile(v.Description.slice(1, -1))
        v["filename2"] = wx.env.USER_DATA_PATH + '/' + v.Description.slice(1, -1)
      }
    }
  },

  dbGetAllItemBroPhotos: function() {
    var app = this
    for (var key in app.globalData.itemsBro) {
      var v = app.globalData.itemsBro[key]
      if (v.Photo.length > 0) {
        v["filename"] = []
        var imageList = v.Photo.split(";")
        for (var key2 in imageList) {
          app.dbDownloadOneFile(imageList[key2].slice(1, -1))
          v["filename"].push(wx.env.USER_DATA_PATH + '/' + imageList[key2].slice(1, -1))
        }
      }
      if (util.checkExplainbyphoto(v.Description)) {
        app.dbDownloadOneFile(v.Description.slice(1, -1))
        v["filename2"] = wx.env.USER_DATA_PATH + '/' + v.Description.slice(1, -1)
      }
    }
  },

  dbInit: function(callback) {
    var app = this
    var key1 = "dbInit"
    console.log("dbInit", (new Date()).valueOf())
    app.globalData.mottosi = Math.floor(Math.random() * 100)
    if (app.globalData.callbacks[key1] == undefined)
      app.globalData.callbacks[key1] = []
    if (callback)
      app.globalData.callbacks[key1].push(callback)
    if (app.globalData.locked[key1]) {
      return
    }

    app.globalData.count = 0
    app.globalData.countTarget = 5
    app.globalData.locked[key1] = true
    app.dbGetBooks(app.callInittBookPhotos)
    app.dbGetBookRecitals(app.callbackCount)
    app.dbGetFavorites(app.dbGetAllFavoriteItems)
    app.dbGetPunches(app.dbGetPunchSummary)

    app.dbGetItems(app.dbGetAllItemRecitalsAndPhotos)
    setTimeout(function() {
      if (app.globalData.ready)
        console.log("dbInit, ready!")
      else {
        console.log("dbInit, force ready!")
        if (callback)
          callback()
      }
    }, 5000)
  },

  dbReset: function() {
    var app = this
    app.globalData.ready = false
    app.globalData.punched = false
    app.globalData.dirty = {}
    wx.setStorageSync("currentItem", 0)

    //清空storage
    try {
      wx.removeStorageSync("items")
      wx.removeStorageSync("itemsdate")
      wx.removeStorageSync("itemrecitals")
      wx.removeStorageSync("itemrecitals2")
    } catch (e) {
      console.log("dbReset:", e)
    }
    app.dbInit(function() {
      app.globalData.ready = true
    })
  },

  globalData: {
    baseurl: "https://www.wootec.cn:8084/v1",
    shouldNotInit: false, //for bug:http://blog.it2048.cn/article-wxmini-bug/
    wxcode: "",
    userInfo: null,
    openid: '',
    session_key: '',
    userid: 0,
    ready: false,
    punched: false,
    users: {},
    books: {},
    items: {},
    itemsBro: {},
    itemsFavor: {},
    punchSummary: {},
    itemrecitals: {},
    bookrecitals: {},
    favorites: {},
    punches: {},
    dirty: {},
    locked: {},
    callbacks: {},
    maxjobs: 8,
    currentBid: 0,
    currentOrder: '',
    currentLimit: 0,
    currentLimit2: 0,
    systemInfo: null,
    irCount: 0,
    ifCount: 0,
    irCount: 0,
    mottosi: 0,
    count: 0,
    countTarget: 0,
  }
})
