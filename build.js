/**
 * This file is part of the @iconify/react package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const fs = require('fs');
const path = require('path');
const tools = require('@iconify/json-tools');

/*
    Configuration
 */

// Log progress
let log = true;

// Cleanup
let doCleanup = true;

// Validate prefix
let validatePrefix = true;

// Ignore errors
let ignoreErrors = false;

// Source directory
let sourceDir = null;

// Target directory
let targetDir = __dirname;

// List of allowed files. If null, directory will be scanned
let allowFiles = null;

// List of prefixes to allow and skip
let allowSets = null,
    skipSets = null;

/**
 * Recursively create directory
 *
 * @param path
 */
const mkdir = path => {
    let dirs = typeof path === 'string' ? path.split('/') : path,
        dir;

    if (dirs.length) {
        dir = '';
        dirs.forEach(part => {
            dir += part;
            if (dir.length) {
                try {
                    fs.mkdirSync(dir, 0o755);
                } catch (err) {
                }
            }
            dir += '/';
        });
    }
};

/**
 * Clean up directory
 *
 * @param {string} dir Directory to remove
 * @param {boolean} [includeDir] True if directory should be removed as well
 * @return {*} Error object or number of deleted files
 */
const cleanup = (dir, includeDir) => {
    let counter = 0,
        errors = [];

    function rec(extra) {
        let ignored = false,
            files;

        try {
            files = fs.readdirSync(dir + extra);
        } catch (err) {
            errors.push({
                error: err,
                filename: dir + extra,
                type: 'readdir'
            });
            return;
        }

        files.forEach(file => {
            let filename = dir + extra + '/' + file,
                stats = fs.lstatSync(filename);

            if (stats.isDirectory()) {
                if (rec(extra + '/' + file)) {
                    // true returned - directory has ignored files
                    ignored = true;
                    return;
                }

                // Try to remove directory
                try {
                    fs.rmdirSync(filename);
                } catch (err) {
                    errors.push({
                        error: err,
                        filename: filename,
                        type: 'dir'
                    });
                    ignored = true;
                }
                return;
            }

            if (stats.isFile() || stats.isSymbolicLink()) {
                // Try to remove file
                try {
                    fs.unlinkSync(filename);
                    counter ++;
                } catch (err) {
                    errors.push({
                        error: err,
                        filename: filename,
                        type: 'file'
                    });
                    ignored = true;
                }
                return;
            }

            errors.push({
                filename: filename,
                type: 'unknown'
            });
        });

        return ignored;
    }

    if (!rec('') && includeDir) {
        try {
            fs.rmdirSync(dir);
            counter ++;
        } catch (err) {
            errors.push({
                error: err,
                filename: dir,
                type: 'dir'
            });
        }
    }

    return errors.length ? errors : counter;
};

/**
 * Check if directory exists
 *
 * @param {string} dir
 * @return {boolean}
 */
const isDir = dir => {
    try {
        let stat = fs.statSync(dir);
        return stat.isDirectory();
    } catch (err) {
        return false;
    }
};

/**
 * Convert object to string
 *
 * @param data
 * @return {string}
 */
const stringify = data => JSON.stringify(data, null, '\t');

/**
 * Export collection
 *
 * @param collection
 * @return {boolean}
 */
