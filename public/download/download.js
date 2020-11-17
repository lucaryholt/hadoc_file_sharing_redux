function download() {
    const id = window.location.href.split('/')[4];

    let status = null;

    fetch('/files/uploads/' + id)
        .then(response => {
            status = response.status;
            response.json()
                .then(result => {
                    if (status === 404) {
                        popUpAlert('Could not find upload.', 'warning');
                        showPage('');
                    } else {
                        $('#message-holder').html(result.message);
                        $('#expire').html(result.expire);
                        const fileHolder = $('#file-holder');
                        result.files.map(file => {
                            fileHolder.append('<a class="btn btn-block btn-primary" href="/files/uploads/' + id + '/' + file.originalName + '">' + file.originalName + '</a>');
                        });
                    }
                });
        });
}