# Coursemology Downloader

This downloader compares your local directory to the Coursemology materials/workbin folder, 
and downloads all new files and folders from Coursemology into your local directory.

## Setting up

#### `CONFIG.txt`

In the `config` directory, edit the `CONFIG.txt` file.

Replace the following fields accordingly:
* `email` Coursemology email
* `password` Coursemology password
* `course_url` Course url
* `directory_path` Path of your local directory for the course file, *relative to your home directory*

## Running the script

Ensure that you have 7-Zip available, through `npm install 7zip` or `sudo apt install p7zip-full` or `brew install p7zip`.

Run `npm install`. Subsequently, just run the main script using `node main.js` to download files. 

Options:
- `--silent` or `-s`: No printing (apart from errors)
- `--timeout` or `-t`: Timeout per request in ms, defaults to 5000

Tip:
Create a batch file with the following line: `cmd /k node main.js` to open terminal and run script quickly.


## Acknowledgements
Adapted code from [halfwhole/luminus-downloader](https://github.com/halfwhole/luminus-downloader)

