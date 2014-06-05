var fs = require('fs'),
    is = require('is'),
    extend = require('extend'),
    i = 0,
    files = [];

process.argv.forEach(function(val, index, array) {
    if (i > 1) {
        files.push(JSON.parse(fs.readFileSync(val, {
            encoding: 'UTF8'
        })));
    }
    i++;
});

var out = files[0];

for (i = 1; i < files.length; i++) {
    out = extend(true, out, files[i]);
}

console.log(JSON.stringify(out, null, 4));
