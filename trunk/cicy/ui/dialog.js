CC.Tpl.def('CC.ui.Dialog.Bottom', '<div class="g-win-bottom"><div class="bottom-wrap"></div></div>');
/**
 * @class CC.ui.Dialog
 * 对话框是一个特殊的窗体，底部具有按钮栏，并且可指定是否模式，即是否有掩层。
 * @extends CC.ui.Win
 <pre><code>
 // 
 </code></pre>
 */
 
/**
 * @bottomer {CC.ui.ContainerBase} 底部面板，设置为false时可取消生成底部面板。
 */
CC.create('CC.ui.Dialog', CC.ui.Win, function(superclass){
  var CC = window.CC;
  var Event = CC.Event;
  
  // 当前正在打开的对话框,方便从子frame窗口中关闭父层对话框.
  var Openning;
  
/**
 * 获得最近打开的对话框,方便从子iframe页面中关闭父页面的对话框.
 * @static
 * @return {CC.ui.Dialog}
 */
CC.ui.Dialog.getOpenning = function(){
	return CC.Base.byCid(Openning);
};

CC.ui.def('dlg', CC.ui.Dialog);

  return {
    /**
     * 内部高度，与CSS一致
     * @private
     */
    bottomHeight: 51,
    /**
     * 返回状态值, 可自定,如ok,cancel...,当对话框某个按钮点击并可返回时,返回值为该按钮ID.
     * @type String|Boolean
     */
    returnCode : false,

    /**
     * @cfg {String} defaultButton 设置默认按钮,该按钮必须在当前按钮列表中
     */
    defaultButton : false,

    initComponent: function(){
      this.createView();

      this.keyEventNode = this.view;

      //no bottom
      if(this.bottomer === false){
        this.bottomHeight = 0;
      }else this.createBottom();

      superclass.initComponent.call(this);

      if (this.buttons && this.bottomer !== false) {
        this.bottomer.fromArray(this.buttons);
        delete this.buttons;
      }

      if(this.keyEvent)
        this.on('keydown', this.onKeydownEvent, null, true);
    },

    /**
     * 如果按钮的returnCode = false, 取消返回.
     * @private
     * @param {CC.Base} item
     */
    onBottomItemSelected : function(item){
      if(item.returnCode !== false && item.id){
        this.pCt.returnCode = item.id;
        var callFn = this.pCt['on'+item.id];
        // call the callback
        if(!callFn || callFn.call(this.pCt, item) !== false){
        	this.pCt.close();
        }
      }
    },

    /**
     * 监听对话框键盘事件
     * 如果为回车,调用onOk,如果为ESC,调用onCancel
     * @private
     * @param {Event} evt
     */
    onKeydownEvent : function(evt){
      var c = evt.keyCode;
      if (Event.ESC == c) {
        this.onCancel();
      }else if(Event.isEnterKey(evt)){
        this.onOk();
      }
    },

    /**
     * 触发选择默认按钮.
     */
    onOk : function(){
       if(this.bottomer && this.defaultButton){
        this.bottomer.selectionProvider.select(this.defaultButton, true);
       }
    },

    /**
     * @private
     * @override
     */
    onClsBtnClick : function(){
      this.pCt.pCt.returnCode = false;
      superclass.onClsBtnClick.apply(this, arguments);
    },

    /**
     * 对话框以false状态返回.
     */
    onCancel : function(){
      this.returnCode = false;
      this.close();
    },
/**
 * 显示对话框.
 * @param {CC.Base} parent 应用模式掩层的控件,为空时应用到document.body中.
 * @param {Boolean} modal 是否为模态显示.
 * @param {Function} callback 关闭前回调.
 */
    show: function(parent, modal, callback){
      this.modal = modal;
      this.modalParent = parent;
      this.modalCallback = callback;
      return superclass.show.call(this);
    },

    trackZIndex : function(){
      superclass.trackZIndex.call(this);
      if(this.masker){
       this.masker.setZ(this.getZ() - 2);
      }
    },

    onShow : function(){
      superclass.onShow.call(this);
      if (this.modal) {
        var m = this.masker;
        if (!m)
          m = this.masker = new CC.ui.Mask();
        if (!m.target)
          m.attach(this.modalParent || CC.$body);
      }
      this.center(this.modalParent);
      this.trackZIndex.bind(this).timeout(0);
      this.focusDefButton();
      
      // 记录当前打开的对话框
      Openning = this.cacheId;
    },

    onHide : function(){
      if (this.modal) {
        if(this.modalCallback && this.modalCallback(this.returnCode) === false){
           return this;
        }

        this.masker.detach();
        delete this.modal;
        delete this.modalParent;
        delete this.modalCallback;
      }
      superclass.onHide.call(this);
    },

/**
 * 聚焦到默认按钮上
 */
    focusDefButton : function(){
      if(this.bottomer){
        var def = this.bottomer.$(this.defaultButton);
        if(def)
          def.focus(22);
      }
    },

    /**
     * @private
     */
    createBottom: function(){
      var b = this.bottomer = CC.ui.instance(
       CC.extendIf(this.bottomer, {
        ctype:'ct',
        pCt:this,
        itemCls: CC.ui.Button,
        template:'CC.ui.Dialog.Bottom',
        ct : '_wrap',
        clickEvent : 'click',
        keyEvent : true,
        selectionProvider:{forceSelect:true}
       }
      ));

      this.follow(b);
      //监听按钮点击
      b.on('selected', this.onBottomItemSelected);
      this.addBottomNode(b);
    },
    
    addBottomNode : function(bottom){
      this.view.appendChild(bottom.view);
    },
    
    getWrapperInsets: function(){
      var s = this.superclass.getWrapperInsets.call(this),
          h = this.bottomHeight - 1;
      s[2] += h;
      s[4] += h;
      return s;
    }
  };
  
});
