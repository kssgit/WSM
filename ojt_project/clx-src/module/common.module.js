/************************************************
 * 각 화면에 대한 메뉴정보, 사용자정보 및 필수적인 공통 함수들을 제공
 * 각 사이트별 커스터마이징하여 사용 가능
 * version 2.0
 ************************************************/
function AppKit() {
	var extension = cpr.core.Module.require("module/extension");
	var auth = cpr.core.Module.require("module/auth");
	
	this._activeLoadMask = null;
	this._activeSubmission = [];
	
	this.Validator = new Validator(this);
	this.Auth = new auth.AppAuthKit(this);
	this.Msg = new extension.MsgKit(this);
	this.Dialog = new extension.DialogKit(this);
	this.Group = new extension.GroupKit(this);
	this.Control = new extension.ControlKit(this);
	this.SelectCtl = new extension.SelectKit(this);
	this.Tree = new extension.TreeKit(this);
	this.Tab = new extension.TabKit(this);
	this.DataSet = new extension.DataSetKit(this);
	this.DataMap = new extension.DataMapKit(this);
	this.Grid = new extension.GridKit(this);
	this.FreeForm = new extension.FreeFormKit(this);
	this.Submit = new extension.SubmissionKit(this);
	this.EmbApp = new extension.EmbeddedAppKit(this);
	this.MDI = new extension.MDIKit(this);
	this.Header = new extension.HeaderKit(this);
	this.ComButton = new extension.ComButtonKit(this);
	this.Report = new extension.ReportKit(this);
	this.ElecDoc = new extension.ElecDocKit(this);
	this.UDC = new extension.UdcKit(this);
};

/**
 * App 화면의 Layout에 맞게 컨트롤 배치 조건 래핑.
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {cpr.controls.layouts.Constraint}constraint 래핑할 배치조건
 * @param {cpr.core.AppInstance} poApp 앱인스턴스
 * @returns 래핑된 배치조건
 */
AppKit.prototype.wrapConstraints = function(app, constraint, poApp) {
	var isPopup = false;
	if(app.getHost() && app.getHost().modal === true){
		isPopup = true;
	}
	
	var layout;
	var container = null;
	if(poApp == null){
		container = isPopup ? app.getContainer() : app.getRootAppInstance().getContainer();
		poApp = isPopup ? app : app.getRootAppInstance();
	}else{
		container = poApp.getContainer();
	}
	layout = container.getLayout();
	
	if (layout instanceof cpr.controls.layouts.ResponsiveXYLayout) {
		var positionConstraints = [];
		var allMedia = poApp.allSupportedMedias;
		allMedia.forEach(function(media) {
			var newConst = _.clone(constraint);
			newConst["media"] = media;
			positionConstraints[positionConstraints.length] = newConst;
		});
		return {
			"positions" : positionConstraints
		};
	}
	
	return constraint;
};


/**
 * 화면에 LoadMask 출력
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} maskType
 */
AppKit.prototype.showLoadMask = function(app, maskType) {
	
	var isPopup = false;
	if(app.getHost() && app.getHost().modal === true){
		isPopup = true;
	}
	
	var isUdcPop = false;
	if((app.id.indexOf("udc/") === 0) && (app.getHostAppInstance().app.modal === true)) {
		isUdcPop = true;
	}
	
	//popup에서 임베디드 사용할 때 로드마스크 띄우는곳 오류로 추가
	var isEmbPop = false;
	if(app.getHost() && app.getHostAppInstance().getHost() && app.getHost().type == "embeddedapp" && app.getHostAppInstance().getHost().app.modal === true) {
		isEmbPop = true;
	}
	
	var _app;
	if(isUdcPop) {
		_app = app.getHostAppInstance();
	} else if(isEmbPop) {
		_app = app.getHostAppInstance();
	} else {
		_app = isPopup ? app : app.getRootAppInstance();
	}
	
	this.hideLoadMask(_app);
	
	var showConstraint = {
			"position" : "absolute",
			"top" : "0",
			"bottom" : "0",
			"left" : "0",
			"right" : "0"
	};
	showConstraint = this.wrapConstraints(_app, showConstraint);
	
	//var container = isPopup ? app.getContainer() : app.getRootAppInstance().getContainer();
	
	var container = _app.getContainer();
	
	var layout = container.getLayout();
	var loadmask = null;
	if(maskType == "pro") {
		loadmask = container.getAppInstance().lookup("__loadmask_pro__");
		if(loadmask) {
			container.replaceConstraint(loadmask, showConstraint);
		} else {
			loadmask = new udc.com.loadmaskprogress("__loadmask_pro__");
			container.addChild(loadmask, showConstraint);
			container.getAppInstance().register(loadmask);
		}
		loadmask.module.start();
	} else {
		loadmask = container.getAppInstance().lookup("__loadmask__");
		try{
			if(loadmask) {
				if(layout instanceof cpr.controls.layouts.FormLayout
					|| layout instanceof cpr.controls.layouts.VerticalLayout){
					_app.floatControl(loadmask, showConstraint);
				}else{
					container.replaceConstraint(loadmask, showConstraint);
				}
			} else {
				loadmask = new udc.com.loadmask("__loadmask__");
				
				if(layout instanceof cpr.controls.layouts.FormLayout
					|| layout instanceof cpr.controls.layouts.VerticalLayout){
					_app.floatControl(loadmask, showConstraint);
				}else{
					container.addChild(loadmask, showConstraint);
				}
				container.getAppInstance().register(loadmask);
			}
		}catch(ex){showConstraint = null;}
	}
	
	this._activeLoadMask = loadmask;
};

