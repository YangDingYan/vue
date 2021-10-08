function Vue(options) {
    this._options = options
}

initMixin(Vue);

function initMixin(Vue) {
    Object.defineProperty(Vue.prototype, '$data', {
        get: function () {
            return this._data;
        }
    })
    Vue.prototype.$props = undefined
}

const vueDemo = new Vue({
    
})

console.log(vueDemo)