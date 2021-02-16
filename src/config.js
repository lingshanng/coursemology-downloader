const fs = require('fs');
const yargs = require('yargs');

const CONFIG_FILE  = 'config/CONFIG.txt';
const TIMEOUT = 5000;

const argv = yargs
      .option('silent', {
          alias: 's',
          description: 'Runs the script silently',
          type: 'boolean'
      })
      .option('timeout', {
          alias: 't',
          description: 'Timeout for each request in ms, defaults to ' + TIMEOUT,
          type: 'integer'
      })
      .argv;

function read(property) {
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8').toString();
        const propertyLine = data.split('\n').filter(line => line.split('=')[0].trim() === property)[0];
        const splitLine = propertyLine.split('=');
        splitLine.shift();
        const value = splitLine.join('=').trim();
        return value;
    } catch (e) {
        throw 'Could not read ' + property + ' from ' + CONFIG_FILE + ', terminating.';
    }
}

function readEmail() {
    return read('email');
}

function readPassword() {
    return read('password');
}

function readPrint() {
    return !argv.silent;
}

function readTimeout() {
    return argv.timeout ? argv.timeout : TIMEOUT;
}

function readCourseId() {
    return read('course_id');
}

function readDirectoryPath() {
    return read('directory_path');
}

module.exports = {
    readEmail,
    readPassword,
    readPrint,
    readTimeout,
    readCourseId,
    readDirectoryPath
};
