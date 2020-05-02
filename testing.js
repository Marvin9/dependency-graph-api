const fs = require('fs');
const path = require('path');

const test = JSON.parse(fs.readFileSync('test.json', 'utf8'));

const initial = path.resolve(process.cwd(), '../open_source/Ignitus-client/src');

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

let ignored = 0;

const iterate = pth => {
  if (fs.lstatSync(pth).isDirectory()) {
    const chunks = fs.readdirSync(pth);

    chunks.forEach(chunk => iterate(`${pth}/${chunk}`));
    return;
  }

  if (!has(test, pth)) {
    console.log(pth);
    ignored++;
  }
};

iterate(initial);

console.log(`Ignored : ${ignored}`);