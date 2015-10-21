var X=window,M="document",C="getElementsByTagName";
var CLOOPEN_HWD=this;
var CLOOPEN_LAYPOS="CENTER";
var CCOP_LAY_POSITION="50%";
function J(){
	var _,A,$=X[M][C]("script");
	for(var B=0;B<$.length;B++){
		_=$[B].getAttribute("src")||"";
		_=_.substr(0,_.toLowerCase().indexOf("callcenterweb.js"));
		A=_.lastIndexOf("/");
		if(A>0)
			_=_.substring(0,A+1);
		if(_)
			break;
	}
	return _;
}
function addCssFile(path){
	var cssref=document.createElement("link");
	cssref.rel="stylesheet";
	cssref.type="text/css";
	cssref.href=path;
	cssref.media="screen";
	var headobj=document.getElementsByTagName('head')[0];
	headobj.appendChild(cssref);
}
function addScript(path){
	CloopenAgent.showLog('addScript');
	var script = document.createElement('script');
	script.src=path;
	script.type='text/javascript';
	var headobj=document.getElementsByTagName('head')[0];
	headobj.appendChild(script);
}
var contex=J();
addScript(contex+"lhgdialog/lhgdialog.min.js?skin=iblue");
addCssFile(contex+"skin/css/toolbar.css");
var CCOP_SELSTATUS="<select class=\"select\" id=\"ccop_selstatus\" onchange=\"cloopen_changeStatus()\"><option value=\"1\">示闲</option><option value=\"0\">示忙</option><option value=\"-1\">小休</option></select>";
var CCOP_SPANSTATUS="<span class=\"status\" id=\"ccop_spanstatus\"></span>";
var sign="<div class=\"div1\"><a href=\"javascript:void(0);\" id=\"signHref\">签入</a></div>";
var info="<div class=\"div2\"><p>工号<em id=\"agentNumId\"></em></p><p id=\"ccop_pTel\"></p></div>";
//var stat="<div class=\"statlist\"><p class=\"st1\" style=\"cursor: pointer;\" id=\"freeId\">示闲</p><p class=\"st2\" style=\"cursor: pointer;\" id=\"busyId\">示忙</p></div>";
var CCOP_STAT="<div class=\"status_box\" id=\"ccop_divStatus\"><span class=\"time_info\" id=\"timerSpan\"></span></div>";
var CCOP_BTN="<ul class=\"btnlist\"><li id=\"answerLi\"><a href=\"javascript:void(0);\" class=\"na1\"><span>应答</span></a></li><li id=\"muteLi\"><a href=\"javascript:void(0);\" class=\"na3\"><span>静音</span></a></li><li id=\"transferLi\"><a href=\"javascript:void(0);\" class=\"na5\"><span>转接</span></a></li><li id=\"consultLi\"><a href=\"javascript:void(0);\" class=\"na4\"><span>咨询</span></a></li><li id=\"threeLi\"><a href=\"javascript:void(0);\" class=\"na6\"><span>三方</span></a></li><li id=\"surveyLi\"><a href=\"javascript:void(0);\" class=\"na9\"><span>转满意度</span></a></li><li id=\"hangupLi\"><a href=\"javascript:void(0);\" class=\"na7\"><span>挂机</span></a></li><li id=\"calloutLi\"><a href=\"javascript:void(0);\" class=\"na2\"><span>呼出</span></a></li></ul>";
var text="<input type=\"text\" class=\"txt\" id=\"_calloutNum\"/>";
//var query="<div style=\"float: left\" id=\"cloopen_queueDiv\"></div>";
var callIdText="<input type=\"hidden\" id=\"_curCallId\"/>";
//var CCOP_MONITOR="<div class=\"control_in\"><a href=\"#\" class=\"na10\"><span>监控</span></a></div>";
var ccopcc="<div class=\"toolDiv\"><div class=\"toolbar\" id=\"cloopen_toobar\">"+sign+info+CCOP_STAT+CCOP_BTN+text+callIdText+"</div></div>";
document.write(ccopcc);

