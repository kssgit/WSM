var ATTR_MOBILE_H_MARGIN = "mobile-horizontal-margin";
var ATTR_MOBILE_V_MARGIN = "mobile-vertical-margin";
var ATTR_TABLET_H_MARGIN = "tablet-horizontal-margin";
var ATTR_TABLET_V_MARGIN = "tablet-vertical-margin";

var ATTR_MOBILE_COLUMN_COUNT = "mobile-column-count";
var ATTR_TABLET_COLUMN_COUNT = "tablet-column-count";
var ATTR_HIDE_ON_MOBILE = "hide-on-mobile";
var ATTR_NEEDS_AUTO_HEIGHT = "needs-auto-height";
var ATTR_COLLAPSE_DIRECTION = "collapse-direction";

var ATTR_MOBILE_MIN_HEIGHT = "mobile-min-height";
var ATTR_TABLET_MIN_HEIGHT = "tablet-min-height";

var ATTR_MOBILE_INDEX = "mobile-index";
var ATTR_TABLET_INDEX = "tablet-index";
//모바일일 경우 그리드 cell 숨기기.
var ATTR_HIDE_CELL_INDICIES = "hide-cell-indicies";

/**
 * 
 * @param {cpr.controls.layouts.FormDivision} div
 */
function copyDiv(div) {
	var result = new cpr.controls.layouts.FormDivision(div.lengthExpression);
	result.autoSizing = div.autoSizing;
	result.hidden = div.hidden;
	result.shades = div.shades;
	result.customShadeColor = div.customShadeColor;
	result.minLength = div.minLength;
	return result;
}

/**
 * 반응형 폼 레이아웃 유틸리티.
 * @param {cpr.controls.Container} container 폼 레이아웃을 가진 컨테이너.
 */
function RForm(container) {
	this._container = container;

	this._columnSettings = {};

	this._onScreenChange = this._onScreenChange.bind(this);
	this._started = false;
}

/**
 * 화면 크기별 컬럼 설정
 * @type {{[key:string]:number}}
 */
RForm.prototype._columnSettings = {};

/** @type cpr.controls.layouts.FormLayout */
RForm.prototype._originalLayout = null;

/** @type cpr.utils.ObjectMap */
RForm.prototype._originalConstraints = null;

/** @type cpr.core.AppInstance */
RForm.prototype._appInstance = null;

/**
 * 
 * @param {String} screenName
 * @param {String[]} colCount
 */
RForm.prototype.setColumnSettings = function(screenName, colCount) {
	this._columnSettings[screenName] = colCount;

};

/**
 * 초기 상태 백업.
 */
RForm.prototype._backup = function() {
	// 원래 컨스트레인트들.
	this._originalConstraints = new cpr.utils.ObjectMap();

	var children = this._container.getChildren();
	for (var idx = 0; idx < children.length; idx++) {
		var eachChild = children[idx];
		var constraint = this._container.getConstraint(eachChild);
		this._originalConstraints.put(eachChild, constraint);
	}

	this._originalLayout = this._container.getLayout();
};

RForm.prototype.start = function() {
	if (this._started) {
		return;
	}
	this._backup();
	this._appInstance = this._container.getAppInstance();
	this._appInstance.addEventListener("screen-change", this._onScreenChange);
	this._container.addEventListenerOnce("dispose", this.stop.bind(this));
	this._started = true;
};

RForm.prototype.stop = function() {
	if (!this._started) {
		return;
	}
	if (this._appInstance) {
		this._appInstance.removeEventListener("screen-change", this._onScreenChange);
		this._appInstance = null;
	}

	this._started = false;
};

RForm.prototype._restore = function() {
	this._container.setLayout(this._originalLayout);
	/** @type cpr.controls.VisibleUIControl[] */
	var children = this._container.getChildren();
	for (var idx = 0; idx < children.length; idx++) {
		var eachChild = children[idx];
		eachChild.visible = true;
		this._container.replaceConstraint(eachChild, this._originalConstraints.get(eachChild));
	}
	this._clearCollapseClasses();
}

