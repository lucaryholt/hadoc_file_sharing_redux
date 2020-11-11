function getUploads() {
    let status = null;

    fetch('/admin/uploads', {
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            status = response.status;
            response.json()
                .then(result => {
                    if (status === 403) {
                        refreshToken(getUploads);
                    }
                    result.map(upload => {
                        appendUpload(upload);
                    });
                });
        });
}

function appendUpload(upload){
    const hook = $('#upload-list-hook');
    let filesHtml = '';
    upload.files.map(file => {
        filesHtml = filesHtml +
            '<li>' +
            '<p>originalname: ' + file.originalName + '</p>' +
            '<p>filename: ' + file.filename + '</p>' +
            '</li>'
    });
    const html =
        '<li>' +
            '<div class="upload-item">' +
                '<h5 class="upload-id">' + upload.id + '</h5>' +
                '<p class="upload-message">' + upload.message + '</p>' +
                '<p class="upload-time">' + new Date(Number(upload.uploadTime)).toUTCString() + '</p>' +
                '<ul>' +
                    filesHtml +
                '</ul>' +
            '</div>' +
        '</li>'
    hook.append(html);
}