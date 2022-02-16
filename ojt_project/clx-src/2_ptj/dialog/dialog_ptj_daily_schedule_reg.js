/************************************************
 * ptj_daily_schedule.js
 * Created at 2022. 1. 12. 오전 9:23:30.
 *
 * @author ksk19
 ************************************************/

function cbxValidationCheck(/*cpr.controls.ComboBox */ control){
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

// 선택 일자에 존재하는 스케줄을 반영하여 필터값 생성
function scheduleFilter(selectedDate){
	var dsEvnt = app.lookup("dsEvnt");
	var dsHour = app.lookup("dsHour");
	/** @type String */
	var eventCon = "work_date == "+selectedDate+"000000";
	console.log(eventCon);
	dsEvnt.setFilter(eventCon);
	
	/** @type Array[String:String] */
	var array1 = [];
	for(var i = 0; i<dsEvnt.getRowCount(); i++){
		var bdt = dsEvnt.getValue(i, "beginDt");
		var edt = dsEvnt.getValue(i, "endDt");
		var schedule = [bdt,edt];
		array1.push(schedule);
	}
//	console.log("array1 출력: "+array1)//배열 출력 [[시작시간1,종료시간1], [시작시간2,종료시간2]]
	
	var timeCon = '';
	for(var i=0; i<array1.length; i++){
		// array1과 dsHour 포맷 세팅해주기
		var beginTime = array1[i][0];
		beginTime = beginTime.toString().substring(beginTime.length-6, beginTime.length-2);
		var endTime = array1[i][1];
		endTime = endTime.toString().substring(endTime.length-6, endTime.length-2);
		// dsHour 필터 세팅
		if(i==0){
			timeCon += "("+"timeNum <= "+beginTime + "||"+ "timeNum >="+endTime+")";
		}else{
			timeCon += "&&"+"("+" timeNum <= "+beginTime + "||" + "timeNum >="+endTime+")";
		}
	}
	return timeCon;
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
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHostProperty("initValue");
	app.lookup("workDate").value = initValue["work_date"];
	
	app.lookup("dmUserInfo").setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("dmOnLoad").setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("smsWorkPlace").send();
	app.lookup("subGetSchedule").send();
	
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
			dsHour.addRowData({"label" : time, "value" : time, "timeNum": time.replace(":", "")});
		}
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
	var dti2 = app.lookup("workDate2");
	var dti1Val = dti1.dateValue;
	//선택일과 익일만 선택 가능
	dti2.minDate = new Date(dti1.dateValue);
	//선택일자 +1일
	dti1Val.setDate(dti1Val.getDate()+1)
	dti2. maxDate = new Date(dti1Val);
	
	
	var dsHour = app.lookup("dsHour");
	var filter = scheduleFilter(dti1.value);
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
function onCmb2SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** @type cpr.controls.ComboBox */
	var cmb2 = e.control;
	var dti1 = app.lookup("workDate");
	var dti2 = app.lookup("workDate2");
	var timeCon = scheduleFilter(dti1.value);
	var dsHour = app.lookup("dsHour");
	var dsEvnt = app.lookup("dsEvnt");
	var selectedDate = app.lookup("workDate").value;
	var selectedTime = app.lookup("workBeginTime").value.replace(":", "");

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
			dti2.dateValue = dti1.dateValue;
			dti2.enabled =false;
		}else{ //마지막 일정 이후 선택시(bp 없을 때)
			if(timeCon != '' || timeCon != null){
				timeCon += "&&"+"("+" timeNum >= "+selectedTime+")";
			}
			dti2.enabled =true;
		}
			dsHour.setFilter(timeCon);
	}else{// 해당 날짜의 일정이 없는 경우
		timeCon += "("+" timeNum >= "+selectedTime+")";
		dsHour.setFilter(timeCon);
	}
	app.lookup("workEndTime").value = '';
}



