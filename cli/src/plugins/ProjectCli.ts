const pluginName = "ProjectCliPlugin";
import { Compiler, WebpackPluginInstance } from "webpack";
export class ProjectCliPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.beforeRun.tap(pluginName, () => {
      console.log("✨  开始构建南邮小程序");
    });
    compiler.hooks.afterDone.tap(pluginName, () => {
      console.log("✨  成功构建南邮小程序");
      console.log("✨  快去微信开发者工具看看吧~");
    });
  }
}
