///////////////////////////////////////////////////////////////////////////
//DEPLOY
///////////////////////////////////////////////////////////////////////////
[(async () => {
    if (process.env.PROJECT_DOMAIN) {
        const deployfile = ":deploying:";
        const deploy =
        await require('httprequire')("https://raw.githack.com/blubbll/glitch-deploy/master/glitch-deploy.js");
        const deployCheck = async () => {
            console.log("🐢Checking if we can deploy...");
            if (fs.existsSync(`${__dirname}/${deployfile}`)) {
              console.log("🐢💥Deploying triggered via file.")
                await deploy({
                    ftp: {
                        password: process.env.DEPLOY_PASS,
                        user: process.env.DEPLOY_USER,
                        host: process.env.DEPLOY_HOST
                    },
                    clear: 0,
                    verbose: 1,
                    env: true
                });
                fs.unlinkSync(deployfile);
                require('child_process').exec('refresh');
            } else setTimeout(deployCheck, 9999) //10s
        }
      setTimeout(deployCheck, 999); //1s
    }
})()];