/**
 * Javascript Utility for web development.
 * 反馈 : www.cicyui.com/forum
 * @mailto javeejy@126.com
 * www.cicyui.com ? 2010 - 构建自由的WEB应用
 */

// Base on 
/*
 * artDialog v2.1.0
 * Date: 2010-05-18
 * http://code.google.com/p/artdialog/
 * (c) 2009-2010 tangbin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://creativecommons.org/licenses/LGPL/2.1/
 */

/**
 * 感谢http://www.planeart.cn/downs/artDialog/.
 */
(function(){

// load css resources
//CC.loadCSS('http://www.planeart.cn/downs/artDialog/skin/default.css');


CC.loadStyle([
  // default
  '.ui_dialog{border:1px solid #000!important;_border:none!important;}.ui_title_wrap, .ui_bottom{font-family:\'\u5FAE\u8F6F\u96C5\u9ED1\', \'Arial\';}.ui_border{background-color:#000;filter:alpha(opacity=30);opacity:0.3;}.ui_focus .ui_border{filter:alpha(opacity=50);opacity:0.5;}.ui_move .ui_border{filter:alpha(opacity=60);opacity:0.6;}.r0d0, .r0d2, .r2d0, .r2d2{width:8px;height:8px;}.ui_overlay div{background:#000;filter:alpha(opacity=70);opacity:0.7;}.ui_dialog_main{border:1px solid #000!important;}.ui_focus .ui_dialog_main{-moz-box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);-webkit-box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);box-shadow: 0 0 3px rgba(0, 0, 0, 0.7);}.ui_focus .r2d1{-moz-box-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);-webkit-box-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);box-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);}.ui_move .r2d1{-moz-box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);-webkit-box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);}.ui_dialog_main{background-color:#FFF;}.ui_content_wrap{min-width:15em;_width:15em;}.ui_btns{background-color:#F6F6F6;border-top:1px solid #EBEBEB;border-bottom:1px solid #CCC;-moz-box-shadow: inset 0 -2px 2px rgba(204, 204, 204, 0.3);-webkit-box-shadow: inset 0 -2px 2px rgba(204, 204, 204, 0.3);box-shadow: inset 0 -2px 2px rgba(204, 204, 204, 0.3);}.ui_btns button{padding:2px 4px;letter-spacing:2px;}.ui_title{position:relative;height:100%;border-bottom:2px solid #EBEBEB;}.ui_title_text{height:30px;line-height:30px;padding:0 30px 0 10px;background-color:#3A6EA5;font-weight:700;color:#EBEBEB;border:1px solid #4E84C0;border-bottom-color:#0D1D3C;text-shadow:0 1px 0 #000;-moz-box-shadow: inset 0 -2px 2px rgba(0, 0, 0, 0.2);-webkit-box-shadow: inset 0 -2px 2px rgba(0, 0, 0, 0.2);box-shadow: inset 0 -2px 2px rgba(0, 0, 0, 0.2);}.ui_move .ui_title_text{color:#FFF;}.ui_focus .ui_title_text{background-color:#214FA3;}.ui_close{padding:0;top:5px;right:5px;width:13px;height:13px;line-height:13px;text-align:center;color:#FFF!important;text-decoration:none;border:1px solid #3A6EA5;}.ui_focus .ui_close{border:1px solid #214FA3;}.ui_close:hover{text-decoration:none;background-color:#771C35;border:1px solid #000;cursor:default;}.ui_close:active{background-color:#A80000;}.ui_resize{width:8px;height:8px;}.ui_loading_tip{font-size:9px;color:#808080;}.noBorder .ui_border{display:none;}.noBorder .ui_btns{border:none 0;}.noBorder .ui_dialog_main{border:1px solid #183A7A;}.noTitleBar .ui_title_wrap{height:0;_display:none;visibility:hidden;}.noTitle .ui_title_text{visibility:hidden;height:15px;overflow:hidden;}.noTitle .ui_close{top:1px;right:1px;color:#CCC;border-color:#FFF;}.noTitle .ui_close:hover{background:#FFF;color:#F00;}.noTitle .ui_content{margin-top:0;}.noClose .ui_close{display:none;}.noSkin .ui_border, .noSkin .ui_title_wrap, .noSkin .ui_dialog_icon{display:none;}.noSkin .ui_bottom_wrap{display:none;*display:block;*height:0;overflow:hidden;}* html .noSkin .ui_btns{height:0;overflow:hidden;position:absolute;left:-99999em;}.noSkin .ui_content{margin:0;}.noSkin .ui_dialog_main{background:transparent;border:none 0!important;}.noSkin .ui_content_wrap{min-width:inherit;_width:auto;}',
  // 自身的
  '.ui_ctx{position:relative;}.ui_title_icon,.ui_content,.ui_dialog_icon,.ui_btns span{display:inline-block;*zoom:1;*display:inline}.ui_dialog{text-align:left;position:absolute;top:0;_overflow:hidden}.ui_dialog table{border:0;margin:0;border-collapse:collapse}.ui_dialog td{padding:0}.ui_title_icon,.ui_dialog_icon{vertical-align:middle;_font-size:0}.ui_title_text{overflow:hidden;cursor:default}.ui_close{display:block;position:absolute;outline:none}.ui_content{margin:10px;}.ui_content.ui_iframe{margin:0;*padding:0;display:block;height:100%;position:relative}.ui_iframe iframe{width:100%;height:100%;border:none;overflow:auto}.ui_content_mask {visibility:hidden;width:100%;height:100%;position:absolute;top:0;left:0;background:#FFF;filter:alpha(opacity=0);opacity:0}.ui_bottom{position:relative}.ui_resize{position:absolute;right:0;bottom:0;z-index:1;cursor:nw-resize;_font-size:0}.ui_btns{text-align:right;white-space:nowrap}.ui_btns span{margin:5px 10px}.ui_btns button{cursor:pointer}* .ui_ie6_select_mask{width:99999em;height:99999em;position:absolute;top:0;left:0;z-index:-1}.ui_loading_tip{visibility:hidden;width:9em;height:1.2em;text-align:center;line-height:1.2em;position:absolute;top:50%;left:50%;margin:-0.6em 0 0 -4.5em}.ui_loading .ui_loading_tip,.ui_loading .ui_content_mask{visibility:visible}.ui_loading .ui_content_mask{filter:alpha(opacity=100);opacity:1}body:nth-of-type(1) .ui_loading .ui_iframe iframe{visibility:hidden}.ui_move .ui_title_text{cursor:move}.ui_move .ui_content_mask{visibility:visible}html>body .ui_fixed {position:fixed}* html .ui_fixed {fixed:true}* .ui_ie6_fixed{background:url(*) fixed}* .ui_ie6_fixed body{height:100%}* html .ui_fixed{width:100%;height:100%;position:absolute;left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth);top:expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight)}* .ui_page_lock select,* .ui_page_lock .ui_ie6_select_mask{visibility:hidden}.ui_overlay{visibility:hidden;position:fixed;top:0;left:0;width:100%;height:100%;filter:alpha(opacity=0);opacity:0;_overflow:hidden}.ui_lock .ui_overlay{visibility:visible}.ui_overlay div{height:100%}* html body{margin:0}@media all and (-webkit-min-device-pixel-ratio:10000),not all and (-webkit-min-device-pixel-ratio:0){.ui_content_wrap,.r0d0,.r0d2,.r2d2,.r2d0{display:block}}',
  // reset some style
  /**应用库自身的shaodw*/
  '.ui_focus .r2d1 { -moz-box-shadow:none;-webkit-box-shadow:none;box-shadow:none;}',
  '.ui_dialog  {border:none !important;}.ui_dialog_main{table-layout:fixed;}.ui_dialog .ui_ctx{overflow:hidden;}',
  '.ui_dialog .ui_boxinner {border:1px solid #000000 !important;}',
  // cursor
  '.ui_dialog .r1d2{cursor:e-resize;}.ui_dialog .r2d1{cursor:s-resize;}.ui_dialog .r1d0{cursor:w-resize;}.ui_dialog .r0d1{cursor:n-resize;}.ui_dialog .r2d2{cursor:se-resize;}.ui_dialog .r2d0{cursor:sw-resize;}.ui_dialog .r0d0{cursor:nw-resize;}.ui_dialog .r0d2{cursor:ne-resize;}'
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
// CC.Tpl.def('CC.more.ArtDialog', '<table><tr><td class="ui_bottom_wrap"><div class="ui_bottom"><div class="ui_btns" id="_ct"></div></div></td></tr></table>');
})();