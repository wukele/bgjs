if(!CC.ie)
  CC.Tpl.def('CC.ui.FloatTip', '<div class="g-float-tip g-clear"><div class="tipbdy"><div id="_tle" class="important_txt"></div><div id="_msg" class="important_subtxt"></div></div><div class="btm_cap" id="_cap"></div></div>');
else
  CC.Tpl.def('CC.ui.FloatTip', '<table class="g-float-tip g-clear"><tr><td><table class="tipbdy"><tr><td id="_tle" class="important_txt"></td></tr><tr><td id="_msg" class="important_subtxt"></td></tr></table></td></tr><tr><td class="btm_cap" id="_cap"></td></tr></table>');
/**
 * ������ʾ��,������һ��ĶԻ���ʾ�����������ʾ
 * @name CC.ui.FloatTip
 * @class
 * @extends CC.ui.Panel
 */
CC.create('CC.ui.FloatTip', CC.ui.Panel,function(superclass){
  var CC = window.CC;

  //һ��ȫ��FloatTip����
  var instance;

  var Event = CC.Event;
  //
  // ��¼����ƶ�ʱ����
  //
  var globalPos = [-10000,-10000];

  //��ǰdocument�Ƿ��Ѱ�����ƶ������ص�
  var docEvtBinded = false;

  function onDocMousemove(event){
    globalPos = Event.pageXY(event || window.event);
  }
  /**
   * @function
   * @param {String} msg ��ʾ��Ϣ
   * @param {String} [title] ��Ϣ��ʾ����
   * @param {DOMElement|CC.Base} [target] ��Ϣ��ʾĿ¼Ԫ��,��Ϣ�������ڸ�Ԫ�����Ϸ�
   * @param {Boolean} [getFocus] ��ʾʱ�Ƿ�۽���targetԪ��,����ڱ���ؼ��Ƚ�����
   * @param {Number} [timout] ��ʱ������,����Ϣ��ʾͣ��ʱ��
   * @example
     CC.Util.ftip('���벻��Ϊ��.', '��ʾ', 'input_el', true, 3000);
   */
  CC.Util.ftip = function(msg, title, proxy, getFocus, timeout){
    if(!instance)
      instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
    CC.fly(instance.tail).show().unfly();
    instance.show(msg, title, proxy, getFocus, timeout);

    return instance;
  };
  /**
   * ��Ŀ������������Ϣ
   * @param {CC.ui.Base} target
   * @param {String} msg
   @example
     CC.Util.qtip(input, '�������������Ĵ���');
   */
  CC.Util.qtip = function(proxy, msg){
    if(!instance)
      instance = new CC.ui.FloatTip({showTo:document.body, autoRender:true});
    instance.tipFor(proxy, msg);
  };

  return /**@lends CC.ui.FloatTip#*/{
    /**
     * @property {Number} timeout = 2500 ������ʧ��ʱms, ���Ϊ0 �� false ���Զ��ر�.
     */
    timeout: 2500,
  /**
   * ��ʾ��ʾ��Ϣ���ӳ�,��Ϣ�����λ��Ŀ���ӳ�daly��������
   * @type Number
   */
    delay : 500,

    /**
     * @property {Boolean} [reuseable = true] ��Ϣ��ʾ�Ƿ�ɸ���,�����,����Ϣ���غ��Զ�����
     */
    reuseable : true,

    shadow:true,

  /**
   * ָ����������ʾ���,һ��Ϊmouseoverʽ��ʾ,��һ��Ϊ������ʾ
   */
    qmode : false,

    zIndex : 10002,
  /**
   * @private
   * mouseoverʽ��ʾʱ��ʽ
   */
    hoverTipCS : 'g-small-tip',

    /**
     * @private
     * @override
     */
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
    setRightPosForTarget : function(target){
      var f = CC.fly(target), xy = f.absoluteXY();
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
 * ��ʱ��ʾ
 * @private
 */
    killPretimer : function(){
      if(this.pretimerId){
          clearTimeout(this.pretimerId);
          this.pretimerId = false;
      }
    },

  /**
   * �����ǰ��ʱ�ر�
   * @param {boolean} check �Ƿ�������(reuseable)���
   * @private
   */
    killTimer : function(check){

      if(this.timerId){
          clearTimeout(this.timerId);
          this.timerId = false;
      }

      if(!this.reuseable && check)
        this.destory();
    },

  /**
   * ������ʾ��������Ϣ
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
   * @param {String} msg ��ʾ��Ϣ
   * @param {String} [title] ��Ϣ��ʾ����
   * @param {DOMElement|CC.Base} [target] ��Ϣ��ʾĿ¼Ԫ��,��Ϣ�������ڸ�Ԫ�����Ϸ�
   * @param {Boolean} [getFocus] ��ʾʱ�Ƿ�۽���targetԪ��,����ڱ���ؼ��Ƚ�����
   * @param {Number} [timout] ��ʱ������,����Ϣ��ʾͣ��ʱ��
   */
    show : function(msg, title, target, getFocus, timeout){

      if(arguments.length == 0)
        return superclass.show.call(this);

      this.setMsg(msg, title);

      if(timeout !== undefined)
        this.timeout = timeout;

      if(this.qmode)
        this.createFtip();

      this.display(true);
      if(target){
        this.setRightPosForTarget(target);
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
   * ��Ŀ������������Ϣ
   * @param {CC.ui.Base} target
   * @param {String} msg, ��Ϣ
   @example
     CC.Util.qtip(input, '�������������Ĵ���');
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

            //ɾ��
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
    },
  /**
   * ���ȫ��tip����
   */
    getInstance : function(){
      return instance;
    }
  };
});