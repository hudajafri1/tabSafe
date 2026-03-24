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
    func save(_ vault: VaultData) throws {
        let encoder = JSONEncoder()

        // make JSON readable (for debugging)
        encoder.outputFormatting = .prettyPrinted

        //.iso 8601 standard for representing dates and times --> for consistency YYYYMMDD and 24 hour format 
        encoder.dateEncodingStrategy = .iso8601

        //converting swift data object VAULT into JSON using encoder 
        let data = try encoder.encode(vault)

        // writing the contents of data to the fileURL location 
        // atomic is important for data integrity --> look into this later bc I'm confused about it 
        try data.write(to: fileURL, options: .atomic)
    }

    //read the data from the disk and convert it into usable VaultData object in mem
    //load takes no params, might fail and throw an error, returns a VaultData object 
    func load() throws -> VaultData {

        //check if a file exists using guard, if not, exit and return empty VaultData object 
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            return VaultData()
        }

        //read raw data from file --> we now get raw bytes (json text)
        let data = try Data(contentsOf: fileURL)

        let decoder = JSONDecoder()

        //interpreting the data in JSON according to iso standard
        decoder.dateDecodingStrategy = .iso8601

        //take JSON data and convert it into VaultData object 
        //match fields by name and recursively decode everything 
        return try decoder.decode(VaultData.self, from: data)
    }
}

