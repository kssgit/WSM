/************************************************
 * dialog_ptj_daily_schedule_update.js
 * Created at 2022. 1. 19. 오전 10:01:10.
 *
 * @author SeongSoo
 ************************************************/
/* ***********Break Point 찾기 함수************ */
function getBreakPoint(selectedDate, selectedTime){
	var dti1 = app.lookup("workDate")
	var dti2 = app.lookup("workDate2")
	var dsHour = app.lookup("dsHour");
	var dsEvnt = app.lookup("dsEvnt");
	var timeCon = scheduleFilter(selectedDate);
	var result;

	// 해당 날짜의 일정이 있는 경우
	if(dsEvnt.getRowCount() != 0){ // 해당 날짜의 일정이 있는 경우
		dsEvnt.setSort("beginDt");//ds오름차순 정렬
		var findBpCon = selectedDate+selectedTime+"00" //첫번째 bp찾는 조건
		
		if(dsEvnt.findFirstRow("beginDt >="+findBpCon) != null){ // 마지막 일정 이전 선택시(bp있을 때)
			var firstRow = dsEvnt.findFirstRow("beginDt>="+findBpCon).getValue("beginDt"); // 조건에 부합하는 첫 번째 이벤트
			console.log("firstRow ="+firstRow); 
			var bp1 = firstRow.substring(firstRow.length-6, firstRow.length-2);
			
			if(timeCon != '' || timeCon != null){
				timeCon += "&&"+ "("+" timeNum >= "+selectedTime+"&&"+ "timeNum <="+ bp1 +")";
			}
			// 선택 일정 이후에 스케줄이 있다면 종료일을 시작일로 세팅하고 disable 처리
			result = true
		}else{ //마지막 일정 이후 선택시(bp 없을 때)
			if(timeCon != '' || timeCon != null){
				timeCon += "&&"+"("+" timeNum >= "+selectedTime+")";
			}
			result = false;
		}
			dsHour.setFilter(timeCon);
			return result;
	}else{// 해당 날짜의 일정이 없는 경우
		timeCon += "&&("+" timeNum >= "+selectedTime+")";
		dsHour.setFilter(timeCon);
		result = false;
		return result;
	}
}



/* ****인풋박스, 콤보박스가 유효성 검사 함수***** */
function comboboxValidationCheck(/*cpr.controls.ComboBox */ control){
	if(control.value == null || control.value == ''){
		control.focus();
		control.style.css({
			"border-bottom-color" : "red"
		})
	}else{
		control.style.css({
			"border-bottom-color" : ""
		})
	}
}

/* ********** 선택 일자에 존재하는 스케줄을 반영하여 필터값 생성********** */
function scheduleFilter(selectedDate){
	var dsEvnt = app.lookup("dsEvnt");
	var dsHour = app.lookup("dsHour");
	var eventCon = "work_date == "+selectedDate+"000000";
	
	
	//근무 변경시에는 현재 선택한 근무 시간 내에서도 선택가능.
	var initValue = app.getHostProperty("initValue");
	var WBT = selectedDate + initValue["work_begin_time"]+'00';
	var WET = selectedDate + initValue["work_end_time"]+'00';
	eventCon += "&&" + "beginDt !=" +WBT + "&&" +"endDt !=" +WET;
	dsEvnt.setFilter(eventCon);
	
	/** @type Array[String:String] */
	var array1 = [];
	for(var i = 0; i<dsEvnt.getRowCount(); i++){
		var bdt = dsEvnt.getValue(i, "beginDt");
		var edt = dsEvnt.getValue(i, "endDt");
		var schedule = [bdt,edt];
		if(bdt != WBT && edt != WET)
		array1.push(schedule); // 변경시 선택한 일정은 시간 validation에서 제외;
	}
	
	var timeCon = '(timeNum)';
	for(var i=0; i<array1.length; i++){
		// array1과 dsHour 포맷 세팅해주기
		var beginTime = array1[i][0];
		beginTime = beginTime.toString().substring(beginTime.length-6, beginTime.length-2);
		var endTime = array1[i][1];
		endTime = endTime.toString().substring(endTime.length-6, endTime.length-2);
		// dsHour 필터 세팅
		if(i==0){
			timeCon += "&&"+"("+"timeNum <= "+beginTime + "||"+ "timeNum >="+endTime+")";
		}else{
			timeCon += "&&"+"("+" timeNum <= "+beginTime + "||" + "timeNum >="+endTime+")";
		}
	}
	console.log("filtered")
	return timeCon;
}




