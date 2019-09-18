var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    currentTab: 0,
    count: 0,

    //用于存放本地图片路径
    imageList: [],
    //用于存放服务器路径
    imageList2: [],
    itemname: "",
    itemdescription: "",
    items2: [],
    books2_search: [],
    books2_new: [],
    booksIndex_new: 0,
    booksIndex_search: 0,
    itemphoto_new: "",
    explainbyphoto: false,
  },

  onShow: function(options) {
    var that = this
    if (!app.globalData.ready) {
      console.log("wait")
      setTimeout(function() {
        that.onShow()
      }, 1000)
    } else {
      this.reloadData()
    }
  },

  init: function() {
    this.data.books2_search = []
    this.data.books2_new = []
    for (var key in app.globalData.books) {
      var v = app.globalData.books[key]
      if (v.Status <= 50)
        this.data.books2_search.push(v)
      if (v.Status == 0)
        this.data.books2_new.push(v)
    }

    this.data.items2 = []

    for (var key in app.globalData.items) {
      var v = app.globalData.items[key]
      v.Bookname = app.globalData.books[v.Bid].Name
      this.data.items2.unshift(v)
    }
    this.setData({
      items2: this.data.items2,
      books2_search: this.data.books2_search,
      books2_new: this.data.books2_new,
    })
  },

  callbackCount: function() {
    this.data.count++
      if (this.data.count == 2) {
        this.init()
      }
  },

  callInittBookPhotos: function() {
    app.dbGetBookPhotos(this.callbackCount)
  },

  reloadData: function() {
    this.data.count = 0
    console.log("itemadmin, reloadData....")
    app.dbGetItems(this.callbackCount)
    app.dbGetBooks(this.callInittBookPhotos)

  },

  chooseImage_newitem: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function(res) {
        if (res.tempFiles[0].size >= 2 * 1024 * 1024) {
          util.showHintBad("照片大于2M!")
          return
        }

        if (res.tempFilePaths.length != 1) {
          util.showHintBad("请添加照片!")
          return
        }
        if (that.data.imageList.length > 2) {
          util.showHintBad("最多三张照片!")
          return
        }
        that.data.imageList[that.data.imageList.length] = res.tempFilePaths[0]
        that.setData({
          imageList: that.data.imageList,
        })
      }
    })
  },

  chooseImage_newitem2: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function(res) {
        if (res.tempFiles[0].size >= 2 * 1024 * 1024) {
          util.showHintBad("照片大于2M!")
          return
        }

        if (res.tempFilePaths.length != 1) {
          util.showHintBad("请添加照片!")
          return
        }
        that.setData({
          itemphoto_new: res.tempFilePaths[0],
        })
      }
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  itemnew_formSubmit: function(e) {
    var that = this
    var v = e.detail.value

    if (v.name.length < 1) {
      util.showHintBad("输入不完整")
      return
    }
    if (that.data.explainbyphoto) {
      if (that.data.itemphoto_new.length == 0) {
        util.showHintBad("输入不完整")
        return
      }
    } else {
      if (v.description.length < 5) {
        util.showHintBad("输入不完整")
        return
      }
    }
    that.data.itemname = v.name
    that.data.itemdescription = v.description
    that.data.imageList2 = []

    app.dbCheckDuplicateItem(v.name, that.itemnew_formSubmit_step2)
  },

  itemnew_formSubmit_step2: function(duplicate) {
    var that = this
    if (duplicate) {
      util.showHintBad("词条重复")
      return
    }
    //现在开始更新
    if (that.data.explainbyphoto) {
      app.dbUploadFile(that.data.itemphoto_new, that.itemnew_formSubmit_step3)
    } else {
      that.itemnew_formSubmit_step3(null);
    }
  },

  itemnew_formSubmit_step3: function(data) {
    var that = this
    if (that.data.explainbyphoto) {
      that.data.itemdescription = data
    }
    if (that.data.imageList.length > 0) {
      for (var f in that.data.imageList) {
        app.dbUploadFile(that.data.imageList[f], that.itemnew_formSubmit_step4)
      }
    } else {
      that.itemnew_formSubmit_step4(null);
    }

  },

  itemnew_formSubmit_step4: function(data) {
    var that = this
    if (data != null) {
      that.data.imageList2[that.data.imageList2.length] = data;
      if (that.data.imageList2.length < that.data.imageList.length)
        return
    }
    app.dbNewItem(
      that.data.books2_new[that.data.booksIndex_new].Id,
      that.data.itemname,
      that.data.itemdescription,
      that.data.imageList2.join(';'),
      function() {
        util.showHint('添加词条成功')
        app.globalData.dirty["items"] = true
        that.setData({
          itemname: "",
          itemdescription: "",
          imageList: [],
          explainbyphoto: false,
          itemphoto_new: "",
        })
        that.reloadData()
      })

  },

  itemnew_formReset: function(e) {
    this.setData({
      itemname: "",
      itemdescription: "",
      imageList: [],
      itemphoto_new: "",
      explainbyphoto: this.data.explainbyphoto,
    })
  },

  pickerBooksChange: function(e) {
    this.data.booksIndex_new = parseInt(e.detail.value)
    this.setData({
      booksIndex_new: parseInt(e.detail.value)
    })
  },

  pickerBooksChange2: function(e) {
    this.data.booksIndex_search = parseInt(e.detail.value)
    this.setData({
      booksIndex_search: parseInt(e.detail.value)
    })
  },

  clickItem: function(e) {
    if (e.target.dataset.iid)
      wx.navigateTo({
        url: '../itemdetail/itemdetail?itemid=' + e.target.dataset.iid,
      })
  },

  itemsearch_formSubmit: function(e) {
    app.globalData.dirty["items"] = true

    if (e.detail.value.search.length < 1) {
      app.dbGetItems2("bid:" + this.data.books2_search[this.data.booksIndex_search].Id, this.init)
    } else {
      var r = /^\+?[1-9][0-9]*$/; //正整数
      if (r.test(e.detail.value.search))
        app.dbGetItems2("id:" + e.detail.value.search, this.init)
      else
        app.dbGetItems2("name__contains:" + e.detail.value.search, this.init)
    }
  },

  checkboxChange: function(e) {
    if (e.detail.value.length > 0)
      this.setData({
        explainbyphoto: true
      })
    else
      this.setData({
        explainbyphoto: false
      })
  },

  swiperTab: function(e) {
    var that = this
    that.setData({
      currentTab: e.detail.current
    })
  },

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