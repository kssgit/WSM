/************************************************
 * Untitled.js
 * Created at 2021. 12. 31. 오전 11:04:20.
 *
 * @author SeongSoo
 ************************************************/



/*
 * 캘린더에서 date-click 이벤트 발생 시 호출.
 * Calendar의 날짜를 클릭 했을때 발생하는 이벤트.
 */
function onCalendarDateClick(/* cpr.events.CDateEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var calendar = e.control;
	app.openDialog("dialog/test1", {width : 400, height : 300}, function(dialog){
		dialog.ready(function(dialogApp){
			// 필요한 경우, 다이얼로그의 앱이 초기화 된 후, 앱 속성을 전달하십시오.
//			dialogApp.initValue = initValue;
		});
	}).then(function(returnValue){
		
	});

}
