const { readEmail, readPassword, readPrint, readTimeout } = require('./config');
const prompt = require('prompt-sync')();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const PRINT = readPrint();
const TIMEOUT = readTimeout();

const qs = require('querystring');
const axios = require('axios').create({
    timeout: TIMEOUT,
    maxRedirects: 0,                          // intercept 302 redirects
    validateStatus: (status) => status < 500, // also allow 302 redirects, not only 2xx
});

const LOGIN_URL = 'https://coursemology.org/users/sign_in';

async function makeAxiosGet(url, cookies='') {
    const res = await axios.get(url, { headers: { Cookie: cookies } });
    return finishAxiosRequest(res);
}

async function makeAxiosPost(url, params, token='', cookies='') {
    const res = await axios.post(url, qs.stringify(params), { headers: { 'X-CSRF-Token': token, Cookie: cookies } });
    return finishAxiosRequest(res);
}

function finishAxiosRequest(res) {
    const setCookies = res.headers['set-cookie'];
    const newCookies = (setCookies === undefined)
        ? undefined
        : setCookies.map(c => c.split('; ')[0]).join('; ');
    const location = res.headers.location;
    return [res, newCookies, location];
}

function getEmail() {
    try {
	return readEmail();
    } catch (e) {
	return prompt('Username: ');
    }
}

function getPassword() {
    try {
	return readPassword();
    } catch (e) {
	return prompt.hide('Password: ');
    }
}

// Logs in the user, throwing an error if the login fails
// Returns: a promise with the access token
async function login() {
    [res, cookies, location] = await makeAxiosGet(LOGIN_URL);
    const dom = new JSDOM(res.data);
    var token = dom.window.document.querySelector('meta[name=csrf-token]').content;

    const email = getEmail();
    const password = getPassword();
    const login_params = { "user[email]": email, "user[password]": password };

    if (PRINT) process.stdout.write('Logging into Coursemology ... ');

    [res, cookies, location] = await makeAxiosPost(LOGIN_URL, login_params, token, cookies); // 302
    if (res.status !== 302) throw 'Login invalid, please check your login credentials again.';
    [res, cookies, ________] = await makeAxiosGet(location, cookies); // 200

    if (cookies === undefined) throw 'Login failed, please try again :(';
    if (PRINT) console.log('done!');

    return cookies;
}

module.exports = { login };
