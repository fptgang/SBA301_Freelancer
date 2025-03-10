import {SqlFileAppender} from "../appender.js";
import {File} from "../model/File.js";

export class filePool {
  private files: File[] = [];
  private nextId: number = 1;

  countMilestoneDeliverables(milestoneId: number): number {
    return this.files.filter(file => file.milestone_id === milestoneId).length;
  }

  add(file: File) {
    this.files.push(file);
  }

  getNextId(): number {
    return this.nextId++;
  }

  dump(): string {
    const filesDump = File.dump(this.files);
    return filesDump.length > 0 ? '\n' + filesDump : '';
  }

  count(): number {
    return this.files.length;
  }
}

export let FilePool = new filePool();
export const ResetFilePool = () => FilePool = new filePool();
export const DumpFiles = () => SqlFileAppender.append(FilePool.dump());