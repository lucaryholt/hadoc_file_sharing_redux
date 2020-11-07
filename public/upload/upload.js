function validateForm(){
    const form = document.getElementById('myForm');
    const formData = new FormData(form);

    fetch('/files', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            //window.location.href = '/download/' + result.downloadID;
        });
}