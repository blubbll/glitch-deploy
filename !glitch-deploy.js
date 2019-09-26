//© glitch-deploy by blubbll
{
    //imports
    const fs = require('fs'),
        path = require('path'),
        glob = require('glob'),
        ftpClient = require('ftp');

    //tool
    const fontMap = new Map;
    fontMap.set("mathMono",
        new Map([
            ["A", "𝙰"],
            ["B", "𝙱"],
            ["C", "𝙲"],
            ["D", "𝙳"],
            ["E", "𝙴"],
            ["F", "𝙵"],
            ["G", "𝙶"],
            ["H", "𝙷"],
            ["I", "𝙸"],
            ["J", "𝙹"],
            ["K", "𝙺"],
            ["L", "𝙻"],
            ["M", "𝙼"],
            ["N", "𝙽"],
            ["O", "𝙾"],
            ["P", "𝙿"],
            ["Q", "𝚀"],
            ["R", "𝚁"],
            ["S", "𝚂"],
            ["T", "𝚃"],
            ["U", "𝚄"],
            ["V", "𝚅"],
            ["W", "𝚆"],
            ["X", "𝚇"],
            ["Y", "𝚈"],
            ["Z", "𝚉"],
            ["a", "𝚊"],
            ["b", "𝚋"],
            ["c", "𝚌"],
            ["d", "𝚍"],
            ["e", "𝚎"],
            ["f", "𝚏"],
            ["g", "𝚐"],
            ["h", "𝚑"],
            ["i", "𝚒"],
            ["j", "𝚓"],
            ["k", "𝚔"],
            ["l", "𝚕"],
            ["m", "𝚖"],
            ["n", "𝚗"],
            ["o", "𝚘"],
            ["p", "𝚙"],
            ["q", "𝚚"],
            ["r", "𝚛"],
            ["s", "𝚜"],
            ["t", "𝚝"],
            ["u", "𝚞"],
            ["v", "𝚟"],
            ["w", "𝚠"],
            ["x", "𝚡"],
            ["y", "𝚢"],
            ["z", "𝚣"],
            ["0", "𝟶"],
            ["1", "𝟷"],
            ["2", "𝟸"],
            ["3", "𝟹"],
            ["4", "𝟺"],
            ["5", "𝟻"],
            ["6", "𝟼"],
            ["7", "𝟽"],
            ["8", "𝟾"],
            ["9", "𝟿"]
        ]));
    const toMono = o => (fontMap.get("mathMono").forEach((e, n) => {
        o = o.replace(new RegExp(n, "g"), e)
    }), o);
    const deploy = (options) => new Promise((resolve, reject) => {
        const icon = {
            self: "🛠️",
            dir: "📁",
            file: "📄",
            up: "↗️",
            ok: "✅",
            rem: "🗑️",
            add: "✨"
        };
        console.log(toMono(`${icon.self}Starting deployment${options.clear ? " (with remote clear)":''} ...`));
        var c = new ftpClient();
        c.on('ready', async () => {
            options.clear && await _clear();
            await _deploy();
            return resolve();
        });
        const _clear = () => new Promise((resolve, reject) => {
            let
                oldfiles = 0,
                oldfilesgone = 0,
                oldfolders = 0,
                oldfoldersgone = 0;
            c.list("/", 0, function(err, list) {
                list.forEach(file => {
                    //delete remote folders
                    if (file.type === 'd') {
                        if (!['..', '.'].includes(file.name)) {
                            oldfolders++;
                            c.rmdir(file.name, () => {
                                oldfoldersgone++;
                                options.verbose &&
                                    console.log(toMono(`${icon.self}${icon.rem}${icon.dir}deleting remote folder '${file.name}'...`));
                                if (oldfilesgone + oldfoldersgone === oldfiles + oldfolders) resolve();
                            });
                        }
                        //delete remote files
                    } else {
                        oldfiles++;
                        c.delete(file.name, () => {
                            options.verbose &&
                                console.log(toMono(`${icon.self}${icon.rem}${icon.file}deleting remote file '${file.name}'...`));
                            oldfilesgone++;
                            if (oldfilesgone + oldfoldersgone === oldfiles + oldfolders) resolve();
                        });
                    }
                });
            });
        });
        const _deploy = () => new Promise((resolve, reject) => {
            glob(`${__dirname}/**`, async (er, files) => {
                const lfiles = [],
                    lfolders = [];
                //cache files into correct array
                files.forEach(fd => {
                    if (!fd.startsWith('.') && !['/app', '/app/node_modules', '/app/package-lock.json'].includes(fd)) { //blacklist
                        !!path.extname(fd) ? lfiles.push(fd) : lfolders.push(fd);
                    }
                });
                //make dirs on remote
                const _upfolders = (dirs) => new Promise((resolve, reject) => {
                    let
                        newfolders = 0,
                        newfoldersdone = 0;
                    dirs.forEach(dir => {
                        const folder = `${dir.split("/app/")[1]}`;
                        options.verbose &&
                            console.log(toMono(`${icon.self}${icon.add}${icon.dir}creating remote dir '${folder}'...`));
                        newfolders++;
                        c.mkdir(folder, true, () => {
                            newfoldersdone++;
                            if (newfoldersdone === newfolders) {
                                resolve();
                            };
                        });
                    });
                });
                //upload files
                const _upfiles = (files) => new Promise((resolve, reject) => {
                    let
                        newfiles = 0,
                        newfilesdone = 0;
                    let curr = 0;
                    files.forEach(file => {
                        const rf = `/${file.split("/app/")[1]}`; //calculate remote path
                        if (fs.existsSync(file)) { //maybe-redundant local-exist check
                            newfiles++;
                            options.verbose &&
                                console.log(toMono(`${icon.self}${icon.up}${icon.file}loading '${file}' to '${rf}'...`));
                            c.put(file, rf, (err) => {
                                newfilesdone++;
                                if (newfilesdone === newfiles) {
                                    resolve();
                                };
                                if (err) return reject(`deploy error: ${err} while uploading ${file} to ${rf}`);
                            });
                        }
                    });
                });
                //wait for folders and files
                [await _upfolders(lfolders), await _upfiles(lfiles)]; {
                    const d = lfolders.length > 0 ? `${lfolders.length} folder${lfolders.length>1&&"s"}` : void 0;
                    const f = lfiles.length > 0 ? `${lfiles.length} file${lfiles.length>1&&"s"}` : void 0;
                    console.log(toMono(`${icon.self}${icon.ok}${f && d ? `${f} & ${d}` : f} deployed!`));
                    c.end(), resolve();
                };
                //end client
            });
        });
        c.connect(options.ftp);
    });

    process.on('unhandledRejection', err => {
        const self = __filename;
        //well, thanks
        //np

        //if error came from this module
        if (err.stack.includes(`at Object.<anonymous> (${self}`)) {
            const msg = `❌[${new Date().toLocaleString()}]@${self}: '${err.message}'`;
            console.warn(msg);
            fs.writeFileSync('Err.txt', msg);
        }

    });

    module.exports = deploy;
};