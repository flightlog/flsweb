var minimist = require('minimist');

var source = minimist(process.argv.slice(2))["_"][0];
var dest = minimist(process.argv.slice(2))["_"][1];
var fs = require('fs-extra');

if(source && dest) {
    console.log("copying '" + JSON.stringify(source) + "' to '" + dest + "'");
    fs.copy(source, dest, function (err) {
        if (err) return console.error(err);
        console.log("success!");
    });
}