const loginButton = $('#login-button');
const logoutButton = $('#logout-button');

fetch('/logintest', {
    headers: {
        'authorization': sessionStorage.getItem('accessToken')
    }
})
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logoutButton.hide();
        } else {
            loginButton.hide();
        }
    });

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
                            $('#loginModal').modal('toggle');
                            loginButton.hide();
                            logoutButton.show();
                            showPage('admin');
                        }, 1500);
                    }
                    else alert(result.message, 'warning');
                });
        });
}

function logout() {
    let status = null;

    fetch('/logout', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: sessionStorage.getItem('refreshToken')
        })
    })
        .then(response => {
            status = response.status;
            response.json()
                .then(result => {
                    if (status === 500) console.log('Could not log out.'); // TODO better handling. Pop up on site or something.
                    else {
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('refreshToken');
                        logoutButton.hide();
                        loginButton.show();
                        showPage('');
                    }
                });
        });
}

function refreshToken(callback) {
    let status = null;

    fetch('/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: sessionStorage.getItem('refreshToken')
        })
    })
        .then(response => {
             status = response.status;
             response.json()
                 .then(result => {
                     if (status === 403 || status === 401) {
                         showPage('');
                         $('#loginModal').modal('toggle');
                         alert(result.message, 'warning');
                     } else {
                         sessionStorage.setItem('accessToken', result.accessToken);
                         callback();
                     }
                 })
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