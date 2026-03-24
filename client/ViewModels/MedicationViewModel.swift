/* MEDICATION VIEW MODEL 

bridges UI and the backend logic 
UI should not talk to VaultManager or LocalStore directly 
--> keeps functions distinct and separate so its easier to identify errors and improvements 

viewModel is a "translator" --> takes data stored on disk and makes it data displayed on screen 

@Published means swiftUI views automatically update when the values change 
@MainActor means UI updates happen on the main thread (needed for swiftUI)
*/

import Foundation

@MainActor
//mainActor means that any updates to the UI happen on the main thread --> swift convention
class MedicationViewModel: ObservableObject {

    //the @ signs tells the UI to read these lists directly and autoupdate 
    //published list means that whenever these change, swiftUI view will rerender
    //start as empty arrays 
    @Published var medications: [MedicationRecord] = []
    @Published var intakeLogs: [IntakeLog] = []
    @Published var schedules: [Schedule] = []

    //backend --> private meanas only ViewModel can touch it 
    private let vaultManager = VaultManager()

    init() {
        //load existing data from vault on startup
        refresh()
    }

    // pull latest data from vault into published vars
    //called after every change to keep updates synched
    func refresh() {
        medications = vaultManager.vault.medications
        intakeLogs = vaultManager.vault.intakeLogs
        schedules = vaultManager.vault.schedules
    }

    //for all following functions:
    //UI calls this when user adds new medication (or makes the respective change)
    //viewModel tells VaultManager to do the work 
    //refresh() updates the @published variables 
    //swiftUI rerenders automatically 
    func addMedication(name: String, dosage: String, frequency: String, purpose: String? = nil, notes: String? = nil) 
    {
        vaultManager.addMedication(
            name: name,
            dosage: dosage,
            frequency: frequency,
            purpose: purpose,
            notes: notes
        )
        refresh()
    }

    //delete a medication (also removes its schedules and logs)
    func deleteMedication(id: UUID) {
        vaultManager.deleteMedication(id: id)
        refresh()
    }

    //log an intake event
    func logIntake(medicationId: UUID, scheduledTime: String? = nil, note: String? = nil) {
        vaultManager.logIntake(
            medicationId: medicationId,
            scheduledTime: scheduledTime,
            note: note
        )
        refresh()
    }

    // add a schedule for a medication
    func addSchedule(medicationId: UUID, time: String, recurrence: String, reminderEnabled: Bool = true, reminderLabel: String? = nil) {
        vaultManager.addSchedule(
            medicationId: medicationId,
            time: time,
            recurrence: recurrence,
            reminderEnabled: reminderEnabled,
            reminderLabel: reminderLabel
        )
        refresh()
    }

    // delete a schedule
    func deleteSchedule(id: UUID) {
        vaultManager.deleteSchedule(id: id)
        refresh()
    }
}

