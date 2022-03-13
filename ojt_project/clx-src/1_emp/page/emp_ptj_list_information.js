var util = createCommonUtil();

/* cpr.expression.ExpressionEngine#registerFunction */
/**
 * 시작 시간 표현 식
 * @param {String} time
 */
cpr.expression.ExpressionEngine.INSTANCE.registerFunction("substring", function(time) {
	return time.substring(0, 2) + ":" + time.substring(2);
});

/*
 * "근무 추가" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	util.Dialog.open(app, "1_emp/dialog/dialog_emp_daily_schedule_reg", "450", "650", function(e) {
		
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		var returnValue = dialog.returnValue;
		
		if (returnValue) {
			var dsSchedule = app.lookup("dsSchedule");
			dsSchedule.addRowData({
				"ACCEPT_PTJ": "N",
				"BREAKTIME": returnValue["BREAKTIME"],
				"PTJ_NAME": app.lookup("opbUserName").value,
				"WORK_BEGIN_TIME": returnValue["WORK_BEGIN_TIME"],
				"WORK_DATE": returnValue["WORK_DATE"],
				"WORK_END_DATE": returnValue["WORK_END_DATE"],
				"WORK_END_TIME": returnValue["WORK_END_TIME"],
				"STORE_CODE": app.lookup("storeCd").value,
				"USER_CODE_EMP": sessionStorage.getItem("USER_EMAIL"),
				"USER_CODE_PTJ": app.lookup("userNo").value,
				"STORE_NAME": app.lookup("oupStoreName").value,
				"DC": "C",
				"Class": "#2EB086"
			});
			app.lookup("grd1").redraw();
			app.lookup("cl").redraw();
		}
		
	}, {
		"store_name": app.lookup("oupStoreName").value,
		"UC": "C"
	});
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad( /* cpr.events.CEvent */ e) {
	
	//매장 목록 가져오기
	var dm = app.lookup("dmOnLoad")
	var dmGetPtjList = app.lookup("dmGetPtjList")
	var userEmail = sessionStorage.getItem("USER_EMAIL");
	var userNumber = sessionStorage.getItem("USER_NUMBER");
	dm.setValue("USER_EMAIL", userEmail);
	dm.setValue("USER_NUMBER", userNumber);
	dmGetPtjList.setValue("USER_NUMBER", userNumber);
	
	app.lookup("dmSearch").setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
	
	app.lookup("subGetPtjList").send();
	app.lookup("subOnLoad").send();
	app.lookup("smsReqPtjList").send().then(function(input) {
		var rowCount = app.lookup("dsRequest").getRowCount();
		if (rowCount > 0) {
			var option = {
				delay: 1000,
				animation: "fadein",
				close: true
			}
			app.lookup("noti").info("　" + rowCount + "개의 연결 요청이 있습니다.", option)
		}
	});
}

/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3( /* cpr.events.CMouseEvent */ e) {
	var dm = app.lookup("dmGetSchedule");
	var dtBegin = app.lookup("dtBegin").value;
	var dtEnd = app.lookup("dtEnd").value;
	var userNo = app.lookup("userNo").value;
	var storeCd = app.lookup("storeCd").value;
	if (userNo == null || userNo == "") {
		alert("검색할 알바생을 선택해주세요");
		return;
	}
	if (dtEnd == null || dtEnd == "") {
		dtEnd = "99991231"
	} else {
		//		dtEnd = dtEnd.replace(/\-/g, '');
	}
	
	dm.setValue("DT_BEGIN", dtBegin);
	dm.setValue("DT_END", dtEnd);
	dm.setValue("USER_NUMBER", userNo);
	dm.setValue("STORE_CODE", storeCd);
	
	app.lookup("subGetSchedule").send().then(function(input) {
		app.lookup("cl").redraw();
	});
	
}

/*
 * 그리드에서 row-check 이벤트 발생 시 호출.
 * Grid의 RowCheckbox가 체크 되었을 때 발생하는 이벤트. (columnType=checkbox)
 */
