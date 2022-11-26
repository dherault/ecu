import fs from 'node:fs'
import path from 'node:path'

import { allowedExtensions, appPath } from '../../configuration.js'

import addFile from '../add/addFile.js'
import addFileDependencies from '../add/addFileDependencies.js'
import { getNodesByRole } from '../index.js'

function buildFilesGraph() {
  traverseDirectories(appPath)

  getNodesByRole('File').forEach(fileNode => {
    addFileDependencies(fileNode)
  })
}

function traverseDirectories(rootPath: string) {
  fs.readdirSync(rootPath).forEach(fileName => {
    const filePath = path.join(rootPath, fileName)

    if (fs.statSync(filePath).isDirectory() && fileName !== 'node_modules') {
      traverseDirectories(filePath)
    }
    else {
      const extension = path.extname(filePath).slice(1)

      if (allowedExtensions.includes(extension)) {
        addFile(filePath)
      }
    }
  })
}

export default buildFilesGraph
