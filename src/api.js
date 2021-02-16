const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { readTimeout, readCourseId } = require('./config');

const TIMEOUT = readTimeout();
const API_BASE = 'https://coursemology.org';

const axios = require('axios').create({ timeout: TIMEOUT });

function getCourseId() {
    try {
	return readCourseId();
    } catch (e) {
	return prompt.hide('Course Id: ');
    }
}

async function queryCourseAPI(cookies) {
    // get course url
    const course_id = getCourseId();
    const course_path = '/courses/' + course_id;
    const err_msg = "Course not found, please check the course url again."
    const html_data = await queryAPI(cookies, course_path, err_msg);
    
    // find materials link
    const dom = new JSDOM(html_data);
    const doc = dom.window.document;
    let links = doc.querySelectorAll("#course-navigation-sidebar li a");
    let materials_path; 
    links.forEach(li => {
        if(li.href.includes('materials')) {
            materials_path = li.href; // e.g: /courses/2013/materials/folders/4321
        }
    } )

    if (!materials_path) throw 'Error: materials folder not found';
    const course_name = doc.querySelector('.page-header h1').textContent;

    return [materials_path, course_id, course_name];
}

async function queryFoldersAPI(cookies, path) {
    const html_data = await queryAPI(cookies, path);
    const dom = new JSDOM(html_data);
    const doc = dom.window.document;
    const trows = doc.querySelectorAll('.material_folder');
    let folders = [];
    trows.forEach(row => {
        const td = row.querySelector('td a');
        let folder = {
            name: td.textContent.replace(/ *\([^)]*\) */g, "").trim(),
            path: td.href
        }
        folders.push(folder);
    })
    return folders;
}

async function queryFilesAPI(cookies, path) {
    const html_data = await queryAPI(cookies, path);
    const dom = new JSDOM(html_data);
    const doc = dom.window.document;
    const trows = doc.querySelectorAll('.material');
    let files = [];
    trows.forEach(row => {
        const td = row.querySelector('td a');
        let file = {
            name: td.textContent.replace(/ *\([^)]*\) */g, "").trim(),
            path: td.href // eg: /courses/2013/materials/folders/52897/files/79624
        }
        files.push(file);
    })
    return files;
}

// Returns a promise containing the body of a GET request directed to API_BASE + path
function queryAPI(cookies, path, msg=undefined) {
    const options = {
        method: 'GET',
        headers: { Cookie: cookies },
        url: API_BASE + path
    };
    return new Promise(function(resolve, reject) {
        axios(options)
            .then(res => {
                if (res.status !== 200) {
                    return msg 
                    ? reject(msg)
                    : reject('queryAPI failed. Status code: ' + res.status +
                                  ', status message: ' + res.statusText);
                }
                resolve(res.data);
            })
            .catch(err => msg ? reject(msg) : reject(err));
    });
}

// Returns a promise containing the body of the downloaded file/folder as a buffer
async function downloadAPI(cookies, path) {
    const options = {
        method: 'GET',
        headers: { Cookie: cookies },
        url: API_BASE + path,
        responseType: 'arraybuffer' // Allows data to be a binary data buffer instead of json by default
    };
    return new Promise(function(resolve, reject) {
        axios(options)
            .then(res => {
                if (res.status !== 200) {
                    return reject('downloadAPI failed. Status code: ' + res.status +
                                ', status message: ' + res.statusText);
                }
                resolve(res.data);
            })
            .catch(err => reject(err));
    });
}


async function downloadFileAPI(cookies, file_path) {
    return await downloadAPI(cookies, file_path);
}

async function downloadFolderAPI(cookies, folder_path) {
    const path = folder_path + '/download';
    const res = await axios({
        method: 'GET',
        headers: { Cookie: cookies },
        url: API_BASE + path
    })
    const job_path = res.request.path;

    const download_location = await new Promise((resolve, reject) => {
        const responsePolling = setInterval(async () => {
            try {
                const res = await axios({
                    method: 'GET',
                    headers: { Cookie: cookies },
                    url: API_BASE + job_path
                })
                if (res.status === 200) {
                    clearInterval(responsePolling);
                    resolve(res.request.path);
                } 
                // else {
                //     console.log(res.status);
                // }
            } catch (error) {
                reject(error);
            }
        }, 1000);
    });
    return await downloadAPI(cookies, download_location);
}

module.exports = { queryCourseAPI, queryFoldersAPI, queryFilesAPI, downloadFileAPI, downloadFolderAPI  };