function onGrd1RowCheck( /* cpr.events.CGridEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	grd1.getSelectedRows().forEach(function(each) {
		console.log(each.getAttr("WORK_DATE"));
	});
	
}

/*
 * "삭제" 버튼(btnDeleteWork)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteWorkClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDeleteWork = e.control;
	var grd = app.lookup("grd1");
	var selectRow = grd.getSelectedRow();
	var dm = app.lookup("dmCheckUD");
	dm.setValue("SCHEDULE_CODE", selectRow.getRowData()["SCHEDULE_CODE"]);
	//현재 요청중인 근무인지 확인하기 위한 작업 
	app.lookup("smsCheckUD").send().then(function(input) {
		if (dm.getValue("RESULT") != 1) { //변경 상태가 아닐 경우
			// 현재 선택된 cell이 삭제 상태인지 확인 
			if (selectRow.getState() == 8) { //이미 삭제한 cell일 경우 
				selectRow.setState(cpr.data.tabledata.RowState.UNCHANGED);
			} else {
				
				var vnSelectedIndex = grd.getSelectedRowIndex();
				
				if (vnSelectedIndex != -1) {
					grd.deleteRow(vnSelectedIndex);
				}
			}
		} else {
			alert("현재 변경, 삭제 요청중인 근무입니다.");
		}
	});
	
}

/*
 * "요청" 버튼(btnReqWork)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnReqWorkClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var btnReqWork = e.control;
	
	app.lookup("smsReqSchedule").send().then(function(input) {
		app.lookup("subGetSchedule").send().then(function(input) {
			app.lookup("grd1").redraw();
			app.lookup("cl").redraw();
		});
	});
}

/*
 * "변경" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2( /* cpr.events.CMouseEvent */ e) {
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
	app.lookup("smsCheckUD").send().then(function(input) {
		if (dm.getValue("RESULT") != 1) { //변경 상태가 아닐 경우
			//다이얼로그 생성 
			util.Dialog.open(app, "1_emp/dialog/dialog_emp_daily_schedule_reg", "450", "650", function(e) {
				
				/** @type cpr.controls.Dialog */
				var dialog = e.control;
				
				var returnValue = dialog.returnValue;
				
				if (returnValue) {
					var dsSchedule = app.lookup("dsSchedule");
					// 선택한 로우 업데이트 
					selectRow.setValue("WORK_DATE", returnValue["WORK_DATE"]);
					selectRow.setValue("WORK_BEGIN_TIME", returnValue["WORK_BEGIN_TIME"]);
					selectRow.setValue("WORK_END_TIME", returnValue["WORK_END_TIME"]);
					selectRow.setValue("BREAKTIME", returnValue["BREAKTIME"]);
					//			app.lookup("grd1").redraw();
				}
				
			}, { //initValue
				"store_name": selectRow.getRowData()["STORE_NAME"],
				"UC": "U",
				"WORK_END_DATE": selectRow.getRowData()["WORK_END_DATE"],
				"WORK_DATE": selectRow.getRowData()["WORK_DATE"],
				"WORK_BEGIN_TIME": selectRow.getRowData()["WORK_BEGIN_TIME"],
				"WORK_END_TIME": selectRow.getRowData()["WORK_END_TIME"],
				"BREAKTIME": selectRow.getRowData()["BREAKTIME"]
			});
		} else { //현재 변경 삭제 요청중인 근무일 경우
			alert("현재 변경, 삭제 요청중인 근무입니다.");
		}
	});
	
}

/*
 * 그리드에서 cell-click 이벤트 발생 시 호출.
 * Grid의 Cell 클릭시 발생하는 이벤트.
 */
function onGrd1CellClick( /* cpr.events.CGridMouseEvent */ e) {
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
function onSubGetScheduleSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subGetSchedule = e.control;
	app.lookup("dsSchedule").setSort("WORK_DATE, WORK_BEGIN_TIME");
	app.lookup("cl").redraw();
	//	app.lookup("pageindex1").totalRowCount = app.lookup("dmGetSchedule").getValue("totalRowCount");
}

