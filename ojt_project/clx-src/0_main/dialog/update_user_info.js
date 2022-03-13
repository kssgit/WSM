/************************************************
 * update_user_info.js
 * Created at 2022. 2. 9. 오후 3:41:27.
 *
 * @author ksk19
 ************************************************/

function validation(control){
	if(control.value.trim() == ''){
		control.focus();
		control.style.css({
			"border-bottom" : "1px solid red"
		})
		return false;
	}else{
		control.style.css({
			"border-bottom" : ""
		})
		return true;
	}
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHostProperty("initValue");
	app.lookup("dmUpdateUserInfo").setValue("USER_NUMBER", initValue["USER_NUMBER"]);
	app.lookup("userName").putValue(initValue["USER_NAME"]);
	app.lookup("userEmail").putValue(initValue["USER_EMAIL"]);
	app.lookup("userContact").putValue(initValue["USER_CALL"]);
	app.lookup("rdb1").putValue(initValue["USER_GENDER"]);
}

/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
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
	
	var v1 = validation(app.lookup("userName"))
	var v2 = validation(app.lookup("userContact"))
	if(v1 == true && v2 == true){
		var UUI = app.lookup("dmUpdateUserInfo");
		UUI.setValue("USER_NAME", app.lookup("userName").value);
		UUI.setValue("USER_CALL", app.lookup("userContact").value);
		UUI.setValue("USER_GENDER", app.lookup("rdb1").value);
		app.lookup("smsUpdate").send();
		
		app.close();
	}
	
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onUserNameValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var userName = e.control;
	validation(userName);
}


/*
 * 마스크 에디터에서 value-change 이벤트 발생 시 호출.
 * MaskEditor의 value의 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onUserContactValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.MaskEditor
	 */
	var userContact = e.control;
	validation(userContact);
}
