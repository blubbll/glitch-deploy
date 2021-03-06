///////////////////////////////////////////////////////////////////////////
//DEPLOY
///////////////////////////////////////////////////////////////////////////
[(async () => {
    const script = '!glitch-deploy.js'
    if (process.env.PROJECT_DOMAIN) {
        const deployfile = ":deploying:";
        require('download')('https://raw.githubusercontent.com/blubbll/glitch-deploy/master/glitch-deploy.js', __dirname, {
            filename: script
        }).then(() => {
            deployProcess();
        });
        const deployProcess = async () => {
            const deploy = require(`./${script}`);
            const deployCheck = async () => {
                //console.log("🐢Checking if we can deploy...");
                if (fs.existsSync(`${__dirname}/${deployfile}`)) {
                    console.log("🐢💥Deploying triggered via file.");
                    fs.unlinkSync(deployfile);
                    await deploy({
                        ftp: {
                            password: process.env.DEPLOY_PASS,
                            user: process.env.DEPLOY_USER,
                            host: process.env.DEPLOY_HOST
                        },
                        clear: 0,
                        verbose: 1,
                        env: 1
                    });
                    request(`https://evennode-reboot.glitch.me/reboot/${process.env.DEPLOY_TOKEN}/${process.env.PROJECT_DOMAIN}`, (error, response, body) => {
                        console.log(error || body)
                    });
                    require('child_process').exec('refresh');
                } else setTimeout(deployCheck, 9999) //10s
            }
            setTimeout(deployCheck, 999); //1s
        }
    } else require(`./${script}`)({env: true}); //apply env on deployed server
})()];