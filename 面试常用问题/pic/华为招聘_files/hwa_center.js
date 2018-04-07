setTimeout(function() {
	window.g_hwa_disable_trackajax = true;
	if(localStorage){
		var load = JSON.parse(localStorage.getItem("RETNEC4LATROPPMACCERAWHBOJ"));
		if(!load || load.date !== (new Date()).toDateString()){
			load = {};
			load.date =  (new Date()).toDateString();
			localStorage.setItem("RETNEC4LATROPPMACCERAWHBOJ", JSON.stringify(load));
            window.ha=function (mt,param){
                //redefine ha for first request
            };
			return;
		}
	}
	if(window.location.host == "career.huawei.com") {
		(function(i,s,o,g,r,a,m){i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','http://app.huawei.com/hwa-c/configresource/js/general/ha.js','ha');
		ha("setSiteId","iTalent-ReccampPortal");
		ha('setBeforeRequestFn',function(req){if(req.action == 'ajax-pp') return false;});
		ha("setAutoSendPV",true);
		ha("setAutoLinkTracking",true);//true:自动捕获，false:不自动捕获
	} else {
		(function(i,s,o,g,r,a,m){i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','http://nkweb-sit.huawei.com/hwa/configresource/js/general/ha.js','ha');
		ha("setSiteId","iTalent-ReccampPortal");
		ha('setBeforeRequestFn',function(req){if(req.action == 'ajax-pp') return false;});
		ha("setAutoSendPV",true);
		ha("setAutoLinkTracking",true);//true:自动捕获，false:不自动捕获
	}
}, 2000);