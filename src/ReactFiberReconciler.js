import { createFiber } from './ReactFiber.js'
import { isArray, isStringOrNumber, Update, updateNode } from './utils.js'
import { renderWithHooks } from './hooks.js'

// 节点复用的条件
const sameNode = (a, b) => {
  return a && b && a.type === b.type && a.key === b.key
}

// 协调 diff
const reconcileChildren = (wip, children) => {
  if (isStringOrNumber(children)) {
    return
  }

  const newChildren = isArray(children) ? children : [children]

  //  oldFiber 的头节点
  let oldFiber = wip.alternate?.child
  let previousNewFiber = null

  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]

    if (newChild == null) {
      continue
    }

    const newFiber = createFiber(newChild, wip)
    const same = sameNode(newFiber, oldFiber)

    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      })
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (previousNewFiber === null) {
      wip.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }
}

export const updateFunctionComponent = wip => {
  renderWithHooks(wip)

  const { props, type } = wip
  const children = type(props)

  reconcileChildren(wip, children)
}

export const updateHostComponent = wip => {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type)
    // 处理属性值
    updateNode(wip.stateNode, {}, wip.props)
  }

  reconcileChildren(wip, wip.props.children)
}

export const updateClassComponent = wip => {
  const { props, type } = wip
  const instance = new type(props)
  const children = instance.render()

  reconcileChildren(wip, children)
}

export const updateFragmentComponent = wip => {
  const { props } = wip
  reconcileChildren(wip, props.children)
}

export const updateHostTextComponent = wip => {
  wip.stateNode = document.createTextNode(wip.props.children)
}
