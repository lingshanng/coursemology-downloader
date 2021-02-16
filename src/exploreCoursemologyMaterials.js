const { Course, Folder, File } = require('./directory');
const { readPrint } = require('./config');
const { queryCourseAPI, queryFoldersAPI, queryFilesAPI } = require('./api');

const PRINT = readPrint();

// Entry point for exploring materials
// Returns: an array of Folders
async function exploreCourse(cookies) {
    const [materials_path, course_id, course_name] = await queryCourseAPI(cookies);
    const course = new Course(course_id, course_name);
    //assuming no sub folders for now
    console.log('Exploring ' + course_name + ' ...');
    const materials = await exploreFolders(cookies, materials_path);
    course.populateFolders(materials);
    return course
}

async function exploreFolders(cookies, parent_path) {
    const foldersInfo = await queryFoldersAPI(cookies, parent_path);
    const folders = foldersInfo.map(f => {
        return new Folder(f.name, f.path);
    })

    // Recursively explore its children for folders and files
    for (const folder of folders) {
        const subFolders = await exploreFolders(cookies, folder.path);
        const subFiles = await exploreFiles(cookies, folder.path);
        folder.populateFolders(subFolders);
        folder.populateFiles(subFiles);
    }
    return folders;
}

async function exploreFiles(cookies, parent_path) {
    const filesInfo = await queryFilesAPI(cookies, parent_path);
    const files = filesInfo.map(f => {
        return new File(f.name, f.path);
    });
    return files;
}

module.exports = { exploreCourse };