/**
 * 
 * @param {cpr.events.CScreenChangeEvent} e
 */
RForm.prototype._onScreenChange = function(e) {
	var colSettings = this._columnSettings[e.screen.name];
	if (colSettings == null || colSettings <= 0) {
		this._restore();
	} else {
		this._transform(colSettings);
	}
};

/**
 * @return {cpr.controls.VisibleUIControl[]}
 */
RForm.prototype._getSortedChildren = function() {
	var children = this._container.getChildren().slice(0);
	var me = this;
	var useVerticalFirstSort = this._container.userAttr(ATTR_COLLAPSE_DIRECTION) == "vertical";

	/** @type String */
	var explictIndexAttribute = null;
	switch (this._container.getAppInstance().targetScreen.name) {
		case "mobile":
			{
				explictIndexAttribute = ATTR_MOBILE_INDEX;
				break;
			}

		case "tablet":
			{
				explictIndexAttribute = ATTR_TABLET_INDEX;
				break;
			}
	}

	return children.sort(function( /* cpr.controls.UIControl*/ a, /* cpr.controls.UIControl*/ b) {

		var indexA = parseInt(a.userAttr(explictIndexAttribute) || "9999");
		var indexB = parseInt(b.userAttr(explictIndexAttribute) || "9999");
		var explictIndexGap = indexA - indexB;
		if (explictIndexGap !== 0) {
			return explictIndexGap;
		}

		/** @type cpr.controls.layouts.FormConstraint */
		var constA = me._originalConstraints.get(a);

		/** @type cpr.controls.layouts.FormConstraint */
		var constB = me._originalConstraints.get(b);
		var rowDiff = constA.rowIndex - constB.rowIndex;
		var colDiff = constA.colIndex - constB.colIndex;

		if (useVerticalFirstSort) {
			return colDiff !== 0 ? colDiff : rowDiff;
		} else {
			return rowDiff !== 0 ? rowDiff : colDiff;
		}
	});
};

/**
 * 
 * @param {Number} colCount
 */
