
var util = createCommonUtil();


/* cpr.expression.ExpressionEngine#registerFunction */
/**
 * 시작 시간 표현 식
 * @param {String} time
 */
cpr.expression.ExpressionEngine.INSTANCE.registerFunction("substring", function(time) {
	return time.substring(0,2) + ":"+ time.substring(2);
});


/*
 * "근무 추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	util.Dialog.open(app, "1_emp/dialog/dialog_emp_daily_schedule_reg", "450", "650", function(e){
		
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		var returnValue = dialog.returnValue;
		
		if(returnValue){
			var dsSchedule = app.lookup("dsSchedule");
			dsSchedule.addRowData({
				"ACCEPT_PTJ" : "N",
				"BREAKTIME" : returnValue["BREAKTIME"],
				"PTJ_NAME" : app.lookup("opbUserName").value,
				"WORK_BEGIN_TIME":returnValue["WORK_BEGIN_TIME"],
				"WORK_DATE":returnValue["WORK_DATE"],
				"WORK_END_DATE":returnValue["WORK_END_DATE"],
				"WORK_END_TIME":returnValue["WORK_END_TIME"],
				"STORE_CODE":app.lookup("storeCd").value,
				"USER_CODE_EMP":UserInfo.getUserInfo().getValue("USER_EMAIL"),
				"USER_CODE_PTJ":app.lookup("userNo").value,
				"STORE_NAME":app.lookup("oupStoreName").value,
				"DC" : "C",
				"Class":"#2EB086"
			});
			app.lookup("grd1").redraw();
			app.lookup("cl").redraw();
		}
		
	}, {"store_name": app.lookup("oupStoreName").value,
		"UC":"C"
		}
	);
}



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	//매장 목록 가져오기
	var dm = app.lookup("dmOnLoad")
	var dmGetPtjList = app.lookup("dmGetPtjList")
	var userEmail = UserInfo.getUserInfo().getValue("USER_EMAIL");
	var userNumber = UserInfo.getUserInfo().getValue("USER_NUMBER");
	dm.setValue("USER_EMAIL", userEmail);
	dm.setValue("USER_NUMBER", userNumber);
	dmGetPtjList.setValue("USER_NUMBER", userNumber);
	
	app.lookup("subGetPtjList").send();
	app.lookup("subOnLoad").send().then(function(input){
		app.lookup("dsEvnt").setSort("beginDt");
		app.lookup("dsEvnt").setFilter("start==0");
	});
}



/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onCmb1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var cmb1 = e.control;
	var userNumber = UserInfo.getUserInfo().getValue("USER_NUMBER");
	// 데이터 맵에 쿼리 검색 조건 두 가지 입력.
	var dm = app.lookup("dmGetPtjList")
	dm.setValue("STORE_CODE", cmb1.value);
	dm.setValue("USER_NUMBER", userNumber);
	//직원 조회 서브미션 전송
	app.lookup("subGetPtjList").send().then(function(input){		
		//직원 데이터 셋 필터 설정
		var dsPtjList = app.lookup("dsPtjList");
		dsPtjList.clearFilter();
		dsPtjList.setFilter("STORE_CODE == "+ cmb1.value);
	});
}


/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	
	var dm = app.lookup("dmGetSchedule");
	var dtBegin = app.lookup("dtBegin").value;
	var dtEnd = app.lookup("dtEnd").value;
	var userNo = app.lookup("userNo").value;
	var storeCd = app.lookup("storeCd").value;
	if(userNo == null || userNo == ""){
		alert("검색할 알바생을 선택해주세요");
		return;
	}
	if(dtEnd == null){
		dtEnd="99991231"
	}else{
		dtEnd = dtEnd.replace(/\-/g, '');
	}
	
	
	dm.setValue("DT_BEGIN", dtBegin);
	dm.setValue("DT_END", dtEnd);
	dm.setValue("USER_NUMBER", userNo);
	dm.setValue("STORE_CODE", storeCd);
	
	app.lookup("subGetSchedule").send().then(function(input){
		app.lookup("cl").redraw();
	});
	
	
}


/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onGrd1RowCheck(/* cpr.events.CGridEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	grd1.getSelectedRows().forEach(function(each){
		console.log(each.getAttr("WORK_DATE"));
	});
	
}


/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrd2CellClick2(/* cpr.events.CGridMouseEvent */ e){
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd2 = e.control;
	// 직원 클릭시 캘린더에 일정 표시하고 그리드에 일정 표시 
	
	app.lookup("dtEnd").value = null;
	var dm = app.lookup("dmGetSchedule");
	var dtBegin = app.lookup("dtBegin").value;
	var userNo = app.lookup("userNo").value;
	var storeCd = app.lookup("storeCd").value;
	var dtEnd="99991231"

	
	dm.setValue("DT_BEGIN", dtBegin);
	dm.setValue("DT_END", dtEnd);
	dm.setValue("USER_NUMBER", userNo);
	dm.setValue("STORE_CODE", storeCd);
	
	app.lookup("subGetSchedule").send();
	
	
	var dsEvnt = app.lookup("dsEvnt");
	var storeCd = app.lookup("storeCd");
	var user_code_ptj = app.lookup("userNo");
	
	
	//근무 버튼 활성화
	app.lookup("btnAddWork").enabled = true;
	app.lookup("btnRollBack").enabled = true;
	app.lookup("btnReqWork").enabled=true;
	
}