/**
 * LoadMask를 감춤
 * - 사이트별 Customizing 필요
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
AppKit.prototype.hideLoadMask = function(app) {
	if(this._activeLoadMask) {
		if(this._activeLoadMask.module && this._activeLoadMask.module.end) {
			this._activeLoadMask.module.end();
		}
		var hideConstraint = {
				"position" : "absolute",
				"top" : "-1px",
				"left" : "-1px",
				"width" : "1px",
				"height" : "1px"
		};
		
		//앱 객체가 사라진 경우... ROOT앱을 기본으로 하여 처리
		if(app == null || app.getRootAppInstance() == null){
			app = this._getRootApp();
		}
		
		var isPopup = false;
		if(app.getHost() && app.getHost().modal === true){
			isPopup = true;
		}
		
		//popup에서 udc 사용할 때 로드마스크 띄우는곳 오류로 추가
		var isUdcPop = false;
		if((app.id.indexOf("udc/") === 0) && (app.getHostAppInstance().app.modal === true)) {
			isUdcPop = true;
		}
		
		//popup에서 임베디드 사용할 때 로드마스크 띄우는곳 오류로 추가
		var isEmbPop = false;
		if(app.getHost() && app.getHostAppInstance().getHost() && app.getHost().type == "embeddedapp" && app.getHostAppInstance().getHost().app.modal === true) {
			isEmbPop = true;
		}
		
		//var container = isPopup ? app.getContainer() : app.getRootAppInstance().getContainer();
		var _app;
		if(isUdcPop) {
			_app = app.getHostAppInstance();
		} else if(isEmbPop) {
			_app = app.getHostAppInstance();
		} else {
			_app = isPopup ? app : app.getRootAppInstance();
		}
		var container = _app.getContainer();
		
		try{
			var layout = container.getLayout();
			if(layout instanceof cpr.controls.layouts.FormLayout
				|| layout instanceof cpr.controls.layouts.VerticalLayout){
				_app.removeFloatingControl(this._activeLoadMask);
			}else{
				hideConstraint = this.wrapConstraints(_app, hideConstraint);
				container.replaceConstraint(this._activeLoadMask, hideConstraint);
			}
			if(this._activeLoadMask){
				this._activeLoadMask.module.count(0);
				this._activeLoadMask.module.hide();
			}
		}catch(ex){hideConstraint = null;}
		
		this._activeLoadMask = null;
	}
};

/**
 * 최상위 루트 AppInstance를 반환한다.
 * @private
 */
AppKit.prototype._getRootApp = function() {
	return cpr.core.Platform.INSTANCE.lookup("app/com/inc/main").getInstances()[0];
};

/**
 * 메인 앱에 대한 인스턴스를 반환한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @returns 
 */
AppKit.prototype.getMainApp = function(app) {
	if(app.isRootAppInstance()) {
		return app;
	}else{
		if(app.getHostAppInstance().isRootAppInstance()) return app;
		else return this.getMainApp(app.getHostAppInstance());
	}
};

/**
 * 모바일 접속여부를 반환한다.
 */
AppKit.prototype.isAccessMobile = function() {
	var info = cpr.utils.Util.detectBrowser();
	if(info.mobile || info.os.indexOf("Android") > -1) return true;
	return false;
};

/**
 * 해당 오브젝트가 함수 타입인지 여부를 반환한다.
 * @return true/false
 */
AppKit.prototype.isFunc = function(poCallBackFunc) {
	if (typeof (poCallBackFunc) == "function") return true;
	return false;
};

/**
 * 메인 화면에 데이터 변경사항이 있는지 여부를 체크한다.
 * 그리드, 폼레이아웃(프리폼) 대상(UDC, EMB 포함)
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {String} psAftMsg (Optional) 메시지구분
 * @returns {Boolean} 데이터 변경여부
 */
AppKit.prototype.isAppModified = function(app, psAftMsg) {
	var mainApp = this.getMainApp(app);
	if(mainApp == null) return false;
	
	var vaDataCtrls = new Array();
	var container = mainApp.getContainer();
	function getChildRecursive(poContainer){
	    var vaChildCtrls = poContainer.getAllRecursiveChildren();
	    for (var i=0, len=vaChildCtrls.length; i<len; i++) {
	        if (vaChildCtrls[i].type == "grid") {
	        	vaDataCtrls.push(vaChildCtrls[i]);
	        }else if (vaChildCtrls[i] instanceof cpr.controls.Container && vaChildCtrls[i].style.getClasses().indexOf("form-box") != -1) {
	        	vaDataCtrls.push(vaChildCtrls[i]);
	        }else if(vaChildCtrls[i] instanceof cpr.controls.UDCBase){
	        	var voUdcApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voUdcApp) getChildRecursive(voUdcApp.getContainer());
	        }else if(vaChildCtrls[i] instanceof cpr.controls.EmbeddedApp){
	        	var voEmbApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voEmbApp) getChildRecursive(voEmbApp.getContainer());
	        }
	    }
	}
	getChildRecursive(container);
	
	var modify = false;
	var ctrl = null;
	var vsFieldLabel = "";
	for(var i=0, len=vaDataCtrls.length; i<len; i++){
		ctrl = vaDataCtrls[i];
		if(ctrl.type == "grid"){
			if(ctrl.userAttr("ignoreModify") === "Y" || ctrl.dataSet == null) continue;
			if(ctrl.dataSet.isModified()){
				modify = true;
				vsFieldLabel = ctrl.fieldLabel;
				break;
			}
		}else{
			var dataSet = this.Group.getBindDataSet(ctrl.getAppInstance(), ctrl);
			if(dataSet != null && dataSet.isModified()) {
				modify = true;
				vsFieldLabel = ctrl.fieldLabel;
				break;
			}
		}
	}
	if(modify && psAftMsg != null && psAftMsg.toUpperCase() == "CRM"){//변경사항이 반영되지 않았습니다. 계속 하시겠습니까? confirm
		if(!this.Msg.confirm("NLS-CRM-M057", [vsFieldLabel])) return true;
		else return false;
	}
	return modify;
};

