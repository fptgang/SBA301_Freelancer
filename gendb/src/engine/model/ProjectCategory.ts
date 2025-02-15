import {escapeSingleQuotes} from "../utils.js";

export class ProjectCategory {
  project_category_id: number;
  created_at: Date | null;
  is_visible: boolean;
  name: string;
  updated_at: Date | null;

  constructor(
    project_category_id: number,
    created_at: Date | null,
    is_visible: boolean,
    name: string,
    updated_at: Date | null
  ) {
    this.project_category_id = project_category_id;
    this.created_at = created_at;
    this.is_visible = is_visible;
    this.name = name;
    this.updated_at = updated_at;
  }

  static dump(categories: ProjectCategory[]): string {
    if (categories.length === 0) return '';

    const header = 'INSERT INTO `project_categories` ' +
      '(`project_category_id`, `created_at`, `is_visible`, `name`, `updated_at`) VALUES\n';

    const values = categories.map(cat => {
      const created = cat.created_at ?
        `'${cat.created_at.toISOString().slice(0, 19)}.000000'` : 'NULL';
      const updated = cat.updated_at ?
        `'${cat.updated_at.toISOString().slice(0, 19)}.000000'` : 'NULL';

      return `(${cat.project_category_id},` +
        `${created},` +
        `${cat.is_visible ? 1 : 0},` +
        `'${escapeSingleQuotes(cat.name)}',` +
        `${updated})`;
    }).join(',\n');

    return header + values + ';';
  }
}