
//exports.id = "util.module.js";

/**
 * @class AppUtil AppInstance에 대한 유틸
 */
AppUtil = {
    /**
     * 해당 앱의 속성(Property)값을 할당한다.
     * @param {cpr.core.AppInstance} app - 앱인스턴스 객체
	 * @param {String | Object} propertyName App 속성
	 * @param {String | Object} value App 속성값
	 * @param {boolean} pbEvent value-change 이벤트 발생여부  (default : true)
	 * @return void
     */
    setAppProperty : function (app, propertyName, value, pbEvent) {
    	pbEvent = pbEvent == null ? true : pbEvent;
    	
        /** @type cpr.core.AppInstance */
        var _app = app;
        var hostApp = _app.getHostAppInstance();
        var property = _app.getAppProperty(propertyName);
        if(hostApp && hostApp.lookup(property) && hostApp.lookup(property) instanceof cpr.controls.UIControl){
        	if(pbEvent){
        		hostApp.lookup(property).value = value;
        	}else{
        		hostApp.lookup(property).putValue(value);
        	}
        }else{
        	_app.setAppProperty(propertyName, value);
        }
    },
    
    /**
     * UDC 컨트롤에 대해 value 앱 속성에 바인딩된 컨트롤 객체를 반환한다.
     * @param {cpr.controls.UIControl} poCtrl
     */
    getUDCBindValueControl : function(poCtrl){
    	var bindCtrl = poCtrl;
    	var embApp = poCtrl.getEmbeddedAppInstance();
		embApp.getContainer().getChildren().some(function(embCtrl){
			if(embCtrl.type == "container"){
				embCtrl.getChildren().some(function(subembCtrl){
					if(subembCtrl.getBindInfo("value") && subembCtrl.getBindInfo("value").property == "value"){
						bindCtrl = subembCtrl;
						return true;
					}
				});
			}else{
				if(embCtrl.getBindInfo("value") && embCtrl.getBindInfo("value").property == "value"){
					bindCtrl = embCtrl;
					return true;
				}
			}
		});
		
		return bindCtrl;
    }
 };

/**
 * @class ValueUtil Value 체크 및 형 변환
 */
