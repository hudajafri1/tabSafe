import CryptoKit
import CommonCrypto
import Security

// AES-256-GCM encryption module (encrypt/decrypt JSON vault)
//Nonce generation (CSPRNG, never reused)
//Authentication tag validation on decrypt
//Key generation on first vault init (256-bit random)
//OS Keychain / Keystore integration for key storage
//PIN-to-key derivation (PBKDF2 + salt) as fallback path

struct EncryptedPaylod: Codable { //encodes within message
    let ciphertext: Data //content
    let nonce: Data
    let tag: Data //AES-GCM
}

struct CryptoEngine {
    private static let keychainLabel = "com.tabsafe.vaultkey"
    //serialized to JSON, encrypts with AES-256-GCM, returns cipher+nonce+authTag
    static func encrypt<T: Encodable>(_ value: T, using key: SymmetricKey) throws -> EncryptedPayload {
        let plaintext = try JSONEncoder().encode(value)
        let nonce = AES.GCM.Nonce()
        let sealedBox: AES.GCM.SealedBox
        do {
            sealedBox = try AES.GCM.seal(plaintext, using: key, nonce: nonce)
        } catch {
            continue
            //add error message here
        }
        return EncryptedPaylod(ciphertext: sealedBox.ciphertext, nonce: Data(nonce), tag: sealedBox.tag)
        //note nonce is 12bytes and tag is 16bytes
    }
    //now decrypt
    static func decrypt<T: Decodable>(_ payload: EncryptedPayload, as type: T.Type, using key: SymmetricKey) throws -> T {
        let nonce: AES.GCM.Nonce
        do {
            nonce = try AES.GCM.Nonce(data: payload.nonce)
        } catch {
            continue
            //add error message here later
        }
        let sealedBox = try AES.GCM.SealedBox(
            nonce: nonce,
            ciphertext: payload.ciphertext,
            tag: payload.tag
        )
        let plaintext: Data
        do {
            plaintext = try AES.GCM.open(sealedBox, using: key)
        } catch {
            continue
            //add error message here
        }
        do {
            return try JSONDecoder().decode(type, from: plaintext)
        } catch {
            continue
            //add error msg
        }
    }
    
    //256 symmetric key
    static func generateVaultKey() throws -> SymmetricKey {
        return SymmetricKey(size: .bits256)
    }
    //stores vault key
    static func saveKeyToKeychain(_ key: SymmetricKey) throws {
        let keyData = key.withUnsafeBytes {
            Data($0)
        }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrLabel as String: keychainLabel,
            kSecAttrAccount as String: keychainLabel,
            kSecValueData as String: keyData,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
        ]
        //for the above : only accessible when device passocde is set (important for our apps privacy ! and never migrates to a new device , stored to ios keychain
        // below: deleted existing entries
        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            continue
            //add error here later
        }
    }
    //get vault key
    static func loadKeyFromKeychain() throws -> SymmetricKey? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrLabel as String: keychainLabel,
            kSecAttrAccount as String: keychainLabel,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        if status == errSecItemNotFound {
            return nil
        }
        guard status == errSecSuccess else {
            // add error msg here later
            continue
        }
        guard let keyData = result as? Data, keyData.count == 32 else {
            continue
            //add error msg here
        }
        return SymmetricKey(data: keyData)
    }
    //delet key
    static func deleteKeyFromKeychain() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrLabel as String: keychainLabel,
            kSecAttrAccount as String: keychainLabel
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFount else {
            continue
            //add error message here
        }
    }
    //p2p , derived symmetric key
    static func deriveKey(fromPIN pin: String, salt: Data, iterations: Int = 100_000) throws -> SymmetricKey {
        guard salt.count >= 16, iterations>0 else {
            continue
            //add error msg here later
        }
        guard let pinData = pin.data(using: .utf8) else {
            continue
            //add error msg later
        }
        var derivedKeyData = Data(count: 32) //256bits
        let status = derivedKeyData.withUnsafeMutableBytes {
            derivedBytes in pinData.withUnsafeBytes {
                pinBytes in salt.withUnsafeBytes {
                    saltBytes in CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        pinBytes.baseAddress, pinData.count,
                        saltBytes.baseAddress, salt.count,
                        CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                        UInt32(iterations),
                        derivedBytes.baseAddress, 32
                    )
                }
            }
        }
        guard status == kCCSuccess else {
            //add error msg here
            continue
        }
        return SymmetricKey(data: derivedKeyData)
    }
    // generates salt for PBKDF2
    static func generateSalt(length: Int = 16) -> Data {
        var salt = Data(count: length)
        _ = salt.withUnsafeMutableBytes {
            SecRandomCopyBytes(kSecRandomDefault, length, $0.baseAddress!)
        } return salt
    }
}
