/************************************************
 * store_list.js
 * Created at 2022. 1. 4. 오후 5:14:14.
 *
 * @author SeongSoo
 ************************************************/



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var dm = app.lookup("dmOnLoad");
	
	dm.setValue("USER_EMAIL", UserInfo.getUserInfo().getValue("USER_EMAIL"));
	dm.setValue("USER_KIND", "EMP");
	dm.setValue("USER_NUMBER", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("smsScheduleChange").send().then(function(input){
		app.lookup("dsScheduleChange").setSort("WORK_BEGIN_TIME");
	});
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
	dm.setValue("STORE_CODE", grd1.getSelectedRow().getRowData()["STORE_CODE"]);
	var select_schedule_code = grd1.getSelectedRow().getRowData()["UD_SCHEDULE_NUMBER"];
	var UD = grd1.getSelectedRow().getRowData()["DC"];
	console.log("선택한 스케줄 번호 : "+select_schedule_code);
	app.lookup("smsSelectSchedule").send().then(function(input){
		var ds = app.lookup("dsSelectSchedule");
		ds.setSort("WBT");
		//선택한 근무일
		app.lookup("opbDate").value =grd1.getSelectedRow().getRowData()["WORK_DATE"];
		var worker_count = ds.getUnfilteredDistinctValues("PTJ_NAME");
		//해당 근무일에 일하는 직원 수
		app.lookup("opbWorker").value = worker_count.length;
		//변경 삭제한 근무 상태값 변경
		ds.forEachOfUnfilteredRows(function(dataRow){
			console.log("스케쥴 번 호 : "+dataRow.getValue("SCHEDULE_CODE"));
			if(dataRow.getValue("SCHEDULE_CODE") == select_schedule_code){
				console.log("schedule_code");
				if(UD == "U"){
					console.log("변경");
					dataRow.setState(cpr.data.tabledata.RowState.UPDATED);					
				}else if(UD == "D"){
					dataRow.setState(cpr.data.tabledata.RowState.DELETED);
				}
			}
		});
	});;
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
	app.lookup("smsAcceptSave").send().then(function(input){
		app.lookup("smsScheduleChange").send().then(function(input){
			/** @type Integer */
			var message = app.lookup("dmException").getValue("message");
			console.log(message);
			if(message == 1){
				app.lookup("noti").warning("시간중복이 발생 되어 시작시간이 빠른 근무만 승인되었습니다.");
			}
			app.lookup("grd1").redraw();
			app.lookup("dsSelectSchedule").clear();
		});
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
	grid.getCheckRowIndices().forEach(function(each){
		grid.getRow(each).setValue("ACCEPT_EMP", "D");
	});
	grid.getSelectedRow().setValue("ACCEPT_EMP", "D");
}


/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
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
 * "승인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick6(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grd1");
	grid.getCheckRowIndices().forEach(function(each){
		grid.getRow(each).setValue("ACCEPT_EMP", "Y");
	});
	grid.getSelectedRow().setValue("ACCEPT_EMP", "Y");
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
