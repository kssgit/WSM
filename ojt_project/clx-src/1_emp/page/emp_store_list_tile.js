/************************************************
 * store_list.js
 * Created at 2022. 1. 4. 오후 5:14:14.
 *
 * @author SeongSoo
 ************************************************/

var util = createCommonUtil();


/**
 * 아웃풋에 현재 날짜를 리턴합니다.
 * 아웃풋 (optMonth) 의 value 에 바인딩
 */
function setMonth(){
	var cur = app.lookup("cl").current;	
	var year = cur.getFullYear();
	var month = cur.getMonth()+1;
	var result = year + "년  "+ month+ "월";
	return result
};

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	app.lookup("dmOnLoad").setValue("USER_EMAIL",sessionStorage.getItem("USER_EMAIL"));
	app.lookup("dmOnLoad").setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
	app.lookup("subOnLoad").send();
	app.lookup("smsStoreList").send().then(function(input){
		if(localStorage.getItem("store_name") != null && localStorage.getItem("store_name") != '' ){		
			app.lookup("opbSelect").value = "#"+localStorage.getItem("store_name");
			var grd1 = app.lookup("grd1");
			var RIndex = ValueUtil.fixNumber(localStorage.getItem("select_index")) 
			grd1.select({rowIndex : RIndex, cellIndex : 0})
		}
	});
	app.lookup("month").value = setMonth();
	
}

/**
 * 매장 수에따른 크기 변화
 */
function gridSizeEdit(){
	var store_list = app.lookup("dsStoreList");
	var grid_uuid = "uuid-"+app.lookup("grd1").uuid;
	if(store_list.getRowCount() > 0 ){
		document.getElementById(grid_uuid).style.height = store_list.getRowCount()*50 +"px" ;
	}else{
		document.getElementById(grid_uuid).style.height = 0 + "px";
	}
}

/**달력 임베디드 생성 및 데이터 필터링
 * @param start {Boolean}
 */ 
function createMonthly(start){
	
	var dsEvnt = app.lookup("dsEvnt");
	dsEvnt.setSort("beginDt");
	var selectList = app.lookup("dsSelectList");
	dsEvnt.clearFilter();
	//일정데이터 필터링
	if(dsEvnt.getRowCount() > 0){	
		//로컬 스토리지
		var filter = "";
		var i = 0;
		if(Object.keys(localStorage).length >0){
			filter = "store_code == " + localStorage.getItem("select_store");
		}else{
			filter="store_code == 0";
		}
		dsEvnt.clearFilter();
		dsEvnt.setFilter(filter);
		app.lookup("cl").redraw();
	}
}



/*
 * 캘린더에서 item-click 이벤트 발생 시 호출.
 * Calendar의 아이템을 클릭 할 때 발생하는 이벤트. relativeTargetName, item을 통해 정보를 얻을 수 있습니다.
 */
function onCalendarItemClick(/* cpr.events.CItemEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var calendar = e.control;
	if(e.relativeTargetName == "more"){
		var date = e.targetObject.date;
		var voCalendarItems = calendar.getItemsByDate(date);
		var voAnniversaries = calendar.getAnniversariesByDate(date);

		if(voCalendarItems.length < 20){
			var height = 100 + (voCalendarItems.length*30);
		}else{
			var height = 700;
		}
		
	
		util.Dialog.open(app, "1_emp/dialog/CalendarMore", 300, height, function(e) {
			
			/** @type cpr.controls.Dialog */
			var dialog = e.control;
			
		}, {
			date : moment(date).format("YYYY-MM-DD"),
			item : voCalendarItems,
			anniversary : voAnniversaries
		});
	}
}



/*
 * "◀" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("cl").prev();
	app.lookup("month").value = setMonth();
}


/*
 * "▶" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("cl").next();
	app.lookup("month").value = setMonth();
}


/*
 * "today" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var calendar = app.lookup("cl");
	// 오늘날짜로 이동
	var now = new Date();
	calendar.navigate(now);
	app.lookup("month").value = setMonth();
}


/*
 * "매장 리스트" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
//function onButtonClick4(/* cpr.events.CMouseEvent */ e){
//	/** 
//	 * @type cpr.controls.Button
//	 */
//	var button = e.control;
//
//	util.Dialog.open(app, "1_emp/dialog/dialog_work_place_list_emp", "400", "550", function(e){
//		/** @type cpr.controls.Dialog */
//			var dialog = e.control;
//			var returnValue = dialog.returnValue;
//			var dsEvnt = app.lookup("dsEvnt");
//
//			var i = 0;
//			var filter ="";
//			
//			//로컬 스토리지
//			Object.keys(localStorage).forEach(function(key){
//			   console.log(localStorage.getItem(key));
//			   if(i == 0){
//			   	filter +="store_code == " + localStorage.getItem(key);
//			   }else{
//			   	filter += "|| store_code == "+localStorage.getItem(key);
//			   }
//			  i++;
//			});
//			
//			//로컬 스토리지
//			if(Object.keys(localStorage).length < 1){
//				filter ="store_code == 0";
//			}
//			console.log(filter);
//			//필터 재 설정
//			dsEvnt.clearFilter();
//			dsEvnt.setFilter(filter);
//			createMonthly(false);
//			app.lookup("cl").redraw();
//	}, {});
//}


/*
 * 캘린더에서 value-change 이벤트 발생 시 호출.
 * Calendar의 value를 변경하여 변경된 값이 저장된 후에 발생하는 이벤트.
 */
function onClValueChange(/* cpr.events.CValueChangeEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var cl = e.control;
	app.lookup("month").value = setMonth();
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





/*
 * "매장 등록" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick5(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	util.Dialog.open(app, "1_emp/dialog/dialog_emp_register_store", "410", "350", function(e){
		/** @type cpr.controls.Dialog */
			var dialog = e.control;
			app.lookup("smsStoreList").send();
			
		});
}




