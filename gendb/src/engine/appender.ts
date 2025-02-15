import * as fs from 'fs';

const TRUNCATE_SQL = `
begin transaction;

use hirable;

set @@foreign_key_checks = 0;

truncate table files;

truncate table messages;

truncate table milestones;

truncate table profile_skills;

truncate table profiles;

truncate table project_required_skills;

truncate table projects;

truncate table proposals;

truncate table project_categories;

truncate table refresh_token;

truncate table skills;

truncate table transactions;

truncate table account;`;


class sqlFileAppender {
  private buffer: string[] = TRUNCATE_SQL.split('\n');
  private readonly filePath: string = 'dump.sql';
  private readonly bufferSize: number = 1000;
  private inMemoryMode: boolean = false;

  public setInMemoryMode(enabled: boolean): void {
    this.inMemoryMode = enabled;
  }

  public append(line: string): void {
    this.buffer.push(line);

    if (!this.inMemoryMode && this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  public prepare(): void {
    if (this.inMemoryMode) {
      this.buffer = TRUNCATE_SQL.split('\n');
      return;
    }

    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }

  public flush(): void {
    if (this.inMemoryMode || this.buffer.length === 0) {
      return;
    }

    fs.appendFileSync(this.filePath, this.buffer.join('\n') + '\n', {encoding: 'utf8'});
    this.buffer = [];
  }

  public getBuffer(): string[] {
    return [...this.buffer, '\nset @@foreign_key_checks = 1;  \ncommit;'] ;
  }
}

export const SqlFileAppender = new sqlFileAppender();