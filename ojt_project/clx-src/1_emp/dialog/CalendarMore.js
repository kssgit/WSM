/************************************************
 * CalendarMore.js
 * Created at 2021. 1. 21. 오전 10:33:40.
 *
 * @author daye
 ************************************************/



/*
 * 루트 컨테이너에서 load 이벤트 발생 시 호출.
 * 앱이 최초 구성된후 최초 랜더링 직후에 발생하는 이벤트 입니다.
 */
function onBodyLoad(/* cpr.events.CEvent */ e){
	
	/** @type Dialog */
	var voHost = app.getHost();
	var initValue = app.getHostProperty("initValue");
	if(initValue) {
		voHost.headerTitle = initValue["date"];
		
		var voItems = initValue["item"];
		for(var idx = 0; idx < voItems.length; idx++){
			var opt = new cpr.controls.Output();
			opt.value = voItems[idx].label;
			opt.style.css({
				"text-align" : "center"
			})
			app.lookup("grpItem").addChild(opt, {
				height : "30px",
			});
		}
		
//		var voAnniversary = initValue["anniversary"];
//		for(var idx = 0; idx < voAnniversary.length; idx++){
//			var opt1 = new cpr.controls.Output();
//			opt1.value = voAnniversary[idx].label;
//			
//			app.lookup("grpAnniversary").addChild(opt1, {
//				height : "30px"
//			});
//		}
	}
}
