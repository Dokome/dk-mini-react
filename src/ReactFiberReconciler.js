import { createFiber } from './ReactFiber.js'
import { isArray, isStringOrNumber, updateNode } from './utils.js'

// 协调 diff
const reconcileChildren = (wip, children) => {
  if (isStringOrNumber(children)) {
    return
  }

  const newChildren = isArray(children) ? children : [children]

  let previousNewFiber = null
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]

    if (newChild == null) {
      continue
    }

    const newFiber = createFiber(newChild, wip)

    if (previousNewFiber === null) {
      wip.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }
}

export const updateFunctionComponent = wip => {
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
