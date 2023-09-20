/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  {/* 看这里，定义了默认Vue.options的占位属性，并在其他地方进行预初始化。 主要会参与到组件实例化时的-合并选项中
    Vue.options = { 
      components: { keepAlive:{}, Transition:{}, TransitionGroup:{} },
      directives: { model:{ inserted:f, componentUpdated:f }, show:{ bind:f, update:f, unbind:f } },
      filters: {}.
      _base
    }
  */}
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  {/*这一步是注册了 `Vue.component` ,`Vue.directive` 和 `Vue.filter` 三个方法，
  上面不是有 `Vue.options.components` 等空对象吗，
  这三个方法的作用就是把注册的组件放入对应的容器中。 
  显然可知该三方法为全局api*/}
  initAssetRegisters(Vue)
}
