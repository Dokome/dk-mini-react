import { FunctionComponent, HostComponent } from './ReactWorkTags.js'
import { isFn, isStr, Placement } from './utils.js'

export function createFiber(vnode, returnFiber) {
  const { type, key, props } = vnode

  const fiber = {
    /* 类型 */
    type,
    /* key */
    key,
    /* 属性 */
    props,
    /**
     * 不同类型的组件 stateNode 不同
     * 原生标签 dom 节点
     * class 实例
     * function null
     */
    stateNode: null,
    /* 第一个子 fiber */
    child: null,
    /* 下一个兄弟 fiber */
    sibling: null,
    /* 父 fiber */
    return: returnFiber,
    // 当前执行的操作
    flags: Placement,
    /* 记录节点在当前层级下的位置 */
    index: null,
  }

  if (isStr(type)) {
    fiber.tag = HostComponent
  } else if (isFn(type)) {
    // 函数组件和类组件的
    fiber.tag = FunctionComponent
  }

  return fiber
}
