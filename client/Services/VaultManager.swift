/* VAULT MANAGER 

controlling how the app modifies the vault -- this is where the backend logic really lives 
-- UI will call this file --> these are the FUNCTIONS used for updates 
-- controls all data changes
-- ensures consistency 


the user does something: adds new medication, changes tracking routine, logs intake 
then the vault manager is responsible for managing the vault contents in memory --> coordinates saving/loading through LocalStore.swift
uses functions to update, edit, delete  

1. loads data when app is started up 
2. add/edit/delete --> modifies the app
3. commits changes to the disk using LocalStore.swift 


note: function parameters required unless followed by = 
for example, purpose and notes are optional for adding a new medication in MedicationRecord 

EXAMPLE OF FLOW FOR VAULT MANAGER:
* vault manager is created, init runs and loads existing vault from disk, now vault is a real object in mem
* UI calls function because user adds a medication 
* inside addMedication, a new medication object is created 
* the vault data is updated in this line: vault.medications.append(newMedication)
* persist saves the update --> persist function saves 

*/


final class VaultManager {
    //create a localstorage instance --> to read and write files onto disk
    private let store = LocalStore()
    private var key: SymmetricKey

    //in memory copy of ALL app data --> private(set) means other files can READ vault
    //but only VaultManager can EDIT --> protects data from being changed elsewhere 
    prive(set) var vault: VaultData
    
    //init runs at app startup --> when VaultManager is created
    init() {
        if let existingKey = try? CryptoEngine.loadKeyFromKeychain() {
            self.key = existingKey
        } else {
            let newKey = (try? CryptoEngine.generateVaultKey()) ?? SymmetricKey(size: .bits256)
            try? CryptoEngine.saveKeyToKeychain(newKey)
            self.key = newKey
        }
        do {

            //try loading existing vault from disk
            vault = try store.load(using: key)

        } catch {

            //if loading fails
            print("Failed to load vault: \(error)")

            //in this case, start with empty vault 
            vault = VaultData()

        }
    }

    //Medication operations 
    //functions to manage MedicationRecord data

    //pass in any params for the new medication 
    func addMedication(
        name: String,
        dosage: String,
        frequency: String,
        purpose: String? = nil,
        notes: String? = nil
    ) {

        //create new MedicationRecord obj 
        let newMedication = MedicationRecord(
            name: name,
            dosage: dosage,
            frequency: frequency,
            purpose: purpose,
            notes: notes
        )

        //add to vault's medication data 
        vault.medications.append(newMedication)

        //save updated vault to disk
        persist()
    }

    //to delete a medication 
    func deleteMedication(id: UUID) {

        //remove any medication where id matches the given id
        vault.medications.removeAll { $0.id == id }

        //remove any associated data! 
        //remove schedules linked to this medication
        vault.schedules.removeAll { $0.medicationId == id }

        //remove intake logs linked to this medication
        vault.intakeLogs.removeAll { $0.medicationId == id }

        //save updated vault
        persist()
    }

    //Schedule operations 

    func addSchedule(
        
        medicationId: UUID,
        time: String,
        recurrence: String,
        reminderEnabled: Bool = true,
        reminderLabel: String? = nil
        //schedule id is automatically made as noted in schedule.swift 

    ) {

        //create new Schedule obj 
        let newSchedule = Schedule(
            medicationId: medicationId,
            time: time,
            recurrence: recurrence,
            reminderEnabled: reminderEnabled,
            reminderLabel: reminderLabel
        )

        //add to vault's schedule data 
        vault.schedules.append(newSchedule)

        //save updated vault to disk
        persist()
    }

    //to delete a schedule 
    func deleteSchedule(id: UUID) {

        //remove any schedule where id matches the given id
        vault.schedules.removeAll { $0.id == id }

        //save updated vault
        persist()
    }

    //IntakeLog operations 
    //functions to manage IntakeLog data

    func logIntake(
        medicationId: UUID,
        scheduledTime: String? = nil,
        note: String? = nil
        //remember, takenAt is made automatically when entered 
    ) {
        // Create a new IntakeLog object
        let log = IntakeLog(
            medicationId: medicationId,
            scheduledTime: scheduledTime,
            note: note
        )

        // Add it to intake history
        vault.intakeLogs.append(log)

        // Save changes
        persist()
    }

    //PERSIST!!! 
    //Helper function for saving the vault

    private func persist() {
        do {
            //update the vault's "last modified" timestamp
            vault.updatedAt = Date()

            //save the entire vault to disk via LocalStore
            //using store as define above, called the saved function defined in LocalStore
            try store.save(vault, using:key)

            print("Vault saved successfully!")

        } catch {
            // If saving fails, log error
            print("Failed to save vault: \(error)")
        }
    }
}


