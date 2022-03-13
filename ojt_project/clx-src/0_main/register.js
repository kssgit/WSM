/************************************************
 * registerForm.js
 * Created at 2022. 1. 4. 오전 10:45:30.
 *
 * @author ksk19
 ************************************************/

/* 전역변수 */
// 중복 확인 유무
var duplicate = false; 
//
var passwordCheck = false;
var userKind;
var userGender;

function pwCheck(){
	var out = app.lookup("opbpwdCheck");
	if(app.lookup("ipbPwd").value == app.lookup("ipbPasswordCheck").value){
		out.visible= true;
		passwordCheck = true;
		out.value = "패스워드가 일치합니다."
		out.style.css({
			"color": "green",
		})
	}else{
		out.visible= true;
		out.value = "패스워드가 일치하지 않습니다."
		passwordCheck=false;
		out.style.css({
			"color": "red",
		})
	}
}

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
 * "중복확인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var id = app.lookup("dmRegister").getValue("EMAIL");
	if(id == null || id == "" ){
		alert("아이디를 입력하세요");
		app.lookup("ipbEmail").focus();
		return ;
	}
	
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
	var dmRegister = app.lookup("dmRegister");
	//아이디 중복체크
	if(!duplicate){
		alert("아이디 중복 체크를 해주세요");
		app.lookup("btnDuplicationCheck").focus();
		return;
	}
	//패스워드 일치 유효성 검사
	if(!passwordCheck){
		alert("비밀번호 확인을 해주세요");
		app.lookup("ipbPasswordCheck").focus();
		return;
	}
	//이름 유효성 검사
	var name = app.lookup("ipbName");
	if(name.value == null || name.value == ""){
		name.focus();
		return;
	}
	
	//userKind 유효성 검사 및 값 입력
	if(userKind == null || userKind == ''){
		app.lookup("ptj").style.addClass("cl-focus-red");
		app.lookup("emp").style.addClass("cl-focus-red");
		return;
	}else{
		console.log(userKind);
		dmRegister.setValue("USERKIND", userKind);
	}
	//생년월일 유효성 검사
	var birthday = app.lookup("dtiBirthday");
	if(birthday.value == null || birthday.value == ""){
		birthday.focus();
		return;
	}
	//성별 유효성 검사
	if(userGender == null || userGender == "" ){
		app.lookup("MAN").style.addClass("cl-focus-red");
		app.lookup("WOMAN").style.addClass("cl-focus-red");
		return;
	}else{
		
		dmRegister.setValue("GENDER", userGender);
	}
	//연락처 유효성 검사
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
	pwCheck();
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
	pwCheck();
//	var out = app.lookup("opbpwdCheck");
//	passwordCheck=false;
//	out.value="";
}

/*
 * "emp" 버튼(ptj)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onPtjClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	
	var ptj = e.control;
	var emp = app.lookup("emp");
	userKind = '0';
	console.log(userKind);
	radioCheck(ptj,emp)
	
}


/*
 * "emp" 버튼(emp)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onEmpClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var emp = e.control;
	var ptj = app.lookup("ptj");
	userKind = '1';
	console.log(userKind);
	radioCheck(emp,ptj)
}

/*
 * "남성" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
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
 * "test" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	app.lookup("MAN").style.addClass("cl-focus-red");
//	app.lookup("MAN").focus();
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("dtiBirthday").maxDate = new Date();
}
