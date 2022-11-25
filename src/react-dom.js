import { createFiber } from './ReactFiber.js'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop.js'

const updateContainer = (element, container) => {
  const { containerInfo } = container
  const fiber = createFiber(element, {
    type: containerInfo.nodeName.toLowerCase(),
    stateNode: containerInfo,
  })
  // 初次渲染
  scheduleUpdateOnFiber(fiber)
}

class ReactDOMRoot {
  constructor(internalRoot) {
    this._internalRoot = internalRoot
  }

  render(children) {
    const root = this._internalRoot
    updateContainer(children, root)
  }
}

export const createRoot = container => {
  const root = { containerInfo: container }

  return new ReactDOMRoot(root)
}
