const fs = require('fs');
const path = require('path');


if (process.argv.length < 4) throw new Error('Provide arguments as a path');

const [,, relativePath, generatedGraph] = process.argv;

const initial = path.resolve(process.cwd(), relativePath);
const test = JSON.parse(fs.readFileSync(generatedGraph, 'utf8'));

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

let ignored = 0;

const iterate = pth => {
  if (fs.lstatSync(pth).isDirectory()) {
    const chunks = fs.readdirSync(pth);

    chunks.forEach(chunk => iterate(`${pth}/${chunk}`));
    return;
  }

  if (!has(test, pth) && (path.extname(pth) === '.js' || path.extname(pth) === '.ts' || path.extname(pth) === '.tsx' || path.extname(pth) === '.jsx')) {
    console.log(pth);
    ignored++;
  }
};

iterate(initial);

console.log(`Ignored : ${ignored}`);