/**
 * 메인 화면에 데이터 변경사항이 있는지 여부를 체크한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @returns {Object Array} 변경된 데이터셋 객체 배열
 */
AppKit.prototype.getAllAppModifiedDataSet = function(app) {
	var mainApp = this.getMainApp(app);
	if(mainApp == null) return false;
	
	var vaDataCtrls = new Array();
	var vaDataSets = new Array();
	var container = mainApp.getContainer();
	function getChildRecursive(poContainer){
	    var vaChildCtrls = poContainer.getAllRecursiveChildren();
	    for (var i=0, len=vaChildCtrls.length; i<len; i++) {
	        if (vaChildCtrls[i].type == "grid") {
	        	vaDataCtrls.push(vaChildCtrls[i]);
	        }else if (vaChildCtrls[i] instanceof cpr.controls.Container && vaChildCtrls[i].style.getClasses().indexOf("form-box") != -1) {
	        	vaDataCtrls.push(vaChildCtrls[i]);
	        }else if(vaChildCtrls[i] instanceof cpr.controls.UDCBase){
	        	var voUdcApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voUdcApp) getChildRecursive(voUdcApp.getContainer());
	        }else if(vaChildCtrls[i] instanceof cpr.controls.EmbeddedApp){
	        	var voEmbApp = vaChildCtrls[i].getEmbeddedAppInstance();
	        	if(voEmbApp) getChildRecursive(voEmbApp.getContainer());
	        }
	    }
	}
	getChildRecursive(container);
	
	var ctrl = null;
	for(var i=0, len=vaDataCtrls.length; i<len; i++){
		ctrl = vaDataCtrls[i];
		if(ctrl.type == "grid"){
			vaDataSets.push(ctrl.dataSet);
		}else{
			var dataSet = this.Group.getBindDataSet(ctrl.getAppInstance(), ctrl);
			if(dataSet == null) continue;
			vaDataSets.push(dataSet);
		}
	}
	
	return vaDataSets;
};

/**
 * 메인화면에 막(Cover)를 쒸운다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
AppKit.prototype.coverPage = function(app) {
	var coverCtl = new cpr.controls.Container("comPageCover");
	coverCtl.style.css({"background-color":"#ededed", "opacity":"0.5"});
	coverCtl.setLayout(new cpr.controls.layouts.XYLayout());
	var mainApp = this.getMainApp(app);
	
	var container = mainApp.getContainer();
	var layout = container.getLayout();
	if(layout instanceof cpr.controls.layouts.FormLayout || layout instanceof cpr.controls.layouts.VerticalLayout){
		mainApp.floatControl(coverCtl, {
			"top": "0px",
			"right": "0px",
			"bottom": "0px",
			"left": "0px"
		});
	}else{
		container.addChild(coverCtl, {
			"top": "0px",
			"right": "0px",
			"bottom": "0px",
			"left": "0px"
		});
	}
};

/**
 * 메인화면에 막(Cover)를 제거한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 */
AppKit.prototype.removeCover = function(app) {
	var coverCtl = new cpr.controls.Container("comPageCover");
	coverCtl.style.css({"background-color":"#ededed", "opacity":"0.5"});
	coverCtl.setLayout(new cpr.controls.layouts.XYLayout());
	var mainApp = this.getMainApp(app);
	var container = mainApp.getContainer();
	
	var floatCtrls = mainApp.getFloatingControls();
	floatCtrls.filter(function(ctrl){
		return ctrl instanceof cpr.controls.Container && ctrl.id == "comPageCover";
	}).forEach(function(ctrl){
		var layout = container.getLayout();
		if(layout instanceof cpr.controls.layouts.FormLayout || layout instanceof cpr.controls.layouts.VerticalLayout){
			mainApp.removeFloatingControl(ctrl);
		}else{
			container.removeChild(ctrl);
		}
	});
};

/**
 * 컨트롤(그룹) 또는 Grid의 내의 입력 값에 대한 유효성 체크를 수행한다.
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @param {#uicontrol | Array} paCtlId 컨트롤 ID
 * @param {String} dataScope? (all:그리드의 전체 데이터, modify:변경된 전체 Row, current:현재  Row)
 * @returns {Boolean} Valid true, Invalid false.
 */
