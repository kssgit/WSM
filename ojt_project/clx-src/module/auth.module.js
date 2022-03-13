
// 의존 모듈 선언.
module.depends("module/common");

/**
 * 권한 유틸
 * @constructor
 * @param {common.module} appKit
 */
function AppAuthKit(appKit){
	this._appKit = appKit;
};

/**
 * 로그인 사용자의 정보를 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psUserInfoType? 사용자정보 TYPE 세션정보 참고<br/>
 * ID			오브젝트ID(학생ID, 교직원ID)
 * USER_ID		사용자ID
 * USER_NM		사용자명
 * USER_DIV_CD	사용자구분코드
 * SYS_MGR_YN	관리자여부
 * ASGN_DEPT_CD  소속부서코드
 * ASGN_DEPT_NM  소속부서명
 * ASGN_DEPT_DIV_RCD 소속부서구분코드
 * LANG	     		언어
 * @return {String | cpr.data.DataMap} psUserInfoType 미지정시 Map 형태의 사용자 정보 리턴 
 */
AppAuthKit.prototype.getUserInfo = function(app, psUserInfoType) {
	var rootApp = app.getRootAppInstance();
	if(rootApp.hasAppMethod("getUserInfo")){
		if(ValueUtil.isNull(psUserInfoType)){
			return rootApp.callAppMethod("getUserInfo");
		}else{
			return rootApp.callAppMethod("getUserInfo", [psUserInfoType]);
		}
	}
};

/**
 * 메뉴 정보 취득
 * psMenuType 생략시 메뉴 정보 MAP 리턴
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psMenuType?  메뉴 정보 TYPE
 * @return {cpr.utils.ObjectMap | String} 
 * 			getMenuInfo.get("OPRT_ROLE_ID");		//업무역할ID
 *			getMenuInfo.get("MENU_ID");				//메뉴ID
 *			getMenuInfo.get("PGM_ID");				//프로그램ID
 *			getMenuInfo.get("MENU_NM");				//메뉴명
 *			getMenuInfo.get("MENU_AUTH_DIV_RCD"); 	//메뉴권한구분코드
 *			getMenuInfo.get("AUTH_RNG_RCD"); 		//권한범위코드
 *			getMenuInfo.get("UNIT_SYSTEM_RCD");		//단위시스템코드
 *			getMenuInfo.get("CALL_PAGE");			//호출페이지
 * 			getMenuInfo.get("CTRL_VAR_01");			//파라미터1
 * 			getMenuInfo.get("CTRL_VAR_02");			//파라미터2
 * 			getMenuInfo.get("CTRL_VAR_03");			//파라미터3
 * 			getMenuInfo.get("CTRL_VAR_04");			//파라미터4
 */
AppAuthKit.prototype.getMenuInfo = function(app, psMenuType){
	var voMap = new cpr.utils.ObjectMap();
	
	var _mainApp = this._appKit.getMainApp(app);
	var vsData = null;
	if(_mainApp.__menuInfo != null){
		vsData = _mainApp.__menuInfo;
	}else{
		var rootApp = app.getRootAppInstance();
		/** @type cpr.controls.MDIFolder */
		var vcMdi = rootApp.lookup("mdiCn");
		if(vcMdi){
			var vcTabItem = vcMdi.getSelectedTabItem();
			if(vcTabItem != null){
				vsData = vcTabItem.userAttr("__menuInfo");
				_mainApp.__menuInfo = vsData;
			}
		}
	}
	if(!ValueUtil.isNull(vsData)){
		var voData = JSON.parse(vsData);
		if(psMenuType != null){
			return ValueUtil.fixNull(voData[psMenuType]);
		}else{
			for(var key in voData){
				voMap.put(key, ValueUtil.fixNull(voData[key]));
			}
			return voMap;
		}
	}else{
		return voMap;
	}
};

