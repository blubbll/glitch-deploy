// server.js
// where your node app starts
// init project
const express = require('express');
const app = express();
const path = require('path');
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});
const fs = require("fs");
const deploy = (clear) => new Promise((resolve, reject) => {
    const icon = {
        self: "🛠️",
        dir: "📁",
        file: "📄",
        up: "↗️",
        ok: "✅",
        rem: "🗑️",
        add: "✨"
    }
    var Client = require('ftp');
    var c = new Client();
    let
        oldfiles = 0,
        oldfilesgone = 0,
        oldfolders = 0,
        oldfoldersgone = 0,
        newfolders = 0,
        newfoldersdone = 0;
    c.on('ready', async () => {
        if (clear) await _clear();
        console.log(await _deploy());
        resolve();
    })
    const _clear = () => new Promise((resolve, reject) => {
        let all;
        c.list("/", 0, function(err, list) {
            list.forEach(file => {
                //delete remote folders
                if (file.type === 'd') {
                    if (!['..', '.'].includes(file.name)) {
                        oldfolders++;
                        c.rmdir(file.name, () => {
                            oldfoldersgone++;
                            console.log(`${icon.self}${icon.rem}${icon.dir}deleting remote folder '${file.name}'...`);
                            if (oldfilesgone + oldfoldersgone === oldfiles + oldfolders) resolve();
                        });
                    }
                    //delete remote files
                } else {
                    oldfiles++;
                    c.delete(file.name, () => {
                        console.log(`${icon.self}${icon.rem}${icon.file}deleting remote file '${file.name}'...`);
                        oldfilesgone++;
                        if (oldfilesgone + oldfoldersgone === oldfiles + oldfolders) resolve();
                    });
                }
            });
        });
    });
    const _deploy = () => new Promise((resolve, reject) => {
        // c.rmdir("/", true, () => {});
        require('glob')(`${__dirname}/**`, async (er, files) => {
            let all = files.length,
                curr = 0;
            const _files = [];
            const _folders = [];
            files.forEach(fd => {
                if (!['/app', '/app/node_modules'].includes(fd)) { //blacklist
                    !!path.extname(fd) ? _files.push(fd) : _folders.push(fd);
                }
            });
            //make dirs on remote
            const _upfolders = (dirs) => new Promise((resolve, reject) => {
                dirs.forEach(dir => {
                    const folder = `${dir.split("/app/")[1]}`;
                    console.log(`${icon.self}${icon.add}${icon.dir}creating remote dir '${folder}'...`)
                    newfolders++;
                    c.mkdir(folder, true, () => {
                        newfoldersdone++;
                        if (newfoldersdone === newfolders) {
                            resolve();
                        }
                    });
                });
            });
            //upload files
            const _upfiles = (files) => new Promise((resolve, reject) => {
                let curr = 0;
                files.forEach(file => {
                    const rf = `/${file.split("/app/")[1]}`; //calculate remote path
                    if (fs.existsSync(file)) { //maybe-redundant local-exist check
                        curr++;
                        console.log(`${icon.self}${icon.up}${icon.file}loading '${file}' to '${rf}'...`);
                        c.put(file, rf, (err) => {
                            curr === files.length && resolve();
                            if (err) return reject(`deploy error: ${err} while uploading ${file} to ${rf}`);
                        });
                    }
                })
            });
          
            await _upfolders(_folders);
            //console.log(`${icon.self}${icon.ok}${_folders.length} folders deployed!`);
            await _upfiles(_files);
            //console.log(`${icon.self}${icon.ok}${_files.length} files deployed!`);
            console.log(`${icon.self}${icon.ok}: ${_files.length}${icon.file} & ${icon.dir}${_folders.length} deployed!`);
          
        }); 
    });

    c.connect({
        password: process.env.DEPLOY_PASS,
        user: process.env.DEPLOY_USER,
        host: process.env.DEPLOY_HOST
    });
});

[(async () => {
    await deploy(true);
})()];