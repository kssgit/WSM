/************************************************
 * Monthly.js
 * Created at 2020. 5. 6. 오전 11:24:00.
 *
 * @author ryu
 ************************************************/
/************************************************
 * 전역 변수
 ************************************************/
var calendar = cpr.core.Module.require("module/calendar");
var mnMFarFromNow= 0; // 음수는 미래, 양수는 과거 (오늘 날짜 기준, 달)
var initVal;
var dataset;
var datamap;
var userKind;
var userEmail;
var pageID;
/************************************************
 * 사용자 정의 함수
 ************************************************/


/**
 * 캘린더 초기값 설정
 */
function initializeCalendar() {
	/* 지역 설정 (works globally) */
	var vsLocale = datamap.getValue("locale");
	
	cpr.I18N.INSTANCE.currentLanguage = vsLocale;
	moment.locale(vsLocale);
	
	/* 캘린더 요일 생성 */
	setCalendarDayNames();
	
	/* 캘린더 날짜 생성 */
	setCalendarDates();
}


/**
 * 캘린더 헤더에 현재 표시하고 있는 날짜 정보를 표시합니다.
 * 
 * @param {Date} poStdDate 기준 날짜 (주 또는 일에서 화면 전환 시 사용되는 파라미터)
 */
function setCalendarHeaderDates(poStdDate) {
	//TODO 기준 날짜를 기준으로 해서 표시될 날짜 정하기
	var voStdDate = moment().subtract(mnMFarFromNow, "months");
	
	app.lookup("lblRng").value = moment(voStdDate).format("YYYY년 MM월");
}


/**
 * 캘린더의 요일에 대한 정보를 표시합니다.
 */
function setCalendarDayNames() {
	var vcGrpDayNm = app.lookup("grpDayNm");
	
	vcGrpDayNm.getChildren().forEach(function(/* cpr.controls.Output */ each, index){
		/** @type String */
		var vsDayOfWeek = "";
		
		var vsDayOfWeekFom = datamap.getValue("dayOfWeekFom");
		
		/* 요일 표시 형식 처리 */
		switch(vsDayOfWeekFom){
			case "min" :
				vsDayOfWeek = moment.weekdaysMin(index); // MN
				break;
				
			case "short" :
				vsDayOfWeek = moment.weekdaysShort(index); // MON
				break;
				
			default :
				vsDayOfWeek = moment.weekdays(index); // MONDAY
				break;
		}
		
		each.value = vsDayOfWeek.toUpperCase();
	});
}


/**
 * 캘린더의 날짜 정보를 표시합니다.
 */
function setCalendarDates() {
	/* 날짜 정보 초기화 */
	eraseCalendarDates();

	var voStdDate = moment().subtract(mnMFarFromNow, "months");

	var voFirstDayOfMonth = moment(voStdDate).startOf("month");
	var vnLastDayOfMonth = moment(voStdDate).daysInMonth();
	
	var vnStartIdx = voFirstDayOfMonth.weekday();

	/* 표시 날짜에 따라 5주 또는 6주로 표시 */
	setLastWeekVisible(vnLastDayOfMonth + vnStartIdx);
	
	/** @type cpr.controls.Output[] */
	var vaCldrDates = app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-monthly-date");
	}).slice(vnStartIdx, vnStartIdx + vnLastDayOfMonth);
	vaCldrDates.forEach(function(/* cpr.controls.Output */ each, index){
		var vsEachDate = moment().subtract(mnMFarFromNow, "months")
			.startOf("month").add(index, "days").format("YYYYMMDD");
			
		each.value = vsEachDate;
		//알바생 schedule 페이지에서만 이벤트 생성 -- 다른 조건으로 이벤트 생성 가능
//		var vaThisMonthEvnts = dataset.findAllRow(vsEvntCond);
		if(userKind == "ptj" && pageID =="schedule"){
			each.getParent().addEventListener("click", function(e){
				var selectedDate = vsEachDate;
//				console.log(selectedDate)			
				app.getHostAppInstance().getHostAppInstance().dialogManager.openDialog("2_ptj/dialog/dialog_ptj_daily_schedule", "dailySchedulePopup" ,{width : 450, height : 600, left: 100, top: 100}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.initValue = {
							"selectedDate": selectedDate,
							"user_code_ptj" : userEmail,
						};
					});
				})
			});
		}
		
		//오늘 날짜
		if (moment().format("YYYYMMDD") == vsEachDate){
			each.style.addClass("calendar-today");
		}
	});
}


