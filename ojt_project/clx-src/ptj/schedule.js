/************************************************
 * schedule.js
 * Created at 2022. 1. 5. 오전 11:23:01.
 *
 * @author SeongSoo
 ************************************************/


/*
 * "근무지 관리" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.openDialog("ptj/DialogWPM", {width : 400, height : 550}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
		});
	}).then(function(returnValue){
		alert("성공");
	});
}


/*
 * 캘린더에서 date-click 이벤트 발생 시 호출.
 * Calendar의 날짜를 클릭 했을때 발생하는 이벤트.
 */
function onCalendarDateClick2(/* cpr.events.CDateEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var calendar = e.control;
	app.openDialog("ptj/Dialog_date_information", {width : 400, height : 550}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
		});
	}).then(function(returnValue){
		alert("성공");
	});
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var grp = app.lookup("grpToday");
	
	var dataset = app.lookup("dstoday");
	
	for(var i = 0 ; i < dataset.getRowCount() ; i++){
		var tj = new udc.todayJop();
		tj.wherejob = dataset.getValue(i, "wherejob");
		tj.start_time = dataset.getValue(i, "start_time");
		tj.end_time = dataset.getValue(i, "end_time");
		tj.total_time = dataset.getValue(i, "total_time");
		
		grp.addChild(tj, {
			autoSize :"none",
			height : "100px",
			width : "100px"
		});
	}
}
