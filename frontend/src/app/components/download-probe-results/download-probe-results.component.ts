import { Component, OnDestroy } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs'; import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { v4 } from 'uuid';
import { InterpretationExported } from 'src/app/interfaces/interpretation_exported';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';
import { Interpretation } from 'src/app/interfaces/interpretation';
import moment from 'moment';

interface ProbeResult
{
  creation_timestamp: string,
  barcode_nummer: string
}

@Component({
  selector: 'app-download-probe-results',
  templateUrl: './download-probe-results.component.html',
  styleUrls: ['./download-probe-results.component.scss'],
})
export class DownloadProbeResultsComponent implements OnDestroy
{
  active = 1

  pendingInterpretations: Interpretation[] = []

  probeResults: { label: string, data: string }[] = []

  internalProbeResults: { label: string, data: string }[] = []

  probeResultsDownloaded = false

  internalProbeResultsDownloaded = false

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
  )
  {
    this.loadProbeResults()
    this.loadInternalProbeResults()
    this.loadPendingInterpretations()
  }

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
      return { label: `result_${ el.barcode_nummer }_${ moment(el.creation_timestamp).format("YYYYMMDD-HHMMSS") }.json`, data: JSON.stringify(el) }
    })

    if (this.probeResults.length === 0) this.probeResultsDownloaded = true
  }


  async loadInternalProbeResults(): Promise<void>
  {
    let results;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT * FROM cltp.internal_probe_result_pending;`)

      results = (resultsRes as { recordset: ProbeResult[] }).recordset
    }
    catch (e)
    {
      alert("Could not get the probe results from the database!")
      console.error(e)
      return
    }

    this.internalProbeResults = results.map((el) =>
    {
      return { label: `result_${ el.barcode_nummer }_${ moment(el.creation_timestamp).format("YYYYMMDD-HHMMSS") }.json`, data: JSON.stringify(el)  }
    })

    if (this.internalProbeResults.length === 0) this.internalProbeResultsDownloaded = true
  }


  async downloadProbeResults(): Promise<void>
  {
    const zip = new JSZip();

    for (const probeResult of this.probeResults)zip.file(probeResult.label, probeResult.data);

    const c = await zip.generateAsync({ type: "blob" })

    saveAs(c, `probe-results-${ Date.now() }.zip`);

    this.probeResultsDownloaded = true
  }

  async downloadInternalProbeResults(): Promise<void>
  {
    const zip = new JSZip();

    for (const probeResult of this.internalProbeResults) zip.file(probeResult.label, probeResult.data);

    const c = await zip.generateAsync({ type: "blob" })

    saveAs(c, `internal-probe-results-${ Date.now() }.zip`);

    this.internalProbeResultsDownloaded = true
  }

  async markInterpretationsAsExported(): Promise<void>
  {
    if (!confirm("Make sure you downloaded all the external and internal probe results! If yes, mark them as 'exported' and they will get archived.")) return

    let q = ""

    for (const pendingInterpretation of this.pendingInterpretations)
    {
      const interpretationExported: InterpretationExported = { id: v4(), interpretation_id: pendingInterpretation.id }
      q += `INSERT INTO cltp.interpretation_exported (${ Object.keys(interpretationExported).join(',') }) VALUES (${ Object.values(interpretationExported).map(sqlValueFormatter).join(',') });`
    }

    try
    {
      await this.dbService.query(q)

      this.probeResults = []
      this.internalProbeResults = []
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
