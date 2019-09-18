const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    currentTab: 0,
    book2: null,
    limit: 0,
    mottosi: -1,
    punchsummary: {},
    mottos: [
      "To be both a speaker of words and a doer of deeds.",
      "既当演说家，又做实干家。",
      "Variety is the spice of life.",
      "变化是生活的调味品。",
      "Bad times make a good man. ",
      "艰难困苦出能人。",
      "There is no royal road to learning.",
      "求知无坦途。",
      "Doubt is the key to knowledge.",
      "怀疑是知识的钥匙。",
      "The greatest test of courage on earth is to bear defeat without losing heart.",
      "世界上对勇气的最大考验是忍受失败而不丧失信心。",
      "A man's best friends are his ten fingers.",
      "人最好的朋友是自己的十个手指。",
      "Only they who fulfill their duties in everyday matters will fulfill them on great occasions.",
      "只有在日常生活中尽责的人才会在重大时刻尽责。",
      "The shortest way to do many things is to only one thing at a time.",
      "做许多事情的捷径就是一次只做一件事。",
      "Sow nothing, reap nothing.",
      "春不播，秋不收。",
      "Life is real, life is earnest.",
      "人生真实，人生诚挚。",
      "Life would be too smooth if it had no rubs in it.",
      "生活若无波折险阻，就会过于平淡无奇。",
      "Life is the art of drawing sufficient conclusions form insufficient premises.",
      "生活是一种艺术，要在不充足的前提下得出充足的结论。",
      "Life is fine and enjoyable, yet you must learn to enjoy your fine life.",
      "人生是美好的，但要学会如何享用美好的生活。",
      "Life is but a hard and tortuous journey.",
      "人生即是一段艰难曲折的旅程，人生无坦途。",
      "Life is a horse, and either you ride it or it rides you.",
      "人生像一匹马，你不驾驭它,它便驾驭你。",
      "Life is a great big canvas, and you should throw all the paint on it you can.",
      "人生是一幅大画布，你应该努力绘出绚丽多彩的画面。",
      "Life is like music. It must be composed by ear, feeling and instinct, not by rule.",
      "人生如一首乐曲，要用乐感，感情和直觉去谱写，不能只按乐律行事。",
      "Life is painting a picture, not doing a sum.",
      "生活是绘画，不是做算术。",
      "The wealth of the mind is the only wealth.",
      "精神的财富是唯一的财富。",
      "You can't judge a tree by its bark.",
      "人不可貌相。",
      "Sharp tools make good work.",
      "工欲善其事，必先利其器。",
      "Wasting time is robbing oneself.",
      "浪费时间就是掠夺自己。",
      "Nurture passes nature.",
      "教养胜过天性。",
      "There is no garden without its weeds.",
      "没有不长杂草的花园。",
      "A man is only as good as what he loves.",
      "一个人要用他所爱的东西有多好来衡量。",
      "Wealth is the test of a man's character.",
      "财富是对一个人品格的试金石。",
      "The best hearts are always the bravest.",
      "心灵最高尚的人，也总是最勇敢的人。",
      "One never lose anything by politeness.",
      "讲礼貌不吃亏。",
      "There's only one corner of the universe you can be sure of improving, and that's your own self.",
      "这个宇宙中只有一个角落你肯定可以改进，那就是你自己。",
      "The world is like a mirror: Frown at it and it frowns at you; smile, and it smiles too.",
      "世界犹如一面镜子：朝它皱眉它就朝你皱眉，朝它微笑它也吵你微笑。",
      "Death comes to all, but great achievements raise a monument which shall endure until the sun grows old.",
      "死亡无人能免，但非凡的成就会树起一座纪念碑，它将一直立到太阳冷却之时。",
      "The reason why a great man is great is that he resolves to be a great man.",
      "伟人之所以伟大，是因为他立志要成为伟大的人。",
      "Suffering is the most powerful teacher of life.",
      "苦难是人生最伟大的老师。",
      "A bosom friend afar brings a distant land near.",
      "海内存知己，天涯若比邻。",
      "A common danger causes common action.",
      "同舟共济。",
      "A contented mind is a continual / perpetual feast.",
      "知足常乐。",
      "A fall into the pit, a gain in your wit.",
      "吃一堑，长一智。",
      "A guest should suit the convenience of the host.",
      "客随主便。",
      "A letter from home is a priceless treasure.",
      "家书抵万金。",
      "All rivers run into the sea.",
      "殊途同归。",
      "All time is no time when it is past.",
      "机不可失，时不再来。",
      "An apple a day keeps the doctor away.",
      "一日一个苹果，身体健康不求医。",
      "As heroes think, so thought Bruce.",
      "英雄所见略同。",
      "A young idler, an old beggar.",
      "少壮不努力，老大徒伤悲。",
      "Behind the mountains there are people to be found.",
      "天外有天，山外有山。",
      "Bad luck often brings good luck.",
      "塞翁失马，安知非福。",
      "Business is business.",
      "公事公办。",
      "Clumsy birds have to start flying early.",
      "笨鸟先飞。",
      "Do one thing at a time, and do well.",
      "一次只做一件事，做到最好！",
      "Custom makes all things easy.",
      "习惯成自然。",
      "Desire has no rest.",
      "欲望无止境。",
      "Difficult the first time, easy the second.",
      "一回生，二回熟。",
      "Do not change horses in mid-stream.",
      "别在河流中间换马。",
      "Do not have too many irons in the fire.",
      "贪多嚼不烂。",
      "Do not teach fish to swim.",
      "不要班门弄斧。",
      "East or west, home is the best.",
      "东奔西跑，还是家里好。",
      "Experience is the best teacher.",
      "实践出真知。",
      "Faith can move mountains.",
      "精诚所至，金石为开。",
      "First impressions are half the battle.",
      "先入为主。",
      "Good wine needs no bush.",
      "酒香不怕巷子深。",
      "Haste makes waste.",
      "欲速则不达。",
      "He that promises too much means nothing.",
      "轻诺者寡信。",
      "He who has an art has everywhere a part.",
      "一招鲜，吃遍天。",
      "He would climb the ladder must begin at the bottom.",
      "千里之行始于足下。",
      "Home is where the heart is.",
      "心在哪里，哪里就是家。",
      "If you are not inside a house, you don not know about its leaking.",
      "不在屋里，不知漏雨。(亲身经历才有体会。)",
      "It is never too late to mend.",
      "亡羊补牢，犹未为晚。",
      "It six of one and half a dozen of the other.",
      "彼此彼此。",
      "Just has long arms.",
      "天网恢恢，疏而不漏。",
      "Keep something for a rainy day.",
      "未雨绸缪。",
      "Life is a span.",
      "人生如朝露。",
      "Man proposes, God disposes.",
      "谋事在人，成事在天。",
      "Meet plot with plot.",
      "将计就计。",
      "Merry meet, merry part.",
      "好聚好散。",
      "Mind acts upon mind.",
      "心有灵犀一点通。",
      "Never hit a man when he is down.",
      "不要落井下石。",
      "Never judge by appearances.",
      "切莫以貌取人。",
      "No fire without smoke.",
      "无风不起浪。",
      "Nurture passes nature.",
      "教养胜过天性。",
      "One is never too old to learn.",
      "活到老，学到老。",
      "One swallow does not make a summer.",
      "一燕不成夏。(一花独放不是春。)",
      "One who has seen the ocean thinks nothing of mere rivers.",
      "曾经沧海难为水。",
      "Out of sight, out of mind.",
      "眼不见，心不烦。",
      "Practice makes perfect.",
      "熟能生巧。",
      "Poverty is stranger to industry.",
      "勤劳之人不受穷。",
      "Rome was not built in a day.",
      "罗马不是一日建成的。(伟业非一日之功。)",
      "Sense comes with age.",
      "老马识途。",
      "So many men, so many minds.",
      "人心各不同。",
      "Some thing is learned every time a book is opened.",
      "开卷有益。",
      "Strike while the iron is hot.",
      "趁热打铁。",
      "The car will find its way round the hill when it gets there.",
      "车到山前必有路。",
      "The heart is seen in wine.",
      "酒后吐真言。",
      "The worse luck now, the better another time.",
      "风水轮流转。",
      "Time tries all things.",
      "时间检验一切。",
      "Use legs and have legs.",
      "经常用腿，健步如飞。",
      "Virtue never grows old.",
      "美德常青。",
      "Walls have ears.",
      "隔墙有耳。",
      "What is done cannot be undone.",
      "覆水难收。",
      "Wine in, truth out.",
      "酒后吐真言。",
    ],
  },

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
    if (app.globalData.bookrecitals[app.globalData.currentBid] != undefined) {
      app.globalData.books[app.globalData.currentBid].Start = app.globalData.bookrecitals[app.globalData.currentBid].Start
      app.globalData.books[app.globalData.currentBid].Middle = app.globalData.bookrecitals[app.globalData.currentBid].Middle
      app.globalData.books[app.globalData.currentBid].Finished = app.globalData.bookrecitals[app.globalData.currentBid].Finished
    } else {
      app.globalData.books[app.globalData.currentBid].Start = 0
      app.globalData.books[app.globalData.currentBid].Middle = 0
      app.globalData.books[app.globalData.currentBid].Finished = 0
    }
    this.setData({
      mottosi: app.globalData.mottosi,
      book2: app.globalData.books[app.globalData.currentBid],
      limit: app.globalData.currentLimit,
      punchsummary: app.globalData.punchSummary,
    })
  },

  changeMotto: function(e) {
    app.globalData.mottosi = Math.floor(Math.random() * 100)
    this.setData({
      mottosi: app.globalData.mottosi,
    })
  },

  previewImage: function(e) {
    util.previewImage(e)
  },

  study: function(e) {
    var that = this
    if (!app.globalData.ready) {
      console.log("not ready")
      return
    }

    var str1 = wx.getStorageSync("itemrecitals2")
    if (str1.length > 0) {
      var itemrecitals2 = JSON.parse(str1)
      var len1 = Object.keys(itemrecitals2).length
      if (len1 > 0 && len1 == app.globalData.currentLimit) {
        wx.showModal({
          title: '提示',
          content: '已背完所有词条，需要再来一组吗？',
          success: function(sm) {
            if (sm.confirm) {
              console.log('用户点击确认')
              app.dbReset()
              setTimeout(function() {
                wx.navigateTo({
                  url: '../item/item',
                })
              }, 1000)
            } else if (sm.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return
      }
    }
    wx.navigateTo({
      url: '../item/item',
    })
  },

  punchlist: function() {
    wx.navigateTo({
      url: '../punchlist/punchlist'
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