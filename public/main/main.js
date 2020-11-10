function showPage(page) {
    if (page === 'download') {
        window.history.replaceState('', '', '/' + page + '/' + window.location.href.split("/")[4]);
    } else {
        window.history.replaceState('', '', '/' + page);
    }
    page = window.location.href.split("/")[3];

    if (page === '') page = 'upload';

    fetch('/pages/' + page)
        .then(response => response.text())
        .then(result => {
            const container = $('.container');
            container.html('');
            container.append(result + '');
            if (page === 'download') download();
            if (page === 'admin') getUploads();
        });
}

showPage(window.location.href.split("/")[3]);