/**
 * 高亮查找插件，基于文本结点的DOM操作，对原有非文本结点不造成任何影响。
 * 用法:
 <pre>
   高亮:
   CC.fly('ss').heighlight(['keyword', ... ]).unfly();
   清除:
   CC.fly('ss').clearHeighlight().unfly();
   
   或者传递自定义的样式类
   CC.fly('ss').heighlight(['keyword', ... ], 'cssClass').unfly();
   清除:
   CC.fly('ss').clearHeighlight('cssClass').unfly();   
 </pre>
 <strong>请确保每次高亮前清除先前已高亮内容。</strong>
 可选配置信息：<br>
 CC.Base.prototype.heighlight.cls
 * @method heightlight
 * @member CC.Base
*/

/**
 * @method clearHeighlight
 * @member CC.Base
 */
(function(B){

// private
var IGNORE,S,ESC,LT,GT, inited;

// private
function init(){
    IGNORE = /INPUT|IMG|SCRIPT|STYLE|HEAD|MAP|AREA|TEXTAREA|SELECT|META|OBJECT|IFRAME/i;
    S      = /^\s+$/;
    ESC    = /(\.|\\|\/|\*|\?|\+|\[|\(|\)|\]|\{|\}|\^|\$|\|)/g;
    LT     = /</g;
    GT     = />/g;
    
    CC.loadStyle('span.g-heighlight {background:yellow !important;color:red !important;}');
    inited = true;
}

// entry
function entry(keys, cls){
  
  if(!inited)
    init();

  if(keys[0]){
    // normalize
    var arr = [];
    for(var i=0,len=keys.length;i<len;i++){
       if(keys[i] && !S.test(keys[i])) {
          arr[arr.length] = keys[i].replace(LT, '&lt;')
                                   .replace(GT, '&gt;')
                                   .replace(ESC, '\\$1');
       }
    }
    var reg     = new RegExp('(' + arr.join('|') + ')', 'gi'),
        placing = '<span class="'+(cls||entry.cls)+'">$1</span>',
        div     = document.createElement('DIV');
    heighlightEl(this.view, reg, placing, div);
  }
  
  return this;
}

// public
B.heighlight = entry;

B.clearHeighlight = function(cls) {
  if(!inited)
    init();
  var cls = cls||entry.cls;
  clearElHeighlight(this.view, cls);
  return this;
};


// private
function replaceTextNode(textNode, reg, placing, div) {
  var data = textNode.data;
  if(!S.test(data)){
     data = data.replace(LT, '&lt;').replace(GT, '&gt;');
     if(reg.test(data)){
        if(!div)
          div = document.createElement('DIV');
        // html escape
        div.innerHTML = data.replace(reg, placing);
        // copy nodes
        var chs = div.childNodes,
            arr = [],
            fr = document.createDocumentFragment();
        
        // copy to array
        for(var i=0,len=chs.length;i<len;i++)
          arr[i] = chs[i];
        
        for(i=0;i<len;i++)
          fr.appendChild(arr[i]);
        
        textNode.parentNode.replaceChild(fr, textNode);
     }
  }
}

// private
function heighlightEl(el, reg, placing, div){
    var chs = el.childNodes, 
        arr = [], i, len, nd;
      
      // copy to array
      for(i=0,len=chs.length;i<len;i++){
        if(!IGNORE.test( chs[i].tagName ))
          arr.push(chs[i]);
      }
      
      for(i=0,len=arr.length;i<len;i++){
        nd = arr[i];
        // textnode
        if(nd.nodeType === 3){
          try { 
            replaceTextNode(nd, reg, placing, div);
          }catch(e){}
        }else arguments.callee(nd, reg, placing, div);
      }
}


// private
function clearElHeighlight(el, cls) {
  var chs = el.childNodes, 
      arr = [], i, len, nd, t;
      
  // copy to array
  for(i=0,len=chs.length;i<len;i++){
    if(!IGNORE.test( chs[i].tagName ))
    arr.push(chs[i]);
  }

  for(i=0,len=arr.length;i<len;i++){
    nd = arr[i];
    t = nd.nodeType;
    // textnode
    if(t === 3)
      continue;
    // span
    if(t === 1 && nd.tagName === 'SPAN' && nd.className === cls){
      // merge text nodes
      var textNode = nd.childNodes[0], 
          p        = nd.parentNode,
          pre      = nd.previousSibling,
          nxt      = nd.nextSibling;
      
      if(pre && pre.nodeType === 3){
        p.removeChild(pre);
        textNode.data = pre.data + textNode.data;
      }
      
      if(nxt && nxt.nodeType === 3){
        p.removeChild(nxt);
        textNode.data = textNode.data + nxt.data;
      }

      p.replaceChild(textNode, nd);
    }else arguments.callee(nd, cls);
  }
}

entry.cls = 'g-heighlight';

})(CC.Base.prototype);