AppKit.prototype.validate = function(app, paCtlId, dataScope) {
	dataScope = dataScope != null ? dataScope : "upd";
	if(!(paCtlId instanceof Array)){
		paCtlId = [paCtlId];
	}
	
	var valid = true;
	for(var i=0, len=paCtlId.length; i<len; i++) {
		var ctrlId = paCtlId[i];
		var ctrl = app.lookup(paCtlId[i]);
		if(ctrl instanceof cpr.controls.Grid){
			valid = this._validateGrid(ctrl, dataScope);
		}else if(ctrl instanceof cpr.controls.Container){
			/** @type cpr.bind.BindContext */
			var bindContext = this.Group.getBindContext(app, ctrl);
			if(bindContext){
				/**@type cpr.data.DataSet */
				var dataset = bindContext.grid ? bindContext.grid.dataSet : bindContext.dataSet;
				var rowIndex = bindContext.grid ? bindContext.grid.getSelectedRowIndex() : bindContext.rowIndex;
				//프리폼의 상태가 삭제상태이면... 유효성 체크에서 제외함
				if(dataset.getRowState(rowIndex) == cpr.data.tabledata.RowState.DELETED) continue;
				
				if(bindContext.grid){
					valid = this._validateFreeForm(ctrl, dataset);
				}else{
					valid = this._validateControl(ctrl);
				}
			}else{
				valid = this._validateControl(ctrl);
			}
		}else{
			valid = this._validateControl(ctrl);
		}
		
		if(valid == false) {
			return false;
		}
	}
	
	return true;
};


/**
 * @private
 * 일반 컨트롤에 대한 Validation 체크
 * @param {cpr.controls.UIControl} ctrl
 * @param {cpr.controls.UIControl} poParentCtl
 */
AppKit.prototype._validateControl = function(ctrl, poParentCtl) {
	if(!ctrl) return true;
	
	var valid = true;
	var _this = this;
	if(ctrl instanceof cpr.controls.Container) { // Group 일 경우 체크
		var children = this._getChildren(ctrl);
		var child;
		for(var i=0, len=children.length; i<len; i++){
			child = children[i];
			// 컨트롤별 Validation Check
			if(this._validateControl(child, ctrl) == false) {
				valid = false;
				break;
			}
		}
		return valid;
	} else if(ctrl instanceof cpr.controls.UDCBase || ctrl instanceof cpr.controls.EmbeddedApp){ //UDC나 임베디드인 경우
		var embApp = ctrl.getEmbeddedAppInstance();
		var children = embApp.getContainer().getAllRecursiveChildren();
		var child;
		for(var i=0, len=children.length; i<len; i++){
			child = children[i];
			// 컨트롤별 Validation Check
			if(this._validateControl(child, ctrl) == false) {
				valid = false;
				break;
			}
		}
		return valid;
	} else {
		//20210621 추가
		if(ctrl.userAttr("ignorePKColumn") == "Y") return valid;
		
		valid = this.Validator.validate(ctrl, ctrl.value, poParentCtl);
		if(valid == false) {
			//탭내에 컨트롤이 존재하는 경우... 해당 탭페이지 포커싱
			this._focusToTabItem(ctrl);
			ctrl.focus();
		}
		return valid;
	}
};

/**
 * @private
 * Grid의 변경된 전체 데이터에 대한 Validation 체크
 * @param {cpr.controls.Grid} poGrid 체크할 Grid
 * @param {String} dataScope (all:그리드의 전체 데이터, modify:변경된 전체 Row, current:현재  Row)
 * @returns {Boolean}
 */
AppKit.prototype._validateGrid = function(poGrid, dataScope) {
	dataScope = dataScope != null ? dataScope : "modify";
	/** @type cpr.controls.Grid */
	var grd = poGrid;
	if(!grd) return false;
	
	var vsDataBindCtxId = grd.userAttr("bindDataFormId");
	
	var _this = this;
	/**
	 * @type cpr.controls.gridpart.GridBand
	 */
	var detailBand = grd.detail;
	var cellCnt = detailBand.cellCount;
	
	/**
	 * @type cpr.data.DataSet
	 */
	var dataSet = grd.dataSet;
	var rowIndexs = null;
	if(dataScope == "all"){
		rowIndexs = dataSet.getRowStatedIndices(cpr.data.tabledata.RowState.INSERTED | cpr.data.tabledata.RowState.UPDATED | cpr.data.tabledata.RowState.DELETED | cpr.data.tabledata.RowState.UNCHANGED);
	}else{
		rowIndexs = dataSet.getRowStatedIndices(cpr.data.tabledata.RowState.INSERTED | cpr.data.tabledata.RowState.UPDATED);
	}
	var _this = this;
	var invalid = rowIndexs.some(function(idx) {
		var row = dataSet.getRow(idx);
		var col = null;
		for(var i = 0; i < cellCnt; i++) {
			/**  @type cpr.controls.gridpart.GridColumn */
			col = detailBand.getColumn(i);
			//컬럼 매핑노드가 없으면... SKIP
			if(col.columnName == null || col.columnName == "") continue;
			if(col.columnType == "checkbox" || col.columnType == "rowindex") continue;
			//컬럼 유형이 output이면... SKIP
			if(col.controlType == null || col.controlType == "output" || col.controlType == "button" || col.controlType == "img") continue;
			//신규행  PK 체크 무시... SKIP
			if(row.getState() == cpr.data.tabledata.RowState.INSERTED && (col.control && col.control.userAttr("ignorePKColumn") == "Y")) continue;
			
			// 컨트롤별 Validation Check
			if(_this.Validator.validate(col.control, row.getValue(col.columnName), grd, idx, i) == false) {
				//유효성 체크로 인해 selection-change 발생여부 셋팅 
				grd.userAttr("selectionChangeByValidation", "true");
				//탭내에 컨트롤이 존재하는 경우... 해당 탭페이지 포커싱
				_this._focusToTabItem(grd);
				if(ValueUtil.isNull(vsDataBindCtxId)){
					grd.setEditRowIndex(idx, true);
					grd.focusCell(idx, i);
					//포커싱할 컬럼이 UDC인 경우에...
					var dctrl = grd.detail.getColumn(i).control;
					if(dctrl instanceof cpr.controls.UDCBase){
						var empApp = dctrl.getEmbeddedAppInstance();
						dctrl = AppUtil.getUDCBindValueControl(dctrl);
						if(dctrl) empApp.focus(dctrl.id);
					}
				}else{
					grd.selectRows(idx);
					var cctrl = _this.Group.getDataBindedControl(dataSet.getAppInstance(), vsDataBindCtxId, col.columnName);
					if(cctrl) _this.Control.setFocus(cctrl.getAppInstance(), cctrl.id);
				}
				
				return true;
			}
		}
		return false;
	});
	if(invalid == true) {
		return false;
	}
	
	return true;
};