var CLOOPEN_LOADI=null;
var CLOOPEN_LAYER=null;
var CLOOPEN_AGENTNUM;
var CLOOPEN_VIDEOLAYER=null;
var CLOOPEN_QUERY_FLAG=null;// 0咨询 转接  1监控
$(function(){	
CloopenAgent.InitSuccess(function(autoLogin) {
	CloopenAgent.showLog('InitSuccess,autoLogin:' + autoLogin);
	CLOOPEN_HWD=CloopenAgent.getTipShow();
	CLOOPEN_LAYPOS=CloopenAgent.getLayerPosition();
	
	if(CLOOPEN_LAYPOS=="left"){
		CCOP_LAY_POSITION="0%";
	}else if (CLOOPEN_LAYPOS=="right"){
		CCOP_LAY_POSITION="95%";
	}
	CloopenAgent.showLog('CLOOPEN_HWD:' + CLOOPEN_HWD);
	CLOOPEN_AGENTNUM=CloopenAgent.getAgentNum();
	$("#agentNumId").html(CLOOPEN_AGENTNUM);
	cloopen_showSignIn();
	var workTel=CloopenAgent.getWorkTel();
	if(workTel!=null&&workTel.trim()!=''){
		$("#ccop_pTel").html(workTel);
	}else{
		$("#ccop_pTel").html("软电话");
	}
	if(autoLogin==1){
		cloopen_Login();
	}else{
		cloopen_unLoginStatus();
	}
	
	if($("#cloopen_monitor").length > 0 ) {
		$("#cloopen_monitor").removeClass();
		$("#cloopen_monitor").addClass("control_in");
		$("#cloopen_monitor").unbind("click");
		$("#cloopen_monitor").click(function () {cloopen_jk_MonitorShow();});
	} 
	
});

CloopenAgent.LoginSuccess(function(groups,groupNames,loginStatus) {
	CloopenAgent.showLog('groups:' + groups+",groupNames:"+groupNames+",loginStatus:"+loginStatus);
	cloopen_closeLoadi();
	cloopen_showSignOut();
	//cloopen_initBusyStyle();
	cloopen_updateStatus(loginStatus);
	cloopen_showCallout();
	
});

CloopenAgent.LoginFail(function() {
	CloopenAgent.showLog("LoginFail,签入失败");	
	cloopen_closeLoadi();
	cloopen_initStyle();
	cloopen_unLoginStatus();
	alert('签入失败,请重新签入');
});
CloopenAgent.LogoutSuccess(function() {
	CloopenAgent.showLog("签出成功");
	cloopen_closeLoadi();
	cloopen_showSignIn();
	cloopen_unLoginStatus();
	cloopen_closeCallout();
	//cloopen_initStyle();
});
CloopenAgent.LogoutFail(function() {
	CloopenAgent.showLog("签出失败");
	cloopen_closeLoadi();
	alert('签出失败');
});


CloopenAgent.SayFreeSuccess(function() {
	CloopenAgent.showLog("示闲成功");	
	cloopen_closeLoadi();
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=1;
	cloopen_resetClock(true);
	cloopen_updateStatus(1);
	cloopen_showCallout();
});
CloopenAgent.SayFreeFail(function() {
	CloopenAgent.showLog("示闲失败");
	cloopen_closeLoadi();
	$("#ccop_selstatus").val(CLOOPEN_CUR_STATUS);
});
CloopenAgent.SayBusySuccess(function() {
	CloopenAgent.showLog("示忙成功");
	cloopen_closeLoadi();
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=0;
	cloopen_resetClock(true);
	cloopen_showCallout();
});
CloopenAgent.SayBusyFail(function() {
	CloopenAgent.showLog("示忙失败");
	cloopen_closeLoadi();
	$("#ccop_selstatus").val(CLOOPEN_CUR_STATUS);
});
CloopenAgent.SayBreakSuccess(function() {
	CloopenAgent.showLog("小休成功");
	cloopen_closeLoadi();
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=0;
	cloopen_resetClock(true);
	cloopen_showCallout();
});
CloopenAgent.SayBreakFail(function() {
	CloopenAgent.showLog("小休失败");
	cloopen_closeLoadi();
	$("#ccop_selstatus").val(CLOOPEN_CUR_STATUS);
});
CloopenAgent.CallOutSuccess(function() {
	CloopenAgent.showLog("外呼成功");
	cloopen_closeLoadi();
	cloopen_waitAcceptStatus();
});
CloopenAgent.CallOutFail(function() {
	CloopenAgent.showLog("外呼失败");
	cloopen_closeLoadi();
	alert("外呼失败");
});
CloopenAgent.AnswerReq(function(type,tel,mediaType) { //有呼入	
	CloopenAgent.showLog('有来电,type:' + type+",tel:"+tel+",mediaType:"+mediaType);
	if(mediaType == 1){
		//加载视频显示框
		cloopen_showVideo();
    }
	//打开接听
	cloopen_showAnswer(mediaType);	
	cloopen_waitAnswerStatus();
	//打开挂机
	cloopen_showHangup();
	//禁用外呼
	cloopen_closeCallout();
	if (type==1){
		CloopenAgent.showLog('自动应答');
		cloopen_Answer(mediaType);
	}	
});
CloopenAgent.OpAnswered(function(num,type,anserTime) {
	CloopenAgent.showLog("双方接通,num="+num+",type="+type+",anserTime="+anserTime);
	cloopen_showSurvey();
	cloopen_callStatus(type);
	CLOOPEN_IS_CONSULT=0;
});
//应答成功
CloopenAgent.AnswerSuccess(function() {
	CloopenAgent.showLog("AnswerSuccess,应答成功");
	cloopen_closeAnswer();//关闭应答
	
});
CloopenAgent.AnswerFailure(function() {
	CloopenAgent.showLog("AnswerFailure,应答失败");
	alert("应答失败");
});
CloopenAgent.CallReleased(function() {
	CloopenAgent.showLog("媒体挂机成功");
	CLOOPEN_IS_CONSULT=0;
	cloopen_closeVideo();	
	cloopen_closeAnswer();	
	cloopen_closeMute();
	cloopen_closeTransfer();
	cloopen_closeConsult();
	cloopen_closeThree();
	cloopen_closeSurvey();
	cloopen_closeHangup();
	//话后处理
	cloopen_afterCallStatus();
	
});
CloopenAgent.MuteSuccess(function() {
	CloopenAgent.showLog("静音成功");
	cloopen_closeLoadi();
	if(CLOOPEN_CUR_STATUS==3){
		cloopen_showUnMute();
	}else{
		cloopen_closeMute();
	}
});
CloopenAgent.MuteFail(function() {
	CloopenAgent.showLog("静音失败");
	cloopen_closeLoadi();
	alert("静音失败");
});
CloopenAgent.UnMuteSuccess(function() {
	CloopenAgent.showLog("取消静音成功");
	cloopen_closeLoadi();
	if(CLOOPEN_CUR_STATUS==3){
	cloopen_showMute();
	}else{
		cloopen_closeMute();
	}
});
CloopenAgent.UnMuteFail(function() {
	CloopenAgent.showLog("取消静音失败");
	cloopen_closeLoadi();
	alert("取消静音失败");
});

CloopenAgent.TransferSuccess(function() {
	CloopenAgent.showLog("转接成功");
	cloopen_closeLoadi();
	//CloopenAgent.releaseCall();
});
CloopenAgent.TransferFail(function() {
	CloopenAgent.showLog("转接失败");
	cloopen_closeLoadi();
	alert("转接失败");
});

CloopenAgent.ConsultSuccess(function() {
	CloopenAgent.showLog("发起咨询成功");
	CLOOPEN_LOADI =$.dialog.tips('正在等待接听,请稍后...',600,'loading.gif');
	
});
CloopenAgent.ConsultFail(function() {
	CloopenAgent.showLog("发起咨询失败");
	cloopen_closeLoadi();
	alert("发起咨询失败");
});
CloopenAgent.TripartiteSuccess(function() {
	CloopenAgent.showLog("三方发起成功");
	cloopen_closeConsult();
	cloopen_closeConsult();
});
CloopenAgent.TripartiteFail(function() {
	CloopenAgent.showLog("三方通话失败");
	cloopen_closeLoadi();
	alert("三方通话失败");
});

CloopenAgent.ConsultBackSuccess(function() {
	CloopenAgent.showLog("取消咨询成功");
	cloopen_closeLoadi();
	cloopen_showConsult();
	cloopen_closeThree();
	cloopen_showTransfer();
});
CloopenAgent.ConsultBackFail(function() {
	CloopenAgent.showLog("取消咨询失败");
	cloopen_closeLoadi();
	alert("取消咨询失败");
});
CloopenAgent.ShiftSuccess(function() {
	CloopenAgent.showLog("呼叫转移成功");
	cloopen_closeLoadi();
});
CloopenAgent.ShiftFail(function() {
	CloopenAgent.showLog("呼叫转移失败");
	cloopen_closeLoadi();
	alert("呼叫转移失败");
});
CloopenAgent.ReleaseCallSuccess(function() {
	CloopenAgent.showLog("调用挂机成功");
	cloopen_closeLoadi();
	cloopen_closeVideo();	
	cloopen_closeAnswer();	
	cloopen_closeMute();
	cloopen_closeTransfer();
	cloopen_closeConsult();
	cloopen_closeThree();
	cloopen_closeSurvey();
	cloopen_closeHangup();
	//话后处理
	cloopen_afterCallStatus();
});
CloopenAgent.ReleaseCallFail(function() {
	CloopenAgent.showLog("调用挂机失败");
	cloopen_closeLoadi();
	alert("挂机失败");
});
CloopenAgent.CallEndSuccess(function() {
	CloopenAgent.showLog("满意度发起成功");
	cloopen_closeLoadi();
	cloopen_closeVideo();	
	cloopen_closeAnswer();	
	cloopen_closeMute();
	cloopen_closeTransfer();
	cloopen_closeConsult();
	cloopen_closeThree();
	cloopen_closeSurvey();
	cloopen_closeHangup();
	//话后处理
	cloopen_afterCallStatus();
});
CloopenAgent.CallEndFail(function() {
	CloopenAgent.showLog("满意度发起失败");
	cloopen_closeLoadi();
	alert("发起满意度调查失败");
});
CloopenAgent.CallInfoSuccess(function(agentId,agentState,callId,callNum){
	CloopenAgent.showLog('agentId=' + agentId+',agentState=' + agentState+',callId=' + callId+',callNum=' + callNum);
	
	//cloopen_agentstatus=agentState;
	if(callNum=="null"){
		callNum="";
	}
	$("#_curCallId").val(callId);
	$("#_calloutNum").val(callNum);
	if(agentState==0){
		cloopen_initStyle();
	}
	//if(agentState==4){
		///cloopen_afterCallStatus();
	//}
});
CloopenAgent.AgentStateChange(function(agentId,agentState,queueType){
	CloopenAgent.showLog('班长监控状态变化,agentId=' + agentId+',agentState=' + agentState+',queueType='+ queueType);
	if ($.isFunction(window.cloopen_jk_setMonitorAgent)){
	cloopen_jk_setMonitorAgent(agentId,agentState,queueType);
	}else{
		CloopenAgent.showLog('cloopen_jk_setMonitorAgent 函数不存在');
	}
});
CloopenAgent.QueryQueueSuccess(function(data) {
	CLOOPEN_HWD.$("#cloopen_selqueue").empty();
	CLOOPEN_HWD.$("#cloopen_selqueue").append("<option value=''>技能组</option>");
	$.each(data, function(i,el){
		CLOOPEN_HWD.$("#cloopen_selqueue").append("<option value='"+el.type+"'>"+el.typeName+"</option>");
	});
});
CloopenAgent.QueryAgentByQueueSuccess(function(data) {
	if(CLOOPEN_QUERY_FLAG==1){
		//调用监控显示座席接口
		CloopenAgent.showLog('调用监控加载座席数据');
		if ($.isFunction(window.cloopen_jk_showAgents)){
			cloopen_jk_showAgents(data);
		}else{
			CloopenAgent.showLog('cloopen_jk_showAgents 函数不存在');
		}
	}else{
		CloopenAgent.showLog('加载座席数据');
		//咨询 转接
		CLOOPEN_HWD.$("#cloopen_selagent").empty();
		var state="忙";
		CLOOPEN_HWD.$("#cloopen_selagent").append("<option value=''>客服</option>");
		$.each(data, function(i,el){
			if(el.agentState=="1"){
				state="闲";
			}else{
				state="忙";
			}
			if(el.agentNum!=CLOOPEN_AGENTNUM){
				CLOOPEN_HWD.$("#cloopen_selagent").append("<option value='"+el.agentNum+"_"+el.agentState+"'>"+el.agentNum+"("+state+")</option>");
			}
		}); 
	}
});


CloopenAgent.NetWorkError(function() {
	CloopenAgent.showLog("网络异常");
	alert("网络异常,请重新签入");
	cloopen_closeLoadi();
	cloopen_showSignIn();
	cloopen_unLoginStatus();
	cloopen_initStyle();
});
CloopenAgent.ReLoginFail(function() {
	CloopenAgent.showLog("网络闪断,重连失败");
	alert("网络闪断,重连失败");
	cloopen_closeLoadi();
	cloopen_initStyle();
});
CloopenAgent.HandleNotice(function(agentId,type,callId,result,time) {
	CloopenAgent.showLog("操作结果,agentId:"+agentId+",type:"+type+",callId:"+callId+",result:"+result+",time:"+time);
	if(type==4){
		cloopen_ConsultResult(result);
	}else if(type==5){
		cloopen_ShiftResult(result);
	}else if(type==6){
		cloopen_UnConsultResult(result);
	}else if(type==7){
		cloopen_TripartiteResult(result);
	}
});
CloopenAgent.BehandleNotice(function(agentId,type,callId,result,time) {
	CloopenAgent.showLog("被操作结果,agentId:"+agentId+",type:"+type+",callId:"+callId+",result:"+result+",time:"+time);
	if(type==4){
		cloopen_BehandleResult(result);
	}
});
CloopenAgent.EnterNotice(function(callId,queue,count,time) {
	CloopenAgent.showLog("进入队列通知,callId:"+callId+",queue:"+queue+",count:"+count+",time:"+time);
	
});

CloopenAgent.QuitNotice(function(callId,queue,count,time,type) {
	CloopenAgent.showLog("退出队列通知,callId:"+callId+",queue:"+queue+",count:"+count+",time:"+time+",type:"+type);
	
});

CloopenAgent.StartVideoRecordOnServerSuccess(function(){
	CloopenAgent.showLog("开始服务端录像成功通知");
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STARTRECORD_SERVER,
        disabled: true
    });
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STOPRECORD_SERVER,
        disabled: false
    });
});
CloopenAgent.StartVideoRecordOnServerFail(function(){
	CloopenAgent.showLog("开始服务端录像失败通知");
	alert("开始服务端录像失败");
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STARTRECORD_SERVER,
        disabled: false
    });
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STOPRECORD_SERVER,
        disabled: true
    });
});
CloopenAgent.StopVideoRecordOnServerSuccess(function(){
	CloopenAgent.showLog("停止服务端录像成功通知");
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STARTRECORD_SERVER,
        disabled: false
    });
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STOPRECORD_SERVER,
        disabled: true
    });
});
CloopenAgent.StopVideoRecordOnServerFail(function(){
	CloopenAgent.showLog("停止服务端录像失败通知");
	alert("停止服务端录像失败");
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STARTRECORD_SERVER,
        disabled: true
    });
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STOPRECORD_SERVER,
        disabled: false
    });
});

});

