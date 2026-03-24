/* INTAKE LOG 

Read MedicationRecord.swift file for more thorough comments, to understand the details
This follows same format!! 

IntakeLog used for time specific updates 
When meds were taken, when they were scheduled for, other reflections about feeling during that time and place

*/

import Foundation 

//takes note of when a medication was ACTUALLY taken 
struct IntakeLog: Codable, Identifiable {
    let id: UUID 

    let medicationId: UUID 

    let scheduledTime: String?
    //time it was actually scheduled for -- optional

    let takenAt: Date 
    //not sure if this is ACTUALLY taking the time, but using Date as a placeholder

    var note: String?
    //optional user note, take late, took with crackers, felt emotional today, nausea, etc. 
    //NOTE: maybe make the reflections space more robust as we develop more 
    

    let createdAt: Date 

    init(
        id: UUID = UUID(),
        medicationId: UUID,
        scheduledTime: String? = nil,
        takenAt: Date = Date(),
        note: String? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.medicationId = medicationId
        self.scheduledTime = scheduledTime
        self.takenAt = takenAt
        self.note = note
        self.createdAt = createdAt
    }
}