/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	app.lookup("dmUserInfo").setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("dmOnLoad").setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("subGetSchedule").send();

}


/*
 * 데이트 인풋에서 value-change 이벤트 발생 시 호출.
 * Dateinput의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onWorkDateValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.DateInput
	 */
	var dti1 = e.control;
	
	var dti2 = app.lookup("workDate2");
	var dti1Val = dti1.dateValue;
	//선택일과 익일만 선택 가능
	dti2.minDate = new Date(dti1.dateValue);
	//선택일자 +1일
	dti1Val.setDate(dti1Val.getDate()+1)
	dti2. maxDate = new Date(dti1Val);
	
	var dsHour = app.lookup("dsHour");
	var filter = scheduleFilter(dti1.value);
	console.log(filter != null)
	if(filter != ''){
		dsHour.setFilter(filter);
	}
	app.lookup("workBeginTime").value = '';
	app.lookup("workEndTime").value = '';
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onWorkBeginTimeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	console.log("셀렉션 체인지")
	var dsHour = app.lookup("dsHour");
	var dti1 = app.lookup("workDate");
	var dti2 = app.lookup("workDate2");
	var selectedTime = app.lookup("workBeginTime").value.replace(":", "");
	console.log("ㄱ근무시작시간: "+ selectedTime)
	console.log("시작일자: "+ dti1.value)
	
	if(getBreakPoint(dti1.value, selectedTime)){
		dti2.dateValue = dti1.dateValue;
		dti2.enabled=false;
	}else{
		dti2.enabled = true;
	}
	
	app.lookup("workEndTime").value = '';
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onWorkEndTimeSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var workEndTime = e.control;
}


/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onWorkBeginTimeOpen(/* cpr.events.CUIEvent */ e){
	
	var dsHour = app.lookup("dsHour");
	var dti1 = app.lookup("workDate")
	dsHour.clearFilter();
	var filter = scheduleFilter(dti1.value);
	if(filter != null && filter != ''){
		dsHour.setFilter(filter);
	}
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	
	if(confirm("정말 일정을 삭제하시겠습니까?")){
		var dataMap = app.lookup("dmUpdateSchedule")
		dataMap.setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
		dataMap.setValue("ptj_name", UserInfo.getUserInfo().getValue("USER_NAME"));
		dataMap.setValue("work_date", app.lookup("workDate").value);
		dataMap.setValue("work_begin_time", app.lookup("workBeginTime").value.replace(":",""));
		dataMap.setValue("work_end_date", app.lookup("workDate2").value);
		dataMap.setValue("work_end_time", app.lookup("workEndTime").value.replace(":",""));
		if(app.lookup("breaktime").value == null || app.lookup("breaktime").value == ""){
			dataMap.setValue("breaktime", 0);
		}else{
			dataMap.setValue("breaktime", app.lookup("breaktime").value);
		}
		app.lookup("smsDelete").send().then(function(input){
			app.close();
		});
	}
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var dataMap = app.lookup("dmUpdateSchedule")
	dataMap.setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dataMap.setValue("ptj_name", UserInfo.getUserInfo().getValue("USER_NAME"));
	dataMap.setValue("work_date", app.lookup("workDate").value);
	dataMap.setValue("work_begin_time", app.lookup("workBeginTime").value.replace(":",""));
	dataMap.setValue("work_end_date", app.lookup("workDate2").value);
	dataMap.setValue("work_end_time", app.lookup("workEndTime").value.replace(":",""));
	if(app.lookup("breaktime").value == null || app.lookup("breaktime").value == ""){
		dataMap.setValue("breaktime", 0);
	}else{
		dataMap.setValue("breaktime", app.lookup("breaktime").value);
	}
	
	//초기값과 저장값이 같으면 "변동사항이 없습니다" 알림
	var origin = app.lookup("dmOrigin");
	if(
		origin.getValue("work_date") == app.lookup("workDate").value 
		&& origin.getValue("work_begin_time") == app.lookup("workBeginTime").value 
		&& origin.getValue("work_end_time") == app.lookup("workEndTime").value 
		&& origin.getValue("breaktime") == app.lookup("breaktime").value 
	){
		alert("변경된 사항이 없습니다.");
	}else{
		app.lookup("smsSave").send().then(function(input){
			alert("근무 변경 요청이 완료되었습니다.")
			app.close();
		});
	}

}