function cloopen_initStyle(){
	CloopenAgent.showLog("置为初始样式");
	cloopen_closeAnswer();
	cloopen_closeMute();
	cloopen_closeTransfer();
	cloopen_closeConsult();
	cloopen_closeThree();
	cloopen_closeSurvey();
	cloopen_closeHangup();
	cloopen_showCallout();
	cloopen_closeLoadi();	
	cloopen_closeLayer();	
	cloopen_closeVideo();
}

function cloopen_getAgent(){
	var queue=CLOOPEN_HWD.$("#cloopen_selqueue").val();
	CLOOPEN_HWD.$("#cloopen_selagent").empty();
	CLOOPEN_HWD.$("#cloopen_selagent").append("<option value=''>加载中</option>");
	CLOOPEN_QUERY_FLAG=0;
	CloopenAgent.queryAgentByQueue(queue);
}

function cloopen_closeVideo(){
	CloopenAgent.showLog('关闭视频div');
	//CLOOPEN_VIDEOLAYER;
	if(CLOOPEN_VIDEOLAYER!=null&&typeof(CLOOPEN_VIDEOLAYER)!="undefined"){
		CLOOPEN_VIDEOLAYER.close();
		CLOOPEN_VIDEOLAYER=null;
	}
	
}

function cloopen_setCamera(type){
	var g_VvideoWidth = 640;
	var	g_VideoHeight = 480;
	var	g_VideoBitrates = 600;
	if(type == "smooth") {
  		g_VvideoWidth = 352;
  		g_VideoHeight = 288;
  		g_VideoBitrates = 500;
  	} else if(type == "HD") {
  		g_VvideoWidth = 1280;
  		g_VideoHeight = 720;
  		g_VideoBitrates = 1000;
  	}
	
	var result=CloopenAgent.getCameraInfo();
	CloopenAgent.showLog("result:"+result);
    var cameraIndex = -1;
    var cabilityIndex = -1;
	if(result!=null&&result!="null"){
		var cameraInfo = JSON.parse(result);
		if(cameraInfo!=null&&cameraInfo.length>0){
			var curCameraInfo = cameraInfo[0];
			if(curCameraInfo!=null&&curCameraInfo.capability!=null){
			for(var j=0;j<curCameraInfo.capability.length;j++) {
				var w = curCameraInfo.capability[j].X;
        		var h = curCameraInfo.capability[j].Y;
        		var fps = curCameraInfo.capability[j].FrameRate;
        		if(fps > -1 && w == g_VvideoWidth && h == g_VideoHeight) {
      				cameraIndex = 0;
      				cabilityIndex = j;	
        		}
        	}
			CloopenAgent.selectCamera(cameraIndex,cabilityIndex);
			}
		}
	}
}
var CCOP_VIDEO_WIDTH=745,CCOP_VIDEO_HEIGHT=300,CCOP_VIDEO_RATIO_ADD=1.1,CCOP_VIDEO_RATIO_SUB=0.9;
function cloopen_changeVideo(cType){
	if(cType=="0"){//加大
		CCOP_VIDEO_WIDTH=CCOP_VIDEO_WIDTH*CCOP_VIDEO_RATIO_ADD;
		CCOP_VIDEO_HEIGHT=CCOP_VIDEO_HEIGHT*CCOP_VIDEO_RATIO_ADD;
		CLOOPEN_VIDEOLAYER.size(Math.floor(CCOP_VIDEO_WIDTH),Math.floor(CCOP_VIDEO_HEIGHT));
		//CLOOPEN_VIDEOLAYER.width
		CLOOPEN_VIDEOLAYER.position(CCOP_LAY_POSITION,'50%');
	}else if(cType=="1"){//缩小
		if(CCOP_VIDEO_WIDTH*CCOP_VIDEO_RATIO_SUB>600){
		CCOP_VIDEO_WIDTH=CCOP_VIDEO_WIDTH*CCOP_VIDEO_RATIO_SUB;
		CCOP_VIDEO_HEIGHT=CCOP_VIDEO_HEIGHT*CCOP_VIDEO_RATIO_SUB;
		CLOOPEN_VIDEOLAYER.size(Math.floor(CCOP_VIDEO_WIDTH),Math.floor(CCOP_VIDEO_HEIGHT));
		CLOOPEN_VIDEOLAYER.position(CCOP_LAY_POSITION,'50%');
		}
	};
}
var CCOP_BTN_STARTRECORD="开始本地录像",CCOP_BTN_STOPRECORD="停止本地录像",CCOP_BTN_SNAPSHOT="抓图";
var CCOP_BTN_STARTRECORD_SERVER="开始服务端录像",CCOP_BTN_STOPRECORD_SERVER="停止服务端录像";
var CCOP_BTN_ADD="+",CCOP_BTN_SUBTRACT="-";
function cloopen_showVideo(){
	//加载弹出div
	CloopenAgent.showLog('显示视频div');
	cloopen_setCamera();
	CloopenAgent.showLog("CLOOPEN_LAYPOS:"+CLOOPEN_LAYPOS);
	
	CLOOPEN_VIDEOLAYER=$.dialog({title:'视频窗口',width:745,height:300,max: false,min: false,padding:0,
		resize:false,
		left: CCOP_LAY_POSITION,
	close: function(){
    	CLOOPEN_VIDEOLAYER=null;
    },
    content: '',
    init: function(){
    	var CLOOPEN_VIEW;
    	if (window.ActiveXObject  || "ActiveXObject" in window){
    		CLOOPEN_VIEW='<OBJECT id="CloopenLocalView" classid="CLSID:68B52885-C989-4C75-A6D3-B054F54E8E8F" width="49%" height="100%" style="float:left"/><OBJECT id="CloopenRemoteView" classid="CLSID:68B52885-C989-4C75-A6D3-B054F54E8E8F" width="49%" height="100%" style="float:right"/>';
    	}else{
	    	CLOOPEN_VIEW='<OBJECT id="CloopenLocalView" type="application/yuntongxun-agent-video-plugin" width="49%" height="100%" style="float:left"/><OBJECT id="CloopenRemoteView" type="application/yuntongxun-agent-video-plugin" width="49%" height="100%" style="float:right"/>';
	    }
    	this.content("<div style=\"width:100%;height:100%;position:relative;\"><div style=\"height:25px;\"><input type=\"button\" value=\"高清\" class=\"cc_btn\" onclick=\"cloopen_setCamera('HD')\"/><input type=\"button\" value=\"标清\" class=\"cc_btn\" onclick=\"cloopen_setCamera('limpid')\"/><input type=\"button\" value=\"流畅\" class=\"cc_btn\" onclick=\"cloopen_setCamera('smooth')\"/><input type=\"button\" value=\"+\" class=\"cc_btn\" onclick=\"cloopen_changeVideo('0')\"/><input type=\"button\" value=\"-\" class=\"cc_btn\" onclick=\"cloopen_changeVideo('1')\"/></div><div style=\"width: 100%;position: absolute; top: 25px; bottom: 0; left: 0\">"+CLOOPEN_VIEW+"</div></div>");
    },
    button: [
       {
	        name: CCOP_BTN_STARTRECORD,
	        callback: function () {
	        	cloopen_startRecordRemote();
	            return false;
	        }
    	},
    	{
    		name: CCOP_BTN_STOPRECORD,
    		disabled: true,
    		callback: function () {
    			cloopen_stopRecordRemote();
    			return false;
    		}
    	},
    	{
    		name: CCOP_BTN_SNAPSHOT,
    		callback: function () {
    			cloopen_getVideoSnapshot();
    			return false;
    		},
    		 focus: true
    	},
    	{
	        name: CCOP_BTN_STARTRECORD_SERVER,
	        callback: function () {
	        	cloopen_startRecordServer();
	            return false;
	        }
    	},
    	{
    		name: CCOP_BTN_STOPRECORD_SERVER,
    		disabled: true,
    		callback: function () {
    			cloopen_stopRecordServer();
    			return false;
    		}
    	}
    	]
    });
}
function cloopen_setVideo(){
	CloopenAgent.showLog('设置视频');
	CloopenAgent.setVideoView(CLOOPEN_HWD.CloopenRemoteView.HWND, CLOOPEN_HWD.CloopenLocalView.HWND);
}
var CCOP_REMOTEVIDEOPATH="";
function cloopen_startRecordRemote(){
	CloopenAgent.showLog("cloopen_startRecordRemote开始录像");
	CCOP_REMOTEVIDEOPATH="";
	var localPath=CloopenAgent.getLocalPath();
	if(localPath!=null){
		var fileName=new Date().getTime()+".mp4";
		CCOP_REMOTEVIDEOPATH=localPath+"\\"+fileName;
		var result = CloopenAgent.startRecordVideoCall(CCOP_REMOTEVIDEOPATH);
		if(result==0){
			CLOOPEN_VIDEOLAYER.button({
		        name: CCOP_BTN_STOPRECORD,
		        disabled: false
		    });
			CLOOPEN_VIDEOLAYER.button({
				name: CCOP_BTN_STARTRECORD,
				disabled: true
			});
		}else{
			alert("开始录像失败"+result);
		}
	}else{
		alert("本地保存路径未设置");
	}
	
}
function cloopen_stopRecordRemote(){
	CloopenAgent.showLog("cloopen_stopRecordRemote停止录像");
	var result = CloopenAgent.stopRecordVideoCall();
	if(result==0){
		alert("录像文件"+CCOP_REMOTEVIDEOPATH+"已保存");
	}else{
		alert("录像文件保存失败:"+result);
	}
	CLOOPEN_VIDEOLAYER.button({
		name: CCOP_BTN_STOPRECORD,
		disabled: true
	});
	CLOOPEN_VIDEOLAYER.button({
        name: CCOP_BTN_STARTRECORD,
        disabled: false
    });
}
function cloopen_getVideoSnapshot(){
	CloopenAgent.showLog("cloopen_getVideoSnapshot录像抓图");
	var localPath=CloopenAgent.getLocalPath();
	if(localPath!=null){
		var fileName=new Date().getTime()+".jpg";
		var path=CloopenAgent.getLocalPath()+"\\"+fileName;
		var result = CloopenAgent.getVideoSnapshot(path);
		if(result==0){
			alert("图片文件"+path+"已保存");
		}else{
			alert("图片文件保存失败:"+result);
		}
	}else{
		alert("保存路径未设置");
	}
}
function cloopen_startRecordServer(){
	CloopenAgent.showLog("cloopen_startRecordServer开始调用服务端录像");
	var result=CloopenAgent.startVideoRecordOnServer();
	if(result==0){
		CloopenAgent.showLog("cloopen_startRecordServer开始调用服务端录像,result:"+result);
		CLOOPEN_VIDEOLAYER.button({
	        name: CCOP_BTN_STARTRECORD_SERVER,
	        disabled: true
	    });
	}else{
		alert("开始服务端录像接口失败,结果:"+result);
	}
}
function cloopen_stopRecordServer(){
	CloopenAgent.showLog("cloopen_stopRecordServer调用停止服务端录像");
	var result=CloopenAgent.stopVideoRecordOnServer();
	if(result==0){
		CLOOPEN_VIDEOLAYER.button({
	        name: CCOP_BTN_STOPRECORD_SERVER,
	        disabled: true
	    });
	}else{
		alert("停止服务端录像接口失败,结果:"+result);
	}
}
var photoPage="";
function cloopen_openLocalPhoto(){
	//加载弹出div
	CloopenAgent.showLog('显示本地拍照div');
	/**
	 * 视频先去掉
	photoPage =CLOOPEN_HWD.$.layer({
		   type: 1,   //0-4的选择,
		   shade: [0],
		   title: [
		           '视频窗口',
		           'border:none; background:#d5e0ea; color:#fff;' 
		       ],
		   border: [1, 0.3, '#000'],
		   closeBtn: false,
		   offset: [($(window).height() - 260)/2+'px', ''],
		   area: ['321', '260'],
		   page: {
		        html: '<div style="width:100%; border:1px solid #ccc;"><OBJECT ID="CloopenSnapshotView" width="320" height="240" CLASSID="CLSID:68B52885-C989-4C75-A6D3-B054F54E8E8F"></OBJECT><br/><div style="text-align:center;"><input type="button" value="拍照" onclick="cloopen_getLocalPhoto()"/>&nbsp;&nbsp;<input type="button" value="关闭" onclick="cloopen_closeLocalPhoto()"/></div></div>' 
		   },
		   success: function(photoPage){
			   var result = CloopenAgentOcx.StartVideoWithoutCall(0,320,240,0,CloopenSnapshotView.HWND);
			   CloopenAgent.showLog('StartVideoWithoutCall:'+result);
		   }
	});	
	**/
}
function cloopen_closeLocalPhoto(){
	CloopenAgent.showLog('关闭本地拍照视频div');
	/**
	 * 视频先去掉
	if(photoPage!=""){
		CloopenAgent.showLog('关闭');	
		var result = CloopenAgentOcx.StopVideoWithoutCall();
		CloopenAgent.showLog("StopVideoWithoutCall:" + result);
		CLOOPEN_HWD.layer.close(photoPage);
	}
	**/
}
function cloopen_getLocalPhoto(){
	CloopenAgent.showLog('抓取本地照片');
	if(photoPage!=""){
		CloopenAgent.showLog('关闭');	
		var fileName=new Date().getTime()+".jpg";
		var localPath=CloopenAgent.getLocalPath();
		if(localPath!=null){
			var path=CloopenAgent.getLocalPath()+"\\"+fileName;
			var result = CloopenAgentOcx.GetSnapshotWithoutCall(path);
			CloopenAgent.showLog("GetSnapshotWithoutCall:" + result);
			if(result==0){
				alert("文件"+path+"已保存");
			}else{
				alert("文件保存失败:"+result);
			}
		}else{
			alert("保存路径未设置");
		}
	}
}

