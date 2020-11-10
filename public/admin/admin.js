function getUploads() {
    let status = null;

    fetch('/admin/uploads', {
        headers: {
            'authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
        }
    })
        .then(response => {
            status = response.status;
            response.json()
                .then(result => {
                    if (status === 403) {
                        refreshToken(getUploads);
                    }
                    console.log(result);
                });
        });
}