/**
 * @private
 * 그리드와 Selection바인딩된 프리폼의 변경된 전체 데이터에 대한 Validation 체크
 * @param {cpr.controls.Container} poForm 체크할 프리폼 컨트롤객체
 * @returns {Boolean}
 */
AppKit.prototype._validateFreeForm = function(poForm) {
	/** @type cpr.controls.Container */
	var form = poForm;
	if(!form) return false;
	
	var _app = form.getAppInstance();
	
	var bindContext = this.Group.getBindContext(_app, form);
	var grid =  bindContext.grid;
	var dataSet = grid.dataSet;
	var _this = this;
	
	var allChildControls = new Array();
	var getChildRecursive = function(poContainer){
	    var childCtrls = poContainer.getAllRecursiveChildren();
	    for (var i=0, len=childCtrls.length; i<len; i++) {
	        if (childCtrls[i] instanceof cpr.controls.Container ) {
	        	getChildRecursive(childCtrls[i]);
	        }else if(childCtrls[i] instanceof cpr.controls.UDCBase){
	        	var udcApp = childCtrls[i].getEmbeddedAppInstance();
	        	if(udcApp) getChildRecursive(udcApp.getContainer());
	        }else if(childCtrls[i] instanceof cpr.controls.EmbeddedApp){
	        	var embApp = childCtrls[i].getEmbeddedAppInstance();
	        	if(embApp) getChildRecursive(embApp.getContainer());
	        }else {
	        	allChildControls.push(childCtrls[i]);
	        }
	    }
	}
	getChildRecursive(form);
	var allTargetControls = allChildControls.filter(function(ctrl){
		//컬럼 유형이 output이면... SKIP
		if(ctrl == null || ctrl.type == "output" || ctrl.type == "button" || ctrl.type == "img") return false;
		//컨트롤에 Bind된 컬럼이 없으면...SKIP
		var bind = ctrl.getBindInfo("value");
		//20210429 UDC에 포함된 컨트롤 유효성체크위해
		if(bind != null && bind.type == "appproperty") return true;
		
		if(bind == null || bind.type != "datacolumn" || bind.columnName == null) return false;
		
		return true;
	});
	
	var rowIndexs = dataSet.getRowStatedIndices(cpr.data.tabledata.RowState.INSERTED | cpr.data.tabledata.RowState.UPDATED);
	var _this = this;
	var invalid = rowIndexs.some(function(idx) {
		var row = dataSet.getRow(idx);
		/**@type cpr.controls.UIControl */
		var ctrl = null;
		
		for(var i = 0, len = allTargetControls.length; i < len; i++) {
			ctrl = allTargetControls[i];
			//컨트롤에 Bind된 컬럼이 없으면...SKIP
			var bind = ctrl.getBindInfo("value");
			var ctrlValue;
			//20210429 UDC에 포함된 컨트롤 유효성체크위해
			if(bind.type == "appproperty") {
				ctrlValue = row.getValue(ctrl.getAppInstance().getAppPropertyBindInfo("value").columnName);
			} else {
				ctrlValue = row.getValue(bind.columnName);
			}
			//신규행  PK 체크 무시... SKIP
			if(row.getState() == cpr.data.tabledata.RowState.INSERTED && (ctrl.userAttr("ignorePKColumn") == "Y")) continue;
			
			// 컨트롤별 Validation Check
			if(_this.Validator.validate(ctrl, ctrlValue, form) == false) {
				//유효성 체크로 인해 selection-change 발생여부 셋팅 
				grid.userAttr("selectionChangeByValidation", "true");
				_this._focusToTabItem(form);
				//탭내에 컨트롤이 존재하는 경우... 해당 탭페이지 포커싱
				grid.selectRows(idx);
				_app.focus(ctrl);
				
				return true;
			}
		}
		return false;
	});
	if(invalid == true) {
		return false;
	}
	
	return true;
};

/**
 * @private
 * Validation 체크시 컨트롤이 속한 탭폴더 선택용
 * @param {cpr.controls.UIControl} ctrl - 컨트롤 객체
 */
