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

export function generateSegmentedArray(k: number, minValue = 0.05) {
  let remaining = 1.0 - k * minValue; // Remaining value to distribute
  if (remaining < 0) throw new Error("k is too large for the given minValue");

  // Generate k-1 random breakpoints in (0, remaining) and sort them
  let breakpoints = Array.from({length: k - 1}, () => Math.random() * remaining).sort((a, b) => a - b);

  // Compute raw segments
  let segments = [];
  let prev = 0;
  for (let bp of breakpoints) {
    segments.push(bp - prev + minValue);
    prev = bp;
  }
  segments.push(remaining - prev + minValue); // Last segment (unrounded)

  // Round all but the last value to 2 decimal places
  let roundedSegments = segments.slice(0, -1).map(v => Math.round(v * 100) / 100);

  // Adjust the last segment to ensure sum is exactly 1.0
  let roundedSum = roundedSegments.reduce((a, b) => a + b, 0);
  let lastValue = 1.0 - roundedSum; // Keep full precision for last value

  roundedSegments.push(lastValue); // Append last value (not rounded)
  return roundedSegments;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}