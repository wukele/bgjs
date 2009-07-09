CUtil.getMasker = (function() {
  var disp = function(b) {
    if (b !== undefined) {
      CBase.prototype.display.call(this, b);
      var f = CC.fly(this.target);
      f.setStyle('position', b?'relative':'').unfly();
      return this;
    }
    return CBase.prototype.display.call(this, b);
  }

  return (function(target, owener, options) {
    options = CC.extendIf(options, {
      inherentCS: 'g-modal-mask',
      view: CC.$C('div'),
      display: disp
    });
    var masker = CBase.create(options), f = CC.fly(owener);
    masker.setZ(f.getStyle('z-index') - 1);
    f.unfly();
    CC.fly(target).append(masker).unfly();
    masker.target = target;
    return masker;
  });
})();

CTemplate['CBottomWin.Bottom'] = '<div class="g-win-bottom"></div>';
CC.create('CBottomWin', CWin, {
  bottomHeight: 51,
  initComponent: function() {
    this.createView();
    this.createBottom();
    CWin.prototype.initComponent.call(this);
    if (this.modal) {
      var m = this.masker = CUtil.getMasker(document.body, this);
      this.follow(m);
    }
  },

  display: function(b) {
    if (b !== undefined && this.masker) this.masker.display(b);
    return CWin.prototype.display.call(this, b);
  },

  createBottom: function() {
    var b = this.bottom = CTemplate.$('CBottomWin.Bottom');
    this.bottomer = new CContainerBase({
      view: b
    });
    this.append(b);
    this.follow(this.bottomer);
  },

  getWrapperInsets: function() {
    var s = CWin.prototype.getWrapperInsets.call(this);
    s[2] += this.bottomHeight - 1;
    s[4] += this.bottomHeight - 1;
    return s;
  }
});

CTemplate['CUtil.alert'] = '<div id="_bot" class="bot"><input type="button" onmouseout="this.className=\'btnFnt\'" onmouseover="this.className=\'btnFnt btnFntOn\'" onclick="_sysWin.display(false);" class="btnFnt" value="取 消" id="_cancel"/><input type="button" onmouseout="this.className=\'btnFnt\'" onmouseover="this.className=\'btnFnt btnFntOn\'" class="btnFnt" value="确 定" id="_ok"/></div>';
CTemplate['CUtil.alert.input'] = '<div class="msgbox-input"><table class="swTb"><tbody><tr><td valign="top"><b class="icoIfo" id="_ico"></b></td><td><span id="_msg" class="swTit"></span>&nbsp;<input type="text" style="" class="gIpt" id="_input"/><p class="swEroMsg"><span id="_err"></span></p></span></td></tr></tbody></table></div>';
CC.extendIf(CUtil, {
  _sysWin: function() {
    var w = window._sysWin;
    if (!w) {
      w = window._sysWin = new CBottomWin({
        id: 'sysWin',
        //模式
        modal: true,
        //无状态控制
        setState: fGo,
        cs: 'sysWin',
        resizeable: false,
        width: 400,
        hidden: true,
        autoRender: true,
        showTo: document.body,
        //不受窗口zIndex管理
        setZ: fGo,
        center : function(){
          var vp = CC.getViewport();
  				this.setXY(((vp.width - this.width) / 2) | 0, (((vp.height - this.height) / 2) | 0) - 130);
  				return this;
        }
      });
      w.fly(w.bottom).html(CTemplate['CUtil.alert']).unfly();
    }
    return w;
  },

  _onSysWinClose: function() {
    _sysWin.close();
  },

  alert: function(msg, title) {
    title = title || '提示';
    var s = this._sysWin();
    s.setTitle(title).setSize(400, 153);
    var f = s.fly(s.bottom);
    s.wrapper.html('<div class="msgbox-dlg">' + msg + '</div>');
    var ok = f.dom('_ok');
    var cel = f.dom('_cancel');

    CC.display(ok, true);
    CC.display(cel, false);
    ok.onclick = this._onSysWinClose;
    f.unfly();
    s.display(true).center();;
    setTimeout(function() {
      s.dom('_ok').focus();
    },
    0);
  },

  inputBox: function(msg, title, callback) {
    title = title || '提示';
    var s = this._sysWin();
    s.setTitle(title).setSize(400, 175);
    s.wrapper.html(CTemplate['CUtil.alert.input']);
    var f = CC.fly(s.bottom);
    var cel = f.dom('_cancel');
    var ok = f.dom('_ok');
    var ipt = s.wrapper.dom('_input');
    ok.onclick = (function() {
      if (!callback) s.close();
      else if (callback(CC.$('_input', s.container).value) !== false) {
        s.close();
      }
    });

    cel.onclick = (function() {
      s.close();
    });

    ipt.onkeydown = (function(evt) {
      evt = evt || window.event;
      if (Event.isEnterKey(evt)) {
        ok.onclick(evt);
      }
    });

    CC.display(ok, true);
    CC.display(cel, true);

    s.wrapper.dom('_msg').innerHTML = msg;
    f.unfly();
    s.display(true).center();;
    s.wrapper.dom('_input').focus();
  }
});