AppKit.prototype._focusToTabItem = function(ctrl) {
	/**@type cpr.controls.TabFolder */
	var tab = null;
	ctrl.findParent(function(pctrl){
		if(pctrl instanceof cpr.controls.TabFolder){
			tab = pctrl;
			return true;
		}
		return false;
	});
	if(tab){
		var tabItem = null;
		var tabItems = tab.getTabItems();
		ctrl.findParent(function(pctrl){
			tabItems.some(function(each){
				if( each.content == pctrl){
					tabItem = each;
					return true;
				}
				return false;
			});
			return tabItem != null;
		});
		if(tabItem && tabItem != tab.getSelectedTabItem()){
			tab.setSelectedTabItem(tabItem);
		}
	}
};

/**
 * @private
 * 그룹 컨트롤내의 자식 컨트롤 목록을 반환한다.
 * @param {cpr.controls.Container} pcGroup - 그룹컨트롤
 */
AppKit.prototype._getChildren = function(pcGroup) {
	var children = pcGroup.getAllRecursiveChildren();
	function getNextControls(each,children){
		var order = [each];
		var next = each;
		while(next != null){
			next = next.getNextControl();
			if(next != null && children.indexOf(next) > -1 && order.indexOf(next) == -1) order.push(next);
			else next = null;
		}
		return order;
	} 
	
	var orderCtrls = [];
	children.forEach(function(each){
		if(children.indexOf(each.getPrevControl()) ==-1 && each.getNextControl() != null){
			orderCtrls = getNextControls(each,children);
		}
	});
	
	var etcCtrls = [];
	children.forEach(function(each){
		if(orderCtrls.indexOf(each) == -1){
			etcCtrls.push(each);
		}
	});
	
	return orderCtrls.concat(etcCtrls);
};

/**
 * 시스템 로케일 언어키 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @returns {String} 디폴트 언어키
 */
AppKit.prototype.getSystemLocale = function(app) {
	var rootApp = app.getRootAppInstance();
	if(rootApp.hasAppMethod("getSystemLocale")){
		return rootApp.callAppMethod("getSystemLocale");
	}
	return "CS003KR";
};

/**
 * 디폴트 로케일 언어키 취득
 * @param {cpr.core.AppInstance} app 앱인스턴스
 * @returns {String} 디폴트 언어키
 */
AppKit.prototype.getDefaultLocale = function(app) {
	var rootApp = app.getRootAppInstance();
	if(rootApp.hasAppMethod("getDefaultLocale")){
		return rootApp.callAppMethod("getDefaultLocale");
	}
	return "CS003KR";
};

