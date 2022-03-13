/************************************************
 * Control Wrapping Utils
 * 각 사이트별 커스터마이징하여 사용 가능
 * version 2.0
 ************************************************/

// 의존 모듈 선언.
module.depends("module/common");

/**
 * Msg(메시지) 유틸
 * @constructor
 * @param {common.module} appKit
 */
function MsgKit(appKit){
	this._appKit = appKit;
};

/**
 * 메시지 ID에 해당되는 메시지를 반환한다.
 * @param {String} psMsgId  메시지 ID
 * @param {String | Array} paArgs 메시지 내용 중 @로 표시된 부분 넣어줄 데이터 배열
 * @return {String} 메시지 문자열
 */
MsgKit.prototype.getMsg = function(psMsgId, paArgs) {
    if(psMsgId == null || psMsgId == "") return "";
    if(!ValueUtil.startWith(ValueUtil.trim(psMsgId), "NLS")) return psMsgId.replace(/\\n/gi, "\n");
    
    var message = cpr.I18N.INSTANCE.message(psMsgId);
    if (message == null) return psMsgId.replace(/\\n/gi, "\n");
    
    //동적 메시지 치환
    if(!ValueUtil.isNull(paArgs)){
    	if(!(paArgs instanceof Array)){
    		paArgs = [paArgs];
    	}
    	
    	var index = 0;
    	var count = 0;
    	while ((index = message.indexOf("@", index)) != -1) {
	        if (paArgs[count] == null) paArgs[count] = "";
	        message = message.substr(0, index) + String(paArgs[count]) + message.substring(index + 1);
	        index = index + String(paArgs[count++]).length;
	    }
    	//정규 표현식 사용하여 동적 메시지 치환
//    	var regExp = message.match(/\{[0-9]+\}/ig);
//		regExp.forEach(function(/* String */ exp){
//			var idx = ValueUtil.fixNumber(exp.replace("{", "").replace("}", "").trim());
//			message = message.replace(exp, new String(paArgs[idx]).replace(/\r\n/ig, ""));
//		});
    }
    
    return message.replace(/\\n/ig, "\n");
};

/**
 * 확인 선택용 Confirm 메시지 박스를 띄운다.
 * <pre><code>
 * Msg.confirm("CRM-M001");
 * </code></pre>
 * @param {String} psMsgId 메시지 ID
 * @param {String | Array} paArgs (Optional)메시지 내용 중 @로 표시된 부분 넣어줄 데이터 배열
 * @return {Boolean} Confirm 창의 확인 결과
 */
MsgKit.prototype.confirm = function(psMsgId, paArgs) {
	return confirm(this.getMsg(psMsgId, paArgs));
};



/**
 * 메시지를 어플리케이션 화면 헤더 영역에 메시지를 보여준다.
 * <pre><code>
 * Msg.notify(app, "CMN-M001");
 * </code></pre>
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {String} psMsgId 메시지ID
 * @param {String | Array} paArgs? 메시지 내용 중 @로 표시된 부분 넣어줄 데이터 배열
 * @param {String} psMsgType? 출력타입 (생략가능) default : INFO
 *                 INFO | WARNING | DENGER
 * @param {Number} pnDelay? 메시지 표시 딜레이 시간
 * @return void
 */
MsgKit.prototype.notify = function(app, psMsgId, paArgs, psMsgType, pnDelay) {
	var messageInfo = {};
	messageInfo.TYPE = psMsgType;
	messageInfo.MSG = this.getMsg(psMsgId, paArgs);
	if(pnDelay != null){
		messageInfo.DELAY = pnDelay;
	}
	
	//헤더에 메시지 표현.
	var _app = this._appKit.getMainApp(app);
	_app = _app != null ? _app : app;
	
	var vaChildCtrls = _app.getContainer().getChildren();
	var vaSubChildCtrls = null;
	var appHeader = null;
	for (var i=0, len=vaChildCtrls.length; i<len; i++) {
        if (vaChildCtrls[i] instanceof udc.com.appHeader ) {
        	appHeader = vaChildCtrls[i];
        	break;
        }else if(vaChildCtrls[i].type == "container" && vaChildCtrls[i].style.getClasses().indexOf("header-box") != -1){
        	vaSubChildCtrls = vaChildCtrls[i].getChildren();
        	for (var j=0, jlen=vaSubChildCtrls.length; j<jlen; j++) {
        		if (vaSubChildCtrls[j] instanceof udc.com.appHeader ) {
		        	appHeader = vaSubChildCtrls[j];
		        	break;
		        }
        	}
        	if(appHeader != null) break;
        }
    }
    if(appHeader){
    	var embApp = appHeader.getEmbeddedAppInstance();
		var vcOptMsg = embApp.lookup("optAppMsg");
		var vcNotifier = embApp.lookup("notiInfo");
		var vsNotiMsg = this.getMsg(psMsgId, paArgs);
		if(vcNotifier.visible){
			vcNotifier.info(vsNotiMsg);
		}
		vcOptMsg.value = vsNotiMsg;
		vcOptMsg.style.animateFrom({
			"transform": "translateY(-30px) ",
			"opacity": "0"
		});
    }
};

/**
 * 메시지를 웹브라우저의 alert 메시지로 띄운다.
 * <pre><code>
 * Msg.alert("CMN-M001");
 * </code></pre>
 * @param {String} psMsgId 메시지ID
 * @param {String | Array} paArgs (Optional)메시지 내용 중 @로 표시된 부분 넣어줄 데이터 배열
 * @return void
 */
MsgKit.prototype.alert = function(psMsgId, paArgs) {
    alert(this.getMsg(psMsgId, paArgs));
};

/**
 * Dialog 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function DialogKit(appKit){
	this._appKit = appKit;
};

/**
 * 모달(Modal) 팝업을 호출한다.
 * <pre><code>
 * Dialog.open(app, "app/cmn/CMN001", 700, 500, function(dialog){...}, {key1:"value1", key2:"value2"});
 * </code></pre>
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} appid 팝업 화면 주소.
 * @param {Number} width 팝업 창의 가로 사이즈.
 * @param {Number} height 팝업 창의 세로 사이즈.
 * @param {Function} handler 팝업이 닫힐 때 콜백함수(callback function).
 * @param {Object} initValue (Optional) 초기 파라메터 key/value쌍으로 팝업창에 넘길 파라메터 JSON 데이터[ 예시)-{key1:"value1", key2:"value2"}]
 * @param {object} prop (Optional) 팝업 설정 속성
 * 		left			{number}  다이얼로그의 x좌표 default : 가운데 위치
 * 		top				{number}  다이얼로그의 y좌표 default : 가운데 위치
 * 		headerVisible	{boolean} 다이얼로그 헤더를 보이기 여부 default : true
 * 		headerMovable	{boolean} 다이얼로그 헤더를 통해 이동 가능 여부 default : true
 * 		headerClose		{boolean} 다이얼로그 헤더 close 버튼 보이기 여부 default : true
 * 		resizable		{boolean} 다이얼로그 Rect 부분에 크기 조정 가능 여부 default : true
 */
DialogKit.prototype.open = function(app, appid, width, height, handler, initValue, prop) {
	
	if (initValue == null) {
		initValue = {};
	}
	
	//윈도우 최소 창크기보다 작은 경우... 윈도우 사이즈에 맞게 사이즈 조정
	var windowWidth = (window.innerWidth | document.body.clientWidth)-10;
	var windowHeight = (window.innerHeight | document.body.clientHeight)-45;
	if(windowWidth < width) width = windowWidth;
	if(windowHeight < height) height = windowHeight;

	var dialogProp = {
		width : Number(width) + 10,
		height : Number(height) + 45,
		headerVisible : (prop && prop.headerVisible != undefined) ? prop.headerVisible : true,
		headerMovable : (prop && prop.headerMovable != undefined) ? prop.headerMovable : true,
		headerMax : (prop && prop.headerMax != undefined) ? prop.headerMax : false,
		headerClose : (prop && prop.headerClose != undefined) ? prop.headerClose : true,
		resizable : (prop && prop.resizable != undefined) ? prop.resizable : false
	};
	
	if(prop != null && prop.left) { dialogProp.left = prop.left; }
	if(prop != null && prop.top) { dialogProp.top = prop.top; }

	// App에서 Dialog
	app.getRootAppInstance().openDialog(appid, dialogProp, function(/* cpr.controls.Dialog */dialog) {
		dialog.app.isPopup = true;
		dialog.app.modal = true;
		
		initValue._dialogRef = dialog;
		
		if (dialog.app.title) { 
			dialog.headerTitle = dialog.app.title;
		}
		if (handler) {
			dialog.addEventListenerOnce("close", handler);
		}
		if (initValue) {
			dialog.initValue = initValue;
		}
	});
};


/**
 * 현재 앱이 팝업인지 여부를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @return {Boolean} true/false
 */
DialogKit.prototype.isPopup = function(app){
	return (!ValueUtil.isNull(app.getHost()) && app.app.isPopup === true) ? true : false;
};


/**
 * window open
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psActionUrl 팝업 aution URL
 * @param {String} psPopId 팝업 ID
 * @param {cpr.utils.ObjectMap} Parameter map
 * @param {Number} width
 * @param {Number} height
 * @param {Number} top
 * @param {Number} left
 * @param {Boolean} isModal
 * @return {Boolean} true/false 사용안함.
 */
DialogKit.prototype.windowOpen = function(app, psActionUrl, psPopId, pmParameter, width, height, top, left, isModal){

   	var vnWidth     = width == null ? window.screen.availWidth : width;
   	var vnHeight     = height == null ? window.screen.availHeight : height;
   	var vnTop       = top == null ? (window.screen.availHeight - height) / 2 : top;
   	var vnLeft      = left == null ? (window.screen.availWidth - width) / 2 : left;
   	var initValue   = {}
    if (vnTop < 0)  vnTop  = 0;
    if (vnLeft < 0) vnLeft = 0;
   	var vbIsModal = isModal == null ? false : isModal;
   	var vsProp = "menubar=0,resizable=yes,scrollbars=yes,status=0,top="+vnTop+",left="+vnLeft+",width="+vnWidth+",height="+vnHeight;
   	var openWindow = window.open("about:blank", psPopId, vsProp);
   
   	var voPostMethod = new cpr.protocols.HttpPostMethod(psActionUrl, psPopId);
   
   	if(pmParameter != null){
	   	pmParameter.forEach(function(key, value){
	   		voPostMethod.addParameter(key, ValueUtil.fixNull(value));
		});	
   	}
	
	voPostMethod.submit();
	voPostMethod.dispose();
	
   	window._app = app;
   	return openWindow;
};

/**
 * 특정 컨트롤/컨트롤 그룹을 앱화면의 상단에 플로팅으로 띄운다.
 * @param @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtrl 플로팅으로 띄울 컨트롤ID
 * @param {Number} x x축 포지션 위치
 * @param {Number} y y축 포지션 위치
 * @param {Number} width 컨트롤 넓이
 * @param {Number} height 컨트롤 높이
 */
DialogKit.prototype.floading = function(app, psCtrl, x, y, width, height){
	/**@type cpr.controls.UIControl */
	var ctrl = app.lookup(psCtrl);
	if(ctrl == null) return false;
	
	if(ctrl.visible === false){
		ctrl.visible = true;
	}
	
//	var floatingMap = cpr.utils.ObjectMap();
	
//	var zoom = document.body.style.zoom;
	
	var container = app.getContainer();
	var showConstraint = {
		"position" : "absolute",
		"width" : width+"px",
		"height" : height+"px"
	};
	if(this.isPopup(app)){
		if(((y+height) - container.getActualRect().top) > container.getActualRect().height )
			showConstraint.top = (y - (container.getActualRect().top + height)) +"px";
		else
			showConstraint.top = (y - container.getActualRect().top) +"px";
		
		showConstraint.left = (x - (container.getActualRect().left + width)) + "px";
	}else{
		showConstraint.top = (y - 90) + "px";
		if(x < width){
			showConstraint.left = "0px";
		}else{
			showConstraint.left = (x - width - 230) + "px";
		}
	}
	
	//floating하기 전에 해당 컨트롤의 부모객체 정보를 저장함
	var map = app.__floatingMap ? app.__floatingMap : new cpr.utils.ObjectMap();
	map.put(ctrl.id, ctrl.getParent());
	if(app.__floatingMap == null || app.__floatingMap == undefined){
		app.__floatingMap = map;
	}
	
	var layout = container.getLayout();
	if(layout instanceof cpr.controls.layouts.FormLayout
		|| layout instanceof cpr.controls.layouts.VerticalLayout){
		app.floatControl(ctrl, showConstraint);
	}else{
		container.addChild(ctrl, showConstraint);
	}
};

/**
 * 앱화면의 상단에 플로팅으로 띄워진 컨트롤/컨트롤그룹을 제거한다.
 * @param @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtrl 플로팅으로 띄워진 컨트롤ID
 */
DialogKit.prototype.removefloading = function(app, psCtrl){
	var ctrl = app.lookup(psCtrl);
	if(ctrl == null) return false;
	
	var container = app.getContainer();
	var layout = container.getLayout();
	if(layout instanceof cpr.controls.layouts.FormLayout
		|| layout instanceof cpr.controls.layouts.VerticalLayout){
		app.removeFloatingControl(ctrl);
	}else{
		container.removeChild(ctrl);
	}
	
	if(app.__floatingMap){
		var parent = app.__floatingMap.get(ctrl.id);
		if(ctrl.visible != false){
			ctrl.visible = false;
		}
		parent.addChild(ctrl);
		app.__floatingMap.remove(ctrl.id)
	}
};

/**
 * Group컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function GroupKit(appKit){
	this._appKit = appKit;
};

/**
 * 조회조건 및 작업영역 그룹 컨트롤 초기화
 * 1. 메인의 dmGlobalConfig-useSearchBoxClear 설정에 따라 조회조건 변경시 작업영역 데이터 Clear (선택)
 *   - 조회영역내 조회조건 컨트롤의 selection-change, value-change시 작업영역(paDisableCtl) disable 및 그리드, 프리폼 초기화
 * 2. 조회조건 변경시 작업영역 데이터 변경시 알림(확인) 메시지 출력 
 *  - appHeader에서 공통 적용됨
 *  - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Array} poSearchBox  		 조회조건 영역 그룹컨트롤 객체 배열
 * @param {Array} paDisableCtl	 조회조건 변경시 비활성화 처리되는 영역의 그룹 컨트롤 객체 배열
 * @param {#uicontrol | Array} paExceptCtl? 적용 제외 컨트롤 ID
 * @return void
 */
GroupKit.prototype.initSearchBox = function(app, poSearchBox, paDisableCtl, paExceptCtl){
	//비활성화 영역 컨트롤
	paDisableCtl = paDisableCtl != null ? paDisableCtl : new Array();
	if(!(paDisableCtl instanceof Array)){
		paDisableCtl = [paDisableCtl];
	}
	//적용 제외 컨트롤 목록
	paExceptCtl = paExceptCtl != null ? paExceptCtl : new Array();
	if(!(paExceptCtl instanceof Array)){
		paExceptCtl = [paExceptCtl];
	}
	
	doShadowView(app, this._appKit, poSearchBox[0], paDisableCtl, false);
	
	var _app = app;
	var _appKit = this._appKit;
	var vsSchBtnId = "btnSearch";
	
	function doAddSearchBoxEvent(ctrl){
		//조회버튼인 경우
		if ( ctrl.type == "button" && (ctrl.id && ctrl.id.match("btnSearch") || ctrl.style.getClasses().join(";").indexOf("btn-search") != -1)){
			paExceptCtl.push(ctrl.id);
			vsSchBtnId = ctrl.id;
			ctrl.addEventListener("click", function(/* cpr.events.CEvent */ e){
				if(e.defaultPrevented === false){
					doShadowView(_app, _appKit, poSearchBox[0], paDisableCtl, true);
				}
			});
		}else{
			if(ctrl.type == "button" || ctrl.type == "output" || ctrl.type == "img" || ctrl.visible === false || ctrl.readOnly === true) return;

			/**
			 * 변경사항이 있는 경우
			 * 계속진행을 하시겠습니까? 에서 취소 선택시 업무단 value-change 이벤트가 호출되지 않게 하기 위해
			 * before 이벤드를 추가함.
			 */			
			var bfEventType = (ctrl.type == "combobox" || ctrl.type == "radiobutton") ? "before-selection-change" : "before-value-change";
			ctrl.addEventListener(bfEventType, function(e){
				if(_appKit.isAppModified(_app, "CRM")){
					return false;
				}
				
				//화면내의 모든 데이터 Clear
				var dataSets = _appKit.getAllAppModifiedDataSet(_app);
				var titles = _appKit.Group.getAllChildrenByType(_app, "udc.com.comTitle");
				if(dataSets != null && dataSets.length > 0){
					dataSets.forEach(function(ds){
						ds.clear();
						//그리드 건수 표시 초기화
						if(ds._gridId != undefined && ds._gridId != ""){
							for(var z=0, zlen=titles.length; z<zlen; z++){
								if(titles[z] == null) continue;
								if(titles[z].getAppProperty("ctrl") == null) continue;
								if(titles[z].getAppProperty("ctrl").id == ds.__gridId){
									titles[z].setAppProperty("rowCount", ds.getRowCount());
									break;
								}
							}
						}
					});
				}
				
				return true;
			});
			
			//조회조건 변경시 작업 영역 초기화
			var eventType = (ctrl.type == "combobox" || ctrl.type == "radiobutton") ? "selection-change" : "value-change";
			ctrl.addEventListener(eventType, function(e){
				//헤더 내의 버튼 비활성화
				var header = _appKit.Group.getAllChildrenByType(_app, "udc.com.appHeader");
				if(header != null && header.length > 0){
					var vcCtrl = header[0].getEmbeddedAppInstance().lookup("grpButtons");
					if(vcCtrl) vcCtrl.enabled = false;
				}
				
				//doShadowView(_app, false);
				doShadowView(_app, _appKit, poSearchBox[0], paDisableCtl, false);
			});
		}
	}
	
	function doShadowView(pApp, appKit, poSearchBox, disableCtl, enable){
		if(disableCtl && disableCtl.length > 0){
			appKit.Control.setEnable(pApp, enable, disableCtl);
		}else{
			if(enable === false){
				if(_app.lookup("grpSchShell") == null){
					var disableCtl = new cpr.controls.Container("grpSchShell");
					disableCtl.style.css({"background-color":"#ededed", "opacity":"0.2"});
					disableCtl.setLayout(new cpr.controls.layouts.XYLayout());
					var heightPosix = poSearchBox.getActualRect()["height"];
					pApp.getContainer().addChild(disableCtl, {
								"top": (Number(heightPosix)+35)+"px",
								"right": "5px",
								"bottom": "5px",
								"left": "5px"
							});
				}
			}else{
				pApp.getContainer().removeChild(pApp.lookup("grpSchShell"), true);
			}
		}
	}
	
	for(var z=0, zlen=poSearchBox.length; z<zlen; z++){
		/** @type cpr.controls.Container */
		var searchboxCtrl = poSearchBox[z];
		var childCtrls = _appKit._getChildren(searchboxCtrl);
		for (var i=0, len=childCtrls.length; i<len; i++) {
			//udc컨트롤일 경우.
			if(childCtrls[i] instanceof cpr.controls.UDCBase){
				var embApp = childCtrls[i].getEmbeddedAppInstance();
				embApp.getContainer().getChildren().some(function(ctrl){
					if(ctrl instanceof cpr.controls.Container){
						ctrl.getChildren().some(function(subCtrl){
							doAddSearchBoxEvent(subCtrl);
						});
					}else{
						doAddSearchBoxEvent(ctrl);
					}
				});
			}else{
				//이벤트 추가
				doAddSearchBoxEvent(childCtrls[i]);
			}
		}
	}
};

/**
 * 해당 그룹 컴포넌트 내의 DataColumn에 바인딩된 컨트롤 객체를 반환한다.
 * 이는 프리폼 내의 DataColumn의 값을 갖는(바인딩) 컨트롤을 찾기 위해 사용된다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#Container} psGrpId 그룹ID
 * @param {String} psDataColumnNm datacolumn 명
 * @return {Object} 컨트롤 객체
 */
GroupKit.prototype.getDataBindedControl = function(app, psGrpId, psDataColumnNm){
	/** @type cpr.controls.Container */
	var _grpKit = this._appKit.Group;
	var vcFrf = app.lookup(psGrpId);
	var vaChild = vcFrf.getChildren();
	var vcBindCtrl = null;
	vaChild.some(function(ctrl, idx){
		if(vcBindCtrl) return true;
		
		if(ctrl.type == "container") vcBindCtrl = _grpKit.getDataBindedControl(app, ctrl.id, psDataColumnNm);
		if(ctrl.type == "output") return false;
		var bind = ctrl.getBindInfo("value");
		if(bind && bind.type == "datacolumn" && psDataColumnNm === bind.columnName){
			if(ctrl instanceof cpr.controls.UDCBase){
				vcBindCtrl = AppUtil.getUDCBindValueControl(ctrl);
			}else{
				vcBindCtrl = ctrl;
			}
			
			return true;
		}
	});
	
	return vcBindCtrl;
};

/**
 * 그룹 또는 컨테이너 내의 특정 타입에 해당하는 자식 컨트롤을 취득한다.
 * (사용처) 해당 화면내의 특정 유형의 컨트롤 목록을 얻고자 하는 경우에 사용
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {String} psCtlType		 컨트롤 타입(ex: grid)
 * @param {cpr.controls.Container} poContainer 		자식 컨트롤을 취득하고자 하는 부모 컨테이너 객체  	
 * @param {Boolean} pbRecursive		(Optional) 자식 컨테이너를 Recusive하게 찾을건지 여부
 * @return {Array} 자식 컨트롤 객체 배열
 */
GroupKit.prototype.getAllChildrenByType = function(app, psCtlType, poContainer, pbRecursive) {
	var vaTypesChild = new Array();
	
	var container = app.getContainer();
	function getChildRecursive(psCtlType, poContainer){
	    var vaChildCtrls = poContainer ? (pbRecursive === true ? poContainer.getAllRecursiveChildren() : poContainer.getChildren()) : (pbRecursive === true ? container.getAllRecursiveChildren() : container.getChildren());
	    for (var i=0, len=vaChildCtrls.length; i<len; i++) {
	        if (vaChildCtrls[i].type == psCtlType) {
	        	vaTypesChild.push(vaChildCtrls[i]);
	        }else if (vaChildCtrls[i] instanceof cpr.controls.Container ) {
	        	getChildRecursive(psCtlType, vaChildCtrls[i]);
	        }else if(vaChildCtrls[i] instanceof cpr.controls.UDCBase){
	        	var voUdcApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voUdcApp) getChildRecursive(psCtlType, voUdcApp.getContainer());
	        }else if(vaChildCtrls[i] instanceof cpr.controls.EmbeddedApp){
	        	var voEmbApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voEmbApp) getChildRecursive(psCtlType, voEmbApp.getContainer());
	        }
	    }
	    vaChildCtrls = null;
	}
	
	getChildRecursive(psCtlType, poContainer);
	
	return vaTypesChild;
};