/*
 * 캘린더에서 item-click 이벤트 발생 시 호출.
 * Calendar의 아이템을 클릭 할 때 발생하는 이벤트. relativeTargetName, item을 통해 정보를 얻을 수 있습니다.
 */
function onClItemClick( /* cpr.events.CItemEvent */ e) {
	/** 
	 * @type cpr.controls.Calendar
	 */
	var cl = e.control;
	if (e.relativeTargetName == "more") {
		var date = e.targetObject.date;
		var voCalendarItems = cl.getItemsByDate(date);
		var voAnniversaries = cl.getAnniversariesByDate(date);
		var height = 100 + (voCalendarItems.length * 30)
		util.Dialog.open(app, "1_emp/dialog/CalendarMore", 300, height, function(e) {
			
			/** @type cpr.controls.Dialog */
			var dialog = e.control;
			
		}, {
			date: moment(date).format("YYYY-MM-DD"),
			item: voCalendarItems,
			anniversary: voAnniversaries
		});
	}
}

/* 
 * "퇴사" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	///스크립트 코드 옮기고 삭제 예정
	var grid = app.lookup("grdPtjList");
	var selectRow = grid.getSelectedRow();
	util.Dialog.open(app, "1_emp/dialog/confirm", "400", "220", function(e) {
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		var returnValue = dialog.returnValue;
		
		//예를 눌렀을 경우 삭제
		if (returnValue["result"]) {
			app.lookup("dmPtjDelete").setValue("PTJ_CODE", selectRow.getRowData()["PTJ_CODE"]);
			app.lookup("dmPtjDelete").setValue("USER_CODE_PTJ", selectRow.getRowData()["USER_NUMBER"]);
			app.lookup("smsPtjDelete").send().then(function(input) {
				app.lookup("subGetPtjList").send();
				app.lookup("dsSchedule").clear();
				app.lookup("cl").redraw();
				app.lookup("subOnLoad").send().then(function(input) {});
			});
		}
		
	}, {});
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubGetPtjListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subGetPtjList = e.control;
	//	console.log("서브미션 성공");
	app.lookup("grdPtjList").redraw();
}

/*
 * "취소" 버튼(btnRollBack)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnRollBackClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var btnRollBack = e.control;
	var grid = app.lookup("grd1");
	grid.revertData();
	app.lookup("cl").redraw();
}

/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit( /* cpr.events.CEvent */ e) {
	// session 확인
	var sessionCheck = app.lookup("smsSessionCheck");
	sessionCheck.setHeader("USER_EMAIL", sessionStorage.getItem("USER_EMAIL"));
	sessionCheck.send().then(function(input) {
		if (app.lookup("dmSessionCheck").getValue("result") == 0) {
			logout(app.getHostAppInstance());
		}
	});
}

