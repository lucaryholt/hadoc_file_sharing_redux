const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const uploadMail0 = fs.readFileSync(path.join(__dirname, '../assets/mailTemplates/shareMail/0.html')).toString();
const uploadMail1 = fs.readFileSync(path.join(__dirname, '../assets/mailTemplates/shareMail/1.html')).toString();
const uploadMail2 = fs.readFileSync(path.join(__dirname, '../assets/mailTemplates/shareMail/2.html')).toString();

const confirmEmail0 = fs.readFileSync(path.join(__dirname, '../assets/mailTemplates/confirmEmail/0.html')).toString();
const confirmEmail1 = fs.readFileSync(path.join(__dirname, '../assets/mailTemplates/confirmEmail/1.html')).toString();

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
    const html = uploadMail0 + uploadMessage + uploadMail1 + process.env.SERVICE_URL + '/download/' + uploadId + uploadMail2;

    const text = 'Hello. Someone has shared some files with you!\n They left this message for you:\n' + uploadMessage + '\nDownload the files here: ' + process.env.SERVICE_URL + '/download/' + uploadId + '\nSincerely the folks over at HADOC!';

    sendEmail(receiver, 'Someone shared files with you!', text, html);
}

function sendConfirmEmail(receiver, id) {
    const html = confirmEmail0 + process.env.SERVICE_URL + '/confirm-email/' + id + confirmEmail1;

    const text = 'Hello. Please confirm your email address by visiting this url: ' + process.env.SERVICE_URL + '/confirm-email/' + id + '\nSincerely the folks over at HADOC!';

    sendEmail(receiver, 'Confirm your email address', text, html);
}

module.exports = {
    sendEmail,
    sendUploadEmail,
    sendConfirmEmail
};