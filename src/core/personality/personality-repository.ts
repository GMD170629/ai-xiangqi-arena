import { builtinPersonalities, type PersonalityProfile } from './profiles'
import { readSetting, writeSetting } from '../persistence/settings-store'

const KEY = 'custom-personalities'

export class PersonalityRepository {
  async custom(): Promise<PersonalityProfile[]> { return readSetting<PersonalityProfile[]>(KEY, []) }
  async all(): Promise<PersonalityProfile[]> { return [...builtinPersonalities, ...(await this.custom())] }

  async save(profile: PersonalityProfile): Promise<void> {
    const items = await this.custom()
    const index = items.findIndex((item) => item.id === profile.id)
    if (index >= 0) items[index] = profile; else items.push(profile)
    await writeSetting(KEY, items)
  }

  async remove(id: string): Promise<void> {
    await writeSetting(KEY, (await this.custom()).filter((item) => item.id !== id))
  }
}
