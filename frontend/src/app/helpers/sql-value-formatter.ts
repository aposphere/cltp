/**
 * Minimal escape function for sql values
 */
 export function sqlValueFormatter(v: unknown): string
{
  if (v === undefined || v === null) return "NULL"
  else if (typeof v === "string") return `'${ v }'`
  else if (typeof v === "object") return JSON.stringify(v)
  else return v as string
}
