const loggedOutButtons = $('#logged-out-buttons');
const loggedInButtons = $('#logged-in-buttons');

fetch('/logintest', {
    headers: {
        'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
    }
})
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            loggedInButtons.hide();
        } else {
            $('#user-page-button').html(sessionStorage.getItem('username'));
            loggedOutButtons.hide();
        }
    });

function login() {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    fetch('/auth/login', {
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
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        modalAlert(result.message, 'login', 'success');
                        sessionStorage.setItem('username', result.username);
                        sessionStorage.setItem('accessToken', result.accessToken);
                        sessionStorage.setItem('refreshToken', result.refreshToken);
                        setTimeout(() => {
                            $('#login-modal').modal('toggle');
                            $('#user-page-button').html(sessionStorage.getItem('username'));
                            loggedOutButtons.hide();
                            loggedInButtons.show();
                        }, 1500);
                    });
            }, (error) => {
                modalAlert(error, 'login', 'warning');
            });
        });
}

function logout() {
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
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        sessionStorage.removeItem('username');
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('refreshToken');
                        loggedInButtons.hide();
                        loggedOutButtons.show();
                        showPage('');
                    });
            }, (error) => {
                popUpAlert(error, 'warning');
            });
        });
}

function refreshToken(callback) {
    fetch('/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: sessionStorage.getItem('refreshToken')
        })
    })
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then((result) => {
                        sessionStorage.setItem('accessToken', result.accessToken);
                        callback();
                    });
            }, (error) => {
                showPage('');
                $('#login-modal').modal('toggle');
                modalAlert(error, 'login', 'warning');
            });
        });
}

function register() {
    const username = document.getElementById('username-register-input').value;
    const password = document.getElementById('password-register-input').value;
    const passwordConfirm = document.getElementById('password-confirm-register-input').value;

    if (password !== passwordConfirm) {
        modalAlert('Passwords do not match.', 'register', 'warning');
    } else if (password.length < 8) {
        modalAlert('Password is too short. Needs to be at least 8 characters.', 'register', 'warning');
    } else {
        fetch('/auth/register', {
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
                handleResponse(response, (response) => {
                    response.json()
                        .then(result => {
                            $('#register-modal').modal('toggle');
                            popUpAlert(result.message, 'success');
                        });
                }, (error) => {
                    modalAlert(error, 'register', 'warning');
                });
            });
    }
}

function confirmEmail() {
    const id = window.location.href.split('/')[4];

    fetch('/auth/confirm-email/' + id)
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        popUpAlert(result.message, 'success');
                    });
            }, (error) => {
                popUpAlert(error, 'warning');
            });
        });
}