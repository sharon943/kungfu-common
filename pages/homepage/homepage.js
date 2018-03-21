    // pages/homepage/homepage.js
var app = getApp();
var url = require('../../utils/url.js');
var QQMapWX = require('../../map/qqmap-wx-jssdk.js');
var constant = require('../../utils/constant.js');
var qqmapsdk;
var bmap = require('../../libs/bmap-wx/bmap-wx.min.js');
var wxMarkerData = [];  //定位成功回调对象 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ak: "j7Pq2rUmzXNNN6OcD1dhOOYHIa1kCGn0", //填写申请到的ak  
    markers1: [],
    systWidth: 0,
    dataPro: {},
    shopPro: {},
    address: '',
    latitude: 0,
    longitude: 0,
    openId: null,
    isViewDisabled: true,
    isLoading2: false,
    isLoading1: false,
    isNotAddress: true,
    isAddress: 0,
    addressStorage: null,
    isLogin: 1,
    isAddressOne: true,
    isLocation: false,
    actictyText: '',
    loadingIMG:'',
    loadingView:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    app.globalData.isAddressOne = false
    console.log(app.globalData.openId)
    // app.globalData.openId = 'ok_ik5D74frPjP7__qJpBLG7KE - k'
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        var model = res.model.substring(0, res.model.indexOf("X")) + 'X';
        console.log(model)
        if (model == 'iPhone X') {
          console.log(123)
          console.log(app.globalData.isIpx)
          app.globalData.isIpx = true
          console.log(app.globalData.isIpx)
        }
        that.setData({
          systWidth: res.screenWidth
        })
      },
    })

    qqmapsdk = new QQMapWX({
      key: 'XI7BZ-SKAWX-MWO4Y-732EH-PW4ZH-UGBCM'
    });
    wx.request({
      url: url.getloadingImg,
      method: 'GET',
      success: function (res) {
        console.log(res)
        that.setData({
          loadingIMG: res.data.data,  
        })
        if(res.data.code!=200){
          that.setData({
            loadingView: false
          })
        }
        
        console.log(that.data.loadingIMG)
      },
      // fail:function(){
      //   that.setData({
        
      //   })
      // }
    })
    that.getAuthLocation();
    // that.setCacheData();
    // that.getLocationData();
    that.getOpenIdData();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;

    that.setData({
      isViewDisabled: true
    })
    
    // that.getUserInfoData();
    if (app.globalData.isAddressOne){
       
        wx.getStorage({
          key: 'LocationAddress',
          success: function (res) {
            console.log(res)

            that.setData({
              addressStorage: res.data,
              address: res.data.address,
              latitude: res.data.latitude,
              longitude: res.data.longitude
            })
            if (that.data.address.length>15){
              that.setData({
                address: res.data.address.substring(0,15)+'...',
              })
            }
            that.setCacheData(app.globalData.openId, res.data.city, app.globalData.JSESSIONID, res.data.latitude, res.data.longitude);
          },
          fail: function () {
            that.setData({
              isLoading2: true,
              isNotAddress: false,
              isAddress: 1
            })
          }
        })
    }else{
      if (that.data.isLocation){
        that.setData({
          isLoading2:false
        })
        that.getOpenIdData();
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '给您推荐一家美食餐厅哦！', // 分享标题
      desc: '给您推荐一家美食餐厅哦！', // 分享描述
      path: 'pages/homepage/homepage' // 分享路径
    }

  },

  getOpenIdData: function () {
    var openId;
    console.log(app.globalData.openId)
    if (app.globalData.openId) {
      
      openId = app.globalData.openId;
      this.setData({
        openId: app.globalData.openId
      })
      console.log(openId)
      this.getLocationData(openId);
    } else {
      app.openIdReadyCallback = res => {
        console.log(res);
        openId = res.openId
        console.log(openId)
        this.setData({
          openId: res.openId
        })

        this.getLocationData(openId);
      }

    }
  },
  getLocationData: function (openId) {
    var that = this;

    wx.getLocation({
      success: function (res) {
        console.log(res); 
        app.globalData.longitude = res.longitude;
        app.globalData.latitude = res.latitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          addressStorage: null
        })

        that.getCityAddress(openId, res.latitude, res.longitude)
      },
      fail:function(){
        that.setData({
          isLoading2: true,
          isLoading1: true,
          isNotAddress: false,
          isAddress: 1,
          address: '无法获取当前位置',
          isLocation: true
        })
      }
    })
  },
  getCityAddress: function (openId, latitude, longitude) {
    console.log(3872423)
    var that = this;
    var BMap = new bmap.BMapWX({
      ak: that.data.ak
    });

    var fail = function (res) {
      console.log(res);
      that.setData({
        isLoading1: true,
        isLoading2: true
      })
    };
    var success = function (data) {
      console.log(data)
      that.setCacheData(openId, data.originalData.result.addressComponent.city, app.globalData.JSESSIONID, latitude, longitude);
      //返回数据内，已经包含经纬度  
      // console.log(data);
      //使用wxMarkerData获取数据  
      wxMarkerData = data.wxMarkerData;
      //把所有数据放在初始化data内  
      that.setData({
        markers1: wxMarkerData,
        latitude: wxMarkerData[0].latitude,
        longitude: wxMarkerData[0].longitude,
        address: wxMarkerData[0].address,
      });
      if (wxMarkerData[0].address.length>15){
        that.setData({
          address: wxMarkerData[0].address.substring(0,15)+'...',
        });
      }
    }
    // 发起regeocoding检索请求   
    BMap.regeocoding({
      fail: fail,
      success: success
    });       

  },
  setCacheData: function (openId, city, JSESSIONID, latitude, longitude) {
    var that = this;
    wx.request({
      url: url.setCache,
      data: {
        cityName: city,
        openId: openId
      },
      method: 'POST',
      header: JSESSIONID ? { 'Cookie': 'JSESSIONID=' + JSESSIONID } : {},
      success: function (res) {
     console.log(res)

        app.globalData.cityName = city;
        app.globalData.JSESSIONID = JSESSIONID;
        that.getShopData(JSESSIONID, latitude, longitude);
        that.getPageData(JSESSIONID)
        that.getUserInfoData(JSESSIONID);
       
        //   that.getCacheData(JSESSIONID);

      }
    })
  },
  getPageData: function (JSESSIONID) {
    var that = this;


    wx.request({
      url: url.getBanner,
      data: {},
      method: 'POST',
      header: JSESSIONID ? { 'Cookie': 'JSESSIONID=' + JSESSIONID } : {},
      success: function (res) {
        console.log(res);
        // console.log('++++++++++++++++++++++++++++');
        if (res.data.status == 1) {
          console.log(that.data.loadingView)
          if (that.data.loadingView){
            setTimeout(function () {
              that.setData({
                dataPro: res.data.data,
                isLoading1: true
              })
            }, 1000)
          }else{
            
              that.setData({
                dataPro: res.data.data,
                isLoading1: true
              })
           
          }
          
         
          // var cookie = res.header['Set-Cookie'];
          // console.log(cookie);
          // var i = cookie.indexOf(';');
          // var cookies = cookie.substring(0,i);
          // var j = cookies.indexOf('=');
          // var cookies1 = cookies.substring(j+1,cookies.length - 1);
          // console.log(cookies1);
          // console.log(cookies);
          // console.log(i);
          // that.getCacheData(cookies1);
        }
        
        console.log(that.data.dataPro)
      }
    })
  },

  getCacheData: function (JSESSIONID) {
    var that = this;
    var cityName = 'cityName';
    wx.request({
      url: url.getCache,
      data: cityName,
      method: 'POST',
      header: JSESSIONID ? { 'Cookie': 'JSESSIONID=' + JSESSIONID } : {},
      success: function (res) {
        console.log(res);
      }
    })
  },

  getShopData: function (JSESSIONID, latitude, longitude) {
    var that = this;
    wx.request({
      url: url.getStoreId,
      data: {
        longitude: longitude,
        latitude: latitude,
      },
      method: 'POST',
      header: JSESSIONID ? { 'Cookie': 'JSESSIONID=' + JSESSIONID } : {},
      success: function (res) {
        console.log(res);
      
        
        if (res.data.status == 1) {
          // console.log('--------------------------383838838383833838383--------------');
          // console.log(res.data.data.storeId);
          app.globalData.shopId = res.data.data.storeId;
          app.globalData.extId = res.data.data.extId;
          console.log(res.data.data.iconPath)
          if (res.data.data.iconPath != undefined | res.data.data.iconPath != null) {
            app.globalData.iconPath = res.data.data.iconPath;
          } else {
            app.globalData.iconPath = ''
          }
          console.log(app.globalData.iconPath)
         
          that.setData({
            shopPro: res.data.data,
            isLoading2: true,
            isAddress: 0,
            isNotAddress: true,
   
          })
        }else{
          that.setData({
            isLoading2: true,
            isAddress: 1,
            isNotAddress: false
          })
        }

      }
    })
  },
  btn_shop: function (e) {
    
    var that = this;
    // that.getPageData(JSESSIONID);
    // console.log(that.data.dataPro + '123123123')
    var isAddress = that.data.isAddress;

    that.setData({
      isViewDisabled: false
    })
    if (that.data.isLogin == 1){

    if (isAddress == 1) {
      that.setData({
        isAddressOne: false
      })
      app.globalData.isAddressOne= false
      wx.navigateTo({
        url: '../menu/menu?typeNum=2',
        // url:'../detailUrl/detailUrl?jump=that.data.dataPro.jump'
      })

      return;
    }

    var shopId = that.data.shopPro.storeId;
    var item = that.data.dataPro.runBanner.item
    var item = e.currentTarget.dataset.item;
    var info = e.currentTarget.dataset.info;
    var address = that.data.address;
    console.log(that.data.dataPro.runBanner)
    if (e.currentTarget.dataset.info) {
      if (e.currentTarget.dataset.index == 3) {
        wx.navigateTo({
          url: '../coupon/coupon?typeNum=1&shopId=' + shopId + '&jump='+ '&address=' + address + '&latitude=' + that.data.latitude + '&longitude=' + that.data.longitude,
        })
        return;
      }
    }
    
    
    if (item.detailUrl == undefined | item.detailUrl == null | item.detailUrl == '') {
      wx.navigateTo({
        url: '../menu/menu?typeNum=1&shopId=' + shopId + '&jump=' + item.jump + '&address=' + address + '&latitude=' + that.data.latitude + '&longitude=' + that.data.longitude,
      })
    } else {
      wx.navigateTo({
        url: '../detailUrl/detailUrl?jump=' + item.jump
      })
    }
    console.log(item.jump)
   
    }else{

      wx.navigateTo({
        url: '../login/login',
      })
    }

  },

  btn_location: function () {
    var that = this;
    var latitude = that.data.latitude;
    var longitude = that.data.longitude;
    that.setData({
      isViewDisabled: false,
      
    })
    wx.navigateTo({
      url: '../searchAddress/searchAddress?latitude=' + latitude + '&longitude=' + longitude,
    })
  },
  btn_addres_confirm: function () {
    this.setData({
      isNotAddress: true
    })
  },
  getCeShi:function(num = 0){
    // console.log(11111);
    // console.log(num);
  },
  getUserInfoData: function (JSESSIONID) {
    var that = this;

    wx.request({
      url: url.getUserInformation,
      data: {

      },
      method: 'POST',
      header: JSESSIONID ? { 'Cookie': 'JSESSIONID=' + JSESSIONID } : {},
      success: function (res) {
        // console.log(res);

       if (res.data.status == 1) {
          //   res.data.data.nickName = res.data.data.nickName.replace(/(.{3}).*(.{4})/, "$1****$2");
          // console.log('---------------------');
          that.getMemberInformation(res.data.data.phone);
          app.globalData.phone = res.data.data.phone;
          that.setData({
            isLogin: 1
          })
        }else if(res.data.status == 2){

            that.setData({
              isLogin: -1
            })
        }
      }
    })
  },
  getMemberInformation: function (phone) {
    var that = this;
    // console.log(phone);
    wx.request({
      url: url.getMemberInformation + phone,
      data: {
        
      },
      header: {
        clientId: constant.clientId,
        brandId: constant.brandId,
        // openId: app.globalData.openId
      },
      success: function (res) {
        // console.log(res);

        if (res.data.code == 200) {

            app.globalData.memberId = res.data.data[0].id;

            that.getActivityData(app.globalData.memberId);
        }
      }
    })
  },
  getAuthLocation: function () {
    var that = this;
    wx.authorize({
      scope: 'scope.userLocation',
      success: function () {
        // console.log('+++成功+++++');
        //wx.startRecord()
      },
      fail: function () {
        // console.log('+++++++55555555+');
        wx.openSetting({
          success: function (res) {
            // console.log(res);
            if (res.authSetting['scope.userLocation']) {
              // console.log(res);
            } else {
              that.getAuthLocation();
            }
          },
          fail: function () {
            // console.log(1111);
          }
        })
      }
    })
  },
  //获取满减活动
  getActivityData: function (memberId) {

    var that = this;

    wx.request({
      url: url.getActivityLib + '/' + memberId,
      data: {},
      header: {
        clientId: constant.clientId,
        storeId: app.globalData.extId
      },
      success: function (res) {
        // console.log(res);

        if (res.data.code == 200) {
          if (res.data.data.length > 0) {
            
            that.setData({
              actictyText: res.data.data[0].ruleDetail
            })
            if (that.data.actictyText.length > 40) {
              that.setData({
                actictyText: res.data.data[0].ruleDetail.substring(0, 40) + '...'
              })
             
            }


          }

        }
      }
    })
  }
})