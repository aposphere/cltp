/**
 * Table `interpretation`
 */
 export interface Interpretation
{
  id: string;
  result_entry_id: string;
  pool_id: string;
  interpretation: string;
  creation_timestamp?: string;
}
