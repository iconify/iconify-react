"use strict";

const fs = require('fs');
const babel = require('@babel/core');

function fileExists(filename) {
    let stats;
    try {
        stats = fs.statSync(filename);
    } catch (e) {
        return false;
    }

    return true;
}

const rootDir = __dirname;
let presets = JSON.parse(fs.readFileSync(rootDir + '/.babelrc', 'utf8'));

try {
    fs.mkdirSync(rootDir + '/dist', 0o755);
} catch (err) {
}

['icon'].forEach(filename => {
    // Transpile .js file
    let source = rootDir + '/src/' + filename + '.js',
        target = rootDir + '/dist/' + filename + '.js';

    if (fileExists(source)) {
        let code = fs.readFileSync(source),
            result = babel.transform(code, presets);

        fs.writeFileSync(target, result.code, 'utf8');
        console.log('Transpiled', filename + '.js');
    }

    // Copy optional files
    ['.d.ts'].forEach(ext => {
        let source = rootDir + '/src/' + filename + ext,
            target = rootDir + '/dist/' + filename + ext;

        if (fileExists(source)) {
            fs.writeFileSync(target, fs.readFileSync(source, 'utf8'), 'utf8');
            console.log('Copied', filename + ext);
        }
    });
});

