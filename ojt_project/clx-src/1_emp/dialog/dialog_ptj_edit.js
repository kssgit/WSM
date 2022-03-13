/************************************************
 * dialog_ptj_edit.js
 * Created at 2022. 2. 21. 오후 5:22:09.
 *
 * @author SeongSoo
 ************************************************/
var initValue;
var util = createCommonUtil();

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	initValue = app.getHost().initValue;
	app.lookup("opb1").value = initValue["name"] + " 사원의 정보"
	app.lookup("cmb1").value = initValue["color"];
	app.lookup("ipb1").value = initValue["role"];
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}


/*
 * "수정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var role = app.lookup("ipb1").value;
	var color = app.lookup("cmb1").value
	if(role == initValue["role"] && color == initValue["color"]){
		alert("변경 사항이 없습니다");
		return;
	}
	
	var dm = app.lookup("dmUpdate");
	dm.setValue("PTJ_CODE", initValue["ptj_code"]);
	dm.setValue("ROLE", role);
	dm.setValue("COLOR", color);
	
	
	
	app.lookup("smsUpdate").send().then(function(input){
		app.close();
	});
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
//function onButtonClick3(/* cpr.events.CMouseEvent */ e){
//	/** 
//	 * @type cpr.controls.Button
//	 */
//	var button = e.control;
//	util.Dialog.open(app, "1_emp/dialog/confirm", "400", "220", function(e){
//		/** @type cpr.controls.Dialog */
//		var dialog = e.control;
//		
//		var returnValue = dialog.returnValue;
//		
//		//예를 눌렀을 경우 삭제
//		if(returnValue["result"]){
//			app.lookup("dmPtjDelete").setValue("PTJ_CODE", initValue["ptj_code"]);
//			app.lookup("dmPtjDelete").setValue("USER_CODE_PTJ", initValue["user_number"]);
//			app.lookup("smsPtjDelete").send().then(function(input){
//				app.close();
//			});
//		}
//		
//	}, {
//		name : initValue["name"]
//	});
//}
