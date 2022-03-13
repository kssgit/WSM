/************************************************
 * store_list.js
 * Created at 2022. 1. 4. 오후 5:14:14.
 *
 * @author SeongSoo
 ************************************************/
var util = createCommonUtil();

/** 사용자 정의 함수  */



/*타임라인 색상 변수 설정 */
var color_add = "#40E889" 		//초록
var color_before_update = "#bdbdbd" //회색 : 변경 전
var color_update = "#ffcd56" 	//노랑 : 변경 후
var color_delete = "#ff6384"	//빨강 : 삭제
var color_original = '#8d9bff'	//파랑 : 기존 일정
var color_today = '#e5ebf5'		//연회색 : 선택일자 범위

/* (1) 타임라인 그리는 함수 */
function createTimeLine(requestSch, /* Array */scheduleArr) {
	google.charts.load('current', {'packages':['timeline']});
	google.charts.setOnLoadCallback(drawChart);
	function drawChart() {
	    var container = document.getElementById('timeline');
		var chart = new google.visualization.Timeline(container);
		var dataTable = new google.visualization.DataTable();
		var ptjList = app.lookup("dsPtjList")
		
		// 1. 컬럼 생성
		dataTable.addColumn({ type: 'string', id: 'label' });
		dataTable.addColumn({ type: 'string', id: 'Name' });
	    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
		dataTable.addColumn({ type: 'date', id: 'Start' });
		dataTable.addColumn({ type: 'date', id: 'End' });
		
		// 2. 24시간으로 나타내주기 위해 선택 일자 00시~24시까지 스케줄 넣어준다.[white] 
		var todayB = new Date(requestSch['WBT'].getFullYear(),requestSch['WBT'].getMonth() , requestSch['WBT'].getDate(), 00, 00);
		var todayE = new Date(requestSch['WBT'].getFullYear(),requestSch['WBT'].getMonth() , requestSch['WBT'].getDate(), 24, 00);
		var strToday = requestSch['WBT'].getFullYear()+'-'+requestSch['WBT'].getMonth()+'-'+ requestSch['WBT'].getDate()
		dataTable.addRows([
			 ["Time", strToday, color_today, todayB, todayE]
		])
		
		// 3. 선택한 [추가/변경/삭제] 요청에 대한 데이터 추가하기
		dataTable.addRows([
			[ requestSch['LABEL'], requestSch['NAME'], requestSch['COLOR'], requestSch['WBT'], requestSch['WET']]
		])
		
		// 4. 해당 매장의 전체 직원 행 만들어주기(스케줄 데이터 없어도)
		for(var i=0; i<ptjList.getRowCount(); i++){
			dataTable.addRows([
				[ptjList.getValue(i, "NAME") ,'', 'white', todayB, todayB]
			])//[label, Name, Start, End]에서 Name이 같으면 같은 색으로 표기된다.
		}
		
		//5. 해당 일자 기존 스케줄 추가 (가장 마지막)
		scheduleArr.forEach(function(each){
			dataTable.addRows([
				 [ each.LABEL, each.NAME, each.COLOR, each.WBT, each.WET ]
			])
		});

		 var options = {
		 	alternatingRowStyle: false,
		 	timeline: { colorByRowLabel: false},
		 	avoidOverlappingGridLines: false,
	    };
//		chart.draw(dataTable);
		chart.draw(dataTable,options);
	}
}

/* (2) 데이터 타입 맞추는 함수 */
function dateFormatting(workDT){
		var YYYY = workDT.substring(0, 4)
		var MM = workDT.substring(4, 6)
		var DD = workDT.substring(6, 8)
		var hh = workDT.substring(8, 10)
		var mm = workDT.substring(10, 12)
		var result = new Date(YYYY,MM,DD,hh,mm);
		return result;
}



cpr.core.ResourceLoader.loadScript("https://www.gstatic.com/charts/loader.js").then(function(input){
//	createTimeLine();
});

/*
 *  사용자 정의 Expression 함수
 */

