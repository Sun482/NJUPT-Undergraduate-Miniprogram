import { webpack } from "webpack";

import { webpackConfig } from "./config";
const project = webpack(webpackConfig);
project.run((err, res) => {});
