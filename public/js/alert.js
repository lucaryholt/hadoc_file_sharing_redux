function modalAlert(message, alertId, intensity) {
    const hook = $('#' + alertId + '-alert-hook');
    hook.html('');

    hook.append(
        '<div class="alert alert-' + intensity + ' alert-dismissible fade show" role="alert">' +
        '<strong>' + message + '</strong>' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>'
    );

    setTimeout(() => {
        hook.html('');
    }, 3000);
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