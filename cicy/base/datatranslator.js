/**
 * UI容器只加载符合一定格式的子项数据，这个格式为{title:'...'}，在通过情况下，数据从后台加载进来，并不是UI容器可接受的格式类型，
 * 些时可运用本类将特定类型的数据数组转换成适合UI加载的数据数组。
 * 例如，可将一单纯数组数据['a', 'b', 'c']，转换为[{title:'a'}, {title:'b'}, {title:'c'}]。
 * 在容器的connectionProvider里设置reader属性指明运用的转换器即可，不必手动处理.
 */
CC.util.DataTranslator = {
  // private
  trans : {
    array : {
      /**
       * 注意:本方法会直接往传入的items里更新数据。
       */
      read : function(items, ct){
        for(var i=0,len=items.length;i<len;i++){
          items[i] = {title:items[i]};
        }
        return items;
      }
    },

/**
 * 数据格式为
   ['col a',  'col b', ['col c','cell_data',...], 'row_attribute', ...],
   ['data a', '..',    ['title', '...', '...'],    '..']
 */
    gridmaptranslator : {
       read : function(rows, ct){
         var cols = ct.grid.header.children,
             idxMap = {}, 
             dataIdx = 0, i, len;  
         
         for(i=0,len=cols.length;i<len;i++){
           if(cols[i].dataCol){
             idxMap[cols[i].id] = dataIdx;
             dataIdx++;
           }
         }
         
         var def = rows.shift(), newRows = [], k;
         
         if(def){
           for(i=0,len=def.length;i<len;i++){
             k = def[i];
             // [a, b, [key, v1, v2]]
             if(CC.isArray(k)){
               k[0] = idxMap[k[0]];
               k._isa = true;
             }
             else if(idxMap[k] !== undefined){
               // if index found
               // key -> index
               def[i] = idxMap[k];
             }
           }
  
           // maybe def status:['id', 3, 0, 2, 1]
           var len2, 
               row, 
               isIdx, 
               colIdx,
               arr, j, len3, cell;
  
           for(i=0;i<len;i++){
             colIdx = def[i];
             isIdx = typeof colIdx === 'number';
             for(var k=0,len2=rows.length;k<len2;k++){
               row = newRows[k];
               
               if(!row)
                  row = newRows[k] = {array:[]};
               
               if(isIdx) {
                 row.array[colIdx] = {title:rows[k][i]};
               }else if(colIdx._isa){
                 arr = rows[k][i];
                 cell = row.array[colIdx[0]] = {title:arr[0]};
                 for(j=1,len3=arr.length;j<len3;j++)
                   cell[colIdx[j]] = arr[j];
               }else {
                 // row attributes
                 row[colIdx] = rows[k][i];
               }
             }
           }
         }
         return newRows;
       }
    },

    gridarraytranslator : {
      read : function(rows){
        var arr = CC.util.DataTranslator.get('array');
        for(var i=0,len=rows.length;i<len;i++){
          rows[i] = {array:arr.read(rows[i])};
        }
        return rows;
      }
    }
  },
  
  reg : function(key, trans){
    this.trans[key] = trans;
    return this;
  },
  
  get : function(key){
    return this.trans[key];
  }
};