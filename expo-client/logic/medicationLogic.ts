import { Medication } from "../models/Medication";
import { loadVault, saveVault } from "../storage/localStore";

export async function getMedications(): Promise<Medication[]> {
  const vault = await loadVault();
  return vault.medications;
}

export async function addMedication(
  medication: Medication
): Promise<Medication[]> {
  const vault = await loadVault();

  const updatedVault = {
    ...vault,
    medications: [...vault.medications, medication],
  };

  await saveVault(updatedVault);

  return updatedVault.medications;
}

export async function updateMedication(
  originalMedication: Medication,
  updatedMedication: Medication
): Promise<Medication[]> {
  const vault = await loadVault();

  let updated = false;

  const updatedMeds = vault.medications.map((med) => {
    if (
      !updated &&
      med.name === originalMedication.name &&
      med.dosage === originalMedication.dosage &&
      med.frequency === originalMedication.frequency &&
      med.notes === originalMedication.notes
    ) {
      updated = true;
      return updatedMedication;
    }
    return med;
  });

  const updatedVault = {
    ...vault,
    medications: updatedMeds,
  };

  await saveVault(updatedVault);

  return updatedVault.medications;
}

export async function deleteMedication(
  medicationToDelete: Medication
): Promise<Medication[]> {
  const vault = await loadVault();

  let deleted = false;

  const filteredMeds = vault.medications.filter((med) => {
    if (
      !deleted &&
      med.name === medicationToDelete.name &&
      med.dosage === medicationToDelete.dosage &&
      med.frequency === medicationToDelete.frequency &&
      med.notes === medicationToDelete.notes
    ) {
      deleted = true;
      return false;
    }
    return true;
  });

  const updatedVault = {
    ...vault,
    medications: filteredMeds,
  };

  await saveVault(updatedVault);

  return updatedVault.medications;
}