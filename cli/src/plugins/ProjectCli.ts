const pluginName = "ProjectCliPlugin";
import { Compiler, WebpackPluginInstance } from "webpack";
export class ProjectCliPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tap(pluginName, () => {
      console.log("✨  开始构建南邮小程序");
    });
  }
}
