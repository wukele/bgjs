//控件HTML模板
CTemplate['CCombox'] = '<div class="g-panel g-combo"><div class="g-panel-wrap g-combo-wrap" id="_wrap"><div class="unedit-txt" id="_uetxt" tabindex="1" hidefocus="on"></div><span class="downIco bgF1" id="_trigger"></span></div></div>';

/**
 * 继承CFormElement类
 */
CC.create('CCombox', CFormElement, function(superclass) {

  return {
    hoverCS: 'g-combo-on',
    uneditCS: 'g-combo-unedit',
    downCS: 'g-combo-dwn',
    
    initComponent: function() {
      var array = CC.delAttr(this, 'array');
      this.editor = new CText({name: this.name});
      this.element = this.editor.element;
      
      //调用父类初始化
      superclass.initComponent.call(this);

      this.uneditNode = this.dom('_uetxt');

      this.dom('_wrap').insertBefore(this.editor.view, null);

      var st = this.selector;
      if (!st) {
        st = this.selector = CUtil.createFolder({
          showTo: document.body,
          shadow: true
        });
        //hack:
        st.shadow.setZ(999);
        this.follow(st);
      }

      st.display(false);

      if (array) 
       st.fromArray(array);

      this.attach(st);
      this._bindKey();
      
   		if(this.uneditable){
   			delete this.uneditable;
   			this.setEditable(false);
   		}else
   			this.setEditable(true);

      if (this.selected) 
       st.select(selected);
    },

    disable: function(b) {
      superclass.disable.call(this, b);
      this.editor.disable(b);
    },

    setEditable: function(b) {
    	if(this.uneditable !== undefined && this.uneditable == b)
    		return this;
    	
    	if(this.uneditable && b){
    		this.delClass(this.uneditCS);
        this.unDomEvent('click', this.onUneditableClick);
        this.unDomEvent('keydown', this._keyHandler, this.uneditNode);
    	}else if(b){
    		this.domEvent('click', this.onUneditableClick, true, null, '_trigger');
    	}else {
        this.addClass(this.uneditCS);
        this.domEvent('click', this.onUneditableClick, false);
        this.domEvent('keydown', this._keyHandler, false, null, this.uneditNode);
        this.unDomEvent('click', this.onUneditableClick, '_trigger');        
      }
      
      this.uneditable = !b;
      return this;
    },

    onUneditableClick: function(evt) {
      var b = this.selector.display();
      this.showBox(!b);
    },

    attach: function(selector) {
      if (this.selector) this.detach();
      this.selector = selector;
      selector.addClass(this.selectorCS || 'g-combo-list');
      selector.on('selected', this.onSelected, this);
      selector.on('itemclick', this.onItemClick, this);
      this._savSelKeyHdr = selector._defKeyNav;
      var self = this;
      selector._defKeyNav = (function(ev) {
        self._keyHandler(ev, true);
      });
    },

    onBoxContexted: function(evt) {
      var el = Event.element(evt);
      if (this.ancestorOf(el)) return false;
      this.showBox(false, true);
    },

    onItemClick: function() {
      this.showBox(false);
    },

    detach: function() {
      var se = this.selector;
      this.selector = null;
      se.delClass(this.selectorCS || 'g-combo-list');
      se.un('selected', this.onSelected);
      se.un('itemclick', se.hide);
      se._defKeyNav = this._savSelKeyHdr;
      delete this._savSelKeyHdr;
    },

    _keyHandler: function(ev, isSelectorEv) {
      var kc = ev.keyCode;
      if (kc == 27 || kc == 13) {
        this.showBox(false);
        return;
      }
      //handle to selector.
      if (!isSelectorEv) {
        var s = this.selector;
        s.onKeyPressing(ev);
      }
    },

    _filtHandler: function(ev) {
      var kc = ev.keyCode;
      var s = this.selector;
      if (kc == s.KEY_UP || kc == s.KEY_DOWN || this.noFilt || kc == 27 || kc == 13) return;

      var v = this.editor.element.value;
      if (v == '') {
        s.select(null);
      }

      if (v != this.preValue) {
        s.filter(this.matcher, this);
        this.preValue = v;
      }

      this.showBox(true);
    },

    showBox: function(b, leaveFocus) {
      var s = this.selector;
      var ds = s.display();
      if (b.type) b = !ds;
      if (!b) {
        s.display(false);
        if(!leaveFocus){
        	if(!this.uneditable)
        		this.editor.focus(true);
        	else
        		this.uneditNode.focus(true);
        }
        this.delClass(this.downCS);
        return;
      }

      this.preferPosition();
      if (this.selector.shadow) 
      	this.selector.shadow.reanchor();
      if (!this.uneditable) 
      	this.editor.focus(true);
      else this.uneditNode.focus(true);
      
      if (ds) return;

      this.selector.fire('comboxshow', this);
      this._checkSelected();
      this.addClass(this.downCS);
      s.bindContext(this.onBoxContexted, false, this).display(true);
    },

    _checkSelected: function() {
      var s = this.selector;
      var v = this.editor.value;
      if (!s.selected) return;

      if (v) return;

      if (s.selected.title != v) {
        s.select(null);
        return;
      }

      s.each(function(it) {
        if (it.title == this) {
          it.parentContainer.select(it);
          return false;
        }
      },
      v);
    },

    /**
	 * 定位选择容器位置
	 */
    preferPosition: function() {
      var s = this.selector;
      var off = this.absoluteXY();
      s.setXY(off[0], off[1] + this.getHeight());
      if (!this.noAutoWidth) s.setWidth(this.getPreferWidth());
    },

    /**
	 * 返回最佳宽度,重写该函数自定下拉选择容器的宽度
	 * 默认返回combox的宽度
	 */
    getPreferWidth: function() {
      return this.getWidth();
    },

    _bindKey: function(event) {
      this.domEvent('keydown', this._keyHandler, false, null, this.editor.view);
      this.domEvent('keyup', this._filtHandler, false, null, this.editor.view);
    },

    onSelected: function(item) {
      this.editor.setValue(item.title);
      if (!this.uneditable) this.editor.focus(true);
      else this.uneditNode.innerHTML = item.title;
    },

    /**
	 * 自定过类重写该函数即可.
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

    select: function(id) {
      this.selector.select(id);
    }
  };
});
CFormElement['combo'] = CCombox;