/**
 * 그룹 또는 컨테이너 내의 특정 ID를 갖는 자식 컨트롤을 취득한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {Array} paCtrlIds		 컨트롤 ID 배열
 * @param {cpr.controls.Container} poContainer 	(Optional) 자식 컨트롤을 취득하고자 하는 부모 컨테이너 객체  	
 * @return {Array} 자식 컨트롤 객체 배열
 */
GroupKit.prototype.getControlByID = function(app, paCtrlIds, poContainer) {
	if(!(paCtrlIds instanceof Array)){
		paCtrlIds = [paCtrlIds];
	}
	var vaChildCtrls = new Array();
	var container = poContainer ? poContainer : this._appKit.getMainApp(app).getContainer();
	function getChildRecursive(paCtrlIds, poContainer){
	    var childCtrls = poContainer.getAllRecursiveChildren();
	    for (var i=0, len=childCtrls.length; i<len; i++) {
	        if (paCtrlIds.indexOf(childCtrls[i].id) != -1) {
	        	vaChildCtrls.push(childCtrls[i]);
	        }else if(childCtrls[i] instanceof cpr.controls.UDCBase){
	        	var voUdcApp = childCtrls[i].getEmbeddedAppInstance();
	        	if(voUdcApp) getChildRecursive(paCtrlIds, voUdcApp.getContainer());
	        }else if(childCtrls[i] instanceof cpr.controls.EmbeddedApp){
	        	var voEmbApp = childCtrls[i].getEmbeddedAppInstance();
	        	if(voEmbApp) getChildRecursive(paCtrlIds, voEmbApp.getContainer());
	        }
	    }
	}
	
	getChildRecursive(paCtrlIds, container);
	
	return vaChildCtrls;
};

/**
 * 그룹 컨트롤에 바인딩된 데이터셋을 반환한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {cpr.controls.Container} poContainer 		자식 컨트롤을 취득하고자 하는 부모 컨테이너 객체 
 * @return {cpr.data.DataSet} 바인딩된 데이터셋 객체
 */
GroupKit.prototype.getBindDataSet = function(app, poContainer){
	/**@type cpr.data.DataSet */
	var dataset = null;
	/** @type cpr.bind.BindContext */
	var bindContext = this.getBindContext(app, poContainer);
	if(bindContext instanceof cpr.bind.GridSelectionContext){
		dataset = bindContext.grid.dataSet;
	}else if(bindContext instanceof cpr.bind.DataRowContext){
		dataset = bindContext.dataSet;
	}
	
	return dataset;
};

/**
 * 그룹 컨트롤의 바인딩 문맥(Context) 객체를 반환한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {cpr.controls.Container} poContainer 		자식 컨트롤을 취득하고자 하는 부모 컨테이너 객체 
 * @return {cpr.bind.BindContext} 바인딩 Context 객체
 */
GroupKit.prototype.getBindContext = function(app, poContainer){
	/** @type cpr.bind.BindContext */
	var bindContext = poContainer.getBindContext();
	if(bindContext == null || bindContext == undefined){
		var childCtrls = this.getAllChildrenByType(app, "container", poContainer);
		childCtrls.forEach(function(/* cpr.controls.UIControl */ ctrl){
			if(ctrl.getBindContext()){
				bindContext = ctrl.getBindContext();
				return true;
			}
		});
	}
	
	return bindContext;
};

/**
 * FreeForm컨트롤 유틸
 * - 일반적으로 그리드가 바인딩되었거나 데이터셋을 사용하는 폼레이아웃 컨트롤에 적용.
 * - 그리드 + 상세(폼레이아웃) 화면에서 주로 사용 
 * @constructor
 * @param {common.AppKit} appKit
 */
function FreeFormKit(appKit){
	this._appKit = appKit;
};

/**
 * 그룹-프리폼 컨트롤들에 대해 초기화 로직을 수행한다.
 *  초기화 지정시 그룹의 class는 form-box 지정 필수.
 *  - appHeader에서 공통 적용됨
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container | Array} paFreeFormId 프리폼 ID 또는 ID배열
 */
FreeFormKit.prototype.init = function(app, paFreeFormId) {
	if(!(paFreeFormId instanceof Array)){
		paFreeFormId = [paFreeFormId];
	}
	
	var form = null, bindContext = null, dataset = null;
	var onlyDatasetList = new Array();
	var onlyDatasetMap = new cpr.utils.ObjectMap();
	for(var i=0, len=paFreeFormId.length; i<len; i++){
		/**@type cpr.controls.Container */
		form = app.lookup(paFreeFormId[i]);
		if(form == null) continue;
		
		bindContext = this._appKit.Group.getBindContext(app, form);
		dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
		
		//프리폼 컬럼 enable 설정
		if(form.getBindInfo("enabled") == null){
			form.bind("enabled").toExpression("(#"+dataset.id+".getRowCount() < 1 || getStateString() == 'D') ? false : true");
		}
		
		//프리폼 필드라벨 지정
		form.fieldLabel = this.getTitle(app, form.id);
		
		if(dataset){
			
			var info = ValueUtil.trim(ValueUtil.fixNull(dataset.info));
			info = info.indexOf("|") != -1 ? ValueUtil.split(info, "|")[0] : info;
			var pkColumnNames = [];
			if(info.indexOf("@") != -1){
				pkColumnNames = ValueUtil.split(ValueUtil.split(info, "@")[1], ",");
			}else{
				pkColumnNames = ValueUtil.split(info, ",");
			}
			
			if(bindContext.grid == null && onlyDatasetMap.get(dataset.id) == null){
				onlyDatasetMap.put(dataset.id, dataset);
				
				//20210520 로직 위치 이동
				if(bindContext.grid == null){
					if(info.indexOf("@") != -1){
						var dsInfos = ValueUtil.split(info, "@");
						if(ValueUtil.isNull(dataset.__tableid)){
							dataset.__tableid = dsInfos[0];
						}
						if(ValueUtil.isNull(dataset.__keyvalue)){
							dataset.__keyvalue = dsInfos[1];
						}
					}else{
						if(ValueUtil.isNull(dataset.__keyvalue)){
							dataset.__keyvalue = info;
						}
					}
				}
			}
			
			//PK 컬럼 자동 활성/비활성 처리
			var childCtrls = form.getAllRecursiveChildren();
			pkColumnNames.forEach(function(value){
				childCtrls.forEach(function(ctrl){
					if(ctrl.type == "output" || ctrl.type == "img" || ctrl.type == "button") return false;
					var bind = ctrl.getBindInfo("value");
					if(bind && bind.type == "datacolumn" && value == bind.columnName){
						if(ctrl.userAttr("editablePKColumn") !== "Y"){
							ctrl.bind("enabled").toExpression("getStateString() == 'I' ? true : false");
						}
						ctrl.userAttr("require", "Y");
					}
				});
			});
		}
	}
	
	onlyDatasetMap.keys().forEach(function(key){
		var dataset = onlyDatasetMap.get(key);
		//프리폼만 단독으로 있는 경우에는 AUTO-SAVE를 위해 tableId, keyColumns 셋팅
		//20210520 로직 위치 이동
//		var info = ValueUtil.trim(ValueUtil.fixNull(dataset.info));
//		info = info.indexOf("|") != -1 ? ValueUtil.split(info, "|")[0] : info;
//		if(bindContext.grid == null){
//			if(info.indexOf("@") != -1){
//				var dsInfos = ValueUtil.split(info, "@");
//				if(ValueUtil.isNull(dataset.__tableid)){
//					dataset.__tableid = dsInfos[0];
//				}
//				if(ValueUtil.isNull(dataset.__keyvalue)){
//					dataset.__keyvalue = dsInfos[1];
//				}
//			}else{
//				if(ValueUtil.isNull(dataset.__keyvalue)){
//					dataset.__keyvalue = info;
//				}
//			}
//		}
		
		//프리폼만 단독으로 있는 경우에 데이터가 없는 경우에 기본 데이터 1행 추가를 위함
		dataset.addEventListener("load", function(/* cpr.events.CDataEvent */e){
			var ds = e.control;
			if(ds.getRowCount() < 1){
				ds.addRow();
				ds.setRowState(0, cpr.data.tabledata.RowState.UNCHANGED);
			}
		});
	});
};


/**
 * 프리폼에 신규 행(Row)을 추가한다.
 *  - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#Container} psFreeFormId 프리폼 ID
 * @param {String} pnFocusColumnName? 행 추가 후에 포커싱할 컬럼의 컬럼명
 * @param {Number} pnRowIndex? 추가하고자 하는 행인덱스(defalut : 현재 선택된 로우 이후)
 * @param {Object} poRowData? 추가할 row data. (key: header명, value: value 를 갖는 json data)
 * @return {cpr.data.Row} 추가한 Row 객체
 */
