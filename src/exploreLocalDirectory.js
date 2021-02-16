const path = require('path');
const fs = require('fs');

const { Course, Folder, File } = require('./directory');

const DUMMY_ID = '';

// Entry point for exploring the local directory
// Returns: a Course
function exploreLocalCourse(folderPath) {
    const localFoldersFiles = exploreLocalFoldersFiles(folderPath);
    const folders = localFoldersFiles['folders'];
    const course = new Course(DUMMY_ID, 'CS2040S');
    course.populateFolders(folders);
    return course;
}

// Returns: an array of Folders, and an array of Files
function exploreLocalFoldersFiles(folderPath) {
    const dirents = fs.readdirSync(folderPath, { withFileTypes: true })
    const folderNames = dirents
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    const fileNames = dirents
        .filter(dirent => !dirent.isDirectory())
        .map(dirent => dirent.name);

    const folders = folderNames.map(folderName => {
        return exploreLocalFolder(folderPath, folderName);
    });
    const files = fileNames.map(fileName => {
        const filePath = path.join(folderPath, fileName);
        return new File(fileName, filePath);
    });

    return { 'folders': folders, 'files': files };
}

// Returns: a Folder
function exploreLocalFolder(folderPath, folderName) {
    const newPath = path.join(folderPath, folderName);
    const localFoldersFiles = exploreLocalFoldersFiles(newPath);
    const folders = localFoldersFiles['folders'];
    const files = localFoldersFiles['files'];
    const folder = new Folder(folderName, newPath);
    folder.populateFolders(folders);
    folder.populateFiles(files);
    return folder;
}

module.exports = { exploreLocalCourse };


