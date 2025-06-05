const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// Send OTP email function
const sendOTPEmail = async (recipientEmail, otp) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Your Password Manager',
                address: process.env.EMAIL_USER
            },
            to: recipientEmail,
            subject: 'Password Reset OTP - Your Password Manager',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    
                    <p style="color: #666; font-size: 16px;">
                        Hello,
                    </p>
                    
                    <p style="color: #666; font-size: 16px;">
                        We received a request to reset your password for your Password Manager account. 
                        Use the following OTP to complete the process:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px 30px; border-radius: 8px; border: 2px dashed #007bff;">
                            ${otp}
                        </span>
                    </div>
                    
                    <p style="color: #666; font-size: 16px;">
                        <strong>This OTP will expire in 10 minutes.</strong>
                    </p>
                    
                    <p style="color: #666; font-size: 14px;">
                        If you didn't request a password reset, please ignore this email. 
                        Your account remains secure.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            `,
            // Text version for email clients that don't support HTML
            text: `
                Password Reset Request
                
                Hello,
                
                We received a request to reset your password for your Password Manager account.
                
                Your OTP is: ${otp}
                
                This OTP will expire in 10 minutes.
                
                If you didn't request a password reset, please ignore this email.
                
                This is an automated message. Please do not reply to this email.
            `
        };
        
        const info =  transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// Test email connection
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email server connection successful');
        return true;
    } catch (error) {
        console.error('Email server connection failed:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail,
    testEmailConnection
};