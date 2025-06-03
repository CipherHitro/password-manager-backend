const crypto = require('crypto')
require('dotenv').config()

const secret = process.env.AES_SECRET;
const iv = crypto.randomBytes(16); // Initialization Vector

// Encryption Function 

const encrypt = (text) => {

    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted , cipher.final()]);
    return {
        iv : iv.toString('hex'),
        encryptedData : encrypted.toString('hex')
    }   
}

// Decryption function 

const decrypt = (encryptedObj) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), Buffer.from(encryptedObj.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(encryptedObj.encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted , decipher.final()]);
    return decrypted.toString();
}

module.exports = { 
    encrypt,
    decrypt 
};