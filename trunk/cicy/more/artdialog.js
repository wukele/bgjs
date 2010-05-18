/**
 * 本窗口采用artDialog的样式,http://www.planeart.cn/downs/artDialog/,感谢素材的原作者.
 */
(function(){

// load css resources
CC.loadCSS('http://www.planeart.cn/downs/artDialog/skin/default.css');


CC.loadStyle([
  // 自身的
  '.ui_ctx{position:relative;}.ui_title_icon,.ui_content,.ui_dialog_icon,.ui_btns span{display:inline-block;*zoom:1;*display:inline}.ui_dialog{text-align:left;position:absolute;top:0;_overflow:hidden}.ui_dialog table{border:0;margin:0;border-collapse:collapse}.ui_dialog td{padding:0}.ui_title_icon,.ui_dialog_icon{vertical-align:middle;_font-size:0}.ui_title_text{overflow:hidden;cursor:default}.ui_close{display:block;position:absolute;outline:none}.ui_content{margin:10px;}.ui_content.ui_iframe{margin:0;*padding:0;display:block;height:100%;position:relative}.ui_iframe iframe{width:100%;height:100%;border:none;overflow:auto}.ui_content_mask {visibility:hidden;width:100%;height:100%;position:absolute;top:0;left:0;background:#FFF;filter:alpha(opacity=0);opacity:0}.ui_bottom{position:relative}.ui_resize{position:absolute;right:0;bottom:0;z-index:1;cursor:nw-resize;_font-size:0}.ui_btns{text-align:right;white-space:nowrap}.ui_btns span{margin:5px 10px}.ui_btns button{cursor:pointer}* .ui_ie6_select_mask{width:99999em;height:99999em;position:absolute;top:0;left:0;z-index:-1}.ui_loading_tip{visibility:hidden;width:9em;height:1.2em;text-align:center;line-height:1.2em;position:absolute;top:50%;left:50%;margin:-0.6em 0 0 -4.5em}.ui_loading .ui_loading_tip,.ui_loading .ui_content_mask{visibility:visible}.ui_loading .ui_content_mask{filter:alpha(opacity=100);opacity:1}body:nth-of-type(1) .ui_loading .ui_iframe iframe{visibility:hidden}.ui_move .ui_title_text{cursor:move}.ui_move .ui_content_mask{visibility:visible}html>body .ui_fixed {position:fixed}* html .ui_fixed {fixed:true}* .ui_ie6_fixed{background:url(*) fixed}* .ui_ie6_fixed body{height:100%}* html .ui_fixed{width:100%;height:100%;position:absolute;left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth);top:expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight)}* .ui_page_lock select,* .ui_page_lock .ui_ie6_select_mask{visibility:hidden}.ui_overlay{visibility:hidden;position:fixed;top:0;left:0;width:100%;height:100%;filter:alpha(opacity=0);opacity:0;_overflow:hidden}.ui_lock .ui_overlay{visibility:visible}.ui_overlay div{height:100%}* html body{margin:0}@media all and (-webkit-min-device-pixel-ratio:10000),not all and (-webkit-min-device-pixel-ratio:0){.ui_content_wrap,.r0d0,.r0d2,.r2d2,.r2d0{display:block}}',
  // reset some style
  /**应用库自身的shaodw*/
  '.ui_focus .r2d1 { -moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}',
  '.ui_dialog  {border:none !important;}.ui_dialog_main{table-layout:fixed;}.ui_dialog .ui_ctx{overflow:hidden;}',
  '.ui_dialog .ui_boxinner {border:1px solid #000000 !important;}',
  // cursor
  '.ui_dialog #_xe{cursor:e-resize;}.ui_dialog #_xs{cursor:s-resize;}.ui_dialog #_xw{cursor:w-resize;}.ui_dialog #_xn{cursor:n-resize;}.ui_dialog #_xes{cursor:se-resize;}.ui_dialog #_xsw{cursor:sw-resize;}.ui_dialog #_xwn{cursor:nw-resize;}.ui_dialog #_xne{cursor:ne-resize;}'
].join(''), null, 'css_artdlg');

// 定义模板
CC.Tpl.def('CC.more.ArtWin',
'<div class="ui_dialog ui_focus">',
  '<table class="ui_boxinner"><tbody>',
    '<tr>',
      '<td class="ui_border r0d0" id="_xwn"></td>',
      '<td class="ui_border r0d1" id="_xn"></td>',
      '<td class="ui_border r0d2" id="_xne"></td>',
    '</tr>',
    '<tr>',
      '<td class="ui_border r1d0" id="_xw"></td>',
      '<td class="r1d1">',
        '<table class="ui_dialog_main"><tbody>',
          // titlebar template
          '<tr id="_tb"><td class="ui_title_wrap">',
                '<div class="ui_title" id="_tbct">',
                   '<div class="ui_title_text">',
                     '<span class="ui_title_icon"></span><span id="_tle">提示</span>',
                   '</div>',
                   '<a class="ui_close" id="_cls" href="javascript:fGo()" accesskey="c">×</a>',
                '</div>',
           '</td></tr>',
          //
          '<tr><td class="ui_content_wrap"><div id="_wrap" class="ui_ctx"></div></td></tr>',
         '</tbody></table>',
      '</td>',
      '<td class="ui_border r1d2" id="_xe"></td></tr>',
      // resizers
      '<tr><td class="ui_border r2d0" id="_xsw"></td><td class="ui_border r2d1" id="_xs"></td><td class="ui_border r2d2" id="_xes"></td>',
  '</tr></tbody></table></div>'
);

 CC.create('CC.more.ArtWin', CC.ui.Win, {
    shadow:{ctype:'shadow', inpactY:-4,inpactH:11, inpactX:-5, inpactW:11},
    titlebar:{
      view : '_tb',
      ct : '_tbct',
      clsBtn:{view:'_cls', cs:''}
    },
    minW : 190,
    minH : 53,
    getWrapperInsets : function(){
      return CC.borderBox?[43,10,9,10,52,20]:[43,8,9,8,52,16];
    },
    
    initComponent : function(){
      this.superclass.initComponent.call(this);
      // 容器隐藏时应用visibility:hidden
      // 主要用于修改拖动时隐藏内容区域
      this.wrapper.displayMode = 0;
    }
  });
 
 CC.ui.def('artwin', CC.more.ArtWin);
// //<tr><td class="ui_bottom_wrap"><div class="ui_bottom"><div class="ui_btns"></div></div></td></tr>
// CC.Tpl.def('CC.more.ArtDialog', '<table><tr><td class="ui_bottom_wrap"><div class="ui_bottom"><div class="ui_btns" id="_ct"></div></div></td></tr></table>');
// CC.create('CC.more.ArtDialog', CC.ui.ArtWin,CC.ui.Dialog.constructors, {
//   bottomHeight : 181,
//   bottomer :{
//     showTo:false,
//     itemCfg:{
//       template : '<span><button id="_tle"></button></span>'
//     },
//     createView : function(){
//       var nd = CC.Tpl.forNode(CC.Tpl['CC.more.ArtDialog']);
//       nd = nd.removeChild(nd.firstChild);
//       this.view = nd;
//     }
//   },
//   addBottomNode : function(bottom){
//     //this.wrapper.append(bottom);
//   }
// });
})();