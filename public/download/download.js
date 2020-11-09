const id = window.location.href.split('/')[4];

fetch('/uploads/' + id)
    .then(response => response.json())
    .then(result => {
        $('#message-holder').html(result.message);
        const fileHolder = $('#file-holder');
        result.files.map(file => {
            fileHolder.append('<li><a href="/uploads/' + id + '/' + file.originalName + '">' + file.originalName + '</a></li>');
        });
    });