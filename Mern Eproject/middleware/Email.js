const { transporter } = require("./Emailconfig.js");
const { Verification_Email_Template, Welcome_Email_Template } = require("./EmailTemplate.js");

async function sendVerificationEmail(email, verificationCode){
    
    try {
        const response = await transporter.sendMail({
            from: '"Nabeel" <mn598833@gmail.com>',
            to: email, 
            subject: "Verify your Email", 
            text: "Verify your Email", 
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode)
        });
        console.log('Email sent successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }

};

async function senWelcomeEmail(email, name){
    try {
        const response = await transporter.sendMail({
            from: '"Nabeel" <mn598833@gmail.com>',
            to: email, 
            subject: "Welcome Email", 
            text: "Welcome Email",
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Email sent successfully', response);
    } catch (error) {
        console.log('Email error', error);
    }
};


async function VerificationEmailforget(email, otp) {

    try {
        const mailOptions = await transporter.sendMail({
            from: '"Nabeel" <mn598833@gmail.com>',
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
            html: Verification_Email_Template.replace("{verificationCode}", otp)
        });

    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = {
    sendVerificationEmail,
    senWelcomeEmail,
    VerificationEmailforget
};