ValueUtil = {
    /**
     * 해당 값이 Null인지 여부를 체크하여 반환한다.
	 * @param {any} puValue	값
	 * @return {Boolean} Null(공백도 Null임) 여부
     */
    isNull : function (puValue) {
        return (this.fixNull(puValue) == "");
    },

    /**
     * 해당 값이 숫자(Number) 타입인지 여부를 반환한다.
	 * @param {Number | String} puValue		값
	 * @example ValueUtil.isNumber("1234.56") == true
	 * @return {Boolean} 해당값이 Number 타입인지 여부
     */
    isNumber : function (puValue) {
        return isNaN(Number(puValue)) == false;
    },

    /**
     * 해당 값에 대한 문자열을 반환한다.<br/>
     * 만약 해당값이 null이거나 정의되지 않은 경우, 공백("") 문자열을 반환한다.<br/>
     * 해당값이 문자열 값인 경우에는 좌/우 공백에 대한 trim 처리된 문자열을 반환한다.
	 * @param {any} puValue		값
	 * @return {String} 문자열 String
     */
    fixNull : function (puValue) {
        var type = typeof(puValue);
        if (type == "string" || (type == "object" && puValue instanceof String)) {
			puValue = this.trim(puValue);
        }
		
        return (puValue == null || puValue == "null" || puValue == "undefined") ? "" : String(puValue);
    },

     /**
     * 해당 값을 불리언(Boolean) 타입으로 변환한다.
	 * @param {any} puValue		값
	 * @return {Boolean} 불리언 유형으로 반환
     */
    fixBoolean : function (puValue) {
        if (typeof(puValue) == "boolean" || puValue instanceof Boolean) {
            return puValue;
        }
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue != 0;
        }
        return (this.fixNull(puValue).toUpperCase() == "TRUE");
    },

    /**
     * 해당 값을 숫자(Number) 타입으로 변환한다.<br/>
     * 만약 해당값이 숫자유형으로 변환되지 않는 값인 경우에는 0을 반환한다.
	 * @param {any} puValue		값
	 * @return {Number} 숫자 타입으로 반환
     */
    fixNumber : function (puValue) {
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue;
        }
        var val = Number(this.fixNull(puValue));
        return isNaN(val) ? 0 : val;
    },
    
    /**
     * 해당 값을 숫자(Float) 타입으로 변환한다.<br/>
     * 만약 해당값이 숫자(Float)유형으로 변환되지 않는 값인 경우에는 0을 반환한다.
	 * @param {any} puValue		값
	 * @return {Float} 소수점이 있는 숫자 타입으로 반환
     */
    fixFloat : function (puValue) {
        if (typeof(puValue) == "number" || puValue instanceof Number) {
            return puValue;
        }
        var val = parseFloat(this.fixNull(puValue));
        return isNaN(val) ? 0 : val;
    },
    
    /**
     * 문자열이 해당 문자열로 시작하는지 여부를 반환한다.
	 * @param {String} psValue		문자열 값
	 * @param {String} psChkVal		시작문자열
	 * @return {Boolean} 여부(true/false) 반환
     */
    startWith : function (psValue, psChkVal) {
        return psValue.indexOf(psChkVal) == 0;
    },
    
    /**
     * 문자열이 해당 문자열로 끝나는지 여부를 반환한다.
	 * @param {String} psValue		문자열 값
	 * @param {String} psChkVal		종료문자열
	 * @return {Boolean} 여부(true/false) 반환
     */
    endWith : function (psValue, psChkVal) {
    	var index = psValue.lastIndexOf(psChkVal);
    	return (index != -1 && index == (psValue.length - psChkVal.length));
    },
    
    /**
     * 해당 값의 앞/뒤 공백을 제거한 문자열을 반환한다.
	 * @param {String} psValue		값
	 * @return {String} 공백 제거된 문자열
     */
    trim : function (psValue) {
        return psValue == null ? psValue : psValue.replace(/(^\s*)|(\s*$)/g, "");
    },
    
    /**
     * 문자열을 split한 배열을 반환한다.<br/>
     * split된 각 문자열들은 각각 좌/우 trim처리되어 반환된다.
	 * @param {String} psValue		split 대상 문자열
	 * @param {String} psDelemeter  구분문자 (ex: 콤마(,))
	 * @return {String[]} 문자열 배열
     */
    split : function (psValue, psDelemeter) {
    	psValue = this.fixNull(psValue);
        var values = new Array();
        var temps = psValue.split(psDelemeter);
        var _this = this;
        temps.forEach(function(item){
        	values.push(_this.trim(item));
        });
        
        return values;
    },
    
    /**
     * 문자열 데이터의 길이(length)를 반환한다.
	 * @param {String} psValue		값
	 * @param {String} psUnit? 단위(char/utf8/ascii)<br/>
     * [char] : 문자의 길이.<br/>
 	 * [utf8] : utf8 기준의 문자 byte size.<br/>
 	 * [ascii] : ascii 기준의 문자 byte size.
	 * @return {Number} 문자열 길이
     */
    getLength : function(psValue, psUnit) {
    	if(!psUnit) psUnit = "char";
    	
		var length = 0;
		switch(psUnit) {
			case "utf8":{
				for(var i=0, len=psValue.length; i<len; i++) {
				    if(escape(psValue.charAt(i)).length >= 4) length += 3;
				    else if(escape(psValue.charAt(i)) == "%A7") length += 3;
				    else if(escape(psValue.charAt(i)) != "%0D") length++;
				    else length++;
				}
				break;
			}
			case "ascii":{
				for(var i = 0, c; c = psValue.charAt(i++); length += c >> 7 ? 2 : 1);
				break;
			}
			default : {
				length = psValue.length;
			}
		}
		
		return length;
    },
    
    /**
     * 문자열 데이터의 바이트 길이(Bytelength)를 반환한다.
	 * @param {String} psValue		값
	 * @return {Number} 문자열 바이트 길이
     */
    getByteLength: function(psValue){
    	var byteLength = 0;
    	byteLength = (function(s,b,i,c){
		    for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?2:c>>7?2:1);
		    return b
		})(psValue);

		return byteLength;
    }
 };

/**
 * @class 날짜 유틸 클래스
 */
