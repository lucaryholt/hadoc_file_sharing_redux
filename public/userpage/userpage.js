function getUploads() {
    fetch('/restricted/uploads', {
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        const hook = $('#upload-list-hook');
                        hook.html('');
                        if (result.length !== 0) {
                            result.map(upload => {
                                appendUpload(upload);
                            });
                        } else {
                            hook.append('<h3>No uploads... Go upload some files!</h3>');
                        }
                    });
            }, (error) => {
                refreshToken(getUploads());
            });
        });
}

function appendUpload(upload) {
    let filesHtml = '';
    upload.files.map(file => {
        filesHtml = filesHtml + '<li>' + file.originalName + '</li>'
    });

    const html =
        '<div class="card">' +
            '<div class="card-body">' +
                '<h5 class="card-title">' + upload.id + '</h5>' +
                '<h6 class="card-subtitle mb-2 text-muted">Receiver: ' + upload.receiver + '</h6>' +
                '<ul>' +
                    filesHtml +
                '</ul>' +
                '<a target="_blank" href="/download/' + upload.id + '" class="card-link">Share page</a>' +
                '<a onclick="deleteUpload(\'' + upload.id + '\')" class="card-link text-danger">Delete</a>' +
            '</div>' +
        '</div><br>'
    $('#upload-list-hook').append(html);
}

function deleteUpload(id) {
    fetch('/uploads/' + id, {
        method: 'DELETE',
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            handleResponse(response, (response) => {
                getUploads();
                popUpAlert('Upload deleted!', 'success');
            }, (error) => {
                popUpAlert(error, 'warning');
            });
        })
}