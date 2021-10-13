/**
 * Table `probe_order`
 */
 export interface ProbeOrder extends ProbeOrderJSON
{
  id: string;
  comment: string;
  creation_timestamp?: string;
}

/**
 * JSON content of the probe order
 */
export interface ProbeOrderJSON
{
  unternehmen_key: string;
  unternehmen_uid?: string;
  unternehmen_typ?: string;
  unternehmen_name?: string;
  unternehmen_abteilung?: string;
  unternehmen_ort?: string;
  unternehmen_postleitzahl?: string;
  unternehmen_strasse?: string;
  unternehmen_email?: string;
  unternehmen_telefon_geschaeft?: string;
  unternehmen_telefon_mobil?: string;
  poolmanager_nachname?: string;
  poolmanager_vorname?: string;
  barcode_nummer: string;
}
