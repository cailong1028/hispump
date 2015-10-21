/*! CloopenAgent v2.1.9 | (c) 2015
 * 修改为支持非ie浏览器
 * 
 */
var CloopenAgent = (function() {
	var _agentNum=null,_agentPwd=null,_ocxIp=null,_ocxPort=null,_appId=null,_workTel=null;
	var _autoLogin=0;  //是否自动签入  1自动签入
	var _loginStatus=0; //签入后状态置未 0忙 1闲
	var DEBUG = true;
	//var isIE = (document.all && window.ActiveXObject && !window.opera) ? true : false;
	//自定义回调方法
	var _definedFun=null;
	var _callFun=null,_countFun=null;
	var _serverUrl=null;  //代理服务器地址
	var _tipHwd=this;     //弹出层相对引用
	var _localPath="d:\\cloopen";   //抓图保存路径
	var _afterTime=5; //话后处理时间缺省30秒
	var _groups=null,_groupNames=null;  //队列号 和 队列名称
	var _loginSoftPhone=true;   //是否登陆软电话
	var _layerPosition="center";
	var _serverUrl="http://cc.cloopen.com:8889/gw/getConfig";
	//var _serverUrl="http://118.194.243.240:8680/gw/getConfig";
	//初始化
	function init(agentNum,agentPwd,appId,workTel,autoLogin,loginStatus,loginSoftPhone){
		loadObject();
		_agentNum=agentNum;
		_agentPwd=agentPwd;
		_appId=appId;
		_workTel=workTel;
		if(autoLogin=="1"){
			_autoLogin=autoLogin;
		}
		if(loginStatus=="1"){
			_loginStatus=loginStatus;
		}
		if(loginSoftPhone==false){
			_loginSoftPhone=false;
		}
		getContextPath();
		initEvent();
		showLog("初始信息>>_agentNum = " + _agentNum + "_agentPwd = " + _agentPwd +"_appId = " + _appId + "_workTel = " + _workTel+"_autoLogin="+_autoLogin+"_loginStatus="+_loginStatus+"_loginSoftPhone="+_loginSoftPhone);
	}
	function loadObject(){
		showLog("加载座席控件");
		// 创建Cloopen Agent 插件
		var CloopenAgentObj = document.createElement("object");
		if (window.ActiveXObject  || "ActiveXObject" in window)
			CloopenAgentObj.classid = "CLSID:FB3630CC-D79B-4AB8-97D9-A4805FDE8AB1";
		else
			CloopenAgentObj.type = "application/yuntongxun-agent-plugin";
		CloopenAgentObj.id = "CloopenAgentOcx";
		document.body.appendChild(CloopenAgentObj);
	}
	function initEvent(){
		if(CloopenAgentOcx.AgentServerURL==undefined){
			alert("控件未加载");
		}
		showLog("初始控件事件");
		if(_serverUrl!=null&&_serverUrl!=""){
			CloopenAgentOcx.AgentServerURL=_serverUrl;
			showLog("AgentServerURL:"+CloopenAgentOcx.AgentServerURL);
		}
		CloopenAgentOcx.LoginSoftPhone=_loginSoftPhone;
		
		event("OnNetWorkErrorEvent", CloopenAgent.OnNetWorkError);
		event("OnLoginSuccess", CloopenAgent.OnLoginSuccess);
		event("OnLoginFailure", CloopenAgent.OnLoginFailure);
		event("OnLogoutSuccess", CloopenAgent.OnLogoutSuccess);
		event("OnLogoutFailure", CloopenAgent.OnLogoutFailure);
		//有来电
		event("OnAnswerRequest", CloopenAgent.OnAnswerRequest);
		event("OnAnswerSuccess", CloopenAgent.OnAnswerSuccess);
		event("OnAnswerFailure", CloopenAgent.OnAnswerFailure);
		//event("OnReleaseSuccess", CloopenAgent.OnReleaseSuccess);
		///event("OnReleaseFailure", CloopenAgent.OnReleaseFailure);
		event("OnSayFreeSuccess", CloopenAgent.OnSayFreeSuccess);
		event("OnSayFreeFailure", CloopenAgent.OnSayFreeFailure);
		event("OnSayBusySuccess", CloopenAgent.OnSayBusySuccess);
		event("OnSayBusyFailure", CloopenAgent.OnSayBusyFailure);
		event("OnSayBreakSuccess", CloopenAgent.OnSayBreakSuccess);
		event("OnSayBreakFailure", CloopenAgent.OnSayBreakFailure);
		event("OnCallOutSuccess", CloopenAgent.OnCallOutSuccess);
		event("OnCallOutFailure", CloopenAgent.OnCallOutFailure);
		event("OnHoldSuccess", CloopenAgent.OnHoldSuccess);
		event("OnHoldFailure", CloopenAgent.OnHoldFailure);
		event("OnUnHoldSuccess", CloopenAgent.OnUnHoldSuccess);
		event("OnUnHoldFailure", CloopenAgent.OnUnHoldFailure);
		event("OnConsultSuccess", CloopenAgent.OnConsultSuccess);
		event("OnConsultFailure", CloopenAgent.OnConsultFailure);
		event("OnConsultCancelSuccess", CloopenAgent.OnConsultCancelSuccess);
		event("OnConsultCancelFailure", CloopenAgent.OnConsultCancelFailure);
		event("OnTransferSuccess", CloopenAgent.OnTransferSuccess);
		event("OnTransferFailure", CloopenAgent.OnTransferFailure);
		event("OnTripartiteSuccess", CloopenAgent.OnTripartiteSuccess);
		event("OnTripartiteFailure", CloopenAgent.OnTripartiteFailure);
		event("OnOpAnswered", CloopenAgent.OnOpAnswered);
		event("OnCallReleased", CloopenAgent.OnCallReleased);
		event("OnQueryQueueSuccess", CloopenAgent.OnQueryQueueSuccess);
		event("OnQueryAgentByQueueSuccess", CloopenAgent.OnQueryAgentByQueueSuccess);
		event("OnStateChange", CloopenAgent.OnStateChange);
		event("OnReLoginFailure", CloopenAgent.OnReLoginFailure);
		event("OnCallEndSuccess", CloopenAgent.OnCallEndSuccess);
		event("OnCallEndFailure", CloopenAgent.OnCallEndFailure);
		event("OnHandleNotice", CloopenAgent.OnHandleNotice);
		event("OnReleaseCallSuccess", CloopenAgent.OnReleaseCallSuccess);
		event("OnReleaseCallFailure", CloopenAgent.OnReleaseCallFailure);
		event("OnShiftSuccess", CloopenAgent.OnShiftSuccess);
		event("OnShiftFailure", CloopenAgent.OnShiftFailure);
		event("OnEnterNotice", CloopenAgent.OnEnterNotice);
		event("OnQuitNotice", CloopenAgent.OnQuitNotice);
		event("OnIdleCountNotice", CloopenAgent.OnIdleCountNotice);
		event("OnStartVideoRecordOnServerSuccess", CloopenAgent.OnStartVideoRecordOnServerSuccess);
		event("OnStartVideoRecordOnServerFailure", CloopenAgent.OnStartVideoRecordOnServerFailure);
		event("OnStopVideoRecordOnServerSuccess", CloopenAgent.OnStopVideoRecordOnServerSuccess);
		event("OnStopVideoRecordOnServerFailure", CloopenAgent.OnStopVideoRecordOnServerFailure);
		event("OnOpenMonitorSuccess", CloopenAgent.OnOpenMonitorSuccess);
		event("OnOpenMonitorFailure", CloopenAgent.OnOpenMonitorFailure);
		event("OnCloseMonitorSuccess", CloopenAgent.OnCloseMonitorSuccess);
		event("OnCloseMonitorFailure", CloopenAgent.OnCloseMonitorFailure);
		
		event("OnSendFile", CloopenAgent.OnSendFile);
		event("OnSendText", CloopenAgent.OnSendText);
		_whenCallBack(funArray.initSuccess,_autoLogin);
	}
	
	function event(methodName,	callbackMehod){
		if (window.ActiveXObject || "ActiveXObject" in window) {
			if (window.ActiveXObject && CloopenAgentOcx.attachEvent) {
				CloopenAgentOcx.attachEvent(methodName, callbackMehod);
			} else {
				AttachIE11Event(CloopenAgentOcx, methodName, callbackMehod);
			}
		} else {
			CloopenAgentOcx[methodName] = callbackMehod;
		}
		//if(isIE){
		//CloopenAgentOcx.attachEvent(methodName, callbackMehod);
		//}else{
		//	showLog("注册事件");
		//	CloopenAgentOcx.addEventListener(methodName,callbackMehod,false);
		//}
	}
	function AttachIE11Event(obj, _strEventId, _functionCallback) {
		showLog("ie11注册事件");
		var nameFromToStringRegex = /^function\s?([^\s(]*)/;
		var paramsFromToStringRegex = /\(\)|\(.+\)/;
		var params = _functionCallback.toString().match(paramsFromToStringRegex)[0];
		var functionName = _functionCallback.name || _functionCallback.toString().match(nameFromToStringRegex)[1];
		var handler;
		try {
			handler = document.createElement("script");
			handler.setAttribute("for", obj.id);
		} catch (ex) {
			handler = document.createElement('<script for="' + obj.id + '">');
		}
		handler.event = _strEventId + params;
		handler.appendChild(document.createTextNode('CloopenAgent.'+functionName + params + ";"));
		document.body.appendChild(handler);
	}
	function setDefinedFun(callBackFun,countFun){
		showLog("setDefinedFun = " + callBackFun+",countFun="+countFun);
		_callFun=callBackFun;
		_countFun=countFun;
	}
	function getAgentGroups(){
		showLog("getAgentGroups");
		//返回当前座席签入的队列组
		var str = '{"groups":"'+_groups+'","groupNames":"'+_groupNames+'"}';
		var info = eval('(' + str + ')');
		return info;
	}
	function getWorkTel(){
		showLog("getWorkTel:"+_workTel);
		return _workTel;
	}
	function getAgentNum(){
		showLog("getAgentNum");
		return _agentNum;
	}
	function setAfterTime(afterTime){
		showLog("setAfterTime = " + afterTime);
		_afterTime=afterTime;
	}
	function getAfterTime(){
		//showLog("getAfterTime");
		return _afterTime;
	}
	function setLocalPath(localPath){
		//本地保存路径
		showLog("setLocalPath = " + localPath);
		_localPath=localPath;
	}
	function getLocalPath(){
		showLog("getLocalPath");
		return _localPath;
	}
	function setVideoShow(obj){
		showLog("setVideoShow = " + obj);
		_tipHwd = obj;
	}
	function getVideoShow(){
		showLog("getVideoShow");
		return _tipHwd;
	}
	function setTipShow(obj){
		showLog("setTipShow = " + obj);
		_tipHwd = obj;
	}
	function getTipShow(){
		showLog("getTipShow");
		return _tipHwd;
	}
	function getIsLoginSoftPhone(){
		//获取当前是否登陆软电话
		return _loginSoftPhone;
	}
	function setLayerPosition(position){
		//设置弹出层位置 left center right
		showLog("setLayerPosition = " + position);
		_layerPosition = position;
	}
	function getLayerPosition(){
		return _layerPosition ;
	}
	function getCameraInfo(){
		showLog("获取摄像头信息");
		var result=CloopenAgentOcx.GetCameraInfo();
		showLog("获取摄像头结果 = " + result);
		return result;
	}
	function selectCamera(cameraIndex, capabilityIndex){
		showLog("选择摄像头>>_cameraIndex =" + cameraIndex+"_capabilityIndex="+capabilityIndex);
		var result=CloopenAgentOcx.SelectCamera(cameraIndex, capabilityIndex,20,0,0);
		showLog("选择摄像头结果 = " + result);
	}
	/**************调用ocx方法***********************/
	//签入
	function login(){
		showLog("签入>>_agentNum = " + _agentNum+"_agentPwd = " + _agentPwd+"_appId="+_appId+"_workTel="+_workTel+"_loginStatus="+_loginStatus);
		var result = CloopenAgentOcx.Login(_appId,_agentNum, _agentPwd,_workTel,_loginStatus);
		showLog("签入结果 = " + result);
	}
	//签出
	function logout(){
		showLog("签出>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.Logout();
		showLog("签出结果 = " + result);
	}
	//应答
	function accept(){
		showLog("应答>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.Answer();
		showLog("应答结果 = " + result);
	}
	
	//结束通话转ivr
	function callEnd(){
		showLog("结束通话转ivr>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.CallEnd();
		showLog("结束通话结果 = " + result);
	}
	//挂机
	function releaseCall(){
		//软电话上班时 启用
		showLog("挂机>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.ReleaseCall();
		showLog("挂机结果 = " + result);
	}
	//示闲
	function sayFree(){
		showLog("示闲>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.SayFree();
		showLog("示闲结果 = " + result);
	}
	//示忙
	function sayBusy(){
		showLog("示忙>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.SayBusy();
		showLog("示忙结果 = " + result);
	}
	//小休
	function sayBreak(){
		showLog("小休>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.SayBreak();
		showLog("小休结果 = " + result);
	}
	//外呼
	function callOut(num){
		showLog("外呼>>_agentNum = " + _agentNum+"_num="+num);
		var result = CloopenAgentOcx.CallOut(0, num);
		showLog("外呼结果 = " + result);
	}
	//静音
	function mute(){
		showLog("静音>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.Hold();
		showLog("静音结果 = " + result);
	}
	//取消静音
	function unMute(){
		showLog("取消静音>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.UnHold();
		showLog("取消静音结果 = " + result);
	}
	//发起咨询
	function consult(agentId){
		showLog("座席发起咨询>>_agentNum = " + _agentNum+"_agentId="+agentId);
		var result = CloopenAgentOcx.Consult(1,agentId);
		showLog("座席发起咨询结果 = " + result);
	}
	//取消咨询
	function consultBack(){
		showLog("取消咨询>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.ConsultCancel();
		showLog("取消咨询结果 = " + result);
	}
	function shift(){
		showLog("呼叫转移>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.Shift();
		showLog("呼叫转移结果 = " + result);
	}
	//发起转接
	function transfer(queue,agentId,num){
		showLog("座席发起转接>>_agentNum = "+_agentNum+"_queue="+queue+"_agentId="+agentId+"_num="+num);
		if(queue!=""){
			if(agentId!=""){
				var result = CloopenAgentOcx.Transfer(1,agentId);
				showLog("座席发起转接座席结果 = " + result);
			}else {
				var result = CloopenAgentOcx.Transfer(2,queue);
				showLog("座席发起转接队列结果 = " + result);
			}
		}else if(num!=""){
			var result = CloopenAgentOcx.Transfer(0,num);
			showLog("座席发起转接号码结果 = " + result);
		}else{
			showLog("座席发起转接无参数");
		}
	}
	//三方通话
	function tripartite(){
		showLog("开始三方通话>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.Tripartite();
		showLog("座席发起三方通话结果 = " + result);
	}
	//查询队列
	function queryQueue(){
		showLog("查询队列>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.QueryQueue();
		showLog("查询队列结果 = " + result);
	}
	//根据队列获取座席列表
	function queryAgentByQueue(queue){
		showLog("查询队列座席信息>>_agentNum = " + _agentNum+"_queue="+queue);
		var result = CloopenAgentOcx.QueryAgentByQueue(queue);
		showLog("查询队列座席信息 = " + result);
	}
	//开始本地录像
	function startRecordVideoCall(fileName){
		showLog("开始录制本地视频");
		var result = CloopenAgentOcx.StartRecordVideoCall(fileName);
		showLog("开始录制本地视频结果 = " + result);
		return result;
	}
	
	function stopRecordVideoCall(){
		showLog("停止录制本地视频");
		var result = CloopenAgentOcx.StopRecordVideoCall();
		showLog("停止录制本地视频结果 = " + result);
		return result;
	}
	
	function getVideoSnapshot(fileName){
		showLog("视频抓图");
		var result = CloopenAgentOcx.GetVideoSnapshot(fileName,0);
		showLog("视频抓图结果 = " + result);
		return result;
	}
	/**
	 * remoteView 对方显示区域窗体句柄 整形
	 * localView  本地显示区域窗体句柄 整形
	 */
	function setVideoView(remoteView, localView){
		showLog("设置视频通话显示区域");
		var result=CloopenAgentOcx.SetVideoView(remoteView, localView);
		showLog("设置视频通话显示区域结果 = " + result);
		return result;
	}
	//开始服务端录像
	function startVideoRecordOnServer(){
		showLog("调用服务端录像开始接口>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.StartVideoRecordOnServer();
		showLog("调用服务端录像开始接口结果 = " + result);
		return result;
	}
	//停止服务端录像
	function stopVideoRecordOnServer(){
		showLog("调用服务端录像结束接口>>_agentNum = " + _agentNum);
		var result = CloopenAgentOcx.StopVideoRecordOnServer();
		showLog("调用服务端录像结束接口结果 = " + result);
		return result;
	}
	//监听
	function monitorCall(agentId){
		showLog("监听座席通话>>_agentNum = " + _agentNum+"_agentId="+agentId);
		var result = CloopenAgentOcx.Monitor(agentId);
		showLog("监听座席通话接口结果 = " + result);
	}
	//强插
	function insertCall(agentId,callId){
		showLog("强插座席通话>>_agentNum = " + _agentNum+"_agentId="+agentId);
		var result=CloopenAgentOcx.Insert(agentId);
		showLog("强插座席通话接口结果 = " + result);
	}
	//强拆
	function breakCall(agentId,callId){
		showLog("强拆座席通话>>_agentNum = " + _agentNum+"_agentId="+agentId);
		var result=CloopenAgentOcx.Break(agentId);
		showLog("强拆座席通话接口结果 = " + result);
	}
	//打开监控
	function openMonitor(){
		showLog("打开监控>>openMonitor");
		var result=CloopenAgentOcx.OpenMonitor();
		showLog("打开监控结果 = " + result);
	}
	//关闭监控
	function closeMonitor(){
		showLog("关闭监控>>closeMonitor");
		var result=CloopenAgentOcx.CloseMonitor();
		showLog("关闭监控结果 = " + result);
	}
	/**
	 * 发送文件
	 * fileName:文件在本地的绝对路径
	 * userData:自定义字符串数据
	 */
	function sendFile(fileName,userData){
		showLog("发送文件>>_fileName="+fileName+"_userData="+userData);
		var result=CloopenAgentOcx.SendFile(fileName,userData);
		showLog("发送文件结果 = " + result);
	}
	/**
	 * 发送文本
	 * text:    要发送的内容
	 * userData:自定义字符串数据
	 */
	function sendText(text,userData){
		showLog("发送文本>>_text="+text+"_userData="+userData);
		var result=CloopenAgentOcx.SendText(text,userData);
		showLog("发送文本结果 = " + result);
	}
	/***********响应事件开始*****************/
	//对方应答
	function OnOpAnswered(msg){
		showLog("OnOpAnswered,双方应答"+msg);
		var num="",type="",answerTime="";
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			num=obj.userNum;
			type=obj.type;
			answerTime=obj.answerTime;
		}
		_whenCallBack(funArray.opAnswered,num,type,answerTime);
	}
	function OnCallReleased(){
		showLog("OnCallReleased,通话结束");
		_whenCallBack(funArray.callReleased);
	}
	
	function OnNetWorkError(errMsg){
		showLog("OnNetWorkError,网络错误"+errMsg);
		_whenCallBack(funArray.netWorkError,errMsg);
	}
	function OnLoginSuccess(msg){
		showLog("OnLoginSuccess,签入成功,msg:"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			_groupNames=obj.groupName;
			_groups=obj.workGroup;
		}
		//登录成功后把 签入是示闲或示忙返回
		_whenCallBack(funArray.loginSuccess,_groups,_groupNames,_loginStatus);
	}
	function OnLoginFailure(errMsg){
		showLog("OnLoginFailure,签入失败 " + errMsg);
		_whenCallBack(funArray.loginFail,errMsg);
	}
	function OnReLoginFailure(errMsg){
		showLog("OnReLoginFailure,自动重连签入失败" + errMsg);
		_whenCallBack(funArray.reLoginFail,errMsg);
	}
	function OnLogoutSuccess(){
		showLog("OnLogoutSuccess,签出成功");
		_whenCallBack(funArray.logoutSuccess);
	}
	function OnLogoutFailure(errMsg){
		showLog("OnLogoutFailure,签出失败"+errMsg);
		_whenCallBack(funArray.logoutFail,errMsg);
	}
	//补充 媒体类型 0：音频，1：视频
	function OnAnswerRequest(type,ani,mediaType){
		showLog("OnAnswerRequest,有来电,type:"+type+",号码:"+ani+",媒体类型:"+mediaType);
		_whenCallBack(funArray.answerReq,type,ani,mediaType);
		if(typeof _callFun === "function") {
			var answerCallId=CloopenAgentOcx.CallId;
			_callFun(type,ani,answerCallId);
		}
	}
	function OnAnswerSuccess(){
		showLog("OnAnswerSuccess,应答成功");
		_whenCallBack(funArray.answerSuccess);
	}
	function OnAnswerFailure(errMsg){
		showLog("OnAnswerFailure,应答失败"+errMsg);
		_whenCallBack(funArray.answerFailure,errMsg);
	}
	function OnCallEndSuccess(){
		showLog("OnCallEndSuccess,座席结束通话成功");
		_whenCallBack(funArray.callEndSuccess);
	}
	function OnCallEndFailure(errMsg){
		showLog("OnCallEndFailure,座席结束通话失败"+errMsg);
		_whenCallBack(funArray.callEndFail,errMsg);
	}
	function OnSayFreeSuccess(){
		showLog("OnSayFreeSuccess,示闲成功");
		_whenCallBack(funArray.sayFreeSuccess);
	}
	function OnSayFreeFailure(errMsg){
		showLog("OnSayFreeFailure,示闲失败"+errMsg);
		_whenCallBack(funArray.sayFreeFail,errMsg);
	}
	function OnSayBusySuccess(){
		showLog("OnSayBusySuccess,示忙成功");
		_whenCallBack(funArray.sayBusySuccess);
	}
	function OnSayBusyFailure(errMsg){
		showLog("OnSayBusyFailure,示忙失败"+errMsg);
		_whenCallBack(funArray.sayBusyFail,errMsg);
	}
	function OnSayBreakSuccess(){
		showLog("OnSayBreakSuccess,小休成功");
		_whenCallBack(funArray.sayBreakSuccess);
	}
	function OnSayBreakFailure(errMsg){
		showLog("OnSayBreakFailure,小休失败"+errMsg);
		_whenCallBack(funArray.sayBreakFail,errMsg);
	}
	function OnCallOutSuccess(){
		showLog("OnCallOutSuccess,外呼成功");
		_whenCallBack(funArray.callOutSuccess);
	}
	function OnCallOutFailure(errMsg){
		showLog("OnCallOutFailure,外呼失败"+errMsg);
		_whenCallBack(funArray.callOutFail,errMsg);
	}

	function OnHoldSuccess(){
		showLog("OnHoldSuccess,静音成功");
		_whenCallBack(funArray.muteSuccess);
	}
	function OnHoldFailure(errMsg){
		showLog("OnHoldFailure,静音失败"+errMsg);
		_whenCallBack(funArray.muteFail,errMsg);
	}
	function OnUnHoldSuccess(){
		showLog("OnUnHoldSuccess,取消静音成功");
		_whenCallBack(funArray.unMuteSuccess);
	}
	function OnUnHoldFailure(errMsg){
		showLog("OnUnHoldFailure,取消静音失败"+errMsg);
		_whenCallBack(funArray.unMuteFail,errMsg);
	}
	function OnConsultSuccess(){
		_whenCallBack(funArray.consultSuccess);
	}
	function OnConsultFailure(errMsg){
		showLog("OnConsultFailure,咨询失败"+errMsg);
		_whenCallBack(funArray.consultFail,errMsg);
	}
	function OnConsultCancelSuccess(){
		showLog("OnConsultCancelSuccess,取消咨询成功");
		_whenCallBack(funArray.consultBackSuccess);
	}
	function OnConsultCancelFailure(errMsg){
		showLog("OnConsultCancelFailure,取消咨询失败"+errMsg);
		_whenCallBack(funArray.consultBackFail,errMsg);
	}
	function OnTransferSuccess(){
		showLog("OnTransferSuccess,转接成功");
		_whenCallBack(funArray.transferSuccess);
	}
	function OnTransferFailure(errMsg){
		showLog("OnTransferFailure,转接失败"+errMsg);
		_whenCallBack(funArray.transferFail,errMsg);
	}
	function OnTripartiteSuccess(){
		showLog("OnTripartiteSuccess,三方成功");
		_whenCallBack(funArray.tripartiteSuccess);
	}
	function OnTripartiteFailure(errMsg){
		showLog("OnTripartiteFailure,三方失败"+errMsg);
		_whenCallBack(funArray.tripartiteFail,errMsg);
	}
	function OnReleaseCallSuccess(){
		showLog("OnReleaseCallSuccess,挂机成功");
		_whenCallBack(funArray.releaseCallSuccess);
	}
	function OnReleaseCallFailure(){
		showLog("OnReleaseCallFailure,挂机失败");
		_whenCallBack(funArray.releaseCallFail);
	}
	function OnShiftSuccess(){
		showLog("OnShiftSuccess,呼叫转移成功");
		_whenCallBack(funArray.shiftSuccess);
	}
	function OnShiftFailure(){
		showLog("OnShiftFailure,呼叫转移失败");
		_whenCallBack(funArray.shiftFail);
	}
	function OnEnterNotice(msg){
		showLog("OnEnterNotice,进入队列通知"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			if(data!=null){
				var callId=data.callId;
				var queue=data.queueType;
				var count=data.lineCount;
				var time=data.entertime;
				_whenCallBack(funArray.enterNotice,callId,queue,count,time);
				if(typeof _countFun === "function") {
					_countFun(1,queue,count);
				}
			}
		}
	}
	function OnQuitNotice(msg){
		showLog("OnQuitNotice,退出队列通知"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			if(data!=null){
				var callId=data.callId;
				var queue=data.queueType;
				var count=data.lineCount;
				var time=data.quittime;
				var type=data.type;
				_whenCallBack(funArray.quitNotice,callId,queue,count,time,type);
				
				if(typeof _countFun === "function") {
					_countFun(1,queue,count);
				}
			}
		}
	}
	
	function OnQueryQueueSuccess(msg){
		showLog("OnQueryQueueSuccess,查询技能组信息结果"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			showLog("查询技能组信息结果数据"+data);
			if(data!=null){
				_whenCallBack(funArray.queryQueueSuccess,data);
			}
		}
	}
	function OnQueryAgentByQueueSuccess(msg){
		showLog("OnQueryAgentByQueueSuccess,获取技能组的座席结果"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			showLog("获取技能组的信息结果数据"+data);
			if(data!=null){
				_whenCallBack(funArray.queryAgentByQueueSuccess,data);
			}
		}
		
	}
	function OnStateChange(msg){
		showLog("OnStateChange,座席状态变化通知结果"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			showLog("座席状态变化通知数据"+data);
			if(data!=null){
				var agentId=data.agentId;
				var agentState=data.agentState;
				var callId=data.callId;
				var callNum=data.callNum;
				var idlecount=data.idlecount;
				var queueType=data.queueType;
				var msgtype=data.msgType;
				var jkAgentId=data.jkAgentId;
				if(msgtype==1){
					//班长监听
					_whenCallBack(funArray.agentStateChange,jkAgentId,agentState,queueType);
				}else {
					_whenCallBack(funArray.callInfoSuccess,agentId,agentState,callId,callNum);
					if(agentState==2){
						if(typeof _countFun === "function") {
							_countFun(0,queueType,idlecount);
						}
					}
				}
			}
		}
	}
	function OnHandleNotice(msg){
		//2呼叫转接、3准备就绪、4座席咨询、5呼叫转移、6咨询反回、7三方通话、8用户静音操作、9取消静音操作、10 座席主动外呼
		showLog("OnHandleNotice,操作结果,msg:"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			showLog("操作结果数据"+data);
			if(data!=null){
				var agentId=data.agentId;
				var type=data.type;
				var callId=data.callId;
				var result=data.result;
				var secondAgentId =data.secondAgentId;
				var time=data.time;
				showLog("secondAgentId:"+secondAgentId+",_agentNum:"+_agentNum);
				if(secondAgentId==_agentNum){
					_whenCallBack(funArray.behandleNotice,agentId,type,callId,result,time);
				}else{
					_whenCallBack(funArray.handleNotice,agentId,type,callId,result,time);
				}
			}
		}
	}
	function OnIdleCountNotice(msg){
		showLog("OnIdleCountNotice,座席空闲数通知"+msg);
		if(msg!=null){
			var obj = eval('(' + msg + ')');
			var data=obj.data;
			if(data!=null){
				var queue=data.queueType;
				var idlecount=data.idleCount;
				
				if(typeof _countFun === "function") {
					_countFun(0,queue,idlecount);
				}
			}
		}
	}
	function OnStartVideoRecordOnServerSuccess(){
		showLog("OnStartVideoRecordOnServerSuccess启动服务器端录像成功通知");
		_whenCallBack(funArray.startVideoRecordOnServerSuccess);
	}
	function OnStartVideoRecordOnServerFailure(errMsg){
		showLog("OnStartVideoRecordOnServerFailure启动服务器端录像失败通知:"+errMsg);
		_whenCallBack(funArray.startVideoRecordOnServerFail);
	}
	function OnStopVideoRecordOnServerSuccess(){
		showLog("OnStopVideoRecordOnServerSuccess停止服务器端录像成功通知");
		_whenCallBack(funArray.stopVideoRecordOnServerSuccess);
	}
	function OnStopVideoRecordOnServerFailure(errMsg){
		showLog("OnStopVideoRecordOnServerFailure停止服务器端录像失败通知:"+errMsg);
		_whenCallBack(funArray.stopVideoRecordOnServerFail);
	}
	function OnMonitorSuccess(){
		showLog("OnMonitorSuccess监听成功");
		_whenCallBack(funArray.monitorSuccess);
	}
	function OnMonitorFailure(errMsg){
		showLog("OnMonitorFailure监听失败,errMsg"+errMsg);
		_whenCallBack(funArray.monitorFail,errMsg);
	}
	function OnInsertSuccess(){
		showLog("OnInsertSuccess强插成功");
		_whenCallBack(funArray.insertSuccess);
	}
	function OnInsertFailure(errMsg){
		showLog("OnInsertFailure强插失败,errMsg"+errMsg);
		whenCallBack(funArray.insertFail,errMsg);
	}
	function OnBreakSuccess(){
		showLog("OnBreakSuccess强拆成功");
		_whenCallBack(funArray.breakSuccess);
	}
	function OnBreakFailure(errMsg){
		showLog("OnBreakFailure强拆失败,errMsg"+errMsg);
		whenCallBack(funArray.breakFail,errMsg);
	}
	function OnOpenMonitorSuccess(){
		showLog("OnOpenMonitorSuccess打开监控成功");
		_whenCallBack(funArray.openMonitorSuccess);
	}
	function OnOpenMonitorFailure(errMsg){
		showLog("OnOpenMonitorFailure打开监控失败,errMsg"+errMsg);
		whenCallBack(funArray.openMonitorFail,errMsg);
	}
	function OnCloseMonitorSuccess(){
		showLog("OnCloseMonitorSuccess关闭监控成功");
		_whenCallBack(funArray.closeMonitorSuccess);
	}
	function OnCloseMonitorFailure(errMsg){
		showLog("OnCloseMonitorFailure关闭监控失败,errMsg"+errMsg);
		whenCallBack(funArray.closeMonitorFail,errMsg);
	}
	function OnSendFile(msg){
		showLog("OnSendFile发送文件,msg"+msg);
		whenCallBack(funArray.sendFileMsg,msg);
	}
	function OnSendText(msg){
		showLog("OnSendText发送文本,msg"+msg);
		whenCallBack(funArray.sendTextMsg,msg);
	}
	/****************响应事件结束*************************/
	function getContextPath(){
		var pathName = document.location.pathname;
		var index = pathName.substr(1).indexOf("/");
		var result = pathName.substr(0,index+1);
		_contextPath=result;
	}
	
	function showLog(msg) { //输出日志
		if (DEBUG) {if(window.console) console.log(msg);}
	}
	
	function _whenCallBack(callback,data1,data2,data3,data4){//回调函数
		if(typeof callback === "function") callback(data1,data2,data3,data4);
	}
	var funArray={
		netWorkError:null,loginSuccess:null,loginFail:null,logoutSuccess:null,logoutFail:null,answerReq:null,answerSuccess:null,answerFailure:null,callEndSuccess:null,callEndFail:null,
		sayFreeSuccess:null,sayFreeFail:null,sayBusySuccess:null,sayBusyFail:null,callOutSuccess:null,callOutFail:null,muteSuccess:null,muteFail:null,unMuteSuccess:null,unMuteFail:null,
		consultSuccess:null,consultFail:null,consultBackSuccess:null,consultBackFail:null,transferSuccess:null,transferFail:null,tripartiteSuccess:null,tripartiteFail:null,opAnswered:null,
		callReleased:null,queryQueueSuccess:null,queryAgentByQueueSuccess:null,callInfoSuccess:null,reLoginFail:null,initSuccess:null,sayBreakSuccess:null,sayBreakFail:null,handleNotice:null,
		releaseCallSuccess:null,releaseCallFail:null,shift:null,shiftSuccess:null,shiftFail:null,quitNotice:null,enterNotice:null,behandleNotice:null,
		startVideoRecordOnServerSuccess:null,startVideoRecordOnServerFail:null,stopVideoRecordOnServerSuccess:null,stopVideoRecordOnServerFail:null,
		monitorCall:null,insertCall:null,breakCall:null,monitorSuccess:null,monitorFail:null,insertSuccess:null,insertFail:null,breakSuccess:null,breakFail:null,
		openMonitor:null,closeMonitor:null,openMonitorSuccess:null,openMonitorFail:null,closeMonitorSuccess:null,closeMonitorFail:null,agentStateChange:null,sendFile:null,sendText:null,sendFileMsg:null,sendTextMsg:null
	};
	
	var exports = {
		showLog: showLog,
		init: init,
		getWorkTel:getWorkTel,
		getAgentGroups:getAgentGroups,
		getVideoShow:getVideoShow,
		setVideoShow:setVideoShow,
		getTipShow:getTipShow,
		setTipShow:setTipShow,
		setDefinedFun:setDefinedFun,
		setLocalPath:setLocalPath,
		getLocalPath:getLocalPath,
		setAfterTime:setAfterTime,
		getAfterTime:getAfterTime,
		getAgentNum:getAgentNum,
		getIsLoginSoftPhone:getIsLoginSoftPhone,
		setLayerPosition:setLayerPosition,
		getLayerPosition:getLayerPosition,
		getCameraInfo:getCameraInfo,
		selectCamera:selectCamera,
		OnNetWorkError:OnNetWorkError,
		OnLoginSuccess:OnLoginSuccess,
		OnLoginFailure:OnLoginFailure,
		OnLogoutSuccess:OnLogoutSuccess,
		OnLogoutFailure:OnLogoutFailure,
		OnAnswerRequest:OnAnswerRequest,
		OnAnswerSuccess:OnAnswerSuccess,
		OnAnswerFailure:OnAnswerFailure,
		OnCallEndSuccess:OnCallEndSuccess,
		OnCallEndFailure:OnCallEndFailure,
		OnSayFreeSuccess:OnSayFreeSuccess,
		OnSayFreeFailure:OnSayFreeFailure,
		OnSayBusySuccess:OnSayBusySuccess,
		OnSayBusyFailure:OnSayBusyFailure,
		OnSayBreakSuccess:OnSayBreakSuccess,
		OnSayBreakFailure:OnSayBreakFailure,
		OnCallOutSuccess:OnCallOutSuccess,
		OnCallOutFailure:OnCallOutFailure,
		OnHoldSuccess:OnHoldSuccess,
		OnHoldFailure:OnHoldFailure,
		OnUnHoldSuccess:OnUnHoldSuccess,
		OnUnHoldFailure:OnUnHoldFailure,
		OnConsultSuccess:OnConsultSuccess,
		OnConsultFailure:OnConsultFailure,
		OnConsultCancelSuccess:OnConsultCancelSuccess,
		OnConsultCancelFailure:OnConsultCancelFailure,
		OnTransferSuccess:OnTransferSuccess,
		OnTransferFailure:OnTransferFailure,
		OnTripartiteSuccess:OnTripartiteSuccess,
		OnTripartiteFailure:OnTripartiteFailure,
		OnOpAnswered:OnOpAnswered,
		OnCallReleased:OnCallReleased,
		OnQueryQueueSuccess:OnQueryQueueSuccess,
		OnQueryAgentByQueueSuccess:OnQueryAgentByQueueSuccess,
		OnStateChange:OnStateChange,
		OnReLoginFailure:OnReLoginFailure,
		OnHandleNotice:OnHandleNotice,
		OnReleaseCallSuccess:OnReleaseCallSuccess,
		OnReleaseCallFailure:OnReleaseCallFailure,
		OnShiftSuccess:OnShiftSuccess,
		OnShiftFailure:OnShiftFailure,
		OnEnterNotice:OnEnterNotice,
		OnQuitNotice:OnQuitNotice,
		OnIdleCountNotice:OnIdleCountNotice,
		OnStartVideoRecordOnServerSuccess:OnStartVideoRecordOnServerSuccess,
		OnStartVideoRecordOnServerFailure:OnStartVideoRecordOnServerFailure,
		OnStopVideoRecordOnServerSuccess:OnStopVideoRecordOnServerSuccess,
		OnStopVideoRecordOnServerFailure:OnStopVideoRecordOnServerFailure,
		OnMonitorSuccess:OnMonitorSuccess,
		OnMonitorFailure:OnMonitorFailure,
		OnInsertSuccess:OnInsertSuccess,
		OnInsertFailure:OnInsertFailure,
		OnBreakSuccess:OnBreakSuccess,
		OnBreakFailure:OnBreakFailure,
		OnOpenMonitorSuccess:OnOpenMonitorSuccess,
		OnOpenMonitorFailure:OnOpenMonitorFailure,
		OnCloseMonitorSuccess:OnCloseMonitorSuccess,
		OnCloseMonitorFailure:OnCloseMonitorFailure,
		OnSendFile:OnSendFile,
		OnSendText:OnSendText,
		login:login,
		logout:logout,
		accept:accept,
		sayFree:sayFree,
		sayBusy:sayBusy,
		sayBreak:sayBreak,
		callOut:callOut,
		releaseCall:releaseCall,
		callEnd:callEnd,
		queryQueue:queryQueue,
		queryAgentByQueue:queryAgentByQueue,
		mute:mute,
		unMute:unMute,
		consult:consult,
		consultBack:consultBack,
		transfer:transfer,
		tripartite:tripartite,
		shift:shift,
		setVideoView:setVideoView,
		startRecordVideoCall:startRecordVideoCall,
		stopRecordVideoCall:stopRecordVideoCall,
		getVideoSnapshot:getVideoSnapshot,
		startVideoRecordOnServer:startVideoRecordOnServer,
		stopVideoRecordOnServer:stopVideoRecordOnServer,
		monitorCall:monitorCall,
		insertCall:insertCall,
		breakCall:breakCall,
		openMonitor:openMonitor,
		closeMonitor:closeMonitor,
		sendFile:sendFile,
		sendText:sendText,
		debug: function() {
			DEBUG = true;
		},
		NetWorkError:function(callback){funArray.netWorkError = callback;},
		LoginSuccess:function(callback){funArray.loginSuccess = callback;},
		LoginFail:function(callback){funArray.loginFail = callback;},
		LogoutSuccess:function(callback){funArray.logoutSuccess = callback;},
		LogoutFail:function(callback){funArray.logoutFail = callback;},
		AnswerReq:function(callback){funArray.answerReq = callback;},
		AnswerSuccess:function(callback){funArray.answerSuccess = callback;},
		AnswerFailure:function(callback){funArray.answerFailure = callback;},
		SayFreeSuccess:function(callback){funArray.sayFreeSuccess = callback;},
		SayFreeFail:function(callback){funArray.sayFreeFail = callback;},
		SayBusySuccess:function(callback){funArray.sayBusySuccess = callback;},
		SayBusyFail:function(callback){funArray.sayBusyFail = callback;},
		SayBreakSuccess:function(callback){funArray.sayBreakSuccess = callback;},
		SayBreakFail:function(callback){funArray.sayBreakFail = callback;},
		CallOutSuccess:function(callback){funArray.callOutSuccess = callback;},
		CallOutFail:function(callback){funArray.callOutFail = callback;},
		CallEndSuccess:function(callback){funArray.callEndSuccess = callback;},
		CallEndFail:function(callback){funArray.callEndFail = callback;},
		MuteSuccess:function(callback){funArray.muteSuccess = callback;},
		MuteFail:function(callback){funArray.muteFail = callback;},
		UnMuteSuccess:function(callback){funArray.unMuteSuccess = callback;},
		UnMuteFail:function(callback){funArray.unMuteFail = callback;},
		ConsultSuccess:function(callback){funArray.consultSuccess = callback;},
		ConsultFail:function(callback){funArray.consultFail = callback;},
		ConsultBackSuccess:function(callback){funArray.consultBackSuccess = callback;},
		ConsultBackFail:function(callback){funArray.consultBackFail = callback;},
		TransferSuccess:function(callback){funArray.transferSuccess = callback;},
		TransferFail:function(callback){funArray.transferFail = callback;},
		TripartiteSuccess:function(callback){funArray.tripartiteSuccess = callback;},
		TripartiteFail:function(callback){funArray.tripartiteFail = callback;},
		OpAnswered:function(callback){funArray.opAnswered = callback;},
		CallReleased:function(callback){funArray.callReleased = callback;},
		QueryQueueSuccess:function(callback){funArray.queryQueueSuccess = callback;},
		QueryAgentByQueueSuccess:function(callback){funArray.queryAgentByQueueSuccess = callback;},
		CallInfoSuccess:function(callback){funArray.callInfoSuccess = callback;},
		ReLoginFail:function(callback){funArray.reLoginFail = callback;},
		InitSuccess:function(callback){funArray.initSuccess = callback;},
		HandleNotice:function(callback){funArray.handleNotice = callback;},
		ReleaseCallSuccess:function(callback){funArray.releaseCallSuccess = callback;},
		ReleaseCallFail:function(callback){funArray.releaseCallFail = callback;},
		ShiftSuccess:function(callback){funArray.shiftSuccess = callback;},
		ShiftFail:function(callback){funArray.shiftFail = callback;},
		EnterNotice:function(callback){funArray.enterNotice = callback;},
		QuitNotice:function(callback){funArray.quitNotice = callback;},
		BehandleNotice:function(callback){funArray.behandleNotice = callback;},
		StartVideoRecordOnServerSuccess:function(callback){funArray.startVideoRecordOnServerSuccess = callback;},
		StartVideoRecordOnServerFail:function(callback){funArray.startVideoRecordOnServerFail = callback;},
		StopVideoRecordOnServerSuccess:function(callback){funArray.stopVideoRecordOnServerSuccess = callback;},
		StopVideoRecordOnServerFail:function(callback){funArray.stopVideoRecordOnServerFail = callback;},
		MonitorSuccess:function(callback){funArray.monitorSuccess = callback;},
		MonitorFail:function(callback){funArray.monitorFail = callback;},
		InsertSuccess:function(callback){funArray.insertSuccess = callback;},
		InsertFail:function(callback){funArray.insertFail = callback;},
		BreakSuccess:function(callback){funArray.breakSuccess = callback;},
		BreakFail:function(callback){funArray.breakFail = callback;},
		OpenMonitorSuccess:function(callback){funArray.openMonitorSuccess = callback;},
		OpenMonitorFail:function(callback){funArray.openMonitorFail = callback;},
		CloseMonitorSuccess:function(callback){funArray.closeMonitorSuccess = callback;},
		CloseMonitorFail:function(callback){funArray.closeMonitorFail = callback;},
		SendFileMsg:function(callback){funArray.sendFileMsg = callback;},
		SendTextMsg:function(callback){funArray.sendTextMsg = callback;},
		AgentStateChange:function(callback){funArray.agentStateChange = callback;}
	};
	return exports;
})();