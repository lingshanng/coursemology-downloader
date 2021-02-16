# Coursemology Downloader

This downloader compares your local directory to the Coursemology materials/workbin folder, 
and downloads all new files and folders from Coursemology into your local directory.

## Setting up

#### `CONFIG.txt`

In the `config` directory, edit the `CONFIG.txt` file.

Replace the following fields accordingly:
* `email` Coursemology email
* `password` Coursemology password
* `course_id` Course id found in url. `https://coursemology.org/courses/<course_id>`
* `directory_path` Path of your local directory for the course file, *relative to your home directory*

## Running the script

Ensure that you have 7-Zip available, through `sudo apt install p7zip-full` or `brew install p7zip`.

Run `npm install`, then run the main script using `node main.js`. 

Options:
- `--silent` or `-s`: No printing (apart from errors)
- `--timeout` or `-t`: Timeout per request in ms, defaults to 5000

Tip:
Create a `run.bat` file with the following line: `cmd /k node main.js`. Double click on the file to open terminal and run script quickly.


## Acknowledgements
Adapted code from [halfwhole/luminus-downloader](https://github.com/halfwhole/luminus-downloader)

