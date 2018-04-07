$(function(){
	var language = headerinfo.curlanguage=='en_US'?'en':'cn';
	var careerHost = window.location.href.indexOf("career.huawei.com")>0?"career.huawei.com":"nkweb-sit.huawei.com";
	window.hearderData={selectId: "tab1", hearderList : [
                            {hearderId : "100",hearderName:$.i18nKeyp('common.nav.home'), url : "campus4/content.html"},
                            // 社会招聘
                            {hearderId : "200",hearderName:$.i18nKeyp('common.nav.joinUs'), 
                            		url : "http://"+careerHost+"/socRecruitment/#soc/pages/home/socHome.html?language="+language, 
                            		forwordId : "201", href:true},
                            // 校园招聘
                         	{hearderId : "300",hearderName:$.i18nKeyp('common.nav.campus'), url : "",  secList : [
 	                            //应届生
                                {secId : "301", secName : $.i18nKeyp('home.graduate'), url : "campus4/pages/home/freshGraduate.html?type=2&faqtype=1"},//joblist/jobList.html?type=2
                                //实习生
                                {secId : "302", secName : $.i18nKeyp('home.intern'), url : "campus4/pages/home/trainee.html?type=0&faqtype=3"},//campus4/pages/joblist/jobList.html?type=0
                                //留学生
                                {secId : "304", secName : $.i18nKeyp('home.overseasStudent'),url : "campus4/pages/home/returnedStudent.html?type=1&faqtype=2"},//campus4/pages/joblist/jobList.html?type=1
                                //博士生
                                {secId : "305", secName : $.i18nKeyp('home.doctor'), url : "campus4/pages/home/doctoralStudent.html?type=3&faqtype=4"},//campus4/pages/joblist/jobList.html?type=3
                                //软件大赛
                                {secId : "700",secName:$.i18nKeyp('portal.hearder.HuaweiContest'), url : "campus4/pages/competition/competition.html"}
                            ]},                             
                            //{hearderId : "700",hearderName:$.i18nKeyp('portal.hearder.HuaweiContest'), url : "campus4/pages/competition/competition.html"},
                            //华为开放日
                            {hearderId : "900",hearderName:$.i18nKeyp('portal.hearder.HuaweiOpenDay'), url : "campus4/pages/openTime/openTime.html"},                            
			    // 认识华为
                            {hearderId : "800",hearderName:$.i18nKeyp('home.hearder.knowHuawei'), url : "campus4/pages/about/about.html"},
                            // 个人中心
                            {hearderId : "400",hearderName:$.i18nKeyp('common.nav.portalIndex'), url : "", clas:"personal", secList : [
 	                            //简历管理
                                {secId : "401", secName : $.i18nKeyp('resume.nav.resumemg'), validFlag:1, url : "portal/usercenter4/resumeManager/resumeManager.html"},
                                //订阅收藏
                                {secId : "402", secName : $.i18nKeyp('resume.nav.distine&fav'), validFlag:1, url : "portal/usercenter4/subscribe/subscribe.html"},
                                //应聘进展
                                {secId : "403", secName : $.i18nKeyp('Job.process'), validFlag:1,url : "portal/usercenter4/recruitmentProgress/recruitmentProgress.html"}
                                /*,
                                //入职进展
                                {secId : "404", secName : $.i18nKeyp('reumse.process.step4'), validFlag:1, url : ""}
                                */
                            ]}
                            
                        ]};
	/* 加载菜单模板 */
	JsTemplate("headerTabItemTemplate", $("#headerTabItemTemplate").html());
	/* 获取菜单对象 */
	var hearder = $("#hearderTabId");
	/* 渲染菜单数据 */
	hearder.html(JsTemplate('headerTabItemTemplate').render(hearderData));
	/* 菜单事件绑定 */
	$(".tabClass").click(function() {
		var that = $(this);
		//选中当前菜单
		$("#hearderTabId a").each(function(){
			$(this).css("color", "#333");
		});
		$("#hearderTabId #"+that.attr("pid")).attr("style","color: rgb(228, 31, 43);");
		that.css("color","rgb(228, 31, 43)");
		
		var url = that.attr("url");
		if(!url){ // 当连接URL为空时，触发forWord动作
			var forwordId = that.attr("forwordId");
			if(forwordId){
				$("#" + forwordId, $("#hearderTabId")).click();
			}
			return;
		} else {
			//判断是否为社招连接
			if(url.indexOf("socRecruitment")>0){
				var win = window;
				var loc = win.location;
				loc.href = url;
			}
		}
		var validFlag = that.attr("validFlag");
		//切换到个人中心，需要验证
		var win = window;
		var loca = win['location'];
		if(validFlag == 1){
			if(window.userinfo && userinfo.userAccount) {
				if(Portal.Common.checkuserishw()){
					Portal.Campus4.alert($.i18nKeyp('common.hwemp.notice'),'',function(){
						//$("#hearderTabId #100").click();
					}, false);
					return;
				}
				if(Portal.Common.getUserType() == '3'){
					forwordSoa(url);
					return;
				}
			}
			if(window.location.href.indexOf("portal4_index.html")>0){
				Portal.Campus4.forward(url,function(){ // forWord动作
					var thisId = that.attr("id");
					window.location.oldHash = url;
					Portal.Campus4.banner(thisId);
				});
			} else{
				loca.href= getUserCenterUrl()+"#"+url;
			}
		} else {
			if(window.location.href.indexOf("campus4_index.html")>0){
				Portal.Campus4.forward(url,function(){ // forWord动作
					var thisId = that.attr("id");
					window.location.oldHash = url;
					Portal.Campus4.banner(thisId);
				});
			} else {
				loca.href = getHomeUrl().replace("https://", "http://")+"#"+url;
			}
		}
	});
	
	/* 根据hashUr来查询对应菜单Id */
	var findTabByHashUrl = function(hearderData, url){
		var id = "";
		for ( var i = 0; i < hearderData.hearderList.length; i++) {
			var hearder = hearderData.hearderList[i];
			if (hearder.url === url) {
				id = hearder.hearderId;
				break;
			}
			if (hearder.secList) {
				for ( var j = 0; j < hearder.secList.length; j++) {
					var sec = hearder.secList[j];
					if (sec.url === url) {
						id = sec.secId;
						break;
					}
				}
			}
			if (id) {
				break;
			}
		}
		return id;
	};
	/* 如果存在hash，访问hash连接，用于页面刷新操作*/
	if (window.location.hash) {
		var url = window.location.hash.substr(1);
		// 根据hashUr来查询对应菜单Id
		var id = findTabByHashUrl(hearderData, url);
		if (id) {
			$("#" + id, $("#hearderTabId")).click();
		} else {
			Portal.Campus4.forward(url);
		}
	} else {
		if(window.location.href.indexOf("portal4_index.html")>0){
			Portal.Campus4.forward("portal/usercenter4/resumeManager/resumeManager.html");
		} else {
			Portal.Campus4.forward("campus4/content.html");
		}
	} 
	
	/* portalHashInterval: 用于监听Hash值变化*/ 
	clearInterval(window.location.portalHashInterval);
	window.location.portalHashInterval = setInterval(function() {
		var win = window;
		var loca = win['location'];
		var oldHash = loca.oldHash;
		var nowHash = loca.hash;
		if (nowHash && oldHash) {
			if (oldHash !== nowHash) {
				var url = window.location.hash.substr(1);
				var newUrl = decodeURIComponent(url);
				var loc = window["location"];
				if(newUrl != url){
					loc["hash"] = newUrl;
					return;
				}
				if(window.location.href.indexOf("portal4_index.html")==-1){
					Portal.Campus4.load(url,function() {
						// 根据hashUr来查询对应菜单Id
						//var id = findTabByHashUrl(hearderData, url);
						//Portal.Campus4.banner(id);
					});
				}
			}
		}
		loca.oldHash = nowHash;
	}, 100);
	window.portalVersion = '3';
	
	//意见反馈
	$("#feedbackBut").click(function(){
		if(!headerinfo || !headerinfo.user || headerinfo.user == null || headerinfo.user == "null"){
			Portal.Campus4.confirm($.i18nKeyp("portal.campus4.login"),'',function(type){
				if(type == 1){
					var win = window;
					var loca = win['location'];
					loca.href = "http://" + loca.host + "/reccampportal/loginIndex?redirect=" + loca.href;
				}
			});
			return;
		}
		var options = {
			url:"campus4/pages/feedback/feedback.html",
			title:"",//$.i18nKeyp("resume.nav.feedback"),
			width : 700,
			height : 480,
			fnLoad : function() {
			/*Portal.faqContent.init(infoId,type);*/
			}
		};
		
		Portal.Campus4.dialog(options);
	});
	//常见问题
	var moduleFaq = function()
	{
		/*var type = "module";*/
		var options = {
			url:"campus4/pages/faq/faqContent.html",
			title:$.i18nKeyp("home.portal.commonQuestion"),
			width : 600,
			height : 780,
			fnLoad : function() {
			/*Portal.faqContent.init(infoId,type);*/
			}
		};
		
		Portal.Campus4.dialog(options);
	};
	$("#faqBtn").click(function(){
		moduleFaq();
	});
	
	//国际化首页
	$("#backTopSpan").text($.i18nKeyp("portal.home.backTop"));//返回顶部
	$("#feedbackSpan").text($.i18nKeyp("resume.nav.feedback"));//意见反馈
	$("#faqSpan").text($.i18nKeyp("home.portal.commonQuestion"));//常见问题
	
	
	setTimeout(function(){
		//footer底部	
		$.ajax({
			url : 'services/portal/portaluser/getHtmlContent',
			type : 'GET',
			dataType:"json",
			data : {"type":"Resources","name":"portal_footer"},
			async : false,
			success : function(data) {
				$("#footerDiv").html(data.content);
			}
		});
	}, 800);
	
	//文字过长,加入省略号样式
	//tiwenBtn是faq中的提问，addBtn加入华为人才库，submitHWPeople提交并加入华为人才库,phoneCodeBtn注册页面中的获取验证码,search搜索按钮
	//submit_fbbtn面试反馈中，提交我的反馈按钮,jd_word1_4 offer确认跟入职信息确认,.line1 .title校园招聘下面，研发类跟非研发类
	/*var ellipsBd=$("label,dt,a,.tiwenBtn,.addBtn,.submitHWPeople,.phoneCodeBtn,.search,.submit_fbbtn,.setSubscribe .btn,.pro-tab .tab1,.pro-tab .tab2,.jd_word1_4,.research,.nonresearch,.line1 .title,.re_right dd,.indexBtm dl dd p,.head .center li li a");
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
	
	var nowHref = window.location.href;
	if(nowHref.indexOf("/reccampportal/#") + nowHref.indexOf("/reccampportal/campus4_index.html#") < 0 && nowHref.indexOf("/reccampportal/portal4_index.html") < 0){
		var win = window;
		var loc = win.location;
		loc.href = nowHref.replace(/reccampportal\/.+#/, 'reccampportal/campus4_index.html#');
	}
});