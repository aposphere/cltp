import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Sample } from 'src/app/interfaces/sample.table';
import { Pool } from 'src/app/interfaces/pool.table';
import { DBService } from 'src/app/services/db.service';
import { InputDevice, StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';
import { ProbeOrder } from 'src/app/interfaces/probe-order.table';

/** Workflow steps */
const steps = ["identify-pool", "scan-samples", "done"] as const
/** Workflow step tyle */
type Step = typeof steps[number];


@Component({
  selector: 'app-pooling',
  templateUrl: './pooling.component.html',
  styleUrls: ['./pooling.component.scss'],
})
export class PoolingComponent implements OnDestroy
{
  /** The user credentials */
  credentials?: Credentials;

  /** The current workflow step */
  currentStep?: Step = undefined

  /** The selected input device */
  inputDevice: InputDevice = "scanner"

  /** The pool id */
  poolId?: string

  /** The next sample id */
  nextSampleId?: string

  /** The added samples */
  addedSamples: { sample_id: string }[] = []

  /** The source of the pooling */
  source?: string

  /** The comment of the pooling */
  comment?: string

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public configService: ConfigService,
    public stateService: StateService,
    public toastsService: ToastsService,
  )
  {
    this.stateService.inputDevice.pipe(takeUntil(this.unsubscribe$)).subscribe((inputDevice) =>
    {
      // Disable the scanner if necessary
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-pool" || this.currentStep === "scan-samples")) this.stateService.scannerInputEnable.next(false)
      this.inputDevice = inputDevice
      // Enable the scanner if necessary
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-pool" || this.currentStep === "scan-samples")) this.stateService.scannerInputEnable.next(true)
    });
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'identify-pool' &&  this.inputDevice === 'scanner')).subscribe(async (input) =>
    {
      // Receive the scanner input
      this.stateService.scanSucess.next()
      await this.checkPool(input)
      if (this.inputDevice !== 'scanner') this.stateService.scannerInputEnable.next(false)
    })
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'scan-samples' && this.inputDevice === 'scanner')).subscribe((input) => this.sampleScanSuccessHandler(input))
  }

  /**
   * Reset the complete workflow
   */
  reset(): void
  {
    this.currentStep = undefined
    this.poolId = undefined
    this.nextSampleId = undefined
    this.addedSamples = []
    this.source = undefined
    this.comment = undefined
  }

  /**
   * Start the workflow
   */
  start(): void
  {
    this.currentStep = 'identify-pool'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(true)
  }

  /**
   * Success handler for the scanner
   */
  async poolScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.poolId && ev !== this.poolId)
    {
      alert(`Pool id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      await this.checkPool(ev)
    }
  }

  /**
   * Check the pool
   */
  async checkPool(poolId: string): Promise<void>
  {
    // Make sure a pool is used only ONCE
    try
    {
      // Get pools to verify
      let res = await this.dbService.query(`SELECT pool_id FROM cltp.pool WHERE pool_id = '${ poolId }'`)

      const [existingPool] = (res as { recordset: Pool[] }).recordset

      // Check for existing pool and prompt
      if (existingPool)
      {
        this.toastsService.show(`A Pool can only be used once!`, { classname: 'bg-danger text-light' })
        return
      }

      // Get pools to verify
      res = await this.dbService.query(`SELECT * FROM cltp.probe_order WHERE barcode_nummer = '${ poolId }'`)

      const [existingProbeOrder] = (res as { recordset: ProbeOrder[] }).recordset

      // Check for unused existing probe order and prompt
      if (!existingProbeOrder)
      {
        this.toastsService.show(`No Probe Order has been registered for this pool. Please upload it first before pooling samples.`, { classname: 'bg-danger text-light' })
        return
      }

    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }


    // Save pool id and go to next step
    this.poolId = poolId
    this.currentStep = 'scan-samples'
  }


  /**
   * Success handler for the scanner
   */
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
      alert(`This sample id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextSampleId(ev)
    }
  }

  /**
   * Error handler for the scanner
   */
  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  /**
   * Manual add next sample
   */
  async manualNextSampleId(sampleId?: string): Promise<void>
  {
    if (sampleId)
    {
      // Check duplicates
      if (this.addedSamples.some((el) => el.sample_id === sampleId))
      {
        alert(`This sample id (${ sampleId }) is duplicate!`)
        return
      }

      // Make sure the sample is ready to be used
      try
      {
        // Get sample to verify
        const res = await this.dbService.query(`SELECT sample_id FROM cltp.sample WHERE sample_id = '${ sampleId }'`)

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
        const res = await this.dbService.query(`SELECT * FROM cltp.connection_pool_sample WHERE sample_id = '${ sampleId }'`)

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


      // Add samples and flash
      this.addedSamples.push({ sample_id: sampleId })
      this.stateService.scanSucess.next()
      this.nextSampleId = undefined
    }
  }

  /**
   * Complete the workflow
   */
  done(): void
  {
    this.currentStep = 'done'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(false)
  }

  /**
   * Upload the results of the workflow
   */
  async upload(): Promise<void>
  {
    if (this.poolId && this.credentials)
    {
      // Get the actor
      const actor = this.credentials?.username || 'anonymous'

      // Create the pool
      let q = `INSERT INTO cltp.pool (pool_id) VALUES ('${ this.poolId }');`

      const auditLog: AuditLog =
      {
        type: 'create-pool',
        ref: this.poolId,
        actor: actor,
        message: `Pool [${ this.poolId }] created by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`

      // Add the samples
      for (const el of this.addedSamples)
      {
        q += `INSERT INTO cltp.connection_pool_sample (pool_id, sample_id, technician, source, comment) VALUES ('${ this.poolId }','${ el.sample_id }','${ this.credentials.username }','${ this.source || '' }','${ this.comment || '' }');`

        const auditLog: AuditLog =
        {
          type: 'map-sample',
          ref: el.sample_id,
          actor: actor,
          message: `Sample [${ el.sample_id }] mapped to Pool [${ this.poolId }] by [${ actor }]`,
        }
        q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
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

    // Reset the workflow
    this.reset()
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
