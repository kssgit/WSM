/************************************************
 * calendar.module.js
 * Created at 2022. 1. 16. 오후 4:28:52.
 *
 * @author ksk19
 ************************************************/

/**
 *  캘린더 공통 모듈입니다. 
 *  initializeCalendar
 *  setCalendarHeaderDates
 *  createScheduleEvents
 *  위 세 함수는 exports로 내보내고 var를 통해 지역 함수로 한번 더 선언했습니다.
 *  함수 툴팁에 app과 unit이라는 인자가 있다면 꼭 입력해주시기 바랍니다. 
 * 	app은 app으로 입력해주시고, unit 위치에는 페이지에 맞게 months, weeks, days 중 하나로 입력해주시기 바랍니다.
 * 
 * 
 * 	캘린더 함수 중 컨트롤에 입력된 이벤트들도 하나로 모듈화 했습니다.
 * 	각 clx 파일에서 컨트롤에 입력되어있는 이벤트 명과 동일하므로 이벤트 내에 calendar.이벤트명 으로 호출해주시면 됩니다.
 * */
// 예시 ↓
// 	function onBtnMonthClick(/* cpr.events.CMouseEvent */ e){
//		calendar.onBtnMonthClick(app);
//	}
 


exports.id = "calendar.module.js";
var mnMFarFromNow= 0; // 음수는 미래, 양수는 과거 (오늘 날짜 기준, 달)
var mnWFarFromNow= 0; // 음수는 미래, 양수는 과거 (오늘 날짜 기준, 주)
var mnDFarFromNow= 0; // 음수는 미래, 양수는 과거 (오늘 날짜 기준, 일)

/************************************************
 * 사용자 정의 함수
 ************************************************/


/**
 * 캘린더 초기값 설정
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} vsLocale 앱인스턴스
 */
exports.initializeCalendar = function (app, unit,dmRes) {
//	var vsLocale = app.lookup("dmRes").getValue("locale");
	var vsLocale = dmRes.getValue("locale");
	
	cpr.I18N.INSTANCE.currentLanguage = vsLocale;
	/* 지역 설정 (works globally) */
	moment.locale(vsLocale);
	
	/* 캘린더 요일 생성 */
	setCalendarDayNames(app,unit, dmRes);
	
	/* 캘린더 날짜 생성 */
	setCalendarDates(app, unit,dmRes);
}

/**
 * 캘린더 초기값 설정
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} vsLocale 앱인스턴스
 *  @param {cpr.data.DataMap} dmRes datamap
 */
var initializeCalendar = function (app, unit,dmRes) {
	/* 지역 설정 (works globally) */
//	var vsLocale = app.lookup("dmRes").getValue("locale");
	var vsLocale = dmRes.getValue("locale");
	
	cpr.I18N.INSTANCE.currentLanguage = vsLocale;
	moment.locale(vsLocale);
	
	/* 캘린더 요일 생성 */
	setCalendarDayNames(app,unit, dmRes);
	
	/* 캘린더 날짜 생성 */
	setCalendarDates(app, unit,dmRes);
}


