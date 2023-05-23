var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASSWORD
  }
}));


exports.sendMail = (data) => {
  var mailOptions = {
    from: process.env.EMAIL_ID,
    to: data.sendTo,
    subject: data.subject,
    text: data.text
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

};
