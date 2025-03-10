import {escapeSingleQuotes} from "../utils.js";

export class File {
  file_id: number;
  created_at: Date | null;
  file_name: string;
  file_type: string;
  file_url: string;
  is_visible: boolean;
  size: number;
  message_id: number | null;
  project_id: number | null;
  proposal_id: number | null;
  uploader_id: number;
  milestone_id: number | null;

  constructor(data: Partial<File>) {
    this.file_id = data.file_id || 0;
    this.created_at = data.created_at || null;
    this.file_name = data.file_name || '';
    this.file_type = data.file_type || '';
    this.file_url = data.file_url || '';
    this.is_visible = data.is_visible !== undefined ? data.is_visible : true;
    this.size = data.size || 0;
    this.message_id = data.message_id || null;
    this.project_id = data.project_id || null;
    this.proposal_id = data.proposal_id || null;
    this.uploader_id = data.uploader_id || 0;
    this.milestone_id = data.milestone_id || null;
  }

  static dump(files: File[]): string {
    if (!files.length) return '';

    const fields = [
      'file_id',
      'created_at',
      'file_name',
      'file_type',
      'file_url',
      'is_visible',
      'size',
      'message_id',
      'project_id',
      'proposal_id',
      'uploader_id',
      'milestone_id'
    ];

    const values = files.map(file => {
      return `(${[
        file.file_id,
        file.created_at ? `'${file.created_at.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
        `'${escapeSingleQuotes(file.file_name)}'`,
        `'${escapeSingleQuotes(file.file_type)}'`,
        `'${escapeSingleQuotes(file.file_url)}'`,
        file.is_visible ? 1 : 0,
        file.size,
        file.message_id || 'NULL',
        file.project_id || 'NULL',
        file.proposal_id || 'NULL',
        file.uploader_id,
        file.milestone_id || 'NULL'
      ].join(', ')})`;
    });

    return `INSERT INTO \`files\` (${fields.map(f => '`' + f + '`').join(', ')})
            VALUES ${values.join(',\n')};`;
  }
}