const exportCollection = (collection, dir) => {
    let icons = 0,
        aliases = 0;

    /**
     * Export icon
     *
     * @param name
     * @param data
     */
    const exportIcon = (name, data) => {
        if (data === null) {
            throw new Error('Got null for icon ' + name);
        }

        data = Object.assign({}, data);
        delete data.parent;
        Object.keys(data).forEach(key => {
            if (key.slice(0, 1) === '_') {
                delete data[key];
            }
        });

        let content = stringify(data);
        content = 'export default ' + content + ';\n';
        fs.writeFileSync(dir + '/' + name + '.js', content, 'utf8');
    };

    /**
     * Export alias
     *
     * @param name
     * @param data
     */
    const exportAlias = (name, data) => {
        if (data === null) {
            throw new Error('Got null for alias ' + name);
        }

        data = Object.assign({}, data);

        let parent = data.parent;

        const exportSimpleAlias = () => {
            let content = 'import data from \'./' + parent + '\';\n';
            content += 'export default data;\n';
            fs.writeFileSync(dir + '/' + name + '.js', content, 'utf8');
        };

        const exportComplexAlias = () => {
            let content = 'import data from \'./' + parent + '\';\n';
            content += '\nlet alias = Object.assign({}, data);\n';

            let keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                switch (key) {
                    case 'hFlip':
                    case 'vFlip':
                        content += 'alias.' + key + ' = !alias.' + key + ';\n';
                        break;

                    case 'rotate':
                        content += 'alias.' + key + ' = (alias.' + key + ' ? alias.' + key + ' : 0) + ' + data[key] + ';\n';
                        break;

                    case 'width':
                    case 'height':
                    case 'left':
                    case 'top':
                    case 'inlineTop':
                    case 'inlineHeight':
                    case 'verticalAlign':
                        content += 'alias.' + key + ' = ' + data[key] + ';\n';
                        break;

                    default:
                        return false;
                }
            }

            content += '\nexport default alias;\n';
            fs.writeFileSync(dir + '/' + name + '.js', content, 'utf8');
            return true;
        };

        delete data.parent;

        if (!Object.keys(data).length) {
            // Alias without modifications
            exportSimpleAlias();
            return true;
        }

        return exportComplexAlias();
    };


    // Export icons
    Object.keys(collection.items.icons).forEach(icon => {
        exportIcon(icon, collection.getIconData(icon, false));
        icons ++;
    });

    // Export aliases
    if (collection.items.aliases !== void 0) {
        Object.keys(collection.items.aliases).forEach(icon => {
            if (!exportAlias(icon, collection.items.aliases[icon])) {
                // Failed to export as alias - export as icon
                exportIcon(icon, collection.getIconData(icon, false));
            }
            aliases ++;
        });
    }

    if (log) {
        console.log('[' + collection.prefix() + '] Exported ' + icons + ' icons' + (aliases ? ', ' + aliases + ' aliases.' : ''));
    }
    return true;
};

/*
    Resolve command line parameters
 */
let args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
    let dir;

    switch (args[i]) {
        case '--skip':
            // Skip packages
            if ((++ i) >= args.length) {
                throw new Error('Missing list of prefixes for ' + args[i - 1] + '\nCorrect usage: node build ' + args[i - 1] + ' fa-brands,mdi-light,vaadin');
            }
            args[i].toLowerCase().split(',').forEach(prefix => {
                if (skipSets === null) {
                    skipSets = [];
                }
                skipSets.push(prefix.trim());
            });
            break;

        case '--filter':
        case '--prefix':
        case '--prefixes':
            // Filter packages
            if ((++ i) >= args.length) {
                throw new Error('Missing list of prefixes for ' + args[i - 1] + '\nCorrect usage: node build ' + args[i - 1] + ' fa-solid,mdi-light,ant-design');
            }
            args[i].toLowerCase().split(',').forEach(prefix => {
                if (allowSets === null) {
                    allowSets = [];
                }
                allowSets.push(prefix.trim());
            });
            break;

        case '--file':
        case '--files':
            // Filter packages
            if ((++ i) >= args.length) {
                throw new Error('Missing list of files for ' + args[i - 1] + '\nCorrect usage: node build ' + args[i - 1] + ' fa.json,mdi.json');
            }
            args[i].toLowerCase().split(',').forEach(file => {
                if (allowFiles === null) {
                    allowFiles = [];
                }
                allowFiles.push(file.trim());
            });
            break;

        case '--package':
        case '--module':
            // Import from custom package instead of @iconify/json
            if ((++ i) >= args.length) {
                throw new Error('Missing package name for ' + args[i - 1] + '\nCorrect usage: node build ' + args[i - 1] + ' custom-package --dir json');
            }

            // Check if its a package name
            let parts = args[i].split('/');
            if (parts.length === 1 || (parts.length === 2 && parts[0].slice(0, 1) === '@')) {
                // Resolve package.json to find root directory of that package
                sourceDir = path.dirname(require.resolve(args[i] + '/package.json'));
            } else {
                // Resolve as file, extract directory from it
                sourceDir = path.dirname(require.resolve(args[i]));

                // Check if last parameter points to JSON file
                if (parts[parts.length - 1].split('.').pop() === 'json') {
                    if (allowFiles === null) {
                        allowFiles = [];
                    }
                    allowFiles.push(parts[parts.length - 1]);
                }
            }
            break;

        case '--dir':
        case '--source':
            // Import from directory inside package
            // Should be added after --package
            if ((++ i) >= args.length) {
                throw new Error('Missing directory name for ' + args[i - 1] + '\nCorrect usage (for files from custom-package): node build --package custom-package ' + args[i - 1] + ' json\nCorrect usage (for files in current working directory): node build ' + args[i - 1] + ' json');
            }
            if (sourceDir === null) {
                // Use current working directory
                sourceDir = '';
            }
            dir = args[i].replace('{dir}', __dirname);
            if (dir.slice(0, 1) === '/' && sourceDir !== '') {
                dir = dir.slice(1);
            }
            if (dir.slice(-1) === '/') {
                dir = dir.slice(0, dir.length - 1);
            }
            if (!dir.length) {
                // Empty directory
                throw new Error('Invalid directory name for ' + args[i - 1]);
            }
            sourceDir += (sourceDir === '' ? '' : '/') + dir;
            break;

        case '--target':
            // Target directory
            if ((++ i) >= args.length) {
                throw new Error('Missing directory name for ' + args[i - 1] + '\nCorrect usage: node build ' + args[i - 1] + ' output-dir');
            }
            dir = args[i].replace('{dir}', __dirname);
            if (dir.slice(-1) === '/') {
                dir = dir.slice(0, dir.length - 1);
            }
            if (!dir.length) {
                // Empty directory
                throw new Error('Invalid directory name for ' + args[i - 1]);
            }
            targetDir = dir;
            break;

        case '--no-cleanup':
            doCleanup = false;
            break;

        case '--cleanup':
            doCleanup = true;
            break;

        case '--ignore-prefix':
            validatePrefix = false;
            break;

        case '--validate-prefix':
            validatePrefix = true;
            break;

        case '--ignore-errors':
            ignoreErrors = true;
            break;

        case '--silent':
        case '--no-log':
            log = false;
            break;

        case '--verbose':
        case '--log':
            log = true;
            break;

        default:
            throw new Error('Unknown parameter ' + args[i]);
    }
}

