const hook = $('#users-hook');

function getUsers() {
    hook.html('');

    fetch('/admin/users', {
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        result.users.map(user => appendUser(user));
                    });
            }, (error) => {
                showPage('');
                popUpAlert(error, 'warning');
            });
        });
}


function appendUser(user) {
    let rolesHtml = '';
    user.roles.map(role => {
        rolesHtml = rolesHtml + '<li>' + role + '</li>';
    });

    const html =
        '<div class="card">' +
            '<div class="card-body">' +
                '<h5 class="card-title">' + user.username + '</h5>' +
                '<h6 class="card-subtitle mb-2 text-muted">id: ' + user.id + '</h6>' +
                '<span>Roles</span>' +
                '<ul>' +
                    rolesHtml +
                '</ul>' +

                '<a onclick="deleteUser(\'' + user.id + '\')" class="card-link text-danger">Delete</a>' +
            '</div>' +
        '</div><br>'
    hook.append(html);
}

function deleteUser(id) {
    fetch('/admin/users/' + id, {
        method: 'DELETE',
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            handleResponse(response, (response) => {
                response.json()
                    .then(result => {
                        getUsers();
                        popUpAlert(result.message, 'success');
                    });
            }, (error) => {
                getUsers();
                popUpAlert(error, 'warning');
            });
        })
}

getUsers();