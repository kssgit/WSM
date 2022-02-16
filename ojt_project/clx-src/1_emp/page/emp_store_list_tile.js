/************************************************
 * store_list.js
 * Created at 2022. 1. 4. 오후 5:14:14.
 *
 * @author SeongSoo
 ************************************************/

var monthNames = ["1월","2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

/*전역 변수 선언*/
//var initVal;
//var userInfo;
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
//	initVal = app.getHost().initValue;
//	userInfo = initVal["userInfo"];
	app.lookup("dmOnLoad").setValue("USER_EMAIL",sessionStorage.getItem("USER_EMAIL"));
	app.lookup("dmOnLoad").setValue("USER_NUMBER", sessionStorage.getItem("USER_NUMBER"));
	app.lookup("subOnLoad").send().then(function(input){
//		localStorage.setItem(""+app.lookup("dsStoreList").getValue(0, "store_code"), app.lookup("dsStoreList").getValue(0, "store_code"));
		
		createMonthly(true);
		storeListDraw(true);
		addStoreUdc();
		app.lookup("cl").redraw();
	});
	app.lookup("month").value = setMonth();
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
	if(dsEvnt.getRowCount() > 1){	
		//로컬 스토리지
		var filter = "";
		var i = 0;
		if(Object.keys(localStorage).length >0){
			Object.keys(localStorage).forEach(function(key){
				if(i == 0 ){
					filter +="store_code == " + localStorage.getItem(key);
				}else{
					filter += "|| store_code == "+localStorage.getItem(key);
				}
				i++;
			});
		}else{
			filter="store_code == 0";
		}
		dsEvnt.clearFilter();
		dsEvnt.setFilter(filter);
		app.lookup("cl").redraw();
	}
}



///** 그룹에 매장 udc 추가  
// * @param start {Boolean}
// */
//function storeListDraw(start){
//	var grp = app.lookup("grpFlow"); // 매장 리스트 그룹
//	var dataSet = app.lookup("dsStoreList"); // 매장 리스트 데이터
//	var selectList = app.lookup("dsSelectList");
//	// 매장 리스트 UDC
//	for(var i=0; i<dataSet.getRowCount(); i++){
//		var storeTile = new udc.emp.store_tile_udc(); // 매장 타일 UDC
//		storeTile.storeName= dataSet.getValue(i, "store_name");
//		storeTile.storecode= dataSet.getValue(i, "store_code");
//			
//		//로컬 스토리지 
//		if(localStorage.getItem(""+dataSet.getValue(i, "store_code"))){
//			storeTile.selected = false;
//		}else{
//			storeTile.selected = true;
//		}
//
//		//매장 tile에 이벤트 추가
//		storeTile.addEventListener("udcClick", function(e){
//			//이미 선택한 매장이면 storeList에서 삭제
//			if(localStorage.getItem(""+SelectStoreCode.getStoreCode())){
//				localStorage.removeItem(""+SelectStoreCode.getStoreCode());
//				createMonthly(false);
//			}else{
//				localStorage.setItem(""+SelectStoreCode.getStoreCode(), SelectStoreCode.getStoreCode());
//				createMonthly(false);
//			}
//			
//		});
//		
//		grp.addChild(storeTile, {
//			autoSize : "none",
//			height : "40px",
//			width : "240px"
//		});
//	}
//}

///**매장 추가 udc 생성 */
//function addStoreUdc(){
//	var grp = app.lookup("grpFlow"); // 매장 리스트 그룹
//	var storeTileAdd = new udc.emp.store_tile_add();
//	grp.addChild(storeTileAdd, {
//		autoSize : "none",
//		height : "40px",
//		width : "250px"
//	});
//	//출판된 이벤트
//	storeTileAdd.addEventListener("groupClick", function (e){
//		util.Dialog.open(app, "1_emp/dialog/dialog_emp_register_store", "410", "350", function(e){
//			/** @type cpr.controls.Dialog */
//			var dialog = e.control;
//			app.lookup("subOnLoad").send().then(function(input){
//				grp.removeAllChildren();
//				storeListDraw(false);
//				createMonthly(false);
//				addStoreUdc();
//			});;
//		}, {/*initValue*/
//		});
//	});
//}


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
		console.log(voCalendarItems.length)
		var height = 100 + (voCalendarItems.length*30)
		
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
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;

	util.Dialog.open(app, "1_emp/dialog/dialog_work_place_list_emp", "400", "550", function(e){
		/** @type cpr.controls.Dialog */
			var dialog = e.control;
			var returnValue = dialog.returnValue;
			var dsEvnt = app.lookup("dsEvnt");

			var i = 0;
			var filter ="";
			
			//로컬 스토리지
			Object.keys(localStorage).forEach(function(key){
			   console.log(localStorage.getItem(key));
			   if(i == 0){
			   	filter +="store_code == " + localStorage.getItem(key);
			   }else{
			   	filter += "|| store_code == "+localStorage.getItem(key);
			   }
			  i++;
			});
			
			//로컬 스토리지
			if(Object.keys(localStorage).length < 1){
				filter ="store_code == 0";
			}
			console.log(filter);
			//필터 재 설정
			dsEvnt.clearFilter();
			dsEvnt.setFilter(filter);
			createMonthly(false);
			app.lookup("cl").redraw();
	}, {});
}


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
