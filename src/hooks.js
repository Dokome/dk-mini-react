import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop.js'

let currentlyRenderingFiber = null
let workInProgressHook = null

const updateWorkInProgressHook = () => {
  let hook = {}

  const current = currentlyRenderingFiber.alternate

  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next
    } else {
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState
    }
  } else {
    // 初次渲染
    hook = {
      memorizedState: null,
      next: null,
    }
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook
    } else {
      // 头 hook
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook
    }
  }

  return hook
}

export const renderWithHooks = wip => {
  currentlyRenderingFiber = wip
  currentlyRenderingFiber.memorizedState = null
  workInProgressHook = null
}

const dispatchReducerAction = (fiber, hook, reducer, action) => {
  hook.memorizedState = reducer
    ? reducer(hook.memorizedState, action)
    : typeof action === 'function'
    ? action(hook.memorizedState)
    : action
  fiber.alternate = { ...fiber }
  fiber.sibling = null
  scheduleUpdateOnFiber(fiber)
}

export const useReducer = (reducer, initalState) => {
  const hook = updateWorkInProgressHook()

  if (!currentlyRenderingFiber.alternate) {
    // 初次渲染
    hook.memorizedState = initalState
  }

  // const dispatch = () => {
  //   hook.memorizedState = reducer(hook.memorizedState)
  //   currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber }
  //   scheduleUpdateOnFiber(currentlyRenderingFiber)
  // }

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  )

  return [hook.memorizedState, dispatch]
}

export const useState = initalState => useReducer(null, initalState)
