function validateForm(){
    const form = document.getElementById('myForm');
    const formData = new FormData(form);

    fetch('/uploads', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            window.location.href = '/download/' + result.id;
        });
}