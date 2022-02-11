/************************************************
 * ptj_daily_schedule.js
 * Created at 2022. 1. 12. 오전 9:23:30.
 *
 * @author ksk19
 ************************************************/
var initvalue;

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
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	initvalue = app.getHost().initValue;
	app.lookup("opbStoreName").value = initvalue["store_name"];
	// 근무 변경 일 경우
	if(initvalue["UC"] == "U"){
		app.lookup("opb1").value = "근무 변경";
		app.lookup("dti1").value = initvalue["WORK_DATE"];
		app.lookup("cmb3").value = initvalue["WORK_BEGIN_TIME"].substring(0,2);
		app.lookup("cmb4").value = initvalue["WORK_BEGIN_TIME"].substring(2);
		var filter = "value > " + initvalue["WORK_BEGIN_TIME"].substring(0,2);
		var dsEndH = app.lookup("dsEndHour");
		dsEndH.setFilter(filter);
		var endDH = app.lookup("cmb5");
		var endDM = app.lookup("cmb6");
		endDH.enabled  = true;
		endDM.enabled = true; 
		endDH.value = initvalue["WORK_END_TIME"].substring(0,2);
		endDM.value = initvalue["WORK_END_TIME"].substring(2);
		app.lookup("ipb2").value = initvalue["BREAKTIME"];
		app.lookup("btnAddUpdate").value ="변경";
	}
}


/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onDti1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var dti1 = e.control;
	var select = dti1.value;
	if(select != null){
		var format_day = select.substring(0, 4)+"-"+select.substring(4, 6)+"-"+select.substring(6,8);
		var select_date_format = new Date(format_day);
		var now = new Date();
		var now_year = now.getFullYear();
		var now_month = now.getMonth();
		var now_date = now.getDate();
		var today = new Date(now_year, now_month , now_date);
		//날짜 비교
//		if(today > select_date_format){
//			alert("이전날짜는 선택할 수 없습니다.");
//			dti1.value= null;
//			return;
//		}
		app.lookup("cmb3").enabled = true;
		app.lookup("cmb4").enabled = true;
	}
}



/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb3SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmb3 = e.control;
	var endDH = app.lookup("cmb5");
	var endDM = app.lookup("cmb6");
	endDH.enabled  = true;
	endDM.enabled = true;
	endDH.value = null;
	endDM.value = "00";
	var startDH = cmb3.value;
	var dsEndH = app.lookup("dsEndHour");
	var filter = "value > " + cmb3.value;
	dsEndH.setFilter(filter);
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	// 유효성 체크 
	var data = app.lookup("dti1").value;
	var bt = app.lookup("cmb3").value;
	var btm = app.lookup("cmb4").value;
	var et = app.lookup("cmb5").value;
	var etm = app.lookup("cmb6").value;
	var breaktime = app.lookup("ipb2").value;
	if (breaktime == '' || breaktime == null){
		breaktime = 0;
	}	
	if(data == null || bt == null || btm == null || et == null || etm == null){
		alert("정보를 다 입력해주세요")
		return;	
	}
	
	app.close({
		"WORK_DATE" : app.lookup("dti1").value,
		"WORK_BEGIN_TIME":""+app.lookup("cmb3").value+app.lookup("cmb4").value,
		"WORK_END_TIME" :""+app.lookup("cmb5").value+app.lookup("cmb6").value,
		"BREAKTIME" : breaktime
	});
}
