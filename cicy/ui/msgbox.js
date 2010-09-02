CC.Tpl.def('Util.alert.input', '<div class="msgbox-input"><table class="swTb"><tbody><tr><td valign="top"><b class="icoIfo" id="_ico"></b></td><td><span id="_msg" class="swTit"></span>&nbsp;<input type="text" style="" class="gIpt" id="_input"/><p class="swEroMsg"><span id="_err"></span></p></span></td></tr></tbody></table></div>');
CC.extendIf(CC.Util, (function(){
  /**
   * 根据对话框类型过滤按钮
   * 当前this为过滤字符串
   * @private
   * @see CC.ui.ContainerBase#filter
   */
  function buttonMatcher(item){
    return this.indexOf(item.id)>=0;
  }
/**
 * @class CC.Util
 <pre><code>
function allButtons(){
	CC.Util.alert('选择任意按钮','按钮标题',(function(){
		alert('你点击了'+this.returnCode);
	}),'ok|cancel|yes|no|close');
}

//
// 回调函数返回false时不关闭
// 实现自定关闭
//
function callbackReturnFalse(){
	CC.Util.alert('点击时并不会关闭', '', function(){
		CC.Util.ftip("未得到肯定我是不会关闭的!","说明", this);
		return false;
	});
}
//
// alert回调时有alert
//
function alertInAlert(){
	CC.Util.alert('按钮被点击了','按钮标题',(function(){
		CC.Util.alert.bind(CC.Util, this.returnCode).timeout(0);
	}),'ok|cancel|yes|no|close');
}

//
// 显示长篇消息时自动适应高度
//
function longText(){
	CC.Util.alert("    1. 看一本权威的书, 推荐《JavaScript权威指南》(非广告-_-!!)<br><br>    2. 给自己选一个实践的目标,如利用JS做一个UI,或实现某一效果,或做一个小游戏<br><br>    3. 遇到问题先查查资料书,再g.cn,不行再google.com,最后才是问人<br><br>    4. 多看看同行的BLOG,里面有不少经验分享<br><br>    5. 学会调试，推荐Firefox的firebug插件<br><br>    5. 平时勤于独立思考,试试用不同方式模式实现同一效果", "学习JavaScript建议");
}
 </code></pre>

 */
return {
  /**
   * 系统对话框引用,如果要获得系统对话框,请用Util.getSystemWin方法.
   * @private
   */
  _sysWin : null,
  /**
   * 返回系统全局唯一对话框.
   * 该对话框为系统消息窗口.
   * @return {Dialog} 系统对话框
   * @member CC.Util
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
       * 得到inputBox中input元素, getSystemWin().getInputEl()
       * @private
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
   * @param {String} msg 消息
   * @param {String} title 标题
   * @param {Function} callback 当对话框返回时回调
   * @param {String} buttons 显示按钮ID,用|号分隔,如ok|cancel|yes|no
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @param {String} defButton 聚焦按钮ID,默认为 'ok'
   * @member CC.Util
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
   * 可通过{@link #getSystemWin}().getInputEl()获得输入的input元素.
   * @param {String} msg 消息
   * @param {String} title 标题
   * @param {Function} callback 当对话框返回时回调
   * @param {String} buttons 显示按钮ID,用|号分隔,如ok|cancel|yes|no,默认为ok|cancel
   * @param {Win} modalParent 父窗口,默认为document.body层
   * @param {String} defButton 聚焦按钮ID,默认为 'ok'
   * @member CC.Util
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