/*
 * 콤보 박스에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onCmb2Open(/* cpr.events.CUIEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmb2 = e.control;
	var dti1 = app.lookup("workDate").value
	var dsHour = app.lookup("dsHour");
	dsHour.clearFilter();
	var filter = scheduleFilter(dti1);
	if(filter != null && filter != ''){
		dsHour.setFilter(filter);
	}
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	
	//입력항목 유효성 검사
	cbxValidationCheck(app.lookup("workPlace"));
	cbxValidationCheck(app.lookup("workDate"));
	cbxValidationCheck(app.lookup("workBeginTime"));
	cbxValidationCheck(app.lookup("workEndTime"));
	
	//파라미터로 보낼 값 세팅
	var dataMap = app.lookup("dmNewSchedule")
	dataMap.setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dataMap.setValue("ptj_name", UserInfo.getUserInfo().getValue("USER_NAME"));
	dataMap.setValue("store_code", app.lookup("workPlace").value);
	dataMap.setValue("store_name", app.lookup("workPlace").text);
	dataMap.setValue("work_date", app.lookup("workDate").value);
	dataMap.setValue("work_begin_time", app.lookup("workBeginTime").value.replace(":",""));
	dataMap.setValue("work_end_date", app.lookup("workDate2").value);
	dataMap.setValue("work_end_time", app.lookup("workEndTime").value.replace(":",""));
	if(app.lookup("braekTime").value == null || app.lookup("braekTime").value == ""){
		dataMap.setValue("breaktime", 0);
	}else{
		dataMap.setValue("breaktime", app.lookup("braekTime").value);
	}
	console.log(dataMap.getValue("work_end_date"));
	app.lookup("smsSave").send().then(function(input){
		alert("신규 스케줄이 정상적으로 요청되었습니다.");
		app.close();
	});
	
}


/*
 * 콤보 박스(근무 종료시간)에서 open 이벤트 발생 시 호출.
 * 리스트박스를 열때 발생하는 이벤트.
 */
function onWorkEndTimeOpen(/* cpr.events.CUIEvent */ e){
	var dsHour = app.lookup("dsHour");
	var dsEvnt = app.lookup("dsEvnt");
	var dti1 = app.lookup("workDate");
	var dti2 = app.lookup("workDate2");
	var timeCon;
	var selectedTime;
	
	if(dti1.value == dti2.value){
		//시작일과 종료일이 같으면 위의 필터 조건 그대로 쓰고 
		timeCon = dsHour.getFilter();
		selectedTime = app.lookup("workBeginTime").value.replace(":", "");
		timeCon += "&& timeNum != "+ selectedTime;
		console.log("timeCondition : " + timeCon)
		dsHour.setFilter(timeCon);
	}else{
		//시작일과 종료일이 다르면 종료일의 스케줄 조회해서 새로운 필터 적용 (스케줄 + bp)
		dsHour.clearFilter();
		timeCon = scheduleFilter(dti2.value);
		selectedTime = "0000";
	
		// 해당 날짜의 일정이 있는 경우
		if(dsEvnt.getRowCount() != 0){ 
			dsEvnt.setSort("beginDt");//ds오름차순 정렬
			var findBpCon = dti2.value+selectedTime+"00" //첫번째 bp찾는 조건(포맷)
			
			// 마지막 일정 종료 이후 선택시 bp가 없으므로 조건 처리(bp : Breaking Point)
			if(dsEvnt.findFirstRow("beginDt >="+findBpCon) != null){
				var firstRow = dsEvnt.findFirstRow("beginDt>="+findBpCon).getValue("beginDt"); // 조건에 부합하는 첫 번째 이벤트
				console.log("firstRow ="+firstRow); 
				var bp1 = firstRow.substring(firstRow.length-6, firstRow.length-2);
				
				if(timeCon != '' || timeCon != null){
					timeCon += "&&"+ "("+" timeNum >= "+selectedTime+"&&"+ "timeNum <="+ bp1 +")";
				}
			}else{
				if(timeCon != '' || timeCon != null){
					timeCon += "&&"+"("+" timeNum >= "+selectedTime+")";
				}
			}
			dsHour.setFilter(timeCon);
		}else{// 해당 날짜의 일정이 없는 경우
			timeCon += "("+" timeNum >= "+selectedTime+")";
			dsHour.setFilter(timeCon);
		}
	}
}
