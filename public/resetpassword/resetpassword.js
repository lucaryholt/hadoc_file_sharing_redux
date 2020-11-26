function resetPassword() {
    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('password-confirm-input').value;

    if (password !== confirmPassword) {
        popUpAlert('Passwords do not match, try again.', 'warning');
    } else if (password.length < 8) {
        popUpAlert('Password is too short. Needs to be at least 8 characters.', 'warning');
    } else {
        fetch('/auth/resetpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: window.location.href.split('/')[4],
                password: password
            })
        })
            .then(response => {
                handleResponse(response, (response) => {
                    response.json()
                        .then(result => {
                            popUpAlert(result.message, 'success');
                            showPage('');
                        });
                }, (error) => {
                    popUpAlert(error, 'warning');
                });
            });
    }
}