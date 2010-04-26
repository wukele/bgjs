/**
 * @class
 * @name CC.ui.TitlePanel
 * @extends CC.ui.Panel
 */
CC.Tpl.def('CC.ui.TitlePanel', '<div class="g-panel g-titlepanel"><h3 class="g-titlepanel-hd" id="_tleBar"><a id="_btnFN" class="g-icoFld" href="javascript:fGo()"></a><a id="_tle" class="g-tle" href="javascript:fGo()"></a></h3><div id="_scrollor" class="g-panel-wrap g-titlepanel-wrap"></div></div>');

CC.create('CC.ui.TitlePanel', CC.ui.Panel, function(superclass){
    return /**@lends CC.ui.TitlePanel#*/{

        unselectable : '_tleBar',

        ct:'_scrollor',

        minH : 29,

/**foldNode展开时样式*/
        openCS : 'g-icoOpn',

/**foldNode折叠时样式*/
        clsCS  : 'g-icoFld',

        foldNode : '_btnFN',

        initComponent: function() {
            superclass.initComponent.call(this);

            //evName, handler, cancel, caller, childId
            this.domEvent('mousedown', this.onTriggerClick, true, null, this.foldNode)
                .domEvent('mousedown', this.onTitleClick,  true, null, this.titleNode || '_tle');
            //_tleBar
            this.header = this.$$('_tleBar');

            if(this.collapsed)
              this.collapse(this.collapsed, true);
        },

        getWrapperInsets : function(){
          return [29 , 0, 0, 0, 29, 0];
        },

/**点击收缩图标时触发,可重写自定*/
        onTriggerClick: function() {
            var v = !this.wrapper.hidden;
            this.collapse(v, true);
        },
/**
 * 标题点击时触发,默认执行缩放面板
 */
        onTitleClick : function(){
          this.onTriggerClick();
        },
/**
 * 收缩/展开内容面板
 * @param {Boolean} collapsed
 * @param {Boolean} notifyParentLayout 是否通知父容器的布局管理器,如果布局管理器存在collapse方法，调用该方法折叠控件，否则直接调用doLayout布局.
 */
        collapse : function(b, layout) {
            this.attr(this.foldNode, 'className', b ? this.openCS : this.clsCS);
            this.wrapper.display(!b);
            this.collapsed = b;
            this.fire('collapsed',b);

            if(layout && this.pCt){
              if(this.pCt.layout.collapse)
                this.pCt.layout.collapse(this, b);
              else this.pCt.layout.doLayout();
            }
            return this;
        }
    }
});

CC.ui.def('titlepanel', CC.ui.TitlePanel);