RForm.prototype._transform = function(colCount) {
	var layout = new cpr.controls.layouts.FormLayout();
	this._container.setLayout(layout);

	layout.horizontalMargin = this._originalLayout.horizontalMargin;
	layout.verticalMargin = this._originalLayout.verticalMargin;
	layout.horizontalSpacing = this._originalLayout.horizontalSpacing;
	layout.verticalSpacing = this._originalLayout.verticalSpacing;
	layout.horizontalSeparatorWidth = this._originalLayout.horizontalSeparatorWidth;
	layout.horizontalSeparatorClass = this._originalLayout.horizontalSeparatorClass;
	layout.verticalSeparatorWidth = this._originalLayout.verticalSeparatorWidth;
	layout.verticalSeparatorClass = this._originalLayout.verticalSeparatorClass;

	switch (this._appInstance.targetScreen.name) {
		case "mobile":
			if (this._container.userAttr(ATTR_MOBILE_H_MARGIN)) {
				layout.horizontalMargin = this._container.userAttr(ATTR_MOBILE_H_MARGIN);
			}
			if (this._container.userAttr(ATTR_MOBILE_V_MARGIN)) {
				layout.verticalMargin = this._container.userAttr(ATTR_MOBILE_V_MARGIN);
			}
			break;

		case "tablet":
			if (this._container.userAttr(ATTR_TABLET_H_MARGIN)) {
				layout.horizontalMargin = this._container.userAttr(ATTR_TABLET_H_MARGIN);
			}
			if (this._container.userAttr(ATTR_TABLET_V_MARGIN)) {
				layout.verticalMargin = this._container.userAttr(ATTR_TABLET_V_MARGIN);
			}
			break;

	}

	var columnDivisions = this._originalLayout.getColumnDivisions();
	var colSettings = columnDivisions.slice(0, colCount);

	// 모바일이나 태블릿이 컬럼 개수가 더 많은 경우 처리.
	while (colSettings.length < colCount) {
		colSettings.push(copyDiv(colSettings[colSettings.length - 1]));
	}

	var rowDiv = new cpr.controls.layouts.FormDivision("1fr");

	// 세로 컬랩스 처리.
	if (this._container.userAttr(ATTR_COLLAPSE_DIRECTION) == "vertical") {
		var rowDivisions = this._originalLayout.getRowDivisions();
		colSettings.forEach(function( /* cpr.controls.layouts.FormDivision */ each, idx) {
			each.shades = rowDivisions[idx].shades;
			each.customShadeColor = rowDivisions[idx].customShadeColor;
		});
		rowDiv.shades = false;
	}

	var lastColDiv = colSettings[colSettings.length - 1];
	lastColDiv.lengthExpression = "1fr";
	lastColDiv.shades = false;
	layout.setColumnDivisions(colSettings);

	var numberOfColumns = colSettings.length;
	var sortedChildren = this._getSortedChildren();

	var visibleChildren = sortedChildren.filter(function( /* cpr.controls.VisibleUIControl */ each) {
		return each.userAttr("hide-on-mobile") != "true";
	});

	var hiddenChildren = sortedChildren.filter(function( /* cpr.controls.VisibleUIControl */ each) {
		return each.userAttr("hide-on-mobile") == "true";
	}).forEach(function( /* cpr.controls.VisibleUIControl */ each) {
		each.visible = false;
	});

	var rowIndex = 0;
	var columnIndex = 0;
	var rowNeedsAutoHeight = false;

	/** @type cpr.controls.layouts.FormDivision[] */
	var rows = [];

	for (var idx = 0; idx < visibleChildren.length; idx++) {
		if (rows[rowIndex] == null) {
			rows.push(copyDiv(rowDiv));
		}
		/**
		 * 현재 행에 남은 컬럼 수.
		 */
		var leftColumnsInCurrentLine = numberOfColumns - columnIndex;
		var each = visibleChildren[idx];
		each.visible = true;

		/**
		 * 원래 컨스트레인트.
		 * @type cpr.controls.layouts.FormConstraint
		 */
		var originalConstraint = this._originalConstraints.get(each);
		var originalColSpan = originalConstraint.colSpan || 1;

		var colSpan = Math.min(originalColSpan, leftColumnsInCurrentLine);

		this._container.replaceConstraint(each, {
			rowIndex: rowIndex,
			colIndex: columnIndex,
			colSpan: colSpan
		});

		if (each.userAttr(ATTR_NEEDS_AUTO_HEIGHT) == "true") {
			rows[rows.length - 1].autoSizing = true;
			rows[rows.length - 1].lengthExpression = "25px";
		}

		if (each.userAttr(ATTR_MOBILE_MIN_HEIGHT)) {
			var eachMinLength = parseInt(each.userAttr(ATTR_MOBILE_MIN_HEIGHT));
			var knownRow = rows[rows.length - 1];
			if (knownRow.lengthExpression.match(".*fr$")) {
				knownRow.minLength = Math.max(knownRow.minLength, eachMinLength);
			} else {
				knownRow.lengthExpression = Math.max(parseInt(knownRow.lengthExpression), eachMinLength) + "px";
			}
		}

		columnIndex = columnIndex + colSpan;

		if (columnIndex >= numberOfColumns) {
			rowIndex++;
			columnIndex = 0;
		}
	}

	layout.setRowDivisions(rows);

	this._clearCollapseClasses();
	this._container.style.addClass("collapsed");
	this._container.style.addClass("collapsed-" + colCount);
};

/**
 * 
 * @param {Number} colCount
 */
RForm.prototype._clearCollapseClasses = function() {
	var classes = this._container.style.getClasses();
	var collapseClasses = classes.filter(function( /* String */ each) {
		return each.indexOf("collapsed") === 0;
	});
	collapseClasses.forEach((function( /* String */ each) {
		this._container.style.removeClass(each);
	}).bind(this));
}


/**
 * 
 * @param {cpr.controls.Grid} grid
 */
