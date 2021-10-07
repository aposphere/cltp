import { Component, OnDestroy } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';

@Component({
  selector: 'app-download-probe-results',
  templateUrl: './download-probe-results.component.html',
  styleUrls: ['./download-probe-results.component.scss'],
})
export class DownloadProbeResultsComponent implements OnDestroy
{
  active = 1

  probeResults: { label: string, data: string }[] = []
  internalProbeResults: { label: string, data: string }[] = []

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService
  )
  {
    this.loadProbeResults()
    this.loadInternalProbeResults()
  }

  async loadProbeResults(): Promise<void>
  {
    let results;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT * FROM probe_result;`)

      results = (resultsRes as { rows: unknown[] }).rows
    }
    catch (e)
    {
      alert("Could not get the probe results from the database!")
      console.error(e)
      return
    }

    this.probeResults = results.map((el) =>
    {
      return { label: `pool-${(el as { barcode_nummer: string }).barcode_nummer}.json`, data: JSON.stringify(el) }
    })
  }


  async loadInternalProbeResults(): Promise<void>
  {
    let results;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT * FROM internal_probe_result;`)

      results = (resultsRes as { rows: unknown[] }).rows
    }
    catch (e)
    {
      alert("Could not get the probe results from the database!")
      console.error(e)
      return
    }

    this.internalProbeResults = results.map((el) =>
    {
      return { label: `pool-${(el as { barcode_nummer: string }).barcode_nummer}.json`, data: JSON.stringify(el) }
    })
  }


  async downloadProbeResults(): Promise<void>
  {
    var zip = new JSZip();

    for (const probeResult of this.probeResults) zip.file(probeResult.label, probeResult.data);

    const c = await zip.generateAsync({ type:"blob" })

    saveAs(c, `probe-results-${Date.now()}.zip`);
  }

  async downloadInternalProbeResults(): Promise<void>
  {
    var zip = new JSZip();

    for (const probeResult of this.internalProbeResults) zip.file(probeResult.label, probeResult.data);

    const c = await zip.generateAsync({ type:"blob" })

    saveAs(c, `internal-probe-results-${Date.now()}.zip`);
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
