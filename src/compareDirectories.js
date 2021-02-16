const { readPrint } = require('./config');

const PRINT = readPrint();

// Entry point for comparing two courses
// First course will be marked with 'diff' (Coursemology), second course won't (local)
function compareCourses(course1, course2) {
    compareTwoFoldersOrCourses(course1, course2);
}

// Compares files and folders that are in folder1 but not in folder2, marking new ones as 'diff'
function compareTwoFoldersOrCourses(folder1, folder2) {
    // Mark diff files
    const folder1files = folder1.files || [];
    const folder2files = folder2.files || [];
    const diffFiles = folder1files.filter(folder1file => {
        return !folder2files.map(f => f.name).some(fName => fName === folder1file.name);
    });
    diffFiles.forEach(file => file.diff = true);
    // Mark diff folders -- also recursively mark each item in it as 'diff'
    const folder1folders = folder1.folders || [];
    const folder2folders = folder2.folders || [];
    const diffFolders = folder1folders.filter(folder1folder => {
        return !folder2folders.map(f => f.name).some(fName => fName === folder1folder.name);
    });
    diffFolders.forEach(folder => markDiffFolders(folder));

    // Explore non-diff folders
    const nonDiffFolders = folder1folders.filter(folder1folder => {
        return folder2folders.map(f => f.name).some(fName => fName === folder1folder.name);
    });

    nonDiffFolders.forEach(folder1subfolder => {
        const folder2subfolder = folder2folders.filter(folder2folder => {
            return folder2folder.name === folder1subfolder.name;
        })[0];
        compareTwoFoldersOrCourses(folder1subfolder, folder2subfolder);
    });
}

// Recursively marks the 'diff' property of all its folders and files to be true
function markDiffFolders(folder) {
    folder.diff = true;
    folder.files.forEach(file => file.diff = true);
    folder.folders.forEach(folder => markDiffFolders(folder));
}

// Gets the print string for course (for display)
function coursePrintString(course) {
    const courseDiff = course.anyDiff();
    if (!courseDiff) {
        return 'No new files or folders!';
    } else {
        return course.printString(true);
    }
}

module.exports = { compareCourses, coursePrintString };
