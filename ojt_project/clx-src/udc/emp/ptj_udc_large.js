/************************************************
 * ptj_udc.js
 * Created at 2022. 2. 18. 오후 2:08:32.
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
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	if(app.getAppProperty("gender") == "M"){
		app.lookup("gender").src = "./theme/images/test/man (1).png";
	}else{
		app.lookup("gender").src = "./theme/images/test/woman (1).png"
	}
}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	var message = app.getAppProperty("ptj_name") + "의 매장 연결 요청을 승인하시겠습니까?";
	var dm = app.lookup("dmUpdate");
	if(confirm(message)){
		dm.setValue("ptj_code", app.getAppProperty("ptj_code"));
		dm.setValue("LINK_STAT", "Y");
		dm.setValue("STORE_CODE", app.getAppProperty("store_code"));
		dm.setValue("USER_CODE_PTJ", app.getAppProperty("user_code_ptj"));
		dm.setValue("color", app.lookup("cmb1").value);
		dm.setValue("role", app.lookup("ipb1").value);
		console.log(dm.getDatas());
		app.lookup("smsUpdate").send().then(function(input){
			var access = new cpr.events.CMouseEvent("access");
			app.dispatchEvent(access);
		});
	}

}


/*
 * 이미지에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onImageClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Image
	 */
	var image = e.control;
	var dm = app.lookup("dmUpdate");
	var message =  app.getAppProperty("ptj_name") + "의 매장 연결 요청을 거부하시겠습니까?";
	if(confirm(message)){
		dm.setValue("ptj_code", app.getAppProperty("ptj_code"));
		dm.setValue("LINK_STAT", "D");
		app.lookup("smsUpdate").send().then(function(input){
			
			var deny = new cpr.events.CMouseEvent("deny");
			app.dispatchEvent(deny);
		});
	}
	
}



/*
 * ">" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("grp").visible= true;
	var more = new cpr.events.CMouseEvent("more");
	app.dispatchEvent(more);
}
