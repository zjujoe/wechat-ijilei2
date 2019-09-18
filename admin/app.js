var util = require('utils/util')
App({
  onLaunch: function() {
    var str1 = wx.getStorageSync("userinfo")
    if (str1.length > 0) {
      console.log("local:", str1)
      this.globalData.userInfo = JSON.parse(str1)
      this.Login()
    }
  },

  dbGetItems: function(callback) {
    var app = this
    app.dbGetItems2("", callback)
  },

  dbGetItems2: function(q, callback) {
    var app = this
    if (app.globalData.dirty["items"] == false) {
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
        limit: 800,
        query: q,
      },
      success: function(res) {
        app.globalData.items = {}
        if (res.data != null) {
          res.data.forEach(v => {
            app.globalData.items[v["Id"]] = v
          })
        }
        app.globalData.dirty["items"] = false
        if (callback)
          callback()
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
        sortby: "Id",
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

  dbNewItem: function(bid, name, description, photo, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/items",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "POST",
      data: {
        "Creator": app.globalData.userid,
        "Bid": bid,
        "Name": name,
        "Description": description,
        "Photo": photo
      },
      success: function(res) {
        console.log('添加词条成功', res)
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbUpdateItem: function(id, creator, bid, name, description, photo, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/items/" + id,
      method: "PUT",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      data: {
        "Creator": creator,
        "Bid": bid,
        "Name": name,
        "Description": description,
        "Photo": photo
      },
      success: function(res) {
        console.log("更新成功", res)
        app.globalData.dirty["items"] = true
        if (callback) callback()
      },
      fail: function(res) {
        console.log('错误', res)
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
        "Content-Type": "application/json"
      },
      success: function(res) {
        console.log('删除成功', res)
        app.globalData.dirty["items"] = true
        if (callback) callback()
      },
      fail: function(res) {
        console.log('删除失败', res)
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
              type: 1,
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
              app.testuser()
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },

  testuser: function(callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/superusers/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        limit: 100,
      },
      success: function(res) {
        app.globalData.isuser = false
        if (res && res.data) {
          for (var v in res.data) {
            if (app.globalData.openid === res.data[v].Openid) {
              app.globalData.userid = res.data[v].Id
              app.globalData.isuser = true
              break
            }
          }
        }
        if (!app.globalData.isuser)
          wx.redirectTo({
            url: '../register/register'
          })
        else {
          app.globalData.ready = true
          if (callback)
            callback()
        }
      },
    })
  },

  dbGetSthWithPhotos: function(key1, key2, callback, key3 = 20) {
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
    //var query2 = ""
    wx.request({
      url: url2,
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        limit: key3,
        //query: query2,
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
        console.log("downloadOnePhoto:from local")
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


  dbGetUsers: function(callback) {
    this.dbGetSthWithPhotos("users", "userphotos", callback, 100)
  },

  dbGetUserPhotos: function(callback) {
    this.dbGetPhotos("users", "userphotos", callback)
  },

  dbGetBooks: function(callback) {
    this.dbGetSthWithPhotos("books", "bookphotos", callback, 100)
  },
  dbNewBook: function(name, description, photo, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/books",
      method: "POST",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json",
      },
      data: {
        "Creator": app.globalData.userid,
        "Name": name,
        "Description": description,
        "Photo": photo,
        "Status": 0,
      },
      success: function(res) {
        app.globalData.dirty["books"] = true
        console.log('添加成功', res)
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })

  },

  dbUpdateBook: function(id, name, items, description, createdate, photo, status, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/books/" + id,
      method: "PUT",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      data: {
        "Creator": app.globalData.userid,
        "Name": name,
        "Items": items,
        "Description": description,
        "CreateDate": util.formatTimeForDB(new Date(createdate)),
        "Photo": photo,
        "Status": status,
      },
      success: function(res) {
        console.log('更新成功', res)
        app.globalData.dirty["books"] = true
        if (callback) callback()
      }
    })
  },

  dbDeleteBook: function(id, callback) {
    var app = this

    wx.request({
      url: app.globalData.baseurl + "/books/" + id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      success: function(res) {
        console.log('删除成功', res)
        app.globalData.dirty = {}
        if (callback) callback()
      },
      fail: function(res) {
        console.log('删除失败', res)
      }
    })
  },

  dbCheckBookActive: function(bid, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/users/",
      method: "GET",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
      },
      data: {
        sortby: "Id",
        order: "desc",
        fields: "Id",
        limit: 1,
        query: "Bid:" + bid,
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

  dbGetBookPhotos: function(callback) {
    this.dbGetPhotos("books", "bookphotos", callback)
  },

  dbDownloadOneFile: function(file1, callback) {
    var app = this
    var url2 = this.globalData.baseurl + "/birds/download?filename=" + file1
    var str1 = wx.getStorageSync(file1)
    if (str1.length > 0) {
      console.log("dbDownloadOneFile:from local")
      if (callback)
        callback(str1)
    } else {
      console.log("dbDownloadOneFile:from web")
      wx.downloadFile({
        url: url2,
        method: "GET",
        header: {
          "Cookie": "JSESSIONID=" + app.globalData.session_key,
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

  dbUploadUrl: function(url, callback) {
    var app = this
    app.globalData.shouldNotInit = true
    wx.downloadFile({
      url: url,
      method: "GET",
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
  dbGetItemComments: function(callback) {
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
        query: "Type:建议",
      },
      success: function(res) {
        if (res.data != null) {
          res.data.forEach(v => {
            comments.push(v)
          })
        }
        if (callback)
          callback(comments)
      }
    })
  },

  dbDeleteComment: function(id, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/itemcomments/" + id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      success: function(res) {
        console.log('删除成功', res)
        app.globalData.dirty["comments"] = true
        if (callback) callback()
      },
      fail: function(res) {
        console.log('删除失败', res)
      }
    })
  },

  dbNewUser: function(name, phonenum, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/birds/",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      method: "GET",
      data: {
        type: 2,
        "CreateDate": util.formatTimeForDB(new Date()),
        'Name': name,
        'Phonenumber': phonenum,
      },
      success: function(res) {
        if (callback)
          callback()
      },
      fail: function(res) {
        console.log('错误' + ':' + res)
      }
    })
  },

  dbDeleteUser: function(id, callback) {
    var app = this
    wx.request({
      url: app.globalData.baseurl + "/users/" + id,
      method: "DELETE",
      header: {
        "Cookie": "JSESSIONID=" + app.globalData.session_key,
        "Content-Type": "application/json"
      },
      success: function(res) {
        console.log('删除用户成功', res)
        app.globalData.dirty["users"] = true
        if (callback) callback()
      },
      fail: function(res) {
        console.log('删除用户失败', res)
      }
    })
  },

  globalData: {
    baseurl: "https://www.wootec.cn:8084/v1",
    shouldNotInit: false, //for bug:http://blog.it2048.cn/article-wxmini-bug/
    wxcode: "",
    userInfo: null,
    openid: '',
    session_key: '',
    isuser: false,
    userid: 0,
    ready: false,
    users: {},
    books: {},
    items: {},
    dirty: {},
    locked: {},
    callbacks: {},
    maxjobs: 8,
    systemInfo: null,
  }
})