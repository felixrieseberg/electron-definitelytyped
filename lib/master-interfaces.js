'use strict'

const _ = require('lodash')

module.exports = (API, addToOutput) => {
  // Generate Main / Renderer process interfaces
  const CommonInterface = ['interface CommonInterface {']
  const MainInterface = ['interface MainInterface extends CommonInterface {']
  const RendererInterface = ['interface RendererInterface extends CommonInterface {']
  const ElectronMainAndRendererInterface = ['interface AllElectron {']
  const EMRI = {}

  const classify = (moduleName) => {
    switch (moduleName.toLowerCase()) {
      case 'session':
        return 'session'
      case 'nativeimage':
        return 'nativeImage'
      case 'webcontents':
        return 'webContents'
      default:
        return moduleName
    }
  }

  API.forEach((module, index) => {
    let TargetInterface
    const isClass = module.type === 'Class' || API.some((tModule, tIndex) => index !== tIndex && tModule.name.toLowerCase() === module.name.toLowerCase())
    const moduleString = `  ${classify(module.name)}: ${isClass ? 'typeof ' : ''}Electron.${_.upperFirst(module.name)}`
    if (!module.process) {
      // We must be a structure or something
      return
    }
    if (module.process.main && module.process.renderer) {
      TargetInterface = CommonInterface
    } else if (module.process.main) {
      TargetInterface = MainInterface
    } else if (module.process.renderer) {
      TargetInterface = RendererInterface
    }
    if (module.type === 'Structure') {
      TargetInterface = null
    }
    if (TargetInterface) {
      console.log(classify(module.name).toLowerCase(), EMRI[classify(module.name).toLowerCase()])
      if (!EMRI[classify(module.name).toLowerCase()]) {
        ElectronMainAndRendererInterface.push(moduleString)
        TargetInterface.push(moduleString)
      }
      EMRI[classify(module.name).toLowerCase()] = true
    }
  })

  CommonInterface.push('}')
  MainInterface.push('}')
  RendererInterface.push('}')
  ElectronMainAndRendererInterface.push('}')

  addToOutput([''])
  addToOutput(CommonInterface, ';')
  addToOutput(MainInterface, ';')
  addToOutput(RendererInterface, ';')
  addToOutput(ElectronMainAndRendererInterface, ';')
}
