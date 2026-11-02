/**
 * Cryptographic utility functions for HMAC-SHA256 signature generation
 * and timing-safe verification for bidirectional webhook communications.
 * Uses the standard Web Crypto API (crypto.subtle) available globally
 * in Convex V8 and modern JavaScript runtimes.
 */

/**
 * Computes an HMAC-SHA256 hex digest for a string payload using a shared secret.
 */
export async function generateHmacSignature(
    payload: string,
    secret: string,
): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData,
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates whether the incoming signature matches the computed HMAC-SHA256 hash.
 * Employs a constant-time comparison to prevent timing attacks.
 */
export async function verifyHmacSignature(
    payload: string,
    signature: string | null | undefined,
    secret: string,
): Promise<boolean> {
    if (!signature || !secret || !payload) {
        return false;
    }

    try {
        const expectedSignature = await generateHmacSignature(payload, secret);

        // Normalize casing
        const sigClean = signature.trim().toLowerCase();
        const expectedClean = expectedSignature.toLowerCase();

        if (sigClean.length !== expectedClean.length) {
            return false;
        }

        // Constant-time XOR comparison to defend against timing attacks
        let mismatch = 0;
        for (let i = 0; i < sigClean.length; i++) {
            mismatch |= sigClean.charCodeAt(i) ^ expectedClean.charCodeAt(i);
        }

        return mismatch === 0;
    } catch {
        return false;
    }
}
