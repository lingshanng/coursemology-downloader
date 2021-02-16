'use strict';

const path = require('path');
const os = require('os');

const { login } = require('./src/login');
const { exploreCourse } = require('./src/exploreCoursemologyMaterials');
const { exploreLocalCourse } = require('./src/exploreLocalDirectory');
const { compareCourses, coursePrintString } = require('./src/compareDirectories');
const { readPrint, readDirectoryPath } = require('./src/config');
const { downloadNewFoldersFilesInCourse, downloadFolder } = require('./src/downloader');

const DIRECTORY_PATH = path.join(os.homedir(), readDirectoryPath());
const PRINT = readPrint();

/* MAIN PROCESS */

async function main() {
    const cookies = await login();
    const courseMaterials = await exploreCourse(cookies);
    const localCourse = exploreLocalCourse(DIRECTORY_PATH);
    compareCourses(courseMaterials, localCourse);
    await downloadNewFoldersFilesInCourse(cookies, courseMaterials, DIRECTORY_PATH);

    const courseString = coursePrintString(courseMaterials);
    if (PRINT) console.log('\n' + courseString);
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log("Whoops, an error occurred. Here's some details:")
        console.log(e);
        process.exit(1);
    });
