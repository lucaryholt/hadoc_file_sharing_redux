function getUploads() {
    fetch('/restricted/uploads', {
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            if (response.status === 403) refreshToken(getUploads());
            else {
                response.json()
                    .then(result => {
                        if (result.length !== 0) {
                            result.map(upload => {
                                appendUpload(upload);
                            });
                        } else {
                            $('#upload-list-hook').append('<h3>No uploads... Go upload some files!</h3>');
                        }
                    });
            }
        });
}

function appendUpload(upload) {
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