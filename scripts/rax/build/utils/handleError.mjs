import { rm } from "fs/promises";

export default (err, message) => {
  console.log(message);
  console.error(err);
  rm('dist', { recursive: true, force: true}).then(() => {
    process.exit(1);
  })
};
