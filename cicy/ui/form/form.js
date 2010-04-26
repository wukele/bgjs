(function(){
var spr;
var CC = window.CC;
var Bx = CC.Base;
var Tpl = CC.Tpl;
/**
 * @name CC.ui.form
 * @namespace
 */
/**
 * 表单元素基类
 * @name CC.ui.form.FormElement
 * @class
 * @extends CC.Base
 */
CC.create('CC.ui.form.FormElement', Bx,
/**@lends CC.ui.form.FormElement#*/{

    elementNode: '_el',

    eventable : true,

    /**
     * 验证状态,默认为true,只读
     */
    isValid : true,
    
    validateOnblur : true,
    
    elementCS: 'g-form-el',

    initComponent: function() {
      //generate template first and searching form element node..
      var v = this.view;
      if (!v) {
        var t = this.template || this.type;
        this.view = v = Tpl.$(t);
      }
      var el = this.element;

      if (!el) el = this.element = this.dom(this.elementNode);

      el.id = this.id || 'comp' + CC.uniqueID();
      this.focusNode = el.id;

      if (v != el && !v.id) v.id = 'comp' + CC.uniqueID();
      //
      this.addClass(this.elementCS);

      Bx.prototype.initComponent.call(this);

      if (this.name) this.setName(this.name);

      if (this.value) this.setValue(this.value);

      if (this.focusCS)
        this.bindFocusCS();
    },
/**
 * 设置聚焦,失焦时样式切换效果
 * @protected
 */
    bindFocusCS : function(cs){
      if(cs)
        this.focusCS = cs;
      this.on('focus', this._switchFocusCS);
      this.on('blur', this._switchFocusCS);
    },

    _switchFocusCS : function(){
      if(this.focused){
        this.addClassIf(this.focusCS);
        this.focusCallback();
      }
      else this.delClass(this.focusCS);

    },

    /**
     * 用于修改聚焦样式时回调,如果子项有聚焦效果并需要监听聚焦的话,就不用重新监听一次,直接重写该函数即可.
     * @protected
     */
    focusCallback : fGo,

    /**
     * 继承的FormElement控件必要实现控件失去/获得焦点时事件的发送.
     * @protected
     */
    onFocusTrigger : function(){
      if(this.focused)
        return;
      this.focused = true;

      if (this.onfocus) this.onfocus();

      this.fire('focus');
    },

    /**@protected*/
    onBlurTrigger : function(){
      if(this.focused){
        this.focused = false;

      if(this.validateOnblur && this.validator){
        this.checkValid();
      }

      if (this.onblur)
          this.onblur();

        this.fire('blur');
      }
    },

    /**
     * 继承的FormElement控件必要实现控件按件事件的发送.
     * @protected
     */
    onKeydownTrigger : function(evt){
      this.fire('keydown', evt);
    },
/**
 * 验证控件,利用控件自身的validator验证,并调用{@link decorateValid}方法修饰结果
 * @return {Boolean}
 */
    checkValid : function(){
      if(this.errorMsg)
        this.errorMsg = false;
      var isv = this.validator? this.validator(this.getValue()):true;
      this.decorateValid(isv);
      return isv;
    },

/**
 * 重写该方法可自定义修饰"错误提示"的方法
 * @param {Boolean} isValid
 */
    decorateValid : function(b){
    	var es = this.errorCS;
    	if(es)
    		this.checkClass(es, !b);
    },
/**
 * 置值
 * @return this;
 */
    setValue: function(v) {
      this.element.value = v;
      this.value = v;
      return this;
    },

/**
 * 获得html form element元素值
 */
    getValue : function(){
      return this.element.value;
    },

/**获得控件文本显示值,返回this.title || this.element.value*/
    getText : function(){
      return this.title || this.element.value;
    },
/**
 * 设置提交字段名称
 * @return this
 */
    setName: function(n) {
      this.element.name = n;
      this.name = n;
      return this;
    },
    
    active : fGo,
    
    deactive : fGo,
    
/**@protected*/
    mouseupCallback: function(evt) {
      if (this.onclick) this.onclick(evt, this.element);
    }
}
);

var cf = CC.ui.form.FormElement;
spr = cf.prototype;

var fr = CC.ui.form;

Tpl.def('Text', '<input type="text" id="_el" class="g-ipt-text g-corner" />')
   .def('Textarea', '<textarea id="_el" class="g-textarea g-corner" />')
   .def('Checkbox', '<span tabindex="0" class="g-checkbox"><input type="hidden" id="_el" /><img src="' + Tpl.BLANK_IMG + '" class="chkbk" /><label id="_tle"></label></span>');
/**
 * @class
 * @name CC.ui.form.Text
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Text', cf, {
    template : 'Text',
    initComponent : function(){
      spr.initComponent.call(this);
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBlurTrigger)
          .domEvent('keydown', this.onKeydownTrigger);
    },

    maxH : 20,

    focusCS: 'g-ipt-text-hover',
    focusCallback: function(evt) {
      spr.focusCallback.call(this, evt);
      //fix chrome browser.
      var self = this;
      //IE6下 this.view.select.bind(this.view).timeout(20);
      // 也会出错,它的select没能bind..晕
      (function() {
        self.view.select();
      }).timeout(20);
    }
});

CC.ui.def('text', fr.Text);
/**
 * @class
 * @name CC.ui.form.Textarea
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Textarea', cf, fr.Text.constructors, {
  template : 'Textarea',
  focusCallback: cf.prototype.focusCallback,
  maxH : Bx.prototype.maxH
});

CC.ui.def('textarea', fr.Textarea);
/**
 * @class
 * @name CC.ui.form.Checkbox
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Checkbox', cf, /**@lends CC.ui.form.Checkbox*/{
    template : 'Checkbox',
    hoverCS: 'g-check-over',
    clickCS: 'g-check-click',
    checkedCS: 'g-check-checked',
    initComponent: function() {
      spr.initComponent.call(this);
      if (this.checked) this.setChecked(true);
      this.domEvent('focus', this.onFocusTrigger)
          .domEvent('blur', this.onBlurTrigger)
          .domEvent('keydown', this.onKeydownTrigger);
    },

    mouseupCallback: function(evt) {
      this.setChecked(!this.checked);
      spr.mouseupCallback.call(this, evt);
    },
/***/
    setChecked: function(b) {
      this.checked = b;
      this.element.checked = b;
      this.checkClass(this.checkedCS, b);
      if (this.onChecked) this.onChecked(b);
    }
});

CC.ui.def('checkbox', fr.Checkbox);
/**
 * @class
 * @name CC.ui.form.Radio
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Radio', cf, fr.Checkbox.constructors, {
  innerCS: 'g-radio',
  template: 'Checkbox',
  hoverCS: 'g-radio-over',
  clickCS: 'g-radio-click',
  checkedCS: 'g-radio-checked'
});
CC.ui.def('radio', fr.Radio);
})();