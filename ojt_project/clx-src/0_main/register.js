/************************************************
 * registerForm.js
 * Created at 2022. 1. 4. 오전 10:45:30.
 *
 * @author ksk19
 ************************************************/
// 중복 확인 유무
var duplicate = false; 
//
var passwordCheck = false;


/*
 * "중복확인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
//	var reg_email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
//	if(!reg_email.test(app.lookup("dmRegister").getValue("EMAIL"))){
//		alert("이메일 형식이 잘못되었습니다.");
//		return;
//	}
	app.lookup("smsDuplicate").send();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsDuplicateSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsDuplicate = e.control;
	var dm = app.lookup("dmDuplicateResult");
	if(dm.getValue("RESULT") == "fale"){//이메일 중복
		alert(dm.getValue("MSG"));
		duplicate = false
	}else{ //사용할 수 있는 이메일 
		alert(dm.getValue("MSG"));
		duplicate = true;
	}
}


/*
 * "가입하기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	//유효성 체크
	if(!duplicate){
		alert("아이디 중복 체크를 해주세요");
		app.lookup("btnDuplicationCheck").focus();
		return;
	}
	if(!passwordCheck){
		alert("비밀번호 확인을 해주세요");
		app.lookup("ipbPasswordCheck").focus();
		return;
	}
	var name = app.lookup("ipbName");
	if(name.value == null || name.value == ""){
		name.focus();
		return;
	}
	var birthday = app.lookup("dtiBirthday");
	if(birthday.value == null || birthday.value == ""){
		birthday.focus();
		return;
	}
	var gender = app.lookup("rdbgender");
	if(gender.value == null || gender.value == "" ){
		gender.focus();
		return;
	}
	var call = app.lookup("mseCall");
	console.log(call.value);
	if(call.value == null || call.value == ""){
		call.focus();
		return;
	}
	
	app.lookup("smsRegister").send();
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpb3ValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipb3 = e.control;
	var out = app.lookup("opbpwdCheck");
	if(app.lookup("ipbPwd").value == ipb3.value){
		passwordCheck = true;
		out.value = "패스워드가 일치합니다."
		out.style.css({
			"color": "green",
		})
	}else{
		out.value = "패스워드가 일치하지 않습니다."
		passwordCheck=false;
		out.style.css({
			"color": "red",
		})
	}
}



/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsRegisterSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsRegister = e.control;
	var dm = app.lookup("dmRegisterResult");
	alert(dm.getValue("MSG"));
	location.href="/";
	app.close();
}


/*
 * 인풋 박스에서 value-change 이벤트 발생 시 호출.
 * 변경된 value가 저장된 후에 발생하는 이벤트.
 */
function onIpbPwdValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.InputBox
	 */
	var ipbPwd = e.control;
	var out = app.lookup("opbpwdCheck");
	passwordCheck=false;
	out.value="";
}