DateUtil = {

    /**
     * 날짜를 지정한 패턴의 문자열로 반환한다.
	 * @param {Date} poDate			날짜
	 * @param {String} psPattern	포맷 문자열(ex: YYYYMMDD)
	 * @return {String} 날짜 문자열
     */
    format : function (poDate, psPattern) { // dateValue As Date, strPattern As String
        var CAL_INITIAL = {
		    MONTH_IN_YEAR :         ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		    SHORT_MONTH_IN_YEAR :   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		    DAY_IN_WEEK :           ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"],
		    SHORT_DAY_IN_WEEK :     ["Sun", "Mon", "Tue", "Wed","Thu", "Fri", "Sat"]
		};
        
        var year      = poDate.getFullYear();
	    var month     = poDate.getMonth() + 1;
	    var day       = poDate.getDate();
	    var dayInWeek = poDate.getDay();
	    var hour24    = poDate.getHours();
	    var ampm      = (hour24 < 12) ? "AM" : "PM";
	    var hour12    = (hour24 > 12) ? (hour24 - 12) : hour24;
	    var min       = poDate.getMinutes();
	    var sec       = poDate.getSeconds();
	
	    var YYYY = "" + year;
	    var YY   = YYYY.substr(2);
	    var MM   = (("" + month).length == 1) ? "0" + month : "" + month;
	    var MON  = CAL_INITIAL.MONTH_IN_YEAR[month-1];
	    var mon  = CAL_INITIAL.SHORT_MONTH_IN_YEAR[month-1];
	    var DD   = (("" + day).length == 1) ? "0" + day : "" + day;
	    var DAY  = CAL_INITIAL.DAY_IN_WEEK[dayInWeek];
	    var day  = CAL_INITIAL.SHORT_DAY_IN_WEEK[dayInWeek];
	    var HH   = (("" + hour24).length == 1) ? "0" + hour24 : "" + hour24;
	    var hh   = (("" + hour12).length == 1) ? "0" + hour12 : "" + hour12;
	    var mm   = (("" + min).length == 1) ? "0" + min : "" + min;
	    var ss   = (("" + sec).length == 1) ? "0" + sec : "" + sec;
	    var SS   = "" + poDate.getMilliseconds();
		
	    var dateStr;
	    var index = -1;
	    if (typeof(psPattern) == "undefined") {
	        dateStr = "YYYYMMDD";
	    } else {
	        dateStr = psPattern;
	    }
	
	    dateStr = dateStr.replace(/YYYY/g, YYYY);
	    dateStr = dateStr.replace(/yyyy/g, YYYY);
	    dateStr = dateStr.replace(/YY/g,   YY);
	    dateStr = dateStr.replace(/MM/g,   MM);
	    dateStr = dateStr.replace(/MON/g,  MON);
	    dateStr = dateStr.replace(/mon/g,  mon);
	    dateStr = dateStr.replace(/DD/g,   DD);
	    dateStr = dateStr.replace(/dd/g,   DD);
	    dateStr = dateStr.replace(/day/g,  day);
	    dateStr = dateStr.replace(/DAY/g,  DAY);
	    dateStr = dateStr.replace(/hh/g,   hh);
	    dateStr = dateStr.replace(/HH/g,   HH);
	    dateStr = dateStr.replace(/mm/g,   mm);
	    dateStr = dateStr.replace(/ss/g,   ss);
	    dateStr = dateStr.replace(/(\s+)a/g, "$1" + ampm);
	
	    return dateStr;
    },

    /**
     * 올바른 날짜인지를 체크한다.
	 * @param {Number | String} puYear			년도
	 * @param {Number | String} puMonth			월
	 * @param {Number | String} puDay			일
	 * @return {Boolean} 유효한 날짜인지 여부
    */
    isDate : function (puYear, puMonth, puDay) {
    	var pnYear = Number(puYear);
    	var pnMonth = Number(puMonth);
    	var pnDay = Number(puDay);
        var vdDate = new Date(pnYear, pnMonth-1, pnDay);
        return vdDate.getFullYear() == pnYear      &&
               vdDate.getMonth   () == pnMonth - 1 &&
               vdDate.getDate    () == pnDay;
    },

    /**
     * 현재 날짜에 해당 날짜만큼 더한 날짜를 반환한다.
	 * @param {String} psDate			날짜 문자열(ex: 20180101)
	 * @param {Number} pnDayTerm		추가 일수
	 * @return {String} 날짜 문자열
    */
    addDate : function (psDate, pnDayTerm) { 
    	var pnYear 	= Number(psDate.substring(0,4));
    	var pnMonth = Number(psDate.substring(4,6));
    	var pnDay 	= Number(psDate.substring(6,8));

    	if (this.isDate(pnYear, pnMonth, pnDay)) {
	    	var vdDate = new Date(pnYear, pnMonth-1, pnDay);
	    	var vnOneDay = 1*24*60*60*1000 ; /* 1day,24hour,60minute,60seconds,1000ms */
	    	
	    	var psTime = vdDate.getTime() + (Number(pnDayTerm)*Number(vnOneDay));
	    	vdDate.setTime(psTime);
	    	
	        return this.format(vdDate,"YYYYMMDD");
    	}else{
    		return psDate;
    	}
    },
    
    /**
     * 날짜 문자열을 Date형으로 변환하여 반환한다.
     * <pre><code>
     * DateUtil.toDate("2007-02-09","YYYY-MM-DD");
 	 * </code></pre>
	 * @param {Date} psDateTime			날짜
	 * @param {String} psPattern	포맷 문자열(ex: YYYY-MM-DD)
	 * @example DateUtil.toDate("2007-02-09","YYYY-MM-DD")
	 * @return {Date} 날짜(Date) 객체
     */ 
    toDate : function (psDateTime, psPattern) {
        var vdDate = new Date();
        var vnIdx, vnCnt;

        var vsaFmt = ["Y", "M", "D", "H", "m", "s", "S"];
        var vnFmtLen = vsaFmt.length;
        var vnPtnLen = psPattern.length;
        var vnaNums = [vdDate.getFullYear(), vdDate.getMonth()+1, vdDate.getDate(), vdDate.getHours(), vdDate.getMinutes(), vdDate.getSeconds(), vdDate.getMilliseconds()];

        for (var i = 0; i < vnFmtLen; i++) {
            vnIdx = psPattern.indexOf(vsaFmt[i]);
            if (vnIdx != -1) {
                vnCnt = 1;
                for (var j=vnIdx+1; j < vnPtnLen; j++) {
                    if (psPattern.charAt(j) != vsaFmt[i]) { break; }
                    vnCnt++;
                }
                vnaNums[i] = Number(psDateTime.substring(vnIdx, vnIdx+vnCnt));
            } else {
                if(i==0) vnaNums[0] = 1900;
                else if(i==2) vnaNums[2] = 01;
            }
        }

        if (vnaNums[0] < 1900) { // 년도는 검증
            if (vnaNums[0] <= vdDate.getFullYear() % 100) {
                vnaNums[0] += vdDate.getFullYear() - (vdDate.getFullYear() % 100);
            } else if (vnaNums[0] < 100) {
                vnaNums[0] += 1900;
            } else {
                vnaNums[0] = 1900;
            }
        }

        return new Date(vnaNums[0], vnaNums[1]-1, vnaNums[2], vnaNums[3], vnaNums[4], vnaNums[5], vnaNums[6]);
    },

    /**
     * 해당월의 마지막 일자를 반환한다.
     * <pre><code>
     * DateUti.getMonthLastDay("20180201");
     * 또는
     * DateUti.getMonthLastDay("20180301", -1);
 	 * </code></pre>
	 * @param {String} psDate	년월 문자열(ex: 201802, 20180201)
	 * @param {Number} pnAdd (Optional)   +/- 월 수
	 * @return {Number} 일(Day)
     */ 
    getMonthLastDay : function (psDate, pnAdd) {
    	var pnYear 	= Number(psDate.substring(0,4));
    	var pnMonth = Number(psDate.substring(4,6));
        var vdDate = new Date(pnYear, pnMonth, 0, 1, 0, 0);
        if(pnAdd == null){
        	return vdDate.getDate();
        }else{
        	var vdDate2 = new Date(vdDate.getFullYear(), vdDate.getMonth()+1+pnAdd, 0, 1, 0, 0);
        	return vdDate2.getDate();
        }
    },

    /**
     * 두 날짜간의 일(Day)수를 반환한다.
	 * @param {String} psDate1st	년월 문자열(ex: 20180201)
	 * @param {String} psDate2nd    년월 문자열(ex: 20170201)
	 * @return {Number} 일수(Day)
     */
    getDiffDay : function (psDate1st, psDate2nd) {
    	var date1 = this.toDate(psDate1st, "YYYYMMDD");
    	var date2 = this.toDate(psDate2nd, "YYYYMMDD");
        
        return parseInt((date2 - date1)/(1000*60*60*24));
    },
    
    /**
     * 입력받은 날짜에 시분초 문자열 000000을 붙여서 반환한다.
     * @param {String} psDate 날짜포맷 문자열
     */
    addZoreDate : function(psDate){
    	var dateString = psDate.substring(0, 8);
		dateString += "000000";
		return dateString;
    },
    
    /**
     * 해당 날짜의 하루 전 날짜 반환한다.
     * @param {String} psDate 날짜포맷 문자열
     */
    getBeforeDate : function(psDate){
    	var y = psDate.substring(0, 4);
		var m = psDate.substring(4, 6);
		var d = psDate.substring(6, 8);
		var befDt = new Date(y, m - 1, d - 1);
		var befDtYear = befDt.getFullYear().toString();
		var befDtMonth = new String(befDt.getMonth() + 1);
		var befDtDate = befDt.getDate().toString();
		
		if (befDtMonth.length == 1) befDtMonth = "0" + befDtMonth;
		if (befDtDate.length == 1) befDtDate = "0" + befDtDate;
		
		return befDtYear + befDtMonth + befDtDate + "000000";
    },
    
    /**
     * 입력한 일자에 해당되는 한글 요일을 반환한다.
     * <pre><code>
     * DateUti.getDayOfWeek("20191120");
 	 * </code></pre>
	 * @param {String} psDate 일자 문자열(ex:20191120)
	 * @return {String} 한글 요일
     */ 
    getDayOfWeek : function (psDate) {
    	
    	var vsYear 	= psDate.substring(0,4);
    	var vsMonth = psDate.substring(4,6);
    	var vsDay 	= psDate.substring(6,8);
    	var vaWeek  = ['일', '월', '화', '수', '목', '금', '토'];
    	
		return vaWeek[new Date(vsYear + "-" + vsMonth + "-" + vsDay).getDay()];
    }
};

