/**
 * Javascript Utility for web development.
 * 反馈 : www.cicyui.com/forum
 * @mailto javeejy@126.com
 * www.cicyui.com ? 2010 - 构建自由的WEB应用
 */

// Base on 
/*
 * web.qq.com
 */

/**
 * 感谢http://web2.qq.com/
 */

/**
 * 本CSS资源只供学习用。
 */
(function(){

// load css resources
//CC.loadCSS('http://www.planeart.cn/downs/artDialog/skin/default.css');


CC.loadCSS('http://hp.qq.com/webqqpic/style/jet.all.css?t=20100505001');
CC.loadCSS('http://hp.qq.com/webqqpic/style/qqweb.main.css?t=20100505001');
CC.loadCSS('http://hp.qq.com/webqqpic/style/theme_wood1/qqweb.theme.css');

// 定义模板
CC.Tpl.def('CC.more.QQWinBarBtn', '<a hidefocus="" href="javascript:fGo()" style="display: block;"></a>');

CC.Tpl.def('CC.more.QQWin',[
'<div class="window window_current" style="z-index: 468; left: 322px; top: 92px; width: 418px; height: 292px; display: block;">',
    '<div class="window_outer" id="_outer" style="height:197px;">',
        '<div style="z-index: 370;" id="_inner" class="window_inner">',
            '<div class="window_bg_container">',
                '<div class="window_bg window_center"></div>',
                '<div class="window_bg window_t"></div>',
                '<div class="window_bg window_rt"></div>',
                '<div class="window_bg window_r"></div>',
                '<div class="window_bg window_rb"></div>',
                '<div class="window_bg window_b"></div>',
                '<div class="window_bg window_lb"></div>',
                '<div class="window_bg window_l"></div>',
                '<div class="window_bg window_lt"></div>',
            '</div>',
            '<div class="window_content">',
                '<div class="window_titleBar" id="_tbar">',
                    '<div id="_tbct"></div>',
                    '<div class="window_title titleText" id="_tle">Gmail&nbsp;Preview</div>',
                '</div>',
                '<div class="window_bodyArea" id="_wr">',
                   '<div class="content_area" style="height: 99%; width: 100%;" id="_ct"></div>',
                   '<div id="appWindow_47_alt" class="flash_alt">',
                      '<div class="appIframeAlter"></div>',
                      '<div class="appIframeAlterTxt">运行中，点击恢复显示 :)</div>',
                   '</div>',
                '</div>',
                '<div class="window_controlArea" id="window_controlArea_47">',
                    '<a hidefocus="" href="###" title="取消" class="window_button window_cancel" id="window_cancelButton_47">取　消</a>',
                    '<a hidefocus="" href="###" title="确定" class="window_button window_ok" id="window_okButton_47">确　定</a>',
                    '<a hidefocus="" href="###" title="下一步" class="window_button window_next" id="window_nextButton_47">下一步</a>',
                    '<a hidefocus="" href="###" title="上一步" class="window_button window_previous" id="window_previousButton_47">上一步</a>',
                '</div>',
            '</div>',
            '<div id="_xn"  style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: n-resize; z-index: 1; left: 0pt; top: -5px; width: 100%; height: 5px; display: block;"></div>',
            '<div id="_xe"  style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: e-resize; z-index: 1; right: -5px; top: 0pt; width: 5px; height: 100%; display: block;"></div>',
            '<div id="_xs"  style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: s-resize; z-index: 1; left: 0pt; bottom: -5px; width: 100%; height: 5px; display: block;"></div>',
            '<div id="_xw"  style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: w-resize; z-index: 1; left: -5px; top: 0pt; width: 5px; height: 100%; display: block;"></div>',
            '<div id="_xne" style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: ne-resize; z-index: 2; right: -5px; top: -5px; width: 5px; height: 5px; display: block;"></div>',
            '<div id="_xes" style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: se-resize; z-index: 2; right: -5px; bottom: -5px; width: 5px; height: 5px; display: block;"></div>',
            '<div id="_xsw" style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: sw-resize; z-index: 2; left: -5px; bottom: -5px; width: 5px; height: 5px; display: block;"></div>',
            '<div id="_xwn" style="position: absolute; overflow: hidden; background: url(&quot;http://hp.qq.com/webqqpic/js/assets/images/transparent.gif&quot;) repeat scroll 0% 0% transparent; cursor: nw-resize; z-index: 2; left: -5px; top: -5px; width: 5px; height: 5px; display: block;"></div>',
        '</div>',
    '</div>',
'</div>'
].join('')
);

CC.create('CC.more.QQWin', CC.ui.Win, {
    
    ct : '_ct',
    
    minW:180,
    minH:36,
    
    shadow : false,
    initComponent : function(){
        this.createView();
        // cache some dom
        this._outerEl = this.dom('_outer');
        this._wrEl = this.dom('_wr');
        this.superclass.initComponent.apply(this, arguments);
    },
    
    titlebar : {
        ctype: 'ct',
        view : '_tbar',
        ct   : '_tbct',
        itemCfg : { template:'CC.more.QQWinBarBtn'},
        array : [
            {cs:'window_close', id:'close', tip : '关闭'},
            {cs:'window_max',   id:'max', tip:'最大化',
             onselect : function(){
                var win = this.pCt.pCt;
                if(win.win_s === 'max')
                    win.normalize();
                else win.max();
             }
            },
            {cs:'window_min', id:'min', tip:'最小化',
             onselect : function(){
                this.pCt.pCt.min();
             }
            },
            {cs:'window_fullscreen', tip:'最屏', onselect:function(){ this.pCt.pCt.max(); }}
        ]
    },
    
    getClientSize : function(w, h){
        var bx = this.fly(this._outerEl);
            bx.setHeight(this.height);
        bx.view = this._wrEl;
        var sz = [w-20, h-41];
        bx.setSize(sz[0], sz[1]).unfly();
        return sz;
    }
});

CC.ui.def('qqwin', CC.more.QQWin);

})();