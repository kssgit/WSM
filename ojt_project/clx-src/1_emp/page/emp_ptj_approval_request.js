/************************************************
 * approval_request_page.js
 * Created at 2022. 1. 4. 오후 4:02:43.
 *
 * @author SeongSoo
 ************************************************/

function loadLibrary () {
		cpr.core.ResourceLoader.loadScript("https://cdn.jsdelivr.net/npm/spectrum-colorpicker2/dist/spectrum.min.js").then(function(input){
			cpr.core.ResourceLoader.loadCSS("https://cdn.jsdelivr.net/npm/spectrum-colorpicker2/dist/spectrum.min.css");
			createColorPicker();
		});
}

function createColorPicker(){
	app.lookup("colorPicker").value = "<input id='color-picker' value='white' style='height: 38px; width :100%; border:none' readonly />";
	cpr.core.DeferredUpdateManager.INSTANCE.asyncExec(function(e){
		 $('#color-picker').spectrum({
			  type: "component",
			  showPaletteOnly: true,
			  togglePaletteOnly: true,
			  showInitial: true,
			  showAlpha: false
		});
		
		$("#color-picker").spectrum({
		    change: function(color) { 
		    	var selectedColor = color.toHexString();
		    	app.lookup("cpV").value = selectedColor;
		    },
		    move: function(color) { 
		    	var selectedColor = color.toHexString();
		    	app.lookup("cpV").value = selectedColor;
		    },
		});
	 }); 
}

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	//요청 수 아웃풋 출력
	loadLibrary(); 
	createColorPicker();
//	setAttribute();
	
	
	var dm = app.lookup("dmOnLoad");
	var userEmail = UserInfo.getUserInfo().getValue("USER_EMAIL");
	var userNumber = UserInfo.getUserInfo().getValue("USER_NUMBER");
	dm.setValue("USER_EMAIL", userEmail);
	dm.setValue("USER_NUMBER", userNumber);
	app.lookup("subOnLoad").send();
}


/*
 * 콤보 박스에서 selection-change 이벤트 발생 시 호출.
 * ComboBox Item을 선택하여 선택된 값이 저장된 후에 발생하는 이벤트.
 */
function onComboBoxSelectionChange(/* cpr.events.CSelectionEvent */ e){
	/** 
	 * @type cpr.controls.ComboBox
	 */
	var comboBox = e.control;
	var dsReqList = app.lookup("dsRequest");
	var selectedStore = app.lookup("cmbStore").value;
	console.log("$$$$$ " + selectedStore);
	
	var filterCondition = "STORE_CODE == "+selectedStore; 
	
	dsReqList.setFilter(filterCondition);
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
	app.lookup("smsSave").send().then(function(input){
		app.lookup("subOnLoad").send();	
	});
	app.lookup("grpselect").redraw();
	app.lookup("store_name").value = null;
	app.lookup("ptj_name").value = null;
	app.lookup("cpV").value = null;
	app.lookup("cmb2").value = null;
	app.lookup("ipb1").value = null;
	app.lookup("call").value = null;
	app.lookup("gender").value = null;
}


/*
 * "승인" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSubOnLoadSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var subOnLoad = e.control;
	var opbRowCnt = app.lookup("rowCount");
	var ds = app.lookup("dsRequest");
	var rowCount = ds.getRowCount();
	opbRowCnt.value = rowCount;
	app.lookup("grd1").redraw();
}



/*
 * 루트 컨테이너에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	// session 확인
	var sessionCheck = app.lookup("smsSessionCheck");
	sessionCheck.setHeader("USER_EMAIL", sessionStorage.getItem("USER_EMAIL"));
	sessionCheck.send().then(function(input){
		if(app.lookup("dmSessionCheck").getValue("result") == 0 ){
			logout(app.getHostAppInstance());
		}
	});
}
