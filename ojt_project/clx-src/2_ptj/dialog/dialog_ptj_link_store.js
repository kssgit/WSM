/************************************************
 * registerForm.js
 * Created at 2022. 1. 4. 오전 10:45:30.
 *
 * @author ksk19
 ************************************************/
var userGender;

//라디오 버튼 selected 체크하기
function radioCheck(selected, other){
	// 1.one 체크
		selected.style.addClass("selected");
	// 2.other 체크 해제
	if(other.style.hasClass("selected")){
		other.style.removeClass("selected");
	}
	
	selected.style.removeClass("cl-focus-red");
	other.style.removeClass("cl-focus-red");
}




/*
 * "매장 검색" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	if(app.lookup("ipb1").value == null || app.lookup("ipb1").value == ''){
		alert("아이디를 입력하세요");
		return;
	}
	app.lookup("dmEmpInfo").setValue("user_id", app.lookup("ipb1").value);
//	app.lookup("dmEmpInfo").setValue("user_code_ptj",UserInfo.getUserInfo().getValue("USER_NUMBER"));
	app.lookup("dmEmpInfo").setValue("user_code_ptj",sessionStorage.getItem("USER_NUMBER"));
	app.lookup("smsEmpStoreList").send().then(function(input){
		if(app.lookup("dsStoreList").getRowCount() <1){
			alert("등록된 매장이 없거나 이미 등록되었습나다.");
		}else{
			alert("매장이 검색되었습니다.");
			app.lookup("cmb2").open();
		}
	});
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("ipb2").value = sessionStorage.getItem("USER_NAME");
}


/*
 * "링크 요청하기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	// 유효성 체크
	var  dmr = app.lookup("dmRequseLink");
	
	if(dmr.getValue("store_code")== null || dmr.getValue("store_code") == ""){
		alert("근무지를 선택해 주세요");
		app.lookup("cmb2").focus();
		return;
	}
	if(app.lookup("mse1").value == null ){
		alert("전화번호를 입력해 주세요");
		app.lookup("mse1").focus();
		return;
	}
	if(userGender == null){
		alert("성별을 선택해 주세요");
		return;
	}
	dmr.setValue("user_code_ptj", sessionStorage.getItem("USER_NUMBER"));
	dmr.setValue("call", app.lookup("mse1").value);
	dmr.setValue("gender",userGender);
	app.lookup("smsRequestLink").send();
	
}


/*
 * "남성" 버튼(MAN)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onMANClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var man = e.control;
	var woman = app.lookup("WOMAN");
	userGender = 'M';
	radioCheck(man,woman);
}


/*
 * "여성" 버튼(WOMAN)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onWOMANClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var woman = e.control;
	var man = app.lookup("MAN");
	userGender = 'F';
	radioCheck(woman,man);
}


/*
 * "취소" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
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
function onSmsRequestLinkSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsRequestLink = e.control;
	alert("매장 연결 요청을 보냈습니다.");
	app.close();
}
