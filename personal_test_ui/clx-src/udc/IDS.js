/************************************************
 * IDS.js
 * Created at 2021. 12. 30. 오전 9:19:05.
 *
 * @author SeongSoo
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * "신규" 버튼(btnInsert)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnInsertClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnInsert = e.control;
	
	/** 
	 * @type cpr.controls.Grid
	 */
	var grd = app.getAppProperty("grd");
	
	grd.insertRow(grd.getSelectedRow(), true);
}


/*
 * "삭제" 버튼(btnDelete)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDeleteClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDelete = e.control;
	
	/** @type cpr.controls.Grid */
	var grd = app.getAppProperty("grd");
	
	//grid 속성 확인 
	if(grd instanceof cpr.controls.Grid){
		
	}
	if(grd.type == "grid"){// 소문자 
		
	}
	
	grd.deleteRow(grd.getCheckRowIndices());
}


/*
 * "저장" 버튼(btnSave)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnSaveClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnSave = e.control;
	
	var event = new cpr.events.CMouseEvent("save");
	
	app.dispatchEvent(event);
	
	
}
