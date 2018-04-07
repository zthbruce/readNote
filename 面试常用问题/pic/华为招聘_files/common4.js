/** 大街网2017 */
var imgUrl = 'servlet/portal/attachment/{0}.jpg?dlType=ImageAttachment&attachmentType=PortalPicAttachment&attachmentId={0}';
var videoUrl = 'servlet/portal/attachment?dlType=ImageAttachment&attachmentType=PortalAttachment&attachmentId=';
var cardUrl = 'servlet/download?dlType=ImageAttachment&attachmentType=Portalcard&attachmentId=';


function getImgUrl(id) {
	var url = window.location.href;
	var http = "";
	if(url.indexOf("localhost")>0){
		http = 'http://nkweb-sit.huawei.com/reccampportal/';
	}
    return http + imgUrl.formatValue(encodeURIComponent(id));
}
function getVideoUrl(id) {
    return videoUrl + encodeURIComponent(id);
}
function getCardUrl(id){
	var url = window.location.href;
	var http = "";
	if(url.indexOf("localhost")>0){
		http = 'http://nkweb-sit.huawei.com/reccampportal/';
	}
    return http + cardUrl + encodeURIComponent(id);
}
Portal = {};




var queryData=function (data) {
	var strParam = new Array();
	if (typeof(data) !== "object") {
		return data;
	}

	function genQueryParam(data, path) {
		if ($.isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				if (typeof(data[i]) === "object")
					genQueryParam(data[i], path);
				else if (typeof(data[i]) === "string")
					strParam.push(path + "="+ data[i].encodeURI());
				else
					strParam.push(path + "=" + data[i]);
			}
		} else {
			for (var attr in data) {
				var attrValue = data[attr];
				var attrPath = path ? path + "." + attr : attr;
				if (attrValue && attrValue.getTimezoneOffset) {
					strParam.push(attrPath + ".time=" + (attrValue.getTime() - 8 * 60 * 60 * 1000 - attrValue.getTimezoneOffset() * 60 * 1000));
				} else if (typeof(attrValue) === "object") {
					genQueryParam(attrValue, attrPath);
				} else if (typeof(attrValue) === "string") {
					strParam.push(attrPath + "=" + encodeURIComponent(data[attr]).replace(new RegExp("%C2%A0", "gm"), "%20"));
				} else
					strParam.push(attrPath + "=" + data[attr]);
			}
		}
	}
	
	genQueryParam(data, "");
	strParam = strParam.join("&");
	return strParam;
}

function forwardUserCeneter()
{
	var url = getUserCenterUrl();
	var win = window;
	var loca = win['location'];
	loca.href=url;
}

/**
 * 个人中心地址
 * @returns {String}
 */
function getUserCenterUrl()
{
	var pth=window.location.href;
	pth = pth.substring(pth.indexOf("//")+2,pth.length);
	var path = pth.split("/");
	var http = "";
	if(path[0].indexOf("localhost")>=0){
		http = "http://";
	} else {
		http = "http://";// https --> http 
	}
	return http+path[0]+"/"+path[1]+"/portal4_index.html";
}
/**
 * 非个人中心地址
 * @param $
 */
function getHomeUrl()
{
	var pth=window.location.href;
	pth = pth.substring(pth.indexOf("//")+2,pth.length);
	var path = pth.split("/");
	var http = "";
	if(path[0].indexOf("localhost")>=0){
		http = "http://";
	} else {
		http = "http://";
	}
	return http+path[0]+"/"+path[1]+"/campus4_index.html";
}

(function($) {
    var currentLanguage = '';
    var baseUrl = window.location.href;  // zhangay
    var language = $('<span class="langueTarget"><li class="languageShow"></li><li class="languageHide"></li></span>');
    var showLanguage = language.find('.languageShow'), hideLanguage = language.find('.languageHide');
    var lang = {
        zh_CN : $('<a val="zh_CN" class="i18n" i18nKeyp="common.nav.campus.cn"></a>'),en_US : $('<a val="en_US" class="i18n"  i18nKeyp="common.nav.campus.en"></a>')
    };
    
    
    showLanguage.bind("click", function() {
    	
		    	var sp = [];
		     	// 判断点2
		    	if(baseUrl.indexOf('?language=en')>0){  // 如果链接路径内指明要进入英文环境
		    		headerinfo.curlanguage = 'en_US';
    	            currentLanguage = 'en_US';
    	            
		    		sp=baseUrl.split('?');
		    		window.location.href=sp[0];
		    	}else if(baseUrl.indexOf('?language=cn')>0){
		    	    headerinfo.curlanguage = 'zh_CN'; 
		    	    currentLanguage = 'zh_CN';	
		    	    
		    		sp=baseUrl.split('?');
		    		window.location.href=sp[0];    		   
		    	}else{
		    	   currentLanguage = headerinfo.curlanguage;   
		    	}     	
    	
                changeLanguage($(this).find('a').attr('val'));
                
            });
   /* hideLanguage.bind("click", function() {
    			ischangeLanguage=true;
                changeLanguage($(this).find('span').attr('val'));
                language.toggleClass("on");
            });*/
    var ischangeLanguage=false;
    function changeLanguage(currentLang) {
    	 $.ajax({
                    url : '/reccampportal/servlet/language',
                    type : 'post',
                    async : false,
                    data : {
                        switchTo : currentLang
                    },
                    success : function(data) {
                    	headerinfo.curlanguage=data;
                    	Portal.Campus4.forwardUrl(window.location.href.replace("language=", 'l='));
                    }
                        	 
        });
    }

    var initLanguage = function(id) {
    	// zhangay------------------------------------------------begin
	    	    function changeLanguage_s(currentLang) {
			    	 $.ajax({
			                    url : '/reccampportal/servlet/language',
			                    type : 'post',
			                    data : {
			                        switchTo : currentLang
			                    },
			                    success : function(data) {  
		                        	 //英文环境下隐藏实习生菜单
		                        	 if("en_US"==headerinfo.curlanguage){
		                        		// $("#300").parent().hide();
		                        	 }
      					    }           
			        });
			    }    	

	  	if(baseUrl.indexOf('?language')>0){
		      	// 判断点1
		    	if(baseUrl.indexOf('?language=en')>0){  // 如果链接路径内指明要进入英文环境
		    	    headerinfo.curlanguage = 'en_US';
		    	    currentLanguage = 'en_US';
	
				    changeLanguage_s(currentLanguage);
	
		    	}else if(baseUrl.indexOf('?language=cn')>0){
		    	    headerinfo.curlanguage = 'zh_CN'; 
		    	    currentLanguage = 'zh_CN'; 
		    	    changeLanguage_s(currentLanguage);
		    	}else{
		    	    currentLanguage = headerinfo.curlanguage;   
		    	    changeLanguage_s(currentLanguage);
		    	}   	
	    }else{
	    	      currentLanguage = headerinfo.curlanguage;   
	    	      changeLanguage_s(currentLanguage);
	    }			    
    	// zhangay------------------------------------------------end
    	
    	  if (currentLanguage === 'zh_CN') {
    	  	showLanguage.empty().append(lang.en_US);
            hideLanguage.empty().append(lang.zh_CN);
            
        } else {
            showLanguage.empty().append(lang.zh_CN);
            hideLanguage.empty().append(lang.en_US);
        }
      //   changeLanguage(currentLanguage);
        $(".son_ul").append(language);
        $(".hunterLanguage").append(language);
        $("title[i18nKeyp],label[i18nKeyp],.i18n").i18nKeyp(currentLanguage);
    };
    window.initLanguage = initLanguage;
    $.i18nCache = $.i18nCache || {};
	
    $.i18nKeyp = function(key, data) {
		if(currentLanguage==null||currentLanguage=="")
		{
			currentLanguage= headerinfo.curlanguage;
		}
		
    	if(currentLanguage==='zh_CN')
    	{
    		$("#logoRecruitmentA").removeClass("logoRecruitmenten");
    		$("#logoRecruitmentA").addClass("logoRecruitment");
    	}
    	else
    	{
    		$("#logoRecruitmentA").removeClass("logoRecruitment");
    		$("#logoRecruitmentA").addClass("logoRecruitmenten");
    	}
    	
        if (key && $.i18nCache[key] && $.i18nCache[key][currentLanguage]) {
            var str = $.i18nCache[key][currentLanguage];
            // 处理参数
            if (str && data) {
                str = str.replace(/\{([^}]+)\}/img, function(str, val) {
                            return data[val];
                        });
            }
            return str;
        }
        return key;
    };

    $.fn.i18nKeyp = function(language) {
        this.each(function(elem) {
                    var target = $(this);
                    var i18nKeyp = target.attr('i18nKeyp');
                    var htmlKeyp=target.attr('htmlKeyp');
                    if (i18nKeyp) {
                        var txt = $.i18nKeyp(i18nKeyp);
                        if (txt) {
                            target.text(txt);
                        }
                        if(htmlKeyp)
                        {
                        	 target.html(txt);
                        }
                        
                    }
                    
                    var tartitle= target.attr('title');
                    if(tartitle)
                    {
                    	 var txt = $.i18nKeyp(tartitle);
                        if (txt) {
                            target.attr("title",txt);
                        }
                        
                    }
                    
                    
                    
                });
        typeof(i18nKeyCallback) !== 'undefined' && i18nKeyCallback();
        return this;
    };
    
      $.fn.i18nKeypHtml = function(language) {
        this.each(function(elem) {
                    var target = $(this);
                    var i18nKeyp = target.attr('i18nKeyp');
                    if (i18nKeyp) {
                        var txt = $.i18nKeyp(i18nKeyp);
                        if (txt) {
                            target.html(txt);
                        }
                    }
                    
                    var tartitle= target.attr('title');
                    
                    
                });
        typeof(i18nKeyCallback) !== 'undefined' && i18nKeyCallback();
        return this;
    };
    
    var pageInit = function() {
        $("title[i18nKeyp],label[i18nKeyp],.i18n").i18nKeyp();
    };
    $(pageInit);

    $.jobFamilyIconCache = $.jobFamilyIconCache || {};

    $.jobFamilyIcon = function(jobFamily) {
        if (jobFamily && $.jobFamilyIconCache[jobFamily]) {
            return $.jobFamilyIconCache[jobFamily];
        }
        return '';
    };
    //语言切换
    $.changeLanguage = function(language){
    	changeLanguage(language);
    };
}(jQuery));