/*
 * "삭제" 버튼(btnDeleteWork)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteWorkClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDeleteWork = e.control;
	var grd = app.lookup("grd1");
	var selectRow = grd.getSelectedRow();
	var dm = app.lookup("dmCheckUD");
	dm.setValue("SCHEDULE_CODE", selectRow.getRowData()["SCHEDULE_CODE"]);
	//현재 요청중인 근무인지 확인하기 위한 작업 
	app.lookup("smsCheckUD").send().then(function(input){
		if(dm.getValue("RESULT") != 1){ //변경 상태가 아닐 경우
			// 현재 선택된 cell이 삭제 상태인지 확인 
			console.log(selectRow.getState());
			if(selectRow.getState() == 8){ //이미 삭제한 cell일 경우 
				selectRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			}else{
				var voCheckedIndices = grd.getCheckRowIndices();
		
				var vnSelectedIndex = grd.getSelectedRowIndex();
				
				if (voCheckedIndices.length > 0) {
					grd.deleteRow(voCheckedIndices);
				} 
				if (vnSelectedIndex != -1) {
					grd.deleteRow(vnSelectedIndex);
				}
			}	
		}else{
			alert("현재 변경, 삭제 요청중인 근무입니다.");
		}
	});
	
}

/*
 * "요청" 버튼(btnReqWork)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnReqWorkClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnReqWork = e.control;
	
	app.lookup("smsReqSchedule").send().then(function(input){
		app.lookup("subGetSchedule").send().then(function(input){
			app.lookup("grd1").redraw();
			app.lookup("cl").redraw();
		});
	});
}



/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grd1");
	//선택한 로우 데이터
	var selectRow = grid.getSelectedRow();
	var index = selectRow.getIndex();
	// 선택한 근무가 변경, 삭제 중인지(변경되어 없어진 스케줄인지) 확인 
	var dm = app.lookup("dmCheckUD");
	dm.setValue("SCHEDULE_CODE", selectRow.getRowData()["SCHEDULE_CODE"]);
	console.log(selectRow.getRowData()["WORK_END_DATE"]);
	app.lookup("smsCheckUD").send().then(function(input){
		if(dm.getValue("RESULT") != 1){ //변경 상태가 아닐 경우
			//다이얼로그 생성 
			util.Dialog.open(app, "1_emp/dialog/dialog_emp_daily_schedule_reg", "450", "650", function(e){
				
				/** @type cpr.controls.Dialog */
				var dialog = e.control;
				
				var returnValue = dialog.returnValue;
				
				if(returnValue){
					var dsSchedule = app.lookup("dsSchedule");
					// 선택한 로우 업데이트 
					selectRow.setValue("WORK_DATE", returnValue["WORK_DATE"]);
					selectRow.setValue("WORK_BEGIN_TIME", returnValue["WORK_BEGIN_TIME"]);
					selectRow.setValue("WORK_END_TIME", returnValue["WORK_END_TIME"]);
					selectRow.setValue("BREAKTIME", returnValue["BREAKTIME"]);
		//			app.lookup("grd1").redraw();
				}
				
			}, {//initValue
				"store_name": selectRow.getRowData()["STORE_NAME"],
				"UC" : "U",
				"WORK_END_DATE":selectRow.getRowData()["WORK_END_DATE"],
				"WORK_DATE" : selectRow.getRowData()["WORK_DATE"],
				"WORK_BEGIN_TIME" :selectRow.getRowData()["WORK_BEGIN_TIME"],
				"WORK_END_TIME":selectRow.getRowData()["WORK_END_TIME"],
				"BREAKTIME":selectRow.getRowData()["BREAKTIME"]
				});
		}else{//현재 변경 삭제 요청중인 근무일 경우
			alert("현재 변경, 삭제 요청중인 근무입니다.");
		}
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
	app.lookup("btnUpdate").enabled = true;
	app.lookup("btnDeleteWork").enabled = true;
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubGetScheduleSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subGetSchedule = e.control;
	app.lookup("dsSchedule").setSort("WORK_DATE, WORK_BEGIN_TIME");
	app.lookup("cl").redraw();
}


