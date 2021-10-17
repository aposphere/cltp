import { Component, OnDestroy } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs'; import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { v4 } from 'uuid';
import { InterpretationExported } from 'src/app/interfaces/interpretation_exported.table';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';
import { Interpretation } from 'src/app/interfaces/interpretation.table';
import moment from 'moment';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { Credentials } from 'src/app/interfaces/credentials';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { ProbeResult } from 'src/app/interfaces/probe-result.view';


@Component({
  selector: 'app-download-probe-results',
  templateUrl: './download-probe-results.component.html',
  styleUrls: ['./download-probe-results.component.scss'],
})
export class DownloadProbeResultsComponent implements OnDestroy
{
  /** The user credentials */
  credentials?: Credentials

  /** Pending interpretations to be downloaded */
  pendingInterpretations: Interpretation[] = []

  /** The probe results entries */
  probeResults: { label: string, data: string }[] = []

  /** Flag probe results downloaded */
  probeResultsDownloaded = false

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
    public configService: ConfigService,
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);

    this.loadProbeResults()
    this.loadPendingInterpretations()
  }

  /**
   * Load pending interpretations
   */
  async loadPendingInterpretations(): Promise<void>
  {
    let results;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT * FROM cltp.interpretation_pending;`)

      results = (resultsRes as { recordset: Interpretation[] }).recordset
    }
    catch (e)
    {
      alert("Could not get the pending interpretations from the database!")
      console.error(e)
      return
    }

    this.pendingInterpretations = results
  }

   /**
   * Load probe results
   */
  async loadProbeResults(): Promise<void>
  {
    let results;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT * FROM cltp.probe_result_pending;`)

      results = (resultsRes as { recordset: ProbeResult[] }).recordset
    }
    catch (e)
    {
      alert("Could not get the probe results from the database!")
      console.error(e)
      return
    }

    this.probeResults = results.map((el) =>
    {
      return { label: `result_${ el.barcode_nummer }_${ moment(el.untersuchung_datum).format("YYYYMMDD-HHMMSS") }.json`, data: JSON.stringify(el) }
    })

    if (this.probeResults.length === 0) this.probeResultsDownloaded = true
  }



   /**
   * Download probe results
   */
    async downloadProbeResults(): Promise<void>
  {
    const zip = new JSZip();

    // Collect all files into the zip
    for (const probeResult of this.probeResults) zip.file(probeResult.label, probeResult.data);

    const c = await zip.generateAsync({ type: "blob" })

    // Save the zip
    saveAs(c, `probe-results-${ Date.now() }.zip`);

    this.probeResultsDownloaded = true
  }

  /**
   * Mark the interpretations as exported
   */
  async markInterpretationsAsExported(): Promise<void>
  {
    if (!confirm("Make sure you downloaded all the probe results! If yes, mark them as 'exported' and they will get archived.")) return

    let q = ""

    // Get actor
    const actor = this.credentials?.username || 'anonymous'

    // Mark all pendings as interpretation
    for (const pendingInterpretation of this.pendingInterpretations)
    {
      const interpretationExported: InterpretationExported =
      {
        id: v4(),
        interpretation_id: pendingInterpretation.id,
      }
      q += `INSERT INTO cltp.interpretation_exported (${ Object.keys(interpretationExported).join(',') }) VALUES (${ Object.values(interpretationExported).map(sqlValueFormatter).join(',') });`
      const auditLog: AuditLog =
      {
        type: 'export-interpretation',
        ref: interpretationExported.id,
        actor: actor,
        message: `Interpretation [${ pendingInterpretation.id }] exported as [${ interpretationExported.id }] by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
    }

    try
    {
      await this.dbService.query(q)

      this.probeResults = []
    }
    catch (e)
    {
      alert("Could not mark the results as exported on the database!")
      console.error(e)
    }
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
