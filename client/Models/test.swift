import Foundation

func runTest() {
    let manager = VaultManager()

    // Add medication
    manager.addMedication(
        name: "Vitamin D",
        dosage: "1000 IU",
        frequency: "daily",
        notes: "test note"
    )

    // Get the first medication
    if let med = manager.vault.medications.first {
        print("Medication added:", med.name)

        // Add schedule
        manager.addSchedule(
            medicationId: med.id,
            time: "08:00",
            recurrence: "daily"
        )

        // Log intake
        manager.logIntake(
            medicationId: med.id,
            note: "felt good"
        )
    }

    print("Medications count:", manager.vault.medications.count)
    print("Schedules count:", manager.vault.schedules.count)
    print("Logs count:", manager.vault.intakeLogs.count)
}

// Run it
runTest()