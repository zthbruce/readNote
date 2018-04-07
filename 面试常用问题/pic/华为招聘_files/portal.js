/**
 * 个人中心公用js
 */
Portal.UserCenter4 = {};

var language = Portal.Campus4.getRequest().language;
if(language){
	$.changeLanguage(language=='en'?'en_US':'zh_CN');
}

/**
 * 简历信息
 */
(function(page) {
	/**
	 * 简历信息
	 */
	page.resume = null;
	/**
	 * 如果是华为的员工就跳回首页
	 */
	page.checkHW = function(){
		if(headerinfo.hwemp && headerinfo.hwemp=="1"){
			return false;
		}
		return true;
	}
	/**
	 * 初始化简历
	 */
	page.initResume = function(callback) {
		var md5Id = Jalor.Page.getRequest().md5Id||'';
		Jalor.doGet({
			async:false,
			url:"services/portal/portaluser/findCenterResume",
			data:{md5Id:md5Id},
			success : function(data){
				page.resume = data||{};
			},
			error : function(data){
				Portal.Campus4.alert(data);
			},
			loading : true
		});	
		if(callback){
			callback();
		}
	}	
	/**
	 * 获取用户身份
	 */
	page.getUserType = function(){
		return Portal.Common.getUserType();
	}
	/**
	 * 用户身份切换
	 */
	page.changeUserType = function(type){
		return Portal.Common.changeUserType(type);
	}
	//储存临时变量位置,简历关联账号地方用到
	page.tempObj = null;
})(Portal.UserCenter4);

//检查是否华为员工
var loc = window.location.href;
if(Portal.UserCenter4.checkHW() || loc.indexOf("localhost")>0) {
	Portal.UserCenter4.initResume();
} else {
	Portal.Campus4.alert($.i18nKeyp("common.hwemp.notice"),'',function(){
		Portal.Campus4.forwardUrl("campus4_index.html")
	});
}

