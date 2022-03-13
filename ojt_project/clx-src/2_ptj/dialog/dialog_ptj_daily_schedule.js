/************************************************
 * ptj_daily_schedule.js
 * Created at 2022. 1. 12. 오전 9:23:30.
 *
 * @author ksk19
 ************************************************/

var util = createCommonUtil();

/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	var initValue = app.getHostProperty("initValue");
	/** @type Date */
	var selectedDate = initValue["selectedDate"]; // 호스트앱에서 selectedDate로 보낸 값 가져오기
	var dm = app.lookup("dmDailySchedule");
	var output = app.lookup("selectedDate");
	output.putValue(selectedDate);
	dm.setValue("work_date", selectedDate);
//	dm.setValue("user_code_ptj", UserInfo.getUserInfo().getValue("USER_NUMBER"));
	dm.setValue("user_code_ptj", sessionStorage.getItem("USER_NUMBER"));
	app.lookup("smsDailySchedule").send()
	
}


/*
 * "닫기" 버튼에서 click 이벤트 발생 시 호출.
 * 사용자가 컨트롤을 클릭할 때 발생하는 이벤트.
 */
function onButtonClick2(/* cpr.events.CMouseEvent */ e){
	/** 
	 * @type cpr.controls.Button
	 */
	var button = e.control;
	app.close();
}


/*
 * 서브미션에서 submit-success 이벤트 발생 시 호출.
 * 통신이 성공하면 발생합니다.
 */
function onSmsDailyScheduleSubmitSuccess(/* cpr.events.CSubmissionEvent */ e){
		
	app.lookup("smsDailyScheduleReq").send().then(function(input){	
		var reqList = app.lookup("dsDailyScheduleReq");
		var selectedDate = app.lookup("dmDailySchedule").getValue("work_date");
		var grp = app.lookup("grpSchedule");
		var dataSet = app.lookup("dsDailySchedule");
		for(var i=0; i<dataSet.getRowCount(); i++){
			//UDC 속성에 값 대입
			var scheduleUDC = new udc.ptj.daliy_schedule();  
			scheduleUDC.storeName = dataSet.getValue(i, "storeName");
			scheduleUDC.storeCode = dataSet.getValue(i, "store_code");
			scheduleUDC.workStartDt = dataSet.getValue(i, "workStartDt").substring(8);
			scheduleUDC.workEndDate = dataSet.getValue(i, "work_end_date");
			scheduleUDC.workEndDt = dataSet.getValue(i, "workEndDt").substring(8);
			scheduleUDC.workedHour = dataSet.getValue(i, "workedHour");
			scheduleUDC.breaktime = dataSet.getValue(i, "breaktime");
			scheduleUDC.scheduleCode = dataSet.getValue(i, "schedule_code");
			console.log(" 엔드 데이트 : "+scheduleUDC.workEndDate)
			//스케줄 UDC 추가
			grp.addChild(scheduleUDC, {
				autoSize : "none",
				height : "80px",
				width : "400px"
			});
			
			reqList.setFilter("ud_schedule_number ==" + scheduleUDC.scheduleCode);
			if(reqList.getValue(0, "ud_schedule_number") == scheduleUDC.scheduleCode){
				scheduleUDC.addEventListener("scheduleClick", function(e){
						alert("현재 일정 변경/삭제 요청중인 일정입니다.");
				});
				continue;
			}
			
			//근무 변경 다이얼로그 여는 이벤트
			scheduleUDC.addEventListener("scheduleClick", function(e){
				console.log(e.control.scheduleCode)
				util.Dialog.open(app, "2_ptj/dialog/dialog_ptj_daily_schedule_update", "450", "600", function(e){
					
				}, {"store_name": e.control.storeName,
					"work_begin_time" : e.control.workStartDt.substring(0,4),
					"work_end_time" : e.control.workEndDt.substring(0,4),
					"storeCode" : e.control.storeCode,
					"work_date" : selectedDate,
					"work_end_date" : e.control.workEndDate,
					"breaktime" : e.control.breaktime,
					"scheduleCode" : e.control.scheduleCode
				});	
			app.close();
			});
					
		}
		
		//일정 추가 udc 
		var scheduleAddUDC = new udc.ptj.daliy_schedule_add();
		grp.addChild(scheduleAddUDC, {
			autoSize : "none",
			height : "80px",
			width : "400px"
		});
		
		//일정 추가 udc 이벤트 생성 
		scheduleAddUDC.addEventListener("groupClick", function(e){ 
			app.getHostAppInstance().dialogManager.openDialog("2_ptj/dialog/dialog_ptj_daily_schedule_reg", "dailySchedulePopup" ,{width : 450, height : 600 }, function(dialog){
				dialog.ready(function(dialogApp){
					dialog.initValue = {
						"work_date" : selectedDate
					};
				});
			})
		});
	});
}