///**
// * 권한 유틸
// * @constructor
// * @param {common.module} appKit
// */
//function AppAuthKit(appKit){
//	this._appKit = appKit;
//};
//
///**
// * 로그인 사용자의 정보를 취득
// * @param {cpr.core.AppInstance} app 앱인스턴스
// * @param {String} psUserInfoType? 사용자정보 TYPE 세션정보 참고<br/>
// * ID			오브젝트ID(학생ID, 교직원ID)
// * USER_ID		사용자ID
// * USER_NM		사용자명
// * USER_DIV_CD	사용자구분코드
// * SYS_MGR_YN	관리자여부
// * ASGN_DEP_CD  소속부서코드
// * ASGN_DEP_NM  소속부서명
// * ASGN_DEPT_DIV_RCD 소속부서구분코드
// * LANG	     		언어
// * @return {String | cpr.data.DataMap} psUserInfoType 미지정시 Map 형태의 사용자 정보 리턴 
// */
//AppAuthKit.prototype.getUserInfo = function(app, psUserInfoType) {
//	var rootApp = app.getRootAppInstance();
//	if(rootApp.hasAppMethod("getUserInfo")){
//		if(ValueUtil.isNull(psUserInfoType)){
//			return rootApp.callAppMethod("getUserInfo");
//		}else{
//			return rootApp.callAppMethod("getUserInfo", [psUserInfoType]);
//		}
//	}
//};
//
///**
// * 메뉴 정보 취득
// * psMenuType 생략시 메뉴 정보 MAP 리턴
// * - 사이트별 Customizing 필요
// * @param {cpr.core.AppInstance} app 앱인스턴스
// * @param {String} psMenuType?  메뉴 정보 TYPE
// * @return {cpr.utils.ObjectMap | String} 
// * 			getMenuInfo.get("OPRT_ROLE_ID");		//업무역할ID
// *			getMenuInfo.get("MENU_ID");				//메뉴ID
// *			getMenuInfo.get("PGM_ID");				//프로그램ID
// *			getMenuInfo.get("MENU_NM");				//메뉴명
// *			getMenuInfo.get("MENU_AUTH_DIV_RCD"); 	//메뉴권한구분코드
// *			getMenuInfo.get("AUTH_RNG_RCD"); 		//권한범위코드
// *			getMenuInfo.get("UNIT_SYSTEM_RCD");		//단위시스템코드
// *			getMenuInfo.get("CALL_PAGE");			//호출페이지
// * 			getMenuInfo.get("CTRL_VAR_01");			//파라미터1
// * 			getMenuInfo.get("CTRL_VAR_02");			//파라미터2
// * 			getMenuInfo.get("CTRL_VAR_03");			//파라미터3
// * 			getMenuInfo.get("CTRL_VAR_04");			//파라미터4
// */
//AppAuthKit.prototype.getMenuInfo = function(app, psMenuType){
//	var voMap = new cpr.utils.ObjectMap();
//	
//	var _mainApp = this._appKit.getMainApp(app);
//	var vsData = null;
//	if(_mainApp.__menuInfo != null){
//		vsData = _mainApp.__menuInfo;
//	}else{
//		var rootApp = app.getRootAppInstance();
//		/** @type cpr.controls.MDIFolder */
//		var vcMdi = rootApp.lookup("mdiCn");
//		if(vcMdi){
//			var vcTabItem = vcMdi.getSelectedTabItem();
//			if(vcTabItem != null){
//				vsData = vcTabItem.userAttr("__menuInfo");
//				_mainApp.__menuInfo = vsData;
//			}
//		}
//	}
//	if(!ValueUtil.isNull(vsData)){
//		var voData = JSON.parse(vsData);
//		if(psMenuType != null){
//			return ValueUtil.fixNull(voData[psMenuType]);
//		}else{
//			for(var key in voData){
//				voMap.put(key, ValueUtil.fixNull(voData[key]));
//			}
//			return voMap;
//		}
//	}else{
//		return voMap;
//	}
//};
//
///**
// * 해당 화면이 개인권한 화면인지 여부(true/false) 반환한다.
// * @param {cpr.core.AppInstance} app 앱인스턴스
// */
//AppAuthKit.prototype.isPrivateAuth = function(app){
//	var vsAuthRngRcd = this._appKit.Auth.getMenuInfo(app, "AUTH_RNG_RCD");
//	return vsAuthRngRcd == "CC00104" ? true : false;
//};
//
///**
// * 해당 화면이 소속부서권한 화면인지 여부(true/false) 반환한다.
// * @param {cpr.core.AppInstance} app 앱인스턴스
// */
//AppAuthKit.prototype.isAsgnDeptAuth = function(app){
//	var vsAuthRngRcd = this._appKit.Auth.getMenuInfo(app, "AUTH_RNG_RCD");
//	return vsAuthRngRcd == "CC00105" ? true : false;
//};
//
///**
// * 화면 권한에 따른 컨트롤 제어를 수행한다.
// *  - 조회권한인 경우 입력 권한 컨트롤 비활성화 및 안보임 처리
// * - 사이트별 Customizing 필요
// * @param {cpr.core.AppInstance} app 앱인스턴스
// * @param {String} psMenuAuthDivRcd - 메뉴권한코드[CMN045] 입력(CMN045.0001), 관리(CMN045.0003), 조회(CMN045.0002)
// * @param {String} psSearchBoxId - (Optional) 검색조건 그룹ID
// */
//AppAuthKit.prototype.applyAuthForCtrls = function(app, psMenuAuthDivRcd, psSearchBoxId){
//	if(app.isRootAppInstance()) return;
//	var getParameterByName = function(name, url) {
//	    name = name.replace(/[\[\]]/g, "\\$&");
//	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
//	    var results = regex.exec(url);
//	    return results == null ? "" : results[2];
//	}
//	//새창으로 띄웠는지 여부 Flag, 새창으로 띄운 경우... 무조건 조회용임
//	var vsFlag = getParameterByName("flag", top.location.href); 
//	
//	var vaSearchBoxIds = ValueUtil.split((!ValueUtil.isNull(psSearchBoxId) ? psSearchBoxId : ""), ",");
//	
//	var vaTargetCtrls = new Array();
//	var container = app.getContainer();
//	function getChildRecursive(poContainer){
//	    var vaChildCtrls = poContainer ? poContainer.getAllRecursiveChildren() : container.getAllRecursiveChildren();
//	    for (var i=0, len=vaChildCtrls.length; i<len; i++) {
//	        if (vaChildCtrls[i].type == "udc.com.comButton"
//	        	|| vaChildCtrls[i].type == "udc.com.comButtonSave"
//	        	|| vaChildCtrls[i].type == "grid"
//	        	|| vaChildCtrls[i].type == "button"
//	        	|| vaChildCtrls[i].type == "container" && vaSearchBoxIds.indexOf(vaChildCtrls[i].id) == -1 && (vaChildCtrls[i].getLayout() instanceof cpr.controls.layouts.FormLayout)) {
//	        	vaTargetCtrls.push(vaChildCtrls[i]);
//	        }else if (vaChildCtrls[i] instanceof cpr.controls.Container ) {
//	        	getChildRecursive(vaChildCtrls[i]);
//	        }
//	    }
//	    vaChildCtrls = null;
//	}
//	
//	//하위의 대상 컨트롤들을 모두 취합
//	getChildRecursive(container);
//	
//	var header = this._appKit.Group.getAllChildrenByType(app, "udc.com.appHeader");
//	if(header != null && header.length > 0){
//		var vcCtrl = header[0].getEmbeddedAppInstance().lookup("grpButtons");
//		if(vcCtrl){
//			vcCtrl.visible = false;
//		}
//	}
//	
//	vaTargetCtrls.forEach(function(ctrl){
//		//공통 작업버튼 UDC인 경우
//		if(ctrl.type == "udc.com.comButton" || ctrl.type == "udc.com.comButtonSave"){
//			ctrl.visible = false;
//		//그리드인 경우
//		}else if(ctrl.type == "grid"){
//			if(ctrl.readOnly !== true) ctrl.readOnly = true;
//		//프리폼인 경우
//		}else if(ctrl.type == "container"){
//			if(ctrl.style && ctrl.style.getClasses().join(";").indexOf("form-box") != -1 && ctrl.getBindContext() != null) ctrl.enabled = false;
//		//버튼인 경우
//		}else if(ctrl.type == "button"){
//			var vsStyle = ctrl.style ? ctrl.style.getClasses().join(";") : "";
//			//커밋 버튼, 신규 버튼, 삭제 버튼, 프리폼 삭제 버튼, 저장 버튼
//			if(vsStyle.indexOf("btn-commit") != -1 || vsStyle.indexOf("btn-new") != -1 || vsStyle.indexOf("btn-delete") != -1 || vsStyle.indexOf("btn-delete-save") != -1 || vsStyle.indexOf("btn-save") != -1){
//				ctrl.visible = false;
//			}
//		}
//	});
//};


