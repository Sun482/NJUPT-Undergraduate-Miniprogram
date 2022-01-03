import createBasicFiles from "./utils/createBasicFiles.mjs";
import createPages from "./utils/createPages.mjs";
import runBuildInRaxPage from './utils/runBuildInRaxPage.mjs'
import handleError from "./utils/handleError.mjs";
import copyNpmPackage from "./utils/copyNpmPackage.mjs"

try {
  createBasicFiles().then(() => createPages()).then(() => {
    runBuildInRaxPage()
    copyNpmPackage()
  })
} catch (error) {
  handleError(error, '编译出错')
}

