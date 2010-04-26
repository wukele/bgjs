(function(){
var CC = window.CC;
/**
 * 缓存类.
 * 数据结构为:
 * Cache[key] = [dataObjectArray||null, generator];
 * dataObjectArray[0] = 预留位,保存该key数据最大缓存个数, 默认为5.
 * generator = 生成数据回调
 * @name CC.Cache
 * @class 缓存类
 * @singleton
 */
CC.Cache =
   /**@lends CC.Cache */
   {

    /**@config {Number} MAX_ITEM_SIZE 某类设置的最大缓存数量.*/
    MAX_ITEM_SIZE: 5,

    /**@private 获取缓存数据的回调函数.*/
    callbacks: [],
/**
 * 注册数据产生方式回调函数,可重复赋值,函数返回键对应的数据.
 * @param {Object} key
 * @param {Function} callback
 * @param {Number} [max] 缓存该数据的最大值
 */
    register: function(k, callback, max) {
       if(!this[k])
        this[k] = [null, callback];
       else this[k][1] = callback;

       if(max !== undefined)
        this.sizeFor(k, max);
    }
    ,
/**
 * 根据键获得对应的缓存数据.
 * @param {String} key
 * @return data 或 null
 */
    get: function(k) {
        var a = this[k];
        if(a === undefined)
            return null;
        var b = a[1];
        a = a[0];

        if(a === null){
          return b();
        }
        //0位预留
        if(a.length > 1)
            return a.pop();
        if(b)
            return b();

        return null;
    }
    ,
/**
 * 缓存键值数据.
 * @param {Object} key
 * @param {Object} value
 */
    put: function(k, v) {
        var a = this[k];
        if(!a){
            this[k] = a = [[this.MAX_ITEM_SIZE, v]];
            return;
        }
        var c = a[0];
        if(!c)
          a[0] = c = [this.MAX_ITEM_SIZE];

        if (c.length - 1 >= c[0]) {
            return ;
        }

        c.push(v);
    },

/**
 * 移除缓存.
 * @param {Object} key 键值
 */
    remove : function(k){
      var a = this[k];
      if(a){
        delete this[k];
      }
    },
/**
 * 设置指定键值缓存数据的最大值.
 * @param {Object} key
 * @param {Number} max
 */
    sizeFor : function( k, max ) {
        var a = this[k];
        if(!a)
          this[k] = a = [[]];
        if(!a[0])
          a[0] = [];
        a[0][0] = max;
    }
};

/**
 * 缓存DIV结点,该结点可方便复用其innerHTML功能.
 */
CC.Cache.register('div', function() {
    return CC. $C('DIV');
}
);
})();