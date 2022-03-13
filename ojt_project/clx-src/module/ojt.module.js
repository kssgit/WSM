/************************************************
 * ojt.module.js
 * Created at 2022. 1. 25. 오전 10:42:58.
 *
 * @author SeongSoo
 ************************************************/


/*스케줄 정보 변수 선언 */
globals.WorkSchedule ={
	dsEvnt : cpr.data.DataSet,
	setSchedule : function(dsEvnt){
		this.dsEvnt = dsEvnt;
	},
	getSchedule : function(){
		return this.dsEvnt;
	},
	clean : function(){
		this.dsEvnt = null;
	}
}

/** 선택한 매장 udc storecode 번호 */ 
globals.SelectStoreCode = {
	storecode : Number,
	setStoreCode : function(storecode){
		this.storecode  = storecode;
	},
	getStoreCode : function(){
		return this.storecode;
	},
	clean : function(){
		this.storecode = 0;
	}
	
}
/**
 * 
 *  @param {cpr.core.AppInstance} app 
 */
globals.logout  =  function(app){
	localStorage.clear();
	sessionStorage.clear();
	app.close();
	location.href = "/logout.jsp"
}

globals.Session = {
	/** 
	 * @param {cpr.data.DataMap} dm
	 * 
	 */
	saveSessionStorage : function(dm){
		sessionStorage.setItem("USER_NUMBER", dm.getValue("USER_NUMBER"));
		sessionStorage.setItem("USER_NAME", dm.getValue("USER_NAME"));
		sessionStorage.setItem("USER_EMAIL", dm.getValue("USER_EMAIL"));
		sessionStorage.setItem("USER_KIND", dm.getValue("USER_KIND"));
	}
}



