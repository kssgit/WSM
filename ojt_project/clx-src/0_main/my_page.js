/************************************************
 * my_page.js
 * Created at 2022. 2. 8. 오후 5:40:34.
 *
 * @author SeongSoo
 ************************************************/
var util = createCommonUtil();


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("smsUserInfo").send().then(function(input){
		var USER_NUMBER = app.lookup("dmUserinfo").getValue("USER_NUMBER");
		app.lookup("dmMyInfo").setValue("USER_NUMBER", USER_NUMBER);
		app.lookup("smsGetUserInfo").send();
	});
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick(/* cpr.events.CMouseEvent */ e){
	var myInfo = app.lookup("dmGetMyInfo");
	var USER_NUMBER = app.lookup("dmUserinfo").getValue("USER_NUMBER");
	var first = String(myInfo.getValue("USER_CALL")).substring(0,3)
	var second = String(myInfo.getValue("USER_CALL")).substring(3,7)
	var third = String(myInfo.getValue("USER_CALL")).substring(7,11)
	var contact = first+"-"+second+"-"+third;
	
	util.Dialog.open(app, "0_main/dialog/update_user_info", "450", "500", function(){},
	{	"USER_NAME" : myInfo.getValue("USER_NAME")
		,"USER_EMAIL" : myInfo.getValue("USER_EMAIL") 
		,"USER_CALL" : contact 
		,"USER_GENDER" : myInfo.getValue("USER_GENDER") 
		,"USER_NUMBER" : USER_NUMBER
	});
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsGetUserInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	var myInfo = app.lookup("dmGetMyInfo");
	var first = String(myInfo.getValue("USER_CALL")).substring(0,3)
	var second = String(myInfo.getValue("USER_CALL")).substring(3,7)
	var third = String(myInfo.getValue("USER_CALL")).substring(7,11)
	var contact = first+"-"+second+"-"+third;
	
	util.SelectCtl.setValue(app, "userName", myInfo.getValue("USER_NAME")); 
	util.SelectCtl.setValue(app, "userEmail", myInfo.getValue("USER_EMAIL")); 
	util.SelectCtl.setValue(app, "userContact", contact); 
}


/*
 * 그룹에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onGroupClick2(/* cpr.events.CMouseEvent */ e){
	var check = confirm("회원 탈퇴시 저장된 일정 및 매장 정보가 모두 삭제됩니다. 정말 삭제하시겠습니까?");
	if(check == true){
		app.lookup("smsDelete").send();
		app.close();
		location.href = "/logout.jsp";
	}
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsUserInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){

	var dm = app.lookup("dmUserinfo");
	// session  확인
	if(dm.getValue("USER_KIND") == null ){
		UserInfo.clean();
		app.close();
		location.href = "/";
	}
}
