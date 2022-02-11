/************************************************
 * Daily.js
 * Created at 2020. 5. 6. 오전 11:24:15.
 *
 * @author ryu
 ************************************************/

/************************************************
 * 전역 변수
 ************************************************/

var mnDFarFromNow= 0; // 음수는 미래, 양수는 과거 (오늘 날짜 기준, 일)
var initVal;
var dataset;
var datamap;
var userKind;
var pageID;
/************************************************
 * 사용자 정의 함수
 ************************************************/

function initializeCalendar() {
	/* 지역 설정 (works globally) */
	var vsLocale = datamap.getValue("locale");
	
	cpr.I18N.INSTANCE.currentLanguage = vsLocale;
	moment.locale(vsLocale);
	
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
	var voStdDate = moment().subtract(mnDFarFromNow, "days");
	
	app.lookup("lblRng").value = moment(voStdDate).format("YYYY-MM-DD");
}


/**
 * 캘린더의 요일에 대한 정보를 표시합니다.
 */
function setCalendarDayNames() {
	var vcGrpDayNm = app.lookup("grpDayNm");
	
	vcGrpDayNm.getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-month-dayname-item");
	}).forEach(function(/* cpr.controls.Output */ each, index){
		var vnEachDate = moment().subtract(mnDFarFromNow, "days")
			.add(index, "days").day();
		
		/** @type String */
		var vsDayOfWeek = "";
		
		var vsDayOfWeekFom = datamap.getValue("dayOfWeekFom");
		
		/* 요일 표시 형식 처리 */
		switch(vsDayOfWeekFom){
			case "min" :
				vsDayOfWeek = moment.weekdaysMin(vnEachDate); // MN
				break;
				
			case "short" :
				vsDayOfWeek = moment.weekdaysShort(vnEachDate); // MON
				break;
				
			default :
				vsDayOfWeek = moment.weekdays(vnEachDate); // MONDAY
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
	
	/* 요일 생성 */
	setCalendarDayNames();
	
	var voStdDate = moment().subtract(mnDFarFromNow, "days");

	app.lookup("grpDayNm").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-daily-date");
	}).forEach(function(/* cpr.controls.Output */ each, index){
		var vsEachDate = moment().subtract(mnDFarFromNow, "days")
			.add(index, "days").format("YYYYMMDD");
		
		each.value = vsEachDate;
		
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
	
	var voStdDate = moment().subtract(mnDFarFromNow, "days");
	
	var vsStdBgnDt = moment(voStdDate).startOf("day").format("YYYYMMDD");
	var vsStdEndDt = moment(voStdDate).endOf("day").format("YYYYMMDD");
	
	var vsEvntCond = "beginDt ^= " + vsStdBgnDt + " || endDt ^= " + vsStdEndDt;
	
	var vaThisMonthEvnts = dataset.findAllRow(vsEvntCond);
	
	if (vaThisMonthEvnts.length == 0){
		return;
	}
	
	vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		
		var vsBgnDt = voEvntData.beginDt;
		var vsEndDt = voEvntData.endDt;
		
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.ellipsis = true;
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
		
//		색깔
		vcEvnt.style.setClasses("daily-schedule-event-title", "red");
		
		var vnColIdx = moment(vsBgnDt, "YYYYMMDDhhmm").weekday() + 1;
		var vnRowIdx = parseInt(moment(vsBgnDt, "YYYYMMDDHHmm").format("HH")) * 2;
		var vnRowSpan = (moment.duration(moment(vsEndDt, "YYYYMMDDHHmm")
			.diff(moment(vsBgnDt, "YYYYMMDDHHmm"))).asMinutes() / 30);
		var vnSpc = 5;
		
		if (voEvntData.allDay == "true"){
			/** @type cpr.controls.Container */
			var vcTargetCalendarCn = app.lookup("grpFxTmCldrCn").getChildren()[1];
			
			vcTargetCalendarCn.addChild(vcEvnt, {
				height : "20px"
			});
		} else {
			vcEvnt.value = moment(voEvntData.beginDt, "YYYYMMDDhhmm").format("hh:mm") 
				+ " " + vcEvnt.value;

			var vcGrpTmCldrCn = app.lookup("grpTmCldrCn");
				
			vcGrpTmCldrCn.addChild(vcEvnt, {
				colIndex : vnColIdx,
				rowIndex : vnRowIdx,
				colSpan : 1,
				rowSpan : vnRowSpan != 0 ? vnRowSpan : 1,
				topSpacing : vnSpc,
				rightSpacing : vnSpc,
				bottomSpacing : vnSpc,
				leftSpacing : vnSpc
			});
		}
	});
}


/**
 * 표시되었던 날짜 정보를 지웁니다.
 */
function eraseCalendarDates() {
	app.lookup("grpDayNm").getAllRecursiveChildren(false).filter(function(each){
		return each.style.hasClass("calendar-daily-date");
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
		return each.style.hasClass("daily-schedule-event-title");
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
		"stdAmnt" : mnDFarFromNow,
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
	initVal = app.getHost().initValue;
	dataset = initVal["dsEvnt"];
	datamap = initVal["dmRes"];
	userKind = initVal["userKind"];
	pageID = initVal["pageID"];
	initializeCalendar();
	createScheduleEvents();
}




/*
 * 버튼(btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnPrevClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnPrev = e.control;
	
	mnDFarFromNow++;
	
	setCalendarHeaderDates();
	
	setCalendarDates();
	
	createScheduleEvents();
}


/*
 * 버튼(btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onBtnNextClick(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var btnNext = e.control;
	
	mnDFarFromNow--;
	
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
	
	mnDFarFromNow = 0;
	
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
