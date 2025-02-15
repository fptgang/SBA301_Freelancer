import {ProficiencyLevel} from "./ProficiencyLevel.js";

export class ProfileSkill {
  profile_skill_id: number;
  created_at: Date | null;
  proficiency: ProficiencyLevel;
  updated_at: Date | null;
  profile_id: number;
  skill_id: number;

  constructor(
    profile_skill_id: number,
    created_at: Date | null,
    proficiency: ProficiencyLevel,
    updated_at: Date | null,
    profile_id: number,
    skill_id: number
  ) {
    this.profile_skill_id = profile_skill_id;
    this.created_at = created_at;
    this.proficiency = proficiency;
    this.updated_at = updated_at;
    this.profile_id = profile_id;
    this.skill_id = skill_id;
  }

  static dump(profileSkills: ProfileSkill[]): string {
    if (profileSkills.length === 0) return '';

    const formatDate = (date: Date | null): string => {
      if (!date) return 'NULL';
      return `'${date.toISOString().slice(0, 19)}.000000'`;
    };

    const formatValue = (value: any): string => {
      if (value === null) return 'NULL';
      if (value instanceof Date) return formatDate(value);
      if (typeof value === 'string') return `'${value}'`;
      return value.toString();
    };

    const values = profileSkills.map(ps =>
      `(${formatValue(ps.profile_skill_id)},` +
      `${formatDate(ps.created_at)},` +
      `'${ps.proficiency}',` +
      `${formatDate(ps.updated_at)},` +
      `${formatValue(ps.profile_id)},` +
      `${formatValue(ps.skill_id)})`
    ).join(',\n');

    return `INSERT INTO profile_skills ` +
      `(profile_skill_id, created_at, proficiency, updated_at, profile_id, skill_id) ` +
      `VALUES\n${values};`;
  }
}