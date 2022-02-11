/************************************************
 * schedule.js
 * Created at 2022. 1. 5. 오전 11:23:01.
 *
 * @author SeongSoo
 ************************************************/

//전역 변수
var initVal;
var userInfo;
var screenWidth = window.screen.width;
var screenHeight = window.screen.height;

var calendar = cpr.core.Module.require("module/calendar");
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
 * 날짜 형식 yyyyMMdd 포맷으로 반환
 */
function getFormatDate(date){
    var year = date.getFullYear();              //yyyy
    var month = (1 + date.getMonth());          //M
    month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
    var day = date.getDate();                   //d
    day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
    return  year + '-' + month + '-' + day;       //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}
/*
 * "근무지 관리" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	util.Dialog.open(app, "2_ptj/dialog/dialog_work_place_list", "400", "550", function(e){
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
			
			app.lookup("cl").redraw();
	}, {});

}


/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	initVal = app.getHost().initValue;
	
	/*global 선언 변수  */
	userInfo = UserInfo.getUserInfo();
	console.log(userInfo.getValue("USER_NUMBER"));
	app.lookup("dmOnLoad").setValue("user_code_ptj", userInfo.getValue("USER_NUMBER"));
	app.lookup("subOnLoad").send();
	app.lookup("month").value = setMonth(); 	
}

/*
 * 사용자 정의 컨트롤에서 addwork 이벤트 발생 시 호출.
 */
function onMonthly_ptjAddwork(/* cpr.events.CAppEvent */ e){
	/** 
	 * @type udc.Monthly_ptj
	 */
	var monthly_ptj = e.control;
	
	var selectedDate = monthly_ptj.getAppProperty("clickdate");
	var dialogW = 450;
	var dialogH = 600;
	var dialogX = screenWidth/2 - dialogW/2;
	var dialogY = screenHeight/2 - dialogH/2;
	
	app.dialogManager.openDialog("2_ptj/dialog/dialog_ptj_daily_schedule", "dailySchedulePopup" ,{width : dialogW, height : dialogH, left: dialogX, top: dialogY}, function(dialog){
		dialog.ready(function(dialogApp){
			dialog.initValue = {"selectedDate": selectedDate};
		});
	})
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
	
	//당월 근무 시간 계산 
	var dsEvnt = app.lookup("dsEvnt");
	var date = new Date();
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	firstDay = getFormatDate(firstDay)
	var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	lastDay = getFormatDate(lastDay)
	console.log("firstDay : "+ firstDay)
	console.log("lastDay : "+ lastDay)
	
	var conditionM = firstDay + "<= work_date <=" + lastDay;
	dsEvnt.setFilter(conditionM);
	var TWH = 0; 
	for(var i=0; i<dsEvnt.getRowCount(); i++){
		TWH += Number(dsEvnt.getValue(i, "WH")) ;
	}
	app.lookup("WHM").value = TWH;
	dsEvnt.clearFilter();
	

	// 맨 처음 일정 생성되는 곳 
	
	var dsEvnt = app.lookup("dsEvnt");
	dsEvnt.setSort("beginDt");
	var i = 0;
	var filter ="";
	var array = app.lookup("dsEvnt").getUnfilteredDistinctValues("store_code");
	//근무 스케줄이 있는 매장은 자동 선택 
	array.forEach(function(each){
		localStorage.setItem(""+each, each);
	});
	
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
	dsEvnt.clearFilter();
	dsEvnt.setFilter(filter);
	app.lookup("cl").redraw();

}


/*
 * 캘린더에서 date-click 이벤트 발생 시 호출.
 * Calendar의 날짜를 클릭 했을때 발생하는 이벤트.
 */
function onCalendarDateClick(/* cpr.events.CDateEvent */ e){
	/** 
	 * @type cpr.controls.Calendar
	 */
	var calendar = e.control;
	var date = e.date;
	
//	var dialogW = 450;
//	var dialogH = 600;
//	var dialogX = screenWidth/2 - dialogW/2;
//	var dialogY = screenHeight/2 - dialogH/2;
	
	app.getHostAppInstance().dialogManager.openDialog("2_ptj/dialog/dialog_ptj_daily_schedule", "dailySchedulePopup" ,{width : 450, height : 600}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.initValue = {
							"selectedDate": moment(date).format("YYYYMMDD"),
							"user_code_ptj" : UserInfo.getUserInfo().getValue("USER_EMAIL"),
						};
					});
				});
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
	var date = e.targetObject.date;

	app.getHostAppInstance().dialogManager.openDialog("2_ptj/dialog/dialog_ptj_daily_schedule", "dailySchedulePopup" ,{width : 450, height : 600, left: 100, top: 100}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.initValue = {
							"selectedDate": moment(date).format("YYYYMMDD"),
							"user_code_ptj" : UserInfo.getUserInfo().getValue("USER_EMAIL"),
						};
					});
				});
	
}


/*
 * "◀" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
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
function onButtonClick3(/* cpr.events.CMouseEvent */ e){
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
function onButtonClick4(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	var now = new Date();
	app.lookup("cl").navigate(now);
	app.lookup("month").value = setMonth();
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