/**
 * 해당 화면이 개인권한 화면인지 여부(true/false) 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
AppAuthKit.prototype.isPrivateAuth = function(app){
	var vsAuthRngRcd = this._appKit.Auth.getMenuInfo(app, "AUTH_RNG_RCD");
	return vsAuthRngRcd == "CC00104" ? true : false;
};

/**
 * 해당 화면이 소속부서권한 화면인지 여부(true/false) 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
AppAuthKit.prototype.isAsgnDeptAuth = function(app){
	var vsAuthRngRcd = this._appKit.Auth.getMenuInfo(app, "AUTH_RNG_RCD");
	return vsAuthRngRcd == "CC00105" ? true : false;
};

/**
 * 화면 권한에 따른 컨트롤 제어를 수행한다.
 *  - 조회권한인 경우 입력 권한 컨트롤 비활성화 및 안보임 처리
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psMenuAuthDivRcd - 사용권한구분[CC007] 모든권한(CC00701), 입력수정권한(CC00703), 수정권한(CC00704), 조회권한(CC00702)
 * @param {String} psSearchBoxId - (Optional) 검색조건 그룹ID
 */
AppAuthKit.prototype.applyAuthForCtrls = function(app, psMenuAuthDivRcd, psSearchBoxId){
	if(app.isRootAppInstance()) return;
//	var getParameterByName = function(name, url) {
//	    name = name.replace(/[\[\]]/g, "\\$&");
//	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
//	    var results = regex.exec(url);
//	    return results == null ? "" : results[2];
//	}
//	//새창으로 띄웠는지 여부 Flag, 새창으로 띄운 경우... 무조건 조회용임
//	var vsFlag = getParameterByName("flag", top.location.href); 
	
	var vaSearchBoxIds = ValueUtil.split((!ValueUtil.isNull(psSearchBoxId) ? psSearchBoxId : ""), ",");
	
	var vaTargetCtrls = new Array();
	var container = app.getContainer();
	function getChildRecursive(poContainer){
	    var vaChildCtrls = poContainer ? poContainer.getAllRecursiveChildren() : container.getAllRecursiveChildren();
	    for (var i=0, len=vaChildCtrls.length; i<len; i++) {
	        if (vaChildCtrls[i].type == "udc.com.comButton"
	        	|| vaChildCtrls[i].type == "udc.com.comButtonSave"
	        	|| vaChildCtrls[i].type == "grid"
	        	|| vaChildCtrls[i].type == "button"
	        	|| vaChildCtrls[i].type == "container" && vaSearchBoxIds.indexOf(vaChildCtrls[i].id) == -1 && (vaChildCtrls[i].getLayout() instanceof cpr.controls.layouts.FormLayout)) {
	        	vaTargetCtrls.push(vaChildCtrls[i]);
	        }else if (vaChildCtrls[i] instanceof cpr.controls.Container ) {
	        	getChildRecursive(vaChildCtrls[i]);
	        }
	    }
	    vaChildCtrls = null;
	}
	
	//하위의 대상 컨트롤들을 모두 취합
	getChildRecursive(container);
	
	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
	if(header != null && header.length > 0){
		var vcCtrl = header[0].getEmbeddedAppInstance().lookup("grpButtons");
		if(psMenuAuthDivRcd == "CC00703") {
			if(vcCtrl){
				vcCtrl.getLayout().setColumnVisible(1, false);
			}
		} else if(psMenuAuthDivRcd == "CC00704"){
			if(vcCtrl){
				vcCtrl.getLayout().setColumnVisible(0, false);
				vcCtrl.getLayout().setColumnVisible(1, false);
			}
		} else if(psMenuAuthDivRcd == "CC00702") {
			if(vcCtrl){
				vcCtrl.visible = false;
			}
		}
	}
	
	vaTargetCtrls.forEach(function(ctrl){
		if(psMenuAuthDivRcd == "CC00703") {
			//공통 작업버튼 UDC인 경우
			if(ctrl.type == "udc.com.comButton" || ctrl.type == "udc.com.comButtonSave" || ctrl.type == "udc.com.comButtonSave2"){
				var btnDel = ctrl.getEmbeddedAppInstance().lookup("btnDelete");
				if(btnDel) {
					btnDel.visible = false;
				}
			//버튼인 경우
			} else if(ctrl.type == "button"){
				var vsStyle = ctrl.style ? ctrl.style.getClasses().join(";") : "";
				//삭제 버튼
				if(vsStyle.indexOf("btn-delete") != -1){
					ctrl.visible = false;
				}
			}
		} else if(psMenuAuthDivRcd == "CC00704"){
			//공통 작업버튼 UDC인 경우
			if(ctrl.type == "udc.com.comButton" || ctrl.type == "udc.com.comButtonSave" || ctrl.type == "udc.com.comButtonSave2"){
				var btnDel = ctrl.getEmbeddedAppInstance().lookup("btnDelete");
				if(btnDel) {
					btnDel.visible = false;
				}
				
				var btnNew = ctrl.getEmbeddedAppInstance().lookup("btnNew");
				if(btnNew) {
					btnNew.visible = false;
				}
				
			//버튼인 경우
			} else if(ctrl.type == "button"){
				var vsStyle = ctrl.style ? ctrl.style.getClasses().join(";") : "";
				//삭제 버튼
				if(vsStyle.indexOf("btn-delete") != -1 || vsStyle.indexOf("btn-new") != -1){
					ctrl.visible = false;
				}
			}
		} else if(psMenuAuthDivRcd == "CC00702") {
			//공통 작업버튼 UDC인 경우
			if(ctrl.type == "udc.com.comButton" || ctrl.type == "udc.com.comButtonSave" || ctrl.type == "udc.com.comButtonSave2"){
				var btnDel = ctrl.getEmbeddedAppInstance().lookup("btnDelete");
				if(btnDel) {
					btnDel.visible = false;
				}
				
				var btnNew = ctrl.getEmbeddedAppInstance().lookup("btnNew");
				if(btnNew) {
					btnNew.visible = false;
				}
				
				var btnRestore = ctrl.getEmbeddedAppInstance().lookup("btnRestore");
				if(btnRestore) {
					btnRestore.visible = false;
				}
				
				var btnSave = ctrl.getEmbeddedAppInstance().lookup("btnSave");
				if(btnSave) {
					btnSave.visible = false;
				}
				ctrl.visible = false;
			//그리드인 경우
			} else if(ctrl.type == "grid"){
			if(ctrl.readOnly !== true) ctrl.readOnly = true;
			//프리폼인 경우
			} else if(ctrl.type == "container"){
				if(ctrl.style && ctrl.style.getClasses().join(";").indexOf("form-box") != -1 && ctrl.getBindContext() != null) ctrl.enabled = false;
			//버튼인 경우
			} else if(ctrl.type == "button"){
				var vsStyle = ctrl.style ? ctrl.style.getClasses().join(";") : "";
				//삭제 버튼
				if(vsStyle.indexOf("btn-delete") != -1 || vsStyle.indexOf("btn-new") != -1 || vsStyle.indexOf("btn-restore") != -1 || vsStyle.indexOf("btn-save") != -1){
					ctrl.visible = false;
				}
			}
		}
		
//		//공통 작업버튼 UDC인 경우
//		if(ctrl.type == "udc.com.comButton" || ctrl.type == "udc.com.comButtonSave"){
//			ctrl.visible = false;
//		//그리드인 경우
//		}else if(ctrl.type == "grid"){
//			if(ctrl.readOnly !== true) ctrl.readOnly = true;
//		//프리폼인 경우
//		}else if(ctrl.type == "container"){
//			if(ctrl.style && ctrl.style.getClasses().join(";").indexOf("form-box") != -1 && ctrl.getBindContext() != null) ctrl.enabled = false;
//		//버튼인 경우
//		}else if(ctrl.type == "button"){
//			var vsStyle = ctrl.style ? ctrl.style.getClasses().join(";") : "";
//			//커밋 버튼, 신규 버튼, 삭제 버튼, 프리폼 삭제 버튼, 저장 버튼
//			if(vsStyle.indexOf("btn-commit") != -1 || vsStyle.indexOf("btn-new") != -1 || vsStyle.indexOf("btn-delete") != -1 || vsStyle.indexOf("btn-delete-save") != -1 || vsStyle.indexOf("btn-save") != -1){
//				ctrl.visible = false;
//			}
//		}
	});
};

exports.AppAuthKit = AppAuthKit;