/**
 * 캘린더 헤더에 현재 표시하고 있는 날짜 정보를 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Date} poStdDate 기준 날짜 (주 또는 일에서 화면 전환 시 사용되는 파라미터)
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
exports.setCalendarHeaderDates = function (app, unit, poStdDate) {
	console.log(unit);
	//TODO 기준 날짜를 기준으로 해서 표시될 날짜 정하기
	var voStdDate = moment().subtract(mnMFarFromNow, unit);
	if(unit == "months"){
		app.lookup("lblRng").value = moment(voStdDate).format("YYYY MMMM");
	}else if(unit == "weeks"){
		var vsStrDate = moment(voStdDate).startOf(unit).format("MMMM D");
		var vsEndDate = moment(voStdDate).endOf(unit).format("MMMM D");
		var vsWeekRng = vsStrDate + " - " + vsEndDate + ", " + moment(voStdDate).format("YYYY");
		app.lookup("lblRng").value = vsWeekRng;
	}else if(unit == "days"){
			app.lookup("lblRng").value = moment(voStdDate).format("YYYY-MM-DD");
	}
}

/**
 * 캘린더 헤더에 현재 표시하고 있는 날짜 정보를 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {Date} poStdDate 기준 날짜 (주 또는 일에서 화면 전환 시 사용되는 파라미터)
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
var setCalendarHeaderDates = function (app, unit, poStdDate) {
	//TODO 기준 날짜를 기준으로 해서 표시될 날짜 정하기
	var voStdDate = moment().subtract(mnMFarFromNow, unit);
	if(unit == "months"){
		app.lookup("lblRng").value = moment(voStdDate).format("YYYY MMMM");
	}else if(unit == "weeks"){
		var vsStrDate = moment(voStdDate).startOf(unit).format("MMMM D");
		var vsEndDate = moment(voStdDate).endOf(unit).format("MMMM D");
		var vsWeekRng = vsStrDate + " - " + vsEndDate + ", " + moment(voStdDate).format("YYYY");
		app.lookup("lblRng").value = vsWeekRng;
	}else if(unit == "days"){
			app.lookup("lblRng").value = moment(voStdDate).format("YYYY-MM-DD");
	}
}

/**
 * 캘린더의 요일에 대한 정보를 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
var setCalendarDayNames = function (app,unit ,dmRes) {
	var vcGrpDayNm = app.lookup("grpDayNm");
	
	if(unit == "months"){
		vcGrpDayNm.getChildren().forEach(function(/* cpr.controls.Output */ each, index){
			/** @type String */
			var vsDayOfWeek = "";
			
//			var vsDayOfWeekFom = app.lookup("dmRes").getValue("dayOfWeekFom");
			var vsDayOfWeekFom = dmRes.getValue("dayOfWeekFom");
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
	}else if(unit == "weeks"){	
		vcGrpDayNm.getAllRecursiveChildren(false).filter(function(each){
			return each.style.hasClass("calendar-month-dayname-item");
		}).forEach(function(/* cpr.controls.Output */ each, index){
			/** @type String */
			var vsDayOfWeek = "";
			
//			var vsDayOfWeekFom = app.lookup("dmRes").getValue("dayOfWeekFom");
			var vsDayOfWeekFom = dmRes.getValue("dayOfWeekFom");
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
	}else if(unit == "days"){
	
		vcGrpDayNm.getAllRecursiveChildren(false).filter(function(each){
			return each.style.hasClass("calendar-month-dayname-item");
		}).forEach(function(/* cpr.controls.Output */ each, index){
			var vnEachDate = moment().subtract(mnDFarFromNow, "days")
				.add(index, "days").day();
			
			/** @type String */
			var vsDayOfWeek = "";
			
//			var vsDayOfWeekFom = app.lookup("dmRes").getValue("dayOfWeekFom");
			var vsDayOfWeekFom =dmRes.getValue("dayOfWeekFom");
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
}


/**
 * 캘린더의 날짜 정보를 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
var setCalendarDates = function (app, unit, dmRes) {
	console.log(unit)
	/* 날짜 정보 초기화 */
	eraseCalendarDates(app);
	
	/* 요일 생성 */
	setCalendarDayNames(app,unit, dmRes);
	
	var voStdDate = moment().subtract(mnMFarFromNow, unit);
	
	if(unit == "months"){	
		var voFirstDayOfMonth = moment(voStdDate).startOf("month");
		var vnLastDayOfMonth = moment(voStdDate).daysInMonth();
		
		var vnStartIdx = voFirstDayOfMonth.weekday();
	
		/* 표시 날짜에 따라 5주 또는 6주로 표시 */
		setLastWeekVisible(app, vnLastDayOfMonth + vnStartIdx);
		
		/** @type cpr.controls.Output[] */
		var vaCldrDates = app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
			return each.style.hasClass("calendar-monthly-date");
		}).slice(vnStartIdx, vnStartIdx + vnLastDayOfMonth);
		
		vaCldrDates.forEach(function(/* cpr.controls.Output */ each, index){
			var vsEachDate = moment().subtract(mnMFarFromNow, "months")
				.startOf("month").add(index, "days").format("YYYYMMDD");
				
			each.value = vsEachDate;
			//김경수 : 캘린더 클릭 시 그날의 날짜 가져오기 (YYYYMMDD)
			each.getParent().addEventListener("click", function(e){
				var selectedDate = vsEachDate;
				console.log(selectedDate)
				
				
				app.dialogManager.openDialog("2_ptj/ptj_daily_schedule", "dailySchedulePopup" ,{width : 450, height : 600, left: 100, top: 100}, function(dialog){
					dialog.ready(function(dialogApp){
						dialog.initValue = {"selectedDate": selectedDate};
					});
				})
			});
			
			
			if (moment().format("YYYYMMDD") == vsEachDate){
				each.style.addClass("calendar-today");
			}
		});
	}else if (unit == "weeks"){
			app.lookup("grpDayNm").getAllRecursiveChildren(false).filter(function(each){
			return each.style.hasClass("calendar-weekly-date");
		}).forEach(function(/* cpr.controls.Output */ each, index){
			var vsEachDate = moment().subtract(mnWFarFromNow, "weeks")
				.startOf("weeks").add(index, "days").format("YYYYMMDD");
			
			each.value = vsEachDate;
			
			if (moment().format("YYYYMMDD") == vsEachDate){
				each.style.addClass("calendar-today");
			}
		});
	}else if(unit == "days"){
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
	
}


/**
 * 캘린더에 일정 정보를 생성하여 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 * @param {cpr.data.DataSet} dsEvnt dataset(사용자 일정 값)
 */
exports.createScheduleEvents = function (app, unit, dsEvnt) {
	/* 일정 정보 초기화 */
	removeScheduleEvents(app, unit);
	
	var voStdDate = moment().subtract(mnMFarFromNow, unit);
	
	
	if(unit == "months"){
		var vsStdBgnDt = moment(voStdDate).startOf(unit).format("YYYYMM");
		var vsStdEndDt = moment(voStdDate).endOf(unit).format("YYYYMM");
	}else if (unit == "weeks"){
		var voStdBgnDt = moment(voStdDate).startOf("week");
		var voStdEndDt = moment(voStdDate).endOf("week");
		
		var vsStdBgnDt = voStdBgnDt.format("YYYYMM");
		var vsStdEndDt = voStdEndDt.format("YYYYMM");
	}else if(unit == "days"){
		var vsStdBgnDt = moment(voStdDate).startOf(unit).format("YYYYMMDD");
		var vsStdEndDt = moment(voStdDate).endOf(unit).format("YYYYMMDD");
	}
	
	var vsEvntCond = "beginDt ^= " + vsStdBgnDt + " || endDt ^= " + vsStdEndDt;
//	var vaThisMonthEvnts = app.lookup("dsEvnt").findAllRow(vsEvntCond);
	var vaThisMonthEvnts = dsEvnt.findAllRow(vsEvntCond);
	
	if ( vaThisMonthEvnts == null || vaThisMonthEvnts.length == 0){
		return;
	}
	
	if(unit == "months"){
		vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		
		var vcCldrDate = getCalendarDate(voEvntData.beginDt, app);
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
		
		vcEvnt.style.setClasses("monthly-schedule-event-title", "red");
		
			if (voEvntData.allDay == "true"){
				vcEvnt.style.addClass("full-time");
			} else {
				vcEvnt.value = moment(voEvntData.beginDt, "YYYYMMDDhhmm").format("HH:mm")+ " " + vcEvnt.value;
			}
			
			/* 캘린더에 표시되는 일정 개수 제한 (5개 이상은 +더보기)*/
			var childCnt = vcCldrDate.getParent().getChildrenCount();
			if(childCnt == 4){
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
			}else if(childCnt > 4){
			}else{
				vcCldrDate.getParent().addChild(vcEvnt, {
					height : "15px",
					width: "100%"
				});
			}/*더보기 여기까지 */
		});
		
		
	}else if (unit == "weeks"){
		/* 기준 주간에 포함되는 일정만 필터 */	
		vaThisMonthEvnts.filter(function(each){
			var vsEndDt = each.getValue("endDt");
			return moment(vsEndDt, "YYYYMMDD").isBetween(voStdBgnDt.format("YYYYMMDD"), voStdEndDt.format("YYYYMMDD"));
		}).forEach(function(each){
			/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
			var voEvntData = each.getRowData();
			
			var vsBgnDt = voEvntData.beginDt;
			var vsEndDt = voEvntData.endDt;
			
			var vcEvnt = new cpr.controls.Output(voEvntData.id);
			
			vcEvnt.ellipsis = true;
			vcEvnt.value = voEvntData.label;
			vcEvnt.tooltip = voEvntData.label;
			
			vcEvnt.style.setClasses("weekly-schedule-event-title", voEvntData.class);
			
			var vnColIdx = moment(vsBgnDt, "YYYYMMDDHHmm").weekday() + 1;
			var vnRowIdx = parseInt(moment(vsBgnDt, "YYYYMMDDHHmm").format("HH")) * 2;
			var vnRowSpan = (moment.duration(moment(vsEndDt, "YYYYMMDDHHmm")
				.diff(moment(vsBgnDt, "YYYYMMDDHHmm"))).asMinutes() / 30);
			var vnSpc = 5;
			
			if (voEvntData.allDay == "true"){
				/** @type cpr.controls.Container */
				var vcTargetCalendarCn = app.lookup("grpFxTmCldrCn").getChildren()[vnColIdx];
				
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
	}else if(unit == "days"){
		vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		
		var vsBgnDt = voEvntData.beginDt;
		var vsEndDt = voEvntData.endDt;
		
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.ellipsis = true;
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
		
		vcEvnt.style.setClasses("daily-schedule-event-title", voEvntData.class);
		
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
}

/**
 * 캘린더에 일정 정보를 생성하여 표시합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 * @param {cpr.data.DataSet} dsEvnt dataset(사용자 일정 값)
 */
var createScheduleEvents = function (app, unit,dsEvnt) {
	console.log(unit);
	/* 일정 정보 초기화 */
	removeScheduleEvents(app, unit);
	
	var voStdDate = moment().subtract(mnMFarFromNow, unit);
	
	
	if(unit == "months"){
		var vsStdBgnDt = moment(voStdDate).startOf(unit).format("YYYYMM");
		var vsStdEndDt = moment(voStdDate).endOf(unit).format("YYYYMM");
	}else if (unit == "weeks"){
		var voStdBgnDt = moment(voStdDate).startOf("week");
		var voStdEndDt = moment(voStdDate).endOf("week");
		
		var vsStdBgnDt = voStdBgnDt.format("YYYYMM");
		var vsStdEndDt = voStdEndDt.format("YYYYMM");
	}else if(unit == "days"){
		var vsStdBgnDt = moment(voStdDate).startOf(unit).format("YYYYMMDD");
		var vsStdEndDt = moment(voStdDate).endOf(unit).format("YYYYMMDD");
	}
	
	var vsEvntCond = "beginDt ^= " + vsStdBgnDt + " || endDt ^= " + vsStdEndDt;
//	var vaThisMonthEvnts = app.lookup("dsEvnt").findAllRow(vsEvntCond);
	var vaThisMonthEvnts = dsEvnt.findAllRow(vsEvntCond);
	if (vaThisMonthEvnts.length == 0){
		return;
	}
	
	if(unit == "months"){
		vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		
		var vcCldrDate = getCalendarDate(voEvntData.beginDt, app);
		
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.ellipsis = true;
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
		
		vcEvnt.style.setClasses("monthly-schedule-event-title", voEvntData.class);
		
			if (voEvntData.allDay == "true"){
				vcEvnt.style.addClass("full-time");
			} else {
				vcEvnt.value = moment(voEvntData.beginDt, "YYYYMMDDhhmm").format("HH:mm") + "~" + moment(voEvntData.endDt, "YYYYMMDDhhmm").format("HH:mm") 
					+ " " + vcEvnt.value;
			}
			
			vcCldrDate.getParent().addChild(vcEvnt, {
				height : "20px",
				width: "100%"
			});
		});
	}else if (unit == "weeks"){
		/* 기준 주간에 포함되는 일정만 필터 */	
		vaThisMonthEvnts.filter(function(each){
			var vsEndDt = each.getValue("endDt");
			return moment(vsEndDt, "YYYYMMDD").isBetween(voStdBgnDt.format("YYYYMMDD"), voStdEndDt.format("YYYYMMDD"));
		}).forEach(function(each){
			/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
			var voEvntData = each.getRowData();
			
			var vsBgnDt = voEvntData.beginDt;
			var vsEndDt = voEvntData.endDt;
			
			var vcEvnt = new cpr.controls.Output(voEvntData.id);
			
			vcEvnt.ellipsis = true;
			vcEvnt.value = voEvntData.label;
			vcEvnt.tooltip = voEvntData.label;
			
			vcEvnt.style.setClasses("weekly-schedule-event-title", voEvntData.class);
			
			var vnColIdx = moment(vsBgnDt, "YYYYMMDDHHmm").weekday() + 1;
			var vnRowIdx = parseInt(moment(vsBgnDt, "YYYYMMDDHHmm").format("HH")) * 2;
			var vnRowSpan = (moment.duration(moment(vsEndDt, "YYYYMMDDHHmm")
				.diff(moment(vsBgnDt, "YYYYMMDDHHmm"))).asMinutes() / 30);
			var vnSpc = 5;
			
			if (voEvntData.allDay == "true"){
				/** @type cpr.controls.Container */
				var vcTargetCalendarCn = app.lookup("grpFxTmCldrCn").getChildren()[vnColIdx];
				
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
	}else if(unit == "days"){
		vaThisMonthEvnts.forEach(function(each){
		/** @type {{id:String, label:String, beginDt:String, endDt:String, allDay:String, class:String}} */
		var voEvntData = each.getRowData();
		
		var vsBgnDt = voEvntData.beginDt;
		var vsEndDt = voEvntData.endDt;
		
		var vcEvnt = new cpr.controls.Output(voEvntData.id);
		
		vcEvnt.ellipsis = true;
		vcEvnt.value = voEvntData.label;
		vcEvnt.tooltip = voEvntData.label;
		
		vcEvnt.style.setClasses("daily-schedule-event-title", voEvntData.class);
		
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
	
}


/**
 * 6주에 해당하는 행을 숨기거나 표시합니다.
 * @param {Number} pnGridCnt
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
var setLastWeekVisible = function (app, pnGridCnt) {
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
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
function eraseCalendarDates(app) {
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
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
exports.removeScheduleEvents = function (app, unit) {
	app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		if(unit == "months"){
			return each.style.hasClass("monthly-schedule-event-title");
		}else if(unit == "weeks"){
			return each.style.hasClass("weekly-schedule-event-title");
		}else if(unit == "days"){
			return each.style.hasClass("daily-schedule-event-title");
		}
	}).forEach(function(/* cpr.controls.Output */ each){
		each.getParent().removeChild(each, true);
	});
}
/**
 * 캘린더에 그려졌던 일정 정보를 제거합니다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 */
function removeScheduleEvents(app, unit) {
	app.lookup("grpCldrCn").getAllRecursiveChildren(false).filter(function(each){
		if(unit == "months"){
			return each.style.hasClass("monthly-schedule-event-title");
		}else if(unit == "weeks"){
			return each.style.hasClass("weekly-schedule-event-title");
		}else if(unit == "days"){
			return each.style.hasClass("daily-schedule-event-title");
		}
	}).forEach(function(/* cpr.controls.Output */ each){
		each.getParent().removeChild(each, true);
	});
}


/**
 * 일치하는 날짜 컨트롤을 반환합니다.
 * @param {String} psValue
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @return {cpr.controls.Output}
 * 
 * @alt 모든 날짜 컨트롤을 반환합니다.
 * @return {cpr.controls.Output[]}
 */
function getCalendarDate(psValue, app) {
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
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} unit 캘린더 유형(days / weeks / months 세가지 중 하나로 입력)
 * @param {cpr.data.DataSet} dsEvnt 일정 목록 dataset
 * @param {cpr.data.DataMap} dmRes
 */
function changeCalendarType(psAppId, app, unit, dsEvnt , dmRes) {
	var vcEmb = app.getHostAppInstance().lookup("ea1");
	cpr.core.App.load(psAppId, function(loadedApp) {
		/*임베디드앱에 안에 앱이 있는 경우에는 앱을 삭제해줍니다.(다시 앱을 열고싶을때 스크립트 작성)*/
		if(vcEmb.getEmbeddedAppInstance()){
//			alert("임베디드 앱에 앱 실행 상태 - > 삭제 합니다 ");
			vcEmb.getEmbeddedAppInstance().dispose();
		}
		if(loadedApp){						
			/*초기값을 전달합니다.*/	
			if(unit == "months"){
				var voInitValue = {
					"dsEvnt" : dsEvnt,
					"dmRes" : dmRes,
	 				"stdAmnt" : mnMFarFromNow,
					"type" : "monthly"
				};
				vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
					embApp.initValue = voInitValue;
				})
				/*임베디드 앱에 내장할 앱을 로드하여 설정합니다*/
				vcEmb.app = loadedApp;
			}else if(unit == "weeks"){
				var voInitValue = {
						"dsEvnt" : dsEvnt,
						"dmRes" : dmRes,
		 				"stdAmnt" : mnWFarFromNow,
						"type" : "monthly"
					};
					vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
						embApp.initValue = voInitValue;
					})
					/*임베디드 앱에 내장할 앱을 로드하여 설정합니다*/
					vcEmb.app = loadedApp;
			}else if(unit == "days"){
				var voInitValue = {
						"dsEvnt" : dsEvnt,
						"dmRes" : dmRes,
		 				"stdAmnt" : mnDFarFromNow,
						"type" : "monthly"
					};
					vcEmb.ready(function(/*cpr.controls.EmbeddedApp*/embApp){
						embApp.initValue = voInitValue;
					})
					/*임베디드 앱에 내장할 앱을 로드하여 설정합니다*/
					vcEmb.app = loadedApp;
			}
			
			
		}

	});
}



/**************************** 컨트롤 이벤트 : 캘린더에 공통으로 사용되는 버튼 이벤트 그냥 모듈화시켜버림 *****************/

/*
 * "<" 버튼(btnPrev)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnPrevClick = function (app, unit,dsEvnt, dmRes){
	
	mnMFarFromNow++;
	
	setCalendarHeaderDates(app, unit);
	
	setCalendarDates(app, unit,dmRes);
	
	createScheduleEvents(app, unit,dsEvnt);
}


/*
 * ">" 버튼(btnNext)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnNextClick = function (app, unit, dsEvnt,dmRes){
	
	mnMFarFromNow--;
	
	setCalendarHeaderDates(app, unit);
	
	setCalendarDates(app, unit,dmRes);
	
	createScheduleEvents(app, unit, dsEvnt);
}


/*
 * "Today" 버튼(btnToday)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnTodayClick = function (app, unit, dsEvnt,dmRes){
	mnMFarFromNow = 0;
	setCalendarHeaderDates(app, unit);
	setCalendarDates(app, unit,dmRes);
	createScheduleEvents(app, unit, dsEvnt);
}


/*
 * "Day" 버튼(btnDay)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnDayClick = function (app, dsEvnt , dmRes){
	changeCalendarType("app/test-calendar/test_Daily", app, "days", dsEvnt , dmRes);
}


/*
 * "Week" 버튼(btnWeek)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnWeekClick = function (app, dsEvnt , dmRes){
	changeCalendarType("app/test-calendar/test_Weekly", app, "weeks", dsEvnt , dmRes);
}


/*
 * "Month" 버튼(btnMonth)에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
exports.onBtnMonthClick = function (app, dsEvnt , dmRes){
	changeCalendarType("app/test-calendar/test_Monthly", app, "months", dsEvnt , dmRes);
}
