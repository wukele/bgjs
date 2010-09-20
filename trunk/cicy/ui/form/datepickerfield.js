(function(){
var FP = CC.ui.form.FormElement.prototype;
var E = CC.Event;

CC.Tpl.def('CC.ui.form.DatepickerField', '<div class="g-datepicker-field"><div class="field-wrap"><input type="text" class="g-corner" id="_el" /><a title="点击选择日期" tabindex="-1" class="trigger" id="_trigger" href="javascript:fGo();"></a></div></div>');
/**
* @class CC.ui.form.DatepickerField
* @extends CC.ui.form.FormElement
*/

/**
 * @property {CC.ui.Datepicker} datepicker
 */
 
CC.create('CC.ui.form.DatepickerField', CC.ui.form.FormElement, {

	focusCS: 'g-datepicker-field-focus',

	triggerHoverCS: 'triggerOn',

	contextCS: 'g-datepicker-field-ctx',

	maxH: 20,

	applyTimeout: 200,

	initComponent: function() {
		FP.initComponent.call(this);
		this.bindHoverStyle(this.triggerHoverCS, true, null, null, null, '_trigger', '_trigger')
		.domEvent('click', this.onTriggerClick, false, null, '_trigger')
		.domEvent('focus', this.onFocusTrigger, false, null, this.element)
		.domEvent('blur', this.onBlurTrigger, false, null, this.element)
		.domEvent('keydown', this.onKeydownTrigger, false, null, this.element);
	},

	//@override
	active : function(){
		this.showDatepicker(true);
	},

	deactive : function(){
		this.showDatepicker(false);
	},
  
  // 关联消失
	onHide : function(){
		if(!this.getDatepicker().hidden)
		this.getDatepicker().hide();
		CC.ui.form.FormElement.prototype.onHide.apply(this, arguments);
	},

	onTriggerClick: function() {
		this.showDatepicker( !! this.getDatepicker().hidden);
	},

	showDatepicker: function(b) {
		var dp = this.getDatepicker();
    if(dp.hidden === b){
			this.datepicker.display(b);
			if (b) {
				if (this.getValue())
				dp.setValue(this.getValue(), true);
	
				//get the right position.
				//callback,cancel, caller, childId, cssTarget, cssName
				dp.anchorPos(this, 'rb', 'hl', null, true, true);
				dp.focus(0);
				this.setContexted(true);
			}else {
				this.focus();
			}
    }
	},
  
  onContextRelease : function(e){
      if(e){
          if(this.getDatepicker().ancestorOf(CC.Event.element(e)))
              return false;
      }
      this.showDatepicker(false);
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

	getText : function(){
	  return this.getValue();
	}
	
/*
	setSize: function(a, b) {
		FP.setSize.apply(this, arguments);
		if (a.width) b = a.width;
		if (b !== false) {
			var f = this.fly('_trigger');
			CC.fly(this.element).setWidth(this.width - (f.getWidth() || 22)).unfly();
			f.unfly();
		}
		return this;
	},
*/
});

CC.ui.def('datepicker', CC.ui.form.DatepickerField);
})();