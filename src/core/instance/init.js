/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin(Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this //key: this 在 new Vue() 之后, 已经指代当前解析的实例对象了 「对象引用」
    // a uid 标记组件实例的个数(标识)
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    //!  options._isComponent的作用？  => ？暂时只需要知道我们自己开发的时候使用的组件，都不是 _isComponent
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      //key：mergeOptions主要做了一个关于 vm.$options的合并操作 
      //* 把构造函数[对象]上的options和创建组件传入的options合并在一起了 => 「组件实例上直接具有了全局某些属性，即全局directives之类的可以直接用了」
      //key: 因为全局的属性和方法是作为构造函数Vue的对象属性存在的，所以实例化的时候，vm自身和原型上都访问不到这些属性;只有Vue.xx能获取到
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    //key 知道渲染模板的时候上下文就是 vm 也就是 this 
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm  // 自身持有自身[引用类型哦]
    initLifecycle(vm) //* 生命周期的初始化工作, 初始化了很多变量。最主要是设置了父子组件间的引用关系「即新增了 $parent/$children 属性/值 来构建」 【Lifecycle】
    initEvents(vm) //* 注册事件。注意：这里注册的不是自己的，而是父组件在使用时，在模版上挂载的。因为很明显父组件的监听器才会注册到子组件身上     【Event】
    initRender(vm) //* render执行前的准备工作，并未真的开始执行。在此处-处理父子继承关系等
    callHook(vm, 'beforeCreate') //! 准备工作完成，接下来进入「create」阶段
    initInjections(vm) // resolve injections before data/props         【inject】
    initState(vm) //* 「options.props、methods、data、computed、watch」按顺序在这里初始化 
    //? [响应式系统]：和数据状态有关的几项，在构建时时有上述执行的[顺序]的 ？ 【reactivity】
    initProvide(vm) // resolve provide after data/props                【provide】
    callHook(vm, 'created') //! 「create」阶段完成

    /* istanbul ignore if -- 性能数据收集 */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    //* 根据有无el开始mount：显然，vm自身一定有$mount这个方法了
    //* 由于和 平台 有关, $mount在下述位置添加
    //? 参看 platforms/web/runtime/index.js 里的操作
    if (vm.$options.el) {
      console.log(`开始挂载了:实例vm-${this._uid}`)
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent(vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions(Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions(Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
