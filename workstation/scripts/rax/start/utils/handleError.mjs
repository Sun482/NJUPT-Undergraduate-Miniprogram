export default (err, message) => {
  console.log(message);
  console.error(err);
  process.exit(1);
};
