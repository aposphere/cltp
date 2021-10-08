import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Sample } from 'src/app/interfaces/sample';
import { Pool } from 'src/app/interfaces/pool';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';

const steps = ["identify-pool", "scan-samples", "done"] as const
type Step = typeof steps[number];


@Component({
  selector: 'app-pooling',
  templateUrl: './pooling.component.html',
  styleUrls: ['./pooling.component.scss'],
})
export class PoolingComponent implements OnDestroy
{
  credentials?: Credentials;

  currentStep?: Step = undefined

  poolInputMode: "manual" | "camera" | "scanner" = "scanner"

  sampleInputMode: "manual" | "camera" | "scanner" = "scanner"

  poolId?: string

  nextSampleId?: string

  addedSamples: { sample_id: string }[] = []

  source?: string

  comment?: string

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public configService: ConfigService,
    public stateService: StateService,
    public toastsService: ToastsService
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'identify-pool' &&  this.poolInputMode === 'scanner')).subscribe(async (input) =>
    {
      this.stateService.scanSucess.next()
      await this.checkPool(input)
      if (this.sampleInputMode !== 'scanner') this.stateService.scannerInputEnable.next(false)
    })
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'scan-samples' && this.sampleInputMode === 'scanner')).subscribe(async (input) => this.sampleScanSuccessHandler(input))
  }

  reset(): void
  {
    this.currentStep = undefined
    this.poolId = undefined
    this.nextSampleId = undefined
    this.addedSamples = []
    this.source = undefined
    this.comment = undefined
  }

  start(): void
  {
    this.currentStep = 'identify-pool'
    if (this.poolInputMode === 'scanner') this.stateService.scannerInputEnable.next(true)
  }

  changeInputMode(ev: Event)
  {
    this.stateService.scannerInputEnable.next((ev.target as HTMLInputElement).value === 'scanner')
  }

  async poolScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.poolId && (ev !== this.poolId))
    {
      alert(`Pool id (${ev}) has already been scanned!`)
    }
    // Valid scan
    else
    {
      await this.checkPool(ev)
    }
  }

  async checkPool(poolId: string): Promise<void>
  {
    // Make sure a pool is used only ONCE
    try
    {
      // Get pools to verify
      const res = await this.dbService.query(`SELECT pool_id FROM cltp.pool WHERE pool_id = '${poolId}'`)

      const [existingPool] = (res as { recordset: Pool[] }).recordset

      // Check for existing pool and prompt
      if (existingPool)
      {
        this.toastsService.show(`A Pool can only be used once!`, { classname: 'bg-danger text-light' })
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }


    this.poolId = poolId
    this.currentStep = 'scan-samples'
  }


  sampleScanSuccessHandler(ev: string): void
  {
    // Ignore last one
    if (this.addedSamples.length > 0 && this.addedSamples[this.addedSamples.length - 1].sample_id === ev)
    {
      console.info("Subsequent scan ignored")
    }
    // Do not scan duplicates
    else if (this.addedSamples.some((el) => el.sample_id === ev))
    {
      alert(`This sample id (${ev}) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextSampleId(ev)
    }
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  async manualNextSampleId(sampleId?: string): Promise<void>
  {
    if (sampleId)
    {
      if (this.addedSamples.some((el) => el.sample_id === sampleId))
      {
        alert(`This sample id (${sampleId}) is duplicate!`)
        return
      }

      // Make sure the sample is ready to be used
      try
      {
        // Get sample to verify
        const res = await this.dbService.query(`SELECT sample_id FROM cltp.sample WHERE sample_id = '${sampleId}'`)

        const [existingSample] = (res as { recordset: Sample[] }).recordset

        // Check for unused existing sample and prompt
        if (!existingSample)
        {
          this.toastsService.show(`This Sample has not been registered in the system!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }

      // Make sure the sample is not yet used
      try
      {
        // Get pooling to verify
        const res = await this.dbService.query(`SELECT * FROM cltp.connection_pool_sample WHERE sample_id = '${sampleId}'`)

        const [existingPooling] = (res as { recordset: unknown[] }).recordset

        // Check for existing pooling
        if (existingPooling)
        {
          this.toastsService.show(`This Sample has already been used in a pooling!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }


      this.addedSamples.push({ sample_id: sampleId })
      this.stateService.scanSucess.next()
      this.nextSampleId = undefined
    }
  }

  done(): void
  {
    this.currentStep = 'done'
    if (this.sampleInputMode === 'scanner') this.stateService.scannerInputEnable.next(false)
  }

  async upload(): Promise<void>
  {
    if (this.poolId && this.credentials)
    {
      let q = `INSERT INTO cltp.pool (pool_id) VALUES ('${this.poolId}');`
      for (let el of this.addedSamples)
      {
        q += `INSERT INTO cltp.connection_pool_sample (pool_id, sample_id, technician, source, comment) VALUES ('${this.poolId}','${el.sample_id}','${this.credentials.username}','${this.source || ''}','${this.comment || ''}');`
      }

      try
      {
        await this.dbService.query(q)

        this.toastsService.show(`Pooling '${ this.poolId }' successfully inserted into the database`, { classname: 'bg-success text-light' })
      }
      catch (e)
      {
        alert("Could not insert into database, please check the logs for errors!")
        console.error(e)
        return
      }
    }

    this.reset()
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