/**改版**/
//0忙 1闲 2锁定 3通话 -1小休 -2未连接 -3话后处理
var CLOOPEN_CUR_STATUS=-2;
var CLOOPEN_PRE_STATUS=-2;
var CLOOPEN_IS_CONSULT=0;
function cloopen_showSignIn(){
	$("#signHref").html("签入");
	$("#signHref").removeClass();
	$("#signHref").unbind("click");
	$("#signHref").click(function () {cloopen_Login();});
}
function cloopen_showSignOut(){
	$("#signHref").html("签出");
	$("#signHref").removeClass();
	$("#signHref").addClass("signout");
	$("#signHref").unbind("click");
	$("#signHref").click(function () {cloopen_Logout();});
}
function cloopen_showCallout(){
	CloopenAgent.showLog('显示外呼');
	$("#calloutLi").removeClass();
	$("#calloutLi").addClass("on");
	$("#calloutLi").unbind('click');
	$("#calloutLi").click(function () {cloopen_CallOut();});
}
function cloopen_showAnswer(mediaType){
	CloopenAgent.showLog('显示应答,mediaType:'+mediaType);
	$("#answerLi").removeClass();
	$("#answerLi").addClass("on");
	$("#answerLi").unbind("click");
	$("#answerLi").click(function () {cloopen_Answer(mediaType);});	
}
function cloopen_showHangup(){
	CloopenAgent.showLog('显示挂机');
	//在软电话上班时启用
	if(CloopenAgent.getIsLoginSoftPhone()){
	$("#hangupLi").removeClass();
	$("#hangupLi").addClass("on");
	$("#hangupLi").unbind("click");
	$("#hangupLi").click(function () {cloopen_HangUp();});
	}
}
function cloopen_showMute(){
	CloopenAgent.showLog('显示静音');
	$("#muteLi").removeClass();
	$("#muteLi").addClass("on");
	$("#muteLi").unbind("click");
	$("#muteLi").click(function () {cloopen_Mute();});	
}
function cloopen_showUnMute(){
	CloopenAgent.showLog('显示取消静音');
	$("#muteLi").removeClass();
	$("#muteLi").addClass("active");
	$("#muteLi").unbind("click");
	$("#muteLi").click(function () {cloopen_UnMute();});	
}
function cloopen_showTransfer(){
	CloopenAgent.showLog('显示转接');
	$("#transferLi").removeClass();
	$("#transferLi").addClass("on");
	$("#transferLi").unbind("click");
	$("#transferLi").click(function () {cloopen_TransferShow();});	
}
function cloopen_showConsult(){
	CloopenAgent.showLog('显示咨询');
	$("#consultLi").removeClass();
	$("#consultLi").addClass("on");
	$("#consultLi").unbind("click");
	$("#consultLi").click(function () {cloopen_ConsultShow();});
}
function cloopen_showUnConsult(){
	CloopenAgent.showLog('显示取回咨询');
	$("#consultLi").removeClass();
	$("#consultLi").addClass("active");
	$("#consultLi").unbind("click");
	$("#consultLi").click(function () {cloopen_ConsultCancel();});
}
function cloopen_showThree(){
	CloopenAgent.showLog('显示三方');
	$("#threeLi").removeClass();
	$("#threeLi").addClass("on");
	$("#threeLi").unbind("click");
	$("#threeLi").click(function () {cloopen_Tripartite();});
}
function cloopen_showShift(){
	CloopenAgent.showLog('显示呼叫转移');
	$("#transferLi").removeClass();
	$("#transferLi").addClass("on");
	$("#transferLi").unbind("click");
	$("#transferLi").click(function () {cloopen_Shift();});	
}
function cloopen_showSurvey(){
	CloopenAgent.showLog('显示满意度');
	$("#surveyLi").removeClass();
	$("#surveyLi").addClass("on");
	$("#surveyLi").unbind("click");
	$("#surveyLi").click(function () {cloopen_Survey();});
}
function cloopen_closeSurvey(){
	CloopenAgent.showLog('关闭满意度');
	$("#surveyLi").removeClass();
	$("#surveyLi").unbind("click");
}
function cloopen_closeThree(){
	CloopenAgent.showLog('关闭三方');
	$("#threeLi").removeClass();
	$("#threeLi").unbind("click");
}
function cloopen_closeConsult(){
	CloopenAgent.showLog('关闭咨询');
	$("#consultLi").removeClass();
	$("#consultLi").unbind("click");
}

