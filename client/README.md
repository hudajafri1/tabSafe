# TabSafe Client

## Purpose 
This folder contains the client-side iOS app code for TabSafe.

## Folder structure 

* TabSafe/Models/ — defining the shape of the data (how it is stored in the app, fields and types)

IntakeLog.swift --> used for time specific updates, logging time med was taken and supposed to be taken
MedicationRecord.swift -->  name, dosage, frequency, purpose, etc
Schedule.swift --> when taken vs scheduled time to be taken, reminder enabled and label optional
VaultData.swift --> stores ALL user data to be saved as a JSON and encrypted as one block

* TabSafe/Services/ — app logic aka storage, vault management, authorization and session login

LocalStore.swift --> writes and reads JSON from disk
VaultManager.swift --> manages vault updates/edits/deletions, and makes sure the memory is consistent w updates 
AuthSessionManager.swift --> auto-lock (haven't started this yet)

* TabSafe/ViewModels/ — bridging UI and app logic 

Connects UI actions (button taps, form input) to services, prepares data to be displayed in views 

* TabSafe/Views/ — SwiftUI screens for frontend 


## Current plan 
1. build local vault/data flow -- define models, implement local storage, implement vault loggic 
2. keep storage a vault logic separate from encryption 
3. secure enclave/encryption inmplementation happens later (Huda)