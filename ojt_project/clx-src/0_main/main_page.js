/************************************************
 * emp_main_page.js
 * Created at 2022. 1. 4. 오전 11:16:09.
 *
 * @author SeongSoo
 ************************************************/
//브라우져 재시작, 종료 시 로컬스토리지 데이터 제거
window.addEventListener("beforeunload",function(e){
	localStorage.clear();
});

/**
 * 
 * 임베디드 앱에 연결된 앱 변경
 * @param {String} appId
 * @param {any} voInitValue 
 */
function appChange(appId,voInitValue){
	
	var vcEmb = app.lookup("ea1");
	/*앱을 로드하고 로드된 앱을 임베디드 앱에 설정합니다.*/
	cpr.core.App.load(appId, function(/*cpr.core.App*/loadedApp){
		if(vcEmb.getEmbeddedAppInstance()){
//			alert("임베디드 앱에 앱 실행 상태 - > 삭제 합니다 ");
			vcEmb.getEmbeddedAppInstance().dispose();
		}
		/*로드된 앱이 있는 경우에는 임베디드앱 안에 불러온 앱을 넣습니다.*/
		if(loadedApp){						
			/*초기값을 전달합니다.*/			
			vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
				embApp.initValue = voInitValue;
			})
			/*임베디드 앱에 내장할 앱을 로드하여 설정합니다*/
			vcEmb.app = loadedApp;
		}
	});
}



/*
 * "로그아웃" 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick5(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var output = e.control;
	
}


/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	app.lookup("smsUserInfo").send();
	
}




/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsUserInfoSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsUserInfo = e.control;
	var dm = app.lookup("dmUserinfo");
	
	
	// session  확인
	if(dm.getValue("USER_KIND") == null ){
		UserInfo.clean();
		app.close();
		location.href = "/";
	}
	
	//글로벌 변수에 사용자 정보 저장
	UserInfo.setUserInfo(dm);
	
	// 사용자별 임베디드 앱 페이지 나누기
	app.lookup("ipbUserName").value = dm.getValue("USER_NAME");
	var appId;
	var userKind = app.lookup("dmUserinfo").getValue("USER_KIND");
	var menu = app.lookup("left-menu");
	if(userKind == "EMPLOYER"){
		app.lookup("subEmpMn").send().then(function(input){
			
			menu.redraw();
			menu.selectItem(0);
		});
		
		appId = "1_emp/page/emp_store_list_tile";
//		appId = "1_emp/test/emp_store_list_tile";
	}else{
		app.lookup("subPtjMn").send().then(function(input){
			menu.redraw();
			menu.selectItem(0);
		});
		appId = "2_ptj/page/ptj_schedule";
//		appId = "2_ptj/test/ptj_schedule";
	}
	
//	var formGrp = app.lookup("groForm1")
//	app.floatControl(formGrp,{top : 0, left: 0, right:0});
	
	var vcEmb = app.lookup("ea1");
	var voInitValue = {
		"userInfo" : dm,
	}
	//임베디드 앱 열기
	cpr.core.App.load(appId, function(/*cpr.core.App*/loadedApp){
		if(vcEmb.getEmbeddedAppInstance()){
//			alert("임베디드 앱에 앱 실행 상태 - > 삭제 합니다 ");
			vcEmb.getEmbeddedAppInstance().dispose();
		}
		/*로드된 앱이 있는 경우에는 임베디드앱 안에 불러온 앱을 넣습니다.*/
		if(loadedApp){						
			/*초기값을 전달합니다.*/			
			vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
				embApp.initValue = voInitValue;
			})
			/*임베디드 앱에 내장할 앱을 로드하여 설정합니다*/
			vcEmb.app = loadedApp;
		}
	});
}



/*
 * 네비게이션 바에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onNavigationBarItemClick2(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.NavigationBar
	 */
	var navigationBar = e.control;
	var MnItem = e.item;
	
	if (MnItem == null){
		return;
	}
	
	var vsAppId = MnItem.row.getValue("appId");
	
	console.log(vsAppId)
	
	if (vsAppId == null || vsAppId == ""){
		return;
	}
	var vcEmb = app.lookup("ea1")
	var dm = app.lookup("dmUserinfo");
	var voInitValue = {
		"userInfo" : dm,
	}
	new cpr.core.App.load(vsAppId, function(loadedApp) {
		if(vcEmb.getEmbeddedAppInstance()){
//			alert("임베디드 앱에 앱 실행 상태 - > 삭제 합니다 ");
			vcEmb.getEmbeddedAppInstance().dispose();
		}
		/*로드된 앱이 있는 경우에는 임베디드앱 안에 불러온 앱을 넣습니다.*/
		if(loadedApp){						
			/*초기값을 전달합니다.*/			
			vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
				embApp.initValue = voInitValue;
			})
		}
		vcEmb.app = loadedApp;
	});
}




/*
 * 메뉴에서 item-click 이벤트 발생 시 호출.
 * 아이템 클릭시 발생하는 이벤트.
 */
function onMenuItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Menu
	 */
	var menu = e.control;
	var MnItem = e.item;
	if (MnItem == null){
		return;
	}
	
	var vsAppId = MnItem.row.getValue("appId");
	
	console.log(vsAppId)
	
	if (vsAppId == null || vsAppId == ""){
		return;
	}
	var vcEmb = app.lookup("ea1")
	var dm = app.lookup("dmUserinfo");
	var voInitValue = {
		"userInfo" : dm,
	}
	new cpr.core.App.load(vsAppId, function(loadedApp) {
		if(vcEmb.getEmbeddedAppInstance()){
//			alert("임베디드 앱에 앱 실행 상태 - > 삭제 합니다 ");
			vcEmb.getEmbeddedAppInstance().dispose();
		}
		/*로드된 앱이 있는 경우에는 임베디드앱 안에 불러온 앱을 넣습니다.*/
		if(loadedApp){						
			/*초기값을 전달합니다.*/			
			vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
				embApp.initValue = voInitValue;
			})
		}
		vcEmb.app = loadedApp;
	});
}



/*
 * "UserName" 아웃풋(ipbUserName)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onIpbUserNameClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Output
	 */
	var ipbUserName = e.control;
	app.lookup("user_name").value =app.lookup("dmUserinfo").getValue("USER_NAME")+" 님";
	app.lookup("user_email").value = app.lookup("dmUserinfo").getValue("USER_EMAIL");
	app.lookup("user_email").style.css({"color" : "lightgray", "font-size" : "15px"})
	app.lookup("grplogout").visible = true;
}


/*
 * "로그 아웃" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	UserInfo.clean();
	localStorage.clear();
	app.close();
	location.href = "/logout.jsp"
}


/*
 * 그룹에서 mouseleave 이벤트 발생 시 호출.
 * 사용자가 컨트롤 및 컨트롤의 자식 영역 바깥으로 마우스 포인터를 이동할 때 발생하는 이벤트.
 */
function onGrplogoutMouseleave(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Container
	 */
	var grplogout = e.control;
	app.lookup("grplogout").visible = false;
}



/*
 * "My Page" 아웃풋에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onOutputClick(/* cpr.events.CMouseEvent */ e){
	window.location.href ="/main/myPage.do"
}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	cpr.core.ResourceLoader.loadScript("https://code.jquery.com/jquery-latest.min.js");
}
