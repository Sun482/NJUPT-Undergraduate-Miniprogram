const { readdir, rm, readFile, writeFile, stat } = require("fs/promises");
const { createWriteStream } = require("fs");
const { Duplex } = require("stream");
const CssShortener = require("css-shortener-2");
const CleanCSS = require("clean-css");
const { PurgeCSS } = require("purgecss");

const handleError = (err, message) => {
  console.log(message);
  console.error(err);
  rm("dist", { recursive: true, force: true }).then(() => {
    process.exit(1);
  });
};

const purgeCSSCleaner = new PurgeCSS();

const purgeCSSFn = (wxssPath, wxmlPath) =>
  new Promise((resolve) => {
    purgeCSSCleaner
      .purge({
        content: [wxmlPath],
        css: [wxssPath],
      })
      .then((data) => {
        resolve(data[0].css, wxssPath);
      })
      .catch((err) => {
        handleError(err, "删除无用的css时出错");
      });
  });

const cssCleaner = new CleanCSS({
  level: {
    2: {
      restructureRules: true,
    },
  },
});

const cleanCSSFn = async (wxssData) => {
  try {
    const data = cssCleaner.minify(wxssData).styles;
    return data;
  } catch (error) {
    handleError(error, "压缩wxss时出错");
  }
};

const minifyCSSClassName = (wxssData, wxssPath, wxmlPath) =>
  new Promise(async (resolve) => {
    const cleanCSSContent = await cleanCSSFn(wxssData);
    const cs = new CssShortener();
    const wxssStream = new Duplex();
    wxssStream.push(Buffer.from(cleanCSSContent));
    wxssStream.push(null);
    wxssStream
      .pipe(cs.cssStream())
      .pipe(createWriteStream(wxssPath))
      .on("finish", () => {
        readFile(wxmlPath, "utf-8")
          .then((data) => {
            const wxmlStream = new Duplex();
            wxmlStream.push(Buffer.from(data));
            wxmlStream.push(null);
            wxmlStream
              .pipe(cs.htmlStream())
              .pipe(createWriteStream(wxmlPath))
              .on("finish", () => resolve());
          })
          .catch((err) => {
            handleError(err, `读取wxml出错，${wxmlPath}`);
          });
      });
  });

const findWXMLAndWXSSInFolder = (dirPath) => {
  const fileNameSet = new Set();
  readdir(dirPath)
    .then((files) => {
      files.forEach((fileName) => {
        if (/wxml$/.test(fileName)) {
          const prefix = fileName.replace(".wxml", "");
          if (files.includes(`${prefix}.wxss`)) {
            fileNameSet.add(prefix);
          }
        } else if (/wxss$/.test(fileName)) {
          const prefix = fileName.replace(".wxss", "");
          if (files.includes(`${prefix}.wxml`)) {
            fileNameSet.add(prefix);
          }
        } else if (/json$/.test(fileName)) {
          const filePath = `${dirPath}/${fileName}`;
          readFile(filePath, "utf-8").then((data) => {
            const jsonObj = JSON.parse(data);
            const jsonStr = JSON.stringify(jsonObj);
            writeFile(filePath, jsonStr, { flag: "w+" }).catch((err) => {
              handleError(err, `json压缩出错，${filePath}`);
            });
          });
        } else {
          const folderPath = `${dirPath}/${fileName}`;
          stat(folderPath).then((stats) => {
            if (stats.isDirectory()) {
              findWXMLAndWXSSInFolder(folderPath);
            }
          });
        }
      });
      fileNameSet.forEach((filePrefix) => {
        const wxssPath = `${dirPath}/${filePrefix}.wxss`;
        const wxmlPath = `${dirPath}/${filePrefix}.wxml`;
        purgeCSSFn(wxssPath, wxmlPath).then((cssContent) => {
          minifyCSSClassName(cssContent, wxssPath, wxmlPath);
        });
      });
    })
    .catch((err) => {
      handleError(err, `读取目录${dirPath}出错`);
    });
};

module.exports = ({ onHook }) => {
  rm("build", { recursive: true, force: true }).catch((err) => {
    handleError(err, "build文件夹删除失败");
  });
  rm("es", { recursive: true, force: true }).catch((err) => {
    handleError(err, "es文件夹删除失败");
  });
  rm("lib", { recursive: true, force: true }).catch((err) => {
    handleError(err, "lib文件夹删除失败");
  });
  onHook("after.build.compile", () => {
    findWXMLAndWXSSInFolder("dist/wechat-miniprogram");
  });
};
