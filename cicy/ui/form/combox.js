CC.Tpl.def('CC.ui.form.Combox', '<div class="g-panel g-combo" tabindex="1" hidefocus="on"><div class="g-panel-wrap g-combo-wrap" id="_wrap"><input type="hidden" id="_el" /><div class="unedit-txt" id="_uetxt"></div><span class="downIco" id="_trigger"></span></div></div>');

/**
 * @name CC.ui.form.Combox
 * @class
 * @extends CC.ui.form.FormElement
 */
CC.create('CC.ui.form.Combox', CC.ui.form.FormElement, function(superclass) {

  function allMather() { return true; }

  var Event = CC.Event;

  return /**@lends CC.ui.form.Combox#*/{

    hoverCS: 'g-combo-on',

    uneditCS: 'g-combo-unedit',

    downCS: 'g-combo-dwn',

    selectorCS:'g-combo-list',

    _leaveFocus: true,

    maxH: 21,
/**
 * 
 */
    filterContent : true,
    
    initComponent: function() {

      //用于填充selector选项的数组
      var array = CC.delAttr(this, 'array');

      //编辑框
      this.editor = new CC.ui.form.Text({
        name: this.name
      });

      //父类初始化
      superclass.initComponent.call(this);

      //不可编辑时显示的主体
      this.uneditNode = this.dom('_uetxt');

      //加入编辑框
      this.dom('_wrap').insertBefore(this.editor.view, null);

      //下拉框主体
      var st = this.selector;

      //默认的下拉框为Folder控件
      st = st ? CC.ui.instance(st):this.createDefSelector();

      var sn = this.getSelectioner(st);
      
      if (array) 
        sn.fromArray(array);

      this.attach(st, sn);
      this._bindKey();

      if (this.uneditable) {
        delete this.uneditable;
        this.setEditable(false);
      } else this.setEditable(true);

      if (this.selected)
        sn.getSelectionProvider().select(this.selected);
      
      delete this.selected;
      
      //
      // 由于Combox由多个控件拼装而成, 为了能正确捕获Combox控件的blur, focus事件,
      // 不得不多监听几个事件,并作一处特殊处理.
      //
      this.domEvent('focus', this.onFocusTrigger);
      this.domEvent('blur', this.onBodyBlurTrigger);
      this.domEvent('focus', this.onFocusTrigger, false, null, this.editor.element);
      this.domEvent('blur', this.onBodyBlurTrigger, false, null, this.editor.element);
      this.domEvent('keydown', this.onKeydownTrigger);
      this.wheelEvent(this.onMouseWheel, true);
      //焦点消失时检查输入值是否是下拉项的某一项,如果有,选择之.
      this.on('blur', this.checkSelected);
    },
    
    onHide : function(){
    	if(!this.selector.hidden)
    		this.selector.hide();
    	superclass.onHide.apply(this, arguments);
    },
    
    createDefSelector : function(){
        var st = CC.ui.instance({
        	ctype:'folder',
          showTo: document.body,
          shadow: true,
          getScrollor : function(){
            if(!this.scrollor)
             this.scrollor = this.dom('_scrollor');
            return this.scrollor;
          }
        });
        return st;
    },
    
/**
 * 获得下拉控件中具有selectionProvider的控件
 */
    getSelectioner : function(st){
      return this.selectioner || st;
    },
    
    onMouseWheel : function(e){
      var dt = CC.Event.getWheel(e);
      if( dt>0 ){
        this.selectioner.selectionProvider.pre();
      }else if( dt<0 ){
        this.selectioner.selectionProvider.next();
      }
    },

    /**
     * @private
     * combox 主体失焦时触发
     */
    onBodyBlurTrigger: function() {
      if (this.selector.hidden && this._leaveFocus) {
        this.onBlurTrigger();
      }
    },

    onBlurTrigger: function() {
      this.leaveFocusOn();
      superclass.onBlurTrigger.call(this);
    },

    disable: function(b) {
      superclass.disable.call(this, b);
      this.editor.disable(b);
    },
/***/
    setScrollorHeight: function(h) {
      this.selector.fly('_scrollor').setHeight(h).unfly();
    },
/***/
    setEditable: function(b) {
      if (this.uneditable !== undefined && this.uneditable == b) return this;

      if (this.uneditable && b) {
        this.delClass(this.uneditCS)
            .unEvent('click', this.onUneditableClick);
      } else if (b) {
        this.domEvent('click', this.onUneditableClick, true, null, '_trigger')
            .domEvent('mousedown', this.leaveFocusOff, false, null, '_trigger');
      } else {
        this.addClass(this.uneditCS)
            .domEvent('click', this.onUneditableClick)
            .unEvent('click', this.onUneditableClick, '_trigger')
            .unEvent('mousedown', this.leaveFocusOff, '_trigger');
      }

      this.uneditable = !b;
      this.focusNode = !b ? this.view: this.editor.element;

      return this;
    },

    //@override
    onKeydownTrigger : function(evt){
      if(this._keyHandler(evt)===false){
        Event.stop(evt);
        return false;
      }

      superclass.onKeydownTrigger.apply(this, arguments);
    },

    onUneditableClick: function(evt) {
      var b = !this.selector.hidden;
      this.leaveFocusOff();
      if (!b && this.filterContent) {
        this.selectioner.filter(allMather);
      }
      this.showBox(!b);
    },

    leaveFocusOff: function() {
      if (this._leaveFocus !== false) this._leaveFocus = false;
    },

    leaveFocusOn: function() {
      if (this._leaveFocus !== true) this._leaveFocus = true;
    },
/**
 * @param {CC.ui.ContainerBase}
 */
    attach: function(selector, selectioner) {
      this.selector = selector;
      this.selectioner = selectioner;
      
      this.follow(selector);

      selector.display(false);

      //ie hack:
      if (selector.shadow)
        selector.shadow.setZ(999);

      selector.addClass(this.selectorCS);
      selectioner.on('selected', this.onSelected, this)
      selectioner.on('itemclick', this.onclickEvent, this);

      this._savSelKeyHdr = selector.defKeyNav;

      var self = this;

      selectioner.getSelectionProvider().defKeyNav = (function(ev) {
        self._keyHandler(ev, true);
      });
    },

    onBoxContexted: function(evt) {
    	//来自浏览器事件
      if(evt){
	      var el = Event.element(evt);
	      if (this.ancestorOf(el)) return false;
      }
      //标记为外部影应,失去焦点
      this.leaveFocusOn();
      this.showBox(false);
      this.leaveFocusOff();
      this.onBlurTrigger();
    },

    onclickEvent: function() {
      this.showBox(false);
    },
/**
 * 返回false表示不再发送该事件
 * @private
 */
    _keyHandler: function(ev, isSelectorEv) {
      var kc = ev.keyCode;
      if (kc == 27 || kc == 13) {
        if(!this.selector.hidden){
        	this.showBox(false);
        	Event.stop(ev);
          return false;
        }
      }

      //handle to selector.
      if (!isSelectorEv) {
        return this.selectioner.selectionProvider.navigateKey(ev);
      }
    },

    _filtHandler: function(ev) {
      var kc = ev.keyCode,
          sn = this.selectioner,
          p = sn.selectionProvider;
      if (kc === p.UP || kc === p.DOWN || this.noFilt || kc === 27 || kc === 13 || kc === 9) return;

      var v = this.editor.element.value;
      if (v == '') p.select(null);

      if (p.selected && kc != Event.LEFT && kc != Event.RIGHT)
         p.select(null);

      if (this.filterContent && v != this.preValue) {
        sn.filter(this.matcher, this);
        this.preValue = v;
      }
      this.leaveFocusOff();
      this.showBox(true);
    },

    showBox: function(b) {
      var st = this.selector, ds = !st.hidden;
      if (b.type) b = !ds;
      if (!b) {
        st.display(false);
        if (!this._leaveFocus) {
          if (!this.uneditable) this.editor.focus(true);
          else this.focus(true);
        }
        this.delClass(this.downCS);
        return;
      }

      this.preferPosition();
      if (st.shadow) st.shadow.reanchor();
      if (!this.uneditable) this.editor.focus(true);
      else this.focus(true);

      if (ds) return;
      this.checkSelected();
      this.addClass(this.downCS);
      st.bindContext(this.onBoxContexted, false, this).display(true);
    },

    active : function(){
      this.showBox(true);
    },
    
    deactive : function(){
    	this.showBox(false);
    },
    /**
     * 检查输入值是否为下拉选项中的某一项.
     * 如果有多个相同项,并且当前已选其中一项,忽略之,否则选中符合的首个选项.
     * @private
     */
    checkSelected: function() {
      var sn = this.selectioner,
          p  = sn.getSelectionProvider();

      var v = this.editor.element.value;

      if (!v && p.selected) {
        p.select(null);
        return;
      }

      if (p.selected && p.selected.title == v) return;

      p.select(null);

      sn.each(function(it) {
        if (!it.hidden && !it.disabled && it.title == this) {
          p.select(it);
          return false;
        }
      },
      v);
    },

   /**
   * 定位选择容器位置
   * @protected
   */
    preferPosition: function() {
      var s = this.selector;
      if (!this.noAutoWidth) s.setWidth(this.preferWidth());
      s.anchorPos(this, 'lb', 'hr', null, true, true);
    },

    /**
   * 返回最佳宽度,重写该函数自定下拉选择容器的宽度
   * 默认返回combox的宽度
   */
    preferWidth: function() {
      return this.getWidth();
    },

    _bindKey: function(event) {
      this.domEvent('keydown', this._keyHandler, false, null, this.editor.view);
      this.domEvent('keyup', this._filtHandler, false, null, this.editor.view);
    },

    onSelected: function(item) {
      this.setValueFromItem(item, true);
      if (!this.uneditable && this.focused) this.editor.focus(true);
    },
    
    getItemValue : function(item){
      return (item.getValue && item.getValue()) || (item.value !== undefined && item.value) || item.title;
    },
    
    getItemTitle : function(item){
      return item.title!==undefined?item.title : item.value;
    },
    /**
     * @param v 值
     * @param title 标题
     * @param innerUsed 内部使用
     * @override
     */
    setValue : function(v, inner){
      superclass.setValue.call(this, v);
      if (this.selector && !inner) {
        this.checkSelected();
      }
      return this;
    },
    
/**
 * @return {String}
 */
    getTitle : function(){
      return (this.title !== undefined && this.title) || this.editor.getValue();
    },
    
    setTitle : function(t){
      if(this.uneditable)
        this.uneditNode.innerHTML = t;
      else this.editor.setValue(t);
    },
    
    /**
     * @param innerUsed 内部使用
     * @override
     */
    setValueFromItem: function(item, inner) {
      var v = this.getItemValue(item), 
          t = this.getItemTitle(item);
      this.setValue(v, inner);
      this.setTitle(t);
      return this;
    },

    /**
     * 当前没选择,返回空或编辑框中的值.
     * @override
     */
    getValue: function() {
      if (!this.selectioner.selectionProvider.selected) {
        superclass.setValue.call(this, this.uneditable ? '': this.editor.getValue());
      }
      return superclass.getValue.call(this);
    },

  /**
   * 自定过滤重写该函数即可.
   */
    matcher: function(item) {
      var tle = this.getItemTitle(item);
      var v = this.editor.element.value;
      if (v == '') {
        item.setTitle(tle);
        return true;
      }

      if (tle.indexOf(v) >= 0) {
        //item.addClass('g-match');
        item.dom('_tle').innerHTML = tle.replace(v, '<span class="g-match">' + v + '</span>');
        return true;
      }
      item.setTitle(tle);
      return false;
    },
/***/
    select: function(id) {
      this.selectioner.selectionProvider.select(id);
    }
  };
});
CC.ui.def('combo', CC.ui.form.Combox);