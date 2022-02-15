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
		app.lookup("dti2").value = initvalue["WORK_END_DATE"];
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

/**
 * date 변경 시 시간 설정 초기화
 */
function reset(){
	var beginTime = app.lookup("cmb3");
	var beginTime_m = app.lookup("cmb4");
	var endTime = app.lookup("cmb5");
	var endTime_m = app.lookup("cmb6");
	beginTime.enabled = false;
	beginTime_m.enabled = false;
	beginTime.value = null;
	beginTime_m.value = null;
	endTime.value =null;
	endTime_m.value = null;
	endTime.enabled = false;
	endTime_m.enabled = false;
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
	var endDate = app.lookup("dti2");
	endDate.value = null;
	reset();
	var selectDate =dti1.dateValue;
	endDate.minDate = new Date(selectDate);
	selectDate.setDate(selectDate.getDate()+1);
	endDate.maxDate = new Date(selectDate);
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
	if(app.lookup("dti1").value == app.lookup("dti2").value){
		var filter = "value > " + cmb3.value;
		dsEndH.setFilter(filter);
	}
	
	
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
	var end_date = app.lookup("dti2").value;
	var bt = app.lookup("cmb3").value;
	var btm = app.lookup("cmb4").value;
	var et = app.lookup("cmb5").value;
	var etm = app.lookup("cmb6").value;
	var breaktime = app.lookup("ipb2").value;
	if (breaktime == '' || breaktime == null){
		breaktime = 0;
	}
	if ( btm == '' ||  btm == null){
		 btm = "00";
	}
	if (etm == '' || etm == null){
		etm = "00";
	}	
	if(end_date  == null || data == null || bt == null  || et == null ){
		alert("정보를 다 입력해주세요")
		return;	
	}
	
	app.close({
		"WORK_DATE" : app.lookup("dti1").value,
		"WORK_END_DATE" : app.lookup("dti2").value,
		"WORK_BEGIN_TIME":""+app.lookup("cmb3").value + btm,
		"WORK_END_TIME" :""+app.lookup("cmb5").value + etm,
		"BREAKTIME" : breaktime
	});
}


/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onDti2ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var dti2 = e.control;
	app.lookup("cmb3").enabled = true;
	app.lookup("cmb4").enabled = true;
	app.lookup("dsEndHour").clearFilter();
	app.lookup("cmb5").value = null;
	app.lookup("cmb6").value = null;
	if(app.lookup("dti1").value == app.lookup("dti2").value){
		var filter = "value > " + app.lookup("cmb3").value;
		app.lookup("dsEndHour").setFilter(filter);
	}
}
