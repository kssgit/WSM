/************************************************
 * store_list.js
 * Created at 2022. 1. 4. 오후 5:14:14.
 *
 * @author SeongSoo
 ************************************************/
/* cpr.expression.ExpressionEngine#registerFunction */
cpr.expression.ExpressionEngine.INSTANCE.registerFunction("getND", function(nd) {
	if(nd == "N"){
		return "미승인";
	}else{
		return "거부";
	}
});

cpr.expression.ExpressionEngine.INSTANCE.registerFunction("getUDC", function(udc) {
	if(udc == "C"){
		return "추가";
	}else if(udc == "D"){
		return "삭제";
	}else{
		return 	"변경";
	}
});


// 스케줄 중복 유효성 검사
function validation(ScheduleBegin, ScheduleEnd, NewScheduleBegin ,NewScheduleEnd){
	console.log("validation Start" )
	// 1. 새 스케줄 시작 < 기존 스케줄 시작 < 새 스케줄 종료
	if(moment(ScheduleBegin).isBetween(NewScheduleBegin, NewScheduleEnd)){
		return false;	
	}
	// 2. 새 스케줄 시작 < 기존 스케줄 종료 < 새 스케줄 종료
	else if(moment(ScheduleEnd).isBetween(NewScheduleBegin, NewScheduleEnd)){
		return false;	
	}
	// 3. 기존 스케줄 시작 < 새 스케줄 시작 < 새 스케줄 종료 < 기존 스케줄 종료 
	else if(moment(NewScheduleBegin).isBetween(ScheduleBegin, ScheduleEnd) && moment(NewScheduleEnd).isBetween(ScheduleBegin, ScheduleEnd)){
		return false;	
	}
	// 4. 새 스케줄 시작 < 기존 스케줄 시작 < 기존 스케줄 종료 < 새 스케줄 종료 (불필요?)
	else if(moment(ScheduleBegin).isBetween(NewScheduleBegin, NewScheduleEnd) && moment(ScheduleEnd).isBetween(NewScheduleBegin, NewScheduleEnd)){
		return false;	
	}
	else {
		return true;
	}
}

// yyyymmddHHmmss -> yyyy-mm-dd HH:mm 으로 포맷 변환하는 함수
function formatting(before){
	var YYYY = before.substring(0,4);
	var MM = before.substring(4,6);
	var DD = before.substring(6,8);
	var hh = before.substring(8,10);
	var mm = before.substring(10,12);
	var after = YYYY+"-"+MM+"-"+DD+" "+hh+":"+mm;
	return after;
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var dm = app.lookup("dmOnLoad");
//	dm.setValue("USER_EMAIL", UserInfo.getUserInfo().getValue("USER_EMAIL"));
	dm.setValue("USER_EMAIL", sessionStorage.getItem("USER_EMAIL"));
	dm.setValue("USER_KIND", "PTJ");
//	dm.setValue("USER_NUMBER", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dm.setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
//	console.log(UserInfo.getUserInfo().getValue("USER_NUMBER"));
	//요청 받은 목록
	app.lookup("smsScheduleChange").send().then(function(input){
		app.lookup("dsScheduleChange").setSort("WORK_BEGIN_TIME");
	});
	//요청 한 목록
	app.lookup("smsRequestList").send().then(function(input){
		app.lookup("dsRequest").setSort("WORK_BEGIN_TIME");
	});
}



