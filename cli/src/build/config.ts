import { PageManagerPlugin } from "../plugins/PageManager";
import { ProjectCliPlugin } from "../plugins/ProjectCli";
const appJSON = require("../../../workspace/app.json");

import { Configuration } from "webpack";
export const webpackConfig: Configuration = {
  plugins: [new ProjectCliPlugin(), new PageManagerPlugin(appJSON)]
};