/*
 * "🔄" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick6(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.lookup("subOnLoad").send();
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
	createMonthly(true);
	app.lookup("cl").redraw();
	var store_list = app.lookup("dsStoreList");
	var grid_uuid = "uuid-"+app.lookup("grd1").uuid;
	
	gridSizeEdit();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsStoreListSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
	/** 
	 * @type cpr.protocols.Submission
	 */
	var smsStoreList = e.control;
	gridSizeEdit();
	app.lookup("grd1").redraw();
}


/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var grd = app.lookup("grd1");
	var message = grd.getRow(grd.getSelectedRowIndex()).getValue("store_name") + "을 삭제하시겠습니까? \n 해당 매장에 등록된 스케줄 정보를 확인 할 수 없습니다."
	if(confirm(message)){
		app.lookup("dmDeleteStore").setValue("STORE_CODE", grd.getRow(grd.getSelectedRowIndex()).getValue("store_code"));
		app.lookup("dmDeleteStore").setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
		app.lookup("smsDeleteStore").send().then(function(e){
			app.lookup("smsStoreList").send();
			app.lookup("subOnLoad").send();
		});
	}
	
}

/*
 * 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick7(e){
	var button = e.control;
	console.log("수정 버튼")
}

/*
 * 그리드에서 selection-change 이벤트 발생 시 호출.
 * detail의 cell 클릭하여 설정된 selectionunit에 해당되는 단위가 선택될 때 발생하는 이벤트.
 */
function onGrd1SelectionChange(e){
	console.log(1234)
	var grd1 = e.control;
	var dmGetPtjList = app.lookup("dmGetPtjList");
	var userNumber = sessionStorage.getItem("USER_NUMBER");
	dmGetPtjList.setValue("USER_NUMBER", userNumber);
	dmGetPtjList.setValue("STORE_CODE", grd1.getSelectedRow().getValue("store_code"));
	app.lookup("subGetPtjList").send().then(function(input){
		var ptjList = app.lookup("dsPtjList")
		var ds = app.lookup("dsEvnt");
		ds.clearFilter();
		localStorage.setItem("select_store", grd1.getSelectedRow().getValue("store_code"));
		localStorage.setItem("select_index", grd1.getSelectedRowIndex());
		localStorage.setItem("store_name", grd1.getSelectedRow().getValue("store_name"));
		var filter = "store_code =="+ grd1.getSelectedRow().getValue("store_code");
		ptjList.setFilter("STORE_CODE =="+ grd1.getSelectedRow().getValue("store_code"));
		ds.setFilter(filter);
		app.lookup("cl").redraw();
		app.lookup("opbSelect").value = "#" + grd1.getSelectedRow().getValue("store_name");
		createPtjList();
	});
}


//선택한 직원을 필터에 추가 및 삭제
function ptjFilter(){
	var grpV = app.lookup("grpPtjLit")
	var grd1 = app.lookup("grd1")
	var ds = app.lookup("dsEvnt");
	ds.clearFilter();
	var filter = ds.getFilter()
	filter += "store_code =="+ grd1.getSelectedRow().getValue("store_code");
	var filterOrigin = "store_code =="+ grd1.getSelectedRow().getValue("store_code");
	var ptjList = grpV.getChildren()
	
	var cnt = 0 //선택 직원 수
	for(var i =0; i < ptjList.length; i++){
		if(ptjList[i].checked == 'true'){ //checked,Name 속성은 UDC 사용자 속성
			var name = ptjList[i].Name
			if(cnt == 0){//첫 번째로 선택한 식원일 경우 && 
				filter += " && label == "+ '"'+name+'"'
			}else{
				filter += " || label == "+ '"'+name+'"'
			}
			cnt++
		}else{
		}
	}
	if(cnt==0){ // 선택된 직원이 없는 경ㅇ
			filter = "store_code == 1 && label == X"  //아무것도 안나오는 조건
	}
	ds.clearFilter();
	ds.setFilter(filter);
	app.lookup("cl").redraw();
}

// 매장별 직원 목록 생성(색상 및 이름)
function createPtjList(){
	var grpV = app.lookup("grpPtjLit")
	var ptjList = app.lookup("dsPtjList");
	grpV.removeAllChildren();
	for(var i=0; i<ptjList.getRowCount(); i++){
		var UDC = new udc.emp.ptj_list_udc();
		UDC.Name = ptjList.getValue(i, "NAME")
		UDC.color = ptjList.getValue(i, "COLOR")
		UDC.addEventListener("udcClick", function(e){
			if(e.control.checked){
				ptjFilter();
			}
		});
		grpV.addChild(UDC, {
			autoSize : "width",
				height : "40px",
				width : "210px"
		});
	}
}

