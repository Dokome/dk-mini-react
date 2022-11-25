import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostTextComponent,
  updateHostComponent,
} from './ReactFiberReconciler.js'
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags.js'
import { Placement } from './utils.js'

// work in progress 当前正在工作中的 fiber
let wip = null
let wipRoot = null

// 初次渲染或更新
export const scheduleUpdateOnFiber = fiber => {
  wip = fiber
  wipRoot = fiber
  requestIdleCallback(workLoop)
}

export const performUnitOfWork = () => {
  const { tag } = wip
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip)
      break
    case HostText:
      updateHostTextComponent(wip)
      break
    case FunctionComponent:
      updateFunctionComponent(wip)
      break
    case ClassComponent:
      updateClassComponent(wip)
      break
    case Fragment:
      updateFragmentComponent(wip)
      break
    default:
      break
  }

  if (wip.child) {
    return (wip = wip.child)
  }

  let next = wip

  while (next) {
    if (next.sibling) {
      return (wip = next.sibling)
    }

    next = next.return
  }

  wip = null
}

export const workLoop = IdleDeadline => {
  while (wip && IdleDeadline.timeRemaining() > 0) {
    performUnitOfWork()
  }

  if (!wip && wipRoot) {
    commitRoot()
  }
}

const getParentNode = wip => {
  let temp = wip

  while (temp) {
    if (temp.stateNode) {
      return temp.stateNode
    }
    temp = temp.return
  }
}

export const commitWorker = wip => {
  if (!wip) {
    return
  }

  // 提交自己
  // const parentNode = wip.return.stateNode
  const parentNode = getParentNode(wip.return)
  const { flags, stateNode } = wip
  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode)
  }

  // 提交子节点
  commitWorker(wip.child)

  // 提交兄弟节点
  commitWorker(wip.sibling)
}

// 提交
export const commitRoot = () => {
  commitWorker(wipRoot)
  wipRoot = null
}
