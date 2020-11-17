function download() {
    const id = window.location.href.split('/')[4];

    fetch('/files/uploads/' + id)
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        $('#message-holder').html(result.message);
                        $('#expire').html(result.expire);
                        const fileHolder = $('#file-holder');
                        result.files.map(file => {
                            fileHolder.append('<a class="btn btn-block btn-primary" href="/files/uploads/' + id + '/' + file.originalName + '">' + file.originalName + '</a>');
                        });
                    });
            }, (error) => {
                popUpAlert(error, 'warning');
                showPage('');
            });
        });
}