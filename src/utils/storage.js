/**
 * Encryption utilities using Web Crypto API
 * Provides secure encryption/decryption for localStorage
 */

export class CryptoStorage {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
    }

    /**
     * Derives a key from a passphrase
     * @param {string} passphrase - User passphrase
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>}
     */
    async deriveKey(passphrase, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.algorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypts data
     * @param {string} data - Data to encrypt
     * @param {string} passphrase - Encryption passphrase
     * @returns {Promise<string>} Base64 encoded encrypted data
     */
    async encrypt(data, passphrase) {
        try {
            const encoder = new TextEncoder();
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await this.deriveKey(passphrase, salt);

            const encryptedData = await crypto.subtle.encrypt(
                { name: this.algorithm, iv: iv },
                key,
                encoder.encode(data)
            );

            // Combine salt + iv + encrypted data
            const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypts data
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {string} passphrase - Decryption passphrase
     * @returns {Promise<string>} Decrypted data
     */
    async decrypt(encryptedData, passphrase) {
        try {
            const combined = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );

            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);

            const key = await this.deriveKey(passphrase, salt);

            const decryptedData = await crypto.subtle.decrypt(
                { name: this.algorithm, iv: iv },
                key,
                data
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Generates a session key based on browser fingerprint
     * Not cryptographically secure, but provides basic obfuscation
     * @returns {string}
     */
    getSessionKey() {
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            new Date().toDateString(),
            window.screen.width + 'x' + window.screen.height
        ].join('|');

        // Simple hash
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'msgsentinel_' + Math.abs(hash).toString(36);
    }
}

/**
 * Secure localStorage wrapper
 */
export class SecureStorage {
    constructor() {
        this.crypto = new CryptoStorage();
        this.useEncryption = true; // Can be toggled by user
    }

    /**
     * Safely stores data in localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {boolean} encrypt - Whether to encrypt (default: false for settings, true for history)
     * @returns {Promise<boolean>} Success status
     */
    async setItem(key, data, encrypt = false) {
        try {
            const jsonData = JSON.stringify(data);

            if (encrypt && this.useEncryption) {
                const sessionKey = this.crypto.getSessionKey();
                const encrypted = await this.crypto.encrypt(jsonData, sessionKey);
                localStorage.setItem(key, JSON.stringify({ encrypted: true, data: encrypted }));
            } else {
                localStorage.setItem(key, jsonData);
            }

            return true;
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded');
            }
            throw error;
        }
    }

    /**
     * Safely retrieves data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {Promise<any>} Retrieved data
     */
    async getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);

            if (parsed && parsed.encrypted) {
                const sessionKey = this.crypto.getSessionKey();
                const decrypted = await this.crypto.decrypt(parsed.data, sessionKey);
                return JSON.parse(decrypted);
            }

            return parsed;
        } catch (error) {
            console.error(`Failed to load ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Removes item from localStorage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
        }
    }

    /**
     * Clears all storage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }
}
