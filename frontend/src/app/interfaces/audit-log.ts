export interface AuditLog
{
  id?: number;
  type: string;
  ref: string;
  actor: string;
  message: string;
  creation_timestamp?: string;
}