FreeFormKit.prototype.insertRow = function(app, psFreeFormId, pnFocusColumnName, pnRowIndex, poRowData) {
	/**@type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/** @type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	var rowIndex = pnRowIndex == null ? (bindContext.grid ? this._appKit.Grid.getIndex(app, bindContext.grid.id) : bindContext.rowIndex) : pnRowIndex;
	
	// InsertRow
	var insertedRow = null;
	if(bindContext.grid){
		if(poRowData != null){
			insertedRow = dataset.insertRowData(rowIndex, true, poRowData);
		}else{
			insertedRow = dataset.insertRow(rowIndex, true);
		}
		
		bindContext.grid.clearSelection();
		bindContext.grid.selectRows(insertedRow.getIndex(), true);
	}else{
		if(dataset.getRowCount() < 1){
			if(poRowData != null){
				insertedRow = dataset.addRowData(poRowData);
			}else{
				insertedRow = dataset.addRow();
			}
		}else{
			if(poRowData != null){
				for(var column in poRowData){
					dataset.setValue(rowIndex, column, poRowData[column]);
				}
			}
			dataset.setRowState(rowIndex, cpr.data.tabledata.RowState.INSERTED);
			insertedRow = dataset.getRow(rowIndex);
		}
		
		form.redraw();
	}
	
	// Focus
	if(pnFocusColumnName){
		var ctrl = this._appKit.Group.getDataBindedControl(app, form.id, pnFocusColumnName);
		if(ctrl) app.focus(ctrl);
	}
	
	return insertedRow;
};

/**
 * 프리폼에 행(Row)을 삭제한다.
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 프리폼 ID
 * @param {Number | Number[]} pnRowIndex? 삭제하고자 하는 행 인덱스
 *                 default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선)
 * @return {Number[]} 삭제된 행 (배열)
 */
FreeFormKit.prototype.deleteRow = function(app, psFreeFormId, pnRowIndex) {
	var _this = this;
	/** @type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	/** @type cpr.bind.BindContext */
	var bindContext = this._appKit.Group.getBindContext(app, form);
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	
	var rowIndexs = null;
	if(pnRowIndex != null){
		rowIndexs = pnRowIndex;
	}else{
		rowIndexs = bindContext.grid ? this._appKit.Grid.getCheckOrSelectedRowIndex(app, bindContext.grid.id) :  bindContext.rowIndex;
	}
	if(!(rowIndexs instanceof Array)){
		rowIndexs = [rowIndexs];
	}
	
	if(rowIndexs.length < 1){
		//삭제할 데이터가 없습니다.
		this._appKit.Msg.alert("NLS-INF-M005");
	}else{
		if(bindContext.grid){
			this._appKit.Grid.deleteRow(app, bindContext.grid.id, rowIndexs);
		}else{
			if(dataset.getRowState(rowIndexs[0]) == cpr.data.tabledata.RowState.INSERTED){
				dataset.revertRow(rowIndexs[0]);
			}else{
				dataset.setRowState(rowIndexs[0], cpr.data.tabledata.RowState.DELETED);
			}
		}
	}
	form.redraw();
	
	return rowIndexs;
};

/**
 * 프리폼에 바인딩된 값을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 프리폼 ID
 * @param {String} psColumnName 컬럼명
 * @return {any} 프리폼의 컬럼값
 */
FreeFormKit.prototype.getValue = function(app, psFreeFormId, psColumnName){
	/** @type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/** @type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	var rowIndex = bindContext.grid ? this._appKit.Grid.getIndex(app, bindContext.grid.id) : bindContext.rowIndex;
	
	return dataset.getValue(rowIndex, psColumnName);
};

/**
 * 프리폼에 바인딩된 값을 변경한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 프리폼 ID
 * @param {String} psColumnName 컬럼명
 * @param {any} psValue 변경하고자 하는 값
 * @return void
 */
FreeFormKit.prototype.setValue = function(app, psFreeFormId, psColumnName, psValue){
	/** @type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/** @type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	var rowIndex = bindContext.grid ? this._appKit.Grid.getIndex(app, bindContext.grid.id) : bindContext.rowIndex;
	
	dataset.setValue(rowIndex, psColumnName, psValue);
	form.redraw();
};

/**
 * 프리폼의 변경사항을 되돌린다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId  해당 그룹 아이디
 * @param {Number} pnRowIndex? 되돌릴 행의 index
 * @return void
 */
FreeFormKit.prototype.revertRow = function(app, psFreeFormId, pnRowIndex){
	/**@type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/**@type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;

	var rowIndexs = pnRowIndex == null ? (bindContext.grid ? this._appKit.Grid.getCheckOrSelectedRowIndex(app, bindContext.grid.id) : bindContext.rowIndex) : pnRowIndex;
	if(!(rowIndexs instanceof Array)){
		rowIndexs = [rowIndexs];
	}
	if(bindContext.grid){
		this._appKit.Grid.restoreRow(app, bindContext.grid.id, rowIndexs);
	}else{
		dataset.revertRow(rowIndexs[0]);
		//데이터 Revert
//		var rowData = dataset.getRow(rowIndexs[0]).getRowData();
//		var rowStatus = dataset.getRowState(rowIndexs[0]);
//		for(var column in rowData){
//			dataset.setValue(rowIndexs[0], column, dataset.getOriginalValue(rowIndexs[0], column));
//		}
		//2019.11.21 추가
//		if(rowStatus == cpr.data.tabledata.RowState.INSERTED){
//			dataset.setRowState(rowIndexs[0], rowStatus);
//		}
	}
	
	if(bindContext.grid) bindContext.grid.redraw();
	form.redraw();
};

/**
 * 프리폼의 변경사항을 되돌린다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId  해당 그룹 아이디
 * @return void
 */
FreeFormKit.prototype.revertAllData = function(app, psFreeFormId){
	/**@type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/**@type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	//데이터 Revert
	dataset.revert();
		
	if(bindContext.grid) bindContext.grid.redraw();
	form.redraw();
};

/**
 * 프리폼의 선택된 행(Row)를 작업 취소한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 해당 그룹 아이디
 * @param {Number | Number[]} pnRowIndex? 취소하고자 하는 Row index
 *                 default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선)
 * @return {Number[]} 취소된 행 (배열)                
 */
FreeFormKit.prototype.restoreRow = function(app, psFreeFormId, pnRowIndex) {
	return this.revertRow(app, psFreeFormId, pnRowIndex);
};

/**
 * 현재 바인딩된 프리폼 데이터 상태를 변경한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 프리폼 ID
 * @param {cpr.data.tabledata.RowState} state 변경할 상태값. <br>
		<state 종류><br>
		cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.<br>
		cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.<br>
		cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.<br>
		cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.<br>
 */
FreeFormKit.prototype.setRowState = function(app, psFreeFormId, state) {
	/**@type cpr.controls.Container */
	var form = app.lookup(psFreeFormId);
	var bindContext = this._appKit.Group.getBindContext(app, form);
	/** @type cpr.data.DataSet */
	var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
	var rowIndex = bindContext.grid ? this._appKit.Grid.getIndex(app, bindContext.grid.id) : bindContext.rowIndex;
	
	dataset.setRowState(rowIndex, state);
};

/**
 * 프리폼의 타이틀명을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#container} psFreeFormId 프리폼 ID
 * @return {String} 타이틀 문자열 
 */
FreeFormKit.prototype.getTitle = function(app, psFreeFormId) {
	var titleCtlrs = this._appKit.Group.getAllChildrenByType(app, "udc.com.comFormTitle");
	if(titleCtlrs != null){
		for(var i=0, len=titleCtlrs.length; i<len; i++){
			if(titleCtlrs[i].ctrl && titleCtlrs[i].ctrl.id == psFreeFormId){
				return titleCtlrs[i].title;
			}
		}
	}
	return "";
};

/**
 * 리스트 형태 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function SelectKit(appKit){
	this._appKit = appKit;
};



/**
 * 입력한 index의 위치에 새로운 item을 추가한다.
 * <pre><code>
 * SelectCtl.addItem(app, "cmb1", "라벨1", "값1");
 * </code></pre>
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		 select ID (only Combo, List, Radio, CheckBox Group)
 * @param {String} psLabel		 추가할 item의 label
 * @param {String} psValue		 추가할 item의 value
 * @param {Number} pnIndex (Optional) 추가할 item의 index (default는 마지막 행 뒤에 추가됨)
 * @return void 
 */
SelectKit.prototype.addItem = function(app, psCtlId, psLabel, psValue, pnIndex){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	var item;
	
	if(ValueUtil.isNull(pnIndex)){
		ctrl.addItem(new cpr.controls.Item(psLabel, psValue));
	}else{
		if(pnIndex >= 0 && pnIndex <= ctrl.getItemCount()){
			if(pnIndex == 0){
				item = ctrl.getItem(pnIndex);
				ctrl.insertItemBefore(new cpr.controls.Item(psLabel, psValue), item);
			} else {
				item = ctrl.getItem(pnIndex - 1);
				ctrl.insertItemAfter(new cpr.controls.Item(psLabel, psValue), item);
			}
		}
	}
};

/**
 * 지정한 인덱스(Index)의 아이템 라벨(label)을 반환한다.
 * multiple "true"의 경우 index에 해당하는 여러 라벨값을 알고자 할 때, pnIndex는 구분자를 기준으로 조인된 String 형태를 가진다.
 * <pre><code>
 * SelectCtl.getLabel(app, "cmb1", "1,2,3");
 * </code></pre>
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		컨트롤ID
 * @param {Number} pnIndex		(Optional) 인덱스 번호
 * @return {String | Array}	multiple : true 일 경우 Array(String)
 * 										   false 일 경우 String
 */
SelectKit.prototype.getLabel = function(app, psCtlId, pnIndex){
	var ctrl = app.lookup(psCtlId);
	if(ValueUtil.isNull(pnIndex)){
		var item = ctrl.getSelectionFirst();
		return item ? item.label : "";
	}else{
		if(ctrl.multiple){//다중 선택 가능한 경우 라벨 배열 반환
			var vaIdx = ValueUtil.split(pnIndex, ",");
			for(var i=0, len=vaIdx.length; i<len; i++){
				vaIdx[i] = ctrl.getItem(vaIdx[i]).label;
			}
			return vaIdx;
		}else{
			return ctrl.getItem(pnIndex).label;
		}
	}
};

/**
 * 지정한 값에 해당하는 아이템 라벨(label)을 반환한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		컨트롤ID
 * @param {any} psValue		컨트롤값
 * @return {String}	라벨명
 */
SelectKit.prototype.getLabelByValue = function(app, psCtlId, psValue){
	/**@type cpr.controls.ComboBox*/
	var ctrl = app.lookup(psCtlId);
	var item = ctrl.getItemByValue(psValue);
	if(item){
		return item.label;
	}
	return "";
};

/**
 * 지정한 인덱스(Index)의 아이템 값(value)을 반환한다.
 * multiple "true"의 경우 index에 해당하는 여러 value 값을 알고자 할 때, pnIndex는 구분자를 기준으로 조인된 String 형태를 가진다.
 * <pre><code>
 * SelectCtl.getItemValue(app, "cmb1", "1,2,3");
 * </code></pre>
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		컨트롤ID
 * @param {Number} pnIndex		(Optional) 인덱스 번호
 * @return {String | Array}	multiple : true 일 경우 Array(String)
 * 										   false 일 경우 String
 */
SelectKit.prototype.getValue = function(app, psCtlId, pnIndex){
	/**@type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	if(ValueUtil.isNull(pnIndex)){
		var item = ctrl.getSelectionFirst();
		return item ? item.value : "";
	}else{
		if(ctrl.multiple){//다중 선택 가능한 경우 값 배열 반환
			var vaIdx = ValueUtil.split(pnIndex, ",");
			for(var i=0, len=vaIdx.length; i<len; i++){
				vaIdx[i] = ctrl.getItem(vaIdx[i]).value;
			}
			return vaIdx;
		}else{
			return ctrl.getItem(pnIndex).value;
		}
	}
};

/**
 * 컨트롤의 값을 셋팅한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		컨트롤ID
 * @param {String} psValue  컨트롤값
 * @param {boolean} pbEmitEvent (Optional) value-changed 이벤트 발생시킬지 여부(true/false)
 */
SelectKit.prototype.setValue = function(app, psCtlId, psValue, pbEmitEvent){
	/**@type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	if(pbEmitEvent != undefined && pbEmitEvent === false){
		ctrl.putValue(psValue);
	}else{
		ctrl.value = psValue;
	}
};

/**
 * 현재 선택 중인 아이템의 index를 반환한다.
 * multiple "true"의 경우, index는 배열의 형태로 반환된다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		select ID
 * @return {Number | Array}	multiple : true 일 경우 Array(Number)
 * 										   false 일 경우 Number 		
 */
SelectKit.prototype.getSelectedIndex = function(app, psCtlId){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	var items = ctrl.getSelection();
	if(ctrl.multiple){
		var indices = new Array();
		for(var i=0, len=items.length; i<len; i++){
			indices.push(ctrl.getIndex(items[i]));
		}
		return indices;
	}else{
		return ctrl.getIndex(items[0]);
	}
};

/**
 * 인덱스(Index) 또는 value에 해당하는 아이템(Item)을 선택한다.
 * multiple "true"의 경우 여러 개의 아이템을 선택하고자 할 때, puRowIdx는 구분자를 기준으로 조인된 String 형태를 가진다.
 * <pre><code>
 * SelectCtl.selectItem(app, "cmb1", "0");
 * 또는
 * SelectCtl.selectItem(app, "cmb1", "값1,값2,값3");
 * </code></pre>
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId		컨트롤ID
 * @param {String | Array} puRowIdx 인덱스 또는 value 값
 * @param {Boolean} pbEmitEvent (Optional) 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 * @return {Boolean} 성공여부
 */
SelectKit.prototype.selectItem = function(app, psCtlId, puRowIdx, pbEmitEvent){
	/**@type cpr.controls.CheckBoxGroup */
	var ctrl = app.lookup(psCtlId);
	if(ctrl == null || ctrl == undefined) return false;
	
	puRowIdx = ValueUtil.split(puRowIdx, ",");
	if(ctrl.multiple){//다중 선택 가능한 경우
		if(puRowIdx.length > 0){
			if(!ValueUtil.isNumber(puRowIdx[0])){
				for(var i=0, len=puRowIdx.length; i<len; i++){
					puRowIdx[i] = ctrl.getIndexByValue(puRowIdx[i]);
				}
			}
			ctrl.selectItems(puRowIdx, pbEmitEvent);
		}
	}else{
		if(puRowIdx.length > 0){
			if(!ValueUtil.isNumber(puRowIdx[0])){
				var item = ctrl.getItemByValue(puRowIdx[0]);
				if(item) ctrl.selectItemByValue(puRowIdx[0], pbEmitEvent);
				else ctrl.selectItem(0, pbEmitEvent);
			} else {
				if(Number(puRowIdx[0]) >= ctrl.getItemCount()){
					ctrl.selectItem(0, pbEmitEvent);
				}else{
					ctrl.selectItem(puRowIdx[0], pbEmitEvent);
				}
			}
		}
	}
	
	return true;
};

/**
 * 모든 아이템을 선택한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId	컨트롤ID
 * @return void
 */
SelectKit.prototype.selectAllItem = function(app, psCtlId){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	var indices = new Array();
	for(var i=0, len=ctrl.getItemCount(); i<len; i++){
		indices.push(i);
	}
	ctrl.selectItems(indices);
};

/**
 * 해당 컨트롤 아이템을 필터링 한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId	컨트롤ID
 * @param {String} psCondition 필터 조건
 * @return void
 */
SelectKit.prototype.setFilter = function(app, psCtlId, psCondition){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	ctrl.setFilter("value == null || value == '' || ("+ psCondition +")");
};

/**
 * 컨트롤의 필터링을 해제한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId	컨트롤ID
 * @return void
 */
SelectKit.prototype.clearFilter = function(app, psCtlId){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	ctrl.clearFilter();
};

/**
 * 콤보박스의 값을 Reset한다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId	컨트롤ID
 */
SelectKit.prototype.reset = function(app, psCtlId){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	if(ctrl.dataSet){
		ctrl.dataSet.clear();
	}
	ctrl.value = "";
};

/**
 * 콤보박스에 매핑된 데이터셋의 컴럼값을 입력조건에 따라 가져온다.
 * @param {cpr.core.AppInstance} 	app 앱인스턴스
 * @param {#uicontrol} psCtlId	컨트롤ID
 * @param {String} psColName 찾을 컬럼명
 * @param {String} condition 조건 (예: "CD == 'test'")
 * @return {String} 컬럼값
 */
SelectKit.prototype.findValue = function(app, psCtlId, psColName, condition){
	/** @type cpr.controls.ComboBox */
	var ctrl = app.lookup(psCtlId);
	if(ctrl.dataSet){
		var findRow = ctrl.dataSet.findFirstRow(condition);
		if(findRow) {
			return findRow.getValue(psColName);
		}
	}
};


/**
 * 필터링 할 컬럼명(psFilterColumnName)은 데이터셋의 컬럼명을 작성한다.
 * 그리드에서 사용 금지.
 * @desc 두 개의 List형 컨트롤이 종속 관계를 가질 때, 종속되는 컨트롤의 데이터를 필터링하기 위한 메소드
 * @param {#uicontrol} psMainId				 메인 컨트롤 ID
 * @param {#uicontrol} psSubId				 적용될 컨트롤 ID
 * @param {String} psFilterColumnName	 적용될 컨트롤의 필터링 할 컬럼명
 * @param {Number} pbFirstItemSelect	(Optional)  첫번째 아이템 선택 여부  default : true (선택)
 * @return void
 */
//SelectKit.prototype.cascadeList = function(app, psMainId, psSubId, psFilterColumnName, pbFirstItemSelect){
//	var voMainCtl = app.lookup(psMainId);
//	var voSubCtl = app.lookup(psSubId);
//
//	if(voMainCtl == null || voSubCtl == null){
//		return;
//	}
//	pbFirstItemSelect = pbFirstItemSelect == null ? true : pbFirstItemSelect;
//
//	var vaItems = voMainCtl.getSelection();
//	var vsValue = "";
//	if(vaItems.length > 0){
//		vsValue = vaItems[0].value;
//	}
//
//	voSubCtl.clearFilter();
//
//	var voFirstItem = voSubCtl.getItem(0);
//	var vsFirstItemValue = voFirstItem.value;
//	var vsFirstItemLable = voFirstItem.label;
//
//	//'전체' 아이템 여부
//	var vbAllStatus = false;
//	//var vsGlsAll = cpr.I18N.INSTANCE.message("UI-GLS-ALL");
//	var vsGlsAll = "전체";
//
//	if( vsGlsAll ==  vsFirstItemLable && ( ValueUtil.isNull(vsFirstItemValue) || vsFirstItemValue.indexOf("%") != -1)){
//		vbAllStatus = true;
//	}
//
//	//전체아이템이 포함됐을 경우
//	if(vbAllStatus)	{
//		var vsFilter = psFilterColumnName + "== '" + vsValue + "' || ( label == '" +  vsGlsAll + "' && (value == '' || value == '%'))";
//		voSubCtl.setFilter(vsFilter);
//		if(pbFirstItemSelect)
//			this.selectItem(app, psSubId, 0);
//	}else{
//		voSubCtl.setFilter(psFilterColumnName + "== '" + vsValue + "'");
//		if(pbFirstItemSelect){
//			var vaSubCtlItems = voSubCtl.getItems();
//			if(vaSubCtlItems.length > 0){
//				this.selectItem(app, psSubId, vaSubCtlItems[0].value);
//			}else{
//				this.selectItem(app, psSubId, 0);
//			}
//		}
//
//	}
//
//	voSubCtl.redraw();
//};

/**
 * 트리(Tree) 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function TreeKit(appKit){
	this._appKit = appKit;
};


/**
 * 현재 선택된 아이템의 value를 반환한다.
 * @param {cpr.core.AppInstance} 		app 앱인스턴스
 * @param {#tree} psTreeId	 트리 Id
 * @param {String} psDiv? 얻어올 값 영역(label 또는 value)
 * @return {String | String[]}  multiple 속성이 true 일 경우 Array(String)
 *                                      false 일 경우 String  
 */
TreeKit.prototype.getSelectedValue = function(app, psTreeId, psDiv){
	/** @type cpr.controls.Tree */
	var tree = app.lookup(psTreeId);
	var items = tree.getSelection();
	//아이템이 없으면... 공백 반환
	if(items.length < 1) return "";
	
	psDiv = (psDiv != null ? psDiv.toUpperCase() : "VALUE");
	if(tree.multiple){
		var values = new Array();
		items.forEach(function(vcItem){
			if(psDiv == "LABEL")
				values.push(vcItem.label);
			else
				values.push(vcItem.value);
		});
		return values;
	}else{
		return psDiv == "LABEL" ? items[0].label : items[0].value;
	}
};


/**
 * @desc 입력한 value에 해당하는 아이템의 label 또는 parentValue를 반환한다.
 * @param {cpr.core.AppInstance} app
 * @param {#tree} psTreeId	트리 id
 * @param {String} psValue	검색 값
 * @return {String}
 */
TreeKit.prototype.getItem = function(app, psTreeId, psValue){
	/**@type cpr.controls.Tree*/
	var tree = app.lookup(psTreeId);
	return tree.getItemByValue(psValue);
};

/**
 * 해당 아이템의 상위 아이템을 펼친다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#tree} psTreeId		 트리 Id
 * @param {cpr.controls.TreeItem} poItem	부모 아이템 객체
 * @param {Boolean} pbHierarchy? 계층적으로 모든 상위까지 펼칠지 여부(false인 경우, 바로 상위의 부모 아이템만 펼친다.)
 * @return void
 */
TreeKit.prototype.expandParentItem = function(app, psTreeId, poItem, pbHierarchy){
	/** @type cpr.controls.Tree */
	var tree = app.lookup(psTreeId);
	pbHierarchy == !!pbHierarchy ? pbHierarchy : true;
	
	var parentItems = new Array();
	function checkExpandItem(poPItem){
		var item = tree.getItemByValue(poPItem.parentValue);
		if(item != null && item.value != "" && !tree.isExpanded(item)){
			parentItems.push(item);
			checkExpandItem(item);
		}
	}
	if(pbHierarchy){
		checkExpandItem(poItem);
	}else{
		parentItems.push(poItem);
	}
	
	for(var i=0, len=parentItems.length; i<len; i++){
		tree.expandItem(parentItems[i]);
	}
};

/**
 * 트리 선택 아이템 변경 이벤트 발생시, 변경 이전에 선택된 아이템을 선택해준다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {cpr.events.CSelectionEvent} event 트리 선택 아이템 변경 이벤트
 * @param {Boolean} emitEvent? 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 * @return void
 */
TreeKit.prototype.selectBeforeRow = function(app, event, pbEmitEvent) {
	/** @type cpr.controls.Tree */
	var tree = event.control;
	var emit = pbEmitEvent === true ? true : false;
	
	var oldSelection = event.oldSelection[0];
	var oldValue = oldSelection.value;
	tree.selectItemByValue(oldValue, emit);
	tree.focusItem(oldSelection);
};

/**
 * @desc 입력한 label 또는 value에 해당하는 트리 아이템을 선택한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#tree} psTreeId	 트리 id
 * @param {String} psValue	 search value
 * @param {String} psDiv?	 가지고 오는 구분자 값(VALUE(디폴트), LABEL)
 * @return void
 */
TreeKit.prototype.selectItem = function(app, psTreeId, psValue, psDiv){
	/**@type cpr.controls.Tree*/
	var tree = app.lookup(psTreeId);

	psDiv = !!psDiv ? psDiv.toUpperCase() : "VALUE";
	if(psDiv == "VALUE"){
		tree.selectItemByValue(psValue);
	} else {
		tree.selectItemByLabel(psValue);
	}
};

/**
 * @desc 아이템에 해당하는 모든 child item을 펼치거나 닫습니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#tree} psTreeId		트리 Id
 * @param {Boolean} pbExpand	펴기 : true, 닫기 : false
 * @param {cpr.controls.TreeItem} poItem?		item 생략가능 default 최상위 item
 * @return void
 */
TreeKit.prototype.expandAllItems = function(app, psTreeId, pbExpand, poItem){
	/**@type cpr.controls.Tree*/
	var tree = app.lookup(psTreeId);
	if(poItem != null && poItem != undefined){
		if(pbExpand){
			tree.expandItem(poItem);
			tree.expandAllItems(poItem);
		} else {
			tree.collapseItem(poItem);
			tree.collapseAllItems(poItem);
		}
	} else {
		pbExpand ? tree.expandAllItems() : tree.collapseAllItems();
	}
};

/**
 * @desc 현재 드래그 중인 선택 항목을 표시하는 컨트롤을 띄운다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {cpr.events.CMouseEvent} event 마우스 이벤트
 * @param {String} psText	 라벨에 표시할 텍스트
 * @param {String} psWidth	(optional) 라벨 width
 * @param {String} psHeight	(optional) 라벨 height
 * @return void
 */
TreeKit.prototype.draggingLabel = function(app, event, psText, psWidth, psHeight){
	var dragMessage = new cpr.controls.Output("rowmessage");
	dragMessage.style.css({
		"position": "absolute",
		"box-shadow": "0px 2px 2px 0px rgba(0, 0, 0, .3)",
		width: psWidth?psWidth:"268px",
		height: psHeight?psHeight:"50px",
		border: "solid 1px",
		backgroundColor: "#FFF"
	});

	dragMessage.value = /*임시로 적어둠*/"현재 드래그하고 있는 대상 : " + psText;

	var dataDragManager = cpr.core.Module.require("module/dataDragManager");

	dataDragManager.dragStart(dragMessage, app, event);
};

/**
 * 탭(TabFolder) 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function TabKit(appKit){
	this._appKit = appKit;
};

/**
 * 현재 선택된 탭아이템 id를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#TabFolder} psTabId 탭 Id
 * @return {Number} 탭아이템 id (탭아이템id는 인덱스와 유사 탭아이템 순서대로 id 부여됨)
 */
TabKit.prototype.getSelectedId = function(app, psTabId){
	/** @type cpr.controls.TabFolder */
	var vcTab = app.lookup(psTabId);
	var vcTabItem = vcTab.getSelectedTabItem();
	
	return vcTabItem ? vcTabItem.id : "";
};

/**
 * 입력한 id 또는 name에 해당하는 탭 아이템을 선택한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#tabfolder} psTabId 탭Id
 * @param {Number | String} pnIndex 탭아이템id 또는 탭아이템명
 * @param {Boolean} pbEmitEvent? 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 */
TabKit.prototype.setSelectedTabItem = function(app, psTabId, pnIndex, pbEmitEvent){
	/** @type cpr.controls.TabFolder */
	var tab = app.lookup(psTabId);
	
	var tabItems = tab.getTabItems();
	var tabItem = tabItems.filter(function(item){
		return item.id == pnIndex || item.name == pnIndex;
	});
	
	var emitEvent = pbEmitEvent != undefined ? pbEmitEvent : true;
	tab.setSelectedTabItem(tabItem[0], emitEvent);
};

/**
 * 탭 페이지를 숨기거나/보여준다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#TabFolder} psTabId 탭Id
 * @param {Number} pnIndex 탭아이템 id
 * @param {Boolean} pbVisible - 숨김여주(true/false)
 */
TabKit.prototype.setVisibleTabItem = function(app, psTabId, pnIndex, pbVisible){
	/** @type cpr.controls.TabFolder */
	var vcTab = app.lookup(psTabId);
	
	var vaTabItem = vcTab.getTabItems();
	var vcTabItem = vaTabItem.filter(function(item){
		return item.id == pnIndex;
	});
	
	if(vcTabItem){
		vcTabItem[0].visible = pbVisible;
	}
};

/**
 * 탭 페이지 버튼을 활성화시키거나 비활성화 시킨다
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#TabFolder} psTabId 탭Id
 * @param {String || Array} paIndex - 활성화/비활성화 할 탭 Index 또는 Index 배열 (탭 index 시작 = 1) 
 * @param {Boolean} psEnable - 활성화여부(true/false)
 */
TabKit.prototype.setEnableTabItem = function(app, psTabId, paIndex, psEnable){
	/* 2019-05-13 ssb 작성 */
	/** @type cpr.controls.TabFolder */
	var vcTab = app.lookup(psTabId);
	
	if(!(paIndex instanceof Array)){
		paIndex = [paIndex];
	}
	var vaTabItem = vcTab.getTabItems();
	
	for (var i=0, len=paIndex.length; i<len; i++) {
		var vnTabIdx  = paIndex[i] - 1;
		vaTabItem[vnTabIdx].enabled = psEnable;
	}
};



/**
 * Embeded앱 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function EmbeddedAppKit(appKit){
	this._appKit = appKit;
};

/**
 * Embeded 앱내의 함수를 호출한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#embeddedapp} psEmbeddedappId 임베디드 앱 ID
 * @param {String} psFuncName 호출 함수명
 * @param {String | Array} paArgs? 함수에 전달할 아규먼트 
 * @return {any} 반환값
 */
EmbeddedAppKit.prototype.callAppMethod = function(app, psEmbeddedappId, psFuncName, paArgs){
	/** @type cpr.controls.EmbeddedApp */
	var emb = app.lookup(psEmbeddedappId);
	var value = null;
	if(emb){
		emb.ready(function(e){
			if(!e.hasAppMethod(psFuncName)){
				alert("The embeded page not have "+psFuncName+" function! (script error)");
				return null;
			}
			value = e.callAppMethod(psFuncName, paArgs);
		});
	}
	return value;
};

/**
 * 임베디드 앱을 포함하고 있는 Host앱의 특정 함수를 호출한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psFuncName 호출 함수명
 * @param {String | Array} paArgs? 함수에 전달할 아규먼트 
 * @return {any} 반환값
 */
EmbeddedAppKit.prototype.callHostAppMethod = function(app, psFuncName, paArgs){
	/** @type cpr.core.AppInstance */
	var hostApp = app.getHostAppInstance();
	if(hostApp && hostApp.hasAppMethod(psFuncName)){
		return hostApp.callAppMethod(psFuncName, paArgs);
	}
	return null;
};

/**
 * 해당 임베디드 앱에 연결된 페이지의 앱 APP가 존재하는지 여부를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#embeddedapp} psEmbeddedappId 임베디드 앱 ID
 * @return {Boolean} 임베디드 앱 유/무 반환
 */
EmbeddedAppKit.prototype.hasPage = function(app, psEmbeddedappId){
	/** @type cpr.controls.EmbeddedApp */
	var emb = app.lookup(psEmbeddedappId);
	return (emb && emb.app) ? true : false;
};

/**
 * Embeded 앱에 호출할 화면을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#embeddedapp} psEmbeddedappId 임베디드 앱 ID
 * @param {String} psAppId 호출할 화면 앱ID
 * @param {any} poInitValue? 초기 파라메터
 */
EmbeddedAppKit.prototype.setPage = function(app, psEmbeddedappId, psAppId, poInitValue){
	/** @type cpr.controls.EmbeddedApp */
	var emb = app.lookup(psEmbeddedappId);
	if(emb){
		cpr.core.App.load(psAppId, function(loadedApp){
			if(loadedApp){
		   	    emb.initValue = poInitValue;
		        emb.app = loadedApp;
		      
		        emb.addEventListenerOnce("load", function( /* cpr.events.CEvent */ e) {
					var embApp = emb.getEmbeddedAppInstance();
					
					var vaMainDataBoxCtrls = app.getContainer().getChildren().filter(function(child){
						return child.type == "container" 
							&& (child.id != "grpSearch" && child.style.getClasses().indexOf("search-box") == -1 && child.visible == true);
					});
					
					if(vaMainDataBoxCtrls && vaMainDataBoxCtrls.length > 0) {
						/**@type cpr.controls.Container */
						var grpMainData = vaMainDataBoxCtrls[0]
						var mainHeight = grpMainData.getActualRect().height;
						
						/**@type cpr.controls.Container */
						var grpSearch = embApp.lookup("grpSearch");
						var schAreaHeight = 0;
						var margin1 = 0;
						if(grpSearch) {
							schAreaHeight = grpSearch.visible ? grpSearch.getActualRect().height : 0;
							margin1 = grpSearch.visible ? 5 : 0;
						}
						
						var appHeaders = embApp.getContainer().getChildren().filter(function(child){
							return child.type == "udc.com.appHeader";
						});
						
						var appHeaderHeight = 0;
						var margin2 = 0;
						if(appHeaders && appHeaders.length > 0) {
							/**@type udc.com.appHeader */
							var appHeader = appHeaders[0];
							appHeaderHeight = appHeader.visible ? appHeader.getActualRect().height : 0;
							margin2 = appHeader.visible ? 5 : 0;
						}
						
						var vaDataBoxCtrls = embApp.getContainer().getChildren().filter(function(child){
							return child.type == "container" 
								&& (child.id != "grpSearch" && child.style.getClasses().indexOf("search-box") == -1 && child.visible == true);
						});
						
						if(vaDataBoxCtrls && vaDataBoxCtrls.length > 0) {
							var height = mainHeight - appHeaderHeight - margin1 - margin2 - schAreaHeight;
							
							embApp.getContainer().updateConstraint(vaDataBoxCtrls[0], {
								"height": height + "px"
							});
						}
						
					}
					
			    });
		    }
		});
	}
};

/**
 * 임베디드 컨트롤에 포함되어있는 앱객체들을 제거합니다. 
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#embeddedapp} psEmbeddedappId 임베디드 앱 ID
 */
EmbeddedAppKit.prototype.dispose = function(app, psEmbeddedappId){
	/** @type cpr.controls.EmbeddedApp */
	var emb = app.lookup(psEmbeddedappId);
	if(emb && emb.getEmbeddedAppInstance()){
		emb.getEmbeddedAppInstance().dispose();
	}
};

/**
 * 메인 MDI 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function MDIKit(appKit){
	this._appKit = appKit;
};

/**
 * close 메인 MDI의 탭으로 화면을 오픈한다.
 * - Root App에 해당 함수 필요
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#MDIFolder} psMenuId 메뉴ID
 */
MDIKit.prototype.open = function(app, psMenuId, poParam){
	app.getRootAppInstance().callAppMethod("doOpenMenuToMdi", psMenuId, poParam);
};

/**
 * close 메인 MDI의 화면을 닫는다.
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
MDIKit.prototype.close = function(app){
	var vsMenuId = this._appKit.Auth.getMenuInfo(app, "MENU_ID");
	app.getRootAppInstance().callAppMethod("doCloseMdiTab", vsMenuId);
};

/**
 * 일반 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function ControlKit(appKit){
	this._appKit = appKit;
};

/**
 * 지정한 컨트롤의 Visible 속성을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Boolean} pbVisible 컨트롤 숨김 여부(true/false)
 * @param {#uicontrol | Array} paCtlId 컨트롤 아이디 또는 아이디 배열
 * @return void
 */
ControlKit.prototype.setVisible = function(app, pbVisible, paCtlId) {
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
	for (var i=0, len=paCtlId.length; i<len; i++) {
		app.lookup(paCtlId[i]).visible = pbVisible;
	}
};

/**
 * 지정한 컨트롤의 Enable 속성을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Boolean} pbEnable 컨트롤 활성화 여부(true/false)
 * @param {#uicontrol | Array} paCtlId 컨트롤 아이디 또는 아이디 배열
 * @return void
 */
ControlKit.prototype.setEnable = function(app, pbEnable, paCtlId) {
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
	var ctrl;
	for (var i=0, len=paCtlId.length; i<len; i++) {	
		ctrl = app.lookup(paCtlId[i]);
		if(ctrl) ctrl.enabled = pbEnable;
	}
};

/**
 * 지정한 컨트롤의 ReadOnly 속성을 설정한다.
 * 만약, 해당 컨트롤에 readonly이 없을경우 enable 속성으로 제어된다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Boolean} pbReadOnly  컨트롤 readOnly 여부(true/false)
 * @param {#uicontrol | Array} paCtlId 컨트롤 아이디 또는 아이디 배열
 * @return void
 */
ControlKit.prototype.setReadOnly = function(app, pbReadOnly, paCtlId) {
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
		
	for (var i=0, len=paCtlId.length; i<len; i++) {
		var ctrl = app.lookup(paCtlId[i]);
	  	if(ctrl == null) continue;
		
		if(ctrl.readOnly !== undefined){
			ctrl.readOnly = pbReadOnly;
		}else{
			//컨트롤이 readOnly 속성이 없는 경우에는 enabled로 처리함
			this.setEnable(app, !pbReadOnly, ctrl);
		}
	}
};

/**
 * 컨트롤의 지정된 사용자 정의 속성(userattr) 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 	  컨트롤 아이디
 * @param {String} psAttrName  속성
 * @return {String} 속성값
 */
ControlKit.prototype.getUserAttr = function(app, psCtlId, psAttrName){
   return app.lookup(psCtlId).userAttr(psAttrName);
};

/**
 * 컨트롤의 지정된 사용자 정의 속성(userattr)의 값을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 	   컨트롤 아이디
 * @param {String} psAttrName  속성
 * @param {String} psAttrValue 속성값
 * @return void
 */
ControlKit.prototype.setUserAttr = function(app, psCtlId, psAttrName, psAttrValue){
	var ctrl = app.lookup(psCtlId);
	var userAttr = ctrl.userAttr();
	userAttr[psAttrName] = psAttrValue;
};

/**
 * 컨트롤를 포커스(focus) 한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 	   컨트롤 아이디
 */
ControlKit.prototype.setFocus = function(app, psCtlId){
	var ctrl = app.lookup(psCtlId);
	if(ctrl instanceof cpr.controls.UDCBase){
		var focused = false;
		var embApp = ctrl.getEmbeddedAppInstance();
		embApp.getContainer().getChildren().some(function(embCtrl){
			if(embCtrl.getBindInfo("value") && embCtrl.getBindInfo("value").property == "value"){
				embCtrl.focus();
				focused = true;
				return true;
			}
		});
		if(focused !== true){
			app.focus(ctrl);
		}
	}else{
		app.focus(ctrl);
	}
}

/**
 * 컨트롤의 값을 초기화한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol | Array} paCtlId  일반 컨트롤 및 그리드 컨트롤 아이디		
 * @return void
 */
ControlKit.prototype.reset = function(app, paCtlId) {
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
	var ctrl;
	for (var i=0, len=paCtlId.length; i<len; i++) {
		ctrl = app.lookup(paCtlId[i]);
		if(ctrl == null) continue;
		
		if(ctrl.type == "grid"){
			ctrl.dataSet.clear();
			//그리드 타이틀 영역의 데이터 건수 업데이트
			var titles = this._appKit.Group.getAllChildrenByType(app, "udc.com.comTitle");
			for(var j=0, jlen=titles.length; j<jlen; j++){
				if(titles[j] == null || titles[j].getAppProperty("ctrl") == null) continue;
				if(titles[j].getAppProperty("ctrl").id == ctrl.id){
					titles[j].setAppProperty("rowCount", ctrl.dataSet.getRowCount());
				}
			}
		}else if(ctrl.type == "container"){
			var voDs = this._appKit.Group.getBindDataSet(app, ctrl);
			if(voDs) voDs.clear();
			ctrl.redraw();
		}else{
			ctrl.value = "";
		}
	}
};

/**
 * 특정 컨트롤의 자료를 갱신하고 다시 그린다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol | Array} paCtlId 일반 컨트롤 및 그리드 컨트롤 아이디
 * @return void
 */
ControlKit.prototype.redraw = function(app, paCtlId) {
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
	for (var i=0, len=paCtlId.length; i<len; i++) {
		var ctrl = app.lookup(paCtlId[i]);
		if(ctrl) ctrl.redraw();
	}
};

/**
 * 컨트롤의 지정된 style 속성 값을 가져옵니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @param {String} psAttrName style 속성명
 * @return {String} style 속성값
 */
ControlKit.prototype.getStyleAttr = function(app, psCtlId, psAttrName){
	return app.lookup(psCtlId).style.css(psAttrName);
};

/**
 * 컨트롤의 지정된 style 속성값을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @param {String} psAttrName 속성
 * @param {String} psAttrValue 속성값
 * @return void
 */
ControlKit.prototype.setStyleAttr = function(app, psCtlId, psAttrName, psAttrValue){
	return app.lookup(psCtlId).style.css(psAttrName, psAttrValue);
};

/**
 * 컨트롤이 실제 그려진 사이즈를 리턴합니다.
 * 컨트롤이 화면에 그려지지 않은 상태인 경우는 모든 값이 0인 객체가 리턴됩니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId  컨트롤 아이디
 * @param {String} psPosition 구하고자하는 위치 및 크기 정보(width, height, left, top, bottom, right)
 * @return {Interface{width: Number, height: Number, left: Number, top: Number, bottom: Number, right: Number}} HTML DOM에서의 컨트롤의 위치 및 크기 정보
 */
ControlKit.prototype.getActualRectPosition = function(app, psCtlId, psPosition){
	/** @type cpr.controls.UIControl */
	var ctrl = app.lookup(psCtlId);
	var actualRect = ctrl.getActualRect();
	return actualRect[psPosition];
};

/**
 * 해당 컨트롤의 제약 조건을 반환합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 반환하고자 하는 컨트롤ID
 * @param {String} psParentGroupId? 상위 컨트롤 ID(그룹내 컨트롤의 제약 조건을 구할시 사용)
 * @return {cpr.controls.layouts.Constraint} 해당하는 제약조건.
 */
ControlKit.prototype.getConsraint = function(app, psCtlId, psParentGroupId){
	var ctrl = app.lookup(psCtlId);
	var container;
	if(!ValueUtil.isNull(psParentGroupId)){
		container = app.lookup(psParentGroupId);
	}else{
		container = app.getContainer();		
	}
	return container.getConstraint(ctrl);
};

/**
 * 컨트롤의 지정된 제약 조건(constraint)을 변경합니다.
 * 타겟 컨트롤에서 부모 컨트롤과의 연계된 위치를 변경합니다.
 * parameter의 constraints가 포함한 항목만 변경합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤의 아이디
 * @param {#Container} psParentGroupId 상위 컨트롤의 아이디. app의 container일 경우 null
 * @param {Object} poConstraint 제약조건
 * 					상위 컨트롤의 레이아웃이 formlayout일 경우 rowIndex, colIndex 를 반드시 포함한 조건을 설정하여야합니다.
 * @return {boolean} 성공여부
 */
ControlKit.prototype.updateConstraint = function(app, psCtlId, psParentGroupId, poConstraint){
 	/** @type cpr.controls.UIControl */
 	var ctrl = app.lookup(psCtlId);
 	if(ctrl == null) return false;
 	
 	/** @type cpr.controls.Container */
 	var container = null;
 	if(!ValueUtil.isNull(psParentGroupId)){
 		container = app.lookup(psParentGroupId);
 	}else {
 		container = app.getContainer();
 	}
 	
 	var layout = container.getLayout();
 	var constraint = null;
 	if(layout instanceof cpr.controls.layouts.ResponsiveXYLayout){
 		var srcConstraint = container.getConstraint(ctrl)["positions"][0];
 		constraint = {
 			positions:[Object.assign(srcConstraint, poConstraint)]
 		}
 	}else {
 		constraint = poConstraint;
 	}
 	return container.updateConstraint(ctrl, constraint);
};

/**
 * 해당 컨트롤의 이벤트를 발생시킨다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤의 아이디
 * @param {String} psEventType 이벤트명(ex-click)
 */
ControlKit.prototype.dispatchEvent = function(app, psCtlId, psEventType){
	var ctrl = app.lookup(psCtlId);
	if(ctrl){
		ctrl.dispatchEvent(new cpr.events.CEvent(psEventType));
	}
};

/**
 * 지정한 컨트롤의 value를 지정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @param {String} psValue 값
 * @param {Boolean} pbEmitEvent? 값 변경후의 before-value-change, value-change 이벤트 발생시킬지 여부<br/>
 *                  만약 값만 바꾸고, 이벤트 발생은 일어나지 않도록 하는 경우에만 false로 지정
 * @return void
 */
ControlKit.prototype.setValue = function(app, psCtlId, psValue, pbEmitEvent){
   var ctrl = app.lookup(psCtlId);
   if(pbEmitEvent === false && ctrl.putValue != undefined){
   		ctrl.putValue(psValue);
   }else{
   		ctrl.value = psValue;
   }
};

/**
 * 컨트롤에 지정된 다국어 언어키를 변경한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @param {String} psLangKeyPath 언어키
 */
ControlKit.prototype.setLanguage = function(app, psCtlId, psLangKeyPath){
   var ctrl = app.lookup(psCtlId);
   ctrl.bind("value").toLanguage(psLangKeyPath);
};

/**
 * @desc 지정한 컨트롤의 value를 취득한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @return {String} value
 */
ControlKit.prototype.getValue = function(app, psCtlId){
   return app.lookup(psCtlId).value;
};

/**
 * 지정한 컨트롤의 value를 취득한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 컨트롤 아이디
 * @param {String} psProperty 컨트롤 속성명
 * @return void
 */
ControlKit.prototype.getProperty = function(app, psCtlId, psProperty){
   return app.lookup(psCtlId)[psProperty];
};

/**
 * 데이터셋 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function DataSetKit(appKit){
	this._appKit = appKit;
};

/**
 * 데이터셋 또는 데이터맵에 컬럼(Column)을 추가합니다.
 * Header정보 추가되며, data가 있는 경우 row data에도 해당 column data가 추가됩니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psDataSetId 데이터셋
 * @param {String} psColumnNm 추가하려는 컬럼명
 * @param {Object} psValue (Optional) 초기값 설정
 * @param {String} psColumnType (Optional) 컬럼유형(string/number/decimal/expression)
 * @return {Boolean} 컬럼 추가 성공 여부
 */
DataSetKit.prototype.addColumn = function(app, psDataSetId, psColumnNm, psValue, psColumnType){
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	
	var columnType = !ValueUtil.isNull(psColumnType) ? psColumnType.toLowerCase() : "string";
	return dataset.addColumn(new cpr.data.header.DataHeader(psColumnNm, columnType), psValue);
};

/**
 * 데이터셋의 값을 가져오는 함수 입니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataSet} psDataSetId 데이터셋
 * @param {Number} pnRowIndex 수정할 row의 row index
 * @param {String} psColumnName 가져오려는 값의 컬럼명
 * @return {any} 컬럼값
 */
DataSetKit.prototype.getValue = function(app, psDataSetId, pnRowIndex, psColumnName){
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	return dataset.getValue(pnRowIndex, psColumnName);
};

/**
 * 데이터셋 특정 값을 가져오는 함수 입니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataSet} psDataSetId 데이터셋
 * @param {String} psColumnName 가져오려는 값의 컬럼명
 * @param {String} psCondition 특정 값을 가져올 조건
 * 
 * ex) util.DataSet.getValue(app, "dsLttmRcd", "CD == '" + vsNewVal + "'", "CD_USG_01");
 */
DataSetKit.prototype.getValueByCondition = function(app, psDataSetId, psColumnName, psCondition){
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	
	var row = dataset.findFirstRow(psCondition);
	return row != null ? row.getValue(psColumnName) : "";
};


/**
 * 입력 받은 rowIndex와 columnName에 해당되는 데이터를 수정합니다.<br>
 * <br>
 * 1. 상태변경<br>
 * 해당 columnName에 해당되는 Column이 DisplayColumn이 아니고 Row상태가 UNCHANGED 상태인 경우
 * Row 상태가 UPDATED로 바뀝니다.(UNCHANGED -> UPDATED)<br>
 * DELEDED상태이거나 INSERTED상태인 row는 수정할 수 없습니다.<br>
 * 2. 이벤트<br>
 * 수정이 된 경우 <b>UPDATED 이벤트가 발생합니다.</b><br>
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId Id
 * @param {Number} pnRowIndex 수정할 row의 row index.
 * @param {String} psColumnName 수정할 column의 columnName.
 * @param {any} psValue 수정할 value 값.
 * @return {Boolean} 값 수정 성공 여부.
 */
DataSetKit.prototype.setValue = function(app, psDataSetId, pnRowIndex, psColumnName, psValue){
	/** @type cpr.data.DataSet */
	var dataset =  app.lookup(psDataSetId);
	return dataset.setValue(pnRowIndex, psColumnName, psValue);
};

/**
 * 모든 데이터셋 정보를 제거합니다.<br>
 * data, sort, filter가 제거됩니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId DataSet Id
 */
DataSetKit.prototype.clear = function(app, psDataSetId) {
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	dataset.clear();
}

/**
 * 지정한 범위 내의 row들 중 조건에 맞는 첫번째 Row 객체를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId 데이터셋 ID
 * @param {String} psCondition 조건식
 *                 ex)"STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'"
 * 					사용가능수식 !=", "!==", "$=", "%", "&&", "(", "*", "*=", "+", ",", "-", ".", "/", "/*", "//", "<", "<=", "==", "===", ">", ">=", "?", "[", "^=", "||"
 * @param {Number} pnStartIdx? 범위지정 시작 row index.
 * @param {Number} pnEndIdx? 범위지정 끝 row index.
 * @retrun {cpr.data.Row} 검색 조건에 맞는 Row 객체
 */
DataSetKit.prototype.findRow = function(app, psDataSetId, psCondition, pnStartIdx, pnEndIdx) {
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	return dataset.findFirstRow(psCondition, pnStartIdx, pnEndIdx);
};

/**
 * 지정한 범위 내의 row들 중 조건에 맞는 모든 Row 객체의 배열을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId 데이터셋 ID
 * @param {String} psCondition 조건식
 *                 ex)"STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'"
 * 					사용가능수식 !=", "!==", "$=", "%", "&&", "(", "*", "*=", "+", ",", "-", ".", "/", "/*", "//", "<", "<=", "==", "===", ">", ">=", "?", "[", "^=", "||"
 * @param {Number} pnStartIdx? 범위지정 시작 row index.
 * @param {Number} pnEndIdx? 범위지정 끝 row index.
 * @retrun {cpr.data.Row[]} 검색 조건에 맞는 Row 객체 배열
 */
DataSetKit.prototype.findAllRow = function(app, psDataSetId, psCondition, pnStartIdx, pnEndIdx) {
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	return dataset.findAllRow(psCondition, pnStartIdx, pnEndIdx);
};

/**
 * 지정한 범위 내의 row들 중 조건에 맞는 첫번째 Row 객체에 해당하는 컬럼의 value를 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId 데이터셋 ID
 * @param {String} psCondition 조건식
 *                 ex)"STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'"
 * 					사용가능수식 !=", "!==", "$=", "%", "&&", "(", "*", "*=", "+", ",", "-", ".", "/", "/*", "//", "<", "<=", "==", "===", ">", ">=", "?", "[", "^=", "||"
 * @param {String} psColumnName 컬럼명
 * @param {Number} pnStartIdx?  범위지정 시작 row index.
 * @param {Number} pnEndIdx?   범위지정 끝 row index.
 * @retrun {any} 데이터 로우의 값
 */
DataSetKit.prototype.getFindRowValue = function(app, psDataSetId, psCondition, psColumnName, pnStartIdx, pnEndIdx) {
	var row = this.findRow(app, psDataSetId, psCondition, pnStartIdx, pnEndIdx);
	if(row != null){
		return row.getValue(psColumnName);
	}else{
		return null;
	}
};

/**
 * 현재 Row 수를 반환
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#dataset} psDataSetId 데이터셋 ID
 * @retrun {Number} 로우 갯수
 */
DataSetKit.prototype.getRowCount = function(app, psDataSetId) {
	return app.lookup(psDataSetId).getRowCount();
};

/**
 * 현재 데이터셋의 데이터를 타겟 데이터셋으로 복사합니다.<br>
 * 타겟 데이터셋의 존재하는 컬럼의 데이터만 복사됩니다.<br>
 * 복사시 추가되는 데이터는 INSERT 상태입니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스 
 * @param {#dataset} psSourceDataSetId DataSet Id
 * @param {#dataset} psTargetDataSetId 복사 데이터가 들어갈 타겟 DataSet Id.
 * @param {String} psFilterCondition? 복사시 필터링할 조건. (생략시 전체 복사, target의 기존 데이터는 삭제됨)
 * 				   "STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'" (동일한 로우가 있을경우 복사안함)
 * @return {Boolean} 성공여부
 */
DataSetKit.prototype.copyToDataSet = function(app, psSourceDataSetId, psTargetDataSetId, psFilterCondition){
	var srcDataSet = app.lookup(psSourceDataSetId);
	var targetDataSet = app.lookup(psTargetDataSetId);
	if(psFilterCondition == null || psFilterCondition == undefined){
		targetDataSet.clear();
	}else{
		var findRows = targetDataSet.findAllRow(psFilterCondition);
		if(findRows != null && findRows.length > 0) return;
	}
	return srcDataSet.copyToDataSet(targetDataSet, psFilterCondition);
};

/**
 * rowData를 입력받아 원하는 특정 row index의 앞이나 뒤에 신규 row를 추가합니다.<br>
 * <b>INSERTED 이벤트가 발생합니다.</b>
 * @param {cpr.core.AppInstance} app 앱인스턴스 
 * @param {#dataset} psDataSetId DataSet Id
 * @param {Number} pnIndex? index 삽입하고자 하는 row index
 * @param {Boolean} pbAfter? 해당 row index의 뒤에 삽입할지 여부. (true:뒤 / false:앞)
 * @param {cpr.data.RowConfigInfo} poRowData? 추가할 row data. (key: header명, value: value 를 갖는 json data)<br>
{[columnName: string]: string | number | boolean}
*  @return {cpr.data.Row} 추가한 신규 Row 객체.
 */
DataSetKit.prototype.insertRow = function(app, psDataSetId, pnIndex, pbAfter, poRowData){
	/** @type cpr.data.DataSet */
	var dataset = app.lookup(psDataSetId);
	
	var index = (pnIndex == null || pnIndex == undefined) ? dataset.getRowCount()-1 : pnIndex;
	var after = pbAfter == null ? true : pbAfter;
	if(poRowData != null){
		return dataset.insertRowData(pnIndex, after, poRowData);
	}else{
		return dataset.insertRow(pnIndex, after);
	}
};

/**
 * 데이터맵(DataMap) 데이터 컴포넌트 유틸
 * @param {common.AppKit} appKit
 */
function DataMapKit(appKit){
	this._appKit = appKit;
}

/**
 * 입력 받은 columnName에 해당되는 데이터를 반환
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#datamap} psDataMapId 데이터맵 Id
 * @param {String} psColumnName 값을 가져오고자 하는 컬럼명
 * @return {String | Number | Decimal | Expression} 해당 데이터
 * 					header dataType에 따라 반환타입이 정해짐.
					해당 columnName의 column이 존재 할 경우 해당 값 반환
					해당 columnName의 값이 없을 경우 ""(공백) 반환
					해당 columnName이 존재하지 않을 경우 null 반환
 */
DataMapKit.prototype.getValue = function(app, psDataMapId, psColumnName){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	return datamap.getValue(psColumnName);
};

/**
 * 입력 받은 columnName에 해당되는 데이터를 수정
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#datamap} psDataMapId 데이터맵 Id
 * @param {String} psColumnName 값을 가져오고자 하는 컬럼명
 * @param {String} psValue 수정할 value 값
 * @return {Boolean} 성공 여부
 */
DataMapKit.prototype.setValue = function(app, psDataMapId, psColumnName, psValue){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	datamap.setValue(psColumnName, psValue);
};

/**
 * 데이터를 모두 제거합니다.
 * (data가 모두 공백으로 설정됩니다.)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#datamap} psDataMapId 데이터맵 Id
 * @param {boolean} pbKeep (Optional) 데이터 유지여부(컬럼정보는 유지됨)
 */
DataMapKit.prototype.clear = function(app, psDataMapId, pbKeep){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	if(pbKeep === true){
		datamap.clear(false);
	}else{
		datamap.clear();
	}
};

/**
 * 데이터를 모두 초기화합니다.
 * (data 모두 초기 설정값으로 설정됩니다.)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param  {#datamap} psDataMapId 데이터맵 Id
 */
DataMapKit.prototype.reset = function(app, psDataMapId){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	datamap.reset();
};

/**
 * 현재 데이터맵의 데이터를 타겟 데이터맵으로 복사합니다. <br>
 * 복사시 타겟 데이터맵의 alterColumnLayout 속성에 따라 복사방법의 설정됩니다. <br>
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#datamap} psSourceDataMapId 데이터맵 Id
 * @param {#datamap} psTargetDataMapId 복사 데이터가 들어갈 타겟 맵 ID.
 * @return {Boolean} 성공여부
 */
DataMapKit.prototype.copyToDataMap = function(app, psSourceDataMapId, psTargetDataMapId){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psSourceDataMapId);
	var targetDatamap = app.lookup(psTargetDataMapId);
	return datamap.copyToDataMap(targetDatamap);
};

/**
 * Column을 추가합니다.
 * Header정보에 추가되며, data가 있는 경우 row data에도 해당 column data가 추가됩니다.
 * @param {#datamap} psDataMapId 데이터맵 ID
 * @param {String} psColumnNm 추가하려는 Header 명
 * @param {String} psDataType (Optional) 데이터 유형(string, number, decimal, expression)
 * @param {String} psValue (Optional) 초기값 설정
 * @return {Boolean} 성공 여부
 */
DataMapKit.prototype.addColumn = function(app, psDataMapId, psColumnNm, psDataType, psValue){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	var dataType = (psDataType == null || psDataType == undefined) ? "string" : psDataType;
	return datamap.addColumn(new cpr.data.header.DataHeader(psColumnNm, dataType), psValue);
};

/**
 * Column을 삭제합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#datamap} psDataMapId 데이터맵 ID
 * @param {String} psColumnName 삭제할 컬럼 명
 * @return {Boolean} 컬럼 삭제 성공 여부
 */
DataMapKit.prototype.deleteColumn = function(app, psDataMapId, psColumnName){
	/** @type cpr.data.DataMap */
	var datamap = app.lookup(psDataMapId);
	return datamap.deleteColumn(psColumnName);
};

/**
 * 그리드(Grid) 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function GridKit(appKit){
	this._appKit = appKit;
};

/**
 * 그리드를 초기화한다.<br/>
 * 1. 상태 컬럽 바인드 지정  (N, U, D)<br/>
 * 3. 소트 컬럼 자동지정 <br/>
 * <br/>
 * 6. update이벤트 추가 ( 저장후 그리드의 마지막 작업행을 찾기 위함)<br/>
 * 7. 그리드 매핑 데이터셋에 load 이벤트 추가 (그리드의 마지막행 찾기, 조회 건수 업데이트)<br/>
 * 8. 그리드 selection-dispose 이벤트 추가(삭제로 인한, 선택행이 없는 경우... 이전 행 자동 선택하도록(행 추가 -> 삭제시))<br/>
 * 그리드에 대한 공통 로직 및 이벤트 추가 용도<br/>
 *  - appHeader에서 공통 적용됨<br/>
 *  - 사이트별 Customizing 필요<br/>
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid | [#grid]} paGridId 그리드 ID
 * @return void
 */
GridKit.prototype.init = function(app, paGridId){
	if(!(paGridId instanceof Array)) paGridId = [paGridId];
	
	//Index 컬럼 반환
	function getIndexDetailColumn(poGrid){
		var detail = poGrid.detail;
		for(var i=0, len=detail.cellCount; i<len; i++){
			if(detail.getColumn(i).columnType == "rowindex"){
				return detail.getColumn(i);
			}
		}
		return null;
	}
	
	var _app = app;
	var _appKit = this._appKit;
	for (var i=0, len=paGridId.length; i <len; i++) {
		/**@type cpr.controls.Grid */
		var grid = (paGridId[i] instanceof cpr.controls.Grid) ? paGridId[i] : _app.lookup(paGridId[i]);
		if(grid == null) continue;
		
		var notColumnMoveable = ValueUtil.fixBoolean(grid.userAttr("columnMoveFix"));
		var notColumnResiable = ValueUtil.fixBoolean(grid.userAttr("columnResizeFix"));
		var notcolumnSortable = ValueUtil.fixBoolean(grid.userAttr("columnSortFix"));
		if(notColumnMoveable === true) {
			grid.columnMovable = false;
		}
		
		//Resize 컬럼 자동지정
		if(notColumnResiable === true) {
			grid.resizableColumns = "none";
			grid.columnResizable = false;
		}else{
			var indexColumn = getIndexDetailColumn(grid);
			var iColumnIndex = indexColumn ? (indexColumn.colIndex) : -1;
			var resizeColumns = [];
			var dColumn;
			for(var j=0, jlen=grid.detail.cellCount; j<jlen; j++){
				dColumn = grid.detail.getColumn(j);
				if(dColumn.controlType == "button") continue;
				if(dColumn.colIndex > iColumnIndex){
					resizeColumns.push(dColumn.colIndex);
				}
			}
			if(resizeColumns.length){
				grid.resizableColumns = resizeColumns.join(",");
			}
		}
		
		//소트 컬럼 자동지정
		if(notcolumnSortable != true){
			var dColumn, hColumn, headerColumns;
			var fixColSort = "";
			for(var j=0, jlen=grid.detail.cellCount; j<jlen; j++){
				dColumn = grid.detail.getColumn(j);
				if(dColumn.columnType == "checkbox" || dColumn.columnType == "rowindex") continue;
				if(dColumn.columnName == null || dColumn.columnName == "") continue;
				
				fixColSort = dColumn.control ? dColumn.control.userAttr("columnSortFix") : ""; //컬럼 정렬무시옵션
				headerColumns = grid.header.getColumnByColIndex(dColumn.colIndex, dColumn.colSpan);
				if(headerColumns == null || headerColumns.length < 1) continue;
				headerColumns.forEach(function(column){
					if(fixColSort !== "Y"){
						column.sortable = true;
					}
					if(column.targetColumnName == null || column.targetColumnName == "") {
						column.targetColumnName = dColumn.columnName;
					}
				});
			}
		}
		
		//그리드 필드라벨 지정
		grid.fieldLabel = this.getTitle(app, grid.id);
		
		/**@type cpr.data.DataSet*/
		var dataset = grid.dataSet;
		dataset.__gridId = grid.id;
		
		//상태컬럼
		var statusColumn = this.getHeaderStatusColumn(app, grid.id);
		if(statusColumn != null){
			var dColumn = grid.detail.getColumn(statusColumn.cellProp.constraint["cellIndex"]);
			if(dColumn && dColumn.control){
				dColumn.control.bind("value").toExpression("switch(getStateString()){ case 'I' : 'N'  case 'U' : 'U'  case 'D' : 'D'  default : ''}");
				dColumn.control.style.css({"text-align" : "center"});
			}
		}
		
		//헤더 컬럼 Visible 원래값 저장
		var hiddenColumnIndexs = [];
		for(var j=0, jlen=grid.header.cellCount; j<jlen; j++){
			if(grid.header.getColumn(j).visible === false){
				hiddenColumnIndexs.push(j);
			}
		}
		grid.userAttr("originHiddenColumns", hiddenColumnIndexs.join(","));
		
		var pkColumnNames = [];
		//AUTO-SAVE를 위해... tableId, keyColumns 셋팅
		var info = ValueUtil.trim(ValueUtil.fixNull(dataset.info));
		info = info.indexOf("|") != -1 ? ValueUtil.split(info, "|")[0] : info;
		if(info.indexOf("@") != -1){
			var dsInfos = ValueUtil.split(info, "@");
			dataset.__tableid = dsInfos[0];
			dataset.__keyvalue = dsInfos[1];
			pkColumnNames = ValueUtil.split(dsInfos[1], ",");
		}else{
			dataset.__tableid = null;
			dataset.__keyvalue = info;
			pkColumnNames = ValueUtil.split(info, ",");
		}
		
		//그리드 PK컬럼 enable 설정
		if(grid.readOnly != true){
			pkColumnNames.forEach(function(value){
				value = ValueUtil.trim(value);
				if(value != ""){
					var columns = grid.detail.getColumnByName(value);
					if(columns != null && columns.length > 0){
						columns.forEach(function(col){
							if(col.control){
								if(col.control.userAttr("editablePKColumn") !== "Y"){
									col.control.bind("enabled").toExpression("getStateString() == 'I' ? true : false");
								}
								col.control.userAttr("require", "Y");
							}
						});
					}
				}
			});
		}
		
		//그리드에 바인딩된 데이터셋(Dataset)이 로드될 때 처리
		//마지막행 찾기, 조회 건수 업데이트
		dataset.addEventListener("load", function(/* cpr.events.CDataEvent */e){
			var ds = e.control;
			/** @type cpr.controls.Grid */
			var grid = ds.getAppInstance().lookup(ds.__gridId);
			if(grid == null) return;
			
			//대상 그리드가 정렬된 상태라면... 정렬을 푼다.
			if(ds.getSort() != ""){
				ds.clearSort();
			}
			
			//마지막 작업행 찾기
			if(ds.getRowCount() > 0) {
				if(ds.__findRowCondition){
					var row = ds.findFirstRow(ds.__findRowCondition);
					if(row) {
						if(grid.selectionUnit == "cell"){
							grid.focusCell(row.getIndex(), 0);
							grid.moveToCell(row.getIndex(), 0);
						}else{
							_appKit.Grid.selectRow(_app, grid.id, row.getIndex());
						}
					}else{
						grid.selectionUnit == "cell" ? grid.focusCell(0, 0) : _appKit.Grid.selectRow(_app, grid.id, 0);
					}
				}else{
					if(grid.selectionUnit == "cell") grid.focusCell(0, 0); else _appKit.Grid.selectRow(_app, grid.id, 0);
				}
			}
			
			//마지막 작업행 정보 Clear
			ds.__findRowCondition = null;
			
			//그리드 타이틀 영역의 데이터 건수 업데이트
			var titles = _appKit.Group.getAllChildrenByType(_app, "udc.com.comTitle");
			for(var i=0, len=titles.length; i<len; i++){
				if(titles[i] == null) continue;
				if(titles[i].getAppProperty("ctrl") == null) continue;
				if(titles[i].getAppProperty("ctrl").id == grid.id){
					titles[i].setAppProperty("rowCount", ds.getRowCount());
					break;
				}
			}
		});
		
		//마지막 작업행을 찾기위해서...그리드 findRow 설정
		dataset.addEventListener("update", function(/* cpr.events.CDataEvent */e){
			var ds = e.control;
			var rowIndex = e.row.getIndex();
			var row = e.row;
			
			if(ds.__keyvalue){
				var conditions = [];
				ValueUtil.split(ds.__keyvalue, ",").forEach(function(column){
					conditions.push(column + "==" + "'" + ds.getValue(rowIndex, column) + "'");
				});
				ds.__findRowCondition = conditions.length > 0 ? conditions.join(" && ") : null;
			}
		});
		
		dataset.addEventListener("filter", function(e){
			var ds = e.control;
			/** @type cpr.controls.Grid */
			var grid = ds.getAppInstance().lookup(ds.__gridId);
			if(grid != null) {
				var titles = _appKit.Group.getAllChildrenByType(_app, "udc.com.comTitle");
				for(var i=0, len=titles.length; i<len; i++){
					if(titles[i] == null) continue;
					if(titles[i].getAppProperty("ctrl") == null) continue;
					if(titles[i].getAppProperty("ctrl").id == grid.id){
						titles[i].setAppProperty("rowCount", ds.getRowCount());
						break;
					}
				}
			}
		});
		
		//행 삭제로 인한, 선택행이 없는 경우... 이전 행 자동 선택하도록(행 추가 -> 삭제시)
		grid.addEventListener("selection-dispose", function(/* cpr.events.CGridEvent */e){
			var oldSelection = e.oldSelection;
			if (oldSelection != null && oldSelection.length > 0 && oldSelection[0] > -1 && oldSelection[0] < e.control.rowCount) {
				e.control.selectRows(oldSelection[0]);
			}
		});
	}
};

/**
 * 그리드 특정 cell의 값을 변경한다. (detail 영역) 
 * (주의) for문 등으로 대량의 데이터를 setCellValue 호출하는 경우에는 pbEmitEvent값을 false로 주어서, 스크립트 실행시간을 줄여줄 수 있다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 아이디
 * @param {String | Number} psDataColmnId cellIndex 값을 변경하고자 하는 cell의 cell index. (또는 binding된 data column name)
 * @param {any} puValue 변경하고자 하는 값.
 * @param {Number} pnRowIndex? 값을 변경하고자 하는 cell의  행인덱스<br/>
 *                 defalut : 현재 선택된 rowindex
 * @param {Boolean} pbEmitEvent? 이벤트(before-update, update)를 발생시킬지 여부.
 * @return void
 */
GridKit.prototype.setCellValue = function(app, psGridId, psDataColmnId, puValue, pnRowIndex, pbEmitEvent){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	
	grid.setCellValue(rowIndex, psDataColmnId, puValue, pbEmitEvent);
};

/**
 * 그리드 특정 row cell의 값을 반환한다.(detail 영역) 
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @param {String|Number} psDataColmnId cellIndex 값을 가져오고자 하는 cell의 cell index. (또는 binding된 data column name)
 * @param {Number} pnRowIndex? 값을 가져오고자 하는  cell의  행인덱스<br/>
 *                 defalut : 선택된 rowindex
 * @return {any} 해당 cell의 값.
 */
GridKit.prototype.getCellValue = function(app, psGridId, psDataColmnId, pnRowIndex){
	/**@type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	return grid.getCellValue(rowIndex, psDataColmnId);
};

/**
 * 그리드 특정 row cell의 origin 값을 반환한다.(detail 영역) 
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @param {String|Number} psDataColmnId cellIndex 값을 가져오고자 하는 cell의 cell index. (또는 binding된 data column name)
 * @param {Number} pnRowIndex? 값을 가져오고자 하는  cell의  행인덱스<br/>
 *                 defalut : 선택된 rowindex
 * @return {any} 해당 cell의 값.
 */
GridKit.prototype.getOriginCellValue = function(app, psGridId, psDataColmnId, pnRowIndex){
	/**@type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	return grid.dataSet.getOriginalValue(rowIndex, psDataColmnId);
};

/**
 * 그리드 특정 row index의 GridRow객체를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @param {Number} pnRowIndex? 값을 가져오고자 하는  cell의  행인덱스<br/>
 *                 defalut : 선택된 rowindex
 * @return {cpr.controls.provider.GridRow} 해당 index의 GridRow 객체
 */
GridKit.prototype.getDataRow = function(app, psGridId, pnRowIndex){
	/**@type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	return grid.getDataRow(rowIndex);
};

/**
 * 현재 연결된 데이터 구조체에 sort 조건을 변경하고, sort 적용
 * Grid.sort(app, "grd1", "a, b DESC")
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 아이디
 * @param {String} psCondition sort 조건식.
 * @return void
 */
GridKit.prototype.sort = function(app, psGridId, psCondition){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	grid.clearSort();
	grid.sort(psCondition);
	grid.redraw();
};


/**
 * 현재 연결된 데이터 구조체에 filter 조건을 변경하고, filter합니다.<br/>
 * Grid.filter(app, "grd1", "age >= 20")<br/>
 * 	=> "age"컬럼의 값이 20이상인 값만 필터링합니다.<br/>
 * Grid.filter(app, "grd1", "name ^= '김'")<br/>
 * 	=> "name"컬럼의 값이 '김'으로 시작하는 값만 필터링합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 아이디
 * @param {String} psCondition filter 조건식.
 * @return void
 */
GridKit.prototype.filter = function(app, psGridId, psCondition){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var vsFilter = grid.getFilter();
	if(!ValueUtil.isNull(vsFilter)){
		grid.clearFilter();	
	}
	grid.filter(psCondition);
};


/**
 * 그리드의 변경사항 유/무를 반환를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid | String[]} paGridId 그리드 ID 또는 프리폼ID
 * @param {String} psAftMsg? MSG 또는 CRM
 *						<br/>MSG : 변경사항 내역이 없을 경우... '변경된 내역이 없습니다.' alert 메세지 출력
 *  					<br/>CRM : 변경내역이 존재할경우... '변경사항이 반영되지 않았습니다. 계속 하시겠습니까?' confirm 메시지출력 
 * @param {cpr.events.CSelectionEvent} event? selection-change 이벤트 객체
 * @return {Boolean} 데이터 변경 여부
 */
GridKit.prototype.isModified = function(app, paGridId, psAftMsg, event){
	//유효성 체크로 인해서 행선택 변경 발생으로 변경여부 체크가 되는 경우는 SKIP...
	if(event != null && event.control != null && event.control.userAttr("selectionChangeByValidation") === "true"){
		event.control.removeUserAttr("selectionChangeByValidation");
		return false;
	}
	
	if(!(paGridId instanceof Array)){
		paGridId = [paGridId];
	}
	psAftMsg = psAftMsg == null ? "" : psAftMsg;
	
	var modify = false;
	var ctrl = null;
	var dataset = null;
	for (var i=0, len=paGridId.length; i<len; i++) {
		if(paGridId[i] instanceof cpr.controls.Grid) { 
			ctrl = paGridId[i];
		}else{
			ctrl = app.lookup(paGridId[i]);
		}
		
		if(ctrl instanceof cpr.controls.Grid) { 
			dataset = ctrl.dataSet;
		}else{
			dataset = this._appKit.Group.getBindDataSet(app, ctrl);
		}
		
		//사용자 정의 속성에 modify 무시 속성이 있는 경우... SKIP
		if(dataset == null || ctrl.userAttr("ignoreModify") === "Y") continue;
		
		if (dataset.isModified()) {
			modify = true;
			break;
		}
	}
	
	if(modify){
		if(psAftMsg.toUpperCase() == "CRM"){//변경사항이 반영되지 않았습니다. 계속 하시겠습니까? confirm
			var title = ctrl.fieldLabel;
			if(!this._appKit.Msg.confirm("NLS-CRM-M056", [title])) return true;
			else return false;
		}
	}else{
		if(psAftMsg.toUpperCase() == "MSG"){//변경된 내역이 없습니다.
			this._appKit.Msg.notify(app, "NLS-WRN-M007");
		}
	}
	
	return modify;
};

/**
 * 해당 그리드의 체크된 행(Row)이나 선택된 행의 인덱스를 반환한다.(check된 행이 있는 경우, 체크된 행이 우선적으로 반환된다.)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @return {Number[]} 선택된 row index 배열.
 */
GridKit.prototype.getCheckOrSelectedRowIndex = function(app, psGridId){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	if(grid.rowCount < 1) return [];
	
	var checkedIndexs = grid.getCheckRowIndices();
	if(checkedIndexs != null && checkedIndexs.length > 0 ){
		return checkedIndexs;
	}else{
		if(grid.selectionUnit == "cell"){
			var vaSelIndices = grid.getSelectedIndices();
			var rowIndices = [];
			for(var i=0, len=vaSelIndices.length; i<len; i++){
				rowIndices.push(vaSelIndices[i].rowIndex);
			}
			return rowIndices;
		}else{
			return grid.getSelectedRowIndices();
		}
	}
};

/**
 * 해당 그리드의 체크된 행(Row)의 인덱스를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @return {Number[]} 체크된 row index 배열
 */
GridKit.prototype.getCheckedRowIndex = function(app, psGridId){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	
	var checkedIndexs = grid.getCheckRowIndices();
	return (checkedIndexs != null && checkedIndexs.length > 0 ) ? checkedIndexs : [];
};

/**
 * 해당 그리드의 행을 체크 또는 체크 해제한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @param {Number | Number[]} pnRowIndex 체크 또는 체크 해제하고자 하는 행 인덱스 또는 인덱스 배열
 * @param {Boolean} pbChecked 체크 또는 체크 해제여부
 * @return void
 */
GridKit.prototype.setCheckRowIndex = function(app, psGridId, pnRowIndex, pbChecked){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	
	if(!(pnRowIndex instanceof Array)){
		pnRowIndex = [pnRowIndex];
	}
	for(var i=0, len=pnRowIndex.length; i<len; i++){
		grid.setCheckRowIndex(pnRowIndex[i], pbChecked);
	}
};

/**
 * 그리드 내 변경된 특정 행(Row)의 데이터를 원상태로 복구한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 * @param {Number | Number[]} pnRowIndex? 원복하고 싶은 row index (default : 현재 체크 및 선택된 로우)
 * @return {Number[]} revert처리된 행의 인덱스 배열
 */
GridKit.prototype.revertRowData = function(app, psGridId, pnRowIndex){
	/**@type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	
	var selecteIndexs = null;
	if(pnRowIndex == null){
		selecteIndexs = this.getCheckOrSelectedRowIndex(app, psGridId);
	}else{
		selecteIndexs = !(pnRowIndex instanceof Array) ? [pnRowIndex] : pnRowIndex;
	}
	
	if(selecteIndexs.length < 1) return [];
	
	var dataset = grid.dataSet;
	var rowIndex;
	for(var i = selecteIndexs.length - 1; i >= 0; i--) {
		rowIndex = selecteIndexs[i];
		//20210415 체크박스 없는 그리드 초기화할때 에러 발생해서 수정
		if(grid.isCheckedRow(rowIndex)) {
			grid.setCheckRowIndex(rowIndex, false); //체크 해제
		}
		var rowStatus = dataset.getRowState(rowIndex);
		grid.revertRowData(rowIndex); //데이터 원복
		//신규 행이면...
		if(rowStatus == cpr.data.tabledata.RowState.INSERTED) {
			if(rowIndex == grid.getRowCount()){
				if(rowIndex == 0){
					grid.clearSelection();
				}else{
					this.selectRow(app, grid.id, rowIndex-1);
				}
			}else{
				this.selectRow(app, grid.id, rowIndex);
			}
		}
	}
	return selecteIndexs;
};

/**
 * 그리드 내에서 변경된 모든 데이터를 원상태로 복구한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId  그리드 ID
 */
GridKit.prototype.revertAllData = function(app, psGridId){
	/**@type cpr.controls.Grid*/
	var grid = app.lookup(psGridId);
	grid.revertData();
};

/**
 * 소스(Source) 그리드의 선택된 행(Row)의 데이터를 타겟(Target) 그리드로 복사한다.
 * 단, 복사할려는 데이터가 타겟 그리드에 이미 존재하는 경우에는 복사하지 않는다.(중복 복사 방지)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psSrcGridId 그리드ID
 * @param {#grid} psTargetGridId 복사할 그리드 ID
 * @param {Number} pnSrcRowIdx? 소스 그리드 로우 인덱스(default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선))
 * @param {Number} pnTargetRowIdx? 타겟 그리드 로우 인덱스
 *                 
 * @return void
 */
GridKit.prototype.copyToGridData = function(app, psSrcGridId, psTargetGridId, pnSrcRowIndex, pnTargetRowIdx){
	var srcGrid = app.lookup(psSrcGridId);
	var targetGrid = app.lookup(psTargetGridId);
	
	var rowIndexs = pnSrcRowIndex == null ? this.getCheckOrSelectedRowIndex(app, psSrcGridId) :  pnSrcRowIndex;
	if(!(rowIndexs instanceof Array)){
		rowIndexs = [rowIndexs];
	}
	//복사할 ROW가 없으면...SKIP
	if (rowIndexs.length < 1) return;
	
	var srcDataSet = srcGrid.dataSet;
	/**@type cpr.data.DataSet*/
	var tarDataSet = targetGrid.dataSet;
	
	if(pnTargetRowIdx != null && pnTargetRowIdx != undefined){
		var data = srcDataSet.getRowData(rowIndexs[0]);
		for(var key in data) {
			tarDataSet.setValue(pnTargetRowIdx, key, data[key]);
		}
	}else{
		for (var i=0, len=rowIndexs.length; i<len; i++) {
			//신규 후 삭제된 행은 제외
			if(srcDataSet.getRowState(rowIndexs[i]) == cpr.data.tabledata.RowState.INSERTDELETED) continue;
			
			var data = srcDataSet.getRowData(rowIndexs[i]);
			// json 형식의 row의 데이터
			var str = [];
			// 이미 존재하는 row를 찾기 위해 row의 모든 column을 비교하는 조건 제작
			// str = "column1 == 'value1' && column2 == 'value2'..."
			for ( var key in data) {
				str.push(key + " == '" + data[key] + "'");
			}
			str = str.join(" && ");
			// 조건에 맞는 row 탐색
			var findRow = tarDataSet.findFirstRow(str);
			// 조건에 해당하는 row가 없다면 target 그리드에 선택된 row를 추가
			if (findRow == null) {
				tarDataSet.addRowData(data);
			}
		}
	}
	
	targetGrid.redraw();
};

/**
 * 소스(Source) 그리드의 모든 행(Row)의 데이터를 타겟(Target) 그리드로 복사한다.
 * 단, 복사할려는 데이터가 타겟 그리드에 이미 존재하는 경우에는 복사하지 않는다.(중복 복사 방지)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psSrcGridId 그리드ID
 * @param {#grid} psDesGridId 복사할 그리드 ID
 * @return void
 */
GridKit.prototype.copyToAllGridData = function(app, psSrcGridId, psDesGridId){
	var srcGrid = app.lookup(psSrcGridId);
	var indices = [];
	for (var i=0, len=srcGrid.rowCount; i<len; i++) {
		indices.push(i);
	}
	
	this.copyToGridData(app, psSrcGridId, psDesGridId, indices);
};

/**
 * 그리드 작업행을 찾기 위한 조건을 설정한다. 데이터셋에 설정된 PK정보를 기준으로 자동 지정된다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드ID
 * @param {Number} pnRowIndex? 그리드 로우(Row) 인덱스
 * @param {Boolean} pbForce? 기존 로우(Row)에 대한 정보가 있으면 SKIP 여부
 * @return void
 */
GridKit.prototype.markFindRowCondition = function(app, psGridId, pnRowIndex, pbForce){
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var dataset = grid.dataSet;
	
	if(pbForce != undefined && ValueUtil.fixBoolean(pbForce) === true){
		if(!ValueUtil.isNull(dataset.__findRowCondition)) return;
	}
	
	var rowIndex = !ValueUtil.isNull(pnRowIndex) ? pnRowIndex : this.getIndex(app, psGridId);
	
	var condition = [];
	var pkColumnNames = ValueUtil.split(dataset.__keyvalue, ",");
	pkColumnNames.forEach(function(column){
		condition.push(column + "==" + "'" + dataset.getValue(rowIndex, column) + "'");
	});
	dataset.__findRowCondition = condition.length > 0 ? condition.join(" && ") : null;
};

/**
 * 소스(Source) 그리드의 선택된 행(Row)의 데이터를 타겟(Target) 그리드로 이동한다.
 * 데이터 이동 후, 소스(Source) 그리드의 이동된 행(Row)의 상태는 delete모드로 상태값만 변경된다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psSrcGridId 그리드ID
 * @param {#grid} psDesGridId 이동할 그리드 ID
 * @param {Number | Number[]} pnSrcRowIndex? 이동하고자 하는 그리드 로우 인덱스<br/>
 *                            default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선)
 * @return void
 */
GridKit.prototype.moveToGridData = function(app, psSrcGridId, psDesGridId, pnSrcRowIndex){
	/** @type cpr.controls.Grid */
	var srcGrid = app.lookup(psSrcGridId);
	var targetGrid = app.lookup(psDesGridId);
	
	var rowIndexs = pnSrcRowIndex == null ? this.getCheckOrSelectedRowIndex(app, psSrcGridId) :  pnSrcRowIndex;
	if(!(rowIndexs instanceof Array)){
		rowIndexs = [rowIndexs];
	}
	//이동할 ROW가 없으면...SKIP
	if(rowIndexs.length < 1) return;
	
	var srcDataSet = srcGrid.dataSet;
	var tarDataSet = targetGrid.dataSet;
	for(var i=0, len=rowIndexs.length; i<len; i++){
		//신규 후 삭제된 행은 제외
		if(srcDataSet.getRowState(rowIndexs[i]) == cpr.data.tabledata.RowState.INSERTDELETED) continue;
		
		tarDataSet.addRowData(srcDataSet.getRowData(rowIndexs[i]));
	}
	targetGrid.redraw();
	this.deleteRow(app, psSrcGridId, rowIndexs);
};

/**
 * 소스(Source) 그리드의 모든 데이터행(Row)을 타겟(Target) 그리드로 이동한다.
 * 데이터 이동 후, 소스(Source) 그리드의 이동된 행(Row)의 상태는 delete모드로 상태값만 변경된다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psSrcGridId 그리드ID
 * @param {#grid} psDesGridId 이동할 그리드 ID
 */
GridKit.prototype.moveToAllGridData = function(app, psSrcGridId, psDesGridId) {
	var srcGrid = app.lookup(psSrcGridId);

	var indices = [];
	for (var i=0, len=srcGrid.rowCount; i<len; i++) {
		indices.push(i);
	}
	
	this.moveToGridData(app, psSrcGridId, psDesGridId, indices);
};

/**
 * 그리드에서 로우(Row)를 선택해준다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드ID
 * @param {Number | Number[]} pnRowIndex? 포커스를 부여할 Row의 인덱스(default : 현재 행 인덱스)
 * @param {Boolean} pbEmitEvent? 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 * @return void
 */
GridKit.prototype.selectRow = function(app, psGridId, pnRowIndex, pbEmitEvent) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	if(pnRowIndex == null || pnRowIndex == undefined){
		pnRowIndex = this.getIndex(app, psGridId);
	}
	
	grid.selectRows(pnRowIndex, pbEmitEvent);
	if(!(pnRowIndex instanceof Array)){
		grid.focusCell(pnRowIndex, 0);
		grid.moveToCell(pnRowIndex, 0);
	}
};

/**
 * 그리드에서 조건을 만족하는 로우(Row)를 선택해준다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드ID
 * @param {String} psCondition 조건식
 *                 ex)"STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'"
 * 					사용가능수식 !=", "!==", "$=", "%", "&&", "(", "*", "*=", "+", ",", "-", ".", "/", "/*", "//", "<", "<=", "==", "===", ">", ">=", "?", "[", "^=", "||"
 * @param {Number} pnCellIdx? 포커스를 부여할 Cell의 인덱스 또는 컬럼명
 * @param {Boolean} pbEmitEvent? 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 * @return void
 */
GridKit.prototype.selectRowByCondition = function(app, psGridId, psCondition, pnCellIdx, pbEmitEvent) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var row = grid.findFirstRow(psCondition);
	if(row){
		if(pnCellIdx) grid.focusCell(row.getIndex(), pnCellIdx);
		else grid.selectRows(row.getIndex());
	}
};

/**
 * 그리드 행선택 변경 이벤트 발생시, 변경 이전에 선택된 행을 선택해준다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {cpr.events.CSelectionEvent} event 그리드 선택행 변경 이벤트
 * @param {Boolean} pbEmitEvent? 이벤트(before-selection-change, selection-change)를 발생시킬지 여부
 * @return void
 */
GridKit.prototype.selectBeforeRow = function(app, event, pbEmitEvent) {
	/** @type cpr.controls.Grid */
	var grid = event.control;
	var emitEvent = pbEmitEvent === true ? true : false;
	
	var pkValues = this.getRowPKColumnValues(app, grid.id, event.oldSelection[0]);
	var row = grid.findFirstRow(pkValues);
	if(row){
		grid.clearSelection(false);
		if(grid.selectionUnit == "cell"){
			grid.selectCells([{rowIndex:row["rowIndex"], cellIndex:row["cellIndex"]}], emitEvent);
		}else{
			grid.selectRows(row.getIndex(), emitEvent);
		}
	}
};

/**
 * 그리드에 신규 행(Row)을 추가한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String | Number} pnFocusColumnIndex? 행 추가 후에 포커싱할 컬럼의 cell index 또는 컬럼명
 * @param {Number} pnRowIndex? 추가하고자 하는 Row index(defalut : 현재 선택된 로우 Index)
 * @param {Object} poRowData? 추가할 row data. (key: header명, value: value 를 갖는 json data)
 * @return {cpr.controls.provider.GridRow} 추가한 Row의 GridRow 객체.
 */
GridKit.prototype.insertRow = function(app, psGridId, pnFocusColumnIndex, pnRowIndex, poRowData) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	
	var insertedRow = null;
	if(poRowData != null)
		insertedRow = grid.insertRowData(rowIndex, true, poRowData);
	else
		insertedRow = grid.insertRow(rowIndex, true);
	
	var vnInsIdx = insertedRow.getIndex();
	
	if(grid.readOnly){
		grid.selectRows([ vnInsIdx ]);
	}else{
		grid.selectRows([ vnInsIdx ]);
		grid.setEditRowIndex(vnInsIdx, true);
	}
	//포커싱할 컬럼이 전달된 경우
	if(pnFocusColumnIndex){
		grid.focusCell(vnInsIdx, pnFocusColumnIndex);
		//포커싱할 컬럼이 UDC인 경우에...
		if(!ValueUtil.isNumber(pnFocusColumnIndex)){
			for(var i=0,len=grid.detail.cellCount; i<len; i++){
				if(grid.detail.getColumn(i).columnName == pnFocusColumnIndex){
					var ctrl = grid.detail.getColumn(i).control;
					if(ctrl instanceof cpr.controls.UDCBase){
						var empApp = ctrl.getEmbeddedAppInstance();
						ctrl = AppUtil.getUDCBindValueControl(ctrl);
						if(ctrl) empApp.focus(ctrl.id);
					}
					break;
				}
			}
		}
	}else{
		grid.focusCell(vnInsIdx, 0);
	}
	
	return insertedRow;
};


/**
 * 그리드의 선택된 행(Row)를 삭제한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 아이디
 * @param {Number | Number[]} pnRowIndex? 삭제하고자 하는 행 인덱스
 *                 default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선)
 * @return {Number[]} 삭제된 행 (배열)                
 */
GridKit.prototype.deleteRow = function(app, psGridId, pnRowIndex) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	
	var rowIndexs = pnRowIndex == null ? this.getCheckOrSelectedRowIndex(app, psGridId) :  pnRowIndex;
	if(!(rowIndexs instanceof Array)){
		rowIndexs = [rowIndexs];
	}
	//삭제할 행이 없는 경우... 메시지 박스를 보여줌
	if(rowIndexs.length < 1){
		//삭제할 데이터가 없습니다.
		this._appKit.Msg.alert("NLS-INF-M005");
		return false;
	}
	
	var dataset = grid.dataSet;
	for(var i = rowIndexs.length - 1; i >= 0; i--) {
	    var rowIdx = rowIndexs[i];
	    grid.deleteRow(rowIdx);
	    
		if (dataset.getRowState(rowIdx) == cpr.data.tabledata.RowState.INSERTDELETED) {
			grid.revertRowData(rowIdx);
			if(rowIdx == grid.getRowCount()){
				if(rowIdx == 0){
					grid.clearSelection();
				}else{
					grid.selectRows(rowIdx-1);						
				}
			}else{
				grid.selectRows(rowIdx);
			}
		}
	}
	
	return rowIndexs;
};


/**
 * 그리드의 선택된 행(Row)를 작업 취소한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 아이디
 * @param {Number | Number[]} pnRowIndex? 취소하고자 하는 Row index
 *                 default : 체크된 row 나 선택된 row 인덱스를 취득 (check우선)
 * @return {Number[]} 취소된 행 (배열)                
 */
GridKit.prototype.restoreRow = function(app, psGridId, pnRowIndex) {
	return this.revertRowData(app, psGridId, pnRowIndex);
};

/**
 * 특정 row의 상태값을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId
 * @param {Number} pnRowIndex? 상태를 알고자 하는 row index
 * @return {cpr.data.tabledata.RowState} 해당 row index의 상태값.<br>
			<state 종류><br>
			cpr.data.tabledata.RowState.EMPTIED : 삭제된 로우를 커밋 시 삭제된 배열에서 제거하기 위한 임시 상태.<br>
			cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.<br>
			cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.<br>
			cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.<br>
			cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.<br>
			cpr.data.tabledata.RowState.INSERTDELETED : 행이 추가되었다가 삭제된 상태.
 */
GridKit.prototype.getRowState = function(app, psGridId, pnRowIndex) {
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	return grid.getRowState(rowIndex);
};

/**
 * 특정 row의 상태를 변경한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {cpr.data.tabledata.RowState} state 변경할 상태값. <br>
		<state 종류><br>
		cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.<br>
		cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.<br>
		cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.<br>
		cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.<br>
 * @param {Number} pnRowIndex? 변경하고자 하는 row index
 */
GridKit.prototype.setRowState = function(app, psGridId, state, pnRowIndex) {
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	grid.setRowState(rowIndex, state);
};

/**
 * 전체 row의 상태값을 특정 상태(state)로 일괄 업데이트 한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {cpr.data.tabledata.RowState} state 변경할 상태값. <br>
		<state 종류><br>
		cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.<br>
		cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.<br>
		cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.<br>
		cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.<br>
 */
GridKit.prototype.setRowStateAll = function(app, psGridId, state) {
	var grid = app.lookup(psGridId);
	grid.dataSet.setRowStateAll(state);
	grid.redraw();
};

/**
 * 해당 상태 값을 갖는 row를 검색하여 row index 배열을 반환합니다.
 * <pre><code>
 * Grid.getRowStatedIndices("grd1",cpr.data.tabledata.RowState.UPDATED)
 * </code></pre>
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {cpr.data.tabledata.RowState} state 검색할 상태값.<br>
			<state 종류><br>
			cpr.data.tabledata.RowState.UNCHANGED : 변경되지 않은 상태.<br>
			cpr.data.tabledata.RowState.INSERTED : 행이 신규로 추가된 상태.<br>
			cpr.data.tabledata.RowState.UPDATED : 행이 수정된 상태.<br>
			cpr.data.tabledata.RowState.DELETED : 행이 삭제된 상태.<br>
 * @return {Number[]} row index 배열
 */
GridKit.prototype.getRowStatedIndices = function(app, psGridId, state) {
	var grid = app.lookup(psGridId);
	return grid.dataSet.getRowStatedIndices(state);
};

/**
 * 그리드의 로우 갯수 반환
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @return {Number}  로우 카운트 
 */
GridKit.prototype.getRowCount = function(app, psGridId) {
	var grid = app.lookup(psGridId);
	return grid.rowCount;
};

/**
 * 그리드의 현재 선택된 행의 인덱스(Index)를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @return {Number}  로우(Row) 인덱스 
 */
GridKit.prototype.getIndex = function(app, psGridId) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	return grid.selectionUnit != "cell" ? grid.getSelectedRowIndex() : (grid.getSelectedIndices().length > 0 ? grid.getSelectedIndices()[0]["rowIndex"] : -1);
};

/**
 * 그리드의 타이틀명을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @return {String} 타이틀 문자열 
 */
GridKit.prototype.getTitle = function(app, psGridId) {
	var titleCtlrs = this._appKit.Group.getAllChildrenByType(app, "udc.com.comTitle");
	if(titleCtlrs != null){
		for(var i=0, len=titleCtlrs.length; i<len; i++){
			if(titleCtlrs[i].ctrl && titleCtlrs[i].ctrl.id == psGridId){
				return titleCtlrs[i].title;
			}
		}
	}
	return "";
};

/**
 * 그리드의 특정 컬럼에 포커싱을 처리한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psDataColumnId 데이터 컬럼ID
 * @param {Number} pnRowIndex? 행 인덱스
 * @return void
 */
GridKit.prototype.setFocusColumn = function(app, psGridId, psDataColumnId, pnRowIndex) {
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	
	if(grid.readOnly){
		grid.selectRows([ rowIndex ]);
	}else{
		grid.selectRows([ rowIndex ]);
		grid.setEditRowIndex(rowIndex, true);
	}
	grid.focusCell(rowIndex, psDataColumnId);
};

/**
 * 그리드 디테일 columnname로 헤더 컬럼 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드ID
 * @param {String} psColumnName 컬럼명
 * @return {Array} 헤더 컬럼 배열Array(cpr.controls.gridpart.GridColumn)
 */
GridKit.prototype.getHeaderColumn = function(app, psGridId, psColumnName) {
	/** @type cpr.controls.Grid*/
	var grid = app.lookup(psGridId);
    var deatailColumns = grid.detail.getColumnByName(psColumnName);
    
	
	var headerColumns = new Array();
	deatailColumns.forEach(function(dColumn){
//		var vaHeaderColumn = grid.header.getColumnByColIndex(dColumn.colIndex, dColumn.colSpan);
//		vaHeaderColumn.forEach(function(hColumn){
//			headerColumns.push(hColumn);	
//		});

		var vaHeaderCellIndex = grid.getHeaderCellIndices(dColumn.cellIndex);
		vaHeaderCellIndex.forEach(function(each){
			//console.log(grid.header.getColumn(each));
			headerColumns.push(grid.header.getColumn(each));
		});
	});
	
	return headerColumns;
};

/**
 * 그리드 디테일 컬럼의 ColIndex로 헤더 컬럼 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드ID
 * @param {Number} pnColIndex 컬럼 ColIndex
 * @return {Array} 헤더 컬럼 배열Array(cpr.controls.gridpart.GridColumn)
 */
GridKit.prototype.getHeaderColumnByColIdex = function(app, psGridId, pnColIndex) {
	/** @type cpr.controls.Grid*/
	var grid = app.lookup(psGridId);
	var header = grid.header;
	
	var headerColumns = new Array();
	var hColumn;
	for(var i=0, len=header.cellCount; i<len; i++){
		hColumn = header.getColumn(i);
		if(hColumn != null && hColumn.colIndex == pnColIndex){
			headerColumns.push(hColumn);
		}
	}
	
	return headerColumns;
};

/**
 * 그리드 헤더 컬럼의 텍스트(text) 문자열을 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psColumnName 컬럼명
 * @return {String} 헤더 컬럼 text
 */
GridKit.prototype.getHeaderColumnText = function(app, psGridId, psColumnName) {
	var columns = this.getHeaderColumn(app, psGridId, psColumnName);
	return columns.length > 0 ? columns[0].getText() : "";
};

/**
 * 그리드 헤더 중에 STATUS 컬럼 객체를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @return {cpr.controls.gridpart.GridHeaderColumn} 헤더 컬럼
 */
GridKit.prototype.getHeaderStatusColumn = function(app, psGridId) {
	var header = app.lookup(psGridId).header;
	var column = null;
	for(var i=0, len=header.cellCount; i<len; i++){
		column = header.getColumn(i);
		if(column.getText() == "F"){
			return column;
		}
	}
	return null;
};

/**
 * 그리드 내 컬럼을 숨긴다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psColumnName 컬럼 명
 * @return void
 */	 
GridKit.prototype.hideColumn = function(app, psGridId, psColumnName){
 	/** @type cpr.controls.Grid*/
 	var grid = app.lookup(psGridId);
	var columns = this.getHeaderColumn(app, psGridId, psColumnName);
	
//	if(columns.length > 0){
//	 	grid.columnVisible(columns[0].colIndex, false);
//	}
	if(columns) {
		columns.forEach(function(/* cpr.controls.gridpart.GridHeaderColumn */each){
			each.visible = false;
		});
	}
	
};
 
/**
 * 그리드 컬럼을 보이도록 변경한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psColumnName 컬럼명
 * @return void
 */	 
GridKit.prototype.showColumn = function(app, psGridId, psColumnName){
 	/** @type cpr.controls.Grid*/
 	var grid = app.lookup(psGridId);
	var columns = this.getHeaderColumn(app, psGridId, psColumnName);
//	if(columns.length > 0){
//	 	grid.columnVisible(columns[0].colIndex, true);
//	}
	if(columns) {
		columns.forEach(function(/* cpr.controls.gridpart.GridHeaderColumn */each){
			each.visible = true;
		});
	}
	
};

/**
 * 그리드 데이터를 조건에 맞게 필터링한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psCondition 데이터 필터링 조건
 * @return void
 */	
GridKit.prototype.setFilter = function(app, psGridId, psCondition){
 	/** @type cpr.controls.Grid*/
 	var grid = app.lookup(psGridId);
	grid.setFilter(psCondition);
};

/**
 * 그리드 데이터 필터링을 취소한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @return void
 */	
GridKit.prototype.clearFilter = function(app, psGridId){
 	/** @type cpr.controls.Grid*/
 	var grid = app.lookup(psGridId);
	grid.clearFilter();
};

/**
 * 그리드의 데이터셋의 FindRow를 지정한다.
 * 해당 함수 사용시 그리드 조회시 psFindRowCond로 지정된 행이 자동 선택된다. 
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psCondition 조건식 <br/>
 *                 ex)"STUD_DIV_RCD == 'CT101REGU' && SA_NM == '컴퓨터정보과'" <br/>
 * 					사용가능수식 !=", "!==", "$=", "%", "&&", "(", "*", "*=", "+", ",", "-", ".", "/", "/*", "//", "<", "<=", "==", "===", ">", ">=", "?", "[", "^=", "||" 
 * @return void
 */
GridKit.prototype.setFindRowCondition = function(app, psGridId, psCondition){
	var grid = app.lookup(psGridId);
	grid.dataSet.__findRowCondition = psCondition;
};

/**
 * 현재 로우의 key(pk) value를 반환한다. 
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {Number} pnRowIndex (Optional) 취득하고자하는 row index. <br/>
 *                 defalut : 선택된 rowindex
 * @return {String}
 */
GridKit.prototype.getRowPKColumnValues = function(app, psGridId, pnRowIndex){
	/** @type cpr.controls.Grid*/
	var grid = app.lookup(psGridId);
	/**@type cpr.data.DataSet */
	var dataset = grid.dataSet;
	
	var rowIndex = pnRowIndex == null ? this.getIndex(app, psGridId) : pnRowIndex;
	var pkColumnNames = [];
	ValueUtil.split(dataset.__keyvalue, ",").forEach(function(column){
		var value = dataset.getValue(rowIndex, column);
		pkColumnNames.push(column + "==" + "'" + dataset.getValue(rowIndex, column) + "'"); 
	});
	
	return pkColumnNames.length > 0 ? pkColumnNames.join(" && ") : "";
};

/**
 * 그리드 전체 데이터를 엑셀/CSV로 Export 한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#grid} psGridId 그리드 ID
 * @param {String} psFileName export 파일명
 * @param {String} psExcludeColumns? 출력시 제외할 컬럼명(여러개인 경우 콤마로 구분) ex- COL1,COL2,COL3
 * @param {String} psFileType? 파일유형(xls,xlsx,csv)
 * @param {Array} metadata? 메타데이터 (파일 패스워드 지정 등)
 * @param {Boolean} pbExcludeHideColumn? 숨김 컬럼을 Export할 때 제외할지 여부(기본값:true)
 * @param {String} psExCludePart? 출력시 제외영역(ex-footer, gfooter)
 * @return void
 */
GridKit.prototype.exportData = function(app, psGridId, psFileName, psExcludeColumns, psFileType, metadata, pbExcludeHideColumn, psExCludePart){
	var _this = this;
	/** @type cpr.controls.Grid */
	var grid = app.lookup(psGridId);
	var fileType = !ValueUtil.isNull(psFileType) ? psFileType : "xlsx";
	
	pbExcludeHideColumn = ValueUtil.isNull(pbExcludeHideColumn) ? true : pbExcludeHideColumn;
	
	var subExport = new cpr.protocols.Submission();
	subExport.action = "../export/" + psFileName.replace("\/\[\]", "") + "."+fileType;
	subExport.mediaType = "application/json";
	subExport.responseType = "blob";
	var menuInfo = this._appKit.Auth.getMenuInfo(app);
	if(menuInfo != null && menuInfo.size() > 0){
		subExport.addParameter("__AUTH_MENU_KEY", menuInfo.get("MENU_KEY"));
	}
	
	//기본 출력 제외 컬럼(인덱스 컬럼, 선택용 체크 컬럼)
	var dColumn, hColumn;
	var excludeCellIndexs = [];
	for(var i=0, len=grid.detail.cellCount; i<len; i++){
		dColumn = grid.detail.getColumn(i);
		if(dColumn.columnType == "checkbox" || dColumn.columnType == "rowindex"){
			excludeCellIndexs.push(i);
		}else if(dColumn.control instanceof cpr.controls.UDCBase){
			//값 바인딩되지 않은 UDC 컬럼인 경우 제외
			if(dColumn.control == null || dColumn.control.getBindInfo("value") == null){
				excludeCellIndexs.push(i);
			}
		}else{
			//숨김컬럼 제외
			if(pbExcludeHideColumn){
				hColumn = this.getHeaderColumn(app, psGridId, dColumn.columnName);
				if(hColumn != null && hColumn.length > 0){
					if(hColumn[0].visible === false){
						excludeCellIndexs.push(i);
					}
				}
			}
		}
	}
	
	//상태컬럼 제외
	var statusColumn = this.getHeaderStatusColumn(app, grid.id);
	if(statusColumn != null){
		excludeCellIndexs.push(statusColumn.colIndex);
	}
	
	//그외 추가적인 출력 제외 컬럼이 존재하는 경우
	if(!ValueUtil.isNull(psExcludeColumns)){
		var exclColumns = ValueUtil.split(psExcludeColumns, ",");
		var dColumns;
		for(var j=0, jlen=exclColumns.length; j<jlen; j++){
			dColumns = grid.detail.getColumnByName(exclColumns[j]);
			if(dColumns){
				dColumns.forEach(function(column){
					excludeCellIndexs.push(column.cellProp.constraint["cellIndex"]);
				});
			}
		}
	}
	
//	var exportData = grid.getExportData({
//		exceptStyle:false, 
//		freezeHeader:true, 
//		excludeCols:excludeCellIndexs,
//		useFormat :false
//	});
	
	var exportData = grid.getExportData({
		exceptStyle:false, 
		freezeHeader:true, 
		excludeCols:excludeCellIndexs
	});
	
	if (metadata != null) {
		exportData["metadata"] = {};
		if (metadata["password"] != null) {
			exportData["metadata"]["password"] = metadata["password"];
		}
		if (metadata["printPageOrientation"] != null) {
			exportData["metadata"]["printPageOrientation"] = metadata["printPageOrientation"];
		}
	}
	//풋터 또는 그룹풋터 제외하는 경우
	if(!ValueUtil.isNull(psExCludePart)){
		var len = exportData.rowgroups.length;
		for(var i = (len-1); i >= 0; i--) {
			if (exportData.rowgroups[i].region == psExCludePart) {
				exportData.rowgroups.splice(i,1);
			}
		}
	}
	
	//그리드 출력 스타일지정
	for (var i=0, len=exportData.rowgroups.length; i<len; i++) {
		// band별로 원하는 스타일 추가 가능 (header, detail, footer, gheader, gfooter)
		var rowGroup = exportData.rowgroups[i];
		var cellLength = rowGroup.style.length;
		for (var j = 0; j < cellLength; j++) {
			rowGroup.style[j].style["border-bottom-color"] = "black";
			rowGroup.style[j].style["border-bottom-style"] = "solid";
			rowGroup.style[j].style["border-bottom-width"] = "1px";
			rowGroup.style[j].style["border-left-color"] = "black";
			rowGroup.style[j].style["border-left-style"] = "solid";
			rowGroup.style[j].style["border-left-width"] = "1px";
			rowGroup.style[j].style["border-right-color"] = "black";
			rowGroup.style[j].style["border-right-style"] = "solid";
			rowGroup.style[j].style["border-right-width"] = "1px";
			rowGroup.style[j].style["border-top-color"] = "black";
			rowGroup.style[j].style["border-top-style"] = "solid";
			rowGroup.style[j].style["border-top-width"] = "1px";
			
			if (rowGroup.region == "header") {
				rowGroup.style[j].style["background-color"] = "#dddddd";
				rowGroup.style[j].style["text-align"] = "center";
			}
			
//			if (rowGroup.region == "footer") {
//				rowGroup.style[j].style["background-color"] = "#DCE6F2";
//			}
//			
//			if (rowGroup.region == "gfooter") {
//				rowGroup.style[j].style["background-color"] = "#EBF1DE";
//			}
		}
	}
	
	subExport.setRequestObject(exportData);

	subExport.send();
};

/**
 * 데이터셋 컨트롤 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function SubmissionKit(appKit){
	this._appKit = appKit;
};

/**
 * Submission Before Handler<br/>
 * 사이트별 Customizing 필요<br/>
 *  - 시스템 컬럼 수정 필요 (CRT_USER_ID, CRT_PGM_ID, CRT_IP_MAC, UPD_USER_ID, UPD_PGM_ID, UPD_IP_MAC)
 * @param {cpr.events.CSubmissionEvent} e
 */
SubmissionKit.prototype._onBeforeSubmit = function(e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var submit = e.control;
	var _app = submit.getAppInstance();
	
	//메뉴정보(메뉴키) 추가
	var voMenuInfo = this._appKit.Auth.getMenuInfo(_app);
	if(voMenuInfo != null && voMenuInfo.size() > 0){
		var vsMenuKey = voMenuInfo.get("MENU_KEY");
		submit.addParameter("__AUTH_MENU_KEY", vsMenuKey);
		submit.addParameter("__AUTH_MENU_ID", voMenuInfo.get("MENU_ID"));
		submit.addParameter("__AUTH_PGM_ID", voMenuInfo.get("PGM_ID"));
		submit.addParameter("__OPRT_ROLE_ID", voMenuInfo.get("OPRT_ROLE_ID"));
		submit.addParameter("__WRK_ARA_RCD", voMenuInfo.get("WRK_ARA_RCD"));
	}else{
		var voMainApp = this._appKit.getMainApp(_app);
		var vsAppId = _app.app.id;
		var vsOprtRoldId = "";
		var vsWrkAraRcd = "";
		
		if(voMainApp && !ValueUtil.isNull(vsAppId)){
			vsAppId = vsAppId.substring(vsAppId.lastIndexOf("/")  + 1, vsAppId.length);
			try{
				vsAppId = _app.getRootAppInstance().callAppMethod("getMenuKey",vsAppId);
				vsOprtRoldId = _app.getRootAppInstance().callAppMethod("getOprtRoleId",vsAppId);
				vsWrkAraRcd = _app.getRootAppInstance().callAppMethod("getWrkAraRcd",vsAppId);
			}catch(e){
				vsAppId = "";
				vsOprtRoldId = "";
				vsWrkAraRcd = "";
			}
			submit.addParameter("__AUTH_MENU_KEY", vsAppId);
			submit.addParameter("__OPRT_ROLE_ID", vsOprtRoldId);
			submit.addParameter("__WRK_ARA_RCD", vsWrkAraRcd);
		}
	}
	submit.addParameter("default.locale", "CS003KR");
	
	//for.AUTO SAVE
	var vnReqCnt = submit.getRequestDataCount();
	for(var i = 0, len = submit.getRequestDataCount(); i < len; i++){
		var reqeustData = submit.getRequestData(i);
		if(reqeustData.data instanceof cpr.data.DataSet){
			var dataset = reqeustData.data;
			submit.addParameter("_TABLEID_", dataset.id + ":" + dataset.__tableid);
			submit.addParameter(dataset.id + "_KEYVALUE_", dataset.__keyvalue);
		}
	}
	
	submit.setDataRowHandler(function(/** @type cpr.data.Row */ rowdata) {
		var additionalValue = {};
		
		//PK키 original값 추가
		var info = rowdata.getDataSetInfo();
		if(info != null && info != ""){
			info = info.indexOf("@") != -1 ? ValueUtil.split(info, "@")[1].replace("|", ",") : info.replace("|", ",");
			if(dataset && (rowdata.getState() == cpr.data.tabledata.RowState.UPDATED || cpr.data.tabledata.RowState.DELETED)){
				var pkColumns = ValueUtil.split(info, ",");
				pkColumns.some(function(value, idx){
					value = value.replace(/(^\s*)|(\s*$)/g, "")
					if(value == "") return false;
					
					additionalValue[value + "__origin"] = rowdata.getOriginalValue(value);
				});
			}else if(dataset && (rowdata.getState() == cpr.data.tabledata.RowState.INSERTED)){
				var pkColumns = ValueUtil.split(info, ",");
				pkColumns.some(function(value, idx){
					value = value.replace(/(^\s*)|(\s*$)/g, "")
					if(value == "") return false;
					
					additionalValue[value + "__origin"] = rowdata.getValue(value);
				});
			}
		}
		
		return additionalValue;
	});
};

/**
 * @private
 * Submission Receive Handler<br/>
 * 사이트별 Customizing 필요<br/>
 *  - 1. 에러메시지 키 변경 필요
 * @param {cpr.events.CSubmissionEvent} e
 * @param {Boolean} pbSuccess
 */
SubmissionKit.prototype._onSubmitReceive = function(e, pbSuccess) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var submission = e.control;
	var xhr = submission.xhr;
	var contentType = xhr.getResponseHeader("Content-Type");
	if(contentType == null) return true;
	
	contentType = contentType.toLowerCase();
	if (contentType.indexOf(";") > -1) {
		contentType = contentType.substring(0, contentType.indexOf(";"));
	}
	contentType = ValueUtil.trim(contentType);
	if ("application/json" != contentType || "text/tab-separated-values" == contentType) {
		return true;
	}
	
	var response = xhr.responseText;
	var jsonRes = JSON.parse(response);
	var errMsgInfo = jsonRes["ERRMSGINFO"];
	if (errMsgInfo) {
		var vsErrMsg = "";
		try{
			vsErrMsg = eval("\"" +  errMsgInfo.ERRMSG+ "\"");	
		}catch(e){
			vsErrMsg = errMsgInfo.ERRMSG;
		}
		
		alert(vsErrMsg.replace(/\r\n/ig, "\n").replace(/\\n/gi, "\n"));
		var urlContext = top.location.pathname.substring(0, top.location.pathname.indexOf("/",2));
		if(urlContext == "/") urlContext = "";
		//비정상접근 오류, 사용자 세션없는 오류, 중복로그인 오류인 경우
		if("CMN003.CMN@CMN001" == errMsgInfo.ERRCODE || "CMN003.CMN@CMN003" == errMsgInfo.ERRCODE || "CMN003.CMN@CMN062" == errMsgInfo.ERRCODE){
			var rootApp = submission.getAppInstance().getRootAppInstance();
			if(rootApp.__lastConextMovedMessage !== vsErrMsg){
				rootApp.__lastConextMovedMessage = vsErrMsg;
				top.location.href = urlContext+"/logout.jsp";
			}
		}
		return false;
	}
		
	return true;
};

/**
 * 
 * @param {cpr.events.CSubmissionEvent} e
 */
SubmissionKit.prototype._onSubmitLoadProgress = function(e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var submission = e.control;
	var loadmask = this._getLoadMask(submission);
	if(loadmask){
		try {
			if(submission.getResponseDataCount() > 0){
				var rowCnt = submission.getResponseData(0).data.getRowCount();
				loadmask.module.count(rowCnt);
			}
		}catch(ex){}
	}
};

/**
 * 
 * @param {cpr.events.CSubmissionEvent} e
 * @param {Boolean} pbSuccess
 */
SubmissionKit.prototype._onSubmitSuccess = function(e, pbSuccess) {
	return pbSuccess;
};

/**
 * @private
 * Submission Error Handler
 * @param {cpr.events.CSubmissionEvent} e
 */
SubmissionKit.prototype._onSubmitError = function(e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var submission = e.control;
	var _app = submission.getAppInstance();
	//시스템 내부 장애가 발생하였습니다.\n 관리자에게 문의 하시기 바랍니다.
	this._appKit.Msg.alert("ERR-SRV");
	
	var msg = submission.getMetadata("msg");
	if(msg) {
		this._appKit.Msg.notify(_app, msg);
	} else if(e.nativeEvent) {
		this._appKit.Msg.notify(_app, "network : " + e.nativeEvent.type);
	}
	
	return false;
};

/**
 * @private
 * Submission Done Handler<br/>
 * 1. 서버에서 생성된 최신 로우 찾기<br/>
 * 2. 어플리케이션 비즈니스 콜백 메소드 실행<br/>
 * 3. 로딩 마스크 제거<br/>
 * @param {cpr.events.CSubmissionEvent} e
 * @param {Function} poCallbackFunc
 * @param {Boolean} pbSuccess
 * @param {Boolean} pbAppDisable
 */
SubmissionKit.prototype._onSubmitDone = function(e, poCallbackFunc, pbSuccess, pbAppDisable) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var submission = e.control;
	var _app = submission.getAppInstance();
	
	//마지막 행찾기
	var findRowKey = submission.getMetadata("strFindRowKey");
	if(!ValueUtil.isNull(findRowKey)){
		var dsCount = submission.getRequestDataCount();
		var arrFindRowKey = ValueUtil.split(findRowKey, "|");
		var findKey = null;
		for(var i=0, len=arrFindRowKey.length; i<len; i++){
			findKey = ValueUtil.trim(arrFindRowKey[i]);
			
			if(findKey == "") continue;
			var findKeyValues = ValueUtil.split(findKey, ":");
			if(findKeyValues.length == 2){
				for(var j=0; j<dsCount; j++){
					var ds = submission.getRequestData(j).data;
					if(ds.type != "dataset") continue;
					if(ds.id == findKeyValues[0]){
						ds.__findRowCondition = findKeyValues[1];
						break;
					}
				}
			}else{
				for(var j=0; j<dsCount; j++){
					var ds = submission.getRequestData(j).data;
					if(ds.type != "dataset") continue;
					ds.__findRowCondition = findKeyValues[0];
				}
			}
		}
	}
	
	var idx = this._appKit._activeSubmission.indexOf(submission);
	if(idx != -1) {
		this._appKit._activeSubmission.splice(idx, 1);
	}
	
	//실패한 경우.. 커버를 씌움
	if(pbAppDisable === true && pbSuccess != true){
		this._appKit.coverPage(_app);
	}
	
	submission.removeAllFileParameters();
	submission.removeAllParameters();
	submission.removeAllEventListeners();

	//콜백이 존재하는 경우... 콜백함수 호출	
	//콜백을 제일 뒤로 옮김
	if (poCallbackFunc != null && (typeof (poCallbackFunc) == "function")) {
		poCallbackFunc(pbSuccess, e.control);
	}
	
	// submission success에서 다른 submission을 실행했을 경우 loadmask를 내리지 않는다.
	if(this._appKit._activeSubmission.length == 0) {
		// hide loadmask
		try{
			this._appKit.hideLoadMask(_app);
		}catch(ex){}
	}
};

/**
 * @param {cpr.protocols.Submission} poSubmission
 */
SubmissionKit.prototype._getLoadMask = function(poSubmission) {
	var _app = poSubmission.getAppInstance();
	var _container = null;
	if(_app.getHost() && _app.getHost().modal === true){
		_container = _app.getContainer();
	}else{
		_container = _app.getRootAppInstance().getContainer();
	}
	_app = _container.getAppInstance();
	
	return _app.lookup("__loadmask__");
};

/**
 * 해당 서브미션 요청 데이터를 가지고 있는지 체크
 * @private
 * @param {cpr.protocols.Submission} poSubmission - 서브미션 객체
 * @param {String} psDataId - 데이터셋/맵 ID
 */
SubmissionKit.prototype._hasRequestData = function(poSubmission, psDataId){
	for(var i=0, len=poSubmission.getRequestDataCount(); i<len; i++){
		if(poSubmission.getRequestData(i).data.id == psDataId){
			return true;
		}
	}
	return false;
}

/**
 * 해당 서브미션 요청 데이터를 가지고 있는지 체크
 * @private
 * @param {cpr.protocols.Submission} poSubmission - 서브미션 객체
 * @param {String} psDataId - 데이터셋/맵 ID
 */
SubmissionKit.prototype._hasResponseData = function(poSubmission, psDataId){
	for(var i=0, len=poSubmission.getResponseDataCount(); i<len; i++){
		if(poSubmission.getResponseData(i).data.id == psDataId){
			return true;
		}
	}
	return false;
}

/**
 * 전송시 추가로 전달되는 파라미터를 추가합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#submission} psSubmissionId 서브미션 ID
 * @param {String} psParamName 파라미터의 이름
 * @param {String} psValue 파라미터의 값
 * @return void
 */
SubmissionKit.prototype.addParameter = function(app, psSubmissionId, psParamName, psValue){
	/** @type cpr.protocols.Submission */
	var submission = app.lookup(psSubmissionId);
	submission.addParameter(psParamName, psValue);
};

/**
 * 전송시 추가로 전달되는 파라미터를 추가합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#submission} psSubmissionId 서브미션 ID
 * @param {Object | Object[]} paFiles 파일객체 목록
 * @return void
 */
SubmissionKit.prototype.addFileParameter = function(app, psSubmissionId, paFiles){
	/** @type cpr.protocols.Submission */
	var submission = app.lookup(psSubmissionId);
	if(paFiles == null) return;
	if(paFiles instanceof Array){
		paFiles.forEach(function(voFile){
			submission.addFileParameter("exb.fileupload.filelist", voFile);
		});
	}else{
		submission.addFileParameter("exb.fileupload.filelist", paFiles);
	}
};

/**
 * 전송시 추가로 전달되는 파라미터를 추가합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#submission} psSubmissionId 서브미션 ID
 * @param {#datamap | #dataset} psDataId 데이터셋 또는 데이터맵 ID
 * @param {String} psAlias? 요청 데이터의 Alias명(요청데이터 명칭이 다른 경우에만 지정)
 * @param {String} psPayloadType? 요청 데이터의 payloadType (all, modified)
 * @return void
 */
SubmissionKit.prototype.addResponseData = function(app, psSubmissionId, psDataId, psAlias, psPayloadType){
	/** @type cpr.protocols.Submission */
	var submission = app.lookup(psSubmissionId);
	submission.addRequestData(app.lookup(psDataId), psAlias, psPayloadType);
};

/**
 * 전송시 추가로 응답데이터를 추가합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#submission} psSubmissionId 서브미션 ID
 * @param {#datamap | #dataset} psDataId 데이터셋 또는 데이터맵 ID
 * @param {Boolean} pbAdd 데이터셋 옵션 설정된 데이터셋에 데이터를 모두 지우고 추가할지 기존 데이터를 남기고 추가 할지 여부
 * @param {String} psAlias? 응답 데이터의 Alias명(응답데이터 명칭이 다른 경우에만 지정)
 * @return void
 */
SubmissionKit.prototype.addResponseData = function(app, psSubmissionId, psDataId, pbAdd, psAlias){
	/** @type cpr.protocols.Submission */
	var submission = app.lookup(psSubmissionId);
	submission.addResponseData(app.lookup(psDataId), pbAdd, psAlias);
};

/**
 * 서브미션 호출<br/>
 * - 사이트별 Customizing 필요<br/>
 * 1. 공통 코드, 현재일자 서브미션 가능 (옵션)<br/>
 *  - CRUD용 파라메터, 코드조회용 파라메터, 현재일자조회 파라메터 (개발가이드 2.24	공통 서브미션 호출 서비스 참고)
 * 2. 서브미션에 before-submit,  receive, submit-error, submit-success, submit-done 이벤트 부여
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#submission} 	 psSubmitId 서브미션 ID
 * @param {Function} successCallback 서브미션 후 콜백 메소드
 * @param {Boolean}  pbAppEnable? 서브미션 오류 및 exception 발생시 커버페이지를 쒸움
 * @param {String} maskType? 프로그래스바 마스크 타입
 */
SubmissionKit.prototype.send = function(app, psSubmitId, successCallback, pbAppEnable, maskType){
	var submission = app.lookup(psSubmitId);
	
	//서브미션이 정의되어 있지 않거나, 기존 서브미션이 호출중인 경우는 중지...
	if(submission == null || submission.status == "SENDING") return;
	
	//context-path를 고려하여, action URL이 ../로 시작하도록 변경
	if(submission.action.indexOf("/") == 0){
		submission.action = ".."+submission.action;
	}
	
	//어플리케이션 전체에 마스크(Mask)를 씌운다.
	this._appKit.showLoadMask(app, maskType);
	
	if(submission.userAttr("responseType") === "TSV"){
		var loadmask = this._getLoadMask(submission);
		if(loadmask && loadmask.module.count){
			loadmask.module.count(0);
			loadmask.module.show();
		}
	}
	
	var vbSuccess = true;
	var _this = this;
	submission.addEventListenerOnce("before-submit", function(e){
		_this._onBeforeSubmit(e);
	});
	
	if(submission.userAttr("responseType") === "TSV"){
		submission.addEventListener("submit-load-progress", function(e){
			_this._onSubmitLoadProgress(e);
		}); 
	}
	
	submission.addEventListenerOnce("receive", function(e){
		vbSuccess = _this._onSubmitReceive(e);
	}); 
			
	submission.addEventListenerOnce("submit-error", function(e){
		vbSuccess = _this._onSubmitError(e);
	}); 
			
	submission.addEventListenerOnce("submit-success", function(e){
		vbSuccess = _this._onSubmitSuccess(e, vbSuccess);
	});
	
	submission.addEventListenerOnce("submit-done", function(e) {
		_this._onSubmitDone(e, successCallback, vbSuccess, pbAppEnable);
	});
	
	this._appKit._activeSubmission[this._appKit._activeSubmission.length] = submission;
	submission.send();
};


/**
 * HeaderKit(헤더) 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function HeaderKit(appKit){
	this._appKit = appKit;
};

/**
 * 헤더내의 지정한 버튼들을 Enable 속성을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Boolean} pbEnable 컨트롤 활성화 여부
 * @param {String[]} paTypes? 버튼 유형 [신규:NEW, 삭제:DELETE, 취소:RESTORE, 저장:SAVE]<br/>
 *                   paTypes가 Null인 경우에는 버튼 그룹자체에 다한 활성/비활성을 처리한다.
 * @return void
 */
HeaderKit.prototype.setEnableButton = function(app, pbEnable, paTypes) {
	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
	if(header == null || header.length < 1) return false;
	header[0].ready(function(e){
		var _app = e.getEmbeddedAppInstance();
		if(paTypes != null){
			if(!(paTypes instanceof Array)){
				paTypes = [paTypes];
			}
			for(var i=0, len=paTypes.length; i<len; i++){
				if(paTypes[i].toUpperCase() == "NEW"){
					_app.lookup("btnNew").enabled = pbEnable;
				}else if(paTypes[i].toUpperCase() == "DELETE"){
					_app.lookup("btnDelete").enabled = pbEnable;
				}else if(paTypes[i].toUpperCase() == "RESTORE"){
					_app.lookup("btnRestore").enabled = pbEnable;
				}else if(paTypes[i].toUpperCase() == "SAVE"){
					_app.lookup("btnSave").enabled = pbEnable;
				}
			}
		}else{
			_app.lookup("grpButtons").enabled = pbEnable;
		}
	});
};

/**
 * 헤더에 있는 컨트롤의 이벤트를 발생시킨다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psType 버튼 유형 (신규:NEW, 삭제:DELETE, 취소:RESTORE, 저장:SAVE)
 * @param {String} psEventType 이벤트명(ex-click)
 */
HeaderKit.prototype.dispatchEvent = function(app, psType, psEventType){
	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
	if(header != null && header.length > 0){
		header[0].ready(function(e){
			var _app = e.getEmbeddedAppInstance();
			var ctrl = null;
			if(psType.toUpperCase() == "NEW"){
				ctrl = _app.lookup("btnNew");
			}else if(psType.toUpperCase() == "DELETE"){
				ctrl = _app.lookup("btnDelete");
			}else if(psType.toUpperCase() == "RESTORE"){
				ctrl = _app.lookup("btnRestore");
			}else if(psType.toUpperCase() == "SAVE"){
				ctrl = _app.lookup("btnSave");
			}
			if(ctrl){
				ctrl.dispatchEvent(new cpr.events.CEvent(psEventType));
			}
		});
	}
};

/**
 * 헤더의 조회 버튼 클릭 이벤트를 발생시킨다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
HeaderKit.prototype.clickSearch = function(app){
	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
	if(header != null && header.length > 0){
		header[0].ready(function(e){
			var ctrl = e.getEmbeddedAppInstance().lookup("btnSearch");
			if(ctrl){
				ctrl.dispatchEvent(new cpr.events.CEvent("click"));
			}
		});
	}
};


/**
 * 헤더의 조회 버튼 클릭 이벤트를 발생시킨다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
HeaderKit.prototype.clickCollapse = function(app){
	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
	if(header != null && header.length > 0){
		header[0].ready(function(e){
			var ctrl = e.getEmbeddedAppInstance().lookup("btnCollapse");
			if(ctrl){
				ctrl.dispatchEvent(new cpr.events.CEvent("click"));
			}
		});
	}
};


/**
 * ComButtonKit(공통, 버튼) 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function ComButtonKit(appKit){
	this._appKit = appKit;
};

/**
 * 지정한 컨트롤의 Enable 속성을 설정한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 공통버튼 UDC 컨트롤ID
 * @param {Boolean} pbEnable 컨트롤 활성화 여부
 * @param {String[]} paTypes 버튼 유형 [신규:NEW, 삭제:DELETE, 취소:RESTORE]
 * @return void
 */
ComButtonKit.prototype.setEnable = function(app, psCtlId, pbEnable, paTypes) {
	if(!(paTypes instanceof Array)){
		paTypes = [paTypes];
	}
	
	var comButton = app.lookup(psCtlId);
	if(comButton){
		var _app = comButton.getEmbeddedAppInstance();
		for(var i=0, len=paTypes.length; i<len; i++){
			if(paTypes[i].toUpperCase() == "NEW"){
				_app.lookup("btnNew").enabled = pbEnable;
			}else if(paTypes[i].toUpperCase() == "DELETE"){
				_app.lookup("btnDelete").enabled = pbEnable;
			}else if(paTypes[i].toUpperCase() == "RESTORE"){
				_app.lookup("btnRestore").enabled = pbEnable;
			}
		}
	}
};

/**
 * 공통 버튼 UDC 있는 컨트롤의 이벤트를 발생시킨다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol} psCtlId 공통버튼 UDC 컨트롤ID
 * @param {String} psType 버튼 유형 (신규:NEW, 삭제:DELETE, 취소:RESTORE)
 * @param {String} psEventType 이벤트명(ex-click)
 */
ComButtonKit.prototype.dispatchEvent = function(app, psCtlId, psType, psEventType){
	var comButton = app.lookup(psCtlId);
	if(comButton){
		var _app = comButton.getEmbeddedAppInstance();
		var ctrl = null;
		if(psType.toUpperCase() == "NEW"){
			ctrl = _app.lookup("btnNew");
		}else if(psType.toUpperCase() == "DELETE"){
			ctrl = _app.lookup("btnDelete");
		}else if(psType.toUpperCase() == "RESTORE"){
			ctrl = _app.lookup("btnRestore");
		}
		if(ctrl){
			ctrl.dispatchEvent(new cpr.events.CEvent(psEventType));
		}
	}
};


/**
 * Report 연동 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function ReportKit(appKit){

	this._appKit = appKit;
};

/**
 * 보고서를  초기화 한다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {#embeddedpage} psEmbPageId - 리포트 Embeded 페이지 컨트롤ID
 * @return void
 */
ReportKit.prototype.init = function(app, psEmbPageId) {
	/**@type cpr.controls.EmbeddedPage */
    var embPage = app.lookup(psEmbPageId);
    var url = app.getRootAppInstance().callAppMethod("getReportServerUrl");
    embPage.src = url+"/blankReport.jsp";
};

/**
 * 보고서를 호출한다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {#embeddedpage} psEmbPageId - 리포트 Embeded 페이지 컨트롤ID
 * @param {String} psFilePath - 보고서 파일경로
 * @param {any} poParam - 보고서 호출 파라메터
 * @param {any} poViewOption? 보고서 뷰어 옵션(툴바 숨김, 저장 버튼제어, 뷰 스케일등)
 * @return void
 */
ReportKit.prototype.open = function(app, psEmbPageId, psFilePath, poParam, poViewOption) {
	/**@type cpr.controls.EmbeddedPage */
	
    var vcEmbPage = app.lookup(psEmbPageId);
    
    var voMenuInfo = this._appKit.Auth.getMenuInfo(app);
    
    //요청 서브미션
	var voSumit = app.lookup("subCommReport");
	if(voSumit == null){
		voSumit 			= new cpr.protocols.Submission("subCommReport");
		//voSumit.action 		= "/CmnReport/print.do";
		voSumit.action 		= "/cmn/ExtCmnReportViewer/reportInfo.do";
		voSumit.async		= true;
		voSumit.mediaType 	= "application/x-www-form-urlencoded";
		voSumit.method 		= "post";
		voSumit.responseType = "text";
		app.register(voSumit);
	}
	
	var _app = app;
	var _this = this;
	var _util = this._appKit;
	var vsLogMenuId = voMenuInfo.get("MENU_ID");
	var vsLogPgmId = voMenuInfo.get("PGM_ID");
	//개인정보가 포함된 자료에 대한 다운로드 사유입력 팝업 호출 콜백함수
	var voFileDownloadFunc = function(totalPageCnt){
		var initValue = {
			strFileNm: ((poViewOption && !ValueUtil.isNull(poViewOption['EXPORT_NM'])) ? poViewOption['EXPORT_NM'] : poParam['TITLE'])+".xlsx", 
			strPsnItems: "",
			strDownDiv: "출력물 자료",
			strDataCnt: totalPageCnt,
			strMenuId: vsLogMenuId,
			strPgmId: vsLogPgmId
		};
		_util.Dialog.open(app, "app/cmn/cmnPPsnAccessLog", 500, 300, function(/**@type cpr.events.CUIEvent */e){
			/**@type cpr.controls.Dialog*/
			var dialog = e.control;
			var returnValue = dialog.returnValue;
			if(returnValue == null || returnValue == ""){
				alert("개인정보가 들어가있는 자료에 대한 다운로드 사유가 입력되지 않았습니다.\n다시 팝업을 호출하여 자료 다운로드 사유 및 자료 파일에 대한 비밀번호를 입력하시기 바랍니다.");
			}
		}, initValue).then(function(returnValue){
			_app.lookup(psEmbPageId).callPageMethod("setFilePasswd", [returnValue.password]);
			return true;
		});
		return false;
	}
	
	//프로그램관리에서 개인정보포함여부가 체크된 출력물이면, 무조건 자료 다운로드 사유를 입력하도록 한다.
	var vsForceDownloadLogging = "false";
	if(voMenuInfo.get("PSNL_INFO_INC_YN") == "Y"){
		vsForceDownloadLogging = "true";
	}
	
	this._appKit.Submit.send(app, "subCommReport", function(pbSuccess){
		if(pbSuccess) {
			
			poParam.SECURITY_TEXT = voSumit.getMetadata("SECURITY_TEXT");
			poParam.PRT_INFO = voSumit.getMetadata("PRINT_INFO");

			if(voMenuInfo.get("PRT_INFO_HDDN_YN") == "Y"){
				poParam.PRT_INFO = "";
			}
			
			poParam._AUTH_USER_ID = voSumit.getMetadata("AUTH_USER_ID");
			poParam._AUTH_DEPT_CD = voSumit.getMetadata("AUTH_DEPT_CD");
			poParam._AUTH_MENU_ID = voSumit.getMetadata("AUTH_MENU_ID");
			poParam._AUTH_PGM_ID = voSumit.getMetadata("AUTH_PGM_ID");
			poParam._RESNO_VIEW_YN = voSumit.getMetadata("RESNO_VIEW_YN");
//			poParam._RESNO_VIEW_YN = voSumit.getMetadata("RESNO_VIEW_YN");
	
			var vsToolbarVisible = (poViewOption && !ValueUtil.isNull(poViewOption['TOOLBAR_VISIBLE'])) ? poViewOption['TOOLBAR_VISIBLE'] : 'true';
			var vsSaveFileTypes = (poViewOption && !ValueUtil.isNull(poViewOption['SAVEFILE_TYPES'])) ? poViewOption['SAVEFILE_TYPES'] : 'ALL';
			var vsScaleRatio = (poViewOption && !ValueUtil.isNull(poViewOption['SCALE_RATIO'])) ? poViewOption['SCALE_RATIO'] : '100';
			var vsExportFileNm = (poViewOption && !ValueUtil.isNull(poViewOption['EXPORT_NM'])) ? poViewOption['EXPORT_NM'] : poParam['TITLE'];
			var vsDirectPrint = (poViewOption && !ValueUtil.isNull(poViewOption['DIRECT_PRINT'])) ? poViewOption['DIRECT_PRINT'] : 'false';
			
			//다운로드 여부
			//poViewOption이 main.clx의 MenuInfo보다 우선임
			//수강신청의 경우 main.clx 의 mdi 컨트롤러에서 불러오는 화면이 아니기에 따로 컨트롤할수있도록 추가
			if(poViewOption != undefined && poViewOption["DOWNLOAD_YN"] != undefined){
				var vsSaveButtonVisible = poViewOption["DOWNLOAD_YN"] == "Y" ? 'true' : 'false';
			}else{
				var vsSaveButtonVisible = voMenuInfo.get("DOWNLOAD_YN") == "Y" ? 'true' : 'false';				
			}
			//출력여부
			if(poViewOption != undefined && poViewOption["PRT_YN"] != undefined){
				var vsPrintButtonVisible = poViewOption["PRT_YN"] == "Y" ? 'true' : 'false'
			}else{
				var vsPrintButtonVisible = voMenuInfo.get("PRT_YN") == "Y" ? 'true' : 'false';				
			}		
		
			var voParamObj = {
				filePath : psFilePath,
				exportFileNm : !ValueUtil.isNull(vsExportFileNm) ? vsExportFileNm : "제목없음",
				toolbarVisible : vsToolbarVisible,
				saveFileTypes : vsSaveFileTypes,
				saveButtonVisible : vsSaveButtonVisible,
				printButtonVisible : vsPrintButtonVisible,
				scaleRatio : vsScaleRatio,
				directPrint : vsDirectPrint,
				forceDownloadLog: vsForceDownloadLogging,
				logDownloadCallFunc: voFileDownloadFunc,
				params : poParam
			};
			window.returnValue = voParamObj;
			
		    vcEmbPage.src = "../jsp/reportViewer.jsp?p="+(new Date().getMilliseconds());
		    //조회되었습니다.
		    _this._appKit.Msg.notify(_app, "NLS-INF-M024");
		}
	});	
};

/**
 * 보고서를 팝업으로 호출한다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {String} psFilePath - 보고서 파일경로
 * @param {any} poParam - 보고서 호출 파라메터
 * @param {any} poViewOption? 보고서 뷰어 옵션(툴바 숨김, 저장 버튼제어, 뷰 스케일등)
 * @param {Number} pnWidth? 팝업 Width 사이즈
 * @param {Number} pnHeight? 팝업 Height 사이즈
 * @return void
 */
ReportKit.prototype.openPopup = function(app, psFilePath, poParam, poViewOption, pnWidth, pnHeight) {
	var voViewOption = poViewOption;
	if(voViewOption != null && voViewOption != undefined){
		if(ValueUtil.isNull(poViewOption['SCALE_RATIO'])){
			voViewOption['SCALE_RATIO'] = "PageWidth";
		}
	}else{
		voViewOption = {"SCALE_RATIO" : "PageWidth"};
	}
	
	//초기 파라메터 셋팅
	var initValue = {
		strFilePath: psFilePath, 
		objParam: poParam,
		objViewOption: voViewOption
	};
	
	var vnWidth = (pnWidth != null && pnWidth != undefined) ? pnWidth : 1000;
	var vnHeight = (pnHeight != null && pnHeight != undefined) ? pnHeight : 600;
	
	vnWidth = vnWidth > window.innerWidth ? window.innerWidth - 20 : vnWidth;
	vnHeight = vnHeight > window.innerHeight ? window.innerHeight - 20 : vnHeight;

	//보고서 팝업을 호출한다.
	this._appKit.Dialog.open(app, "app/cmn/cmnPReport", vnWidth, vnHeight, null, initValue, {resizable:true, headerMax:true});
};

/**
 * 보고서를 PDF로 출력한다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {#embeddedpage} psEmbPageId - 리포트 Embeded 페이지 컨트롤ID
 * @param {String} psFilePath - 보고서 파일경로
 * @param {any} poParam - 보고서 호출 파라메터
 * @param {any} poViewOption? 보고서 뷰어 옵션(출력파일명)
 * @return void
 */
ReportKit.prototype.exportFile = function(app, psEmbPageId, psFilePath, poParam, poViewOption) {
    /**@type cpr.controls.EmbeddedPage */
    var vcEmbPage = app.lookup(psEmbPageId);
    
    var voMenuInfo = this._appKit.Auth.getMenuInfo(app);
    
    //요청 서브미션
    var voSumit = app.lookup("subCommReport");
    if(voSumit == null){
        voSumit             = new cpr.protocols.Submission("subCommReport");
        voSumit.action      = "/CmnReport/print.do";
        voSumit.async       = true;
        voSumit.mediaType   = "application/x-www-form-urlencoded";
        voSumit.method      = "post";
        voSumit.responseType = "text";
        app.register(voSumit);
    }
    
    var _app = app;
    var _this = this;
    this._appKit.Submit.send(app, "subCommReport", function(pbSuccess){
        if(pbSuccess) {
            poParam.SECURITY_TEXT = voSumit.getMetadata("SECURITY_TEXT");
            poParam.PRT_INFO = voSumit.getMetadata("PRINT_INFO");
            poParam._RESNO_VIEW_YN = voSumit.getMetadata("RESNO_VIEW_YN");
    
            var vsExportFileNm = (poViewOption && !ValueUtil.isNull(poViewOption['EXPORT_NM'])) ? poViewOption['EXPORT_NM'] : poParam['TITLE'];
            
            var voParamObj = {
                filePath : psFilePath,
                exportFileNm : vsExportFileNm,
                params : poParam
            };
            window.returnValue = voParamObj;
            vcEmbPage.src = "/jsp/reportExport.jsp?p="+(new Date().getMilliseconds());
        }
    });
};

/**
 * 보고서 PDF를 ZIP으로 출력한다. poViewOption을 통해 Server에 저장만 할 수 있다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {#embeddedpage} psEmbPageId - 리포트 Embeded 페이지 컨트롤ID
 * @param {String} psFilePath - 보고서 파일경로
 * @param {any} poParam - 보고서 호출 파라메터
 * @param {String} psFileName - ZIP파일 명
 * @param {String} psExportFileSave     - PDF File을 Server에 저장할지의 유무 .
 * @param {String} psExportFileSavePath - PDF File을 Server에 저장할 경우 Path설정. 
 * @return void
 */
ReportKit.prototype.exportFileZip = function(app, psEmbPageId, psFilePath, paList, psFileName, psExportFileSave, psExportFileSavePath) {
    /**@type cpr.controls.EmbeddedPage */
    var vcEmbPage = app.lookup(psEmbPageId);
    
    var voMenuInfo = this._appKit.Auth.getMenuInfo(app);
    
    //요청 서브미션
    var voSumit = app.lookup("subCommReport");
    if(voSumit == null){
        voSumit             = new cpr.protocols.Submission("subCommReport");
        voSumit.action      = "/CmnReport/print.do";
        voSumit.async       = true;
        voSumit.mediaType   = "application/x-www-form-urlencoded";
        voSumit.method      = "post";
        voSumit.responseType = "text";
        app.register(voSumit);
    }
    
    var _app = app;
    var _this = this;
    var voParam;
    this._appKit.Submit.send(app, "subCommReport", function(pbSuccess){
        if(pbSuccess) {
        	voParam = {
	            SECURITY_TEXT : voSumit.getMetadata("SECURITY_TEXT"),
	            PRT_INFO : voSumit.getMetadata("PRINT_INFO"),
	            _RESNO_VIEW_YN : voSumit.getMetadata("RESNO_VIEW_YN"),
	            LIST : paList
        	}
    
            var vsExportFileNm = ValueUtil.fixNull(psFileName);
            
            var voParamObj = {
                filePath : psFilePath,
                exportFileNm : vsExportFileNm,
                params : voParam,
                option : "zip"
            };
            if(psExportFileSave){
	            voParamObj = {
	                filePath : psFilePath,
	                exportFileSave : psExportFileSave,
	                exportFileSavePath : psExportFileSavePath,
	                params : voParam,
	                option : "zip"
	            };
            }

            window.returnValue = voParamObj;
            vcEmbPage.src = "/jsp/reportExport.jsp?p="+(new Date().getMilliseconds());
        }
    });
};

/**
 * 보고서를 닫는다.
 * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
 * @param {#embeddedpage} psEmbPageId - 리포트 Embeded 페이지 컨트롤ID
 * @return void
 */
ReportKit.prototype.close = function(app, psEmbPageId) {
	/**@type cpr.controls.EmbeddedPage */
    var embPage = app.lookup(psEmbPageId);
    var url = app.getRootAppInstance().callAppMethod("getReportServerUrl");
    embPage.src = url+"/blankReport.jsp";
};

/**
 * ElecDocKit 전자결재 유틸
 * @constructor
 * @param {common.AppKit} appKit
 */
function ElecDocKit(appKit){
	this._appKit = appKit;
};

/**
 * 전자결재 상신 팝업창을 띄운다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psInterfaceId 인터페이스ID
 * @param {Number} pnWidth (Optional) 창 Width크기
 * @param {Number} pnHeight (Optional) 창 Height크기
 * @param {Number} pnLeft (Optional) 창 Left위치
 * @param {Number} pnTop (Optional) 창 Top위치
 * @return void
 */
ElecDocKit.prototype.open = function(app, psInterfaceId, psUserId, pnWidth, pnHeight, pnLeft, pnTop) {
		
	var vnWidth = !ValueUtil.isNull(pnWidth) ? pnWidth : 850;
	var vnHeight = !ValueUtil.isNull(pnHeight) ? pnHeight : 900;
	
	var vnLeft = (pnLeft != undefined && pnLeft != null) ? pnLeft : ((document.body.offsetWidth/2) - (vnWidth/2));
	var vnTop = (pnTop != undefined && pnTop != null) ? pnTop : ((document.body.offsetHeight/2) - (vnHeight/2));
	
	window.open("http://210.97.144.43:9595/xclickr3_swc/cefAppLegacyDispatcher.jsp?sabun="+psUserId+"&interfaceId="+psInterfaceId,
			    "EleApprovalPopup",
			    "left="+vnLeft+"px, top="+vnTop+"px, width="+vnWidth+"px, height="+vnHeight+"px");
			    
};

/**
 * 전자결재 문서를 팝업창으로 띄운다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psAprvDocId 결제문서ID
 * @param {Number} pnWidth (Optional) 창 Width크기
 * @param {Number} pnHeight (Optional) 창 Height크기
 * @param {Number} pnLeft (Optional) 창 Left위치
 * @param {Number} pnTop (Optional) 창 Top위치
 * @return void
 */
ElecDocKit.prototype.view = function(app, psAprvDocId, pnWidth, pnHeight, pnLeft, pnTop) {
	var vnWidth = !ValueUtil.isNull(pnWidth) ? pnWidth : 850;
	var vnHeight = !ValueUtil.isNull(pnHeight) ? pnHeight : 900;
	var vnLeft = (pnLeft != undefined && pnLeft != null) ? pnLeft : ((document.body.offsetWidth/2) - (vnWidth/2));
	var vnTop = (pnTop != undefined && pnTop != null) ? pnTop : ((document.body.offsetHeight/2) - (vnHeight/2));
	
	window.open("/CmnElec/listView.do?interface_id="+psAprvDocId,
			    "EleApprovalPopup",
			    "left="+vnLeft+"px, top="+vnTop+"px, width="+vnWidth+"px, height="+vnHeight+"px");
};

/**
 * UDC(UDC) 유틸
 * @constructor
 * @param {common.module} appKit
 */
function UdcKit(appKit){
	this._appKit = appKit;
};

/**
 * 부서검색 UDC를 콤보박스로 이용할 때 변경된 기준일자를 세팅하는 함수
 * @param {cpr.core.AppInstance} - app 앱 인스턴스 객체
 * @param {String} psUdcId - UDC의 ID
 * @param {String} psKeyDate - 새로 세팅할 변경일자
 */
UdcKit.prototype.setKeyDateToDeptUdcCombo = function(app, psUdcId, psKeyDate) {
	/** @type cpr.controls.UDCBase */
	var tempUDC = app.lookup(psUdcId);
	var oldValue = tempUDC.getAppProperty("iKeyDate");
	
	var e = new cpr.events.CPropertyChangeEvent("iKeyDate", oldValue, psKeyDate);
	tempUDC.getEmbeddedAppInstance().dispatchEvent(e);
}

/**
 * 그룹웨어 전자결재 상신이후에 메인화면을 Refresh하기 위해 호출된다.
 * 메인화면 재조회 처리함
 */
globals.doRefreshMainView = function(){
	var rootApp = cpr.core.Platform.INSTANCE.lookup("app/com/inc/main").getInstances()[0];
	var mainMdi = rootApp.lookup("mdiCn");
	var item = mainMdi.getSelectedTabItem(); //현재 선택된 화면
	if(item && item.content){
		/**@type cpr.core.AppInstance */
		var iApp = item.content.getEmbeddedAppInstance();
		var header = iApp.getContainer().getAllRecursiveChildren().filter(function(ctrl){
			return ctrl instanceof cpr.controls.UDCBase && ctrl instanceof udc.com.appHeader;
		});
		
		if(header != null && header.length > 0){
			var vcCtrl = header[0].getEmbeddedAppInstance().lookup("btnSearch");
			if(vcCtrl){
				vcCtrl.dispatchEvent(new cpr.events.CEvent("click"));
			}
		}
	}
};


/**
 * 그룹웨어 전자결재 상신이후에 메인화면을 Refresh하기 위해 호출된다.
 * 메인화면 재조회 처리함
 */
globals.extAacCbillMaster = {
	"height" : 670,
	"width"  : 1260
};


exports.MsgKit = MsgKit;
exports.DialogKit = DialogKit;
exports.GroupKit = GroupKit;
exports.FreeFormKit = FreeFormKit;
exports.SelectKit = SelectKit;
exports.TreeKit = TreeKit;
exports.TabKit = TabKit;
exports.EmbeddedAppKit = EmbeddedAppKit;
exports.MDIKit = MDIKit;
exports.ControlKit = ControlKit;
exports.DataSetKit = DataSetKit;
exports.DataMapKit = DataMapKit;
exports.GridKit = GridKit;
exports.SubmissionKit = SubmissionKit;
exports.HeaderKit = HeaderKit;
exports.ComButtonKit = ComButtonKit;
exports.ComButtonKit = ComButtonKit;
exports.ReportKit = ReportKit;
exports.ElecDocKit = ElecDocKit;
exports.UdcKit = UdcKit;