function cloopen_closeShift(){
	CloopenAgent.showLog('关闭呼叫转移');
	$("#transferLi").removeClass();
	$("#transferLi").unbind("click");
}

function cloopen_closeTransfer(){
	CloopenAgent.showLog('关闭转接');
	$("#transferLi").removeClass();
	$("#transferLi").unbind("click");
}
function cloopen_closeMute(){
	CloopenAgent.showLog('关闭静音');
	$("#muteLi").removeClass();
	$("#muteLi").unbind("click");
} 
function cloopen_closeHangup(){
	CloopenAgent.showLog('关闭挂机');
	$("#hangupLi").removeClass();
	$("#hangupLi").unbind("click");
}
function cloopen_closeAnswer(){
	CloopenAgent.showLog('关闭应答');
	$("#answerLi").removeClass();
	$("#answerLi").unbind("click");
}
function cloopen_closeCallout(){
	CloopenAgent.showLog('关闭外呼');
	$("#calloutLi").removeClass();
	$("#calloutLi").unbind('click');
}

function cloopen_TransferShow(){	
	CloopenAgent.showLog("显示转接选择");
	CLOOPEN_LAYER=$.dialog({title:'通话转接',width:400,height:300,max: false,min: false,padding:0,button: [{
        name: '转接',
        callback: function () {
        	return cloopen_TransferStart();        	
        },focus: true
    }],
    close: function(){
    	CLOOPEN_LAYER=null;
    },
    content: '<div id="cloopentabbox"><ul class="cloopentabs" id="cloopentabs"><li><a href="javascript:void(0)">转座席</a></li><li><a href="javascript:void(0)">转号码</a></li></ul><ul class="cloopentab_conbox" id="cloopentab_conbox"><li class="cloopentab_con"><span>队列</span><select id="cloopen_selqueue" style="width:200px;" ><option value="">加载中</option></select><br/><span>座席</span><select id="cloopen_selagent" style="width:200px;"></select></li><li class="cloopentab_con"><span style="width:30px;line-height:30px; float:left;">号码</span><input type="text" id="cloopen_transNum" class="txt"/></li></ul></div>'
    });
	CLOOPEN_HWD.$("#cloopen_selqueue").bind('change',function(){
		cloopen_getAgent();
	});	
	CLOOPEN_HWD.$("#cloopentab_conbox").find("li").hide();
	CLOOPEN_HWD.$("#cloopentabs").find("li:first").addClass("thiscloopentab").show(); 
	CLOOPEN_HWD.$("#cloopentab_conbox").find("li:first").show();

	CLOOPEN_HWD.$("#cloopentabs").find("li").bind('click',function(){
	  $(this).addClass("thiscloopentab").siblings("li").removeClass("thiscloopentab"); 
		var activeindex = CLOOPEN_HWD.$("#cloopentabs").find("li").index(this);
		CLOOPEN_HWD.$("#cloopentab_conbox").children().eq(activeindex).show().siblings().hide();
		return false;
	});
	CloopenAgent.queryQueue();	
}
function cloopen_TransferStart(){
	if(CLOOPEN_HWD.$("#cloopentab_conbox").find("li:first").is(":hidden")){
		return cloopen_TransferNumStart();
	}else{
		return cloopen_TransferAgentStart();
	}
}
//转接
function cloopen_TransferAgentStart(){
	//座席
	var queue=CLOOPEN_HWD.$("#cloopen_selqueue").val();
	var selAgent=CLOOPEN_HWD.$("#cloopen_selagent").val();	
	if(queue==null || queue==""){
		alert("请选择队列");
		return false;
	}else{
		var agentId="";
		if(selAgent!=""){
			var agent=selAgent.split("_");
			agentId=agent[0];
			agentState=agent[1];
			if(agentState!=1){
				alert("非空闲座席不能转接");
				return false;
			}
		}
		CloopenAgent.transfer(queue,agentId);
		CLOOPEN_LOADI =$.dialog.tips('发起转接...',600,'loading.gif');
	}
	return true;
}
//转接
function cloopen_TransferNumStart(){
	//号码
	var transNum=CLOOPEN_HWD.$("#cloopen_transNum").val();
	if(transNum==null || transNum.trim()==""){
		alert("请填写转接号码");
		return false;
	}else{
		CloopenAgent.transfer("","",transNum.trim());
		CLOOPEN_LOADI =$.dialog.tips('发起转接...',600,'loading.gif');
		return true;
	}
}
function cloopen_ConsultShow(){	
	CloopenAgent.showLog("显示咨询");
	CLOOPEN_LAYER=$.dialog({title:'咨询通话',width:400,height:300,max: false,min: false,padding:0,button: [{
        name: '咨询',
        callback: function () {
        	return cloopen_ConsultAgentStart();
        	
        },focus: true
    }],
    close: function(){
    	CLOOPEN_LAYER=null;
    },
    content: '<div style="width:350px;height:270px;padding:5px; border:1px solid #ccc;line-height:20px;"><span>队列</span><select id="cloopen_selqueue" style="width:200px;" ><option value="">加载中</option></select><br/><span>座席</span><select id="cloopen_selagent" style="width:200px;"></select></div>'
    });
	CLOOPEN_HWD.$("#cloopen_selqueue").bind('change',function(){
		cloopen_getAgent();
	});
	
	CloopenAgent.queryQueue();
	
}
function cloopen_ConsultAgentStart(){
	var selAgent=CLOOPEN_HWD.$("#cloopen_selagent").val();
	if(selAgent==null || selAgent==""){
		alert("请选择座席");
		return false;
	}else{
		var agentId="";
		if(selAgent!=""){
			var agent=selAgent.split("_");
			agentId=agent[0];
			agentState=agent[1];
			if(agentState!=1){
				alert("非空闲座席不能咨询");
				return false;
			}
		}
		CloopenAgent.consult(agentId);
		CLOOPEN_LOADI =$.dialog.tips('发起咨询...',600,'loading.gif');
	}
	return true;
}
function cloopen_changeStatus(){	
	var selstatus=$("#ccop_selstatus").val();
	if(selstatus==1){
		cloopen_SayFree();
	}else if (selstatus==0){
		cloopen_SayBusy();
	}else if (selstatus==-1){
		//小休
		cloopen_SayBreak();
	}
	
}
function cloopen_Login(){
	CloopenAgent.showLog("签入");
	CloopenAgent.login();
	CLOOPEN_LOADI =$.dialog.tips('签入中...',600,'loading.gif');
}
function cloopen_Logout(){
	CloopenAgent.showLog("签出");
	CloopenAgent.logout();
	CLOOPEN_LOADI =$.dialog.tips('签出中...',600,'loading.gif');
}
function cloopen_CallOut(){
	var num=$("#_calloutNum").val();
	if(num==""){
		alert("请输入用户号码");
	}else{
		CloopenAgent.showLog("外呼");
		CLOOPEN_LOADI =$.dialog.tips('外呼中...',600,'loading.gif');
		CloopenAgent.callOut(num);
	}
}
function cloopen_Answer(mediaType){
	CloopenAgent.showLog("cloopen_Answer,mediaType:"+mediaType);
	if(mediaType==1){
		cloopen_setVideo();
	}
	CloopenAgent.accept();
}
function cloopen_HangUp(){
	CloopenAgent.showLog("cloopen_HangUp 挂机");
	CloopenAgent.releaseCall();
	CLOOPEN_LOADI =$.dialog.tips('挂机中...',600,'loading.gif');
}
function cloopen_SayFree(){
	CloopenAgent.showLog('调用示闲');
	CloopenAgent.sayFree();
	CLOOPEN_LOADI =$.dialog.tips('示闲中...',600,'loading.gif');
}
function cloopen_SayBusy(){
	CloopenAgent.showLog('调用示忙');
	CloopenAgent.sayBusy();
	CLOOPEN_LOADI =$.dialog.tips('示忙中...',600,'loading.gif');
}
function cloopen_SayBreak(){
	CloopenAgent.showLog('调用小休');
	CloopenAgent.sayBreak();
	CLOOPEN_LOADI =$.dialog.tips('小休中...',600,'loading.gif');
}
function cloopen_Mute(){
	CloopenAgent.showLog('cloopen_Mute 静音');
	CloopenAgent.mute();
	CLOOPEN_LOADI =$.dialog.tips('静音中...',600,'loading.gif');
}
function cloopen_UnMute(){
	CloopenAgent.showLog('cloopen_UnMute 取消静音');
	CloopenAgent.unMute();
	CLOOPEN_LOADI =$.dialog.tips('取消静音中...',600,'loading.gif');
}
function cloopen_ConsultCancel(){
	CloopenAgent.showLog("cloopen_ConsultCancel,取消咨询");
	CloopenAgent.consultBack();
	CLOOPEN_LOADI =$.dialog.tips('取消咨询中...',600,'loading.gif');
}
function cloopen_Tripartite(){
	var callId=$("#_curCallId").val();
	CloopenAgent.showLog("cloopen_Tripartite,发起三方:"+_curCallId);	
	CloopenAgent.tripartite(callId);
	CLOOPEN_LOADI =$.dialog.tips('正在发起三方...',600,'loading.gif');
}
function cloopen_Shift(){
	CloopenAgent.showLog("cloopen_Shift,咨询呼叫");
	CloopenAgent.shift();
	CLOOPEN_LOADI =$.dialog.tips('正在呼转...',600,'loading.gif');
}
function cloopen_Survey(){
	CloopenAgent.showLog("cloopen_Survey,满意度调查");
	CloopenAgent.callEnd();
	CLOOPEN_LOADI =$.dialog.tips('转接满意度调查...',600,'loading.gif');
}


