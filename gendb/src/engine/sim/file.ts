import {SqlFileAppender} from "../appender.js";
import {File} from "../model/File.js";

export class filePool {
  private files: File[] = [];
  private nextId: number = 1;

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
}

export let FilePool = new filePool();
export const ResetFilePool = () => FilePool = new filePool();
export const DumpFiles = () => SqlFileAppender.append(FilePool.dump());