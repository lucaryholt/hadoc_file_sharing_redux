function login() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    let status = null;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
        .then(response => {
            status = response.status;

            response.json()
                .then(result => {
                    if (status === 200) {
                        alert(result.message, 'success');
                        sessionStorage.setItem('accessToken', result.accessToken);
                        sessionStorage.setItem('refreshToken', result.refreshToken);
                        setTimeout(() => {
                            window.location.href = '/admin';
                        }, 1500);
                    }
                    else alert(result.message, 'warning');
                });
        });
}

function alert(message, intensity) {
    const hook = $('#alert-hook');
    hook.html('');

    hook.append(
        '<div class="alert alert-' + intensity + ' alert-dismissible fade show" role="alert">' +
            '<strong>' + message + '</strong>' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
            '</button>' +
        '</div>');
}