function cloopen_BehandleResult(result){
	CloopenAgent.showLog("cloopen_BehandleResult,被咨询结果"+result);
	if(result==0){
		cloopen_closeMute();
		cloopen_closeTransfer();
		cloopen_closeConsult();
		cloopen_closeThree();
		cloopen_closeSurvey();
	}
}

function cloopen_ConsultResult(result){
	CloopenAgent.showLog("cloopen_ConsultResult,咨询结果"+result);
	if(result==0){
		cloopen_showUnConsult();
		cloopen_showThree();
		cloopen_showShift();
		cloopen_closeLoadi();
		cloopen_closeLayer();
	}else{
		cloopen_closeLoadi();
		alert("座席咨询失败,请重试");
	}
}
function cloopen_UnConsultResult(result){
	CloopenAgent.showLog("cloopen_UnConsultResult,取回咨询结果"+result);
	if(result==0){
		cloopen_showTransfer();
		cloopen_showConsult();
		cloopen_closeThree();
		cloopen_closeLoadi();
		cloopen_closeLayer();
	}else{
		cloopen_closeLoadi();
		alert("座席取回咨询失败,请重试");
	}
}
function cloopen_TripartiteResult(result){
	CloopenAgent.showLog("cloopen_TripartiteResult,三方结果"+result);
	if(result==0){
		cloopen_closeMute();
		cloopen_closeTransfer();
		cloopen_closeConsult();
		cloopen_closeThree();
		cloopen_closeLoadi();	
		cloopen_closeLayer();
	}else{
		cloopen_closeLoadi();
		alert("三方失败,请重试");
	}
}

