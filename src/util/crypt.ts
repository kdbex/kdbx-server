/**
 * Crypting file to encrypt and decrypt files
 */
import crypto from 'crypto';

export function ivkey(pass: string): [string, string] {
	let [key, iv] = pass.split(":");
	return [key, iv];
}

// Function to generate a random key and IV
function generateKeyAndIV() {
    const key = crypto.randomBytes(32); // 32 bytes for AES-256
    const iv = crypto.randomBytes(16); // 16 bytes for IV

    // Convert to Base64 or hex for storage
    return {
        key: key.toString('base64'),
        iv: iv.toString('base64')
    };
}
// Function to encrypt data
export function encrypt(data: string, pass: string) {
	let [key, iv] = ivkey(pass);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt data
export function decrypt(encryptedData: string, pass: string) {
    let [key, iv] = ivkey(pass);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}