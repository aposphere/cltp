export function sqlValueFormatter(v: unknown)
{
  if (v === undefined || v === null) return "NULL"
  else if (typeof v === "string") return `'${v}'`
  else if (typeof v === "object") return JSON.stringify(v)
  else return v
}