cpr.expression.ExpressionEngine.INSTANCE.registerFunction("getND", function(nd) {
	if(nd == "N"){
		return "미승인";
	}else if(nd == "D"){
		return "거부";
	}else if(nd == "Y"){
		return "승인";
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


cpr.expression.ExpressionEngine.INSTANCE.registerFunction("getUDColor", function(udc) {
	if(udc == "C"){
		return color_add;
	}else if(udc == "D"){
		return color_delete;
	}else{
		return 	color_update;
	}
});


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var dm = app.lookup("dmOnLoad");
	dm.setValue("USER_EMAIL",sessionStorage.getItem("USER_EMAIL"));
	dm.setValue("USER_KIND", "EMP");
	dm.setValue("USER_NUMBER",sessionStorage.getItem("USER_NUMBER"));
	
	app.lookup("smsScheduleChange").send(); // 고용주가 요청 받은 목록
	app.lookup("smsRequestList").send(); // 고용주가 요청한 목록
	app.lookup("smsCheckReqRes").send(); // 고용주 거절 승인 목록
	app.lookup("subOnLoad").send(); // 매장리스트
	
	app.lookup("addSchedule").style.css({"background-color" : color_add})
	app.lookup("updateSchedule").style.css({"background-color" : color_update})
	app.lookup("deleteSchedule").style.css({"background-color" : color_delete})
	app.lookup("today").style.css({"background-color" : color_today})
	app.lookup("originSchedule").style.css({"background-color" : color_original})
	
}



/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
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
function onButtonClick10(/* cpr.events.CMouseEvent */ e){
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
function onButtonClick5(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grid = app.lookup("grd3");
//	grid.deleteRow(grid.getSelectedRowIndex());
	var arr  = grid.getSelectedRowIndices();
	arr.forEach(function(each){
		grid.deleteRow(each);
	});
	
	arr = grid.getCheckRowIndices();
	arr.forEach(function(each){
		grid.deleteRow(each);
	});
	
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
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("dsRequest").revert();
	app.lookup("grd3").redraw();
}
	

/*
 * '받은 요청'그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	if(app.lookup("noReq").visible){
		
		app.lookup("colorInfo").visible = true;
		app.lookup("timeline").visible = true;
		app.lookup("noReq").visible = false;
	}
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd1 = e.control;
	
	// 1. 선택한 행의 매장코드+근무일자 값을 통해 당일 스케줄 조회
	var dm = app.lookup("dmSelectRow");
	dm.setValue("WORK_DATE", grd1.getSelectedRow().getRowData()["WORK_DATE"]);
	dm.setValue("STORE_CODE", grd1.getSelectedRow().getRowData()["STORE_CODE"]);
	var select_schedule_code = grd1.getSelectedRow().getRowData()["UD_SCHEDULE_NUMBER"];
	var UD = grd1.getSelectedRow().getRowData()["DC"];
	console.log("선택한 스케줄 번호 : "+select_schedule_code);
	app.lookup("smsSelectSchedule").send().then(function(input){
	// 2. 조회한 스케줄 정보를 통해 타임라인으로 그리기 위한 데이터 포맷 작성
		var ds = app.lookup("dsSelectSchedule");
		
		// 2-1. 해당 매장 직원 수에 따라 높이 자동 맞춤
		var dsPtjList = app.lookup("dsPtjList");
		var timeline = 'uuid-'+app.lookup("timeline").uuid;
		var HEIGHT = dsPtjList.getRowCount()*40+150;
		console.log((HEIGHT+450)+"px")
		app.getHostAppInstance().lookup("ea1").style.css({
				"height" : (HEIGHT+450)+"px"
			})
		document.getElementById(timeline).style.height = HEIGHT+"px";
		
		// 2-2. 선택한 행의 데이터 1개 [추가/변경/삭제](Map)
		var selectedReqLABEL = grd1.getSelectedRow().getRowData()["PTJ_NAME"]
		var selectedReqNAME = grd1.getSelectedRow().getRowData()["PTJ_NAME"]
		var selectedReqWBT = dateFormatting(grd1.getSelectedRow().getRowData()["WORK_BEGIN_TIME"])
		var selectedReqWET = dateFormatting(grd1.getSelectedRow().getRowData()["WORK_END_TIME"])
		var selectedReqCUD = grd1.getSelectedRow().getRowData()["DC"]
		var color;
		if(selectedReqCUD == 'C'){
			color = color_add;//연두색
		}else if(selectedReqCUD == 'D' ){
			color = color_delete;//회색
		}else if(selectedReqCUD == 'U'){
			color = color_update;//주황
			selectedReqNAME = '변경 후'
		} 
		var requestSch =  {LABEL : selectedReqLABEL, NAME : selectedReqNAME, WBT : selectedReqWBT, WET :selectedReqWET, COLOR : color};
		
		// 2-3. 조회한 기존 스케줄 데이터(Map)를 타임라인 포맷에 맞추어 Array에 담는다. 
		var scheduleArr = [];
		// scheduleArr 자료 구조 예시 : [{LABEL : String, NAME : String, COLOR : String, WBT: Date, WET: Date }, {dicObject},{dicObject}...]
		for(var i = 0; i<ds.getRowCount(); i++){
			if(ds.getValue(i, "SCHEDULE_CODE") == select_schedule_code){
				
				if(UD == 'U'){
					// 변경시에는 변경 전 일정을 addRow 해준다.
					var dicObject = {}
					var ptj_name = ds.getValue(i, "PTJ_NAME");
					var work_begin_time = ds.getValue(i, "WORK_BEGIN_TIME");
					var work_end_time = ds.getValue(i, "WORK_END_TIME");
					dicObject['TERM'] = i.toString();
					dicObject['LABEL'] = ptj_name;
					dicObject['NAME'] = "변경 전"
					dicObject['WBT'] = dateFormatting(work_begin_time);
					dicObject['WET'] = dateFormatting(work_end_time);
					dicObject['COLOR'] = color_before_update;
					scheduleArr.push(dicObject);
				}else if(UD == 'D'){
					//삭제시 기존 데이터 addRow 하지 않음
				}
				
			}else{
				// 변경/삭제 요청과 관련없는 일정 데이터 addRow
				var dicObject = {}
				var ptj_name = ds.getValue(i, "PTJ_NAME");
				var work_begin_time = ds.getValue(i, "WORK_BEGIN_TIME");
				var work_end_time = ds.getValue(i, "WORK_END_TIME");
				
				dicObject['TERM'] = i.toString();
				dicObject['LABEL'] = ptj_name;
				dicObject['NAME'] = ptj_name;
				dicObject['WBT'] = dateFormatting(work_begin_time);
				dicObject['WET'] = dateFormatting(work_end_time);
				dicObject['COLOR'] = color_original;
				scheduleArr.push(dicObject);
			}
		}
		// 3. 타임라인 그려주는 함수 호출 (선택한 행 데이터(Map), 조회한 스케줄(Array)) 
		createTimeLine(requestSch, scheduleArr);
	});;
}




/*
 * '보낸 요청'그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd3SelectionChange(/* cpr.events.CSelectionEvent */ e){
	if(app.lookup("noReq").visible){
		app.lookup("colorInfo").visible = true;
		app.lookup("timeline").visible = true;
		app.lookup("noReq").visible = false;
	}
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd3 = e.control;
	// 1. 선택한 행의 매장코드+근무일자 값을 통해 당일 스케줄 조회
	var dm = app.lookup("dmSelectRow");
	dm.setValue("WORK_DATE", grd3.getSelectedRow().getRowData()["WORK_DATE"]);
	dm.setValue("STORE_CODE", grd3.getSelectedRow().getRowData()["STORE_CODE"]);
	var select_schedule_code = grd3.getSelectedRow().getRowData()["UD_SCHEDULE_NUMBER"];
	var UD = grd3.getSelectedRow().getRowData()["DC"];
	console.log("선택한 스케줄 번호 : "+select_schedule_code);
	app.lookup("smsSelectSchedule").send().then(function(input){
	// 2. 조회한 스케줄 정보를 통해 타임라인으로 그리기 위한 데이터 포맷 작성
		var ds = app.lookup("dsSelectSchedule");
		
		// 2-1. 해당 매장 직원 수에 따라 높이 자동 맞춤
		var dsPtjList = app.lookup("dsPtjList");
		var timeline = 'uuid-'+app.lookup("timeline").uuid;
		var HEIGHT = dsPtjList.getRowCount()*40+150;
		console.log((HEIGHT+450)+"px")
		app.getHostAppInstance().lookup("ea1").style.css({
				"height" : (HEIGHT+450)+"px"
			})
		document.getElementById(timeline).style.height = HEIGHT+"px";
		
		// 2-2. 선택한 행의 데이터 1개 [추가/변경/삭제](Map)
		var selectedReqLABEL = grd3.getSelectedRow().getRowData()["PTJ_NAME"]
		var selectedReqNAME = grd3.getSelectedRow().getRowData()["PTJ_NAME"]
		var selectedReqWBT = dateFormatting(grd3.getSelectedRow().getRowData()["WORK_BEGIN_TIME"])
		var selectedReqWET = dateFormatting(grd3.getSelectedRow().getRowData()["WORK_END_TIME"])
		var selectedReqCUD = grd3.getSelectedRow().getRowData()["DC"]
		var color;
		if(selectedReqCUD == 'C'){
			color = color_add;//연두색
		}else if(selectedReqCUD == 'D' ){
			color = color_delete;//회색
		}else if(selectedReqCUD == 'U'){
			color = color_update;//주황
			selectedReqNAME = '변경 후'
		} 
		
		var requestSch =  {LABEL : selectedReqLABEL, NAME : selectedReqNAME, WBT : selectedReqWBT, WET :selectedReqWET, COLOR : color};
		
		// 2-3. 조회한 기존 스케줄 데이터(Map)를 타임라인 포맷에 맞추어 Array에 담는다. 
		var scheduleArr = [];
		// scheduleArr 자료 구조 예시 : [{NAME : String, WBT: Date, WET: Date }, {dicObject},{dicObject}...]
		for(var i = 0; i<ds.getRowCount(); i++){
			
			if(ds.getValue(i, "SCHEDULE_CODE") == select_schedule_code){
				if(UD == 'U'){
					// 변경시에는 변경 전 일정을 addRow 해준다.
					var dicObject = {}
					var ptj_name = ds.getValue(i, "PTJ_NAME");
					var work_begin_time = ds.getValue(i, "WORK_BEGIN_TIME");
					var work_end_time = ds.getValue(i, "WORK_END_TIME");
					dicObject['TERM'] = i.toString();
					dicObject['LABEL'] = ptj_name;
					dicObject['NAME'] = "변경 전"
					dicObject['WBT'] = dateFormatting(work_begin_time);
					dicObject['WET'] = dateFormatting(work_end_time);
					dicObject['COLOR'] = color_before_update;
					scheduleArr.push(dicObject);
				}else if(UD == 'D'){
					//삭제시 기존 데이터 addRow 하지 않음
				}
			}else{
				var dicObject = {}
				var ptj_name = ds.getValue(i, "PTJ_NAME");
				var work_begin_time = ds.getValue(i, "WORK_BEGIN_TIME");
				var work_end_time = ds.getValue(i, "WORK_END_TIME");
				
				dicObject['TERM'] = i.toString();
				dicObject['LABEL'] = ptj_name;
				dicObject['NAME'] = ptj_name;
				dicObject['WBT'] = dateFormatting(work_begin_time);
				dicObject['WET'] = dateFormatting(work_end_time);
				dicObject['COLOR'] = color_original;
				scheduleArr.push(dicObject);
			}
		}
		// 3. 타임라인 그려주는 함수 호출 (선택한 행 데이터(Map), 조회한 스케줄(Array)) 
		createTimeLine(requestSch, scheduleArr);
	});;
}


/*
 * MDI 폴더에서 selection-change 이벤트 발생 시 호출.
 * Tab Item을 선택한 후에 발생하는 이벤트.
 */
function onMdi1SelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.MDIFolder
	 */
	var mdi1 = e.control;
	app.lookup("colorInfo").visible = false;
	app.lookup("timeline").visible = false;
	app.lookup("noReq").visible = true;
	var id = mdi1.getSelectedTabItem().id;
	if(id == 3){ // 고용주 승인 거절 목록 페이지
		app.lookup("smsCheckReqRes").send();
	}else if(id == 1){// 고용주가 요청받은 목록 페이지
		app.lookup("smsScheduleChange").send();
	}else if(id == 2){// 고용주가 요청한 목록 페이지
		app.lookup("smsRequestList").send();
	}
	if(id == 3){
		app.lookup("colorInfo").visible = false;
		app.lookup("noReq").visible = false;
		var mdiUuid = 'uuid-'+mdi1.uuid;
		document.getElementById(mdiUuid).firstChild.style.height = "780px";
	}else{
		var mdiUuid = 'uuid-'+mdi1.uuid;
		document.getElementById(mdiUuid).firstChild.style.height = "400px";
		
	}
	app.lookup("subOnLoad").send(); // 매장리스트
}


/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick7(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var store_code = app.lookup("cmb3").value;
	var ptj_name = app.lookup("ipb1").value;
	var dm = app.lookup("dmOnLoad");
	
	dm.setValue("PTJ_NAME", ptj_name);
	dm.setValue("STORE_CODE", store_code);
	
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
//	app.lookup("dsScheduleChange").setSort("WORK_BEGIN_TIME");
	app.lookup("grd1").redraw();
}


/*
 * "조회" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick8(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var store_code = app.lookup("cmb4").value;
	var ptj_name = app.lookup("ipb2").value;
	var dm = app.lookup("dmOnLoad");
	
	dm.setValue("PTJ_NAME", ptj_name);
	dm.setValue("STORE_CODE", store_code);
	app.lookup("smsRequestList").send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsRequestListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsRequestList = e.control;
//	app.lookup("dsRequest").setSort("WORK_BEGIN_TIME");
	app.lookup("grd3").redraw();
}


/*
 * "승인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick9(/* cpr.events.CMouseEvent */ e){
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
 * "조회" 버튼(btn_select)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtn_selectClick(e){
	var btn_select = e.control;
	var dm = app.lookup("dmOnLoad");
	dm.setValue("STORE_CODE", app.lookup("cmb5").value);//매장 
	dm.setValue("PTJ_NAME", app.lookup("ipb3").value);//이름
	app.lookup("smsCheckReqRes").send();
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsCheckReqResSubmitSuccess(e){
	var smsCheckReqRes = e.control;
	app.lookup("grd2").redraw();
	app.lookup("pageindex1").totalRowCount = app.lookup("dmOnLoad").getValue("totalRowCount");
	
}


/*
 * 페이지 인덱서에서 selection-change 이벤트 발생 시 호출.
 * Page index를 선택하여 선택된 페이지가 변경된 후에 발생하는 이벤트.
 */
function onPageIndexerSelectionChange(e){
	var pageIndexer = e.control;
	app.lookup("dmOnLoad").setValue("currpage", e.control.currentPageIndex);
	app.lookup("smsCheckReqRes").send().then(function(input){
		app.lookup("pageindex1").totalRowCount = ValueUtil.fixNumber(app.lookup("dmOnLoad").getValue("totalRowCount"));
	});
}

/*
 * MDI 폴더에서 tabheader-click 이벤트 발생 시 호출.
 * 탭 아이템의 헤더 영역을 클릭하였을 때 발생하는 이벤트입니다.
 */
function onMdi1TabheaderClick(e){
	var mdi1 = e.control;
	mdi1.getItemByName('Tab3')
	mdi1.getSelectedTabItem()
}