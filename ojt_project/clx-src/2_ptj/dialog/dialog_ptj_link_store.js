/************************************************
 * registerForm.js
 * Created at 2022. 1. 4. 오전 10:45:30.
 *
 * @author ksk19
 ************************************************/



/*
 * "업종 선택" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.dialogManager.openDialog("3_cmn/store_lg_category", "A" ,{width : 1050, height : 800, left: 250, top : 50}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
			dialogApp.focus();
		});
		dialog.addEventListener("close",function(e){
			button.focus();
		});
	}).then(function(returnValue){
	});
}


/*
 * "매장 검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if(app.lookup("ipb1").value == null || app.lookup("ipb1").value == ''){
		alert("아이디를 입력하세요");
		return;
	}
	app.lookup("dmEmpInfo").setValue("user_id", app.lookup("ipb1").value);
	app.lookup("dmEmpInfo").setValue("user_code_ptj",UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("smsEmpStoreList").send().then(function(input){
		if(app.lookup("dsStoreList").getRowCount() <1){
			alert("등록된 매장이 없거나 이미 등록되었습나다.");
		}else{
			alert("매장이 검색되었습니다.")
		}
	});
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("ipb2").value = UserInfo.getUserInfo().getValue("USER_NAME");
}


/*
 * "링크 요청하기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	// 유효성 체크
	var  dmr = app.lookup("dmRequseLink");
	var storeList = app.lookup("dsStoreList");
	var i = app.lookup("cmb2").getSelectedIndices()[0]
	dmr.setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dmr.setValue("store_name",storeList.getValue(i, "store_name"));
	app.lookup("smsRequestLink").send();
	
	app.close();
}
