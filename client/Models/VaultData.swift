/* VAULT DATA OBJECT

Represents the entire local vault for the app --> stores ALL user data to be saved as a JSON and encrypted as one block 

Current contents:
- medications: the main records for each medication/supplement
- schedules: reminder/timing rules linked to medications
- intakeLogs: time-based history of doses taken, including optional notes

Next steps:
- connect encryption before writing vault data to disk

*/

import Foundation


struct VaultData: Codable {

    //all medication/supplement records stored in the app
    var medications: [MedicationRecord]

    //all schedules/reminder rules for medications
    var schedules: [Schedule]

    //all intake history records, including optional notes (per dose/day/intake)
    var intakeLogs: [IntakeLog]

    //date created
    let createdAt: Date

    //date updated
    var updatedAt: Date

    //note the plural to distinguish from object like Schedule
    init(
        medications: [MedicationRecord] = [],
        schedules: [Schedule] = [],
        intakeLogs: [IntakeLog] = [],
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.medications = medications
        self.schedules = schedules
        self.intakeLogs = intakeLogs
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}