if (sourceDir === null) {
    // Missing source
    throw new Error('Missing source.\nTo parse JSON files from Iconify JSON use: node build --package @iconify/json --dir json\nTo parse JSON files from custom directory use: node build --source ./path/to/directory');
}

/*
    Find all icon sets
 */
let files = {};
if (allowFiles !== null) {
    // Use only allow files
    allowFiles.forEach(file => {
        let filename = path.resolve(sourceDir, file),
            prefix = file.split('/').pop().split('.').shift();

        try {
            let stats = fs.lstatSync(filename);
            if (!stats.isFile()) {
                return;
            }
        } catch (err) {
            // No such file?
            return;
        }

        files[prefix] = filename;
    });
} else {
    // Scan directory
    fs.readdirSync(sourceDir).forEach(file => {
        let parts = file.split('.');
        if (parts.length !== 2 || parts.pop() !== 'json') {
            // File must be in prefix.json format
            return;
        }

        let prefix = parts.shift();
        if (skipSets !== null && skipSets.indexOf(prefix) !== -1) {
            // Skip
            return;
        }
        if (allowSets !== null && allowSets.indexOf(prefix) === -1) {
            // Not allowed
            return;
        }

        files[prefix] = sourceDir + '/' + file;
    });
}

if (!Object.keys(files).length) {
    if (ignoreErrors) {
        return;
    }
    throw new Error('No JSON files to parse.');
}

/*
    Load and export all collections
 */
let parsed = {};
Object.keys(files).forEach(prefix => {
    let source = files[prefix],
        collection = new tools.Collection(prefix);

    // Load collection
    if (!collection.loadFromFile(source)) {
        if (ignoreErrors) {
            return;
        }
        throw new Error('Error loading collection from ' + source);
    }

    if (collection.prefix() !== prefix) {
        if (validatePrefix) {
            if (ignoreErrors) {
                return;
            }
            throw new Error('Collection loaded from ' + source + ' has prefix "' + collection.prefix() + '", expected "' + prefix + '"');
        }
        prefix = collection.prefix();
    }

    // Clean up or create directory
    let target = targetDir + '/' + prefix;
    if (parsed[prefix] === void 0) {
        parsed[prefix] = true;
        if (doCleanup) {
            if (isDir(target)) {
                cleanup(target, false);
            }
        }
        mkdir(target);
    }

    // Write all files
    exportCollection(collection, target);
});