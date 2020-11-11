function validateForm() {
    const form = document.getElementById('my-form');
    const formData = new FormData(form);

    fetch('/uploads', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            showPage('download/' + result.id);
        });
}