/*
 * "수정" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick5( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	console.log("수정 버튼 클릭");
	var grid = app.lookup("grdPtjList");
	var index = grid.getSelectedRowIndex();
	//	console.log(grid.getRow(index));
	var row = grid.getRow(index);
	util.Dialog.open(app, "1_emp/dialog/dialog_ptj_edit", "400", "300", function(e) {
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		//재조회 및 그리드 Redraw
		app.lookup("subGetPtjList").send();
		
	}, {
		ptj_code: row.getValue("PTJ_CODE"),
		color: row.getValue("COLOR"),
		role: row.getValue("ROLE"),
		name: row.getValue("NAME")
	});
}

/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick6( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	//직원 조회 서브미션 전송
	var combo = app.lookup("cmb1").value;
	var name = app.lookup("ipb1").value;
	var dmGetPtjList = app.lookup("dmGetPtjList")
	dmGetPtjList.setValue("STORE_CODE", combo);
	dmGetPtjList.setValue("PTJ_NAME", name);
	console.log("조회");
	app.lookup("subGetPtjList").send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsReqPtjListSubmitSuccess( /* cpr.events.CSubmissionEvent */ e) {
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsReqPtjList = e.control;
	var grp = app.lookup("grpReqList");
	var ptj = app.lookup("dsRequest");
	app.lookup("rowCount").value = ptj.getRowCount();
	grp.removeAllChildren();
	
	if (ptj.getRowCount() == 0) {
		
		var output = new cpr.controls.Output();
		output.value = "매장 연결 요청이 없습니다."
		output.style.css({
			"text-align": "center"
		})
		grp.addChild(output, {
			autoSize: "none",
			height: "70px",
			width: "330px"
		});
	} else {
		
		for (var i = 0; i < ptj.getRowCount(); i++) {
			var ptj_udc = new udc.emp.ptj_udc_small();
			ptj_udc.gender = ptj.getValue(i, "GENDER");
			ptj_udc.ptj_name = ptj.getValue(i, "NAME");
			ptj_udc.store_name = ptj.getValue(i, "STORE_NAME");
			ptj_udc.ptj_code = ptj.getValue(i, "PTJ_CODE");
			ptj_udc.store_code = ptj.getValue(i, "STORE_CODE");
			ptj_udc.user_code_ptj = ptj.getValue(i, "USER_CODE_PTJ");
			ptj_udc.addEventListener("access", function(e) {
				app.lookup("smsReqPtjList").send();
				app.lookup("subGetPtjList").send();
			});
			ptj_udc.addEventListener("deny", function(e) {
				app.lookup("smsReqPtjList").send();
			});
			grp.addChild(ptj_udc, {
				autoSize: "width",
				height: "70px",
				width: "330px"
			});
		}
	}
}

/*
 * "새로 고침" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick7( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("smsReqPtjList").send();
}

/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick8( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
}

//닫을 때
function collapse() {
	var openCheck = app.lookup("reqListOpen");
	openCheck.checked = false;
	var wraper = app.lookup("wraper");
	
	var grpReqPtj = app.lookup("grpReqPtj");
	var grdPtjList = app.lookup("grPtjListWraper");
	var grscheduleListWraper = app.lookup("grscheduleListWraper")
	
	grpReqPtj.style.animateTo({
		"transform": "translateX(300px)"
	});
	
	wraper.updateConstraint(grdPtjList, {
		right: "340px"
	});
	wraper.updateConstraint(grscheduleListWraper, {
		right: "340px"
	});
	setTimeout(function() {
		grpReqPtj.visible = false;
	}, 400)
	app.lookup("btn-req-txt").value = "요청 보기"
}

//열 때
function expand() {
	var openCheck = app.lookup("reqListOpen");
	openCheck.checked = true;
	var wraper = app.lookup("wraper");
	
	var grpReqPtj = app.lookup("grpReqPtj");
	var grdPtjList = app.lookup("grPtjListWraper");
	var grscheduleListWraper = app.lookup("grscheduleListWraper")
	
	grpReqPtj.style.animateTo({
		"transform": "translateX(-320px)"
	});
	
	wraper.updateConstraint(grdPtjList, {
		right: "650px"
	});
	wraper.updateConstraint(grscheduleListWraper, {
		right: "650px"
	});
	grpReqPtj.visible = true;
	app.lookup("btn-req-txt").value = "닫기"
}

/*
 * "🔄" 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick2( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	app.lookup("smsReqPtjList").send();
}

/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpb1Keydown( /* cpr.events.CKeyboardEvent */ e) {
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb1 = e.control;
	if (e.keyCode == 13) {
		onButtonClick6(e);
	}
}

/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	var openCheck = app.lookup("reqListOpen");
	app.lookup("noti").closeAll();
	console.log(openCheck.checked)
	if (openCheck.checked) {
		collapse();
	} else {
		expand();
	}
}

