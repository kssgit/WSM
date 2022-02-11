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
		var selectedDate = initValue["selectedDate"];
		
		var dm = app.lookup("dmOnLoad");
		var ds = app.lookup("dsEvnt");
		var userEmail = UserInfo.getUserInfo().getValue("USER_EMAIL");
		var userNumber = UserInfo.getUserInfo().getValue("USER_NUMBER");
		dm.setValue("USER_EMAIL", userEmail);
		dm.setValue("USER_NUMBER", userNumber);
		app.lookup("subOnLoad").send().then(function(input){
			
			//로컬 스토리지
			var filter = "";
			var i = 0;
			if(Object.keys(localStorage).length >0){
				Object.keys(localStorage).forEach(function(key){
					if(i == 0 ){
						filter += "start == "+selectedDate+"&& store_code == " + localStorage.getItem(key);
					}else{
						filter += "|| start == "+selectedDate+"&& store_code == "+localStorage.getItem(key);
					}
					i++;
				});
			}else{
				filter += "store_code == 0";
			}
			
			console.log(filter)
			ds.clearFilter();
			ds.setFilter(filter);
			
			var voItems = ds;
			for(var idx = 0; idx < voItems.getRowCount(); idx++){
				var opt = new cpr.controls.Output();
				
				var beginDt = ds.getValue(idx,"beginDt").substring(8,12)
				var endDt = ds.getValue(idx,"endDt").substring(8,12)
				var label = ds.getValue(idx,"label");
				
				opt.value = label+" "+beginDt+"~"+endDt
				app.lookup("grpItem").addChild(opt, {
					height : "30px"
				});
			}
		});
		
	}
}
