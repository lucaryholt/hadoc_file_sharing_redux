const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

transporter.verify(function(error, success) {
    if (error) console.log(error);
});

function sendEmail(receiver, subject, messageText, messageHTML) {
    transporter.sendMail({
        from: 'HADOC File Sharing <' + process.env.MAIL_USERNAME + '>',
        to: receiver,
        subject: subject,
        text: messageText,
        html: messageHTML
    });
}

function sendUploadEmail(receiver, uploadMessage, uploadId) {
    const html =
        '<h1>Hello</h1>' +
        '<p>Someone has shared some files with you!</p>' +
        '<p>They left this message for you:</p>' +
        '<p>' + uploadMessage + '</p>' +
        '<br>' +
        '<p>Download the files <a href="' + process.env.SERVICE_URL + '/download/' + uploadId + '">here</a>.</p>' +
        '<br>' +
        '<h5>Sincerely the folks over at HADOC!</h5>';

    const text = 'Hello. Someone has shared some files with you!\n They left this message for you:\n' + uploadMessage + '\nDownload the files here: ' + process.env.SERVICE_URL + '/download/' + uploadId + '\nSincerely the folks over at HADOC!';

    sendEmail(receiver, 'Someone shared files with you!', text, html);
}

module.exports = {
    sendEmail,
    sendUploadEmail
};