//初始化简历
//初始化
(function($) {
	//初始相片	
	$.fn.initPhoto=function(attachmentId, attachmentTypeP){
		var attachmentType = attachmentTypeP || "ImageAttachment";
		if(attachmentId){
			var em=$(this);
			Jalor.doGet({
				loading : false,
				url : "services/portal/portaluser/attachment/findFile/" + attachmentType + "/"+attachmentId+"?id=001",
				success : function(att){
					if(att){
						em.attr("src",att.downloadUrl);
					}
				} 
			});
		}
	}
	
	/**
	 *@param {jqDom} elmt  当前提取元素
	 *@param {jqDom} container  面板容器
	 */
	_jsonDataGetValue=function(elmt,container,currObj,lastAttr){
	    var format=elmt.attr("format"),type=elmt.attr("type"),value=elmt.val();
	    if(type=="radio"){
	        return elmt[0].checked ? value : (elmt.attr("uncheckvalue")|| "");
	    }else if(type=="checkbox"){
	    	var checked=elmt.attr("checked"),isArray=elmt.attr("isArray"),split=elmt.attr("splitChar")|| ",";
	        if(currObj  && checked){
	        	currObj[lastAttr] = currObj[lastAttr] || (isArray? [] : "");
	        	if(typeof currObj[lastAttr]=="string"){
	        		currObj[lastAttr] += currObj[lastAttr] ? split + value : value;
	        	}else{
	        		currObj[lastAttr].push(value);
	        	}
	        }else{
	        	  return checked ? value : (elmt.attr("uncheckvalue") || "");
	        }
	    }else if (format && value) {
			//日期类型数据处理
	    	if(elmt.attr("showDate")=="false" || elmt.attr("datatype") == "string" ){
	    		return value;
	    	}
			var format = (format=="date" || format=="datetime" || format == "datehm") ? null : format;
			return value.toDate(format);
		}else {
			return elmt.jalorGetValue();
		}
	}
	/**
	 *@param {jqDom} elmt  当前填充元素
	 *@param {String} value   填充值
	 */
	_jsonDataSetValue=function(elmt,value){
	    var tagName=elmt[0].tagName,type=elmt[0].type;
	    if(type=="radio"){
	        if(value==elmt[0].value){
	        	elmt.attr("checked","checked");
	        }else{
	        	if(elmt[0].checked)
	        		elmt.removeAttr("checked");
	        }
	    }else if(type=="checkbox"){
	    	var splitChar = elmt.attr("splitChar") || ",";
			var isArray=elmt.attr("isArray");
			if(value!==null && value!==""){
				var values = isArray ? value : (""+value).split(splitChar);
				for (var i=0; i < values.length; i++) {
	                 if(values[i]==elmt[0].value){
	                     elmt[0].checked=true;
	                     return;
	                 }
				};
	            elmt.removeAttr("checked");
			}else{
				elmt.removeAttr("checked");
			}
	    } else if (tagName == "LABEL") {
			var fmt = elmt.attr("format");
			if (fmt &&  value!==null){
				value = Jalor.Format.toDate(value).format(Jalor.Config.Format[fmt] || fmt);
			}
			if(elmt.hasClass("manytext")){
				elmt.html((""+value).replace(/&/g,"&#38;").replace(/</g,"&lt;").replace(/\x0d|\x0a/g,"<br>"));
			}else{
				elmt.text(value===null ? "":value);
			}
			
		} else {
			if(value || value===0){
				var fmt = elmt.attr("format");
				if (fmt) {
					fmt = Jalor.Config.Format[fmt] || fmt;
					value =Jalor.Format.toDate(value,fmt).format(fmt);
				}
			
				elmt.jalorSetValue(value);
			}else{
				elmt.jalorSetValue("");
			}
		}
	}
	/**
	 * 拿到本dom容器中的所有输入元素(:input)的value，根据元素name 生产一个json格式的数据集对象返回。
	 * 或将一个json格式的数据对象填充或绑定的本dom容器form元素中 
	 * @param {Object} data 需要填充或绑定到本dom容器元素中 的数据
	 */
	$.fn.jsonpData=function(data){
	    //声明将要用到的变量
	    var elmtName,elmtValue,elmt,elmts=this.find(":input[name]").toArray();
	
	    //判断是否传递了用于填充的数据对象
	    if(data && typeof data=="object"){
	        //如果传递了 data参数，则将data中的数据绑定到容器中的form元素中
	        elmts=elmts.concat(this.find("label[name]").toArray());
	        for(var i=0;i<elmts.length;i++){
	            elmt=$(elmts[i]);
	            elmtName=elmt.attr("name");
	            //根据elmtName取出data中相对应得数据
	            elmtValue=void 0;
	            try{elmtValue=eval("data."+elmtName);}catch(e){}
	            if(typeof elmtValue!="undefined"&&elmtValue!=null){
	                _jsonDataSetValue(elmt,elmtValue);
	            }
	        }
	      return this;
	    }else{
	        //如果没有任何参数，则需取出容器中的输入元素值，根据其name封装成对象返回
	        //用户缓存已经 设置或读取过的 name 属性，（相同name元素在同一次jsonData操作中的不会读取第二次）
	        var fullObj={},currObj,chkCache={};
	      
	        for(var i=0;i<elmts.length;i++){
	            elmt=$(elmts[i]);
	            elmtName=elmt.attr("name");
				elmtValue = _jsonDataGetValue(elmt,this);
				//当能取到值才去设置json数据
	            currObj=fullObj;
	            var attrs=elmtName.match(/[a-zA-Z0-9_]+/g);
	            if(!attrs)
	            	continue;
	            for (var j=0; j < attrs.length-1; j++) {
	                if(typeof currObj[attrs[j]]!="object"){
	                	//如果下一个属性是数字，则将当前对象声明为数组，否则声明为普通对象
	                    currObj=currObj[attrs[j]]= isNaN(attrs[j+1]) ? {} :[];
	                }else{
	                	currObj=currObj[attrs[j]];
	                }
	            };
	            var lastAttr=attrs[attrs.length-1];
	            if(!isNaN(lastAttr)){
	                lastAttr=lastAttr*1;
	            }
	            
	            if(elmt[0].type == "checkbox" && !elmt.attr("uncheckvalue")){
	            	_jsonDataGetValue(elmt,this,currObj,lastAttr);
	            }else if(elmt[0].type == "radio")
	            {
	            	if(currObj[lastAttr]==null)
	            	{
	            		currObj[lastAttr]="";
	            	}
	            	if(elmtValue!="")
	            	{
	            		currObj[lastAttr]=elmtValue;
	            	}
	            	
	            }else{
	            	currObj[lastAttr] = elmtValue;
	            }
				
	        }

	        return fullObj;
	    }
	}
	
	/**
	 * 重写jalor5框架，填充表单数据
	 */
	$.fn.jsonData = function (data){
	    //声明将要用到的变量
	    var elmtName,elmtValue,elmt,elmts=this.find(":input[name]").toArray();
	
	    //判断是否传递了用于填充的数据对象
	    if(data && typeof data=="object"){
	        //如果传递了 data参数，则将data中的数据绑定到容器中的form元素中
	        elmts=elmts.concat(this.find("label[name]").toArray());
	        elmts=elmts.concat(this.find("span[name]").toArray());
	        for(var i=0;i<elmts.length;i++){
	            elmt=$(elmts[i]);
	            elmtName=elmt.attr("name");
	            //根据elmtName取出data中相对应得数据
	            elmtValue=void 0;
	            try{elmtValue=eval("data."+elmtName);}catch(e){}
	            if(typeof elmtValue!="undefined"){
	                _jsonDataSetValue(elmt,elmtValue);
	            }
	        }
	      return this;
	    }else{
	        //如果没有任何参数，则需取出容器中的输入元素值，根据其name封装成对象返回
	        //用户缓存已经 设置或读取过的 name 属性，（相同name元素在同一次jsonData操作中的不会读取第二次）
	        var fullObj={},currObj,chkCache={};
	      
	        for(var i=0;i<elmts.length;i++){
	            elmt=$(elmts[i]);
	            elmtName=elmt.attr("name");
				elmtValue = _jsonDataGetValue(elmt,this);
				//当能取到值才去设置json数据
				if(!Jalor.DataHelper.isEmpty(elmtValue)){
		            currObj=fullObj;
		            var attrs=elmtName.match(/[a-zA-Z0-9_]+/g);
		            if(!attrs)
		            	continue;
		            for (var j=0; j < attrs.length-1; j++) {
		                if(typeof currObj[attrs[j]]!="object"){
		                	//如果下一个属性是数字，则将当前对象声明为数组，否则声明为普通对象
		                    currObj=currObj[attrs[j]]= isNaN(attrs[j+1]) ? {} :[];
		                }else{
		                	currObj=currObj[attrs[j]];
		                }
		            };
		            var lastAttr=attrs[attrs.length-1];
		            if(!isNaN(lastAttr)){
		                lastAttr=lastAttr*1;
		            }
		            
		            if(elmt[0].type == "checkbox" && !elmt.attr("uncheckvalue")){
		            	_jsonDataGetValue(elmt,this,currObj,lastAttr);
		            }else{
		            	currObj[lastAttr] = elmtValue;
		            }
				}
	        }

	        return fullObj;
	    }
	}
})(jQuery);