/************************************************
 * work_place_management_dialog.js
 * Created at 2022. 1. 4. 오전 11:34:14.
 *
 * @author SeongSoo
 ************************************************/

var util = createCommonUtil();


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	//dataset 선언 
	app.lookup("dmUserInfo").setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("smsWorkPlace").send().then(function(input){
		
	});

}



/*
 * "사업장 연결" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	
	util.Dialog.open(app, "2_ptj/dialog/dialog_ptj_link_store", "400", "550", function(e){
		
	}, {});
	app.close();
}
/*
 * "저장" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsWorkPlaceSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsWorkPlace = e.control;
	var dswpn = app.lookup("dsWpName");
		for(var i = 0 ; i < dswpn.getRowCount() ; i++){
			var value = dswpn.getValue(i, "store_name");
			//udc 선언
			var wpm = new udc.ptj.wpm();
			console.log(dswpn.getValue(i, "store_code"));
			wpm.wp_name = dswpn.getValue(i, "store_name");
			wpm.store_code = dswpn.getValue(i, "store_code");
			wpm.wp_color = dswpn.getValue(i, "class");
			//로컬 스토리지
			if(localStorage.getItem(""+dswpn.getValue(i, "store_code"))){
				wpm.select = true;
			}else{
				wpm.select = false;
			}
			wpm.addEventListener("delete", function(e){
				if(confirm("정말 삭제하시겠습니까? 해당된 근무스케줄 및 정보가 삭제됩니다.")){
					console.log("teqrw" + wpm.store_code);
					app.lookup("dmDeleteStore").setValue("STORE_CODE", wpm.store_code);
					app.lookup("dmDeleteStore").setValue("USER_NUMBER", UserInfo.getUserInfo().getValue("USER_NUMBER"));
					var sms = app.lookup("smsDeleteStore");
					if(UserInfo.getUserInfo().getValue("USER_KIND") == "EMPLOYER"){
						sms.action ="/emp/deleteStore.do"
					}else if(UserInfo.getUserInfo().getValue("USER_KIND") == "PARTTIMEJOB"){
						sms.action ="/ptj/deleteStore.do"
						console.log("삭제 주소");
					}
					sms.send().then(function(input){
						localStorage.removeItem(""+wpm.store_code);
					app.lookup("wp_list").removeAllChildren();
					app.lookup("smsWorkPlace").send();
					});;
					
				}
			});
			app.lookup("wp_list").addChild(wpm, {
				autoSize : "none",
				height : "100px",
				width : "400px"
			});
		}
}
