/************************************************
 * wpm.js
 * Created at 2022. 1. 4. 오후 12:28:23.
 *
 * @author SeongSoo
 ************************************************/

var start;

/**
 * UDC 컨트롤이 그리드의 뷰 모드에서 표시할 텍스트를 반환합니다.
 */
exports.getText = function(){
	// TODO: 그리드의 뷰 모드에서 표시할 텍스트를 반환하는 하는 코드를 작성해야 합니다.
	return "";
};



/*
 * "삭제" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	var event = new cpr.events.CMouseEvent("delete");
	/*이벤트를 전파합니다.*/
	app.dispatchEvent(event);
	
}




/*
 * 체크 박스에서 value-change 이벤트 발생 시 호출.
 * CheckBox의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onCbx1ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.CheckBox
	 */
	var cbx1 = e.control;
	var grp = app.lookup("grp");
	if(start){//처음 setting 될 때 선택 되지 않도록
		/** @type String */
		var keyName = app.getAppProperty("store_code");
		if(cbx1.checked){
			//로컬스토리지
			localStorage.setItem(keyName,app.getAppProperty("store_code"));
			
			var color = app.getAppProperty("wp_color");
			if(color != null){
				grp.style.css("border-left-color",color);
			}else{
				grp.style.css("border-left-color","blue");
			}
		}else{

			//로컬스토리지
			localStorage.removeItem(keyName);	
				grp.style.css("border-left-color","none");
		}
	}
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	start = false;
	var cbx1 = app.lookup("cbx1");
	var grp = app.lookup("grp");
	if(cbx1.checked){
		
		//로컬스토리지
		var keyName = app.getAppProperty("store_code");
		localStorage.setItem(keyName, app.getAppProperty("store_code"));
		var color = app.getAppProperty("wp_color");
		if(color != null){
			grp.style.css("border-left-color",color);
		}else{
			grp.style.css("border-left-color","blue");
		}
		
	}else{

		//로컬스토리지
		localStorage.removeItem(keyName);
		grp.style.css("border-left-color"," none");
	}
	start = true;
}
