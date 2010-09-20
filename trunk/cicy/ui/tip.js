if(!CC.ie)
  CC.Tpl.def('CC.ui.FloatTip', '<div class="g-float-tip g-clear"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div><div class="btm_cap" id="_cap"></div></div>');
else
  CC.Tpl.def('CC.ui.FloatTip', '<table class="g-float-tip g-clear"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr><tr><td class="btm_cap" id="_cap"></td></tr></table>');
/**
 * @class CC.ui.FloatTip
 * 浮动提示框,可用于一般的对话提示或鼠标悬浮提示
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.FloatTip', CC.ui.Panel,function(superclass){
  var CC = window.CC;

  //一个全局FloatTip对象
  var instance;

  var Event = CC.Event;
  //
  // 记录鼠标移动时坐标
  //
  var globalPos = [-10000,-10000];

  //当前document是否已绑定鼠标移动监听回调
  var docEvtBinded = false;

  function onDocMousemove(event){
    globalPos = Event.pageXY(event || window.event);
  }
  /**
   * 显示消息提示.<br>
   * 方法来自{@link CC.ui.FloatTip}<br>
   <pre><code>CC.Util.ftip('密码不能为空.', '提示', 'input_el', true, 3000);</code></pre>
   * @param {String} msg 提示消息
   * @param {String} [title] 消息提示标题
   * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
   * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
   * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
   * @param {Array}  [offsetx, offsety] 显示X，Y增量
   * @method ftip
   * @member CC.Util
   */
  CC.Util.ftip = function(msg, title, proxy, getFocus, timeout, off){
    if(!instance)
      instance = CC.ui.instance({ctype:'tip', showTo:document.body, autoRender:true});
    CC.fly(instance.tail).show().unfly();
    instance.show(msg, title, proxy, getFocus, timeout, off);

    return instance;
  };
  /**
   * 给目标对象绑定悬浮消息.<br>
   * 方法来自{@link CC.ui.FloatTip}<br>
     <pre><code>CC.Util.qtip(input, '在这里输入您的大名');</code></pre>
   * @param {CC.ui.Base} target
   * @param {String} msg
   * @method qtip
   * @member CC.Util
   */
  CC.Util.qtip = function(proxy, msg){
    if(!instance)
      instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
    instance.tipFor(proxy, msg);
  };

  return {
    /**
     * @cfg {Number} timeout=2500 设置消失超时ms, 如果为0 或 false 不自动关闭.
     */
    timeout: 2500,
  /**
   * @cfg {Number} delay 显示提示消息的延迟,消息将鼠标位于目标延迟daly毫秒后出现
   */
    delay : 500,

    /**
     * @cfg {Boolean} [reuseable = true] 消息提示是否可复用,如果否,在消息隐藏后自动销毁
     */
    reuseable : true,

    shadow:true,

  /**
   * @cfg {Boolean} qmode 指定是哪种显示风格,一种为mouseover式提示,另一种为弹出提示
   */
    qmode : false,

    zIndex : 10002,
    
  /**
   * @private
   * mouseover式提示时样式
   */
    hoverTipCS : 'g-small-tip',


    initComponent: function() {
      superclass.initComponent.call(this);
      if(this.msg)
        this.setMsg(this.msg);
      this.tail = this.dom('_cap');
      this.setXY(-10000,-10000).setZ(this.zIndex);
      if(this.qmode)
        this.createQtip();
      else this.createFtip();
    }
    ,

    display : function(b){
      if(b && this.timerId){
        this.killTimer();
      }
      return superclass.display.apply(this, arguments);
    },

    onShow : function(){
      superclass.onShow.call(this);
      if(this.timeout)
        this.timerId = this._timeoutCall.bind(this).timeout(this.timeout);
    },

    onHide : function(){
      this.killTimer();
      superclass.onHide.call(this);
      this.setXY(-10000, -10000);
    },

  /**@private*/
    setRightPosForTarget : function(target, off){
      var f = CC.fly(target), xy = f.absoluteXY();
      if(off){
        xy[0] += off[0];
        xy[1] += off[1];
      }
      this.anchorPos([xy[0],xy[1],0,0], 'lt', 'hr', false, true, true);
      f.unfly();
    },

  /**@private*/
    setRightPosForHover : function(xy){
      //box, dir, rdir, off, rean, move
      this.anchorPos([xy[0],xy[1],0,0], 'lb', 'hr', [5,24], true, true);
    },

  /**@private*/
    _timeoutCall : function(){
      superclass.display.call(this, false);
      this.killTimer(true);
      if(this.ontimeout)
        this.ontimeout();
    },
/**
 * 超时显示
 * @private
 */
    killPretimer : function(){
      if(this.pretimerId){
          clearTimeout(this.pretimerId);
          this.pretimerId = false;
      }
    },

  /**
   * 清除当前超时关闭
   * @param {boolean} check 是否作回收(reuseable)检查
   * @private
   */
    killTimer : function(check){

      if(this.timerId){
          clearTimeout(this.timerId);
          this.timerId = false;
      }

      if(!this.reuseable && check)
        this.destroy();
    },

  /**
   * 设置提示标题与消息
   * @param {String} msg
   * @param {String} title
   */
    setMsg: function(msg, title) {
      this.fly('_msg').html(msg).unfly();
      if(title)
        this.setTitle(title);

      if(this.shadow && !this.shadow.hidden)
        this.shadow.reanchor();
      return this;
    },

  /**
   * 显示提示.
   * @param {String} msg 提示消息
   * @param {String} [title] 消息提示标题
   * @param {DOMElement|CC.Base} [target] 消息提示目录元素,消息将出现在该元素左上方
   * @param {Boolean} [getFocus] 提示时是否聚焦到target元素,这对于表单类控件比较有用
   * @param {Number} [timout] 超时毫秒数,即消息显示停留时间
   * @param {Array}  [offsetx, offsety] 显示X，Y增量
   */
    show : function(msg, title, target, getFocus, timeout, off){

      if(arguments.length == 0)
        return superclass.show.call(this);

      this.setMsg(msg, title);

      if(timeout !== undefined)
        this.timeout = timeout;

      if(this.qmode)
        this.createFtip();

      this.display(true);
      if(target){
        this.setRightPosForTarget(target, off);
        if(getFocus)
          CC.fly(target).focus(true).unfly();
      }
      return this;
    },
    /**@private*/
    createFtip : function(){
      this.qmode = false;
      this.delClass(this.hoverTipCS);
      if(this.shadow){
        this.shadow.inpactY = -1;
        this.shadow.inpactH = -12;
      }
    },
    /**@private*/
    createQtip : function(){
      this.qmode = true;
      this.addClassIf(this.hoverTipCS);
      if(this.shadow){
        this.shadow.inpactY = CC.ui.Shadow.prototype.inpactY;
        this.shadow.inpactH = CC.ui.Shadow.prototype.inpactH;
      }
    },
  /**
   * 给目标对象绑定悬浮消息.<br>
   * <code>CC.Util.qtip(input, '在这里输入您的大名');</code>
   * @param {CC.ui.Base} target
   * @param {String} msg, 消息
   */
    tipFor : function(proxy, msg, title){
      CC.fly(proxy)
        .domEvent('mouseover',
          function(evt){
            var self = this;
            if(!docEvtBinded){
              Event.on(document, 'mousemove', onDocMousemove);
              docEvtBinded = true;
            }

            //删除
            if(this.pretimerId)
              this.killPretimer();

            this.pretimerId  = (function(){

              self.killTimer();

              self.setMsg(proxy.qtip || proxy.tip || proxy.title || msg, title);
              CC.fly(self.tail).hide().unfly();
              if(!self.qmode){
                self.createQtip();
              }

              self.display(true)
                  .setRightPosForHover(globalPos);
            }).timeout(this.delay);

          }, true, this)
        .domEvent('mouseout', this.onTargetMouseout, true, this)
        .unfly();
    },
  /**@private*/
    onTargetMouseout : function(evt){
      if(this.qmode){
         this.display(false);
      }
      if(docEvtBinded){
        Event.un(document, 'mousemove', onDocMousemove);
        docEvtBinded = false;
      }
      this.killPretimer();
    }
  };
});
CC.ui.def('tip', CC.ui.FloatTip);
