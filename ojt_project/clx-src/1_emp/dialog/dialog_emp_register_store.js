/************************************************
 * emp_register_store.js
 * Created at 2022. 1. 10. 오후 3:14:35.
 *
 * @author ksk19
 ************************************************/



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("smsGetStoreCtgr").send();
	
}



/*
 * "등록하기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
	//	유효성 체크 
	var storeName = app.lookup("ipbStoreName");
	var storeCtgr = app.lookup("lcbCtgr");
	var manager = app.lookup("ipbManagername");
	if(storeName.value == null || storeName.value == ''	){
		alert("매장 이름을 적어주세요");
		storeName.focus();
		return;
	}
	if(storeCtgr.value == null || storeCtgr == ''){
		alert("업종을 정해주세요");
		storeCtgr.focus();
		return;
	}
	if(manager.value == null || manager.value == ''){
		manager.value = UserInfo.getUserInfo().getValue("USER_NAME");
	}
	var dm = app.lookup("dmAddStore");
	dm.setValue("store_name", storeName.value);
	dm.setValue("business_type_large", storeCtgr.values[0]);
	dm.setValue("business_type_small", storeCtgr.values[1]);
	dm.setValue("USER_NUMBER_EMP", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dm.setValue("MANAGEMENT", manager.value);
	dm.setValue("USER_EMAIL", UserInfo.getUserInfo().getValue("USER_EMAIL"));
	app.lookup("smsAddSotre").send().then(function(input){
		app.close();		
	});;
}
