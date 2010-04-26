CC.Tpl['CC.ui.BarItem'] = '<table class="g-baritem" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="g-btn-l"><i>&nbsp;</i></td><td class="g-btn-c"><em unselectable="on"><button type="button" class="g-btn-text" id="_tle"></button></em></td><td class="g-btn-r"><i>&nbsp;</i></td></tr></tbody></table>';
CC.Tpl['CC.ui.Toolbar'] = '<div class="g-tbar"><div class="g-tbar-wr" id="_wrap"></div></div>';



/**
 * 工具栏,32*32图标大小
 * @class CC.ui.Bigbar
 * @extends CC.ui.Panel
 */

CC.create('CC.ui.Bigbar', CC.ui.Panel,  /**@lends CC.ui.Bigbar#*/{

   keyEvent:false,

   clickEvent:true,

   syncWrapper : false,
   
   itemCfg : {

    template : 'CC.ui.BarItem',

    hoverCS:'g-baritem-over',
    downCS : 'g-baritem-dwn',
    innerCS : 'g-baritem',

    clickCS:'g-baritem-click',

    focusCS:false,

    title:false
   },

   selectionProvider : {
    autoscroll:false,
    forceSelect:true
   },

   maxH : 38,

   innerCS : 'g-bigbar',

   itemCls : CC.ui.Button,

   template : 'CC.ui.Toolbar'
});

CC.ui.def('bigbar', CC.ui.Bigbar);

CC.create('CC.ui.BigbarDropButton', CC.ui.DropButton, {

    template : 'CC.ui.BarItem',

    hoverCS:'g-baritem-over',
    downCS : 'g-baritem-dwn',
    innerCS : 'g-baritem',

    clickCS:'g-baritem-click',

    focusCS:false,

    title:false
});

CC.ui.def('bigbardropbtn', CC.ui.BigbarDropButton);
/**
 * 小型工具栏,16*16图标大小
 * @name CC.ui.Smallbar
 * @class
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.Smallbar', CC.ui.Panel, /**@lends CC.ui.Smallbar#*/{

   syncWrapper : false,

   selectionProvider : {
    autoscroll:false,
    forceSelect:true
   },

   clickEvent:true,

   itemCfg : {

    template : 'CC.ui.BarItem',

    hoverCS: 'g-smallbar-item-over',

    downCS : 'g-smallbar-item-dwn',

    clickCS:'g-smallbar-item-click',

    innerCS:'g-smallbar-item',

    focusCS:false
   },

   maxH : 26,

   innerCS:'g-smallbar',

   itemCls : CC.ui.Button,

   template : 'CC.ui.Toolbar'
});

CC.ui.def('smallbar', CC.ui.Smallbar);

CC.create('CC.ui.SmallbarDropButton', CC.ui.DropButton, {
    template : 'CC.ui.BarItem',

    hoverCS: 'g-smallbar-item-over',

    downCS : 'g-smallbar-item-dwn',

    clickCS:'g-smallbar-item-click',

    innerCS:'g-smallbar-item',

    focusCS:false
});
CC.ui.def('smallbardropbtn', CC.ui.SmallbarDropButton);