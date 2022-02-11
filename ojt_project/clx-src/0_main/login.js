/************************************************
 * main.js
 * Created at 2021. 12. 29. 오후 4:20:51.
 *
 * @author SeongSoo
 ************************************************/


function CheckEmail(str){                                                 
     var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
     if(!reg_email.test(str)) {                            
          return false;         
     }                            
     else {                       
          return true;         
     }                            
}

/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsLoginSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsLogin = e.control;
	var dm = app.lookup("dmLoginCheck");
	console.log(dm.getValue("MSG"));
	if(dm.getValue("MSG") == null){//로그인 성공
		app.close();
		location.href = "/";
	}else{
		alert(dm.getValue("MSG"));

	}
}


/*
 * "Sign Up" 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	window.location.href ="/regist/mvRegist.do"
}


/*
 * "Login" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	// id 유효성 체크
	if(!app.lookup("ipbId").value){
		alert("이메일을 입력하세요");
		app.lookup("ipbId").focus();
		return;
	}
	//비밀번호 유효성 체크
	if(!app.lookup("ipbpwd").value){
		alert("비밀번호를 입력하세요");
		app.lookup("ipbpwd").focus();
		return;
	}

	app.lookup("smsLogin").send();
}




/*
 * 인풋 박스에서 keydown 이벤트 발생 시 호출.
 * 사용자가 키를 누를 때 발생하는 이벤트.
 */
function onIpbpwdKeydown(/* cpr.events.CKeyboardEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipbpwd = e.control;
	var button = e.control;
	if (e.keyCode == 13){
		onButtonClick2(e);
	}
}


//
var dateRange = new cpr.utils.DateRange();
dateRange.contains();
//
//moment().valueOf()
moment().diff()