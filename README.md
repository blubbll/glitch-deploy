Welcome to Glitch
=================

[(async () => {
  const deploy = await require('require-remote-module')
  ("https://raw.githubusercontent.com/blubbll/glitch-deploy/master/glitch-deploy.js");
    deploy({
        ftp: {
            password: process.env.DEPLOY_PASS,
            user: process.env.DEPLOY_USER,
            host: process.env.DEPLOY_HOST
        },
        clear: true, //clear remote dir
        verbose: 0, //write every file to dir
        env: true //copy env too
    });
})()];


Your Project
------------

On the front-end,
- edit `public/client.js`, `public/style.css` and `views/index.html`
- drag in `assets`, like images or music, to add them to your project

On the back-end,
- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)


Made by [Glitch](https://glitch.com/)
-------------------

\ ゜o゜)ノ
