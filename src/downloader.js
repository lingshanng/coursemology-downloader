
const path = require('path');
const fs = require('fs');
const Seven = require('node-7z');

const { readPrint } = require('./config');
const { downloadFileAPI, downloadFolderAPI } = require('./api');

const PRINT = readPrint();

// Entry point
// Downloads all new folders and files in the course
async function downloadNewFoldersFilesInCourse(cookies, course, base_path) {
    await downloadNewFolders(cookies, course.folders, base_path);
}

async function downloadNewFoldersFilesInFolder(cookies, folder, base_path) {
    const new_path = path.join(base_path, folder.name);
    await downloadNewFolders(cookies, folder.folders, new_path);
    await downloadNewFiles(cookies, folder.files, new_path);
}

async function downloadNewFolders(cookies, folders, path) {
    const downloadPromises = folders.map(folder => {
        if (folder.diff) {
            return downloadFolder(cookies, folder.path, folder.name, path);
        } else {
            // Recursively explores non-different folders for new children
            return downloadNewFoldersFilesInFolder(cookies, folder, path);
        }
    });
    await Promise.all(downloadPromises);
}

async function downloadNewFiles(cookies, files, path) {
    const downloadPromises = files.filter(file => file.diff).map(file => {
        return downloadFile(cookies, file.path, file.name, path);
    });
    await Promise.all(downloadPromises);
}

/* HELPER FUNCTIONS FOR DOWNLOADING AND WRITING FILES/FOLDERS */

async function downloadFile(cookies, file_path, file_name, base_path) {
    let buffer;
    try {
        buffer = await downloadFileAPI(cookies, file_path);
    } catch (err) {
        if (PRINT) console.log("File '" + file_name +"' could not be downloaded.");
        return;
    }
    const file_write_path = path.join(base_path, file_name);
    await writeFile(buffer, file_write_path);
    if (PRINT) console.log('Downloaded file ' + file_name + ' to ' + base_path);
}

async function downloadFolder(cookies, folder_path, folder_name, base_path) {
    let buffer;
    try {
        buffer = await downloadFolderAPI(cookies, folder_path);
    } catch (err) {
        if (PRINT) console.log("Folder '" + folder_name + "' could not be downloaded.");
        return;
    }
    const zip_file_path = path.join(base_path, folder_name + '.zip');
    await writeFile(buffer, zip_file_path);
    await extractZipFile(zip_file_path, path.join(base_path, folder_name));
    await deleteFile(zip_file_path);
    if (PRINT) console.log('Downloaded folder ' + folder_name + ' to ' + base_path);
}

/* HELPER FUNCTIONS FOR FILES */

async function writeFile(buffer, file_path) {
    return new Promise((res, rej) => {
        fs.writeFile(file_path, buffer, (err) => {
            if (err) rej(err);
            res();
        });
    });
}

function deleteFile(file_path) {
    return new Promise((res, rej) => {
        fs.unlink(file_path, err => {
            if (err) rej(err);
            res();
        });
    });
}

/* HELPER FUNCTIONS FOR 7ZIP */
function extractZipFile(zip_file_path, dest_path) {
    return new Promise((res, rej) => {
        const myStream = Seven.extractFull(zip_file_path, dest_path, { recursive: true });
        myStream.on('end', () => res());
    });
}


module.exports = { downloadNewFoldersFilesInCourse, downloadFolder };
