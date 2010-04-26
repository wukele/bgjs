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

    initComponent: function() {

      //�������selectorѡ�������
      var array = CC.delAttr(this, 'array');

      //�༭��
      this.editor = new CC.ui.form.Text({
        name: this.name
      });

      //�����ʼ��
      superclass.initComponent.call(this);

      //���ɱ༭ʱ��ʾ������
      this.uneditNode = this.dom('_uetxt');

      //����༭��
      this.dom('_wrap').insertBefore(this.editor.view, null);

      //����������
      var st = this.selector;

      //Ĭ�ϵ�������ΪFolder�ؼ�
      if (!st) {
        st = this.selector = new CC.ui.Folder({
          showTo: document.body,
          shadow: true
        });
        //bind scrolor
        st.scrollor = st.dom('_scrollor');
      }else {
        st = CC.ui.instance(st);
      }

      if (array) st.fromArray(array);

      this.attach(st);
      this._bindKey();

      if (this.uneditable) {
        delete this.uneditable;
        this.setEditable(false);
      } else this.setEditable(true);

      if (this.selected) st.select(selected);

      //
      // ����Combox�ɶ���ؼ�ƴװ����, Ϊ������ȷ����Combox�ؼ���blur, focus�¼�,
      // ���ò�����������¼�,����һ�����⴦��.
      //
      this.domEvent('focus', this.onFocusTrigger);
      this.domEvent('blur', this.onBodyBlurTrigger);
      this.domEvent('focus', this.onFocusTrigger, false, null, this.editor.element);
      this.domEvent('blur', this.onBodyBlurTrigger, false, null, this.editor.element);
      this.domEvent('keydown', this.onKeydownTrigger);
      this.wheelEvent(this.onMouseWheel, true);
      //������ʧʱ�������ֵ�Ƿ����������ĳһ��,�����,ѡ��֮.
      this.on('blur', this.checkSelected);
    },
    
    onHide : function(){
    	if(!this.selector.hidden)
    		this.selector.hide();
    	superclass.onHide.apply(this, arguments);
    },
    
    onMouseWheel : function(e){
      var dt = CC.Event.getWheel(e);
      if( dt>0 ){
        this.selector.selectionProvider.pre();
      }else if( dt<0 ){
        this.selector.selectionProvider.next();
      }
    },

    /**
     * @private
     * combox ����ʧ��ʱ����
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
      if (!b) {
        this.selector.filter(allMather);
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
    attach: function(selector) {
      this.selector = selector;

      //selector �� ������������
      this.follow(selector);

      selector.display(false);

      //ie hack:
      if (selector.shadow)
        selector.shadow.setZ(999);

      selector.addClass(this.selectorCS)
              .on('selected', this.onSelected, this)
              .on('itemclick', this.onclickEvent, this);

      this._savSelKeyHdr = selector.defKeyNav;

      var self = this;

      selector.selectionProvider.defKeyNav = (function(ev) {
        self._keyHandler(ev, true);
      });
    },

    onBoxContexted: function(evt) {
    	//����������¼�
      if(evt){
	      var el = Event.element(evt);
	      if (this.ancestorOf(el)) return false;
      }
      //���Ϊ�ⲿӰӦ,ʧȥ����
      this.leaveFocusOn();
      this.showBox(false);
      this.leaveFocusOff();
      this.onBlurTrigger();
    },

    onclickEvent: function() {
      this.showBox(false);
    },
/**
 * ����false��ʾ���ٷ��͸��¼�
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
        var s = this.selector;
        return s.selectionProvider.navigateKey(ev);
      }
    },

    _filtHandler: function(ev) {
      var kc = ev.keyCode,
          s = this.selector,
          p = s.selectionProvider;
      if (kc === p.UP || kc === p.DOWN || this.noFilt || kc === 27 || kc === 13 || kc === 9) return;

      var v = this.editor.element.value;
      if (v == '') p.select(null);

      if (p.selected && kc != Event.LEFT && kc != Event.RIGHT) p.select(null);

      if (v != this.preValue) {
        s.filter(this.matcher, this);
        this.preValue = v;
      }
      this.leaveFocusOff();
      this.showBox(true);
    },

    showBox: function(b) {
      var s = this.selector;
      var ds = !s.hidden;
      if (b.type) b = !ds;
      if (!b) {
        s.display(false);
        if (!this._leaveFocus) {
          if (!this.uneditable) this.editor.focus(true);
          else this.focus(true);
        }
        this.delClass(this.downCS);
        return;
      }

      this.preferPosition();
      if (this.selector.shadow) this.selector.shadow.reanchor();
      if (!this.uneditable) this.editor.focus(true);
      else this.focus(true);

      if (ds) return;
      this.checkSelected();
      this.addClass(this.downCS);
      s.bindContext(this.onBoxContexted, false, this).display(true);
    },

    active : function(){
      this.showBox(true);
    },
    deactive : function(){
    	this.showBox(false);
    },
    /**
     * �������ֵ�Ƿ�Ϊ����ѡ���е�ĳһ��.
     * ����ж����ͬ��,���ҵ�ǰ��ѡ����һ��,����֮,����ѡ�з��ϵ��׸�ѡ��.
     * @private
     */
    checkSelected: function() {
      var s = this.selector,
          p = s.getSelectionProvider();

      var v = this.editor.element.value;

      if (!v && p.selected) {
        p.select(null);
        return;
      }

      if (p.selected && p.selected.title == v) return;

      p.select(null);

      s.each(function(it) {
        if (!it.hidden && !it.disabled && it.title == this) {
          p.select(it);
          return false;
        }
      },
      v);
    },

   /**
   * ��λѡ������λ��
   * @protected
   */
    preferPosition: function() {
      var s = this.selector;
      if (!this.noAutoWidth) s.setWidth(this.preferWidth());
      s.anchorPos(this, 'lb', 'hr', null, true, true);
    },

    /**
   * ������ѿ��,��д�ú����Զ�����ѡ�������Ŀ��
   * Ĭ�Ϸ���combox�Ŀ��
   */
    preferWidth: function() {
      return this.getWidth();
    },

    _bindKey: function(event) {
      this.domEvent('keydown', this._keyHandler, false, null, this.editor.view);
      this.domEvent('keyup', this._filtHandler, false, null, this.editor.view);
    },

    onSelected: function(item) {
      this.editor.setValue(item.title);
      this.setValue(item.value, item.title, true);
      if (!this.uneditable && this.focused) this.editor.focus(true);
      else this.uneditNode.innerHTML = item.title;
    },

    /**
     * @param v ֵ
     * @param title ����
     * @param innerUsed �ڲ�ʹ��
     * @override
     */
    setValue: function(v, title, innerUsed) {
      superclass.setValue.call(this, v || title);
      this.editor.setValue(title || v);

      if (innerUsed !== true && this.selector) {
        this.checkSelected();
      }
      return this;
    },

    /**
     * ��ǰûѡ��,���ؿջ�༭���е�ֵ.
     * @override
     */
    getValue: function() {
      if (!this.selector.selected) {
        superclass.setValue.call(this, this.uneditable ? '': this.editor.getValue());
      }
      return superclass.getValue.call(this);
    },

  /**
   * �Զ�������д�ú�������.
   */
    matcher: function(item) {
      var tle = item.title;
      var v = this.editor.element.value;
      if (v == '') {
        item.setTitle(item.title);
        return true;
      }

      if (tle.indexOf(v) >= 0) {
        //item.addClass('g-match');
        item.dom('_tle').innerHTML = tle.replace(v, '<span class="g-match">' + v + '</span>');
        return true;
      }
      item.setTitle(item.title);
      return false;
    },
/***/
    select: function(id) {
      this.selector.select(id);
    }
  };
});
CC.ui.def('combo', CC.ui.form.Combox);