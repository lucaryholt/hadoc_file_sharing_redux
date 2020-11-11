const loginButton = $('#auth-button');
const logoutButton = $('#logout-button');

fetch('/logintest', {
    headers: {
        'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
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
            if (response.status !== 200) loginAlert('Could not log in. Try again.', 'warning');
            else {
                response.json()
                    .then(result => {
                        loginAlert(result.message, 'success');
                        sessionStorage.setItem('accessToken', result.accessToken);
                        sessionStorage.setItem('refreshToken', result.refreshToken);
                        setTimeout(() => {
                            $('#login-modal').modal('toggle');
                            loginButton.hide();
                            logoutButton.show();
                            showPage('admin');
                        }, 1500);
                    });
            }
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
            if (response.status === 500) popUpAlert('Could not log out, please try again.', 'warning');
            else {
                response.json()
                    .then(result => {
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('refreshToken');
                        logoutButton.hide();
                        loginButton.show();
                        showPage('');
                    });
            }
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
                         loginAlert(result.message, 'warning');
                     } else {
                         sessionStorage.setItem('accessToken', result.accessToken);
                         callback();
                     }
                 });
        });
}

function loginAlert(message, intensity) {
    const hook = $('#alert-hook');
    hook.html('');

    hook.append(
        '<div class="alert alert-' + intensity + ' alert-dismissible fade show" role="alert">' +
            '<strong>' + message + '</strong>' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
            '</button>' +
        '</div>'
    );
}

function popUpAlert(message, intensity) {
    const hook = $('#pop-up-alert-hook');

    hook.append(
        '<div id="pop-up-alert" class="alert alert-' + intensity + '" role="alert">' +
            message +
        '</div>'
    );

    setTimeout(() => {
        hook.html('');
    }, 3000);
}