// 모든 selection-change 이벤트시 그리드에 대한  필터 추가(for. 그리드의 선택된 로우가 없을 경우 이벤트 전파 차단)
//- 사이트별 Customizing 필요
cpr.events.EventBus.INSTANCE.addFilter("selection-change", function(e) {
    // 이벤트를 발생 시킨 컨트롤
    var control = e.control;
    /** @type cpr.core.AppInstance */
    var _app = control.getAppInstance();
    
    // 이벤트 발송자가 그리드 이고.
    if (control instanceof cpr.controls.Grid) {
    	/** @type cpr.controls.Grid */
    	var grid = control;
    	if(grid.selectionUnit == "cell" && grid.getSelectedIndices()[0] == null){
    		 e.stopPropagation();
    	}else{
    		var rowIndex = grid.selectionUnit != "cell" ? grid.getSelectedRowIndex() : grid.getSelectedIndices()[0]["rowIndex"];
	        // 그리드 선택 ROW가 -1이라면...
	        if (rowIndex < 0) {
	            // 이벤트 전파를 차단시킵니다.
	            e.stopPropagation();
	        }
    	}
    }
});



// 모든 before-selection-change 이벤트에시 그리드에 대한  필터만 추가.(for. 그리드의 선택된 로우가 없을 경우 이벤트 전파 차단)
//- 사이트별 Customizing 필요
cpr.events.EventBus.INSTANCE.addFilter("before-selection-change", function(e) {
    // 이벤트를 발생 시킨 컨트롤
    var control = e.control;
    /** @type cpr.core.AppInstance */
    var _app = control.getAppInstance();
    
    // 이벤트 발송자가 그리드 이고.
    if (control instanceof cpr.controls.Grid) {
    	// 테스트 화면의 경우 이벤트 적용 안함
    	if(e.newSelection[0] == null || e.newSelection[0] == undefined){
    		// 이벤트 전파를 차단시킵니다.
            e.stopPropagation();
		}
    }
});

//모든 before-value-change 이벤트에시 인풋박스에 대한 대소문자 자동변환. (사용자정의 속성에 inputLetter 지정 필요)
//- 사이트별 Customizing 필요
cpr.events.EventBus.INSTANCE.addFilter("before-value-change", function(e) {
    // 이벤트를 발생 시킨 컨트롤
    var control = e.control;
    /** @type cpr.core.AppInstance */
    
    // 이벤트 발송자가 인풋박스이면.
    if (control.type === "inputbox") {
    	var inputLetter = control.userAttr("inputLetter");
		if (inputLetter == "uppercase") {
			if (/[a-z]/g.test(e.newValue)) {
				var newValue = e.newValue.toUpperCase();
				control.value = newValue;
				e.preventDefault();
				e.stopPropagation();
			}
		} else if (inputLetter == "lowercase") {
			if (/[A-Z]/g.test(e.newValue)) {
				var newValue = e.newValue.toLowerCase();
				control.value = newValue;
				e.preventDefault();
				e.stopPropagation();
			}
		}
    }
});

//모든 submit-done 이벤트에시 메인화면의 세션시간 연장 타임아웃을 초기화시킨다.
cpr.events.EventBus.INSTANCE.addFilter("submit-done", function(e) {
    // 이벤트를 발생시킨 컨트롤
    var control = e.control;
    if(control.type == "submission"){
    	var ownerApp = control.getAppInstance();
    	var mobileStr = cpr.core.Platform.INSTANCE.lookup("app/com/inc/main") ? "" : "_mobile"; // 모바일 환경일 경우
    	var rootApp = ownerApp != null ? ownerApp.getRootAppInstance() : cpr.core.Platform.INSTANCE.lookup("app/com/inc/main" + mobileStr).getInstances()[0];
		if(rootApp && rootApp.hasAppMethod("resetAutoTimeAfterSubmit")){
			rootApp.callAppMethod("resetAutoTimeAfterSubmit", []);
		}
    }
});

exports.AppKit = AppKit;

globals.createCommonUtil = function(){
	try {
		/**@type cpr.core.AppInstance */
		var rootApp = cpr.core.Platform.INSTANCE.lookup("app/com/inc/main").getInstances()[0];
		/**@type AppKit */
		var appKit = rootApp.callAppMethod("getCommonUtil");
		
		return appKit != null ? appKit : new AppKit();
	} catch (ex){
		console.log("create new AppKit Util!!");
		return new AppKit();
	}
	
	return new AppKit();
};

/**
 * 화면 자동타임아웃을 Reset 시킨다.
 */
globals.refreshAppicationAutoTimeOut = function(){
	var rootApp = cpr.core.Platform.INSTANCE.lookup("app/com/inc/main").getInstances()[0];
	rootApp.callAppMethod("resetAutoTimeAfterSubmit", []);
};
