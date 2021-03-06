function validateForm() {
    const form = document.getElementById('my-form');
    const formData = new FormData(form);

    const files = form.elements.files.files;
    let totalSize = 0;

    for (let i = 0; i < files.length; i++) {
        totalSize = totalSize + files[i].size;
    }

    if (totalSize > (50 * 1024 * 1024)) {
        popUpAlert('Files are too large. The files can not total more than 50 MB.', 'warning');
    } else {
        formData.append('username', sessionStorage.getItem('username'));

        const container = $('.container');

        container.html(
            '<div class="spinner-border m-5" role="status">' +
                '<span class="sr-only">Loading...</span>' +
            '</div>'
        );

        fetch('/uploads', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                handleResponse(response, (response) => {
                    response.json()
                        .then(result => {
                            showPage('download/' + result.id);
                        });
                }, (error) => {
                    popUpAlert(error, 'warning');
                });
            });
    }
}