/**
 * @class 파일 유틸 클래스
 */
FileUtil = {
	
	getMaxUploadSize : function() {
		return 100;
	},
	
	//업로드 가능한 파일 확장자 목록반환
	getPemitedFileExts : function(){
		var vaFileExt = ['JPG', 'PNG', 'GIF', 'TIF', 'TIFF', 'JFIF', 'BMP', 'TXT', 'HWP', 'DOCX', 'DOC'
						, 'DOCM', 'PPT', 'PPTX', 'PPTM', 'PPS', 'PPSX', 'XLS', 'XLSX', 'XLSM', 'XLAM'
						, 'XLA', 'PSD', 'PDF', 'ODS', 'OGG', 'MP4', 'AVI', 'WMV', 'ZIP', 'RAR', 'TAR'
						, '7Z', 'TBZ', 'TGZ', 'LZH', 'GZ', 'AI'
					   ];
		return vaFileExt;
	},
	
	//업로드 불가한 파일 확장자 목록반환
	getLimitedFileExts : function(){
		// 파일 선택 제한 확장자.
		var vaFileExt = ['A6P','AC','AS','ACR','ACTION','AIR','APP','ASP','ASPX','AWK'
						,'BAT'
						,'CGI','CMD','COM','CSH'
						,'DEK','DLD','DS'
						,'EBM','ESH','EXE','EZS'
						,'FKY','FRS','FXP'
						,'GADGET'
						,'HMS','HTA'
						,'ICD','INX','IPF','ISU'
						,'JAR','JS','JSE','JSP','JSX'
						,'KIX'
						,'LUA'
						,'MCR','MEM','MPX','MS','MST'
						,'OBS'
						,'PAF','PEX','PHP','PIF','PL','PRC','PRG','PVD','PWC','PY','PYC','PYO'
						,'QPX'
						,'RBX','RGS','ROX','RPJ'
						,'SCAR','SCR','SCRIPT','SCT','SH','SHB','SHS','SPR'
						,'TLB','TMS'
						,'U3P','UDF'
						,'VB','VBE','VBS','VBSCRIPT'
						,'WCM','WPK','WS','WSF'
						,'XQT'
					  ];
		
		return vaFileExt;
	},
	
	/**
	 * 파일 확장자 체크
	 * @param {String} psFileNm 파일명
	 * @param {String[]} paFileFilter 가능 파일 확장자 명
	 */
	checkFileExt : function(psFileNm, paFileFilter) {
		if (ValueUtil.isNull(paFileFilter)) paFileFilter = this.getPemitedFileExts();
		
		var vbCheck = false;
		//허용 파일 확장자 체크
		var arrStr = ValueUtil.split(psFileNm, ".");
		var extStr = arrStr [arrStr.length - 1].toUpperCase();
		for (var i=0, len=paFileFilter.length; i<len; i++) {
			if (extStr == paFileFilter[i].toUpperCase()) {
				vbCheck = true;
				break;
			}
		}
		
		if (!vbCheck) {
			alert(this.__getMessage("NLS-ERR-M007", [extStr]));
			return false;
		}
		
		//제한 파일 확장자 체크
		var vaLimitedFileExts = this.getLimitedFileExts();
		for (var i=0, len=vaLimitedFileExts.length; i<len; i++) {
			if (extStr == vaLimitedFileExts[i]) {
				alert(this.__getMessage("NLS-ERR-M007", [extStr]));
				return false;
			}
		}
		
		return true;
	},
	
	/**
	 * 파일 업로드 용량 체크
	 * @param {File} poFile 검사할 파일
	 * @param {Number} pnLimitFileSize 파일 제한 사이즈
	 */
	checkFileSize : function(poFile, pnLimitFileSize) {
		if(!ValueUtil.isNull(poFile)){
			if(poFile.size > (pnLimitFileSize * 1024 * 1024)){
				//파일의 크기가 @mb를 초과하는 경우 첨부할 수 없습니다.
				alert(this.__getMessage("NLS-ERR-M010", ["100"]));
				return false;
			}
		}
		
		return true;
	},
	
	/**
	 * 메시지를 반환한다.
	 * @param {String} psMessageId
	 * @param {String[]} paArgs
	 */
	__getMessage : function(psMessageId, paArgs){
		var message = cpr.I18N.INSTANCE.message(psMessageId);
		var index = 0, count = 0;
    	while ((index = message.indexOf("@", index)) != -1) {
	        if (paArgs[count] == null) paArgs[count] = "";
	        message = message.substr(0, index) + String(paArgs[count]) + message.substring(index + 1);
	        index = index + String(paArgs[count++]).length;
	    }
	    
	    return message.replace(/\\n/ig, "\n");
	},
	
	/**
	 * File Dialog를 띄우고 선택한 File을 반환한다.
	 * @param {cpr.core.AppInstance} app 앱인스턴스
	 * @param {Any} paFileFilter 확장자를 선택한다. null일 경우 default로 적용되어 있는 확장자만 업로드하도록 한다. (예: ["xls", "xlsx"])
	 * @param {Function} poCallBackFunc 후처리 콜백함수
	 * @param {Boolean} pbMultiple? 단건 선택일지 멀티 선택일지 여부 (default : 멀티) false 일경우 단건
	 * @param {Number} pnLimitFileSize? 파일업로드 제한 용량사이즈(mb 단위)
	 */
	getFileName : function(app, paFileFilter, poCallBackFunc, pbMultiple, pnLimitFileSize){
   		app.getContainer().getChildren().forEach(function(each){
			if(each instanceof cpr.controls.FileInput && each.id == "com_fileinput") {
				each.dispose();
			}
		});
		
		var fileInput = new cpr.controls.FileInput("com_fileinput");
		fileInput.visible = false;
		//파일 확장자
		if(!ValueUtil.isNull(paFileFilter)) {
			var tempFilter = "";
			if(paFileFilter instanceof Array) {
				for(var i = 0; i < paFileFilter.length; i++) {
					if(i == 0) {
						tempFilter += "." + paFileFilter[i];
					} else {
						tempFilter = tempFilter + ",." + paFileFilter[i];
					}
				}
				console.log(tempFilter);
				fileInput.acceptFile = tempFilter;
			} else {
				fileInput.acceptFile = paFileFilter;
			}
			
		}
		//multi 선택가능여부
		if(!ValueUtil.isNull(pbMultiple)) {
			fileInput.multiple = pbMultiple;
		}
		//파일 업로드 용량
		if(!ValueUtil.isNull(pnLimitFileSize)) {
			fileInput.limitFileSize = pnLimitFileSize;
		}else{
			fileInput.limitFileSize = this.getMaxUploadSize();
		}
		fileInput.limitFileSizeUnit = "mb";
		
		fileInput.addEventListenerOnce("value-change", function(e) {
			if(typeof (poCallBackFunc) == "function"){
				var files = fileInput.files;
				var vsFileNm = "";
				
				//파일 선택 유/무 체크
				if(files.length < 1){
					//파일을 선택해 주세요.
					alert(FileUtil.__getMessage("NLS-CMM-M012"));
					return false;
				}
				for(var i=0, len=files.length; i<len; i++) {
					var voFile = files[i];
					//업로드 확장자 체크
					var fileFilter = new Array();
					
					if(paFileFilter) {
						if(typeof(paFileFilter) == "string") {
							var tempFileFilter = paFileFilter.split(",");
							
							tempFileFilter.forEach(function(each){
								fileFilter.push(each.replace(".", ""));
							});
						}
						
						if(paFileFilter instanceof Array) {
							fileFilter = paFileFilter;
						}
					}
					
		   			if(!FileUtil.checkFileExt(voFile.name, fileFilter)) return false;
					
					//업로드 용량 체크 로직
			   		if(!FileUtil.checkFileSize(voFile, fileInput.limitFileSize)) return false;
				}
				
			   	poCallBackFunc(files);
			}
		});
		
		app.getContainer().addChild(fileInput, {
			"width": "0px",
			"height": "0px"
		});
		
		fileInput.redraw();
		
		setTimeout(function() {
			fileInput.openFileChooser();
		}, 500);
   	},
	
	/**
	 * 첨부파일을 다운로드 한다.
	 * @param {cpr.core.AppInstance} app 앱인스턴스
	 * @param {{strCommand: String <!-- 다운로드 커맨드 -->, strFileSubPath: String <!-- 해당 화면의 첨부파일 저장 경로(화면ID) -->, strFileNm: String <!-- 원본 파일명(다운로드될 파일의 이름) -->, strOriFileNm: String <!-- 저장된 파일명(서버에 저장되어 있는 파일의 이름) -->, strTmpFilePath: String <!--  -->, strFileSerialNo: String <!-- 첨부파일 일련번호 -->, strSeq: String <!-- 첨부파일 순번 -->}} poParam 다운로드 요청파라메터 객체
	 * @param {Function} poCallBackFunc? 콜백함수
	 */
	downloadFile : function(app, poParam, poCallBackFunc) {
		var submit =  app.lookup("XBComFileDownSubmit");
		if(submit == null){
			submit = new cpr.protocols.Submission("XBComFileDownSubmit");
			app.register(submit);
		} else {
			submit.removeAllParameters();
		}
		
		var vsCommand = !ValueUtil.isNull(poParam.strCommand) ? poParam.strCommand : "fileDownLoad";
		
		submit.action = "../cmn/StdCmnFileTransUtil/"+vsCommand+".do";
		submit.responseType = "filedownload";
		submit.addParameter("strFileSubPath", poParam.strFileSubPath);
		submit.addParameter("strFileNm", poParam.strFileNm);
		submit.addParameter("strOriFileNm", poParam.strOriFileNm);
		submit.addParameter("strTmpFilePath", poParam.strTmpFilePath);
		submit.addParameter("strFileSerialNo", poParam.strFileSerialNo);
		submit.addParameter("strSeq", poParam.strSeq);
		submit.addEventListenerOnce("submit-done", function(e){
			if(typeof (poCallBackFunc) == "function"){
				poCallBackFunc();
			}
		});
		
		submit.send();
	},
	
	/**
	 * 여러 첨부파일을 압축파일로 다운로드 한다.
	 * @param {cpr.core.AppInstance} app 앱인스턴스
	 * @param {{strCommand: String <!-- 다운로드 커맨드 -->, strDownloadName: String <!-- 압축파일명 -->, strFileSerialNo: String <!-- 첨부파일 순번 -->}} poParam 다운로드 요청파라메터 객체
	 * @param {Function} poCallBackFunc? 콜백함수
	 */
	downloadZip : function(app, poParam, poCallBackFunc) {
		var submit =  app.lookup("XBComFileDownSubmit");
		if(submit == null){
			submit = new cpr.protocols.Submission("XBComFileDownSubmit");
			app.register(submit);
		} else {
			submit.removeAllParameters();
		}
		
		var vsCommand = !ValueUtil.isNull(poParam.strCommand) ? poParam.strCommand : "fileDownLoadZip";
		
		submit.action = "../cmn/StdCmnFileTransUtil/"+vsCommand+".do";
		submit.responseType = "filedownload";
		submit.addParameter("strDownloadName", poParam.strDownloadName);
		submit.addParameter("strFileSerialNo", poParam.strFileSerialNo);
		submit.addEventListenerOnce("submit-done", function(e){
			if(typeof (poCallBackFunc) == "function"){
				poCallBackFunc();
			}
		});
		
		submit.send();
	}
};
