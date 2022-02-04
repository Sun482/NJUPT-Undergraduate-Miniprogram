import * as copyPlugin from "copy-webpack-plugin";
import { PageManagerPlugin } from "../plugins/PageManager";
import { ProjectCliPlugin } from "../plugins/ProjectCli";
const appJSON = require("../../../workspace/app.json");
import * as path from "path";

import { Configuration } from "webpack";

export const webpackConfig: Configuration = {
  plugins: [new ProjectCliPlugin(), new PageManagerPlugin(appJSON)]
};
