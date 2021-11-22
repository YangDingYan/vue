/* @flow */
//! 浏览器中_patch_方法的构建
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })


/*
* ????:: VNode核心中的基础能力：ref + directives
baseModules = [
    ref,
    directives
]

!定义了模块的钩子函数
platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
]

!将[真实平台browser]操作dom对象的方法合集
nodeOps = {
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
}
 */