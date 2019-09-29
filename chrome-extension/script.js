const apply = async function() {
    const deployBtn = document.createElement('button');
    deployBtn.innerHTML = '<span class="label" aria-label="Open new file popover menu" style="">Deploy</span></span>';
    deployBtn.setAttribute('class', 'new-file btn-deploy');

    deployBtn.addEventListener("click", async () => {

        if (confirm(`Do you want to deploy your app?`)) {
            await application.newFile(":deploying:", "Your application should start getting deployed in a few seconds.");
        }
    })

    document.querySelector("#sidebar-file-controls > div").appendChild(deployBtn);
};

const loop = setInterval(function() {
    if (document.querySelector("#new-file")) {
        clearInterval(loop);
        apply();
    } else console.log("waiting till glitch loaded")
}, 999)