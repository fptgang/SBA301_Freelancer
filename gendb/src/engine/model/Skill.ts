import {escapeSingleQuotes} from "../utils.js";

export class Skill {
  skill_id: number;
  created_at: Date;
  is_visible: boolean;
  name: string;
  updated_at: Date;

  constructor(
    skill_id: number,
    created_at: Date,
    is_visible: boolean,
    name: string,
    updated_at: Date
  ) {
    this.skill_id = skill_id;
    this.created_at = created_at;
    this.is_visible = is_visible;
    this.name = name;
    this.updated_at = updated_at;
  }

  static dump(skills: Skill[]): string {
    if (skills.length === 0) return '';

    const values = skills.map(skill => {
      return `(${skill.skill_id},` +
        `'${skill.created_at.toISOString().slice(0, 19)}.000000',` +
        `${skill.is_visible ? 1 : 0},` +
        `'${escapeSingleQuotes(skill.name)}',` +
        `'${skill.updated_at.toISOString().slice(0, 19)}.000000')`;
    }).join(',\n');

    return `INSERT INTO \`skills\` (\`skill_id\`, \`created_at\`, \`is_visible\`, \`name\`, \`updated_at\`) VALUES\n${values};`;
  }
}