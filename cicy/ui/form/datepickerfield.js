(function(){
var FP = CC.ui.form.FormElement.prototype;
var E = CC.Event;
/**
* Datepicker field element
*/
CC.Tpl.def('CC.ui.form.DatepickerField', '<div class="g-datepicker-field"><div class="field-wrap"><input type="text" class="g-corner" id="_el" /><a title="点击选择日期" tabindex="-1" class="trigger" id="_trigger" href="javascript:fGo();"></a></div></div>');
/**
* @name CC.ui.form.DatepickerField
* @class
* @extends CC.ui.form.FormElement
*/
CC.create('CC.ui.form.DatepickerField', CC.ui.form.FormElement, {

	focusCS: 'g-datepicker-field-focus',

	triggerHoverCS: 'triggerOn',

	contextCS: 'g-datepicker-field-ctx',

	_leaveFocus: true,

	maxH: 20,

	applyTimeout: 200,

	initComponent: function() {
		FP.initComponent.call(this);
		//关闭leaveFocus标记, element失焦后忽略
		this.bindHoverStyle(this.triggerHoverCS, true, null, null, null, '_trigger', '_trigger')
		.domEvent('click', this.onTriggerClick, false, null, '_trigger')
		.domEvent('mousedown', this.leaveFocusOff, false, null, '_trigger')
		.domEvent('mousedown', this.onFocusTriggerDelay)
		.domEvent('focus', this.onFocusTrigger, false, null, this.element)
		.domEvent('blur', this.onTrackBlur, false, null, this.element)
		.domEvent('keydown', this.onKeydownTrigger, false, null, this.element);
	},

	//@override
	active : function(){
		this.showDatepicker(true);
	},

	deactive : function(){
		this.showDatepicker(false);
	},

	onHide : function(){
		if(!this.getDatepicker().hidden)
		this.getDatepicker().hide();
		CC.ui.form.FormElement.prototype.onHide.apply(this, arguments);
	},

	onTrackBlur: function() {
		if (!this._leaveFocus && (this.datepicker && this.datepicker.hidden)) {
			this.leaveFocusOn();
			return;
		}
		this.onBlurTrigger();
	},

	/**
	* mousedown -> blur -> timeout
	*/
	onFocusTriggerDelay: function() {
		var self = this;
		(function() {
			self.leaveFocusOn();
			self.onFocusTrigger();
		}).timeout(0);
	},

	onBlurTrigger: function() {
		//恢复标记
		if (!this._leaveFocus) return;
		FP.onBlurTrigger.call(this);
	},

	leaveFocusOff: function() {
		if (this._leaveFocus !== false) this._leaveFocus = false;
	},

	leaveFocusOn: function() {
		if (this._leaveFocus !== true) this._leaveFocus = true;
	},

	onTriggerClick: function() {
		this.showDatepicker( !! this.getDatepicker().hidden);
	},

	showDatepicker: function(b) {
		var dp = this.getDatepicker();
		this.datepicker.display(b);
		if (b) {
			if (this.getValue())
			dp.setValue(this.getValue(), true);

			//get the right position.
			//callback,cancel, caller, childId, cssTarget, cssName
			dp.anchorPos(this, 'rb', 'hl', null, true, true);
			dp.bindContext(this.onDatepickerContexted, false, this, null, this, this.contextCS)
			  .focus(0);
		}else {
			this.focus();
		}
	},

	onDatepickerContexted: function(evt) {
		if(evt){
			var el = E.element(evt);
			if (!this.ancestorOf(el)){
				//标记为外部影应,失去焦点
				this.onBlurTrigger();
			}
		}
	},

	getDatepicker: function() {
		var dp = this.datepicker;
		if (!dp) {
			dp = this.datepicker = new CC.ui.Datepicker({
				showTo: document.body,
				autoRender: true,
				hidden: true
			});
			this.follow(dp);
			dp.on('select', this._onDateSelect)
			  .on('keydown', this.onKeydownTrigger, this);
		}
		return dp;
	},

	onKeydownTrigger : function(e){
		if(E.isEscKey(e) || E.isEnterKey(e)){
			if(!this.getDatepicker().hidden){
				E.stop(e);
				this.showDatepicker(false);
				return false;
			}

			if(E.isEnterKey(e)){
				this.getDatepicker().toToday();
				return false;
			}
		}

		FP.onKeydownTrigger.apply(this, arguments);
	},

	_onDateSelect: function(v) {
		var self = this.pCt;
		(function() {
			self.showDatepicker(false);
			self.setValue(v);
		}).timeout(self.applyTimeout);
	},

	setSize: function(a, b) {
		FP.setSize.apply(this, arguments);
		if (a.width) b = a.width;
		if (b !== false) {
			var f = this.fly('_trigger');
			//CC.fly(this.element).setWidth(this.width - (f.getWidth() || 22)).unfly();
			f.unfly();
		}
		return this;
	},
	
	getText : function(){
	  return this.getValue();
	}

});

CC.ui.def('datepicker', CC.ui.form.DatepickerField);
})();