/**
 * 캘린더에 일정 정보를 생성하여 표시합니다.
 */
function createScheduleEvents() {
	/* 일정 정보 초기화 */
	removeScheduleEvents();
	
	var voStdDate = moment().subtract(mnMFarFromNow, "months");
	
	var vsStdBgnDt = moment(voStdDate).startOf("month").format("YYYYMM");
	var vsStdEndDt = moment(voStdDate).endOf("month").format("YYYYMM");
	
	var vsEvntCond = "beginDt ^= " + vsStdBgnDt + " || endDt ^= " + vsStdEndDt;
	
	var vaThisMonthEvnts = dataset.findAllRow(vsEvntCond);
	if (vaThisMonthEvnts == null || vaThisMonthEvnts.length == 0 ){
		return;
	}
	vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		console.log("일정 데이터 : "+voEvntData.class);
		var vcCldrDate = getCalendarDate(voEvntData.beginDt);
		
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.ellipsis = true;
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
//		vcEvnt.style.setClasses("monthly-schedule-event-title", voEvntData.class);
		vcEvnt.style.setClasses("monthly-schedule-event-title", "red");
		if (voEvntData.allDay == "true"){
			vcEvnt.style.addClass("full-time");
		} else {
			vcEvnt.value = moment(voEvntData.beginDt, "YYYYMMDDhhmm").format("HH:mm") 
				+ " " + vcEvnt.value;
		}
		/* 캘린더에 표시되는 일정 개수 제한 (5개 이상은 +더보기)*/
			var childCnt = vcCldrDate.getParent().getChildrenCount();
			if(childCnt == 5){
				var vcMore = new cpr.controls.Output("more");
				vcMore.style.setClasses("monthly-schedule-event-title", "more");
				vcMore.value = "+ 더보기"
				vcCldrDate.getParent().addChild(vcMore, {
					height : "18px",
					width: "100%"
				});
				//더보기 버튼에 오픈 다이얼로그 이벤트 등록
					vcMore.addEventListener("click", function(e){
					app.dialogManager.openDialog("3_cmn/CalendarMore", "viewMoreSchedule", {width : 500, height : 500}, function(dialog) {
						dialog.ready(function(dialogApp){
							var selectedDate =  voEvntData.beginDt.substring(0, 8)
							dialog.initValue = {"selectedDate": selectedDate};
						});
					})
				});
			}else if(childCnt > 5){
				
			}else{
				vcCldrDate.getParent().addChild(vcEvnt, {
					height : "15px",
					width: "100%"
				});
			}/*더보기 설정 여기까지 */
	}); /* forEach 반복 구간 여기까지 */
}


/**
 * 6주에 해당하는 행을 숨기거나 표시합니다.
 * @param {Number} pnGridCnt
 */
function setLastWeekVisible(pnGridCnt) {
	var vcGrpCldrCn = app.lookup("grpCldrCn");
	var vcGrpCldrCnLt = vcGrpCldrCn.getLayout();
	
	if (pnGridCnt > (7 * 5)){
		vcGrpCldrCnLt.setRowVisible(5, true);
	} else {
		vcGrpCldrCnLt.setRowVisible(5, false);
	}
}


/**
 * 표시되었던 날짜 정보를 지웁니다.
 */