function RGrid(grid) {
	
	this._grid = grid;
	this._app = grid.getAppInstance();
	this._onScreenChange = this._onScreenChange.bind(this);
	this._app.addEventListener("screen-change", this._onScreenChange);
	grid.addEventListener("dispose", this._handleDispose.bind(this));
}

RGrid.prototype._handleDispose = function(e) {
	this._app.removeEventListener("screen-change", this._onScreenChange);
};

/**
 * @param {cpr.events.CScreenChangeEvent} e
 */
RGrid.prototype._onScreenChange = function(e) {
	switch (e.screen.name) {
		case "mobile":
			{
				this.collapse();
				break;
			}

		default:
			{
				this.restore();
				break;
			}
	}
}

RGrid.prototype.collapse = function() {
	var indicies = this._grid.userAttr(ATTR_HIDE_CELL_INDICIES).split(/[\s,]+/g).map(function( /* String */ each) {
		return parseInt(each);
	});
	var grid = this._grid;
	indicies.forEach(function( /* Number */ each) {
		if(grid.header.getColumn(each)){
			grid.header.getColumn(each).visible = false;	
		}
	});
};

RGrid.prototype.restore = function() {
	var indicies = this._grid.userAttr(ATTR_HIDE_CELL_INDICIES).split(/[\s,]+/g).map(function( /* String */ each) {
		return parseInt(each);
	});
	var grid = this._grid;
	indicies.forEach(function( /* Number */ each) {
		if(grid.header.getColumn(each)){
			grid.header.getColumn(each).visible = true;	
		}
	});
};


/**
 * 
 * @param {cpr.controls.Container} container
 */
globals.makeResponsive = function(container) {
	return new RForm(container);
};

cpr.events.EventBus.INSTANCE.addFilter("init", function(e) {
	if (e.control instanceof cpr.core.AppInstance) {
		/** @type cpr.core.AppInstance */
		var appInstance = e.control;
		var vaCtl = appInstance.getContainer().getAllRecursiveChildren(true);
		vaCtl.some(function(each){
			if (each instanceof cpr.controls.Container) {
				if (each.getLayout() instanceof cpr.controls.layouts.FormLayout && each.userAttr("mobile-column-count") != "") {
					each.userAttr("responsive-configured", "true");
					var rForm = new RForm(each);
					rForm.setColumnSettings("mobile", parseInt(each.userAttr(ATTR_MOBILE_COLUMN_COUNT) || "0"));
					rForm.setColumnSettings("tablet", parseInt(each.userAttr(ATTR_TABLET_COLUMN_COUNT) || "0"));
					rForm.start();
				}
			}
			 if(each instanceof cpr.controls.Grid && each.userAttr(ATTR_HIDE_CELL_INDICIES) != ""){
				new RGrid(each);
			}	
		});
		
		
//		var targetGroups = appInstance.getContainer().getAllRecursiveChildren(true).filter(function( /* cpr.controls.UIControl */ each) {
//			if (each instanceof cpr.controls.Container) {
//				if (each.getLayout() instanceof cpr.controls.layouts.FormLayout && each.userAttr("mobile-column-count") != "") {
//					return true;
//				}
//			}
//			return false;
//		});
//
//		targetGroups.forEach(function( /* cpr.controls.Container */ each) {
//			each.userAttr("responsive-configured", "true");
//			var rForm = new RForm(each);
//			rForm.setColumnSettings("mobile", parseInt(each.userAttr(ATTR_MOBILE_COLUMN_COUNT) || "0"));
//			rForm.setColumnSettings("tablet", parseInt(each.userAttr(ATTR_TABLET_COLUMN_COUNT) || "0"));
//			rForm.start();
//		});
		
//		appInstance.getContainer().getAllRecursiveChildren(true).filter(function( /* cpr.controls.UIControl */ each) {
//			return each instanceof cpr.controls.Grid && each.userAttr(ATTR_HIDE_CELL_INDICIES) != "";
//		}).forEach(function(grid) {
//			new RGrid(grid);
//		});
		
	}
});