/************************************************
 * daliy_schedule.js
 * Created at 2022. 1. 12. 오전 9:38:30.
 *
 * @author ksk19
 ************************************************/

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var group = e.control;
	var udcClick =  new cpr.events.CMouseEvent("groupClick");
	app.dispatchEvent(udcClick);
}
