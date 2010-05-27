(function() {
  var CC = window.CC;
  var spr = CC.ui.Panel.prototype;
  var DP;

  var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  //是否闰年
  function isLeapYear(year) {
    return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
  }
  //指定月天数,mm由1开始
  function sumDays(yy, mm) {
    return (mm != 2) ? monthDays[mm - 1] : (isLeapYear(yy)) ? 29 : 28;
  }
  //该月的第一天为星期几
  function firstDayOfMonth(date) {
    var day = (date.getDay() - (date.getDate() - 1)) % 7;
    return (day < 0) ? (day + 7) : day;
  }

  var Event = CC.Event;

  CC.Tpl.def('CC.ui.Datepicker', '<div class="g-datepicker" ><div style="position: relative;"><table cellspacing="0" cellpadding="0" class="entbox"><tbody><tr><td class="headline"><table width="100%" cellspacing="0" cellpadding="1" align="center" class="dxcalmonth"><tbody><tr><td align="left" class="month_btn_left"><span></span></td><td align="center"><table cellspacing="0" cellpadding="0" align="center"><tbody><tr><td><div id="_seltor" class="g-datepicker-selecor" style="display:none;"></div><div id="_planeY" class="planeYear" style="cursor: pointer;">1955</div></td><td class="comma">,</td><td><div id="_planeM" class="planeMonth" title="点击选择或直接输入年份值"></div></td></tr></tbody></table></td><td align="right" class="month_btn_right"><span></span></td></tr></tbody></table></td></tr><tr><td><table width="100%" cellspacing="0" cellpadding="0" class="g-datepicker-body"><tbody><tr><th class="month_spr"><span>月</span></th><th><span>日</span></th><th><span>一</span></th><th><span>二</span></th><th><span>三</span></th><th><span>四</span></th><th><span>五</span></th><th><span>六</span></th><th class="month_spr"><span>月</span></th></tr></tbody></table></td></tr><tr><td id="_monthWrap"></td></tr><tr><td style="text-align:center;padding-bottom:5px;" id="_tdytd"></td></tr></tbody></table><div class="leftsplit" id="_preBar" onmouseover="CC.addClass(this, \'leftsplitOn\')" onmouseout="CC.delClass(this, \'leftsplitOn\')" ></div><div class="rightsplit" onmouseover="CC.addClass(this, \'rightsplitOn\')" onmouseout="CC.delClass(this, \'rightsplitOn\')" id="_nxtBar"></div></div></div>');
/**
 * @class CC.ui.Datepicker
 * @extends CC.ui.Panel
 */
  CC.create('CC.ui.Datepicker', CC.ui.Panel, {

    shadow: true,

    unselectable: true,

    eventable: true,

    value: new Date(),

    fmt: 'yy/mm/dd',

    mm: null,

    yy: null,

    dd: null,

    keyEvent : true,

    initComponent: function() {

      spr.initComponent.call(this);

      this.monthWrap = this.dom('_monthWrap');

      this.domEvent('click', this.onDayClick, true, null, this.monthWrap)
          .domEvent('click', this.onYearList, true, null, '_planeY')
          .domEvent('click', this.onNavBarMove, true, null, '_nxtBar')
          .domEvent('click', this.onNavBarMove, true, null, '_preBar');

      if (CC.Util.qtip)
        CC.Util.qtip(this.$$('_planeY'), '点击选择或直接输入年份值');
      if (this.value)
        this.setValue(this.value, true);

      this.todayBtn = new CC.ui.Button({ showTo: this.dom('_tdytd'), title: '今天' });

      this.follow(this.todayBtn)
          .domEvent('click', this.toToday, true, null, this.todayBtn.view)
          .selectorNode = this.dom('_seltor');
    },

    _hideYearSel: function() {
      CC.fly(this.selectorNode)
        .display(false)
        .unfly();
    },

    onNavBarMove: function(evt) {
      var el = Event.element(evt);
      el.id == '_nxtBar' ?
        this.selectYear(this.yy + 1)
      : this.selectYear(this.yy - 1);
    },
/**
 * 选择年
 * @param {Number}
 */
    selectYear: function(yy) {
      this.setValue(new Date(yy, this.mm, 1), true);
    },
/**
 * 获得今日日期
 */
    toToday: function() {
      this.setValue(new Date());
    },

    onYearList: function() {
      var dv = this.selectorNode;
      CC.fly(dv)
        .bindContext()
        .display(true)
        .unfly();

      if (!dv.firstChild)
        this.createList();

      dv.firstChild.value = this.yy;
      dv.lastChild.value = '';

      (function() {
        dv.lastChild.focus();
      }).timeout(20);
    },

    createList: function() {
      var dv = this.selectorNode,
          pan = this.fly('_planeY'),
          sz = pan.getSize();
      dv.innerHTML = this.getSelectListHtml();

      var sel = dv.firstChild,
          txt = dv.lastChild;

      pan.unfly();

      CC.fly(txt)
        .fastStyleSet('width', sel.offsetWidth)
        .fastStyleSet('height', sel.offsetHeight)
        .unfly();

      this.domEvent('change', function() {
        this.selectYear(sel.value);
        this._hideYearSel();
      },
      false, null, sel);

      this.noUp('click', dv)
          .bindEnter(function() {
        var v = parseInt(txt.value.trim());
        if (!isNaN(v)) this.selectYear(v);
        this._hideYearSel();

      }, true, null, txt);

    },

    getSelectListHtml: function() {
      var html = ['<select>'],
          ys = this.selectYearStart || 1900,
          es = this.selectYearEnd || 2100;
      for (var i = ys; i <= es; i++) {
        html.push('<option value="' + i + '">' + i + '</option>');
      }
      html.push('<input type="text" class="g-corner" />');
      return html.join('');
    },

    onDayClick: function(evt) {
      var el = Event.element(evt);
      if (el == this.monthWrap) return;
      var id = CC.tagUp(el, 'TD').id;
      if (id.indexOf('/') > 0) this.setValue(new Date(id));
      else this.setValue(new Date(this.yy, parseInt(id), 1), true);
    },
/**
 * 设置日期.
 * @param {String|Date}
 */
    setValue: function(v, cancelEvent) {
      var pre = this.currentDate;
      if (!CC.isDate(v)) {
        v = CC.dateParse(v, this.fmt);
      }

      var yy = v.getFullYear();
      if (isNaN(yy)) {
        if (__debug) console.log('invalid date :' + v);
        return;
      }

      var mm = v.getMonth(),
          dd = v.getDate();

        this.yy = yy;
        this.mm = mm;
        this.dd = dd;

        this.currentDate = v;
        this.update(pre);
        if (!cancelEvent && (!this.disableFilter || !this.disableFilter(yy, mm, dd)))
          this.fire('select', CC.dateFormat(v, this.fmt), v);
    },

    update: function(preDate) {
      var mm = this.mm + 1,
          yy = this.yy,
          dd = this.dd;


      this.dom('_planeM').innerHTML = mm + '月';
      this.dom('_planeY').innerHTML = yy + '年';

      var mw = CC.fly(this.monthWrap),
          id;
      if (preDate && yy == preDate.getFullYear() && mm == preDate.getMonth() + 1) {
        id = (preDate.getMonth() + 1) + '/' + preDate.getDate() + '/' + preDate.getFullYear();
        CC.delClass(mw.dom(id), 'selday');
      } else this.monthWrap.innerHTML = this.getMonthHtml(this.currentDate);

      id = mm + '/' + dd + '/' + yy;
      var dom = mw.dom(id);
      if (dom) CC.addClass(dom, 'selday');
      mw.unfly();
    },

    getMonthHtml: function(date) {
      var html = [], tod = new Date(), toy = tod.getFullYear();
      var mm = date.getMonth() + 1,
          yy = date.getFullYear(),
          days = sumDays(yy, mm),
          ct = mm - 1,
          py = yy,
          ny = py,
          preM = ct == 0 ? 12 : ct;

      if (preM == 12) py -= 1;

      ct = mm + 1;

      var nxtM = ct > 12 ? 1 : ct;

      if (nxtM == 1) ny += 1;

      var fstday = firstDayOfMonth(date),
          psum = sumDays(py, preM),
          psd = psum - fstday + 1;

      //sunday, show more days to previous month.
      if (fstday == 0) psd = psum - 6;

      html.push('<table class="g-datepicker-days"  width="100%" cellspacing="0" cellpadding="0"><tbody>');
      //visible two months
      var state = 0,
      cls = 'preday',
      m = preM,
      y = py,
      df = this.disableFilter;

      for (var i = 0; i < 6; i++) {
        //week days
        html.push('<tr><td class="month_sep');

        if((i+1) === mm)
          html.push(' selmonth');

        html.push('" id="' + i + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 1) + '</a></td>');
        for (var j = 0; j < 7; j++) {
          html.push('<td class="' + cls);
          if (j == 6) html.push(' sateday');
          else if (j == 0) html.push(' sunday');

          if (df)
            if (df(y, m, psd))
              html.push(' disabledday');

          html.push('" id="' + m + '/' + psd + '/' + y + '"><a');
          if(toy === y && (tod.getMonth() + 1) === m && tod.getDate() === psd){
            html.push(' class="today" title="今天:'+ y + '年' + m + '月' + psd +'日"');
          }
          html.push(' href="javascript:fGo()" hidefocus="on">' + psd + '</a></td>');

          psd++;
          if (psd > psum && state == 0) {
            psd = 1;
            state = 1;
            cls = 'curday';
            m = mm;
            y = yy;
          } else if (state == 1 && psd > days) {
            state = 2;
            psd = 1;
            cls = 'nxtday';
            m = nxtM;
            y = ny;
          }
        }
        html.push('<td class="month_sep month_r');

        if((i+7) === mm)
          html.push(' selmonth');

        html.push('" id="' + (i + 6) + '"><a href="javascript:fGo()" hidefocus="on">' + (i + 7) + '</a></td></tr>');
      }
      html.push('</tbody></table>');
      return html.join('');
    }
  });

  DP = CC.ui.Datepicker;

  DP.dateFormat = 'yy/mm/dd';

  var instance;
  function onselect(v) { (function() {
      instance.hide();
      instance.bindingEditor.value = v;
      instance.bindingEditor = null;
    }).timeout(200);
  }

  function showDatepicker() {
    var dp = instance,
    f = CC.fly(dp.bindingEditor);
    dp.display(true);
    dp.setValue(dp.bindingEditor.value.trim(), true);
    //get the right position.
    dp.anchorPos(f, 'lb', 'hr', null, true, true);
    f.unfly();
    dp.bindContext();
  }

  DP.getInstance = function(){
    if (!instance) {
      instance = DP.instance = new DP({
        hidden: true,
        showTo: document.body,
        autoRender: true
      });
      instance.on('select', onselect);
    }
    return instance;
  };

  /**
 * 全局实例
 * 用法 <pre><input type="text" onclick="Datepicker.show(this)" /></pre>
 * @member CC.ui.Datepicker
 * @method show
 * @static
 */
  DP.show = function(input) {
    DP.getInstance();
    instance.dateFormat = DP.dateFormat;
    instance.bindingEditor = input;
    showDatepicker(true);
  };
})();