//jsTemplate.js
//A simple and fast javascript template engine.
//Copyright (c) 2014 HongBo Yuan
//https://github.com/hbyuan/jsTemplate
//email:hongbo_yuan@foxmail.com
(function() {
 'use strict';
 // js模板引擎
 function JsTemplate(templateId, templateContent) {
     if (!templateId) {
         throw 'argument error.';
     }
     if (!(this instanceof JsTemplate)) {
         return new JsTemplate(templateId, templateContent);
     }
     this.template = JsTemplate.templateCache[templateId];
     if (!this.template) {
         if (templateContent) {
             this.template = JsTemplate.compile(templateContent);
             JsTemplate.templateCache[templateId] = this.template;
         } else {
             throw 'template error. templateId:' + templateId;
         }
     }
 }
 // 是否启用调试
 JsTemplate.isDebug = false;
 // 逻辑语法规则
 JsTemplate.ANALYZE = /<%([\s\S]+?)%>/gm;
 // 编译后模板缓存
 JsTemplate.templateCache = {};
 // 合并属性
 JsTemplate.mix = function(target, source) {
     var key = null;
     for (key in source) {
         if (source.hasOwnProperty(key)) {
             target[key] = source[key];
         }
     }
     return target;
 };
 // 编译模板
 JsTemplate.compile = function(templateStr) {
     var match, lastIdx = 0, tmpl = templateStr, funcStr = 'var $html = "";with($data){', appendFuncStr = function(content, isHtml) {
         if (isHtml) {
             if (!/^[\s]+$/.test(content)) {
                 funcStr += ('$html+="' + content.replace(/"/mg, '\\"') + '";\n');
             }
         } else {
             content = content.replace(/&gt;/mg, '>').replace(/&lt;/mg, '<');
             if (content.indexOf('=') === 0) {
                 funcStr += ('$html+=' + content.substring(1) + ';\n');
             } else {
                 funcStr += (content.replace(/"/mg, '\\"') + '\n');
             }
         }
     };
     if (JsTemplate.isDebug) {
         funcStr += ';';
     }
     funcStr += 'var include = function(id,includeData){return JsTemplate(id).render(JsTemplate.mix($data,includeData));};';
     if (!tmpl) {
         return null;
     }
     tmpl = tmpl.replace(/[\r\n\t]/img, ' ');
     while (match = JsTemplate.ANALYZE.exec(tmpl)) {
         appendFuncStr(tmpl.substring(lastIdx === 0 ? 0 : lastIdx, match.index), true);
         appendFuncStr(match[1], false);
         lastIdx = (match.index + match[0].length);
     }
     appendFuncStr(tmpl.substring(lastIdx), true);
     appendFuncStr('} return $html;', false);
     return new Function('$data', funcStr);
 };
 // 对象方法
 JsTemplate.prototype = {
     render : function(data) {
         if (this.template) {
             return this.template.call(data, data);
         }
     }
 };
 // 导出函数
 window.JsTemplate = JsTemplate;
 // 导出函数
 if (typeof exports !== 'undefined') {
     exports.JsTemplate = JsTemplate;
 }
 if (typeof window !== 'undefined') {
     window.JsTemplate = JsTemplate;
 }
}());



Portal.Campus4 = {};
(function(p) {
	p.forward = function(url, callback) {
		if (url) {
			$("#portalContext").html("");
			window.location.hash = url;
			window.location.oldHash = "1";
		}
	};
	p.load = function(url, callback) {
		if (url) {
			$("#portalContext").html("");
			Portal.ajax({
				url : url,
				dataType : 'html',
				success : function(data) {
					$("#portalContext").html(data);
					$(".i18n").i18nKeyp();
					callback && callback();
				}
			});
		}
	};

	/**
	 * 获取图片
	 */
	p.imgCache = {};
	p.loadImg = function(typeName, formData) {
		if (!typeName || !formData) {
			return;
		}
		if (!Portal.Campus4.imgCache[typeName]) {
			var param = $.param(formData).replace(/%5B%5D/g, '');
			$.ajax({
				async : false,
				url : 'services/rec/portal/conf/ad/list?' + param,
				type : 'GET',
				success : function(data) {
					Portal.Campus4.imgCache[typeName] = data;
				}
			});
		}
		return Portal.Campus4.imgCache[typeName];
	};
	/**
	 * 获取信息发布
	 */
	p.releaseCache = {};
	p.loadRelease = function(typeName, formData) {
		if (!typeName || !formData) {
			return;
		}
		if (!Portal.Campus4.releaseCache[typeName]) {
			var param = $.param(formData).replace(/%5B%5D/g, '');
			$.ajax({
				async : false,
				url : 'services/rec/portal/conf/release/list/?' + param,
				type : 'GET',
				success : function(data) {
					Portal.Campus4.releaseCache[typeName] = data;
				}
			});
		}
		return Portal.Campus4.releaseCache[typeName];
	};
	/**
	 * BannerHide
	 */
	p.bannerHide = function(){
		var imgBanner = $(".GR_content .header_top", $("#portalContext"));
		imgBanner.hide();
	};
	/**
	 * Banner
	 */
	p.banner = function(bannerId) {
		var imgBanner = $(".GR_content .header_top", $("#portalContext"));
		var imgData = Portal.Campus4.loadImg("portalBanner" + bannerId, {
			adTypes : [ bannerId ],
			status : '1'
		});
		if (imgData && imgData.length > 0) {
			imgBanner.css("background-image", "url(" + getImgUrl(imgData[0].pictureAtttachId) + ")");
			imgBanner.css("background-color", "rgba(2, 2, 2, 2)");
			imgBanner.css("background-repeat", "no-repeat");
			imgBanner.css("background-attachment", "scroll");
			imgBanner.css("background-position", "50% 0px / auto");
			imgBanner.css("background-origin", "padding-box");
			imgBanner.css("background-clip", " border-box");
			if (imgData[0].adUrl) {
				imgBanner.bind('click', function() {
					window.location = imgData[0].adUrl;
				});
			}
		}
		imgBanner.show();
	};
})(Portal.Campus4);
(function($) {
	$.create = function(tag, css, id, type, style) {
		var dom = $(document.createElement(tag));
		css && dom.addClass(css);
		id && dom.id(id);
		type && dom.attr("type", type);
		style && dom.attr("style", style);
		return dom;
	};
}(jQuery));
(function(p) {
//	$.ajax({
//		async : false,
//		method : 'GET',
//		url : "/reccampportal/campus2/pages/template/dialog.html",
//		success : function(data) {
//			JsTemplate("portalDialog", data);
//		}
//	});
	/**
	 * 弹出框样式 add By HWX216151
	 */
	p.dialog = function(options) {
		var config = {
			id : "#contentPanel",
			title : $.i18nKeyp("common.label.select"),
			url : null,
			width : null,
			height : null,
			minHeight : 300,
			maxHeight : 556,
			popupUpStyle:(options.buttons && options.buttons.length > 0?"background:white;text-align:center;height:40px;padding-top:12px;padding-bottom:5px;":""),
			top : 0,
			fixY : 70,
			fixX : 20,
			showClose : true,
			buttons : [],
			fnLoad : null,
			fnAfterCallback : null
		};
		var settings = $.extend(config, options || {});
		var context = $(JsTemplate("portalDialog").render(settings));
		var factory = {
			context : context,
			info : function() {
				var that = this;
				if (!settings.showClose) {
					$("[type=closeButton]", that.context).hide();
				} else {
					$("[type=closeButton]", that.context).click(function() {
						that.close();
					});
				}
				that.loadContext();
				that.context.settings.fnLoad && that.context.settings.fnLoad.call(that);
				that.bindEventButtons();
				that.fnAfterCallback();
				this.center();
			},
			close : function() {
				var that = this;
				that.context.remove();
			},
			bindEventButtons : function() {
				var that = this;
				if (that.context.settings.buttons) {
					var thatButtons = that.context.settings.buttons;
					$.each($(".flootButton", that.context), function() {
						var index = $(this).attr("index");
						$(this).parent().parent().parent().click(function() {
							thatButtons[index].onClick && thatButtons[index].onClick.call(that);
						});
					});
				}
			},
			loadContext : function() {
				if (this.context.settings.url) {
					Portal.Common.showLoading();
					var thatContext = this.context;
					Portal.ajax({
						async : false,
						url : this.context.settings.url,
						dataType : 'html',
						success : function(data) {
							$(".x_window_co", thatContext).html(data);
							Portal.Common.hideLoading();
						}
					});
				}
			},
			fnAfterCallback : function() {
				var thatContext = this.context;
				new Drag("xWindowId", {
					mxContainer : "portalRootContext",
					Handle : "xWindowHandle",
					Limit : true,
					onStop: function(){}
				});
				var xWindow = $(".x_window", thatContext);
				xWindow.css("margin-left", -1 * (xWindow.width() / 2) + "px");
				// $(window).scroll(this.center);
				this.center();
				setTimeout(function() {
					thatContext.settings.fnAfterCallback && thatContext.settings.fnAfterCallback.call(thatContext);
				});
			},
			center : function() {
				var thatContext = this.context;
				/* 左右居中 */
				var xWindow = $(".x_window", thatContext);
				xWindow.css("margin-left", -1 * (xWindow.width() / 2) + "px");
				var oDiv = xWindow[0];
				if (!oDiv) {
					return;
				}
				/* 上下居中 */
				var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
				var top = parseInt((document.documentElement.clientHeight - oDiv.offsetHeight) / 2 + scrollTop);
				/*var windowHeight = $("#portalContext").height();
				if (top > windowHeight - oDiv.offsetHeight - 20) {
					top = windowHeight - oDiv.offsetHeight - 20;
				}*/
				top = top < 30 ? 30 : top;
				oDiv.style.top = top + "px";
			}
		};
		if($("#content")){
			$("#content").append(context);
		}else{
			$("#portalContext").append(context);
		}
		context.settings = settings;
		factory.info();
		return context;
	};
})(Portal.Campus4);


Portal.ajax = function(op) {
    if (op.error == null) {
        op.error = function(xhr, textStatus, errorThrown) {
            Portal.Common.hideLoading();
            //修改异常处理,hwx241216,2016-6-22
            try{
            	Jalor.Component.handleError(xhr.responseText,null,xhr,null,null);
            }catch(e){
            	//若不存在jalor对象,直接使用原处理情况,hwx241216
				  if (xhr && xhr.responseText) {
					  Portal.Common.hideLoading();
					  Portal.Campus4.loadingClose();
					  debugger;
				      if (xhr.responseText) {
				          //alert(JSON.parse(xhr.responseText).message);
				          Portal.Campus4.alert(JSON.parse(xhr.responseText).message);
				          if(xhr.readyState==4){
				        	 // history.back(-1);
				          }
				      } else
				          //alert(xhr.responseText);
				      	Portal.Campus4.alert(JSON.parse(xhr.responseText));
				  }
            }
        };
    }
    op.data=queryData(op.data);
    $.ajax(op);
};
Portal.Common = {};
var userinfo = {};
(function(p) {
	p.locationUrl = "";
	p.logout=function()
	{
		Portal.ajax({
			url:"servlet/logout",
			success:function()
			{
				var win = window;
				var loca = win['location'];
				loca.href = "http://" + loca.host + "/reccampportal";
//				window.location.reload();
			},
			error:function()
			{
				var win = window;
				var loca = win['location'];
				loca.href = "http://" + loca.host + "/reccampportal";
//				window.location.reload();
			}
			
		});
	};
	
	//获取当前地址
	p.getLocationUrl = function(){
		debugger;
		window.blackLocationUrl = window.location.href;
	};
	
	//切换中英文以后跳转到之前记录的地址
	p.gotoLocationUrl = function(){
		alert(p.locationUrl);
		window.location.reload();
		var win = window;
		var loc = win.location;
		loc.href = p.locationUrl;
		
	};
	
    p.showLoading = function() {
        var dtop = $(document).scrollTop();
        $("#portalloading").css("top", dtop);
        $("#portalloading").find("table").css("height", $(document.body).height());
        $("#portalloading").show();
    };

    p.hideLoading = function() {
        $("#portalloading").hide();
    };

    String.prototype.filterHtml = function() {
        var s = this;
        s = s.replace(/\\/g, "\\\\");
		
        s = s.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/\n/g, "<br>");
        return s;
    };
    String.prototype.filterAllHtml = function() {
        var s = this;

        s = s.replace(/&/g, "&amp;");
        s = s.replace(/"/g,"&quot;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        return s;
    };
    
    
    String.prototype.filterAllJS = function() {
        var s = this;
         s = s.replace(/\\/g, "\\\\");
        s = s.replace(/"/g, "\\\"");

        s = s.replace(/'/g, "\\\'");
      
        return s;
    };
    
    
    
    
    String.prototype.fliterLoc = function() {
        var jn = this.split("-");
        var rv = "";
        for (var i = 0; i < jn.length; i++) {
            if (i == 0) {
                rv += jn[i];
            } else if (jn[i] != null && jn[i] != "") {
                rv += "-" + jn[i];
            }
        }
        return rv;
    }
    
	p.checkuserishw=function()
	{ 
		//屏蔽（简历完善的）公共账号resume1, 不能访问个人中心，但是可以维护简历
		if(!userinfo.hwemp){
		    if(userinfo.userAccount == 'resume1'){
		    	try{
					var curUrl = location.href;
					if (curUrl.indexOf("portal2_nonvindex.html?id=") > -1
							&& (curUrl.indexOf("regDetailDoctor.html") > -1 || curUrl
									.indexOf("regDetailSchool.html") > -1)) {
					} else {
						return true;
					}
			    }catch(e){
			    }
		    }
		}
		//如果是测试环境则范围true
		var win = window;
		var loca = win['location'];
		if(loca.href.indexOf("localhost.huawei.com") > 0){
			return false;
		}
		return userinfo.hwemp;
	};
	window.portalGetUserTypeTime = 0;
	window.portalUserType = 0;
	/**
	 * 获取用户身份
	 */
	p.getUserType = function(){
		var flag = -1;
		var userAccount = "";
		var now = (new Date()).getTime();
		if(portalUserType != 0 && now - portalGetUserTypeTime < 5000) {
			return portalUserType;
		}
		
		if(window.headerinfo && headerinfo.user && headerinfo.user.userAccount){
			userAccount = headerinfo.user.userAccount;
		}
		if(userAccount){
			$.ajax({
			    async:false,
			    url:"services/portal/portaluser/getUserType?userAccount=" + userAccount,
			    data:"",
			    success : function(data){
			    	if(data){
			    		flag = data.userType;
			    	}
			    },
			    error : function(data){
			    	console.log(JSON.stringify(data));
			    	Portal.Campus4.alert(data);
			    }
			});
		}
		portalUserType = flag;
		portalGetUserTypeTime = now;
		return flag;
	};
	/**
	 * 用户身份切换
	 */
	p.changeUserType = function(type){
		var flag = -1;
		$.ajax({
		    async:false,
		    type:"POST",
		    url:"services/portal/portaluser/userTypeChange/"+type,
		    data:{changeType:type,userAccount:headerinfo.user.userAccount},
		    success : function(data){
		    	if(data){
		    		flag = data.userType;
		    	}
		    },
		    error : function(data){
		    	Portal.Campus4.alert(JSON.stringify(data));
		    }
		});
		return flag;
	};
	var lookupCache = {};
	p.getlookupMap = function(classifyCode,code){
		var data = [];
		if(!lookupCache[classifyCode]){
			var url="services/rec/portal/conf/findLookupItemList/"+classifyCode;
			$.ajax({
				url  : url,
				type : 'GET',
				async:false,
				success : function(dataResult) {
					data = dataResult;
				}
			});
			lookupCache[classifyCode] = data;
		}
		var obj = {};
		if(data && data.length>0){
			var language = headerinfo.curlanguage;
			if(language == 'zh_CN') {}
			for(var i=0;i<data.length;i++){
				obj[data[i].itemCode] = (language == 'zh_CN'?data[i].itemName:data[i].itemDesc);
			}
		}
		return obj[code]||'';
	};
	//name模块，
	function getModelNameByCode(code){
		if(code == 'project'){
			return $.i18nKeyp("Resume.project.projects");//项目经历
		} else if(code == 'contact'){
			return $.i18nKeyp("Resume.project.newcontacts");//家庭成员
		} else if(code == 'huaweiContact'){
			return $.i18nKeyp("Resume.project.huaweiContacts");//华为亲属
		} else if(code == 'patent'){
			return $.i18nKeyp("Resume.baseinfo.PatentForInvention");//发明专利
		} else if(code == 'paper'){
			return $.i18nKeyp("Resume.baseinfo.PublishThesis");//发表论文
		} else if(code == 'edu'){
			return $.i18nKeyp("Resume.edu.education")+$.i18nKeyp("Resume.edu.HighAcademicToUndergraduate");//教育经历（从最高学历开始一直写到本科）
		} else if(code == 'language'){
			return $.i18nKeyp("Resume.language.languages")+$.i18nKeyp("portal.center.resume.requiredCNLanguage");//语言情况（中国籍英语必填）
		} else if(code == 'inten'){
			return $.i18nKeyp("Resume.baseinfo.intention");//工作意向
		}
	};
	/**
	 * 简历完整性校验
	 * validFlag: 
	 * 		00 意向地和教育经历为空
	 * 		01 意向地为空、教育经历不为空
	 * 		10 意向地不为空、教育经历为空
	 * 		11 意向地不为空、教育经历不为空
	 */
	p.validResumeIntegrity = function(validType){
		debugger;
		if(!(window.headerinfo && headerinfo.user && headerinfo.user.userAccount)){
			return false;
		}
		var validResume = {success : '0', msg : "No login!", validFlag : ""};
		$.ajax({
		    async:false,
		    type:"POST",
		    url:"services/portal/portaluser/validResumeIntegrity",
		    contentType: 'text/json',
		    data:JSON.stringify({validType:validType,userAccount:headerinfo.user.userAccount}),
		    success : function(data){
		    	if(data){
		    		validResume.success = data.success;
		    		validResume.validFlag = data.validFlag;
		    		validResume.msg = data.msg;
		    	}
		    },
		    error : function(data){
		    	Portal.Campus4.alert(JSON.stringify(data));
		    }
		});
		debugger;
		if(validResume.success == '1') {
			/*var i18nkey = '', url='/reccampportal/portal4_index.html#portal/usercenter4/resumeManager/resumeManager.html?validFlag=validResume.validFlag';
			// 00 意向地和教育经历为空
			if(validResume.validFlag == '00') {
				i18nkey = "portal.joblist.jobApply.error.noEduAndPre";
			} 
			// 01 意向地为空、教育经历不为空
			else if(validResume.validFlag == '01') {
				i18nkey = "portal.joblist.jobApply.error.noPre";
			}
			// 10 意向地不为空、教育经历为空
			else if(validResume.validFlag == '10') {
				i18nkey = "portal.joblist.jobApply.error.noEdu";
			}
			if(validResume.validFlag != '11'){
				Portal.Campus4.confirm($.i18nKeyp("Resume.detail.completeEdu"),'',function(isYes){
					if(isYes){
						Portal.Campus4.forwardUrl(url);
					}
				});
			} else {
				return true;
			}
			*/
			
			if(validResume.validFlag == 1){
				var result = "";
				var msg = validResume.msg;
				var infoArr = msg.split(",");
				if(infoArr && infoArr.length>0){
					for(var i=0;i<infoArr.length;i++){
						var info = infoArr[i].split(":");
						if(info && info.length>1){
							var modelCode = info[0];
							var errCode = info[1];
							if(errCode == 1){
								result = result + getModelNameByCode(modelCode) + "、";
							}
						}
					}
				}
				if(result.length>0){
					result = result.substring(0,result.length-1);
					//Portal.Campus4.alert("您的简历不完整，请先完善必填项："+result+"，再申请职位。");		
					Portal.Campus4.confirm($.i18nKeyp("portal.jobDetail.integrity.valid").replace("{0}",result),'',function(isYes){
						if(isYes){
							Portal.Campus4.forwardUrl('/reccampportal/portal4_index.html#portal/usercenter4/resumeManager/resumeManager.html');
						}
					});
					return false;
				}
			}
		} else {
			Portal.Campus4.alert(JSON.stringify(validResume.msg));
			return false;
		}
		return true;
	};
	p.validResumeEdu = function(){
		if(!(window.headerinfo && headerinfo.user && headerinfo.user.userAccount)){
			return false;
		}
		var validFlag = "";
		$.ajax({
		    async:false,
		    type:"POST",
		    url:"services/portal/portaluser/validResumeEdu",
		    contentType: 'text/json',
		    data:JSON.stringify({userAccount:headerinfo.user.userAccount}),
		    success : function(data){
		    	if(data){
		    		validFlag = data;
		    	}
		    },
		    error : function(data){
		    	Portal.Campus4.alert(JSON.stringify(data));	
		    }
		});
		if(validFlag){
			var url='/reccampportal/portal4_index.html#portal/usercenter4/resumeManager/resumeManager.html';
			Portal.Campus4.confirm($.i18nKeyp("Resume.detail.completeEdu"),'',function(isYes){
				if(isYes){
					Portal.Campus4.forwardUrl(url);
				}
			});
		}else{
			return true;
		}
		return false;
	};
    String.prototype.fliterFamily = function() {
        var str = this.replace(/族$/mg, '').replace(/Family$/img, '');
        return str;

    };
    
    p.arrayContain=function(arry,str)
    {
    	 for (var i = 0; i < arry.length; i++) {
            if (arry[i]==str) {
               return true;
            }
        }
        return false;
    }

    p.ArrayRemove = function(arry, ind) {
        var newArry = [];
        for (var i = 0; i < arry.length; i++) {
            if (i != ind) {
                newArry.push(arry[i]);
            }
        }
        return newArry;
    };
    var loginpath = "";
    var loginflag = false;
    p.getLoginPath = function() {
        return  "loginIndex?redirect=" + window.location.href;
    };
    p.getLoginflag = function() {
        return loginflag;
    };
    
    
    p.languageRender =function(value) {
        if (value == null) {
            return "";
        };
        var nameLanguage = value.split(",");
        var language = headerinfo.curlanguage;
        for (var i = 0; i < nameLanguage.length; i++) {
            var lang = nameLanguage[i].split("=");
            if (lang.length > 1 && lang[0] == language) {
                return lang[1];
            }
        };
        return value;
    };
    
    /**
     * 中文/英文
     */
    p.languageRender2 =function(value) {
        if (value == null) {
            return "";
        };
        var nameLanguage = value.split("/");
        var language = headerinfo.curlanguage;
        if(language == 'zh_CN' && nameLanguage.length > 0) {
        	return nameLanguage[0];
        } else if(language != 'zh_CN' && nameLanguage.length > 1){
       		 return nameLanguage[1];
        }
        return value;
    };

    /**
     * 加载弹出框
     * 
     * @param {}
     *            op
     * @return {}
     */
    p.dialog = function(op) {
        var diag = $("#diag");
        var title = "";
        diag.addClass("dialog");
        if (op && op.width != null) {
            diag.width(op.width);
        }
        var bwidth = $(document.body).width();
        diag.css("left", (bwidth - 750) / 2);
        diag.html("<div style=\"width:100%;height:100%\"><iframe style=\"width:90%;height:90%\"></iframe><div>");
        var innerdiv = $("<div></div>");
        innerdiv.addClass("innerdialog");
        var titlediv = $("<div></div>");
        var titlevoer = $("<div></div>");
        titlevoer.addClass("titlevoer");

        titlediv.html(title);
        var headerdiv = $("<div></div>");
        headerdiv.addClass("dialogheader");
        headerdiv.append(titlediv);
        headerdiv.append(titlevoer);

        var closeddiv = $("<div></div>");
        if(op==null||op.noclose==null||typeof(op.noclose) == "undefined"){
        	closeddiv.addClass("diagclosediv");
        }else{
        	if(op.noclose){
        		closeddiv.addClass("dcontent");
        	}else{
        	    closeddiv.addClass("diagclosediv");
        	}
        }
        headerdiv.append(closeddiv);
        innerdiv.append(headerdiv);
        diag.append(innerdiv);
        $("#overbody").addClass("overbody");

        var contentdiv = $("<div></div>");
        contentdiv.addClass("dcontent");
        innerdiv.append(contentdiv);
        var dtop = $(document).scrollTop();
        $("#overbody").css("height", $(document).height());
        diag.css("top", dtop + 80);
        diag.show();
        var md = 0;
        var x = 0;
        var y = 0;
        var offset = null;
        titlevoer.mousedown(function(event) {
                    offset = diag.offset();
                    md = 1;
                    x = event.clientX;
                    y = event.clientY;

                });
        $(document).mouseup(function() {
                    md = 0;
                });

        $(document).mousemove(function(event) {
                    if (md == 1) {
                        diag.css({
                                    "top" : event.clientY - y + offset.top < 80 ? 80 : event.clientY - y + offset.top,
                                    "left" : event.clientX - x + offset.left
                                });
                    }
                });

        var dia = {
            setTitle : function(t) {
                title = t;
                titlediv.html(title);
            },
            close : function() {
                diag.hide();
                $("#overbody").removeClass("overbody");
                $("#overbody").css("height", 0);
            },
            setContent : function(content) {
                contentdiv.html(content);
            },
            loadurl : function(url, callback) {
                $.ajax({
                            url : url,
                            cache : false,
                            dataType : "html",
                            success : function(html) {
                                contentdiv.html(html);
                                $(".i18n").i18nKeyp();
                                callback();
                            }
                        });
            }

        };
        closeddiv.click(function() {
                    dia.close();
                });
        return dia;
    };

    /**
     * 格式化日期
     * 
     * @param {}
     *            v
     * @return {}
     */
    p.fomartDate = function(v) {
        if (v != null) {
            var i = v.indexOf("T");
            v = v.substring(0, i);
        }
        return v;
    };
    
    /**
	 * 根据lookup名称和itemcode还有语言获取lookup
	 */
	p.lookupValue = function(lookupName, itemCode, lang) {
		var result = "";
		var lookupList = p.lookupList(lookupName, lang);
		for (var i = 0; i < lookupList.length; i++) {
			if(itemCode == lookupList[i].itemCode){
				result = lookupList[i].itemName;
				break;
			}
		}
		return result;
	};
	
	/**
	 * 根据lookup名称和语言获取lookup
	 */
	p.lookupList = function(lookupName, lang) {
		var result = [];
		var data = p.lookup(lookupName);
		for (var i = 0; i < data.length; i++) {
			if(lang == data[i].language){
				result.push(data[i]);
			}
		}
		return result;
	};
	
	/**
	 * 根据lookup名称和语言获取lookup,不区分语言
	 */
	p.lookup = function(lookupName) {
		if(p.lookupListCache[lookupName] && p.lookupListCache[lookupName] != null && p.lookupListCache[lookupName].length > 0){
			return p.lookupListCache[lookupName];
		}else{
			var result = [];
			$.ajax({
				url : 'services/portal/portalpub/list/lang/'+lookupName,
				type : 'GET',
				cache: true,
				async: false,
				dataType: 'json',
				success : function(data) {
					if(data != null){
						result = data;
					}
				}
			});
			p.lookupListCache[lookupName] = result;
			return result;
		}
	};
	//lookup客户端缓存,2017-2-28,hwx241216
	p.lookupListCache = {};
	
	//获取浏览器默认语言
	p.getBrowserLang = function(){
		var lang = "en_US";
		$.ajax({
			async : false,
			url : "/reccampportal/servlet/getHttpLanguage",
			type: "GET",
			success:function(data){
				if(data && data.length >= 2){//返回的http语言头必须大于2个字符,即包含cn或en,否则默认为en
					if(data.substring(0,2).toLocaleLowerCase() == "zh"){
						lang = "zh_CN";
					}
				}
			}
		}); 
		return lang;
	};
	
	
    /**
     * 初始化页头信息
     */
    p.initHeader = function(callback) {
    	$(".userInfo").html("");
        //initLanguage();   
        if (headerinfo.user == null || headerinfo.user == "null") {
            loginflag = false;
            // loginpath = "login_index.html?redirect=" + window.location.href;
            loginpath = "loginIndex?redirect=" + window.location.href;
            var registerpath = headerinfo.registerpath + "?method=toRegister&appurl=" + window.location.href;
             
            $(".userInfo").append("<span class=\"loginInfoLine\"></span><a class='plr_10' href=\"" + loginpath + "\">"+$.i18nKeyp("Job.login")+"</a><span class=\"loginInfoLine\"></span><a class='plr_10' href=\"" + registerpath + "\">"+$.i18nKeyp("Job.register")+"</a>");
            
            $(".right_b2").append('<div class=\"userInfo\"><a href="'+loginpath+'">'+$.i18nKeyp("Job.login")+'</a>|<a href="'+registerpath+'">'+$.i18nKeyp("Job.register")+'</a></div>');
            
            $(".right_b2").css({"text-align":"right"});
            $(".userInfo").append('<a class=\"ellipsis_add\" href="javascript:;" onclick="Portal.Common.forwardWorldWide()">'+$.i18nKeyp("common.nav.campus.language")+'</a>');
        } else {
            userinfo = headerinfo.user;
            userinfo.telphone = headerinfo.telphone;
            userinfo.telephoneTitle=headerinfo.telephoneTitle;
            userinfo.resumeId = headerinfo.resumeId;
            if(headerinfo.hwemp&&headerinfo.hwemp=="1")
        	{
        		userinfo.hwemp=true;
        	}
            loginflag = true;
            $(".userInfo").append("<span class=\"loginInfoLine\"></span>" +
            		"<a href=\"javascript:forwardUserCeneter()\">"+$.i18nKeyp("common.nav.portalIndex") + "</a>"+
            		"<a class='plr_10' href=\"javascript:forwardUserCeneter()\" class=\"userName\">Hi," + userinfo.userCN + "</a>" +
            		"<span class=\"loginInfoLine\"></span><a class='plr_10' style=\"padding:0\" href=\"javascript:Portal.Common.logout();\">"+$.i18nKeyp("Job.logout")+"</a>");
            
            $(".right_b2").append("<div class=\"userInfo\"><span class=\"loginInfoLine ellipsis_add\"></span><a class='plr_10 userName ellipsis_add' href=\"portal4_index.html#portal/usercenter4/resumeManager/resumeManager.html\">Hi," + userinfo.userCN + "</a>" +
            		"<span class=\"loginInfoLine\"></span><a class='plr_10 ellipsis_add bar' style=\"padding:0\" href=\"javascript:Portal.Common.logout();\">"+$.i18nKeyp("Job.logout")+"</a></div>");
            //语言 
            $(".userInfo").append('<a class=\"ellipsis_add bar\" style=\"width:32%;padding:0;\"  href="javascript:;" onclick="Portal.Common.forwardWorldWide()">'+$.i18nKeyp("common.nav.campus.language")+'</a>');
        }
        
        if (callback) {
            callback();
        }         
               
    };
    //转义url后面的参数
    p.forwardWorldWide = function(){
    	debugger;
    	var win = window;
		var loc = win.location;
    	var url = loc.href;
    	if (url.indexOf("worldwide")>0) {
    		loc.href = url;
		}else {
			url = encodeURIComponent(url.replace(/\./g, '@#@'));
			loc.href = '/reccampportal/campus4_index.html#campus4/pages/home/worldwide.html?redirect='+url;
		}
    };

    /**
     * 获取地址栏参数
     * 
     * @return {}
     */
    getParamers = function() {
    var query = window.location.href;
    var flagind=query.indexOf('?');
        var args = new Object();
        query = query.substring(flagind+1);
        if (query.length > 0) {
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1)
                    continue;
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                value = decodeURIComponent(value);
                args[argname] = value;
            }
        }
        return args;
    };
    p.getParamers = getParamers;

})(Portal.Common);

$.fn.loadPage = function(page,clickfn) {
    var totalPages = page.totalPages;
    this.append("<label class=\"textLabel\">"+$.i18nKeyp("Job.pagecount",["<span class=\"num\">" + page.totalRows + "</span>"])+"</label>");
    if (totalPages <= 1) {
        return;
    }
    var pagediv = $("<div class=\"pagesCon\"></div>");
    if (page.curPage == 1) {
        pagediv.append("<a class=\"on\"><span>" + 1 + "</span></a>");
    }else{
        pagediv.append($("<a><span><img src=\"images/pages/prev.png\"></span></a>").click(function() {
                    page.curPage -= 1;
                    if (page.curPage < 1) {
                        page.curPage = 1;
                    }
                    clickfn(page);
        }
        ));
        pagediv.append($("<a><span>1</span></a>").click(function() {
            page.curPage = 1;
            clickfn(page);
        }));
    }
    var showMinPage = page.curPage - 2;
    if (showMinPage < 2) {
        showMinPage = 2;
    }
    if (showMinPage > 2) {
        pagediv.append("...");
    }
    var showMaxPage = showMinPage + 5;
    if (showMaxPage > totalPages - 1) {
        showMaxPage = totalPages - 1;
    }
    for (var i = showMinPage; i <= showMaxPage; i++) {
        if (i == page.curPage) {
            pagediv.append("<a  class=\"on\"><span>" + i + "</span></a>");
        }else{
            (function(p) {
                pagediv.append($("<a><span>" + p + "</span></a>").click(function() {
	                page.curPage = p;
	                clickfn(page);
             }));
            })(i);

        }
    }
    if (showMaxPage < totalPages - 1) {
        pagediv.append("...");
    }
    if (page.curPage == totalPages) {
        pagediv.append("<a class=\"on\"><span>" + totalPages + "</span></a>");
    } else {
        pagediv.append($("<a><span>" + totalPages + "</span></a>").click(function() {
                    page.curPage = totalPages;
                    clickfn(page);
        }));
        pagediv.append($("<a><span><img src=\"images/pages/next.png\"></span></a>").click(function() {
            page.curPage += 1;
	        if (page.curPage > totalPages) {
	            page.curPage = totalPages;
	        }
	        clickfn(page);
        }));
    }
    this.append(pagediv);
};

//扩展分页方法争对于新版本的校招分页;add by zWX291074 at 2015-07-10
$.fn.loadPage4CampusNew = function(page,clickfnP) {
	var clickfn = function(page){
		clickfnP(page);
		// 设置页面置顶
	/*	document.documentElement.scrollTop = 0;
		document.body.scrollTop =0;*/
	};
    var totalPages = page.totalPages;
    if (totalPages <= 1) {
    	$(".pageCtrl").css("margin","0 0");
        return;
    } else {
    	$(".pageCtrl").css("margin","40px 0");
    }
    var pagediv = $("<div class='pageCtrl'></div>");
    if (page.curPage == 1) {
        pagediv.append("<div class='pageNumBtn select'>" + 1 + "</div>");
    }else{
    	var prePage = $.i18nKeyp("common.pre.page");
        pagediv.append($("<div class='prePage'>"+prePage+"</div>").click(function() {
            page.curPage -= 1;
            if (page.curPage < 1) {
                page.curPage = 1;
            }
            clickfn(page);
        }
        ));
        pagediv.append($("<div class='pageNumBtn'>1</div>").click(function() {
            page.curPage = 1;
            clickfn(page);
        }));
    }
    var showMinPage = page.curPage - 2;
    if (showMinPage < 2) {
        showMinPage = 2;
    }
    if (showMinPage > 2) {
        pagediv.append("...");
    }
    var showMaxPage = showMinPage + 5;
    if (showMaxPage > totalPages - 1) {
        showMaxPage = totalPages - 1;
    }
    for (var i = showMinPage; i <= showMaxPage; i++) {
        if (i == page.curPage) {
            pagediv.append("<div class='pageNumBtn select'>" + i + "<div>");
        }else{
            (function(p) {
                pagediv.append($("<div class='pageNumBtn'>" + p + "<div>").click(function() {
	                page.curPage = p;
	                clickfn(page);
             }));
            })(i);

        }
    }
    if (showMaxPage < totalPages - 1) {
        pagediv.append("...");
    }
    if (page.curPage == totalPages) {
        pagediv.append("<div class='pageNumBtn select'>" + totalPages + "</div>");
    } else {
        pagediv.append($("<div class='pageNumBtn'>" + totalPages + "</div>").click(function() {
                    page.curPage = totalPages;
                    clickfn(page);
        }));
        var nextPage = $.i18nKeyp("common.next.page");
        pagediv.append($("<div class='nextPage'>"+nextPage+"</div>").click(function() {
            page.curPage += 1;
	        if (page.curPage > totalPages) {
	            page.curPage = totalPages;
	        }
	        clickfn(page);
        }));
    }
    this.append(pagediv);
};

$.fn.checked = function() {
    var checked = $(this[0]).attr("checked");
    if (checked && checked == "checked") {
        return true;
    }
    return false;
};

/**
 * 加载表格
 * 
 * @param {}
 *            op
 */
$.fn.jobtable = function(op) {
    var lastclicks = null;
    var columns = op.colum;
    var elm = $(this);
    var jobtable;
    var tind = 0;
    var recorddata = [];
    var addRecord = [];
    if (op.pageSize == null) {
        op.pageSize = 10;
    }

    op.curPage = 1;
    //加载行数据
    function addRow(record, newFlag) {
        record.tindx = tind;
        var jobtr = $("<tr></tr>");

        for (var j = 0; j < columns.length; j++) {
            var value = "";
            if (record) {
                value = record[columns[j].id];
            }
            if (value == null) {
                value = "";
            }
            var dtd = $("<td class=\"" + columns[j].dataClass + "\"></td>");
            dtd.css({"word-break":"keep-all","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis" });
            
            
            if (columns[j].exdattr) {
                dtd.attr(columns[j].exdattr);
            }
            if (columns[j].isNo) {
                value = (tind + 1);
                jobtr.append(dtd.text(value));
            } else {
            	dtd.attr("title",value);
                if (columns[j].dataType) {
                    if (columns[j].dataType == "date") {
                        value = Portal.Common.fomartDate(value);
                    }
                }
                if (columns[j].render != null) {
                    value = columns[j].render(value, record);
                    jobtr.append(dtd.append(value));
                } else if (columns[j].editrender) {

                    value = columns[j].editrender(value, record);
                    jobtr.append(dtd.append(value));
                } else {
                    jobtr.append(dtd.text(value));
                }

            }

        }
        op.addRowBack && op.addRowBack(jobtr);
        jobtable.append(jobtr);
        if (newFlag) {
            record.addFlag = true;
            recorddata.push(record);
        }
        tind++;
    }
	//加载数据
    function loadtabledata(op, data) {

        tind = 0;
        jobtable = $("<table width=\"100%\" cellspacing=\"0\" class=\"listtable\" cellpadding=\"0\"></table>");
        jobtable.css({"table-layout": "fixed"});
        jobtable.addClass(op.tableClass);

        var jobthr = $("<tr></tr>");
        for (var i = 0; i < columns.length; i++) {
        	var theadth=$("<th class=\"" + columns[i].titleClass + "\"></th>").append($.i18nKeyp(columns[i].header));
            jobthr.append(theadth);
            if (columns[i].exhdattr) {
            	theadth.attr(columns[i].exhdattr);
            }
        }
        jobtable.append(jobthr);
        if (data&&data.length>0) {
            recorddata = data;
            for (var i = 0; i < data.length; i++) {
                addRow(data[i]);
            }
            jobtable.find("tr:even").addClass(op.trevenClass);
        }
        else
        {
        	var noDataTice=op.noDataNotice;
        	if(noDataTice)
        	{
        		jobtable.append("<tr><td colspan=\""+columns.length+"\" align=\"center\">"+$.i18nKeyp(noDataTice)+"</td></tr>");
        		
        	}
        	
        	
        }
        elm.html(jobtable);
        jobtable.find('tr').each(function() {
                    $(this).click(function() {
                                if (lastclicks != null) {
                                    lastclicks.find('td').removeClass("rowclick");
                                }
                                $(this).find('td').addClass("rowclick");
                                lastclicks = $(this);

                            });
                });
    }

    //加载表格
    function loadtable(op) {

        if (op.url) {
            var url = op.url + op.pageSize + "/" + op.curPage;
            if (op.noPage) {
                url = op.url;
            }
            Portal.ajax({
                        url : url,
                        cache : false,
                        dataType : "json",
                        data : op.condition,
                        success : function(rs) {
                        	Portal.Common.hideLoading();
                            if (op.noPage) {
                                loadtabledata(op, rs);
                            } else {
                                var list = rs.result;
                                var page = rs.pageVO;
                                loadtabledata(op, list);
                                if (op.noshowPage == null || !op.noshowPage) {
                                    if (page != null) {
                                        var pagedivem = elm;
                                        var pagediv = op.pagediv;
                                        if (pagediv != null) {
                                            pagedivem = $("#" + pagediv);
                                            pagedivem.html("");
                                        }
                                        pagedivem.loadPage(page, function(page) {
                                                    if (page != null) {
                                                        jQuery.extend(op, page);
                                                        loadtable(op);
                                                    }

                                                });
                                    }
                                }
                            }
                            op.loadBack && op.loadBack();
                        }
                    });
        } else {
            loadtabledata(op);
        }
    }

    loadtable(op);
    var mytable = {};
    (function(op) {
        mytable.reloadtable = function(conditon) {
            op.condition = conditon;
            op.curPage = 1;
            loadtable(op);
        };
    }(op));
    mytable.addRow = function() {
        var rd = {};
        addRow(rd, true);
    };
    mytable.getRecorddata = function() {
        return recorddata;
    };
    mytable.getAddData = function() {
        return addRecord;
    };
    mytable.deleteRecord = function(i) {
        recorddata = Portal.Common.ArrayRemove(recorddata, i);
        loadtabledata(op, recorddata);
    };
    mytable.getUpdata = function() {
        var batchvo = {};
        var adddata = [];
        var updata = [];
        for (var i = 0; i < recorddata.length; i++) {
            if (recorddata[i].addFlag) {
                adddata.push(recorddata[i]);
            }
            if (recorddata[i].upflag) {
                updata.push(recorddata[i]);
            }

        }
        batchvo.items2Create = adddata;
        batchvo.items2Update = updata;
        return batchvo;
    };

    return mytable;

};

$(Portal.Common.initHeader);



(function($) {
    var bannerTmpl = '<div class="topBanner"><%for(var i=0;i<data.length;i++){var d = data[i];%><div class="bannerImg" data-idx="<%=i%>"><a href="<%=d.adUrl?d.adUrl:"#"%>"><img src="<%=getImgUrl(d.pictureAtttachId)%>" width="1008px" height="206px" /></a></div><%}%></div>';
    var bannerBtnTmpl = '<div class="topBannerButton"><ul><%for(var j=0;j<data.length;j++){%><li data-idx="<%=j%>"><span></span></li><%}%></ul></div>';
    JsTemplate('topBanner', bannerTmpl + bannerBtnTmpl);
    var showBanner = function(dom) {
        var that = $(dom);
        var type = that.attr('data-type');
        if (!type) {
            return;
        }
        var currentShowIdx = -1;
        var maxShowIdx = 0;
        var showBanner = function() {
            currentShowIdx++;
            if (currentShowIdx >= maxShowIdx) {
                currentShowIdx = 0;
            }
            $(".topBannerButton li", that).removeClass('on');
            $(".topBannerButton li[data-idx='" + currentShowIdx + "']", that).addClass('on');

            $(".bannerImg", that).fadeOut();
            $(".bannerImg[data-idx='" + currentShowIdx + "']", that).fadeIn();

        };
        var intervalVal;
        $.ajax({
                    url : 'services/rec/portal/conf/ad/list',
                    data : {
                        adTypes : type
                    },
                    success : function(data) {
                        maxShowIdx = data.length;
                        that.html(JsTemplate('topBanner').render({
                                    data : data,
                                    getImgUrl : getImgUrl
                                }));
                        showBanner();
                        intervalVal = setInterval(showBanner, 5000);
                        $(".topBannerButton li", that).on('mouseover', function() {
                                    currentShowIdx = $(this).attr('data-idx') - 1;
                                    clearInterval(intervalVal);
                                    showBanner();
                                    intervalVal = setInterval(showBanner, 5000);
                                });
                    }
                });
    };
    $.fn.topBanner = function() {
        return this.each(function() {
                    showBanner(this);
                });
    };
}(jQuery));


/*******************************************************************************
 * 覆盖Jalor.Component.handleError ajaxSetup方法 添加错误日志ID
 */
try{
(function() {
	Jalor.UI.openFeedback=function(){
		if(Portal && Portal.Campus4){
			var options = {
				url : "campus4/pages/feedback/feedback.html",
				title : $.i18nKeyp("portal.feedback"),
				width : 700,
				height : 480,
				fnLoad : function() {
//					Portal.Campus4.Feedback.info();
				}
			};
			Portal.Campus4.dialog(options);
		}
	};
	Jalor.Component.handleError = function(responseText, textStatus, xhr, fnCallback, callbackParameter){
		//关闭主Loading框
		Jalor.UI.loadingClose();
		//Jalor.Core.log("Response Error Got:" + responseText +" Code:" +xhr.status);
		var i18nKey="jalor.common.message.systemExceptionError";
		var i18nMessage = $i18n(i18nKey);
		//返回JSON字符串，则解析之
		var fault =  Jalor.DataHelper.toJson(responseText);
		if(xhr.status == 403){		
			Jalor.Core.log("Before open session rebuild dialog.");
			//打开会话重建对话框
			Jalor.Component.Session.openRebuildDialog(fnCallback,callbackParameter);
		}else if(xhr.status == 401){
			Jalor.Component.handleNoPermissionEror(responseText);
		}else if(xhr.status == 404){
			Jalor.UI.showMessage("jalor.common.message.notFoundResouceError","error");
		}else if( (typeof responseText == "string") && responseText.substring(0,1) == "{" ){
			if(fault.code === "huawei.jalor5.validator.00010001"){
				Jalor.Component.handleValidationError(fault,  fnCallback, callbackParameter);
			}else{
			 
				if(fault.code == "unknown"){
					//记录日志ID
					var logId = '';
					if(fault.faultUid){
						logId = '\r\n'+ fault.faultUid.replace('WebContainer','ID');
					}
					
					if(i18nMessage !== i18nKey){
						Jalor.UI.showMessage(i18nMessage + logId,"error");
					}
					else{
						Jalor.UI.showMessage(fault.message + logId,"error");
					}
				}else{
					Jalor.UI.showMessage(fault.message,"error");
				}
				 
			}
		}else{
			Jalor.Core.log(responseText);
			//if(responseText.)
			Jalor.UI.showMessage("jalor.common.message.unknownError","error");
		}
		var dialogContents = $(".jalor-dialog-content");
		var indexOfMsg = "";
		if(i18nMessage !== i18nKey){
			indexOfMsg = i18nMessage;
		}else{
			indexOfMsg = fault.message;
		}
		for (var i = 0; i < dialogContents.length ; i++) {
			if(dialogContents[i].innerHTML.indexOf(indexOfMsg) != -1){
				dialogContents[i].innerHTML=dialogContents[i].innerHTML+"<br/><a style='color:red;' href='javascript:Jalor.UI.openFeedback()'>"+$.i18nKeyp("portal.feedback")+"</a>";
			}
		}
	}
	Jalor.Core.handleError = Jalor.Component.handleError;
}());
}catch(e){
	console.log("不存在Jalor对象");
}
/***************************************END****************************************/





(function($) {

    var listOpen = false;

    // 信息公告列表
    window.searchInfo = function(searchPageVO, infoVO) {
        if (!infoVO) {
            infoVO = searchInfo.infoVO;
        } else {
            searchInfo.infoVO = infoVO;
        }

        $(".i18n").i18nKeyp();
        if (!searchPageVO) {
            searchPageVO = {};
            searchPageVO.curPage = 1;
            searchPageVO.pageSize = 5;
        }
        var infoType = infoVO.infoType || '';
        var infoCategory = infoVO.infoCategory || '';
        if (!infoType || infoType == '' || !infoCategory || infoCategory == '') {
            return;
        }
        $.ajax({
                    url : 'services/rec/portal/conf/release/page/' + searchPageVO.pageSize + '/' + searchPageVO.curPage + '?infoType=' + infoType + '&infoCategory=' + infoCategory + '&c=' + new Date().getTime(),
                    type : 'GET',
                    success : function(dataResult) {
                        if (dataResult) {
                            var data = {};
                            data.result = dataResult.result;
                            data.infoType = infoType;
                            data.infoCategory = infoCategory;
                            var htm = JsTemplate("listContentTmp").render({
                                        data : data
                                    });
                            $("#listContent").html(htm);
                            $("#pager").html('');
                            $("#pager").loadPage(dataResult.pageVO, searchInfo);
                            $(".i18n").i18nKeyp();
                            listOpen = true;
                            $("#infoListDiv").show();
                            $(".pageItem>div").hide();
                            var windowHeight = $(window).height();
                            var minHeight = 660;
                            var divHeight = 500;
                            if (windowHeight < minHeight) {
                                divHeight = divHeight - (minHeight - windowHeight);
                                $('.listZone').css({
                                            'height' : divHeight + 'px',
                                            'min-height' : divHeight + 'px',
                                            'overflow' : 'auto'
                                        });
                            } else {
                                $('.listZone').css({
                                            'height' : '440px',
                                            'min-height' : '440px',
                                            'overflow' : 'auto'
                                        });
                            }
                            $('.introduceBox1').autoCenter();
                        }
                    }
                });
    };
    // 信息公告详细页面
    window.viewInfoDetail = function(infoId) {
        if (!infoId || infoId == '') {
            return;
        }
        $.ajax({
                    url : 'services/rec/portal/conf/release/find/' + infoId + '?c=' + new Date().getTime(),
                    type : 'GET',
                    success : function(data) {
                        if (data) {
                            $("#contentDetail").html(JsTemplate("contentDetailTmp").render({
                                        data : data
                                    }));
                            $(".i18n").i18nKeyp();
                            $("#infoListDiv").hide();
                            $("#infoDetailDiv").show();
                            $(".pageItem>div").hide();
                            $('.introduceBox1').autoCenter();
                            var windowHeight = $(window).height();
                            var minHeight = 545;
                            var divHeight = 300;
                            if (windowHeight < minHeight) {
                                divHeight = divHeight - (minHeight - windowHeight);
                                $('.CtnHig').css({
                                            'height' : divHeight + 'px',
                                            'min-height' : divHeight + 'px'
                                        });
                            }
                        }
                    }
                });
    };

    window.closeContentList = function() {
        $("#infoListDiv").hide();
        listOpen = false;
        $(".pageItem>div").show();
    };
    window.closeContentDetail = function() {
        $("#infoDetailDiv").hide();
        if (!listOpen) {
            $(".pageItem>div").show();
        } else {
            $("#infoListDiv").show();
            $('.introduceBox1').autoCenter();
        }
    };

    var init = function() {
        if (document.getElementById('listContentTmp') != null) {
            JsTemplate('listContentTmp', document.getElementById('listContentTmp').innerHTML);
        }
        if (document.getElementById('listContentTmp') != null) {
            JsTemplate('contentDetailTmp', document.getElementById('contentDetailTmp').innerHTML);
        }
    };
    $(init);

}(jQuery));

(function($) {
    $.fn.autoCenter = function() {
    	var offset = 10;
        return this.each(function() {
                    var elem = $(this);
                    var top = ($(window).height() - elem.height()) / 2;
                    if (top < 60) {
                        top = 60;
                    }
                    elem.css({
                                "position" : "relative",
                                "top" : (top+offset) + "px"
                            }).addClass('autoCenter');
                });
    };
    var init = function() {
        $(window).resize(function() {
                    $('.autoCenter').autoCenter();
                });
    };
    $(init);
}(jQuery));
(function($){
	var local = window.location.href;
	if(local.indexOf("<") > -1 || local.indexOf(">") > -1) {
		window.location.href = encodeURI(local);
	}
})(jQuery);
(function($) {
	window.allTemplate = {
		'moreConditionRow' : '<tr class="rownum-<%=rownum%>"> 	<td> 		<a data-rownum="<%=rownum%>" class="jalor-icon del recMoreConditionDel"></a> 	</td> 	<td class="recMoreConditionRelation"> 		<select class="recMoreRelation" name="r[<%=rownum%>]"> 			<option value="and">并且/And</option> 			<option value="or">或者/Or</option> 		</select> 	</td> 	<td class="recMoreConditionItemTd"> 		<select class="recMoreConditionItem" data-rownum="<%=rownum%>" name="i[<%=rownum%>]" style="max-width:200px;"> 			<% 			var isShow,item; 			for(var i=0;i&lt;items.length;i++){ 				item = items[i]; 				isShow = true; 				if(group){ 					isShow = false; 					for(var j=0;j &lt; group.length;j++){ 						if(group[j] === item.itemGroup){ 							isShow = true; 							break; 						} 					} 				} 				if(isShow){ 			%> 			<option data-type="<%=item.attributeType%>" data-ds="<%=item.attributeDs%>" data-regexp="<%=item.checkRegexp%>" data-msg="<%=item.checkMsg%>" value="<%=item.itemId%>"><%=languageRender(item.display)%></option> 			<% 				} 			} 			%> 		</select> 	</td> 	<td class="recMoreConditionTd"> 		<select class="recMoreCondition" name="c[<%=rownum%>]" style="max-width:200px;"> 			<option value="eq">等于/Equal</option> 			<option value="neq">不等于/Not Equal</option> 			<option value="lk">包含/Contain</option> 			<option value="nlk">不包含/Not Contain</option> 			<option value="gt">大于/Great Then</option> 			<option value="lt">小于/Less Then</option> 		</select> 	</td> 	<td class="recMoreConditionValTd"> 	</td> </tr>',
		'moreCondition' : '<ul> 	<li class="jalor-form-row jalor-form-more"> 		<a id=\'recMoreBtn_<%=flag%>\' onclick="Jalor.Common.toggle(this,\'#recMoreCondition_<%=flag%>\')"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Title"></span></a> 	</li> </ul> <ul id="recMoreCondition_<%=flag%>" style="display: none;"> 	<table class="jalor-table"> 		<thead> 			<tr> 				<th width="10%"> 					<a class="jalor-icon add recMoreConditionAdd"></a> 				</th> 				<th width="15%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Relation"></span></th> 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Item"></span></th> 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Condition"></span></th> 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Value"></span></th> 			</tr> 		</thead> 		<tbody class="recMoreConditionBody"> 			<%=include(\'moreConditionRow\')%> 		</tbody> 	</table> </ul>',
		'moreCondition2' : '<ul id="recMoreCondition_<%=flag%>"> 	<table class="jalor-table"> 		<thead> 			<tr> 				<th width="10%" style="width: 20px"> 					<a class="jalor-icon add recMoreConditionAdd"></a> 				</th> 				 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Item"></span></th> 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Condition"></span></th> 				<th width="25%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Value"></span></th> 				<th width="15%"><span class="init i18n" i18nKey="Rec.Common.MoreCondition.Relation"></span></th> 			</tr> 		</thead> 		<tbody class="recMoreConditionBody"> 			<%=include(\'moreConditionRow2\')%> 		</tbody> 	</table> </ul>',
		'moreConditionRow2' : '<tr class="rownum-<%=rownum%>"> 	<td> 		<a data-rownum="<%=rownum%>" class="jalor-icon del recMoreConditionDel"></a> 	</td> 	<td class="recMoreConditionItemTd"> 		<div class="formdrop fl" style="width:220px;margin: 0;padding: 2px 20px 2px 8px;">         	<div class="Droplist" data-uuid="udrop00001" style="width: 220px;height: 28px;background-position: 205px 12px;">         	  <div class="DroplistHeader"  style="width: 220px;height: 28px;">         	   	<select class="recMoreConditionItem searchcombox inputbox" style="width:240px;" data-rownum="<%=rownum%>" name="i[<%=rownum%>]"> 					<% 					var isShow,item; 					for(var i=0;i&lt;items.length;i++){ 						item = items[i]; 						isShow = true; 						if(group){ 							isShow = false; 							for(var j=0;j &lt; group.length;j++){ 								if(group[j] === item.itemGroup){ 									isShow = true; 									break; 								} 							} 						} 						if(isShow){ 					%> 					<option data-type="<%=item.attributeType%>" data-ds="<%=item.attributeDs%>" data-regexp="<%=item.checkRegexp%>" data-msg="<%=item.checkMsg%>" value="<%=item.itemId%>"><%=languageRender(item.display)%></option> 					<% 						} 					} 					%> 				</select>         	  </div>         	</div>         </div> 	</td> 	<td class="recMoreConditionTd"> 		<div class="formdrop fl" style="width:160px;margin: 0;padding: 2px 20px 2px 8px;">         	<div class="Droplist" data-uuid="udrop00001" style="width: 160px;height: 28px;background-position: 145px 12px;">         	  <div class="DroplistHeader"  style="width: 160px;height: 28px;">         	  	<select class="recMoreCondition searchcombox inputbox" style="width:200px;"  name="c[<%=rownum%>]"> 					<option value="eq">等于/Equal</option> 					<option value="neq">不等于/Not Equal</option> 					<option value="lk">包含/Contain</option> 					<option value="nlk">不包含/Not Contain</option> 					<option value="gt">大于/Great Then</option> 					<option value="lt">小于/Less Then</option> 				</select>         	  </div>         	</div>         </div> 	</td> 	<td class="recMoreConditionValTd"> 	</td> 		<td class="recMoreConditionRelation"> 		<div class="formdrop fl" style="width:120px;margin: 0;padding: 2px 20px 2px 8px;">         	<div class="Droplist" data-uuid="udrop00001" style="width: 120px;height: 28px;background-position: 105px 12px;">         	  <div class="DroplistHeader"  style="width: 120px;height: 28px;">         	  	<select class="recMoreRelation searchcombox inputbox" style="width:160px;"  name="r[<%=rownum%>]"> 					<option value="and">并且/And</option> 					<option value="or">或者/Or</option> 				</select>         	  </div>         	</div>         </div> 	</td> </tr>',
		'recMessageDataList' : '<div class="jalor-form-body1"> 	<ul class="dformSectionTitle"> 		<li class="mypullbar"> 			<a class="expend" onclick="Jalor.Common.toggle(this, \'#recMessage_<%=messageVO.systemType + "_" + messageVO.keyId%>\');"> 				<samp><%=$i18n(\'rec.base.message.Title\')%></samp> 			</a>  		</li> 	</ul> 	<div id="recMessage_<%=messageVO.systemType + "_" + messageVO.keyId%>"> 		<div id="recMessageDiv"> 			<div id="recMessageDataList"> 				<% for(var i =0;i<datas.length;i++){ 					var data = datas[i]; 					var message = data[\'message\']; 					var keyId = data[\'keyId\'] || \'\'; 					var messageId = data[\'messageId\']; 					var systemType = data[\'systemType\']; 					var upMessageId = data[\'upMessageId\'] || \'\'; 					var employeeNumberC = data[\'employeeNumberC\'] || \'\'; 					var employeeNumberU = data[\'employeeNumberU\'] || \'\'; 					var upRecMessageVO = data[\'upRecMessageVO\'] || \'\'; 					var createdUserId = data[\'createdUserId\'] || \'\'; 					var creationDate = data[\'creationDate\'] || \'\'; 					var creationDate = Jalor.Format.toDate(creationDate).format(Jalor.Config.Format[\'datetime\']); 					%> 					<!--li class="jalor-form-ro" > 						<samp class="message"> 							<%=employeeNumberC%> 发表于 : <%=creationDate%> 						</samp> 						<span class=\'jalor-form-textare\'> 							<%=message%> 						</span> 					</li--> 				 					<table style="width:740px;"> 						<tr> 							<th align="left" style="font-weight: normal; padding-top:15px;"> 								<span style="float:right; color:#888;"><%=$i18n(\'rec.base.message.sendDate\')%> : <span style="color:#666;"><%=creationDate%></span></span> 								<span style="color:#888;"><%=$i18n(\'rec.base.message.sender\')%></span> 								<span style="color:#3A65D5;"> 									<% if(workspaceVO.user.userId == createdUserId && false){%> 										您 									<%} else {%> 										<%=employeeNumberC%> 									<%}%> 								</span> 								<% if(upRecMessageVO && false){ 										upRecMessageVO.creationDate = Jalor.Format.toDate(upRecMessageVO.creationDate).format(Jalor.Config.Format[\'datetime\']); 								%> 									<span>回复： 										<% if(workspaceVO.user.userId == upRecMessageVO.createdUserId){%> 											您 										<%} else {%> 											<%=upRecMessageVO.employeeNumberC%> 										<%}%> 									</span> 									<span><%=creationDate%></span><!--发表于 : <%=upRecMessageVO.creationDate%>--> 								<%} else {%> 								<%}%> 							</th> 						</tr> 						<tr> 							<!-- <td><textarea rows="5" cols="120" readonly="readonly" disabled="disabled" style="background-image: none; background-color: transparent; border: 0px; padding-left: 0px; color: rgb(0, 0, 0);"><%=message%></textarea> --> 							<td><p style="padding: 5px; margin: 5px 0 5px 15px; word-break: break-word; line-height: 25px; background-color: #f5f5f5; border-bottom:1px solid #ddd;"><%=message%></p> 							</td> 						</tr> 						<tr> 							<% if(workspaceVO.user.userId != createdUserId && false){%> 							<td><a href="javascript:;" onclick="RecMessageMap.reply(this)" class="recMessageRely" messageId="<%=messageId%>"  systemType="<%=systemType%>" keyId="<%=keyId%>">回复</a></td> 							<%}%> 						</tr> 					</table> 				<%}%> 			</div> 			<% if(messageVO.viewOrEdit == \'1\') { %> 				<div id="recMessageAdd" onmousedown="RecMessageMap.jalorDisabled(this)"> 					<div style="width:740px; height: 25px; line-height: 25px; margin-top:15px; border-top:1px solid #ddd;"><strong><%=$i18n(\'rec.base.message.addMsg\')%></strong></div> 					<div> 						<textarea onkeyup="RecMessageMap.msTextareaKeyUp(this)"  id="addMessage_<%=messageVO.systemType + "_" + messageVO.keyId %>" rows="3" cols="120" style="margin-left:15px;" class="readOnlyIgnore"></textarea> 					</div> 					<div> 						<input type="button"  value="<%=$i18n(\'jalor.common.button.submit\')%>" class="jalor-dialog-button readOnlyIgnore recMessageRely" 							onclick="RecMessageMap.replyDo($(\'#addMessage_<%=messageVO.systemType + "_" + messageVO.keyId%>\'))" style="margin-left:15px;" 							systemType="<%=messageVO.systemType%>" keyId="<%=messageVO.keyId%>"></div> 				</div> 			<%}%> 		</div> 	</div> </div> <br/>',
		'recMessageAdd' : '<textarea id="addMessage_<%=datas.systemType + "_" + datas.keyId + "_" + datas.messageId%>" rows="5" cols="120"></textarea> <a href="javascript:;"  onclick="RecMessageMap.replyDo($(\'#addMessage_<%=datas.systemType + "_" + datas.keyId + "_" + datas.messageId%>\'))" class="recMessageRelyDo">回复</a>',
		'form' : '<form id="<%=formdefine.formName%>"  class="init dForm jalor-form"></form>',
		'matrixTitle' : '<ul class="dformSectionTitle">	<li class="mypullbar">		<a class="expend" onclick="Jalor.Common.toggle(this, \'#toggle_<%=section.sectionId%>\');">		<samp><%=languageRender(section.sectionTitle)%></samp>		</a>	</li></ul>',
		'gridTitle' : '<ul class="dformSectionTitle"> 	<li class="mypullbar "> 		<a class="expend" onclick="Jalor.Common.toggle(this, \'#toggle_<%=section.sectionId%>\');"> 		<samp><%=languageRender(section.sectionTitle)%></samp> 		</a> 	</li> </ul>',
		'formButton' : '<div class="formButtonZone jalor-operate"> <% for(var i=0;i<formdefine.buttons.length;i++){ %> <% var button = formdefine.buttons[i];%> <% if(button.buttonPosition !== \'inline\'){%> <% var btnId = \'btn_\' + formdefine.formName + \'_\' + button.buttonType; %> <input id="<%=btnId%>" name="<%=button.buttonId%>" buttonType="<%=button.buttonType%>" buttonAction="<%=button.buttonAction?button.buttonAction:\'\'%>" buttonJsfunction="<%=button.buttonJsfunction?button.buttonJsfunction:\'\'%>" type="<%=button.buttonType != \'reset\' ? \'button\' : \'reset\'%>" value="<%=languageRender(button.buttonName)%>"> <script type="text/javascript"> $(function(){     setTimeout(function(){ 		$(\'#<%=btnId%>\').click(function(e) { 	        if (e.pageX === 0 && e.pageY === 0) { 	            return; 	        } 	        $.dForm.buttonAction.call(this, \'<%=formdefine.formName%>\', null, \'<%=btnId%>\'); 	    });     },100); }); </script> <%}%> <%}%> </div>',
		'matrix' : '<div id="<%=section.sectionId%>" data-sectionType="<%=section.sectionType%>" class="formSection jalor-form-body"></div>',
		'matrixContent' : '<div id="toggle_<%=section.sectionId%>" class="matrixContent jalor-form-body"></div>',
		'matrixButton' : '<div class="jalor-operate"> <% for(var i=0;i<section.buttons.length;i++){ %> <% var button = section.buttons[i];%> <% if(button.buttonPosition !== \'inline\'){%> <% 	var btnId = \'btn_\' + formdefine.formName + \'_\' + button.buttonType; 	if(button.buttonType !== \'search\'){ 		btnId += (\'_\' + section.sectionId); 	} %> <input id="<%=btnId%>" name="<%=button.buttonId%>" buttonType="<%=button.buttonType%>" buttonAction="<%=button.buttonAction?button.buttonAction:\'\'%>" buttonJsfunction="<%=button.buttonJsfunction?button.buttonJsfunction:\'\'%>" type="<%=button.buttonType != \'reset\' ? \'button\' : \'reset\'%>" value="<%=languageRender(button.buttonName)%>"> <script type="text/javascript"> $(function(){     setTimeout(function(){ 		$(\'#<%=btnId%>\').click(function(e) { 	        if (e.pageX === 0 && e.pageY === 0) { 	            return; 	        } 	        $.dForm.buttonAction.call(this, \'<%=formdefine.formName%>\', \'<%=section.sectionId%>\', \'<%=btnId%>\'); 	    });     },100); }); </script> <%}%> <%}%> </div>',
		'gridButton' : '<div class="jalor-grid-toolbar"> <% for(var i=0;i<section.buttons.length;i++){ %> <% var button = section.buttons[i];%> <% if(button.buttonPosition !== \'inline\'){%> <% var btnId = \'btn_grid_\' + button.buttonType + \'_\' + section.sectionId; %> <input id="<%=btnId%>" name="<%=button.buttonId%>" buttonType="<%=button.buttonType%>" buttonAction="<%=button.buttonAction?button.buttonAction:\'\'%>" buttonJsfunction="<%=button.buttonJsfunction?button.buttonJsfunction:\'\'%>" type="button" value="<%=languageRender(button.buttonName)%>"> <script type="text/javascript"> $(function(){     setTimeout(function(){ 		$(\'#<%=btnId%>\').click(function(e) { 	        if (e.pageX === 0 && e.pageY === 0) { 	            return; 	        } 	        $.dForm.buttonAction.call(this, \'<%=formdefine.formName%>\', \'<%=section.sectionId%>\', \'<%=btnId%>\'); 	    });     },100); }); </script> <%}%> <%}%> </div>',
		'matrixRowButton' : '<% var temp_buttons = []; for(var i=0;i<section.buttons.length;i++){ 	var temp_button = section.buttons[i]; 	if(temp_button.buttonPosition === \'inline\'){ 		temp_buttons.push(temp_button); 	} } %> <%if(temp_buttons.length &gt; 0){%> 	<li class="jalor-form-row jalor-form-longcell"> 	<% for(var i=0;i<temp_buttons.length;i++){ %> 		<% var button = temp_buttons[i];%> 		<% var btnId = \'btn_\' + button.buttonId + \'_\' + button.buttonType + \'_\' + rownum; %> 		<input id="<%=btnId%>" rownum="<%=rownum%>" name="<%=button.buttonId%>" buttonType="<%=button.buttonType%>" buttonAction="<%=button.buttonAction?button.buttonAction:\'\'%>" buttonJsfunction="<%=button.buttonJsfunction?button.buttonJsfunction:\'\'%>" type="<%=button.buttonType != \'reset\' ? \'button\' : \'reset\'%>" value="<%=languageRender(button.buttonName)%>"> 		<script type="text/javascript"> 		$(function(){ 		    setTimeout(function(){ 				$(\'#<%=btnId%>\').click(function(e) { 			        if (e.pageX === 0 && e.pageY === 0) { 			            return; 			        } 			        $.dForm.buttonAction.call(this, \'<%=formdefine.formName%>\', \'<%=section.sectionId%>\', \'<%=btnId%>\'); 			    }); 		    },0); 		}); 		</script> 	<%}%> 	</li> <%}%> ',
		'matrixRow' : '<ul class="MatrixGridRow" rownum="<%=rownum%>"> 	<% var sectionExtend = getExtend(section.sectionExtend); %> 	<% if(sectionExtend && sectionExtend.showRowTitle){ %> 	<li class="jalor-form-row rowTitle" data-title="<%=languageRender(section.sectionName)%>"> 		<span><%=languageRender(section.sectionName) + (rownum+1)%></span> 	</li> 	<%}%> 	<% if(sectionExtend && sectionExtend.inlineButtonPosition === \'top\'){ %> 		<%=include(\'matrixRowButton\') %> 	<%}%> 	<% for(var i=0;i<section.columns.length;i++){ %> 		<% var field = section.columns[i];%> 		<% var extend = getExtend(field.fieldOthers); %> 		<% if(field.fieldDisplay){ %> 			<% if(field.fieldHidden){ %> 				<%=include(\'hidden\',{field:field,extend:extend,value:data[field.sectionFieldId]}) %> 			<%}else if(extend && extend.merge){%> 				<% $html = $html.replace(\'<input type="hidden" value="row\'+(i-1)+\'"/>\',include(field.fieldDsType,{field:field,extend:extend,value:data[field.sectionFieldId]})+\'<input type="hidden" value="row\'+(i)+\'"/>\'); %> 				<% $html = $html.replace(\'--\'+(i-1)+\'--\',\'jalor-form-longcell mutiField\'); %> 			<%}else{%> 				<li class="jalor-form-row --<%=i%>-- 				<%=(formdefine.formType === \'search\' && field.fieldSearchType === \'between\')?\'jalor-form-range \':\'\'%> 				<%=(field.fieldExclusively)?(field.fieldDsType === \'textarea\'?\'jalor-form-whole \':\'jalor-form-longcell \'):\'\'%> 				"> 					<samp <%=field.fieldRequire?\'class="require"\':\'\'%> title="<%=languageRender(field.fieldHeader || field.fieldTitle)%>" ><%=languageRender(field.fieldHeader || field.fieldTitle)%></samp> 					<span class="jalor-form-input"> 						<%=include(field.fieldDsType,{field:field,extend:extend,value:data[field.sectionFieldId]}) %> 						<%if(formdefine.formType === \'search\' && field.fieldSearchType === \'between\'){ 							var oldSectionFieldId = field.sectionFieldId; 							field.sectionFieldId +=\'_between\'; 							$html+=include(field.fieldDsType,{field:field,extend:extend,value:data[field.sectionFieldId]}); 							field.sectionFieldId = oldSectionFieldId; 						} %> 						<input type="hidden" value="row<%=i%>"/> 					</span> 				</li> 				<% if(field.validations && field.validations.length &gt; 0){%> 					<script type="text/javascript"> 					$(function(){ 					    setTimeout(function(){ 							var validations = $.dForm.processValidations(JSON.parse(\'<%=JSON.stringify(field.validations)%>\')); 							$(\'#<%=field.sectionFieldId + \'_\' + rownum%>\').data(\'dValid\',validations).addClass(\'dValid\'); 					    },100); 					}); 					</script> 				<%}%> 			<%}%> 		<%}%> 	<%}%> 	<%$html = $html.replace(\'__\'+(i-1)+\'__\',\'\'); %> 	<%$html = $html.replace(\'--\'+(i-1)+\'--\',\'\'); %> 	<input type="hidden" value="<%=data.operationType?data.operationType:\'insert\'%>" name="operationType_<%=rownum%>" /> 	<% if(!sectionExtend || sectionExtend.inlineButtonPosition !== \'top\'){ %> 		<%=include(\'matrixRowButton\') %> 	<%}%> </ul>',
		'date' : '<input type="text" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" class="init jalor-calendar date dFormCell <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" format="yyyy-MM-dd" datatype="string" value="<% if(value){ 	var mDateVal = /(\d{4}-\d{2}-\d{2})\s/.exec(value); 	if(mDateVal){ 		$html += mDateVal[1]; 	} } %>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> /> ',
		'datetime' : '<input type="text" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" class="init jalor-calendar datetime dFormCell <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" format="datetime" datatype="string" value="<%=value?value:\'\'%>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> />',
		'dept' : '<% 	var callbackFun = \'\'; 	if (extend && extend.callbackFun) {       callbackFun = extend.callbackFun;   	} 	 %> <input type="text" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" title="<%=value?value.replace(/\\\\/g,\'\\n\\n\'):\'\'%>" value="<%=value?value.encode():\'\'%>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> /> <input type="button" id="<%=field.sectionFieldId + \'_\' + rownum%>_deptBtn" callbackFun="<%=callbackFun%>" value="..." onclick="<%=field.sectionFieldId + \'_\' + rownum%>selectDept(this);" /> <script type="text/javascript"> function <%=field.sectionFieldId + \'_\' + rownum%>selectDept(this_) {     var initDept,deptJq = $("#<%=field.sectionFieldId + \'_\' + rownum%>"),deptVal = deptJq.val();     var that = $(this_);     var m = <%=/\\\\?(\\d+)\\/(?:.(?!\\\\))+?\\/(?:.(?!\\\\))+?$/%>.exec(deptVal);     if(m && m.length === 2){         initDept = m[1] ;     }else{         initDept = \'\';     }     RecUtil.selectHRDept({         initDept : initDept,         callback : function(value, text) {             deptJq.val(text);             deptJq.attr(\'title\',text.replace(/\\\\\\\\/g,\'\\\\n\\\\n\'));             if(deptVal != text){ 	            deptJq.change();             }             var callbackFun = that.attr(\'callbackFun\');             if(callbackFun){             	setTimeout(function(){ 	            	eval(callbackFun);             	},500);             }         },         status:\'1\'     }); }; </script>',
		'text' : '<% var style; if (extend && extend.style) {     style = extend.style; } %> <input type="text" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" class="init dFormCell <%=field.fieldExclusively?\'longtxt\':\'\'%> <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" style="<%=style%>" value="<%=value?value.encode():\'\'%>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> />',
		'select' : '<%   var ds = getFieldDS(field);   var style;   var valueField = ds.value;   var displayField = ds.display;   var service,connector,combo = \'true\';       if (ds.type === \'REST\') {      service = \'REST:\' + ds.service;   } else if (ds.type === \'LOOKUP\') {       service = \'LOOKUP:\' + ds.lookup;   } else if (ds.type === \'LOOKUP2\') {       service = \'LOOKUP2:\' + ds.lookup;   }   if (extend && extend.style) {       style = extend.style;   }   if (extend && extend.connector) {       connector = extend.connector + \'_\' + rownum;   }   if (extend && extend.valueField) {       valueField = extend.valueField;   }   if (extend && extend.displayField) {       displayField = extend.displayField;   }   if (extend && (extend.combo != null ||extend.combo != undefined )) {       combo = extend.combo;   }    var multi=\'false\';     if (extend && (extend.multi != null ||extend.multi != undefined )) {       multi = extend.multi;   } %> <input type="text" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" class="init dFormCell jalor-combobox <%=field.fieldExclusively?\'longtxt\':\'\'%> <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" style="<%=style%>" combo="<%=combo%>" multi="<%=multi%>" service="<%=service%>" valueField="<%=valueField%>" displayField="<%=displayField%>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> <%if(connector){%> connector="<%=connector%>" <%}%> /> <script type="text/javascript"> (function(){     try{ 		var fieldValue = "<%=value%>"; 		if(fieldValue&&fieldValue!=\'undefined\'){ 		    $(\'#<%=field.sectionFieldId + \'_\' + rownum%>\').jalorSetValue(fieldValue); 		}     }catch(e){        alert(e);     } }()); </script> ',
		'radio' : '<% var fName = field.sectionFieldId + \'_\' + rownum; var ds = getFieldDS(field); var readioDatas; if(ds.type == \'REST\' ){ 	$.ajax({             url : ds.service,             async : false,             success : function(datas) {             	readioDatas = datas;             }     }); } else { 	readioDatas = Jalor.UI.getStaticData({ service : ds.type +\':\'+ds.lookup, supportLang : true }); } readioDatas = readioDatas || []; for (var i = 0; i < readioDatas.length; i++) {        var data = readioDatas[i]; %> <input type="radio" id="<%=field.sectionFieldId + \'_\' + rownum + \'_\' + i%>" name="<%=fName%>" value="<%=data[ds.value]%>" class="init dFormCell <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" <%=!field.fieldEditable?\'disabled="disabled"\':\'\'%> /> <label style="display:inline" for="<%=field.sectionFieldId + \'_\' + rownum + \'_\' + i%>"><%=data[ds.display]%></label> <%   } %> <script type="text/javascript"> (function(){ 	var fieldValue = \'<%=value%>\'; 	if(fieldValue){         $(\'input[name="<%=fName%>"][value="\' +fieldValue + \'"]\').attr(\'checked\', \'checked\'); 	} }()); </script>',
		'checkbox' : '<% var fName = field.sectionFieldId + \'_\' + rownum; var ds = getFieldDS(field); $.ajax({             url : ds.service,             async : false,             success : function(datas) {                 for (var i = 0; i < datas.length; i++) {                     var data = datas[i]; %> <input type="checkbox" id="<%=field.sectionFieldId + \'_\' + i%>" name="<%=fName%>" value="<%=data[ds.value]%>" class="init dFormCell <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" <%=!field.fieldEditable?\'disabled="disabled"\':\'\'%> /> <label style="display:inline" for="<%=field.sectionFieldId + \'_\' + i%>"><%=data[ds.display]%></label> <%              }          }      }); %> <script type="text/javascript"> (function(){ 	var fieldValue = \'<%=value%>\'; 	if(fieldValue){ 	    var values = fieldValue.split(\',\'); 	    for (var j = 0; j < values.length; j++) { 	        $(\'input[name="<%=fName%>"][value="\' + values[j] + \'"]\').attr(\'checked\', \'checked\'); 	    } 	} }()); </script>',
		'hidden' : '<input type="hidden" id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" value="<%=value?value.encode():\'\'%>" /> <script type="text/javascript"> (function(){ 	var fieldValue = "<%=value?value:\'\'%>"; 	if(fieldValue && fieldValue != \'null\' && fieldValue != \'undefined\'){ 	    $(\'#<%=field.sectionFieldId + \'_\' + rownum%>\').dataValue(fieldValue); 	} }()); </script>',
		'textarea' : '<textarea id="<%=field.sectionFieldId + \'_\' + rownum%>" name="<%=field.sectionFieldId + \'_\' + rownum%>" class="init dFormCell <%=field.fieldExclusively?\'longtxt\':\'\'%> <%=extend&&extend.className?(\' \'+extend.className):\'\'%>" <%=!field.fieldEditable?\'readonly="readonly"\':\'\'%> ><%=value?value.encode():\'\'%></textarea> ',
		'portalDialog' :'<div><div class="x_window_Bg"></div><div class="x_window" style="width: <%=width%>px;margin-top: <%=top%>px;" id="xWindowId"><div class="x_window_top" style="cursor: move;overflow: hidden;"  id="xWindowHandle"><span type="closeButton" class="XwindowHide" style="float: right; cursor: pointer; font-weight: 800; font-size: 24px;">&times;</span><strong><%=title%></strong></div><div class="x_window_co" style="height:<%=height%>px; min-height: <%=minHeight%>px; max-height: <%=maxHeight%>px; "></div><div class="x_window_floot" style="<%=popupUpStyle%>"><div class="detailRightBottom" style="text-align: center;padding-bottom:25px"><% for(var i=0; i < buttons.length; i ++){var button = buttons[i];%><div id="prisure" class="myBtn redBtn" style="width:80px;"><div class="myBtnRight"><div class="myBtnCenter"><span class="flootButton i18n" i18nkeyp="Portal.common.submit" index="<%=i%>"><%=button.title%></span> </div></div></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<%}%></div></div></div></div>',
		'portalDialog4' : '<div id="dialogDiv"><div class="x_window_Bg"></div><div class="x_window" style="width: <%=width%>px;margin-top: <%=top%>px;" id="xWindowId"><div class="x_window_top" style="cursor: move;overflow: hidden;"  id="xWindowHandle"><span type="closeButton" class="XwindowHide" style="float: right; cursor: pointer; font-weight: 800; font-size: 24px;"><img src="campus4/img/closet.png" alt="" /><!-- &times; --></span><strong class="x_window_title"><%=title%></strong></div><div class="x_window_co" style="height:<%=height%>px; min-height: <%=minHeight%>px; max-height: <%=maxHeight%>px; "></div></div></div>',
		'portalConfirm' : '<style>.dialog.zhaopintc .cont {width: 350px;margin-top: -120px;margin-left: -175px;min-height: 240px;}.dialog .cont .t {font-size: 18px;font-weight: bold;color: #333;margin-bottom: 10px;}.dialog.zhaopintc .cont .btn {width: 120px;height: 40px;font-size: 14px;line-height: 40px;margin-left: -15.2%;}/*#infoDiv {    word-break: break-all;}*/.dialog.smallPopups .cont .c{color: #999999;    font-weight: inherit;font-size: 14px;}.dialog.smallPopups .cont .t {padding:0px;    height: 40px}</style><div class="dialog smallPopups" id="confirmDiv"><div class="filter"></div><div class="cont"><div class="closebtn"></div><div class="t"><%=title%></div><div class="c" id="infoDiv"><%=info%></div><div class="btnWrap clearfix"><a href="javascript:void(0);" class="confirm active" id="okDiv"><%=okButtonMsg%></a><a href="javascript:void(0);" class="cancel last" id="closeDiv"><%=closeButtonMsg%></a></div></div></div>',
		'portalAlert' : '<style>.dialog.zhaopintc .cont {width: 350px;margin-top: -120px;margin-left: -175px;min-height: 240px;border: 1px solid #c2c2c2;}.dialog .cont .t {font-size: 18px;font-weight: bold;color: #333;margin-bottom: 10px;}.dialog.zhaopintc .cont .btn {width: 120px;height: 40px;font-size: 14px;line-height: 40px;margin-left: -15.2%;}/*#infoDiv {    word-break: break-all;}*/</style><!--点击搜所若没有选择招聘类型，出现弹层--><div class="dialog zhaopintc" id="alertDiv"><div class="filter"></div><div class="cont"><div class="closebutton"></div><div class="t"><%=title%></div><div class="c" id="infoDiv"><%=info%></div><a href="javascript:void(0);" class="btn" id="okDiv"><%=okButtonMsg%></a></div></div>',
		'dialogContentDialog' : '<style>/*dialogContent弹出窗样式*/.x_dialogContent_Bg{width:100%; height:100%; position:fixed; top:0; left:0; background-color:#000; opacity:0.5; filter:alpha(opacity=50); z-index:1000;}.x_dialogContent{z-index:1001; position:fixed; top:50%; left:50%;}.x_dialogContent_top{height:42px; padding:0 15px 0 15px; line-height:42px; background-color:#fff;color:#060606;border-radius: 6px 6px 0 0;}.x_dialogContent_co{padding:15px; background-color:#fff;overflow-y: auto;overflow-x: auto;}.x_dialogContent_title{font-size: 16px;font-weight: bold;margin-top: 20px;margin-left: 15px;}.x_dialogContent_floot{border-radius: 0 0 6px 6px;}.x_dialogContent_closet{margin-right:-15px;}.x_dialogContent_floot .btnWrap{position: absolute;bottom: 30px;}.x_dialogContent_floot .btnWrap a{ display: block; float: left; color: #333;width: 100px; background-color: #f9f9f9; border: 1px solid #cccccc; height: 40px; line-height: 40px; text-align: center; border-radius: 4px; margin-right: 20px;}.x_dialogContent_floot .btnWrap a.active{background-color:#de3435;  color: #ffffff;}.x_dialogContent_floot .btnWrap a.last{ margin-right: 0;}</style><div id="<%=id%>"><div class="x_dialogContent_Bg"></div><div class="x_dialogContent" style="width: <%=width%>px;margin-top: <%=top%>px;" id="xWindowId"><div class="x_dialogContent_top" style="cursor: move;overflow: hidden;"  id="xWindowHandle"><span type="closeButton" class="XwindowHide" style="float: right; cursor: pointer;"><img class="x_dialogContent_closet" src="campus4/img/closet.png" alt=""></span><div class="x_dialogContent_title"><%=title%></div></div><div class="x_dialogContent_co" style="border-radius: 0 0 6px 6px;height:<%=height%>px; min-height: <%=minHeight%>px; max-height: <%=maxHeight%>px; "></div><div class="x_dialogContent_floot" style="<%=popupUpStyle%>"><div class="detailRightBottom" style="text-align: center;padding-bottom:25px"><% if(buttons.length>0){%><div id="prisure" class="myBtn redBtn" style="width:80px;"><div class="myBtnRight"><div class="myBtnCenter btnWrap"><% for(var i=0; i < buttons.length; i ++){var button = buttons[i];%><a class="flootButton <%=button.btnClass%>" style="cursor:pointer;" index="<%=i%>"><%=button.title%></a> <%}%></div></div></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<%}%></div></div></div></div>'
	};
	$.each(allTemplate, function(tmplId, data) {
		//console.log(tmplId + ': start');
		JsTemplate(tmplId, data);
		//console.log(tmplId + ': end');
	});
	//文字过长,加入省略号样式
	//tiwenBtn是faq中的提问，addBtn加入华为人才库，submitHWPeople提交并加入华为人才库,phoneCodeBtn注册页面中的获取验证码,search搜索按钮
	//submit_fbbtn面试反馈中，提交我的反馈按钮,jd_word1_4 offer确认跟入职信息确认,.line1 .title校园招聘下面，研发类跟非研发类
	/*var ellipsBd=$("label,dt,a,.tiwenBtn,.addBtn,.submitHWPeople,.phoneCodeBtn,.search,.submit_fbbtn,.setSubscribe .btn,.pro-tab .tab1,.pro-tab .tab2,.jd_word1_4,.research,.nonresearch,.line1 .title,.re_right dd,.indexBtm dl dd p,.head .center li li a,.body_gezx_gnsz .emailll,.body_gezx_gnsz .phoneee,.f16");
	ellipsBd.addClass("ellipsis_add");
	ellipsBd.attr('title',ellipsBd.text());
	*/
	$(".suspend a").removeClass("ellipsis_add");
	$(".re_right .model_list dt").removeClass("ellipsis_add");
	if($(".suspend .qa span").text()=="FAQ"){
		$(".suspend .qa").css('line-height','43px');
	}else{
		$(".suspend .qa").css('line-height','');
	}
//	打开常见问题弹层
	$(".suspend .qa").live('click',function(){
		$("body").css({'overflow-y':'hidden','padding':'0 17px 0 0'});
		$(".suspend").css('margin-left',"612px");
		$(".FAQtc").show();
	});
	//关闭常见问题弹层
	$(".FAQclosebtn").live('click',function(){
		$("body").css({'overflow-y':'scroll','padding':'0 0px 0 0'});
		$(".suspend").css('margin-left',"620px");
		$(".FAQtc").hide();
	});	
	
}(jQuery));