import {SqlFileAppender} from "../appender.js";
import {Profile} from "../model/Profile.js";
import {ProfileSkill} from "../model/ProfileSkill.js";

export class profilePool {
  private profiles: Profile[] = [];
  private nextId: number = 1;
  private nextSkillId: number = 1;

  add(profile: Profile) {
    this.profiles.push(profile);
  }

  getNextId(): number {
    return this.nextId++;
  }

  getNextSkillId(): number {
    return this.nextSkillId++;
  }

  dump(): string {
    const profileDump = Profile.dump(this.profiles);
    const skillsDump = ProfileSkill.dump(
      this.profiles.flatMap(p => p.profileSkills)
    );

    return '\n' + [profileDump, skillsDump]
      .filter(dump => dump.length > 0)
      .join('\n\n');
  }
}

export let ProfilePool = new profilePool();
export const ResetProfilePool = () => ProfilePool = new profilePool();
export const DumpProfiles = () => SqlFileAppender.append(ProfilePool.dump());