function cloopen_ShiftResult(result){
	CloopenAgent.showLog("cloopen_ShiftResult,呼叫转移结果"+result);
	if(result==0){
		cloopen_closeVideo();	
		cloopen_closeAnswer();	
		cloopen_closeMute();
		cloopen_closeTransfer();
		cloopen_closeConsult();
		cloopen_closeThree();
		cloopen_closeSurvey();
		cloopen_closeHangup();
		cloopen_closeLoadi();	
		cloopen_closeLayer();
	}else{
		cloopen_closeLoadi();
		alert("转移呼叫失败,请重试");
	}
}
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, ""); 
};
var CLOOPEN_TIME=0;
var CLOOPEN_CLOCK;
function cloopen_afterCallStatus(){
	//话后处理
	CloopenAgent.showLog('cloopen_afterCallStatus');
	if(CLOOPEN_CUR_STATUS!=-3){
	if ( $("#ccop_spanstatus").length > 0 ) {
		$("#ccop_spanstatus").html("话后处理");
	}else{
		if ( $("#ccop_selstatus").length > 0 ) {
			$("#ccop_selstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SPANSTATUS);
		$("#ccop_spanstatus").html("话后处理");
	}	
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=-3;
	cloopen_resetClock(true);
	cloopen_showCallout();
	}
}
function cloopen_waitAnswerStatus(){
	//等待应答
	CloopenAgent.showLog('cloopen_waitAnswerStatus');
	if ( $("#ccop_spanstatus").length > 0 ) {
		$("#ccop_spanstatus").html("等待应答");
	}else{
		if ( $("#ccop_selstatus").length > 0 ) {
			$("#ccop_selstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SPANSTATUS);
		$("#ccop_spanstatus").html("等待应答");
	}	
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=2;
	cloopen_resetClock(false);
}
function cloopen_waitAcceptStatus(){
	//等待接听
	CloopenAgent.showLog('cloopen_waitAcceptStatus');
	if ( $("#ccop_spanstatus").length > 0 ) {
		$("#ccop_spanstatus").html("等待接听");
	}else{
		if ( $("#ccop_selstatus").length > 0 ) {
			$("#ccop_selstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SPANSTATUS);
		$("#ccop_spanstatus").html("等待接听");
	}	
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=2;
	cloopen_resetClock(false);
}
function cloopen_callStatus(type){
	var showStatus="通话";
	if(type==1){
		showStatus="外呼通话";
	}
	//通话状态
	CloopenAgent.showLog('cloopen_callStatus');
	if ( $("#ccop_spanstatus").length > 0 ) {
		$("#ccop_spanstatus").html(showStatus);
	}else{
		if ( $("#ccop_selstatus").length > 0 ) {
			$("#ccop_selstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SPANSTATUS);
		$("#ccop_spanstatus").html(showStatus);
	}	
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=3;
	cloopen_resetClock(true);
	cloopen_showMute();
	if(CLOOPEN_IS_CONSULT==0){
	cloopen_showTransfer();
	cloopen_showConsult();
	}
	cloopen_showHangup();
	cloopen_closeCallout();
}
function cloopen_unLoginStatus(){
	CloopenAgent.showLog('cloopen_unLoginStatus');
	if ( $("#ccop_spanstatus").length > 0 ) {
		$("#ccop_spanstatus").html("未连接");
	}else{
		if ( $("#ccop_selstatus").length > 0 ) {
			$("#ccop_selstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SPANSTATUS);
		$("#ccop_spanstatus").html("未连接");
	}	
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=-2;
	cloopen_resetClock(false);
}
function cloopen_updateStatus(status){
	//处理 0忙 1闲 -1小休
	CloopenAgent.showLog('cloopen_updateStatus');
	if ( $("#ccop_selstatus").length > 0 ) {
		$("#ccop_selstatus").val(status);
	}else{
		if ( $("#ccop_spanstatus").length > 0 ) {
			$("#ccop_spanstatus").remove();
		}
		$("#ccop_divStatus").prepend(CCOP_SELSTATUS);
		$("#ccop_selstatus").val(status);
	}
	cloopen_resetClock(true);
	CLOOPEN_PRE_STATUS=CLOOPEN_CUR_STATUS;
	CLOOPEN_CUR_STATUS=status;
}
function cloopen_resetClock(flag){
	CloopenAgent.showLog('cloopen_resetClock');
	clearInterval(CLOOPEN_CLOCK);
	CLOOPEN_TIME=0;
	if(flag){
		CLOOPEN_CLOCK=setInterval("cloopen_timerClock()", 1000);
	}else{
		$("#timerSpan").html("");
	}
}
function cloopen_timerClock(){  
	//CloopenAgent.showLog('timerClock');
	CLOOPEN_TIME++;	
	if(CLOOPEN_CUR_STATUS==-3){
		var afterTime=CloopenAgent.getAfterTime();
		//CloopenAgent.showLog(CLOOPEN_CUR_STATUS+","+CLOOPEN_TIME+","+afterTime);
		//话后处理
		if(afterTime==CLOOPEN_TIME){
			cloopen_SayFree();
		}
	}
	var sec = parseInt(CLOOPEN_TIME);// 秒
	var min = 0;// 分
	var hour = 0;// 小时
	if(sec > 60) {
		min = parseInt(sec/60);
	    sec = parseInt(sec%60);
	    if(min > 60) {
	    	hour = parseInt(min/60);
	        min = parseInt(min%60);
	    }
	}
	if(sec<10){
		sec="0"+sec;
	}
	if(min<10){
		min="0"+min;
	}
	if(hour<10){
		hour="0"+hour;
	}
    $("#timerSpan").html(hour+":"+min+":"+sec);
}
function cloopen_closeLoadi(){
	if(CLOOPEN_LOADI!=null&&typeof(CLOOPEN_LOADI)!="undefined"){
		CLOOPEN_LOADI.close();
		CLOOPEN_LOADI=null;
	}
}
function cloopen_closeLayer(){
	if(CLOOPEN_LAYER!=null&&typeof(CLOOPEN_LAYER)!="undefined"){
		CLOOPEN_LAYER.close();
		CLOOPEN_LAYER=null;
	}
}