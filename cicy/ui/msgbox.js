CC.Tpl.def('Util.alert.input', '<div class="msgbox-input"><table class="swTb"><tbody><tr><td valign="top"><b class="icoIfo" id="_ico"></b></td><td><span id="_msg" class="swTit"></span>&nbsp;<input type="text" style="" class="gIpt" id="_input"/><p class="swEroMsg"><span id="_err"></span></p></span></td></tr></tbody></table></div>');
CC.extendIf(CC.Util, (function(){
  /**
   * 根据对话框类型过滤按钮
   * 当前this为过滤字符串
   * @function
   * @private
   * @see CC.ui.ContainerBase#filter
   */
  function buttonMatcher(item){
    return this.indexOf(item.id)>=0;
  }

return /**@lends CC.Util*/{
  /**
   * 系统对话框引用,如果要获得系统对话框,请用Util.getSystemWin方法.
   * @see CC.Util#getSystemWin
   */
  _sysWin : null,
  /**
   * 返回系统全局唯一对话框.
   * 该对话框为系统消息窗口.
   * @function
   * @return {Dialog} 系统对话框
   */
  getSystemWin: function() {
    var w = this._sysWin;
    if (!w) {
      w = this._sysWin = new CC.ui.Dialog({
        id: 'sysWin',
        //@override 无状态控制
        setState: fGo,
        cs: 'sysWin bot',
        resizeable: false,
        width: 400,
        hidden: true,
        autoRender: true,
        keyEvent : true,
        showTo: document.body,
        //@override 不受窗口zIndex管理
        setZ: fGo,
        //对话框默认按钮
        buttons : [
          {title: '取&nbsp;消',     id :'cancel'},
          {title: '确&nbsp;定',     id :'ok'},
          {title: '&nbsp;否&nbsp;', id :'no'},
          {title: '&nbsp;是&nbsp;', id :'yes'},
          {title: '关&nbsp;闭',     id :'close'}
        ]
      });

      /**
       * 得到inputBox中input元素
       * @memberOf CC.Util._sysWin
       * @function
       * @return {Element} inputBox中input元素
       */
      w.getInputEl  = (function(){
        return this.wrapper.dom('_input');
      });
    }
    return w;
  },

  /**
   * 弹出对话框.
   * @function
   * @param {String} msg 消息
   * @param {String} 标题
   * @param {String} 显示按钮ID,用|号分隔,如ok|cancel|yes|no
   * @param {Function} callback 当对话框返回时回调
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @defButton {String} 聚焦按钮ID,默认为 'ok'
   */
  alert: function(msg, title, callback, buttons, modalParent, defButton) {
    title = title || '提示';
    var s = this.getSystemWin();
    s.setTitle(title)
     .setSize(400, 153)
     .wrapper.html('<div class="msgbox-dlg">' + (msg||'') + '</div>');

    if(!buttons){
      buttons = 'ok';
      defButton = 'ok';
    }

    s.bottomer.filter(buttonMatcher, buttons);

    if(defButton)
      s.defaultButton = defButton;
    s.fastStyleSet('visibility', 'hidden');
    s.show(modalParent||document.body, true, callback);
    (function(){
      s.autoHeight().center(modalParent);
      s.fastStyleSet('visibility', '');
    }).timeout(0);
  },

  /**
   * 弹出输入对话框.
   * @function
   * @param {String} msg 消息
   * @param {String} 标题
   * @param {String} 显示按钮ID,用|号分隔,如ok|cancel|yes|no,默认为ok|cancel
   * @param {Function} callback 当对话框返回时回调
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @defButton {String} 聚焦按钮ID,默认为 'ok'
   */
  inputBox: function(msg, title, callback, buttons, modalParent, defButton) {
    title = title || '提示';
    var s = this.getSystemWin();
    s.setTitle(title)
     .setSize(400, 175)
     .wrapper.html(CC.Tpl['Util.alert.input'])
     .dom('_msg').innerHTML = msg;

    var ipt = s.wrapper.dom('_input');

    if(!buttons){
      buttons = 'ok|cancel';
      defButton = 'ok';
    }

    s.bottomer.filter(buttonMatcher, buttons);

    if(defButton)
      s.defaultButton = defButton;

    s.show(modalParent||document.body, true, callback);
    (function(){
      s.getInputEl().focus();}
    ).timeout(80);
  }
};
})());