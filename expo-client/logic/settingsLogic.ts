import { AppSettings } from "../models/Settings";
import { loadVault, saveVault } from "../storage/localStore";

export async function getSettings(): Promise<AppSettings> {
  const vault = await loadVault();
  return vault.settings;
}

export async function updateSettings(
  partialSettings: Partial<AppSettings>
): Promise<AppSettings> {
  const vault = await loadVault();

  const updatedSettings: AppSettings = {
    ...vault.settings,
    ...partialSettings,
  };

  const updatedVault = {
    ...vault,
    settings: updatedSettings,
  };

  await saveVault(updatedVault);

  return updatedSettings;
}