function eraseCalendarDates() {
	app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-monthly-date");
	}).forEach(function(/* cpr.controls.Output */ each){
		each.value = null;
		
		if (each.style.hasClass("calendar-today")){
			each.style.removeClass("calendar-today");
		}
	});
}


/**
 * 캘린더에 그려졌던 일정 정보를 제거합니다.
 */
function removeScheduleEvents() {
	app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("monthly-schedule-event-title");
	}).forEach(function(/* cpr.controls.Output */ each){
		each.getParent().removeChild(each, true);
	});
}


/**
 * 일치하는 날짜 컨트롤을 반환합니다.
 * @param {String} psValue
 * @return {cpr.controls.Output}
 * 
 * @alt 모든 날짜 컨트롤을 반환합니다.
 * @return {cpr.controls.Output[]}
 */
function getCalendarDate(psValue) {
	/** @type cpr.controls.Output[] */
	var vaCldrDates = app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-monthly-date");
	});
	
	if (!_.isString(psValue)){
		psValue = psValue.toString();
	}
	
	if (moment(psValue, "YYYYMMDDhhmm").isValid()){
		return vaCldrDates.filter(function(/* cpr.controls.Output */ each){
			return each.value == psValue.substring(0, 8);
		})[0];
	}
	
	return vaCldrDates;
}


/**
 * 다른 유형을 캘린더로 이동합니다.
 * @param {#app} psAppId
 */
function changeCalendarType(psAppId) {
	var vcEmb = app.getHostAppInstance().lookup("ea1")
	var voInitValue = {
		"dsEvnt" : dataset,
		"dmRes"  : datamap,
		"userKind" : userKind,
		"stdAmnt" : mnMFarFromNow,
		"pageID" : pageID,
		"type" : "monthly"
	};
	
	cpr.core.App.load(psAppId, function(/*cpr.core.App*/ loadedApp){
		/*임베디드앱에 안에 앱이 있는 경우에는 앱을 삭제해줍니다.(다시 앱을 열고싶을때 스크립트 작성)*/
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


/************************************************
 * 컨트롤 이벤트
 ************************************************/

/*
 * Body에서 init 이벤트 발생 시 호출.
 * 앱이 최초 구성될 때 발생하는 이벤트 입니다.
 */
function onBodyInit(/* cpr.events.CEvent */ e){
	setCalendarHeaderDates();
}


/*
 * Body에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
//	app.lookup("subOnLoad").send();
	console.log("달력");
	initVal = app.getHost().initValue;
	dataset = initVal["dsEvnt"];
	datamap = initVal["dmRes"];
	userKind = initVal["userKind"];
	pageID = initVal["pageID"];
	userEmail = initVal["userEmail"];
	
	// 고용주일 시 일간 주간 달력 버튼 비활성화
	
	
	initializeCalendar();
	calendar.createScheduleEvents(app, "months",dataset);
}



/*
 * "<" 버튼(btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPrevClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPrev = e.control;
	
	mnMFarFromNow++;
	
	setCalendarHeaderDates();
	
	setCalendarDates();
	
	createScheduleEvents();
}


/*
 * ">" 버튼(btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNextClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnNext = e.control;
	
	mnMFarFromNow--;
	
	setCalendarHeaderDates();
	
	setCalendarDates();
	
	createScheduleEvents();
}


/*
 * "Today" 버튼(btnToday)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnTodayClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnToday = e.control;
	
	mnMFarFromNow = 0;
	
	setCalendarHeaderDates();
	
	setCalendarDates();
	
	createScheduleEvents();
}


/*
 * "Day" 버튼(btnDay)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnDayClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnDay = e.control;
	
	changeCalendarType("app/calendar/Daily");
}


/*
 * "Week" 버튼(btnWeek)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnWeekClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnWeek = e.control;
	
	changeCalendarType("app/calendar/Weekly");
}


/*
 * "Month" 버튼(btnMonth)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnMonthClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnMonth = e.control;
	
	changeCalendarType("app/calendar/Monthly");
}
