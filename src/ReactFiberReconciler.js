// import { createFiber } from './ReactFiber.js'
import {
  /*  isArray, isStringOrNumber, Update, */ updateNode,
} from './utils.js'
import { renderWithHooks } from './hooks.js'
import { reconcileChildren } from './ReactChildFiber.js'

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