/*
 * 캘린더에서 item-click 이벤트 발생 시 호출.
 * Calendar의 아이템을 클릭 할 때 발생하는 이벤트. relativeTargetName, item을 통해 정보를 얻을 수 있습니다.
 */
function onClItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var cl = e.control;
	if(e.relativeTargetName == "more"){
		var date = e.targetObject.date;
		var voCalendarItems = cl.getItemsByDate(date);
		var voAnniversaries = cl.getAnniversariesByDate(date);
		util.Dialog.open(app, "1_emp/dialog/CalendarMore", 500, 500, function(e) {
			
			/** @type cpr.controls.Dialog */
			var dialog = e.control;
			
		}, {
			date : moment(date).format("YYYY-MM-DD"),
			item : voCalendarItems,
			anniversary : voAnniversaries
		});
	}
}


/*
 * "퇴사" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grdPtjList");
	var selectRow = grid.getSelectedRow();
	util.Dialog.open(app, "1_emp/dialog/confirm", "500", "220", function(e){
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		var returnValue = dialog.returnValue;
		
		//예를 눌렀을 경우 삭제
		if(returnValue["result"]){
			app.lookup("dmPtjDelete").setValue("PTJ_CODE", selectRow.getRowData()["PTJ_CODE"]);
			app.lookup("dmPtjDelete").setValue("USER_CODE_PTJ", selectRow.getRowData()["USER_NUMBER"]);
			app.lookup("smsPtjDelete").send().then(function(input){
				app.lookup("subGetPtjList").send();
				app.lookup("dsSchedule").clear();
				app.lookup("dsEvnt").clear();
				app.lookup("cl").redraw();
				app.lookup("subOnLoad").send().then(function(input){
					app.lookup("dsEvnt").setSort("beginDt");
					app.lookup("dsEvnt").setFilter("start==0");
				});
			});
		}
		
	}, {});
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubGetPtjListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subGetPtjList = e.control;
	app.lookup("grdPtjList").redraw();
}


/*
 * "취소" 버튼(btnRollBack)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRollBackClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRollBack = e.control;
	var grid = app.lookup("grd1");
	grid.revertData();
	app.lookup("cl").redraw();
}


/*
 * 캘린더에서 date-click 이벤트 발생 시 호출.
 * Calendar의 날짜를 클릭 했을때 발생하는 이벤트.
 */
function onClDateClick(/* cpr.events.CDateEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var cl = e.control;
	
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
