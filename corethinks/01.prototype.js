/**
 * 特性：在构造函数的原型上使用「Object.defineProperty + getter」定义属性后，
 *      该属性会被直接复制到实例化对象上
 */
function Vue(options) {
    this._options = options
    this._data = (options && options.data) ? options.data :'Vue构造函数数据1'
}

initMixin(Vue);

function initMixin(Vue) {
    Vue.noExtendToVm = { // 该属性并不会被实例继承，
        directives: []
    }
    Object.defineProperty(Vue.prototype, '$data', {
        get: function () {
            return this._data; 
            // return '1111';
            /**
             * ! 注意这里的「this」的指向，参看MDN上关于getter的解释
             * ! https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
             */
        }
    })
    Vue.prototype.$props = undefined
}
/*
    构造函数在创建完成后，未实例化前时，constructor内添加的属性均不会在构造函数上可见，
    但示例的initMixin方法中对原型的操作均执行成功了，并且此时$data、$props均为undefined
*/
console.log(window)
/*

*/
const vueDemo1 = new Vue({
    data: 'Vue实例Demo1数据'
})

const vueDemo2 = new Vue({
    data: 'Vue示例Demo2数据'
})

console.log(vueDemo1)
console.log(vueDemo2)