import {escapeSingleQuotes} from "../utils";
import {ProfileSkill} from "./ProfileSkill";

export class Profile {
  profile_id: number;
  created_at: Date;
  education: string | null;
  is_visible: boolean;
  language: string | null;
  overview: string | null;
  phone_number: string | null;
  updated_at: Date;
  account_id: number | null;

  profileSkills: ProfileSkill[] = [];

  constructor(
    profile_id: number,
    created_at: Date,
    education: string | null,
    is_visible: boolean,
    language: string | null,
    overview: string | null,
    phone_number: string | null,
    updated_at: Date,
    account_id: number | null,
    profileSkills: ProfileSkill[]
  ) {
    this.profile_id = profile_id;
    this.created_at = created_at;
    this.education = education;
    this.is_visible = is_visible;
    this.language = language;
    this.overview = overview;
    this.phone_number = phone_number;
    this.updated_at = updated_at;
    this.account_id = account_id;
    this.profileSkills = profileSkills;
  }

  static dump(profiles: Profile[]): string {
    if (profiles.length === 0) return '';

    const columns = [
      'profile_id',
      'created_at',
      'education',
      'is_visible',
      'language',
      'overview',
      'phone_number',
      'updated_at',
      'account_id'
    ];

    const values = profiles.map(profile => {
      return `(${[
        profile.profile_id,
        profile.created_at ? `'${profile.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        profile.education ? `'${escapeSingleQuotes(profile.education)}'` : 'NULL',
        profile.is_visible ? 1 : 0,
        profile.language ? `'${escapeSingleQuotes(profile.language)}'` : 'NULL',
        profile.overview ? `'${escapeSingleQuotes(profile.overview)}'` : 'NULL',
        profile.phone_number ? `'${escapeSingleQuotes(profile.phone_number)}'` : 'NULL',
        profile.updated_at ? `'${profile.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL',
        profile.account_id ?? 'NULL'
      ].join(', ')})`;
    });

    return `INSERT INTO \`profiles\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES\n${values.join(',\n')};`;
  }
}
