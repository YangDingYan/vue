/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

/* 从 scripts/config.js 中可以识别出本文件是 [runtime + compiler] 版本的 [入口] */

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

//? 重新定义$mount,为包含编译器和不包含编译器的版本提供不同封装，最终调用的是缓存原型上的$mount方法
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  //! 确定挂载的DOM元素,这个DOM需要保证不能为html，body这类根节点
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  //? 需要编译 or 不需要编译
  //? render选项不存在，代表是template模板的形式，此时需要进行模板的编译过程
  if (!options.render) {
    let template = options.template
    if (template) {
      //* 针对[字符串模板]和[选择符]匹配模板
      if (typeof template === 'string') {
        //* 选择符匹配模板，以'#'为前缀的选择器
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) { //* 元素节点型 
        //* 把指定挂载节点下的子html字符串取出: innerHTML属性设置或返回表格行的开始和结束标签之间的HTML
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) { //* 如果没有传入template模板，则默认以el元素所属的根节点作为基础模板
      //? 这种情况最多了
      template = getOuterHTML(el)
    }
    //? 在此之前，是对template合法性校验 => 旨在构造形式成 options.template = '<div>...</div>' [一定是该形式]
    //! 开始-模板编译
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      //? 源码中对 编译器 的设计挺复杂的
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  //! 挂载DOM => Tree上
  //? 无论是template模板还是手写render函数最终调用缓存的$mount方法
  //* 用当前活跃的 vm对象this 来执行挂载 ==> 其实就是挂载当前的实例
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
//* 当vm里没有template属性时, 默认使用el => template位置, 从这里获取.
function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    // outerHTML属性获取描述元素（包括其后代）的【序列化HTML片段】。它也可以设置为用从给定字符串解析的节点替换元素
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue

/*
1. innerHTML 和 outerHTML有什么区别
（1）innerHTML:
  从对象的起始位置到终止位置的全部内容, [不包括]HTML标签。
（2）outerHTML:
  除了包含innerHTML的全部内容外, [还包含]对象标签本身。
2.
*/