/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onWorkEndTimeOpen(/* cpr.events.CUIEvent */ e){
	
	var dsHour = app.lookup("dsHour");
	var dsEvnt = app.lookup("dsEvnt");
	var dti1 = app.lookup("workDate");
	var dti2 = app.lookup("workDate2");
	var timeCon;
	var selectedTime;
	if(dti1.value == dti2.value.substring(0, 8)){
		//시작일과 종료일이 같으면 위의 필터 조건 그대로 쓰고 
		timeCon = dsHour.getFilter();
		selectedTime = app.lookup("workBeginTime").value.replace(":", "");
		timeCon += "&& timeNum != "+ selectedTime;
		console.log("timeCondition : " + timeCon)
		dsHour.setFilter(timeCon);
	}else {
		//시작일과 종료일이 다르면 종료일의 스케줄 조회해서 새로운 필터 적용 (스케줄 + bp)
		dsHour.clearFilter();
		timeCon = scheduleFilter(dti2.value);
		selectedTime = "0000";
		console.log("timeCondition : " + timeCon)
		getBreakPoint(dti2.value, selectedTime)
	}
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubGetScheduleSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var dti1 = app.lookup("workDate");
	var dsHour = app.lookup("dsHour");
	
	//10분 단위로 시간 만들기
	var time = '';
	for(var i=0; i<24; i++){
			if(i < 10){
				i="0"+i;
			}
		for(var j=0; j<6; j++){
			if(j == 0){
				time = i+":"+"00";			
			}else{
				time = i+":"+j*10;
			}
			//데이터셋에 담기
			dsHour.addRowData({"label" : time, "value" : time.replace(":", ""), "timeNum": time.replace(":", "")});
		}
	}
	
	
	var initValue = app.getHostProperty("initValue");
	var store_name = initValue["store_name"];
	var work_date = initValue["work_date"];
	var work_begin_time = initValue["work_begin_time"];
	var work_end_date = initValue["work_end_date"];
	var work_end_time = initValue["work_end_time"];
	var store_code = initValue["storeCode"];
	var breaktime = initValue["breaktime"];
	var scheduleCode = initValue["scheduleCode"]
	console.log(work_end_date)
	console.log(work_date)
	
	//초기값과 저장 값 비교를 위한 데이터맵 dmOrigin
	var origin = app.lookup("dmOrigin");
	origin.setValue("work_date", work_date);
	origin.setValue("work_begin_time", work_begin_time);
	origin.setValue("work_end_date", work_end_date);
	origin.setValue("work_end_time", work_end_time);
	origin.setValue("breaktime", breaktime);
	
	//컨트롤에 선택한 스케줄 값 세팅
	app.lookup("workPlace").putValue(store_name);
	app.lookup("workDate").value = work_date;
	app.lookup("workBeginTime").value = work_begin_time;
	onWorkBeginTimeOpen(e);
	onWorkBeginTimeSelectionChange(e);
	app.lookup("workDate2").putValue(work_end_date);
	app.lookup("workEndTime").putValue(work_end_time);
	app.lookup("breaktime").putValue(breaktime);
	
	app.lookup("dmUpdateSchedule").setValue("store_code", store_code);//데이터 맵에 미리 세팅하기(고정값)
	app.lookup("dmUpdateSchedule").setValue("store_name", store_name);//데이터 맵에 미리 세팅하기(고정값)
	app.lookup("dmUpdateSchedule").setValue("schedule_code", scheduleCode);//데이터 맵에 미리 세팅하기(고정값)
	
}

