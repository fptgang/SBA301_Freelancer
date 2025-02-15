export function escapeSingleQuotes(str: string): string {
  return str
    .replace(/'/g, "''") // Escape single quotes by doubling them
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/\n/g, "\\n") // Replace newlines with \n
    .replace(/\r/g, "\\r") // Replace carriage returns with \r
    .replace(/\t/g, "\\t") // Replace tabs with \t
    .replace(/\0/g, "\\0") // Replace null bytes with \0
    .replace(/\x1a/g, "\\Z"); // Replace ctrl+Z with \Z
}