/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrd1CellClick(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	var dm = app.lookup("dmSelectRow");
	dm.setValue("WORK_DATE", grd1.getSelectedRow().getRowData()["WORK_DATE"]);
//	dm.setValue("USER_NUMBER", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dm.setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
	var select_schedule_code = grd1.getSelectedRow().getRowData()["UD_SCHEDULE_NUMBER"];
	var UD = grd1.getSelectedRow().getRowData()["DC"];
	
	
	app.lookup("smsSelectSchedule").send().then(function(input){
		var ds = app.lookup("dsSelectSchedule");
		ds.setSort("WBT");
		// 변경 삭제 근무일 
		ds.forEachOfUnfilteredRows(function(dataRow){
			if(dataRow.getValue("SCHEDULE_CODE") == select_schedule_code){
				if(UD == "U"){
					dataRow.setState(cpr.data.tabledata.RowState.UPDATED);					
				}else if(UD == "D"){
					dataRow.setState(cpr.data.tabledata.RowState.DELETED);
				}
			}
		});
		var resultArr = [];
		if(UD == "U"){
			ds.forEachOfUnfilteredRows(function(dataRow){
				if(dataRow.getValue("SCHEDULE_CODE") != select_schedule_code){
					/** @type String */
					var date = dataRow.getRowData()["WORK_DATE"];
					var ScheduleBegin = formatting(date.substring(0, 8) +dataRow.getRowData()["WBT"]);
					var ScheduleEnd = formatting(date.substring(0, 8) +dataRow.getRowData()["WET"]);
					var NewScheduleBegin = formatting(grd1.getSelectedRow().getRowData()["WORK_BEGIN_TIME"]);
					var NewScheduleEnd =  formatting(grd1.getSelectedRow().getRowData()["WORK_END_TIME"]);
					var result = validation(ScheduleBegin, ScheduleEnd, NewScheduleBegin ,NewScheduleEnd);
					console.log(result)
					resultArr.push(result);
				}
			});
		}else{
			//선택 요청과 동일한 일자의 스케줄에 대해 유효성 검사 
			ds.forEachOfUnfilteredRows(function(dataRow){
				/** @type String */
				var date = dataRow.getRowData()["WORK_DATE"];
				var ScheduleBegin = formatting(date.substring(0, 8) +dataRow.getRowData()["WBT"]);
				var ScheduleEnd = formatting(date.substring(0, 8) +dataRow.getRowData()["WET"]);
				var NewScheduleBegin = formatting(grd1.getSelectedRow().getRowData()["WORK_BEGIN_TIME"]);
				var NewScheduleEnd =  formatting(grd1.getSelectedRow().getRowData()["WORK_END_TIME"]);
				var result = validation(ScheduleBegin, ScheduleEnd, NewScheduleBegin ,NewScheduleEnd);
				console.log(result)
				resultArr.push(result);
			});
		}
		var cnt = 0;
		resultArr.forEach(function(each){
			if(each == false){
				cnt++
			}
		});
		var noti1 = app.lookup("Noti1");
		if(cnt != 0){
			grd1.getSelectedRow().setValue("CLASS", "#ff1744");
			grd1.getSelectedRow().setState(cpr.data.tabledata.RowState.UNCHANGED);
			app.lookup("btnAccept").enabled = false;
			noti1.maxNotifyCount = 1;
			noti1.danger(" 일정이 중복되어 변경할 수 없습니다.");
		}else{
			app.lookup("btnAccept").enabled = true;
			noti1.closeAll();
		}
		
		app.lookup("opbDate").value = grd1.getSelectedRow().getRowData()["WORK_DATE"];
	});
}



/*
 * "거절" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grd1");
	grid.getSelectedRow().setValue("ACCEPT_PTJ", "D");
	app.lookup("smsAcceptSave").send();
	app.lookup("dsSelectSchedule").clear();
}

/*
 * "승인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("grd1").getSelectedRow().setValue("ACCEPT_PTJ", 'Y');
	app.lookup("smsAcceptSave").send().then(function(input){
		app.lookup("dsSelectSchedule").clear();
		app.lookup("grd2").redraw();
		app.lookup("smsScheduleChange").send().then(function(input){
			app.lookup("grd1").redraw();
			
		});
	});
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsAcceptSaveSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsAcceptSave = e.control;
	app.lookup("smsScheduleChange").send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsScheduleChangeSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsScheduleChange = e.control;
	app.lookup("dsScheduleChange").setSort("WORK_BEGIN_TIME");
	app.lookup("grd1").redraw();
} 

/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grd3");
	grid.deleteRow(grid.getSelectedRowIndex());
}


/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick5(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("smsRequestSave").send().then(function(input){
		app.lookup("smsRequestList").send().then(function(input){
			app.lookup("grd3").redraw();
		});
	});
}


/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	// session 확인
	var sessionCheck = app.lookup("smsSessionCheck");
	sessionCheck.setHeader("USER_EMAIL", sessionStorage.getItem("USER_EMAIL"));
	sessionCheck.send().then(function(input){
		if(app.lookup("dmSessionCheck").getValue("result") == 0 ){
			logout(app.getHostAppInstance());
		}
	});
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
	app.lookup("dsRequest").revert();
	app.lookup("grd3").redraw();
}
