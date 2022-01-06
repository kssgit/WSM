/************************************************
 * work_place_management_dialog.js
 * Created at 2022. 1. 4. 오전 11:34:14.
 *
 * @author SeongSoo
 ************************************************/



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	//dataset 선언 
	var dswpn = app.lookup("dsWpName");
	
	console.log(dswpn.getColumnData("wpName"));
	
	for(var i = 0 ; i < dswpn.getRowCount() ; i++){
		var value = dswpn.getValue(i, "wpName");
		//udc 선언
		var wpm = new udc.wpm();
		console.log(value);
		wpm.wp_name = value;
		
		app.lookup("wp_list").addChild(wpm, {
			autoSize : "none",
			height : "100px",
			width : "400px"
		});
	}


}
