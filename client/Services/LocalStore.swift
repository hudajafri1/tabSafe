/* LOCAL STORAGE ENCODING
 
function of LocalStore.swift: save and load the vault from the phone
--> currently, VaultData is all the data from the app in memory
--> this script needs to save permanently (as bytes) and load when called upon later 

SAVING:
VaultData (swift object in mem) --> JSON (using JSONEncoder.encode()) --> JSON data (raw bytes) write to: fileURL) --> file on disk "vault.json"

LOADING: 
file on disk data(contentsOf:) --> raw JSON bytes --> JSONDecoder() --> VaultData swift object in memory 

JSONEncoder and JSONDecoder work bc we used Codable as object type! 

*****:ATER: encryption inserted between encoding and writing*****


*/

import Foundation

import CryptoKit
import CommonCrypto
import Security

// AES-256-GCM encryption module (encrypt/decrypt JSON vault)
//Nonce generation (CSPRNG, never reused)
//Authentication tag validation on decrypt
//Key generation on first vault init (256-bit random)
//OS Keychain / Keystore integration for key storage
//PIN-to-key derivation (PBKDF2 + salt) as fallback path

struct EncryptedPayload: Codable { //encodes within message
    let ciphertext: Data //content
    let nonce: Data
    let tag: Data //AES-GCM
}

//note i only defined one error, more detailed ones to come!
enum CryptoEngineError: Error {
    case encryptionFailed
    var errorDescription: String? {
        switch self {
        case .encryptionFailed: return "Encryption failed."
        }
    }
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
            throw CryptoEngineError.encryptionFailed
            //add error message here
        }
        return EncryptedPayload(ciphertext: sealedBox.ciphertext, nonce: Data(nonce), tag: sealedBox.tag)
        //note nonce is 12bytes and tag is 16bytes
    }
    //now decrypt
    static func decrypt<T: Decodable>(_ payload: EncryptedPayload, as type: T.Type, using key: SymmetricKey) throws -> T {
        let nonce: AES.GCM.Nonce
        do {
            nonce = try AES.GCM.Nonce(data: payload.nonce)
        } catch {
            throw CryptoEngineError.encryptionFailed
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
            throw CryptoEngineError.encryptionFailed
            //add error message here
        }
        do {
            return try JSONDecoder().decode(type, from: plaintext)
        } catch {
            throw CryptoEngineError.encryptionFailed
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
            throw CryptoEngineError.encryptionFailed
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
            throw CryptoEngineError.encryptionFailed
        }
        guard let keyData = result as? Data, keyData.count == 32 else {
            throw CryptoEngineError.encryptionFailed
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
        guard status == errSecSuccess || status == errSecItemNotFound else {
            throw CryptoEngineError.encryptionFailed
            //add error message here
        }
    }
    //p2p , derived symmetric key
    static func deriveKey(fromPIN pin: String, salt: Data, iterations: Int = 100_000) throws -> SymmetricKey {
        guard salt.count >= 16, iterations>0 else {
            throw CryptoEngineError.encryptionFailed
            //add error msg here later
        }
        guard let pinData = pin.data(using: .utf8) else {
            throw CryptoEngineError.encryptionFailed
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
            throw CryptoEngineError.encryptionFailed
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


//save and load entire vault to local storage
final class LocalStore {

    //name of file on device 
    private let fileName = "vault.json"

    //find full file path in the applcations documents directory
    private var fileURL: URL {
        //get the applications documents directory
        let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]

        //add "vault.json" to directory path
        return documentsDirectory.appendingPathComponent(fileName)
    }

    //save entire vault to disk --> asked claude to help me with this, had no idea what I was doing 
    // here the _ sign means me dont need the label to call the function like vault: myVault, we can just save save(myVault)
    //throws is to make it throw an error in case of failure  
    func save(_ vault: VaultData, using key: SymmetricKey) throws {
        let encoder = JSONEncoder()

        // make JSON readable (for debugging)
        encoder.outputFormatting = .prettyPrinted

        //.iso 8601 standard for representing dates and times --> for consistency YYYYMMDD and 24 hour format 
        encoder.dateEncodingStrategy = .iso8601


        // writing the contents of data to the fileURL location 
        // atomic is important for data integrity --> look into this later bc I'm confused about it 
        let payload = try CryptoEngine.encrypt(vault, using: key)
        let payloadData = try JSONEncoder().encode(payload)
        try payloadData.write(to: fileURL, options: .atomic)
    }

    //read the data from the disk and convert it into usable VaultData object in mem
    //load takes no params, might fail and throw an error, returns a VaultData object 
    func load(using key: SymmetricKey) throws -> VaultData {

        //check if a file exists using guard, if not, exit and return empty VaultData object 
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return VaultData()
        }

        //read raw data from file --> we now get raw bytes (json text)
        let data = try Data(contentsOf: fileURL)

        let payload = try JSONDecoder().decode(EncryptedPayload.self, from: data)
        return try CryptoEngine.decrypt(payload, as: VaultData.self, using: key)
    }
}

