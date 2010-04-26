//~@base/CssParser.js
(function(){
var C = {
//1c, 占宽一列, 即width:95%
  '1c':['width','95%'],
//2c, 占宽两列, 即width:45%
  '2c':['width','45%'],
  '3c':['width','30%'],
  '4c':['width','20%'],
  '5c':['width','10%'],
//c:5 为 width = 5*10 + '%',结果为width=50%
  'c' :function(c,v){c.view.style.width = v + '%'},
  'w' :function(c,v){c.view.style.width = v;},
  'h' :function(c,v){c.view.style.height = v;},
  'd' :function(c,v){c.view.style.display = v;},
  'db': ['display', 'block'],
  'dib':['display', 'inline-block'],
  'dh' :['display', 'hidden'],
  'np':['padding','0px'],
  'nb':['border','0px'],

  'fl':['float','left'],
  'fr':['float','right'],
  'cb':['clear','both'],

  'tl':['textAlign','left'],
  'tr':['textAlign','right'],
  'tc':['textAlign','center'],

  'p':function(c, v){c.view.style.padding = v;},
  'pl':function(c, v){c.view.style.paddingLeft = v;},
  'pr':function(c, v){c.view.style.paddingRight = v;},
  'pt':function(c, v){c.view.style.paddingTop = v;},
  'pb':function(c, v){c.view.style.paddingBottom = v;},

  'bd':function(c, v){c.view.style.border = v;},
  'bdl':function(c, v){c.view.style.borderLeft = v;},
  'bdr':function(c, v){c.view.style.borderRight = v;},
  'bdt':function(c, v){c.view.style.borderTop = v;},
  'bdb':function(c, v){c.view.style.borderBottom = v;},
   
  'z'  :function(c, v){c.view.style.zIndex = v;},
   
/**常用于布局Border设置*/
  'lnl':['borderLeft',  '1px solid #CCC'],
  'lnt':['borderTop',   '1px solid #CCC'],
  'lnb':['borderBottom','1px solid #CCC'],
  'lnr':['borderRight', '1px solid #CCC'],
  'lnx':['border',      '1px solid #CCC'],

  'm':function(c, v){c.view.style.margin  = v;},
  'ml':function(c, v){c.view.style.marginLeft  = v;},
  'mr':function(c, v){c.view.style.marginRight  = v;},
  'mt':function(c, v){c.view.style.marginTop  = v;},
  'mb':function(c, v){c.view.style.marginBottom  = v;},

  'pa':['position', 'absolute'],
  'pr':['position', 'relative'],
  'b' :function(c, v){c.view.style.bottom = v;},
  'l' :function(c, v){c.view.style.left = v;},
  'r' :function(c, v){c.view.style.right = v;},
  't' :function(c, v){c.view.style.top = v;},
  'oh':['overflow','hidden'],
  'oa':['overflow','auto']
};

var S = /\s+/, B  = CC.borderBox, inst;

/**
 * @name CC.util.CssParser
 * @class
 * CssParser对于懒得写CSS或需要用脚本控制css的开发人员来说,是个好工具.
 * 它可以以一种非常简单的方式写元素的inline css style.
 * @example
   parser.parse(comp, 'pa l:5 t:10 ofh ac w:25 $pd:5,3');
   上面这句将应用comp以下样式:
   {
    position:absolute;
    left:5px;
    top:10px;
    overflow:hidden;
    text-align:center;
    width:25px;
    对于border box浏览器应用
    padding:5px 3px;
   }
   CC.Base的cset方法已内嵌CSS Parser解析,以上可直接调用
   comp.parse('pa l:5 t:10 oh tc w:25 $p:5,3');
系统自带的规则为:
<pre>
{
//1c, 占宽一列, 即width:95%
  '1c':['width','95%'],
//2c, 占宽两列, 即width:45%
  '2c':['width','45%'],
  '3c':['width','30%'],
  '4c':['width','20%'],
  '5c':['width','10%'],
//c:5 为 width = 5*10 + '%',结果为width=50%
  'c' :function(c,v){c.view.style.width = v + '%'},
  'w' :function(c,v){c.view.style.width = v;},
  'h' :function(c,v){c.view.style.height = v;},
  'd' :function(c,v){c.view.style.display = v;},
  'db': ['display', 'block'],
  'dib':['display', 'inline-block'],
  'dh' :['display', 'hidden'],
  'np':['padding','0px'],
  'nb':['border','0px'],

  'fl':['float','left'],
  'fr':['float','right'],
  'cb':['clear','both'],

  'tl':['textAlign','left'],
  'tr':['textAlign','right'],
  'tc':['textAlign','center'],

  'p':function(c, v){c.view.style.padding = v;},
  'pl':function(c, v){c.view.style.paddingLeft = v;},
  'pr':function(c, v){c.view.style.paddingRight = v;},
  'pt':function(c, v){c.view.style.paddingTop = v;},
  'pb':function(c, v){c.view.style.paddingBottom = v;},

  'bd':function(c, v){c.view.style.border = v;},
  'bdl':function(c, v){c.view.style.borderLeft = v;},
  'bdr':function(c, v){c.view.style.borderRight = v;},
  'bdt':function(c, v){c.view.style.borderTop = v;},
  'bdb':function(c, v){c.view.style.borderBottom = v;},
   
  'z'  :function(c, v){c.view.style.zIndex = v;},
   
  'lnl':['borderLeft',  '1px solid #CCC'],
  'lnt':['borderTop',   '1px solid #CCC'],
  'lnb':['borderBottom','1px solid #CCC'],
  'lnr':['borderRight', '1px solid #CCC'],
  'lnx':['border',      '1px solid #CCC'],

  'm':function(c, v){c.view.style.margin  = v;},
  'ml':function(c, v){c.view.style.marginLeft  = v;},
  'mr':function(c, v){c.view.style.marginRight  = v;},
  'mt':function(c, v){c.view.style.marginTop  = v;},
  'mb':function(c, v){c.view.style.marginBottom  = v;},

  'pa':['position', 'absolute'],
  'pr':['position', 'relative'],
  'b' :function(c, v){c.view.style.bottom = v;},
  'l' :function(c, v){c.view.style.left = v;},
  'r' :function(c, v){c.view.style.right = v;},
  't' :function(c, v){c.view.style.top = v;},
  'oh':['overflow','hidden'],
  'oa':['overflow','auto']
}
</pre>
 */
CC.util.CssParser = function(){};

CC.extendIf(CC.util.CssParser.prototype, /**@lends CC.util.CssParser#*/{
/**
 * 定义规则
 * @param {String|Object} key 当为Object类型时批量定义规则
 * @param  {Object} value 可以是一个属生集的Object, 也可以是css属性组合的数组[attrName, attrValue],还可以是一个函数,该函数参数为 function(component, value){},其中component为应用样式的控件,value为当前解析得出的值,未设置则为空.
 @example
   parser.def('fl', ['float', 'left']);
   parser.def('bdred', {border:'1px red'});
   parser.def('bd', function(comp, value){
    comp.setStyle('border', value);
   });
 */
  def : function(k, r){
    var rs = this.rules;
    if(!rs)
      rs = this.rules = {};

    if(typeof k === 'object'){
      for(var i in k)
        rs[i] = k[i];
    }else {
      rs[k] = r;
    }
    return this;
  },
/**
 * @param {CC.Base}
 * @param {String} pattern 样式
 */
  parse : function(ct, cs){
    var cf, r,
        cs = cs.split(S),
        i,len,rv, rs = this.rules,
        wc,d,v;

    for(i=0,len=cs.length;i<len;i++){
      r = cs[i];

      //parse r=v
      d = r.indexOf(':');
      if(d>0){
          v = r.substring(d+1);
          v = v.replace(/,/g, ' ');
          r = r.substr(0, d);
      }else v = false;

      //parse -child
      if(r.charAt(0)==='^'){
        r = r.substring(1);
        if(r.charAt(0) === '$'){
          if(!B)
            continue;
          r = r.substring(1);
        }
        rv = rs&&rs[r] || C[r] || r;

        if(!cf)
          cf = [];
        cf.push(rv);
        cf.push(v);
      }

      //
      else {
        // parse $ border box only
        if(r.charAt(0) === '$'){
          if(B){
            r = r.substring(1);
            rv = rs&&rs[r] || C[r];
            if(rv)
              this.applyRule(ct, rv, v);
          }
        }else {
          rv = rs&&rs[r] || C[r] || r;
          this.applyRule(ct, rv, v);
        }
      }
    }

    if(cf && cf.length>0 && ct.children){
      for (i=0,cs=ct.children,len=cs.length; i < len; i++) {
        s = cs[i];
        for(var k=0,m=cf.length;k<m;k+=2){
           this.applyRule(s, cf[k], cf[k+1]);
        }
      }
    }
  },
  /**@private*/
  applyRule : function(c, rv, v){
    //array
    if(CC.isArray(rv)){
      c.setStyle(rv[0], v||rv[1]);
    }

    //object
    else if(typeof rv === 'object'){
      for(var k in rv)
        c.setStyle(k, rv[k]);
    }

    //string
    else if(typeof rv === 'string'){
      if(rv.charAt(0) !== '.'){
        //continue parsing
        if(rv.indexOf(' ')<0)
          throw 'CC.util.CssParser: Unsupported instruction \''+rv+'\'';

        this.parse(c, rv);
      }else {
        //single string
        c.addClass(rv.substring(1));
      }
    }
    //function
    else if(typeof rv === 'function'){
      rv(c, v, this);
    }
  }
});
/**
 * 获得全局CSS解析器
 */
CC.util.CssParser.getParser = function(){
  if(!inst)
    inst = new CC.util.CssParser();

  return inst;
};
})();