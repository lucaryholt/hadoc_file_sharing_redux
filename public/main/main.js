function showPage(pageString) {
    switch (pageString.split('/')[0]) {
        case '': {
            getPageHTML('upload');
            break;
        }
        case 'download': {
            window.history.replaceState('', '', '/' + pageString + '/' + window.location.href.split("/")[4]);
            getPageHTML('download');
            break;
        }
        case 'confirm-email': {
            confirmEmail(getPageHTML);
            break;
        }
        default: {
            getPageHTML(pageString);
        }
    }
    window.history.replaceState('', '', '/' + pageString);
}

function getPageHTML(page) {
    fetch('/pages/' + page)
        .then(response => response.text())
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
                if (page === 'download') download();
                if (page === 'userpage') getUploads();
            }, 750);
        });
}

showPage(window.location.href.split('/')[3]);