/*
 * '수정'버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick9( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	//	console.log("수정 버튼 클릭");
	var grid = app.lookup("grdPtjList");
	var index = grid.getSelectedRowIndex();
	//	console.log(grid.getRow(index));
	var row = grid.getRow(index);
	util.Dialog.open(app, "1_emp/dialog/dialog_ptj_edit", "400", "300", function(e) {
		app.lookup("subGetPtjList").send();
	}, {
		user_number: row.getValue("USER_NUMBER"),
		ptj_code: row.getValue("PTJ_CODE"),
		color: row.getValue("COLOR"),
		role: row.getValue("ROLE"),
		name: row.getValue("NAME")
	});
	
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick10( /* cpr.events.CMouseEvent */ e) {
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grdPtjList");
	var index = grid.getSelectedRowIndex();
	var row = grid.getRow(index);
	
	util.Dialog.open(app, "1_emp/dialog/confirm", "400", "220", function(e) {
		/** @type cpr.controls.Dialog */
		var dialog = e.control;
		
		var returnValue = dialog.returnValue;
		if (returnValue != null) {
			//예를 눌렀을 경우 삭제
			if (returnValue["result"]) {
				app.lookup("dmPtjDelete").setValue("PTJ_CODE", row.getValue("PTJ_CODE"));
				app.lookup("dmPtjDelete").setValue("USER_CODE_PTJ", row.getValue("USER_NUMBER"));
				app.lookup("smsPtjDelete").send().then(function(input) {
					app.lookup("subGetPtjList").send();
					app.lookup("dsSchedule").clear();
					app.lookup("opbUserName").value = "";
					app.lookup("oupStoreName").value = "";
					
				});
			}
		}
		
	}, {
		name: row.getValue("NAME")
	});
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrdPtjListSelectionChange( /* cpr.events.CSelectionEvent */ e) {
	/** 
	 * @type cpr.controls.Grid
	 */
	var grdPtjList = e.control;
	
	// 직원 클릭시 캘린더에 일정 표시하고 그리드에 일정 표시 
	var now = new Date();
	var thisYear = now.getFullYear();
	var thisMonth = now.getMonth() + 1;
	var lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
	
	app.lookup("dtBegin").defaultDate = new Date(now.getFullYear(), now.getMonth(), 1);
	app.lookup("dtEnd").defaultDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	app.lookup("dtBegin").value = thisYear + '-' + thisMonth + '-' + '1'
	app.lookup("dtEnd").value = thisYear + '-' + thisMonth + '-' + lastDate
	var dm = app.lookup("dmGetSchedule");
	var userNo = app.lookup("userNo").value;
	var storeCd = app.lookup("storeCd").value;
	var dtBegin = app.lookup("dtBegin").value;
	var dtEnd = app.lookup("dtEnd").value
	
	dm.setValue("DT_BEGIN", dtBegin);
	dm.setValue("DT_END", dtEnd);
	dm.setValue("USER_NUMBER", userNo);
	dm.setValue("STORE_CODE", storeCd);
	
	//선택한 사원 근무 스케줄 조회
	app.lookup("subGetSchedule").send();
	
	var storeCd = app.lookup("storeCd");
	var user_code_ptj = app.lookup("userNo");
	
	//근무 버튼 활성화 및 비활성화
	app.lookup("btnAddWork").enabled = true;
	app.lookup("btnRollBack").enabled = true;
	app.lookup("btnReqWork").enabled = true;
	app.lookup("btnUpdate").enabled = false;
	app.lookup("btnDeleteWork").enabled = false;
}

/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
//function onPageindex1SelectionChange(e){
//	var pageindex1 = e.control;
//	app.lookup("dmGetSchedule").setValue("currpage", e.control.currentPageIndex);
//	app.lookup("subGetSchedule").send();
//}

/*
 * 루트 컨테이너에서 before-unload 이벤트 발생 시 호출.
 * 앱이 언로드되기 전에 발생하는 이벤트 입니다. 취소할 수 있습니다.
 */
function onBodyBeforeUnload(e) {
	var grid = app.lookup("grd1")
	for (var i = 0; i < grid.getDataRowCount(); i++) {
		
		if (util.isAppModified(app)) {
			if (confirm("저장되지 않은 데이터가 존재합니다") == false) {
				  e.preventDefault();
				  e.returnValue = '';
				  return false;
				  //2022.03.02 변경사항 체크 및 페이지 보존 실패
			}
			return;
		}
	}
	
	//	confirm("저장되지 않은 데이터가 존재합니다2")
	
}