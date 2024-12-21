const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: "mn598833@gmail.com",
        pass: "tbxq mckl ihji eiyd",
    },
});

module.exports = { transporter };  
