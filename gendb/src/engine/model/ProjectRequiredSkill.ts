import {ProficiencyLevel} from "./ProficiencyLevel.js";

export class ProjectRequiredSkill {
  project_skill_id: number;
  created_at: Date | null;
  proficiency: ProficiencyLevel;
  updated_at: Date | null;
  project_id: number;
  skill_id: number;

  constructor(
    project_skill_id: number,
    created_at: Date | null,
    proficiency: ProficiencyLevel,
    updated_at: Date | null,
    project_id: number,
    skill_id: number
  ) {
    this.project_skill_id = project_skill_id;
    this.created_at = created_at;
    this.proficiency = proficiency;
    this.updated_at = updated_at;
    this.project_id = project_id;
    this.skill_id = skill_id;
  }

  static dump(records: ProjectRequiredSkill[]): string {
    if (records.length === 0) return '';

    const values = records.map(record => {
      const created_at = record.created_at ?
        `'${record.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL';
      const updated_at = record.updated_at ?
        `'${record.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL';

      return `(${record.project_skill_id},` +
        `${created_at},` +
        `'${record.proficiency}',` +
        `${updated_at},` +
        `${record.project_id},` +
        `${record.skill_id})`;
    }).join(',\n');

    return `INSERT INTO \`project_required_skills\` ` +
      `(\`project_skill_id\`, \`created_at\`, \`proficiency\`, \`updated_at\`, \`project_id\`, \`skill_id\`) ` +
      `VALUES\n${values};`;
  }
}
