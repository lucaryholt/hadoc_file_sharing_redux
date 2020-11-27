function showPage(pageString) {
    window.history.replaceState('', '', '/' + pageString);
    switch (pageString.split('/')[0]) {
        case '': {
            getPageHTML('upload');
            break;
        }
        case 'download': {
            getPageHTML('download');
            break;
        }
        case 'confirm-email': {
            confirmEmail();
            getPageHTML('upload');
            break;
        }
        case 'resetpassword': {
            getPageHTML('resetpassword');
            break;
        }
        case 'userpage': {
            getPageHTML('userpage');
            break;
        }
        default: {
            getPageHTML(pageString);
        }
    }
}

function getPageHTML(page) {
    fetch('/pages/' + page)
        .then(response => {
            handleResponse(response, (response) => {
                response.text()
                    .then(result => {
                        const container = $('.container');

                        container.html(
                            '<div class="spinner-grow" role="status">' +
                                '<span class="sr-only">Loading...</span>' +
                            '</div>'
                        );

                        setTimeout(() => {
                            container.html('');
                            container.append(result + '');
                            //container.append('<h1>yo</h1>');
                            if (page === 'download') download();
                            if (page.includes('userpage')) getUploads();
                        }, 750);
                    });
            }, (error) => {
                popUpAlert(error, 'warning');
            });
        });
}

showPage(window.location.pathname.substring(1));