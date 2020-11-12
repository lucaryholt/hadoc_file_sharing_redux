function validateForm() {
    const form = document.getElementById('my-form');
    const formData = new FormData(form);

    formData.append('username', sessionStorage.getItem('username'));

    fetch('/uploads', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            showPage('download/' + result.id);
        });
}