# TabSafe Client

## Purpose 
This folder contains the client-side iOS app code for TabSafe.

## Folder structure 

* Models/ — defining the shape of the data (how it is stored in the app, fields and types)

IntakeLog.swift --> used for time specific updates, logging time med was taken and supposed to be taken
MedicationRecord.swift -->  name, dosage, frequency, purpose, etc
Schedule.swift --> when taken vs scheduled time to be taken, reminder enabled and label optional
VaultData.swift --> stores ALL user data to be saved as a JSON and encrypted as one block

* Services/ — app logic aka storage, vault management, authorization and session login

LocalStore.swift --> writes and reads JSON from disk
VaultManager.swift --> manages vault updates/edits/deletions, and makes sure the memory is consistent w updates 
AuthSessionManager.swift --> auto-lock (haven't started this yet)

* ViewModels/ — bridging UI and app logic 

Connects UI actions (button taps, form input) to services, prepares data to be displayed in views 

* Views/ — SwiftUI screens for frontend 


## Current plan 
1. Build local vault/data flow -- define models, implement local storage, implement vault logic 
2. Keep storage a vault logic separate from encryption 
3. Secure enclave/encryption implementation happens later (Huda)

## TODOs
- AuthSessionManager: app lock timeout after inactivity
- Re-auth gate before sensitive views (history, schedules)
- Notification scheduling with non-sensitive payloads
- Testing: confirm no plaintext written to disk
- Testing: confirm no sensitive data in notification payload
- Backup: ciphertext-only upload to server (stretch)

## Question for group 
- EfficacyNote: do we actually need this? I'm not sure I understand what its for. Could it just be a notes field on IntakeLog?
