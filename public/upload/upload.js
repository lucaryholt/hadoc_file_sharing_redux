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

        fetch('/files/uploads', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(result => {
                showPage('download/' + result.id);
            });
    }
}