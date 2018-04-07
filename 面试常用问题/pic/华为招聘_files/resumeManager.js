Jalor.Module.define("Portal.center.ResumeManager",function(page,$S){
	//面试所在地，非国内城市，取lookup配置地点
	var locs = Jalor.Component.Lookup.getList('expectation_interview_location','',workspaceVO.currentLanguage);
	//招聘类型，0校招，2博士
	page.resumeType = '0';
	
	//最高学历
	page.highestDegree = '';
	
	page.ready = function(){
		//初始化数据
		page.init();	
	}
	
	var resumeInfo = null;
	/**
	 * 初始化页面数据
	 */
	page.init = function(initFlag){
		var resume = Portal.UserCenter4.resume;
		var resumeId = resume.resumeId||-1;
		if(!locs || locs.length ==0){
			Jalor.doGet("services/portal/portalpub/queryStateLookup/0",null,
			function(data){
				if(data){
					locs = data;
				}
			});
		}
		
		
		//加载基本信息
		page.initBaseInfo();
		
		//初始化简历完整度
		page.initPer();
		
		if(resumeId != -1){
			//加载简历删除按钮
			if(resume.highestDegree){
				$("#managerOrDel").show();
				$("#resumeDel").show();
			} else {
				$("#resumeDel").hide();
			}
						
			//招聘类型：0校招，2博士
			var resumeType = resume.resumeType||'0';
			page.resumeType = resumeType;
			page.highestDegree = resume.highestDegree;
			//校招隐藏期望薪资
			if(resume.resumeType == 0 || !resume.anticipantCompensation){
				$("#anticipantCompensationDiv").hide();
			}
			
			//加载左侧内容
			var modelArr = Jalor.Component.Lookup.getList('resume_scores_per_'+resumeType,'',workspaceVO.currentLanguage);
			$("#otherModelDiv").html("");
			for(var i=0;i<modelArr.length;i++){
				var model = modelArr[i];
				if(model.itemCode == "baseInfo"){
					continue;
				}
				//对应模块 
				var modelTemp = model.itemCode+"DivTemp";
				var modelDiv = $('#'+modelTemp).html();
				if(modelDiv){
					var language = workspaceVO.currentLanguage;
					//model.itemName = (language=='en_US'?(model.itemDesc||model.itemName):model.itemName);
					$("#otherModelDiv").append($(JsTemplate(modelTemp, modelDiv).render({data : model})));
				}
			}
			//初始化华为亲属
			page.initIsFamilyHuawei(resume.isFamilyHuawei);
			//初始化是否有专利
			page.initIsPatent(resume.isPatent);
			//init
			Jalor.doGet("services/portal/portaluser/findResumeInfo",null,
			function(data){
				resumeInfo = data;
				//加载教育经历
				page.initOtherData({
					viewTemp:"eduViewTemp",
					editTemp:"eduEditTemp",
					thisDiv:"eduDiv",
					voId:"eduId",
					resumeId:resumeId,
					isAdd:true,
					queryUrl:"services/portal/portaluser/pro/findTalentResumeEduList",
					upUrl:"services/portal/portaluser/pro/updateTalentResumeEduVO",
					addUrl:"services/portal/portaluser/pro/insertTalentResumeEduVO",
					checkUrl:"services/rec/baseTalent/base/findTalentResumeQualifications/{0}".formatValue(resumeId)
				});
				
				//获奖经历
				page.initOtherData({
					viewTemp:"prizeViewTemp",
					editTemp:"prizeEditTemp",
					thisDiv:"prizeDiv",
					voId:"prizeId",
					resumeId:resumeId,
					queryUrl:"services/portal/portaluser/pro/findTalentResumePrizeVOListByResumeId",
					upUrl:"services/portal/portaluser/pro/updateResumePrizeVO",
					addUrl:"services/portal/portaluser/pro/insertResumePrizeVO"
				});
				
				//加载语言情况
				page.initOtherData({
					viewTemp:"languageViewTemp",
					editTemp:"languageEditTemp",
					thisDiv:"languageDiv",
					voId:"languageId",
					resumeId:resumeId,
					isAdd:(resumeType==0?true:false),
					queryUrl:"services/portal/portaluser/pro/findTalentResumeLanguageList",
					upUrl:"services/portal/portaluser/pro/updateTalentLanguageVO",
					addUrl:"services/portal/portaluser/pro/insertTalentLanguageVO"
				});
				
				//加载项目经历
				page.initOtherData({
					viewTemp:"projectViewTemp",
					editTemp:"projectEditTemp",
					thisDiv:"projectDiv",
					voId:"projectId",
					resumeId:resumeId,
					isAdd:(resumeType==0?false:true),
					queryUrl:"services/portal/portaluser/pro/findTalentResumeProjectList",
					upUrl:"services/portal/portaluser/pro/updateTalentProjectExpVO",
					addUrl:"services/portal/portaluser/pro/insertTalentProjectExpVO"
				});	
				//加载专业技能
				page.initOtherData({
					viewTemp:"skillViewTemp",
					editTemp:"skillEditTemp",
					thisDiv:"skillDiv",
					voId:"itemId",
					resumeId:resumeId,
					queryUrl:"services/portal/portaluser/pro/findTalentResumeSkillList",
					upUrl:"services/portal/portaluser/pro/updateTalentSkillVO",
					addUrl:"services/portal/portaluser/pro/insertTalentSkillVO"
				});
				//加载家庭成员
				page.initOtherData({
					viewTemp:"contactViewTemp",
					editTemp:"contactEditTemp",
					thisDiv:"contactDiv",
					voId:"contactId",
					isAdd:(resumeType==0?true:false),
					resumeId:resumeId,
					queryUrl:"services/portal/portaluser/pro/findTalentResumeContactList",
					upUrl:"services/portal/portaluser/pro/updateTalentContactVO",
					addUrl:"services/portal/portaluser/pro/insertTalentContactVO"
				});
				//加载华为亲属
				page.initOtherData({
					viewTemp:"huaweiContactViewTemp",
					editTemp:"huaweiContactEditTemp",
					thisDiv:"huaweiContactDiv",
					voId:"contactId",
					resumeId:resumeId,
					queryUrl:"services/portal/portaluser/pro/findTalentResumeHuaweiContactList",
					upUrl:"services/portal/portaluser/pro/updateTalentHuaweiContactVO",
					addUrl:"services/portal/portaluser/pro/insertTalentHuaweiContactVO"
				});
				
				if(page.resumeType == 2){
					//加载社会实践-博士
					page.initOtherData({
						viewTemp:"practiceViewTemp",
						editTemp:"practiceEditTemp",
						thisDiv:"practiceDiv",
						voId:"practiceId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentResumePracticeVOListByResumeId",
						upUrl:"services/portal/portaluser/pro/updateResumePracticeVO",
						addUrl:"services/portal/portaluser/pro/insertResumePracticeVO"
					});
					//加载实践经历-博士
					page.initOtherData({
						viewTemp:"doctorWorkExpViewTemp",
						editTemp:"doctorWorkExpEditTemp",
						thisDiv:"workExpDiv",
						voId:"preId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentResumeEmployerList",
						upUrl:"services/portal/portaluser/pro/updateTalentEmployerVO",
						addUrl:"services/portal/portaluser/pro/insertTalentEmployerVO"
					});
					//加载发表论文-博士
					page.initOtherData({
						viewTemp:"paperViewTemp",
						editTemp:"paperEditTemp",
						thisDiv:"paperDiv",
						voId:"paperId",
						resumeId:resumeId,
						isAdd:true,
						queryUrl:"services/portal/portaluser/pro/findTalentResumePaperVOListByResumeId",
						upUrl:"services/portal/portaluser/pro/updateResumePaperVO",
						addUrl:"services/portal/portaluser/pro/insertResumePaperVO"
					});
					//$("#paperDiv .addBtn").remove();
					
					//加载发明专利-博士
					page.initOtherData({
						viewTemp:"patentViewTemp",
						editTemp:"patentEditTemp",
						thisDiv:"patentDiv",
						voId:"patentId",
						resumeId:resumeId,
						//isAdd:true,
						queryUrl:"services/portal/portaluser/pro/findTalentResumePatentVOListByResumeId",
						upUrl:"services/portal/portaluser/pro/updateResumePatentVO",
						addUrl:"services/portal/portaluser/pro/insertResumePatentVO"
					});
					//加载参加学术会议-博士
					page.initOtherData({
						viewTemp:"meetingViewTemp",
						editTemp:"meetingEditTemp",
						thisDiv:"meetingDiv",
						voId:"meetingId",
						resumeId:resumeId,
						isAdd:false,
						queryUrl:"services/portal/portaluser/pro/findTalentResumeMeetingVOListByResumeId",
						upUrl:"services/portal/portaluser/pro/updateResumeMeetingVO",
						addUrl:"services/portal/portaluser/pro/insertResumeMeetingVO"
					});
				} else {		
					//加载工作意向
					page.initInten();
					//加载培训经历
					page.initOtherData({
						viewTemp:"trainingViewTemp",
						editTemp:"trainingEditTemp",
						thisDiv:"trainingDiv",
						voId:"trainId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentResumeTrainingList",
						upUrl:"services/portal/portaluser/pro/updateTalentTrainingVO",
						addUrl:"services/portal/portaluser/pro/insertTalentTrainingVO"
					});
					//加载专业资格证书
					page.initOtherData({
						viewTemp:"certificatViewTemp",
						editTemp:"certificatEditTemp",
						thisDiv:"certificatDiv",
						voId:"certId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentResumeCertificatList",
						upUrl:"services/portal/portaluser/pro/updateTalentCertificatVO",
						addUrl:"services/portal/portaluser/pro/insertTalentCertificatVO"
					});
					//加载其他信息
					page.initOtherData({
						viewTemp:"otherViewTemp",
						editTemp:"otherEditTemp",
						thisDiv:"otherDiv",
						voId:"attachmentId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentAttachmentVOListByResumeId",
						upUrl:"services/portal/portaluser/pro/updateTalentAttachmentVO",
						addUrl:"services/portal/portaluser/pro/insertTalentAttachmentVO"
					});
					
					//加载实践经历-本硕
					page.initOtherData({
						viewTemp:"workExpViewTemp",
						editTemp:"workExpEditTemp",
						thisDiv:"workExpDiv",
						voId:"preId",
						resumeId:resumeId,
						queryUrl:"services/portal/portaluser/pro/findTalentResumeEmployerList",
						upUrl:"services/portal/portaluser/pro/updateTalentEmployerVO",
						addUrl:"services/portal/portaluser/pro/insertTalentEmployerVO"
					});				
				}
			});
			$(".addBtn").each(function(){
				$(this).attr("title",$(this).text());
			});
			//当为完善简历时，弹出保密协议
			/*var md5Id = Jalor.Page.getRequest().md5Id||'';
			if(md5Id && initFlag != "edit"){
				page.showPrivacy();
			}*/
		} else {
			//第一次无简历时，弹出保密协议弹出框
			//page.showPrivacy();
			//$("#privacyClsDiv").removeClass('closebtn_privacy');//去掉关闭叉叉
			$("#startWriteDiv").css({"background":"#ccc"});//按钮置灰
			//隐藏基本信息取消按钮
			$(".sec1_form_cancel").hide();
		}
		
		//判断是否有签署协议，未签署则弹出框让他重新签署。
		if(resume.isAcceptabilityCommitment != 1 && !resume.signedFileAttachmentId){
			page.showPrivacy();
		}
		
		//初始化事件
		page.initClick();
		//国际化初始化
		$(".i18n").i18nKeyp();
	}

	/**
	 * 初始化简历基本信息
	 */
	page.initBaseInfo = function(isEdit){
		var resume = Portal.UserCenter4.resume;
		if(resume && resume.resumeId){
			if(isEdit == "edit"){
				debugger;
				$("#baseInfoForm_Detail").hide();
				//展示基本信息编辑
				$("#baseInfoForm").show();
				//设置面试地
				if(resume.resumeTemplateName){
					resume.schoolOrInterviewLocus = resume.resumeTemplateName;
				}
				//设置招聘类型
				//$("#baseInfoForm input[name='resumeType']").jalorSetValue(resume.resumeType);
				//加载基本信息
				page.loadBaseInfoEdit(resume);
				$("#baseInfoForm input[name='indentifiedId']").addClass("idcardUnique");
			} else {
				debugger;
				$("#baseInfoForm").hide();
				//展示基本信息
				$("#baseInfoForm_Detail").show();
				resume.age = Math.floor((new Date()-new Date((resume.birthDateStr||'').replace('-','/')))/ 1000 / 60/60/24/365);//计算生日
				//设置面试地
				if(resume.resumeTemplateName){
					var language = workspaceVO.currentLanguage;
					for(var i=0;i<locs.length;i++){
						var loc = locs[i];
						if(loc.itemCode == resume.resumeTemplateName){
							if(language == "zh_CN"){
								resume.schoolOrInterviewLocus = loc.itemDesc;
							} else {
								resume.schoolOrInterviewLocus = loc.itemName;
							}
							break;
						}
					}
					resume.schoolOrInterviewCity = '';
				}
				//显示，博士的字段
				if(resume.resumeType == 2){
					//学校所在国家
					resume.countryOfSchoolName = Portal.center.resume.getCountryOfSchool(resume.countryOfSchool);
					//当学校所在国家为海外时，隐藏所在市
					if(resume.countryOfSchool != 'China'){
						$("#docInfoDiv").find("#schoolOrInterviewLocusLi").hide();
						$("#docInfoDiv").find("#schoolOrInterviewCityLi").hide();
					} else {
						$("#docInfoDiv").find("#schoolOrInterviewLocusLi").show();
						$("#docInfoDiv").find("#schoolOrInterviewCityLi").show();
					}
					//最高学历
					
					$("#docInfoDiv").show();
					$("#graduateInfoDiv").hide();
					$("#schoolCountryId").hide();//学校所在国家
					$("#researchWayLi").hide();//研究方向
				} else {
					$("#docInfoDiv").hide();
					$("#graduateInfoDiv").show();
					$("#schoolCountryId").show();//学校所在国家
					$("#researchWayLi").show();//研究方向
					if(resume.countryOfSchool == 'China'){
						$("#graduateInfoDiv #schoolOrInterviewLocusLi label").attr("i18nKeyp",$.i18nKeyp('Resume.baseinfo.schoolOrInterviewLocus'));
						$("#graduateInfoDiv #schoolOrInterviewCityLi label").attr("i18nKeyp",$.i18nKeyp('Resume.baseinfo.schoolOrInterviewCity'));
					}else{
						$("#graduateInfoDiv #schoolOrInterviewLocusLi label").attr("i18nKeyp",$.i18nKeyp('resume.ProvinceofInterview'));
						if(resume.schoolOrInterviewLocus=='other'){
							$("#graduateInfoDiv #schoolOrInterviewCityLi label").attr("i18nKeyp",$.i18nKeyp('Resume.concrete.icity'));
						}else{
							$("#graduateInfoDiv #schoolOrInterviewCityLi label").attr("i18nKeyp",$.i18nKeyp('resume.CityofInterview'));
						}
					}
				}
				if(resume.nationality=="PQH_CN"){
					$("#nativePlaceId").show();
				}else{
					$("#nativePlaceId").hide();
				}
				/*//最高学历  优化 延迟加载 hwx216151 20170906
				resume.highestDegreeName = Portal.center.resume.getQualificationName(resume.highestDegree,(resume.countryOfSchool||"-1"));
				//籍贯
				resume.nativePlaceName = Portal.center.resume.getStateName(resume.nativePlace);
				//学校所在国家
				resume.countryOfSchoolName = Portal.center.resume.getCountryOfSchool(resume.countryOfSchool);
				//省
				resume.schoolOrInterviewLocusName = Portal.center.resume.getStateName(resume.schoolOrInterviewLocus);
				//市
				resume.schoolOrInterviewCityName = Portal.center.resume.getCityName(resume.schoolOrInterviewCity,resume.schoolOrInterviewLocus);*/
				$("#baseInfoForm_Detail span[name]").text("");
				$("#baseInfoForm_Detail").jsonData(resume);
				setTimeout(function(){
					//最高学历
					resume.highestDegreeName = Portal.center.resume.getQualificationName(resume.highestDegree,(resume.countryOfSchool||"-1"));
					$("[name=highestDegreeName]").text(resume.highestDegreeName);
					//籍贯
					resume.nativePlaceName = Portal.center.resume.getStateName(resume.nativePlace);
					$("[name=nativePlaceName]").text(resume.nativePlaceName);
					//学校所在国家
					resume.countryOfSchoolName = Portal.center.resume.getCountryOfSchool(resume.countryOfSchool);
					$("[name=countryOfSchoolName]").text(resume.countryOfSchoolName);
					//省
					resume.schoolOrInterviewLocusName = Portal.center.resume.getStateName(resume.schoolOrInterviewLocus);
					$("[name=schoolOrInterviewLocusName]").text(resume.schoolOrInterviewLocusName);
					//市
					resume.schoolOrInterviewCityName = Portal.center.resume.getCityName(resume.schoolOrInterviewCity,resume.schoolOrInterviewLocus);
					$("[name=schoolOrInterviewCityName]").text(resume.schoolOrInterviewCityName);
					//加载相片
					if(resume.photoAttachmentId){
						$("#baseinfophoto_Detail").initPhoto(resume.photoAttachmentId);
					}
					//加载简历附件
					/*if(resume.attachmentId){
						$("#attachmentFile_detail").attr("href","servlet/download?dlType=ImageAttachment&attachmentType=ResumeFile&attachmentId="+(resume.attachmentId));
					} else {
						$("#attachmentFile_detail").removeAttr("href");
					}*/
					//证件显示
					if(!resume.indentifiedTypeName && !resume.indentifiedId){
						$("#baseInfoForm_Detail span[name=indentifiedTypeName]").parent().hide();
					}
				}, 800);
					
			    //编辑，删除按钮显示隐藏
				$("#baseInfoForm_Detail").mouseenter(function(){
		    		$(this).find('.edit').show();
		    	});
				$("#baseInfoForm_Detail").mouseleave(function(){
		        	$(this).find('.edit').hide();
		        });
			}
		} else {
			//新增或编辑基本信息
			$("#baseInfoForm_Detail").hide();
			//展示基本信息编辑
			$("#baseInfoForm").show();
			//加载基本信息
			page.loadBaseInfoEdit();
		}
		//完善简历，隐藏面试地点
		/*var md5Id = Jalor.Page.getRequest().md5Id;
		if(md5Id){
			$("#interviewAddressDiv").hide();
			
			$("#schoolOrInterviewLocusLi").hide();
			$("#schoolOrInterviewCityLi").hide();
		} else {
			$("#interviewAddressDiv").show();
			
			$("#schoolOrInterviewLocusLi").show();
			$("#schoolOrInterviewCityLi").show();
		}*/
		//初始化校验
		$("#baseInfoForm").jalorValidate();
		$(".i18n").i18nKeyp();
		$("#schoolOrInterviewLocus").next(".jalor-dropdown-btn").click();
		$("#schoolOrInterviewLocus_ddl").hide();
	}

	/**
	 * 修改人才类型
	 */
	page.changeResumeType = function(){
		var form = $("#baseInfoForm").jsonData();
		var resume = page.copyObj(Portal.UserCenter4.resume);
		var resumeType = 0;
		if(resume && resume.resumeId){
			form.resumeId = resume.resumeId;
		}
		form = $.extend(resume, form || {});
		var resumeType = $("#baseInfoForm input[name='resumeType']").jalorGetValue();
		form.resumeType = resumeType;
		page.loadBaseInfoEdit(form);
	}
	/**
	 * 修改最高学历
	 */
	page.changeHighestDegree = function(){
		var form = $("#baseInfoForm").jsonData();
		var resume = page.copyObj(Portal.UserCenter4.resume);
		var resumeType = 0;
		if(resume && resume.resumeId){
			form.resumeId = resume.resumeId;
		}
		form = $.extend(resume, form || {});
		//var resumeType = $("#baseInfoForm input[name='resumeType']").jalorGetValue();
		form.resumeType = (form.highestDegree=='Doctor'?2:0);
		page.loadBaseInfoEdit(form);
	}
	page.copyObj = function(obj){
		obj = obj||{};
		var newObj = {};
		for(var attr in obj){
			newObj[attr] = obj[attr];
		}
		return newObj;
	}
	
	
	/**
	 * 修改学历类型判断是否国家重点实验室和所在实验室是否必填
	 */
	page.changeQualification = function(obj){
		var value = $(obj).jalorGetValue();
		var otherDiv = $(obj).closest('.education_form').find('#docEduOtherDiv');
		if(value=="Doctor"){
			//$(obj).closest('.education_form').find('#docEduOtherDiv').show();
			otherDiv.find(".red").html("*");
			otherDiv.find("input").addClass("required");
		}else{
			//$(obj).closest('.education_form').find('#docEduOtherDiv').hide();
			otherDiv.find(".red").html("");
			otherDiv.find("input").removeClass("required");
		}
	}
	
	//加载编辑页面
	page.loadBaseInfoEdit = function(resumeP){
		debugger;
		var resume = resumeP || {}
		var resumeType = 0;
		var indentifiedType = 0;
		if(resume && resume.resumeId){
			resumeType = resume.resumeType || 0;
			indentifiedType = resume.indentifiedType || 0;
		}
		if(resume && resume.resumeType){
			resumeType = resume.resumeType || 0;
		}
		//加载基本信息魔板
		var baseInfoTemp = $("#baseInfoEditDivTemp").html();
		if(resumeType == 2){
			baseInfoTemp = $("#docBaseInfoEditDivTemp").html();
		}
		var baseInfoTemp = $(baseInfoTemp);
		baseInfoTemp.jalorValidate();
		baseInfoTemp.find(".i18n").i18nKeyp();
		Jalor.ready(baseInfoTemp);
		$("#baseInfoForm #baseInfo").html(baseInfoTemp);
		$("#baseInfoForm #baseInfo").jsonData(resume);
		
		//加载相片
		if(resume && resume.photoAttachmentId){
			$("#baseinfophoto").initPhoto(resume.photoAttachmentId);
		}
		//加载附件
		if(resume && resume.attachmentId){
			$("#baseInfoForm #attachmentDel").show();
			$("#baseInfoForm #attachmentNameLab").show();
			$("#baseInfoForm #attUploadFile").hide();
			//$("#attachmentFile").attr("href","servlet/download?dlType=ImageAttachment&attachmentType=ResumeFile&attachmentId="+(resume.attachmentId));
			$("#baseInfoForm #attachmentNameLab").text(resume.attachmentName);
		} else {
			$("#baseInfoForm #attachmentDel").hide();
			$("#baseInfoForm #attachmentNameLab").hide();
			$("#baseInfoForm #attUploadFile").show();
		}
		//初始化院校所在国家
		page.changeCountryOfSchool();
		page.changeProvinceOfSchool();
		//出生日期
		if(indentifiedType == 1){
			$("#birthDate").attr("disabled",'disabled');
			$("#birthDate").attr("readonly",'readonly');
		}
		$(".i18n").i18nKeyp();

		//下拉框输入框提示
		if(resumeType == 2){
			baseInfoTemp.find("input[name='countryOfSchool']").attr("placeholder",$.i18nKeyp("portal.center.baseinfo.country"));
			page.setCity();
		}
		baseInfoTemp.find("input[name='schoolOrInterviewLocus']").attr("placeholder",$.i18nKeyp("Resume.inteview.state"));
		baseInfoTemp.find("input[name='schoolOrInterviewCity']").attr("placeholder",$.i18nKeyp("Resume.inteview.city"));
		$("#effort").attr("placeholder",$.i18nKeyp("Resume.detail.effort.placeholder"));
		$("#effortDoc").attr("placeholder",$.i18nKeyp("Resume.detail.effort.placeholder"));
		setTimeout(function(){
			if(resume.schoolOrInterviewLocus=='other'){
				$(".otherCityTwo").jalorSetValue(resume.schoolOrInterviewCity);
			}else{
				$("#baseInfoForm #baseInfo").find("input[name='schoolOrInterviewCity']").jalorSetValue(resume.schoolOrInterviewCity);
				$("#baseInfoForm #baseInfo").find("input[name='schoolOrInterviewLocus']").next(".jalor-dropdown-btn").click();
				$("#baseInfoForm #baseInfo").find("input[name='schoolOrInterviewCity']").next(".jalor-dropdown-btn").click();
			}
		},300);
		setTimeout(function(){
			$("#baseInfoForm #baseInfo").find("input[name='schoolOrInterviewCity']").next(".jalor-dropdown-btn").click();
		},600);
		baseInfoTemp.find("input[name='nativePlace']").attr("placeholder",$.i18nKeyp("Resume.inteview.state"));
		page.initTitleKey(baseInfoTemp);
		$("#baseinfophoto").attr("title",$.i18nKeyp("Resume.cer.uploadimgTips"));
		$("#uploadTitle").attr("title",$.i18nKeyp("Resume.cer.uploadimgTips"));
		
		/*$("input[name='schoolOrInterviewLocus']").jalorSetValue(resume.schoolOrInterviewLocus);
		$("input[name='schoolOrInterviewCity']").jalorSetValue(resume.schoolOrInterviewCity);
		
		$("input[name='schoolOrInterviewLocus']").next(".jalor-dropdown-btn").click();
		$("#schoolOrInterviewLocus_ddl").hide();
		$("input[name='schoolOrInterviewCity']").next(".jalor-dropdown-btn").click();
		$("#schoolOrInterviewCity_ddl").hide();
		$("#docSchoolOrInterviewCity_ddl").hide();*/
	}
	
	/**
	 * 初始化简历的完整度
	 */
	page.initPer = function(){
		var resume = Portal.UserCenter4.resume;
		if(resume && resume.resumeId){
			//设置简历编号
			$("#hrResumeNo").text(resume.hrResumeNo);	
			
			var num = 0;
			var resumeType = resume.resumeType||0;
			var htmlArr = [];
			htmlArr.push("<dt>");
			htmlArr.push("	<div class='clearfix'><span class='i18n txt ellipsis_add' title='Completeness'>"+$.i18nKeyp("Portal.main.cmpleteness")+"</span> <span class='gray' id='throughIntegrity'></span><span class='preview_lyc bsxz_gezx_preview ellipsis_add' onclick='Portal.center.ResumeManager.openView()'>"+$.i18nKeyp("portal.center.viewResume")+"</span></div>");
			htmlArr.push("	<div class='progress clearfix'>");
			htmlArr.push("		<div class='width100'></div>");
			htmlArr.push("		<div class='widthper'></div>");
			htmlArr.push("	</div>");
			htmlArr.push("</dt>");
			var language = headerinfo.curlanguage;
			//获取模块信息
			var modelArr = Jalor.Component.Lookup.getList('resume_scores_per_'+resumeType,'',language);		
			//拼接模块栏目
			var num = 0;
			for(var i=0;i<modelArr.length;i++){
				var model = modelArr[i];
				//判断是否已填写
				var isWrite = page.isWrite(model.itemCode);
				var clas = "";
				if(isWrite){
					clas = "finish";//已填样式
					num = num + parseInt(model.itemAttr1);//模块分数
				}
				//判断是否必填项
				var grayHtml = "";
				if(model.itemAttr2){
					grayHtml = "<span class='gray'>("+$.i18nKeyp("portal.center.required")+")</span>";
				}
				var modelName = model.itemName;//(language=='en_US'?(model.itemDesc||model.itemName):model.itemName);
				htmlArr.push("<dd class='"+clas+"'><a href='#"+model.itemCode+"Div'>"+modelName+grayHtml+"</a></dd>");
			}
			var modelManage = $(htmlArr.join(""));
			
			//设置进度
			modelManage.find("#throughIntegrity").text(num+"%");
			modelManage.find(".widthper").attr("style","width:"+num+"%");
			
			$(".model_list").html(modelManage);
			$('.model_list').onePageNav();

			$("#uploadDiv").hide();//隐藏简历上传
			//隐藏左侧模块
			$(".resumeNumdl").show();
			$(".model_list").show();
		} else {
			$("#uploadDiv").show();//第一次注册显示简历上传
			//隐藏左侧模块
			$(".resumeNumdl").hide();
			$(".model_list").hide();
		}
	}
	//是否已填写
	page.isWrite = function(modelId){
		var resume = Portal.UserCenter4.resume;
		var perMap = resume.resumePerMap;
		//基本信息
		if(modelId == "baseInfo"){
			return true;
		}
		//工作意向
		if(modelId == "inten" && resume.intentionPlaceOne){
			return true;
		}
		//教育经历
		if(modelId == "edu" && perMap.EDUCOUNT>0){
			return true;
		}
		//获奖信息
		if(modelId == "prize" && perMap.PRIZECOUNT>0){
			return true;
		}
		//语言情况
		if(modelId == "language" && perMap.LANGUAGECOUNT>0){
			return true;
		}
		//项目经历
		if(modelId == "project" && perMap.PROJECTEXPCOUNT>0){
			return true;
		}
		//专业技能
		if(modelId == "skill" && perMap.SKILLCOUNT>0){
			return true;
		}
		//专业资格证书
		if(modelId == "certificat" && perMap.CERTIFICATCOUNT>0){
			return true;
		}
		//家庭成员
		if(modelId == "contact" && perMap.CONTACTCOUNT>0){
			return true;
		}
		//华为亲属
		if(modelId == "huaweiContact" && (perMap.HWCONTACTLISTCOUNT>0 || perMap.HWCONTACTCOUNT>0)){
			return true;
		}
		//其他信息
		if(modelId == "other" && perMap.ATTCOUNT>0){
			return true;
		}
		//实践经历
		if(modelId == "workExp" && perMap.EMPLOYERCOUNT>0){
			return true;
		}
		//培训经历
		if(modelId == "training" && perMap.TRAININGCOUNT>0){
			return true;
		}
		//发表论文
		if(modelId == "paper" && perMap.PAPERCOUNT>0){
			return true;
		}
		//发明专利
		if(modelId == "patent" && (perMap.PATENTLISTCOUNT>0 || perMap.PATENTCOUNT>0)){
			return true;
		}
		//参加学术会议
		if(modelId == "meeting" && perMap.MEETINGCOUNT>0){
			return true;
		}
		//社会实践
		if(modelId == "practice" && perMap.PRACTICECOUNT>0){
			return true;
		}
		return false;
	}
	/**
	 * 初始化工作意向
	 */
	page.initInten = function(isEdit){
		var resume = Portal.UserCenter4.resume;
		//加载工作意向
		var initHtml = "<h2>"+$.i18nKeyp('Resume.baseinfo.intention')+"</h2>";
		var xian1 = "";
		var xian2 = "";
		if(resume && resume.intentionPlaceOne){
			if(isEdit == "edit"){
				initHtml = initHtml + $("#intenEditTemp").html();
				initHtml = $(initHtml);
				/*xian1 = resume.intentionPlaceOne;
				xian2 = resume.intentionPlaceTwo;
				resume.intentionPlaceOne = "";
				resume.intentionPlaceTwo = "";
				*/
				initHtml.jsonpData(resume);
			} else {
				initHtml = initHtml + $("#intenViewTemp").html();
				initHtml = "<div>" + initHtml + "</div>";
				initHtml = $(initHtml);
				initHtml.jsonData(resume);
			}
		} else {
			initHtml = initHtml + $("#intenEditTemp").html();
			initHtml = $(initHtml);
			initHtml.jsonpData(resume);
		}
		(initHtml.length>2?$(initHtml[2]):initHtml).mouseenter(function(){
    		$(this).find('.edit_item').show();
    		$(this).addClass('cur');
    	});
		(initHtml.length>2?$(initHtml[2]):initHtml).mouseleave(function(){
        	$(this).find('.edit_item').hide();
        	$(this).removeClass('cur');
        });
		initHtml.find('.edit_item').hide();
		Jalor.ready(initHtml);
		$("#intenDiv").html(initHtml);
		/*if(isEdit == "edit" && xian1){
			Portal.center.ResumeManager.bindBox("intentionPlaceOne",xian1);
			Portal.center.ResumeManager.bindBox("intentionPlaceTwo",xian2);
			resume.intentionPlaceOne = xian1;
			resume.intentionPlaceTwo = xian2;
		}*/
		$("#intenDiv").show();
		$("#intenDiv").find(".i18n").i18nKeyp();
		page.initTitleKey($("#intenDiv"));
		$("[type='radio']:checked").siblings('label').click();
	}
	//为下拉框绑定值
	page.bindBox = function(id, value){
		$("#"+id).next(".jalor-dropdown-btn").unbind('click');
		$("#"+id).next(".jalor-dropdown-btn").bind('click',function(){
			$("#"+id+"_ddl").show();
			$("#"+id+"_ddl").offset({top: $("#"+id).offset().top + 42,left: $("#"+id).offset().left})
			$("#"+id+"_ddl").focus();
		});
		$("#"+id+"_ddl").bind('blur',function(){
			$("#"+id+"_ddl").hide();
		});
		$("#"+id+"_ddl").find(".jalor-selector-body").find("ul>li").each(function(){
			if($(this).attr("val")==value){
				$(this).click();
			}
		});
	}
	/**
	 * 页面编辑(基本信息,意向信息)
	 */
	page.edit = function(flag){
		//基本信息
		if(flag == "baseInfo"){
			page.initBaseInfo("edit");
		}
		//意向信息
		if(flag == "inten"){
			page.initInten("edit");
		}
	}
	/**
	 * 页面取消(基本信息，意向信息)
	 */
	page.clear = function(flag){
		//基本信息
		if(flag == "baseInfo"){
			debugger;
			page.initBaseInfo("edit");
			page.initBaseInfo();
		}
		//意向信息
		if(flag == "inten"){
			page.initInten();
		}
	}
	/**
	 * 保存(基本信息，意向信息)
	 */
	page.save = function(flag){
		var method = "";
		var fromObj = "";
		//获取对象跟方法名
		if(flag == "baseInfo"){
			fromObj = $S("#baseInfoForm");
			method = "saveResumeInfo";
		}
		if(flag == "inten"){
			fromObj = $S("#intentionForm");
			fromObj.jalorValidate();
			method = "saveIntentionInfo";
		}
		if(fromObj.valid()){
			debugger;
			Jalor.UI.loading();
			//设置数据
			var form = fromObj.jsonData();
			var resume = Portal.UserCenter4.resume;
			if(resume && resume.resumeId){
				form.resumeId = resume.resumeId;
			}
			//设置招聘类型
			if(form.highestDegree == 'Doctor'){//当最高学历为博士时，设置招聘类型为2博士，0校招
				form.resumeType = 2;
			} else {
				form.resumeType = 0;
			}/*
			if(!form.resumeType && form.resumeType != 0){
				form.resumeType = page.resumeType;
			}*/
			//根据类型设置面试地
			if(form.resumeType == 2){
				if(form.countryOfSchool != 'China'){
					form.schoolOrInterviewLocus = 'Macao';
					form.schoolOrInterviewCity = 'Macao';
				}
			}
			/*else {
				form.countryOfSchool = 'China';
				if(form.resumeTemplateName){
					form.schoolOrInterviewLocus = 'Macao';
					form.schoolOrInterviewCity = 'Macao';
				}
			}*/
			form.countryOfSchool=$("#docBaseInfoCountryOfSchool").jalorGetValue();
			
			//应届生
			form.intentionPlace = 'China';
			
			//验证系统是否存在相同简历
			if(flag == "baseInfo"){
				if(!form.resumeId){
					//验证是否存在相同简历
					var resumeData = null;
					Jalor.doPost({
					    async:false,
					    url:"services/portal/portaluser/validSameResume",
					    data:form,
					    success : function(data){
					    	resumeData = data;
					    },
					    error : function(data){alert(2);},
					    loading : true
					});
					if(!resumeData) {
						return;
					}
					if(resumeData.status && resumeData.status != 0){
						Jalor.UI.loadingClose();
						var userNameTip = resumeData.portalUserName?($.i18nKeyp("portal.resumeManager.userInfo.tip").replace("{0}",resumeData.portalUserName)):"";
						Portal.Campus4.confirm($.i18nKeyp("portal.resumeManager.save.tip")+userNameTip,$.i18nKeyp("home.tip"),function(info){
							if(info == 1){
								/*var options = {
									url:"portal/usercenter4/resumeManager/retrieveResume.html",
									title:$.i18nKeyp("home.tip"),
									width : 600,
									height : 780,
									fnLoad : function() {
										//Portal.faqContent.init(infoId,type);
									}
								};							
								Portal.Campus4.dialog(options);
								*/
								Portal.UserCenter4.tempObj = resumeData.resumeInfo;
								var url = "portal/usercenter4/resumeManager/retrieveResume.html";
								Portal.Campus4.forward(url,function() {});
							}/* else {
								Portal.Campus4.alert($.i18nKeyp("系统已存在您填写的姓名与邮箱，请核对后在提交"));
							}*/
						});
						$("#confirmDiv .closebtn").hide();
						return;
					}				
				}
				if(!form.photoAttachmentId){
					Jalor.UI.loadingClose();
					Portal.Campus4.alert($.i18nKeyp("portal.center.pleaseUploadPhoto"));
					return;
				}
				if(form.birthDateStr){
					var age = Math.floor((new Date()-new Date((form.birthDateStr||'').replace('-','/')))/ 1000 / 60/60/24/365);//计算生日
					if(age <16 || age>80){
						Jalor.UI.loadingClose();
						//出生日期填写异常，请核对后重新输入
						Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.validBirthDate"));						
						return ;
					}
				}
			}
			
			
			if(form.schoolOrInterviewLocus == 'other'){
				form.schoolOrInterviewCity = $(".otherCityTwo").jalorGetValue();
			}
			//保存数据
			Jalor.doPut("services/portal/portaluser/{0}".format(method), form,
				function(data) {
					$(".promise").show();//显示数据保密协议
					//重写加载一次简历
					Portal.UserCenter4.initResume();
					if(resume && resume.resumeId){
						if(flag == "baseInfo"){
							page.init("edit");
						}
						if(flag == "inten"){
							page.initInten();
						}
					} else {
						page.init("edit");
					}
					page.initPer();
					Jalor.UI.loadingClose();
				}
			);
		}
	}
	var tempIndex=0;
	//初始化其他控件，级联弹出框，单选框
	page.initOtherControl = function(elm,op,operateFlag){
		//国家与学校级联
		elm.find("input[name='countryOfSchool']").attr("id", "countryOfSchool"+tempIndex);
		
		elm.find("input[name='establishmentId']").attr("connector", "#countryOfSchool"+tempIndex);
		//elm.find("input[name='qualification']").attr("connector", "#countryOfSchool"+tempIndex);
		elm.find("input[name='degree']").attr("connector", "#countryOfSchool"+tempIndex);
		
		elm.find("input[name='establishmentId']").attr("id", "establishment"+tempIndex);
		elm.find("input[name='graduationCourtyardId']").attr("connector", "#establishment"+tempIndex);
		
		elm.find("input[name='graduationCourtyardId']").attr("id", "graduationCourtyard"+tempIndex);
		elm.find("input[name='firstMajorId']").attr("connector", "#graduationCourtyard"+tempIndex);
		
		elm.find("#studentCadreDiv").attr("connector", "#graduationCourtyard"+tempIndex);
		
		//复选框初始化
		elm.find(".choice").each(function(){
			var inputs = $(this).find("input[type=radio]");
			inputs.each(function(){
				if($(this).attr("checked") == "checked"){
					$(this).closest('span').click();
				};
			});
		});
		
		//文本域下标字符长度设置
		//发表论文
		var paperParticulars = elm.find("textarea[name='paperParticulars']");
		if(paperParticulars){
			page.initLength(paperParticulars);
			paperParticulars.keyup(function(){
				page.initLength($(this));
			});
		}
		//专利价值
		var patentValue = elm.find("textarea[name='patentValue']");
		if(patentValue){
			page.initLength(patentValue);
			patentValue.keyup(function(){
				page.initLength($(this));
			});
		}
		//参加学术会，主要职责
		var meetingResponsibility = elm.find("textarea[name='meetingResponsibility']");
		if(meetingResponsibility){
			page.initLength(meetingResponsibility);
			meetingResponsibility.keyup(function(){
				page.initLength($(this));
			});
		}
		
		//初始化语言情况
		if(op.thisDiv == 'languageDiv'){
			var languageNameObj = elm.find("input[name='languageName']");
			if(operateFlag == "add"){
				//当没有语言情况下，新增第一条时，语言名称默认给英语
				var listDiv = $("#"+op.thisDiv).find(".listDiv div");
				if(listDiv.length == 0){
					languageNameObj.jalorSetValue("EN");
				}
			}
			if(operateFlag == "edit"){
				//当只有一个语言时，国籍为中国，不允许编辑英语语言。
				var resume = Portal.UserCenter4.resume;
				if(resume && resume.nationality == 'PQH_CN'){
					var data = page.findPartData(op.queryUrl);
					var count = 0;
					for(var i=0;i<data.length;i++){
						if(data[i].languageName == 'EN'){
							count ++;
						}
					}
					if(languageNameObj.jalorGetValue() == "EN" && count == 1){
						languageNameObj.attr("disabled","disabled");
						languageNameObj.attr("readonly",'readonly');
					}
				}
			}
			page.changeLanguage(languageNameObj);
		}
	}
	//初始化Jalor框架的组件后加载
	page.initAfterOtherControl = function(elm,op,operateFlag){
		//初始化教育经历
		if(op.thisDiv == 'eduDiv'){
			//学校初始化
			var establishmentObj = elm.find("input[name='establishmentId']");
			page.initEstablishment(establishmentObj);
			
			//初始化提示信息
			elm.find("img[imgAtt='eduEstablishmentTip']").tip({content:$.i18nKeyp('portal.resumeManager.eduTip')});
			elm.find("img[imgAtt='eduEstablishmentTip']").removeClass("jalor-tip-trigger");
			
			//初始化学历事件
			page.changeQualification(elm.find("input[name='editQualification']"));
		}
	}
	page.initLength = function(obj){
		var len=0;
		if(obj && obj.val()){
			len = obj.val().getLength();
		}
		obj.parent().find("span").text("("+len+"/4000)");
	}
	page.initTitleKey = function(obj){
		$(obj).find(".i18n").each(function(){
			$(this).attr("title",$(this).text());
		});
	}
	//绑定操作事件
	$.fn.bindHtmlOperate=function(vo,op){
		var viewDiv = $(this);
		var div = $("#"+op.thisDiv);
		if(!div || !div.html()){
			return ;
		}
		div.show();
		var editTemp = $('#'+op.editTemp).html();
		var viewTemp = $('#'+op.viewTemp).html();
		//编辑绑定事件
		viewDiv.find(".edit_item").click(function(){
			debugger;
			var editDiv = div.find("#"+$(this).attr("rel"));
			vo.index = tempIndex;
			vo.resumeType = page.resumeType;
			var editTempDIV = $(JsTemplate(op.editTemp, editTemp).render({data : vo}));
			editTempDIV.jsonpData(vo);
			editDiv.after(editTempDIV);
			//初始化其他控件信息
			page.initOtherControl(editTempDIV,op,"edit");
			tempIndex++;
			editDiv.hide();
			//初始化验证与国际化
			editTempDIV.jalorValidate();
			Jalor.ready(editTempDIV);
			editTempDIV.find(".i18n").i18nKeyp();
			page.initTitleKey(editTempDIV);
			//初始化Jalor框架的组件后加载
			page.initAfterOtherControl(editTempDIV,op,"edit");
			
			//重新赋值，解决下拉框未初始化时，值加载不到问题
			editTempDIV.jsonpData(vo);
			var edu = vo.qualification;
			//取消编辑
			editTempDIV.find(".cancel_item").click(function(){
				vo.qualification = edu;
				editTempDIV.remove();
				editDiv.show();
			});	
			
			//保存编辑
			editTempDIV.find(".save_item").click(function(){
				debugger;
				//editTempDIV.setFormDate();
				if(editTempDIV.valid()){
					vo = editTempDIV.jsonpData();
					//自定义校验
					if(!page.definedValid(op,vo,"update")){
						return;
					}
					var batchvo={};
					batchvo.items2Update=[vo];
					Jalor.doPut(op.upUrl,batchvo,function() {
						var data = page.findPartData(op.queryUrl);
						page.replaceAllXmlCode(data);
						newData = {};
						for(var i=0;i<data.length;i++){
							if(data[i][op.voId] == vo[op.voId]){
								newData = data[i];
								break;
							}
						}
						newData.divId = op.voId;
						newData.resumeType = page.resumeType;
						var viewDiv = $(JsTemplate(op.viewTemp, viewTemp).render({data : newData}));
						viewDiv.jsonData(newData);
						viewDiv.bindHtmlOperate(newData,op);
						//鼠标滑过某一条数据显示编辑icon、删除ICON
						viewDiv.mouseenter(function(){
				    		$(this).find('.edit_item,.del_item').show();
				    		$(this).addClass('cur');
				    	});
						viewDiv.mouseleave(function(){
				        	$(this).find('.edit_item,.del_item').hide();
				        	$(this).removeClass('cur');
				        });
						Jalor.ready(viewDiv);
						editDiv.before(viewDiv);
						editDiv.remove();
						editTempDIV.remove();
						$(".i18n").i18nKeyp();
						page.initTitleKey(editTempDIV);
						//其他信息自定义
						if(op.thisDiv == 'otherDiv'){
							page.loadOtherImage(newData.attachmentId,newData.preAttachmentId,"view");
						}
					})
					//更新人才库最后修改时间
					Portal.Common.changeUserType(2);
				}
			});
			//其他信息自定义
			if(op.thisDiv == 'otherDiv'){
				page.loadOtherImage(vo.attachmentId,vo.preAttachmentId,"edit");
			}
		});
		//删除绑定事件
		viewDiv.find(".del_item").click(function(){
			//自定义校验
			if(!page.definedValid(op,vo,"delete")){
				return;
			}
			Portal.Campus4.confirm($.i18nKeyp("resume.notice.Del"), ' ', function(type){
				if(type == '1'){
					var batchVo={};
					batchVo.items2Delete=[vo];
					Jalor.doPut(op.upUrl,batchVo,function(){
						viewDiv.remove();
						//更新人才库最后修改时间
						Portal.Common.changeUserType(2);
						//重写加载一次简历
						Portal.UserCenter4.initResume();
						page.initPer();
					});
				}
			});
		});
	}
	/**
	 * 初始化简历其他信息
	 */
	page.initOtherData = function(op){
		var div = $("#"+op.thisDiv);
		div.find(".listDiv").html("");
		div.find(".addListDiv").html("");
		div.show();
		var viewTemp = $('#'+op.viewTemp).html();
		var editTemp = $('#'+op.editTemp).html();
		var data = resumeInfo[op.thisDiv]||[];
		page.replaceAllXmlCode(data);
		//填充数据
		for(var i=0;i<data.length;i++) {
			var vo=data[i];
			vo.divId = op.voId;
			vo.resumeType = page.resumeType;
			var viewDiv = $(JsTemplate(op.viewTemp, viewTemp).render({data : vo}));
			viewDiv.jsonData(vo);
			//鼠标滑过某一条数据显示编辑icon、删除ICON
			viewDiv.mouseenter(function(){
	    		$(this).find('.edit_item,.del_item').show();
	    		$(this).addClass('cur');
	    	});
			viewDiv.mouseleave(function(){
	        	$(this).find('.edit_item,.del_item').hide();
	        	$(this).removeClass('cur');
	        });

			viewDiv.find('.edit_item,.del_item').hide();
			//绑定操作事件
			viewDiv.bindHtmlOperate(vo,op);
			//添加到div
			div.find(".listDiv").append(viewDiv);
			
			//其他信息自定义
			if(op.thisDiv == 'otherDiv'){
				page.loadOtherImage(vo.attachmentId,vo.preAttachmentId,"view");
			}
		}
		//添加按钮
		div.find(".addBtn").click(function() {
			var addListDiv = div.find(".addListDiv");
			if(addListDiv.html()){
				if(!div.find(".addListDiv div").eq(0).valid()){
					return;
				}
				div.find(".addListDiv .save_item").click();
			}
			var editTempDIV = $(JsTemplate(op.editTemp, editTemp).render({data : {resumeId:op.resumeId,resumeType:page.resumeType,index:tempIndex}}));
			//给有级联的下拉框重新设定ID
			page.initOtherControl(editTempDIV,op,"add");
			tempIndex++;
			div.find(".addListDiv").append(editTempDIV);
			
			//初始化Jalor框架的组件
			Jalor.ready(editTempDIV);			
			editTempDIV.jalorValidate();
			editTempDIV.find(".i18n").i18nKeyp();
			page.initTitleKey(editTempDIV);
			//初始化Jalor框架的组件后加载
			page.initAfterOtherControl(editTempDIV,op,"add");
			
			//绑定保存按钮事件
			editTempDIV.find(".save_item").click(function(){
				//editTempDIV.setFormDate();
				if (editTempDIV.valid()) {
					var newData = editTempDIV.jsonpData();
					//自定义校验
					if(!page.definedValid(op,newData,"insert")){
						return;
					}
					newData[op.voId] = "";
					Jalor.doPut(op.addUrl, newData, function(voId) {
						var data = page.findPartData(op.queryUrl);
						page.replaceAllXmlCode(data);
						newData = {};
						for(var i=0;i<data.length;i++){
							if(data[i][op.voId] == voId){
								newData = data[i];
								break;
							}
						}
						newData.divId = op.voId;
						newData.resumeType = page.resumeType;
						var viewDiv = $(JsTemplate(op.viewTemp, viewTemp).render({data : newData}));
						viewDiv.jsonpData(newData);
						//鼠标滑过某一条数据显示编辑icon、删除ICON
						viewDiv.mouseenter(function(){
				    		$(this).find('.edit_item,.del_item').show();
				    		$(this).addClass('cur');
				    	});
						viewDiv.mouseleave(function(){
				        	$(this).find('.edit_item,.del_item').hide();
				        	$(this).removeClass('cur');
				        });
						viewDiv.bindHtmlOperate(newData,op);
						Jalor.ready(viewDiv);
						div.find(".listDiv").append(viewDiv);
						$(".i18n").i18nKeyp();						
						editTempDIV.remove();
						
						//其他信息自定义
						if(op.thisDiv == 'otherDiv'){
							page.loadOtherImage(newData.attachmentId,newData.preAttachmentId,"view");
						}
						//更新人才库最后修改时间
						Portal.Common.changeUserType(2);
						//重写加载一次简历
						Portal.UserCenter4.initResume();
						page.initPer();
					});
				} else {
					return false;
				}
			});
			//绑定取消按钮事件
			editTempDIV.find(".cancel_item").click(function(){
				div.find(".addListDiv").html("");
			});
		});
		//初始化一个创建
		if(data.length == 0 && op.isAdd == true){
			div.find(".addBtn").click();
		}
	}

	/**
	 * 自定义校验
	 */
	page.definedValid = function(op,vo,pos){
		//语言情况
		if(op.thisDiv == 'languageDiv'){
			//判断国籍如果是中国时，其中一个必须要有英语
			if(!page.languageValid(op,vo,pos)){
				return false;
			}
		}
		
		//其他信息
		if(op.thisDiv == 'otherDiv'){
			//图片校验
			if((pos == 'insert' || pos == 'update') && !vo.preAttachmentId){
				Portal.Campus4.alert($.i18nKeyp("portal.center.pleaseUploadCerImage"));
				return false;
			}
		}
		
		//教育经历
		if(op.thisDiv == 'eduDiv'){
			if(pos == 'update' && !page.editQualification(op,vo)){
				return false;
			}
			if(pos == 'delete' && !page.deleteEduVaild(op,vo)){
				return false;
			}
			if(pos == 'insert' || pos == 'update'){
				//开始结束如期初始化
				if(new Date((vo.educationStartDateStr||'').replace('-','/')) > new Date((vo.educationEndDateStr||'').replace('-','/'))){
					Portal.Campus4.alert($.i18nKeyp("resume.error.startDateNotbigEndDate"));
					return false;
				}
				//结束时间不能相同
				var data = page.findPartData(op.queryUrl);
				if(data && data.length > 0){
					var isExist = false;
					$.each(data,function(tempIndex,obj){
						if(vo.educationEndDateStr == obj.educationEndDateStr && vo.eduId != obj.eduId){
							isExist = true;
						}
					});
					if(isExist){
						Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.eduTip.existsEndDate"));
						return false;
					}
				}
			}
		}
		//删除时，必填项必须要保留一个
		if(pos =='delete'){
			var language = workspaceVO.currentLanguage;
			//获取模块信息
			var modelArr = Jalor.Component.Lookup.getList('resume_scores_per_'+page.resumeType,'',language);
			var model = {};
			for(var i=0;i<modelArr.length;i++){
				if(op.thisDiv == (modelArr[i].itemCode+'Div')){
					model = modelArr[i];
					break;
				}
			}
			//判断是否必填项
			if(model.itemAttr2){
				var data = page.findPartData(op.queryUrl);
				if(data && data.length == 1){
					//model.itemName = (language=='en_US'?(model.itemDesc||model.itemName):model.itemName);
					Portal.Campus4.alert($.i18nKeyp("portal.center.resume.requiredModelDelTip").replace("{0}",model.itemName));
					return false;
				}
			}
		}
		return true;
	}
	/**
	 * 语言情况校验
	 */
	page.languageValid = function(op,vo,pos){
		//判断中国籍是否存在一条英语
		var resume = Portal.UserCenter4.resume;
		if(resume && resume.nationality == 'PQH_CN'){
			var data = page.findPartData(op.queryUrl);
			var count = 0;
			for(var i=0;i<data.length;i++){
				if(data[i].languageName == 'EN'){
					count ++;
				}
			}
			//语言提示：中国籍至少有一条英语
			//新增时
			if(pos == 'insert' && count == 0 && vo.languageName != 'EN'){
				Portal.Campus4.alert($.i18nKeyp("portal.center.language.China.languageTip"));
				return false;
			}
			//修改时
			if(pos == 'update' && (count == 0 || count == 1) && vo.languageName != 'EN'){
				Portal.Campus4.alert($.i18nKeyp("portal.center.language.China.languageTip"));
				return false;
			}
			//删除时
			if(pos == 'delete' && count == 1 && vo.languageName == 'EN'){
				Portal.Campus4.alert($.i18nKeyp("portal.center.language.China.languageTip"));
				return false;
			}
		}
		return true;
	}
	/**
	 * 校验删除教育经历逻辑
	 */
	page.deleteEduVaild=function(op,vo){
		debugger;
		if(op.addUrl.indexOf("TalentResumeEduVO")>0){
			var degree = page.highestDegree;
			if(degree == 'Doctor'){
				if(vo.qualification == 'Doctor' && $('#eduDiv').find('span[rel=QN_Doctor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Doctor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.doctor")));
					return false;
				}
				if(vo.qualification == 'Master' && $('#eduDiv').find('span[rel=QN_Master]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Master").replace("{0}",$.i18nKeyp("portal.editEdu.degree.doctor")));
					return false;
				}
				if(vo.qualification == 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.doctor")));
					return false;
				}
			}else if(degree == 'Master'){
				if(vo.qualification == 'Master' && $('#eduDiv').find('span[rel=QN_Master]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Master").replace("{0}",$.i18nKeyp("portal.editEdu.degree.master")));
					return false;
				}
				if(vo.qualification == 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.master")));
					return false;
				}
			}else if(degree == 'Bachelor'){
				if(vo.qualification == 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.delete.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.bachelor")));
					return false;
				}
			}
		}
		return true;
	}
	/**
     * 初始化基础事件
     */
    page.initClick = function(){
    	//单选框
    	$('.choice label').live('click',function () {
    		//label设置
    		$(this).closest('.choice').find('label').removeAttr('class');
    		$(this).attr('class', 'checked');
    		//input设置
    		$(this).closest('.choice').find('input[type="radio"]').removeAttr('checked');
    		var data = $(this).attr('data');
    		$(this).closest('.choice').find('input[value="'+data+'"]').attr('checked', 'checked');
    	});
		//  放大当前图片
		$(".sfz_scalebig").live('click',function(){
			//出现放大的弹层
			var imgurl_lyc=$(this).closest('.piclyc_p').find('img').attr('src');
			$(".dialog_sfz .afterscale img").attr('src',imgurl_lyc);
			$(".dialog_sfz").show();
		});
		//关闭放大图片弹出框
		$(".closebutton_sfz").live('click',function(){
			$(".dialog_sfz").hide();
		});
		//图片上传默认隐藏上传按钮
		$(".upload_word").hide();
		$('.upload_img').live("hover",function(event) {
			if (event.type=='mouseenter') {
				$(".upload_word").show();
			} else if (event.type=='mouseleave') {
				$(".upload_word").hide();
			}
		});
		//导航栏悬浮
		var oTops = 129;
	    var sTops = 0;
	    var sLeft = 0;
	    var diff = $(window).width()-1100;
	    var right = ($(window).width()-1100)/2 >0 ?($(window).width()-1100)/2:diff;
	    $(window).resize(function(){
	    	diff = $(window).width()-1100;
	    	right = ($(window).width()-1100)/2 >0 ?($(window).width()-1100)/2:diff;
	    	sTops = $(this).scrollTop();
	        if(sTops >= oTops){
	        	if(sTops>=($(document).height() - $(window).height()-200)){
	        		$(".re_right").css('top',"");
	        		$(".re_right").css({'position':'absolute','right':'0px','bottom':'10px'});
	        	}else{
	        		$(".re_right").css({'position':'fixed','right':right,'top':'0px'});
	        	}            
	        }else{
	        	$(".re_right").css({'position':'absolute','right':'0px','top':'0px'});
	        }
	    });
	    $(window).scroll(function(){
	        sTops = $(this).scrollTop();
	        sLeft = $(this).scrollLeft();
	        right = ($(window).width()-1100)/2 >0 ?($(window).width()-1100)/2:diff+sLeft;

	        if(sTops >= oTops){
	        	if(sTops>=($(document).height() - $(window).height()-200)){
	        		$(".re_right").css('top',"");
	        		$(".re_right").css({'position':'absolute','right':'0px','bottom':'10px'});
	        	}else{
	        		$(".re_right").css({'position':'fixed','right':right,'top':'0px'});
	        	}            
	        }else{
	        	$(".re_right").css({'position':'absolute','right':'0px','top':'0px'});
	        }
	    });
	    //隐藏编辑，删除按钮
	    $(".edit_item,.del_item").each(function(){
	    	$(this).hide();
	    });
	    
	    //文字过长,加入省略号样式
		//tiwenBtn是faq中的提问，addBtn加入华为人才库，submitHWPeople提交并加入华为人才库,phoneCodeBtn注册页面中的获取验证码,search搜索按钮
		//submit_fbbtn面试反馈中，提交我的反馈按钮,jd_word1_4 offer确认跟入职信息确认,.line1 .title校园招聘下面，研发类跟非研发类
		/*var ellipsBd=$("label,dt,a,.tiwenBtn,.addBtn,.submitHWPeople,.phoneCodeBtn,.search,.submit_fbbtn,.setSubscribe .btn,.pro-tab .tab1,.pro-tab .tab2,.jd_word1_4,.research,.nonresearch,.line1 .title,.re_right dd,.indexBtm dl dd p,.head .center li li a,.body_gezx_gnsz .emailll,.body_gezx_gnsz .phoneee,.f16");
		ellipsBd.addClass("ellipsis_add");
		ellipsBd.live('mouseover',function(){
			var gettext=$(this).text();
			$(this).attr('title',gettext);
		});
		$(".suspend a").removeClass("ellipsis_add");
		$(".re_right .model_list dt").removeClass("ellipsis_add");
		*/
		if($(".suspend .qa span").text()=="FAQ"){
			$(".suspend .qa").css('line-height','43px');
		}else{
			$(".suspend .qa").css('line-height','');
		}
		$(".f16").css({"max-width":"520px","display":"inline-block"});
		$(".f16").next('span').css({"overflow":"hidden","display":"inline-block"});
		$(".f16").next('span').next('span').css({"overflow":"hidden","display":"inline-block"});
	    
    }
  /**
   * 初始化是否华为亲属复选框
   */
	page.initIsFamilyHuawei = function(value){
		//value = value || 0;
		//设置华为亲属
		$("#isFamilyHuawei").find("input[type='radio']").each(function(){
			$(this).removeAttr('checked');
			//label设置
			$(this).parent().find('label').removeClass('checked');
    		
			if($(this).val() == value){
				$(this).attr("checked");
				$(this).closest('span').find('label').addClass("checked");
			}
		});
		if(!value || value == 0){
			//影藏添加华为亲属按钮
			$("#huaweiContactDiv .addBtn").hide();
		}
	}
	
	  /**
	   * 初始化是否发明专利复选框
	   */
		page.initIsPatent = function(value){
			//设置华为亲属
			$("#isPatent").find("input[type='radio']").each(function(){
				$(this).removeAttr('checked');
				//label设置
				$(this).parent().find('label').removeClass('checked');
	    		
				if($(this).val() == value){
					$(this).attr("checked");
					$(this).closest('span').find('label').addClass("checked");
				}
			});
			if(!value || value == 0){
				//影藏添加华为亲属按钮
				$("#patentDiv .addBtn").hide();
			}
		}
    /**
     * 其他信息，证件上传
     */
    page.openUploadOtherImage = function(attId){
    	page.openUploadImage("other",function(file, serverData, batchId, userObject){
	     	var attachmentId = serverData[0].attachmentId;
	     	page.loadOtherImage(attId,attachmentId,"edit");
    	});
    }
    /**
     * 加载证书图片
     */
    page.loadOtherImage = function(attId,attachmentId,flag){
    	var imgUrl = getCardUrl(attachmentId);
    	if(flag == "edit" && attachmentId){
    		$("#selectImg_"+attId).hide();
    		$("#imgShow_"+attId).show();
    		$("#imgShow_"+attId).find("input").val(attachmentId);
    		// $("#imgShow_"+attId).find("img").attr("src",imgUrl);
    		$("#imgShow_"+attId).find("img").initPhoto(attachmentId, "Portalcard");
    		//删除已上传的图片
    		$("#imgShow_"+attId).find(".sfz_delete").click(function(){
    			$("#imgShow_"+attId).hide();
    			$("#imgShow_"+attId).find("input[name='preAttachmentId']").val('');
    			$("#selectImg_"+attId).show();
    		});
    		if($("#attachmentId_"+attId) && $("#attachmentId_"+attId).find("img")){
    			// $("#attachmentId_"+attId).find("img").attr("src",imgUrl);
    			$("#attachmentId_"+attId).find("img").initPhoto(attachmentId, "Portalcard");
    		}
    	} else {
    		//$("#attachmentId_"+attId).find("img").attr("src",imgUrl);
    		setTimeout(function(){
    			$("#attachmentId_"+attId).find("img").initPhoto(attachmentId, "Portalcard");
    		});
    	}
    	
    }
	/**
	 * 上传照片
	 */
	page.openUploadImage=function(flag,rollback) {
		var upCallback=function(file, serverData, batchId, userObject){
	     	var attachmentId = serverData[0].attachmentId;
			$("#photoAttachmentId").val(attachmentId);
	     	$("#baseinfophoto").initPhoto(attachmentId);
		}
		var attType = "ImageAttachment";
		if(flag == 'other'){
			upCallback = rollback;
			attType = "Portalcard";
		} else if(flag == 'ResumeFile'){
			upCallback = rollback;
			attType = "ResumeFile";
		}
		var param = {
			/*上传类型，附件类为Attachment*/
			uploadType : "Attachment",
			/*单个文件上传回调函数*/
			callback : upCallback,
			/*所有文件上传结束的回调函数*/
			completeCallback : null,
			/*用户对象，上传完可以回传此对象*/
			userObject : {
				rowId : 123456
			},
			closeDialog : true,
			/*需要批ID，附件上传时请指定为true*/
			needBatchId : true,
			/*当前批次ID*/
			/*上传参数，此参数可以在服务器端接收。attType由附件处理类处理，标示附件类型，
			 *附件类型配置在数据字典的App.Attachment节点下，每种类型配置fileTypes（如xls,xlsx,doc,docsx,zip,rar），maxSize，maxCount三个节点的Value
			 */
			query : "attType="+attType
		};
		Jalor.Component.openUploadDialog($.i18nKeyp("Resume.cer.upload"), param);
	}
	/**
	 * 修改学校所在国家
	 */
	page.changeCountryOfSchool = function(){
		var countryOfSchool = $("#docBaseInfoCountryOfSchool").jalorGetValue();
		if(countryOfSchool == 'China'){
			$("#docSchoolOrInterviewLocus").addClass("required");
			$("#docSchoolOrInterviewCity").addClass("required");

			$("#docSchoolOrInterviewLocus").parent().show();
			$("#docSchoolOrInterviewCity").parent().show();
			$("#schoolLocaId").show();
		} else {
			$("#docSchoolOrInterviewLocus").jalorSetValue("");
			$("#docSchoolOrInterviewCity").jalorSetValue("");
			$("#docSchoolOrInterviewLocus").removeClass("required");
			$("#docSchoolOrInterviewCity").removeClass("required");
			
			$("#docSchoolOrInterviewLocus").parent().hide();
			$("#docSchoolOrInterviewCity").parent().hide();
			$("#schoolLocaId").hide();
		}
	}
	/**
	 * 人才类型为校招是修改国家省
	 */
	page.changeProvinceOfSchool = function(){
		var countryOfSchool = $("#docBaseInfoCountryOfSchool").jalorGetValue();
		/*var schoolOrInterviewLocus = $("#baseInfo input[name='schoolOrInterviewLocus']");
		schoolOrInterviewLocus.removeAttr("ddl_locked");
		schoolOrInterviewLocus.removeAttr("readOnly");*/
		if(countryOfSchool == 'China'){
			$("#provinceId").attr("i18nKeyp",$.i18nKeyp('hunter.portal.schoolLoca'));
			$("#provinceId").attr("title",$.i18nKeyp('hunter.portal.schoolLoca'));
			$("#provinceId").html($.i18nKeyp('hunter.portal.schoolLoca'));
		}else{
			$("#provinceId").attr("title",$.i18nKeyp('portal.resume.interviewLoc'));
			$("#provinceId").html($.i18nKeyp('portal.resume.interviewLoc'));
			//学生国籍为”外国“，学校所在国为”外国“；全部归属到“海外招聘平台”
		/*	var nationality = $("#baseInfo input[name='nationality']").jalorGetValue();
			if(nationality != 'PQH_CN'){
				schoolOrInterviewLocus.attr("ddl_locked","true");
				schoolOrInterviewLocus.attr("readOnly","readOnly");
				setTimeout(function(){
					schoolOrInterviewLocus.jalorSetValue("other");
					schoolOrInterviewLocus.parent().find(".jalor-dropdown-btn")[0].click();
				},500);
			}*/
		}
		/*$("#schoolOrInterviewLocus").manager().setValue('');*/
		$("#schoolOrInterviewLocus").length && $("#schoolOrInterviewLocus").manager().reBind();
	}
	page.clearInterviewLocus = function(){
		$("#schoolOrInterviewLocus").jalorSetValue('');
		//$("#schoolOrInterviewCity").jalorSetValue('');		
		$("input[name='schoolOrInterviewCity']").jalorSetValue('');
	}
 	
	/**
	 * 修改证件类型
	 */
	page.changeIndentifiedType = function(){
		var indentifiedType = $("#indentifiedType").jalorGetValue();
		if(indentifiedType == '1'){
			var nationality = $("input[name='nationality']").jalorGetValue();
			if(nationality == 'PQH_CN'){
				$("#birthDate").attr("disabled",'disabled');
				$("#birthDate").attr("readonly",'readonly');
			} else {
				$("#birthDate").removeAttr("disabled",'disabled');
				$("#birthDate").removeAttr("readonly",'readonly');
			}
			//提示语
			$("input[name='indentifiedId']").attr("placeholder",$.i18nKeyp('portal.center.write.IDcard'));
		} else {
			$("#birthDate").removeAttr("disabled",'disabled');
			$("#birthDate").removeAttr("readonly",'readonly');
			//提示语
			$("input[name='indentifiedId']").removeAttr("placeholder");
		}
	}
	
	
	/**
	 * 修改干部级别
	 */
	page.changeStudentCadre = function(value,index){
		if(value == 1){
			$("#studentCadreDiv"+index+" input").each(function(){
				$(this).addClass("required");
				$(this).removeAttr("readonly");
				$(this).removeAttr("disabled");
				$(this).removeAttr("ddl_locked");
			});
			$("#studentCadreDiv"+index+" .jalor-dropdown-btn").each(function(){
				$(this).show();
			});
			$("#studentCadreDiv"+index+" span").each(function(){
				$(this).html("*");
			});
		} else {
			$("#studentCadreDiv"+index+" input").each(function(){
				$(this).jalorSetValue("");
				$(this).removeClass("required");				
				$(this).attr("readonly","readonly");
				$(this).attr("disabled","disabled");
				$(this).attr("ddl_locked","true");
			});
			$("#studentCadreDiv"+index+" span").each(function(){
				$(this).html("");
			});
		}
	}
	
	/**
	 * 获奖经历，获奖类型切换
	 */
	page.changePrizeType = function(obj){
		debugger;
		var prizeType = $(obj).find('input[name="prizeType"]').val();
		var divObj = $(obj).closest('div');
		var prizeGrade = divObj.find("input[name='prizeGrade']").jalorGetValue();
		//1,竞赛获奖;2,奖学金;
		if(prizeType == "1"){
			divObj.find('#prizeGradeLabel').html($.i18nKeyp("hunter.portal.scholarshipLevel"));//奖项级别
			divObj.find('#prizeNameLabel').html($.i18nKeyp("hunter.portal.competitionName"));//奖项名称
			Jalor.ready(divObj.find("input[name='prizeGrade']"));
			if(divObj.find("input[name='prizeGrade']").manager().reBind){
				divObj.find("input[name='prizeGrade']").manager().reBind({}, page.getPrizeGrade(prizeType),prizeGrade);
			}
			divObj.find('#prizeLevelDl').show();
		} else if(prizeType == "2"){
			divObj.find('#prizeGradeLabel').html($.i18nKeyp("hunter.portal.LevelOfScholarship"));//奖学金级别
			divObj.find('#prizeNameLabel').html($.i18nKeyp("hunter.portal.NameOfScholarship"));//奖学金名称
			if(divObj.find("input[name='prizeGrade']").manager().reBind){
				divObj.find("input[name='prizeGrade']").manager().reBind({}, page.getPrizeGrade(prizeType),prizeGrade);
			}
			
			divObj.find('#prizeLevelDl').hide();
		}
	}
	
	/**
	 * 接受工作地点变更切换
	 */
	page.changeIsChangeWorkSite = function(obj){
		var that = $(obj);
		var val = that.attr("data");
		if(val == "0"){
			$("[name='acceptabilityWorkSite']").removeClass("required");
			$(".acceptabilityWorkSite").hide();
		} else {
			$("[name='acceptabilityWorkSite']").addClass("required");
			$(".acceptabilityWorkSite").show();
		}
	}
	/**
	 * 《数据保密承诺声明》
	 */
	page.privacyData = {};
	page.showPrivacy = function(){
		/*$.ajax({
			url : "services/portal/portaluser/getNotice",
			cache : true,
			dataType : "html",
			success : function(data) {
				$("#noticeContent").html(data.content);		
			}
		});
		*/
		
		//$("body").css("overflow","hidden");
		
		$("body").css({'overflow-y':'hidden','padding':'0 17px 0 0'});
		$(".suspend").css('margin-left',"612px");
		
		var resume = Portal.UserCenter4.resume;
		/*var resumeId = resume.resumeId||-1;
		var md5Id = Jalor.Page.getRequest().md5Id||'';
		if(resumeId != -1 && !md5Id){
			$(".promise").show();
			var checkbox = $(".agree_con").find("input[type='checkbox']");
			checkbox.attr("checked","true");
			checkbox.attr("disabled","true");
			$(".privacy_tips").hide();
			$(".strat_writejl").hide();
			$("#noticeFooter").find(".agreementSignDate").text(Jalor.Format.toDateStr(resume.creationDate));
			$("#noticeFooter").show();
		} else {
			$(".promise").hide();
		}*/
		//已签署过的，不需要重新签署
		var data = page.findPartData("services/portal/portaluser/getDataCommitment");		
		page.privacyData = data;
		$("#noticeContent").html(data.content);//签署内容
		if(resume.isAcceptabilityCommitment == 1 || resume.signedFileAttachmentId){
			$(".promise").show();
			var checkbox = $(".agree_con").find("input[type='checkbox']");
			checkbox.attr("checked","true");
			checkbox.attr("disabled","true");
			$(".privacy_tips").hide();
			$(".strat_writejl").hide();
			
			//$("#noticeFooter").find("#signSomeone").text(resume.commitmentPersonName);//签署人
			$("#noticeFooter").find("#signSomeone").text(resume.signedFileAttachmentId?resume.commitmentPerson:resume.name);//签署人
			$("#noticeFooter").find(".agreementSignDate").text(Jalor.Format.toDateStr(resume.commitmentDate));//签署时间
			$("#noticeFooter").show();
		} else {
			$(".promise").hide();			
			//$("#noticeContent").html(data.content);
		}
		$(".dialog_privacy").show();
	}
	/**
	 * 关闭《数据保密承诺声明》
	 */
    page.closePrivacy = function(){
    	var resume = Portal.UserCenter4.resume;
		var resumeId = resume.resumeId||-1;
		
		if(resumeId == -1){
			var win = window;
			var loc = win.location;
			loc.href = "/reccampportal/campus4_index.html";
		}
    	$(".dialog_privacy").hide();
    	$("body").css({'overflow-y':'scroll','padding':'0 0px 0 0'});
    	$(".suspend").css('margin-left',"620px");
    }
    
    /**
     * 点击同意改变按钮颜色
     */
    page.changeWrite = function(){
    	if($(".agree_con input").attr('checked')=='checked'){
    		$("#startWriteDiv").css({"background":"#e12332"});//按钮置灰
		}else{
			$("#startWriteDiv").css({"background":"#ccc"});//按钮置灰
		}
    	
    }
    
    /**
     * 点击开始填写简历
     */
    page.startWrite = function(){  
		if($(".agree_con input").attr('checked')=='checked'){
			$(".dialog_privacy").hide();
			$(".agree_con span").css('color','#666666');
			$("body").css({'overflow-y':'scroll','padding':'0 0px 0 0'});

	    	var resume = Portal.UserCenter4.resume;
			var resumeId = resume.resumeId||-1;
			//保密协议ID
			$("#baseInfoForm input[name='commitmentLetterId']").val(page.privacyData.noticeId);
			//当时编辑的时候填写的保密协议，直接保存协议
			if(resumeId != -1){
				Jalor.doPost({
				    async:false,
				    url:"services/portal/portaluser/saveDataCommitment",
				    data:{"noticeId":page.privacyData.noticeId},
				    success : function(data){
				    	Portal.UserCenter4.initResume();
				    	$(".promise").show();
				    },
				    error : function(data){alert(JSON.stringify(data));},
				    loading : true
				});
			}
		}else{
			$(".agree_con span").css('color','red');
		}
    }
    /**
	 * 查询区段数据
	 */
	page.findPartData=function(url){
		var data = [];
		if(!url) return null;
		Jalor.doGet({
			async : false,
			url : url,
			success : function(result) {
				data = result;
			}
		});
		return data || [];
	}
	/**
	 * check学历是否能编辑
	 */
	page.checkQualification=function(op,vo){
		if(op.addUrl.indexOf("TalentResumeEduVO")>0){
			var degree = page.highestDegree;
			if(degree == 'Doctor'){
				if(vo.qualification == 'Doctor'||vo.qualification == 'Master'||vo.qualification == 'Bachelor'){
					$("[name='qualification']").attr("disabled","");
					$("#qualificationId").next(".jalor-dropdown-btn").hide();
				}
			}else if(degree == 'Master'){
				if(vo.qualification == 'Master'||vo.qualification == 'Bachelor'){
					$("[name='qualification']").attr("disabled","");
					$("#qualificationId").next(".jalor-dropdown-btn").hide();
				}
			}else if(degree == 'Bachelor'){
				if(vo.qualification == 'Bachelor'){
					$("[name='qualification']").attr("disabled","");
					$("#qualificationId").next(".jalor-dropdown-btn").hide();
				}
			}
		}
	}
	page.editQualification=function(op,vo){
		debugger;
		if(op.addUrl.indexOf("TalentResumeEduVO")>0){
			var degree = page.highestDegree;
			if(degree == 'Doctor'){
				if(vo.editQualification == 'Doctor' && vo.qualification != 'Doctor' && $('#eduDiv').find('span[rel=QN_Doctor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Doctor"));
					return false;
				}
				if(vo.editQualification == 'Master' && vo.qualification != 'Master' && $('#eduDiv').find('span[rel=QN_Master]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Master").replace("{0}",$.i18nKeyp("portal.editEdu.degree.doctor")));
					return false;
				}
				if(vo.editQualification == 'Bachelor' && vo.qualification != 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.doctor")));
					return false;
				}
			}else if(degree == 'Master'){
				if(vo.editQualification == 'Master' && vo.qualification != 'Master' && $('#eduDiv').find('span[rel=QN_Master]').length==1){
					//Portal.Campus4.alert($.i18nKeyp("Resume.edit.Master"));
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Master").replace("{0}",$.i18nKeyp("portal.editEdu.degree.master")));
					return false;
				}
				if(vo.editQualification == 'Bachelor' && vo.qualification != 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.master")));
					return false;
				}
			}else if(degree == 'Bachelor'){
				if(vo.editQualification == 'Bachelor' && vo.qualification != 'Bachelor' && $('#eduDiv').find('span[rel=QN_Bachelor]').length==1){
					Portal.Campus4.alert($.i18nKeyp("Resume.edit.Bachelor").replace("{0}",$.i18nKeyp("portal.editEdu.degree.bachelor")));
					return false;
				}
			}
		}
		return true;
	}
    /**
	 * 替换特殊符号
	 */
	page.replaceAllXmlCode=function(data){
		if(!data) return [];
		$.each(data,function(tempIndex,obj){
			if(obj){
				$.each(obj,function(subInd,subObj){
					//特殊字符替换
					subObj=!subObj?subObj+"".replace("<", "&lt;").replace(">", "&gt;"):"";
				});
			}
		});
	}
	/**
	 * 获取至今
	 */
	page.showDate = function(value){
		return value || $.i18nKeyp('resume.date.present');//至今
	}
	/**
	 * 选择身份
	 */
	page.selectIdentity = function(){
		$(".selectIdentity").show();
	}
	
	//设置城市
	page.setCity = function(){
		var state=$("input[name='schoolOrInterviewLocus']").jalorGetValue();
		if(state){
			//面试所在地，非国内城市，取lookup配置地点
			var isExist = false;
			for(var i=0;i<locs.length;i++){
				var loc = locs[i];
				if(loc.itemCode == state){
					if(loc.itemAttr1!="1"){
						isExist = true;
						break;
					}
				}
			}
			if(isExist && state!="other"){
				$("input[name='schoolOrInterviewCity']").parent().hide();
				//海外的面试所在地
				$("#resumeTemplateName").val(state);
			} else {
				$("input[name='schoolOrInterviewCity']").parent().show();
				$("#resumeTemplateName").val("");
				if(state=="other" || state=="AustraliaOC" || state=="CanadaOC" || state=="AmericaOC" || state=="Europe" || state=="JapanOC"){
					$(".otherCityOne").hide();
					$(".otherCityTwo").show();
					if($(".otherCityOne").next().hasClass("error")){
						$(".otherCityOne").next(".error").next(".jalor-dropdown-btn").hide();
					}else{
						$(".otherCityOne").next(".jalor-dropdown-btn").hide();
					}
					$(".otherCityTwo").attr("placeholder",$.i18nKeyp("Resume.concrete.icity"));
				}else{
					$(".otherCityOne").show();
					$(".otherCityOne").next(".jalor-dropdown-btn").show();
					$(".otherCityTwo").hide();
				}
			}
			var schoolOrInterviewCity = $("input[name='schoolOrInterviewCity']");
			if(schoolOrInterviewCity && schoolOrInterviewCity.manager().reBind){
				setTimeout(function(){
					schoolOrInterviewCity.manager().reBind();
				});
			}
			/*
			if($("#schoolOrInterviewCity") && $("#schoolOrInterviewCity").manager().reBind){
				setTimeout(function(){
					$("#schoolOrInterviewCity").manager().reBind();
					//$("#baseInfoDiv .i18n").i18nKeyp();
				});
			}
			if($("#docSchoolOrInterviewCity") && $("#docSchoolOrInterviewCity").manager().reBind){
				setTimeout(function(){
					$("#docSchoolOrInterviewCity").manager().reBind();
					//$("#baseInfoDiv .i18n").i18nKeyp();
				});
			}*/
			schoolOrInterviewCity.jalorSetValue('');
		}
	}
	//修改证件类型
	page.changeAttachmentType = function(obj){
		var attachmentType = $(obj).jalorGetValue();
		var divObj = $(obj).closest('div').parent();
		if(attachmentType != "" && attachmentType != '7'){
			divObj.find("input[name='attrName']").val($(obj).val());
		} else {
			divObj.find("input[name='attrName']").val('');
		}
	}
	
	//修改发明专利
	page.selectPatent = function(value){
		if(value == 0){
			if($("#patentDiv .listDiv").html()){
				Portal.Campus4.confirm($.i18nKeyp("resume.clearPatent"), ' ', function(isYes){
					if(isYes == 1){
						page.clearPatent();
					} else {
						page.initIsPatent(1);
					}
				});
			} else {
				page.clearPatent();
			}
		} else {
			//显示添加华为亲属按钮
			$("#patentDiv .addBtn").show();
		}
	}
	
	//清除发明专利数据
	page.clearPatent = function(){
		var batchvo={};
		var resumeId = Portal.UserCenter4.resume?Portal.UserCenter4.resume.resumeId:-1;
		batchvo.items2Delete = page.findPartData("services/rec/baseTalent/base/findTalentResumePatentVOListByResumeId/{0}".formatValue(resumeId));
		Jalor.doPut("services/portal/portaluser/pro/updateResumePatentVO",batchvo,function(){
			//清空数据
			$("#patentDiv .listDiv").html("");
			$("#patentDiv .addListDiv").html("");
			
			//重写加载一次简历
			Portal.UserCenter4.initResume();
			page.initPer();
			page.initIsPatent(0);
		});
	}
	
	//修改华为亲属
	page.changeIsFamilyHuawei = function(value){
		if(value == 0){
			if($("#huaweiContactDiv .listDiv").html()){
				Portal.Campus4.confirm($.i18nKeyp("resume.clearHuweiFamily"), ' ', function(isYes){
					if(isYes == 1){
						page.clearFamilHuawei();
					} else {
						page.initIsFamilyHuawei(1);
					}
				});
			} else {
				page.clearFamilHuawei();
			}
		} else {
			//显示添加华为亲属按钮
			$("#huaweiContactDiv .addBtn").show();
		}
	}
	//清除华为亲属数据
	page.clearFamilHuawei = function(){
		var batchvo={};
		var resumeId = Portal.UserCenter4.resume?Portal.UserCenter4.resume.resumeId:-1;
		batchvo.items2Delete = page.findPartData("services/rec/baseTalent/base/findTalentResumeHuaweiContactList/{0}".formatValue(resumeId));
		Jalor.doPut("services/portal/portaluser/pro/updateTalentHuaweiContactVO",batchvo,function(){
			//清空数据
			$("#huaweiContactDiv .listDiv").html("");
			$("#huaweiContactDiv .addListDiv").html("");
			
			//重写加载一次简历
			Portal.UserCenter4.initResume();
			page.initPer();
			page.initIsFamilyHuawei(0);
		});
	}
	//修改国家
	page.changeNationality = function(obj){
		var nationality = $(obj).jalorGetValue();
		if(nationality == "PQH_CN"){
			//当选择中国时，电话区号默认为+86
			var telephoneTitle = $("input[name='telephoneTitle']").jalorGetValue();
			if(!telephoneTitle){
				$("input[name='telephoneTitle']").jalorSetValue('+86');
			}
			//证件类型设为身份证
			var indentifiedTypeObj = $("input[name='indentifiedType']");
			indentifiedTypeObj.jalorSetValue('1');			
			indentifiedTypeObj.attr("ddl_locked","true");
			indentifiedTypeObj.attr("readOnly","readOnly");
			//证件类型，号码为必填
			indentifiedTypeObj.closest("li").find("i").show();
			indentifiedTypeObj.addClass("required");
			var indentifiedIdObj = $("input[name='indentifiedId']");
			indentifiedIdObj.addClass("required");
			$("#nativePlaceLi").show();
			$("#nativePlaceLa").show();
			
			//处理历史数据，中国籍，证件类型非身份证时
			var resume = Portal.UserCenter4.resume;
			if(resume && resume.resumeId != -1 && resume.indentifiedType != 1){
				indentifiedTypeObj.removeAttr("ddl_locked");
				indentifiedTypeObj.removeAttr("readonly");
			}
		} else {
			var indentifiedTypeObj = $("input[name='indentifiedType']");
			indentifiedTypeObj.removeAttr("ddl_locked");
			indentifiedTypeObj.removeAttr("readonly");
			indentifiedTypeObj.jalorSetValue('');
			
			//证件类型，号码为非必填。
			indentifiedTypeObj.closest("li").find("i").hide()
			indentifiedTypeObj.removeClass("required");
			var indentifiedIdObj = $("input[name='indentifiedId']");
			indentifiedIdObj.removeClass("required");
			$("#nativePlaceLi").hide();
			$("#nativePlaceLa").hide();
//			$("#indentifiedType_ddl").find("li[val='1']").click();
//			$("#indentifiedType_ddl").find("li[val='2']").remove();
//			$("#indentifiedType_ddl").find("li[val='3']").remove();
//		}else{
//			if(!$("#indentifiedType_ddl").find("li[val='2']") || $("#indentifiedType_ddl").find("li[val='2']").length == 0){
//				$("#indentifiedType_ddl").find(".list").append('<li class="list-item selected-pre selected" val="2"><span class="list-text">护照</span></li>');
//			}
//			if(!$("#indentifiedType_ddl").find("li[val='3']") || $("#indentifiedType_ddl").find("li[val='3']").length == 0){
//				$("#indentifiedType_ddl").find(".list").append('<li class="list-item selected-pre selected" val="3"><span class="list-text">社保</span></li>');
//			}
		}
	}
	/**
	 * 奖项级别，奖学金级别对应值, LOOKUP2:resume_prize_grade
	 */
	page.getPrizeGrade=function(prizeType){
		var data = Jalor.Component.Lookup.getList('resume_prize_grade','', workspaceVO.currentLanguage);
		if(prizeType == 2){
			var newData = [];
			var index = 0;
			for(var i=0;i<data.length;i++){
				if(data[i].itemCode == 1){
					continue;
				}
				newData[index++] = data[i];
			}
			data = newData;
		}
		return data;
	};
	/**
	 * 语言情况，语言名称修改
	 */
	page.changeLanguage=function(obj){
		var languageObj = $(obj);
		var languageName = languageObj.jalorGetValue();
		//当语言为英语时
		var divObj = languageObj.closest('div').parent();
		var certificatObj = divObj.find("input[name='certificat']");//证书
		var gradeObj = divObj.find("input[name='grade']");//成绩
		if(languageName == 'EN'){
			//证书设置为下拉框
			certificatObj.attr("service","LOOKUP2:LANGUAGE_CERTIFICAT");
			certificatObj.addClass("jalor-combobox");  
			certificatObj.addClass("jalor-dropdown");
			certificatObj.addClass("dropdown-trigger");
			certificatObj.parent().find(".jalor-dropdown-btn").show();
			certificatObj.attr("onchange","Portal.center.ResumeManager.changeCertificat(this)");//设置事件
		} else {
			//证书设置为输入框
			certificatObj.jalorSetValue("");
			certificatObj.removeAttr("service");
			certificatObj.removeClass("jalor-combobox");  
			certificatObj.removeClass("jalor-dropdown");
			certificatObj.removeClass("dropdown-trigger");
			certificatObj.parent().find(".jalor-dropdown-btn").hide();
			certificatObj.removeAttr('onchange');//取消事件
			//取消成绩范围验证
			gradeObj.jalorSetValue("");
			gradeObj.removeAttr("placeholder");
			gradeObj.removeClass("language_grade_level_score");
			gradeObj.removeClass("language_grade_tuofu_score");
			gradeObj.removeClass("language_grade_Ielts_score");
		}
		Jalor.ready(divObj);
		divObj.find(".i18n").i18nKeyp();
		page.changeCertificat(certificatObj);
	}
	/**
	 * 修改证书
	 */
	page.changeCertificat = function(obj){
		var certificatObj = $(obj);
		var certificat = certificatObj.jalorGetValue();//证书
		var divObj = certificatObj.closest('div').parent();
		var gradeObj = divObj.find("input[name='grade']");//成绩
		
		gradeObj.removeAttr("placeholder");
		gradeObj.removeClass("language_grade_level_score");
		gradeObj.removeClass("language_grade_tuofu_score");
		gradeObj.removeClass("language_grade_Ielts_score");
		if(certificat == '1' || certificat == '2'){//四级，六级
			//成绩范围验证设置
			gradeObj.attr("placeholder",$.i18nKeyp("portal.center.language.grade.level.score"));//0~710分
			gradeObj.addClass("language_grade_level_score");
		} else if(certificat == '3'){//托福
			gradeObj.attr("placeholder",$.i18nKeyp("portal.center.language.grade.tuofu.score"));//0~120分
			gradeObj.addClass("language_grade_tuofu_score");
			
		} else if(certificat == '4'){//雅思
			gradeObj.attr("placeholder",$.i18nKeyp("portal.center.language.grade.Ielts.score"));//0~9分
			gradeObj.addClass("language_grade_Ielts_score");
		}
		gradeObj.focusout();
	}
	/**
	 * 教育经历，学校控件初始化
	 */
	
	page.initEstablishment = function(obj){
		var schoolObj = $(obj);
		schoolObj.unbind('keyup');
		//schoolObj.unbind('keydown');
		schoolObj.keyup(initSelect);
		//schoolObj.keydown(initSelect);
	}
	function initSelect(e){
		//console.info(e.keyCode);
		$(this).parent().find(".jalor-dropdown-btn").click();
		if(e.keyCode == 13){
			$(this).parent().find(".jalor-dropdown-btn").click();
		};
		var val = this.value;
		var ddl = $(this).manager().getSelector();//$("#"++"_ddl");			
		var valArr = ddl.find('.list-item');
		var tempArr = [];
		var selectedItem = [];
		for(var i=0;i<valArr.length;i++){
			var key = $(valArr[i]).attr("val");
			var value = $(valArr[i]).find(".list-text").text();
			
			var tempIndex = -1;
			var tempLength = -1;				
			for(var j=0;j<val.length;j++){
				//var index = value.indexOf(val[j]);
				var index = value.substring((tempIndex+1),value.length).indexOf(val[j])+(tempIndex+1);
				if(index>tempIndex){
					tempIndex = index;
					tempLength ++;
				}
			}
			if((tempLength+1) == val.length){
				//console.info(value+"show");
				$(valArr[i]).removeClass("hide");
				selectedItem.push($(valArr[i]));
			} else {
				$(valArr[i]).addClass("hide");
			}
		}
		if(selectedItem.length>0){
			ddl.show();
		} else {
			ddl.hide();
		}
		var listObj = ddl.find(".list");
		var width = listObj.width();
		if(listObj.height()>300){
			width = "185";
		}
		ddl.find(".jalor-selector-body").width(width).height(listObj.height()+10);
		ddl.offset({top: $(this).offset().top + 32,left: $(this).offset().left});
		/*
		//上下移动, selected-pre 
		if(e.keyCode == 38 || e.keyCode == 40 && selectedItem.length>0){
			//当有选择过一个时
			var isSelect = false;
			for(var i=0;i<selectedItem.length;i++){
				if($(selectedItem[i]).attr("class").indexOf("selected-pre")>=0 ){
					if(e.keyCode == 38 && i != 0){
						$(selectedItem[i]).removeClass("selected-pre");
						selectedItem[i-1].addClass("selected-pre");
					} else if(i != selectedItem.length){
						$(selectedItem[i]).removeClass("selected-pre");
						selectedItem[i+1].addClass("selected-pre");
					}
					isSelect = true;
					break;
				}
			}
			if(!isSelect){
				$(selectedItem[0]).addClass("selected-pre");
			}
		}
		*/
	}
	/**
	 * 跳转到简历详情页
	 */
	page.openView = function(){		
		window.open("portal4_index.html#portal/usercenter4/resumeManager/resumeView.html");
	}
	/**
	 * 删除简历附件
	 */
	page.delResumeFile = function(obj){
		var li = $(obj).closest('li');
		li.find("input[name=attachmentId]").val("");
		li.find("[name=attachmentName]").val("");
		
		li.find("#attachmentNameLab").text("");
		li.find("#attachmentNameLab").hide();
		li.find("#attachmentDel").hide();
		li.find("#attUploadFile").show();
		
		Portal.UserCenter4.resume.attachmentId="";
		Portal.UserCenter4.resume.attachmentName="";
	}
	/**
	 * 简历附件上传
	 */
	page.uploadResume = function(obj){
		page.openUploadImage("ResumeFile",function(file, serverData, batchId, userObject){
			debugger;
	     	var attachmentId = serverData[0].attachmentId;
	     	var li = $(obj).closest('li');
	     	li.find("input[name=attachmentId]").val(attachmentId);
	     	li.find("input[name=attachmentName]").val(serverData[0].fileName);
	     	var attName = li.find("#attachmentNameLab");
	     	attName.text(serverData[0].fileName);
	     	attName.show();
	     	li.find("#attachmentDel").show();
	     	li.find("dd").hide();
	     	//保存数据
		/*	Jalor.doPut("services/portal/portaluser/attachment/updateResumeAttachment/{0}".formatValue(attachmentId),
				function(data) {
					//重写加载一次简历
					Portal.UserCenter4.initResume();
					alert(attachmentId);
					Jalor.UI.loadingClose();
				},
				function(err) {
					Jalor.UI.loadingClose();
				}
			);*/
    	});
	}
	page.uploadAnalysisResume = function(){
		debugger;
		var upCallback=function(file, serverData, batchId, userObject){
	     	Jalor.doPost({
			    async:false,
			    url:"services/rec/baseTalent/base/analysisFileResume",
			    data:{"attachmentId":serverData[0].attachmentId},
			    success : function(data){
			    	if(data.status==1){
			    		page.analysisResume(data.data);
			    		//alert("解析成功");
			    	} else {
			    		Portal.Campus4.alert("解析失败");
			    		//alert("解析失败");			    		
			    	}
			    },
			    error : function(data){alert(JSON.stringify(data));},
			    loading : true
			});
		}
		var attType = "ResumeFile";
		/*if(flag == 'other'){
			upCallback = rollback;
			attType = "Portalcard";
		} else if(flag == 'ResumeFile'){
			upCallback = rollback;
			attType = "ResumeFile";
		}*/
		var param = {
			/*上传类型，附件类为Attachment*/
			uploadType : "Attachment",
			/*单个文件上传回调函数*/
			callback : upCallback,
			/*所有文件上传结束的回调函数*/
			completeCallback : null,
			/*用户对象，上传完可以回传此对象*/
			userObject : {
				rowId : 123456
			},
			closeDialog : true,
			/*需要批ID，附件上传时请指定为true*/
			needBatchId : true,
			/*当前批次ID*/
			/*上传参数，此参数可以在服务器端接收。attType由附件处理类处理，标示附件类型，
			 *附件类型配置在数据字典的App.Attachment节点下，每种类型配置fileTypes（如xls,xlsx,doc,docsx,zip,rar），maxSize，maxCount三个节点的Value
			 */
			query : "attType="+attType
		};
		Jalor.Component.openUploadDialog($.i18nKeyp("Resume.cer.upload"), param);
		
	}
	/**
	 * 简历解析
	 */
	page.analysisResume = function(data){
		var resume = {};
		resume.name = data.name;
		resume.title = data.title;
		//$("#baseInfoForm").jsonData();
		//baseInfoForm
		page.loadBaseInfoEdit(data);
	}
	
	/**
	 * 删除简历
	 */
	page.delResume = function(){
		Jalor.UI.loading();
		Jalor.doPost({
		    async:false,
		    url:"services/portal/portaluser/delResume",
		    data:{},
		    success : function(data){
		    	$(".dialogStyle2").hide();//隐藏弹出框
				Jalor.UI.loadingClose();
		    	if(data.status==1){
		    		Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.delResumeSuccess"),'',function(){
			    		//重写加载一次简历
						Portal.UserCenter4.initResume();
						/*page.init();*/
		    			Portal.Campus4.forwardUrl("/reccampportal/campus4_index.html#campus4/content.html",function(){});
		    		});
		    	} else if(data.status==10) {//删除失败！你目前是待入职状态，请联系招聘接口人或邮件给talent@huawei.com处理，先终止入职流程后再申请删除数据。
		    		Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.delete.tip10"),'',function(){});
		    	} else if(data.status==20) {//您目前是待入职状态，请联系招聘接口人，先终止入职流程后再申请删除数据。
		    		Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.delete.tip20"),'',function(){});
		    	} else if(data.status==30) {//按照政策要求，华为公司有权保留已入职员工信息。
		    		Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.delete.tip30"),'',function(){});
		    	} else if(data.status==40) {//按照政策要求，华为公司将统一删除离职员工信息。
		    		Portal.Campus4.alert($.i18nKeyp("portal.resumeManager.delete.tip40"),'',function(){});
		    	} else {
		    		Portal.Campus4.alert(data.msg);
		    	}
		    },
		    error : function(data){
		    	alert(JSON.stringify(data));
				Jalor.UI.loadingClose();
			},
		    loading : true
		});
	}
});
 