import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Credentials } from 'src/app/interfaces/credentials';
import { Pool } from 'src/app/interfaces/pool';
import { PoolArrival } from 'src/app/interfaces/pool-arrival';
import { ProbeOrder } from 'src/app/interfaces/probe-order';
import { Rack } from 'src/app/interfaces/rack';
import { ConfigService } from 'src/app/services/config.service';
import { DBService } from 'src/app/services/db.service';
import { InputDevice, StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { v4 } from 'uuid';
import { sqlValueFormatter } from '../../helpers/sql-value-formatter';

const steps = ["identify-rack", "scan-pools", "done"] as const
type Step = typeof steps[number];


@Component({
  selector: 'app-pool-rack-mapping',
  templateUrl: './pool-rack-mapping.component.html',
  styleUrls: ['./pool-rack-mapping.component.scss'],
})
export class PoolRackMappingComponent implements OnDestroy
{
  credentials?: Credentials;

  autoRegisterNewPools = true

  matrix =
  {
    x: ["1", "2", "3", "4", "5", "6"],
    y: ["A", "B", "C", "D"],
  }

  poolLimit = this.matrix.x.length * this.matrix.y.length

  currentStep?: Step = undefined

  indices: { x: number, y: number } = { x: 0, y: 0 }

  inputDevice: InputDevice = "scanner"

  rackId?: string

  rackI?: number

  nextPoolId?: string

  addedPools: { pool: Pool, coordinate: string }[] = []


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
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-rack" || this.currentStep === "scan-pools")) this.stateService.scannerInputEnable.next(false)
      this.inputDevice = inputDevice
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-rack" || this.currentStep === "scan-pools")) this.stateService.scannerInputEnable.next(true)
    });
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'identify-rack' && this.inputDevice === 'scanner')).subscribe(async (input) =>
    {
      this.stateService.scanSucess.next()
      await this.checkRack(input)
      if (this.inputDevice !== 'scanner') this.stateService.scannerInputEnable.next(false)
    })
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'scan-pools' && this.inputDevice === 'scanner')).subscribe((input) => this.poolScanSuccessHandler(input))
  }

  reset(): void
  {
    this.currentStep = undefined
    this.rackId = undefined
    this.rackI = undefined
    this.nextPoolId = undefined
    this.indices = { x: 0, y: 0 }
    this.addedPools = []
  }

  start(): void
  {
    this.currentStep = 'identify-rack'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(true)
  }

  async rackScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.rackId && ev !== this.rackId)
    {
      alert(`Rack id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      await this.checkRack(ev)
    }
  }

  async checkRack(rackId: string): Promise<void>
  {
    let mostRecentRack: Rack

    // Get the most recent rack iteration
    try
    {
      // Get most recent rack
      const res = await this.dbService.query(`SELECT rack_id, i FROM cltp.rack WHERE rack_id = '${ rackId }' ORDER BY i DESC`)

      mostRecentRack = (res as { recordset: Rack[] }).recordset[0]

      if (mostRecentRack)
      {
        try
        {
          // Get unused racks to verify
          const res = await this.dbService.query(`SELECT rack_id, i FROM cltp.unused_rack WHERE rack_id = '${ rackId }' AND i = ${ mostRecentRack.i }`)

          const [previousRack] = (res as { recordset: Rack[] }).recordset

          // Check for unused existing rack and prompt
          if (previousRack)
          {
            if (!confirm("This rack has already been filled previously with pools but is not yet mapped to a plate. Do you want to proceed anyway and override it?")) return
          }

          // New rack iteration
          this.rackI = mostRecentRack.i + 1
        }
        catch (e)
        {
          alert("Could not read database, please check the logs for errors!")
          console.error(e)
          this.reset()
          return
        }
      }
      // First rack iteration
      else this.rackI = 0
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }

    this.rackId = rackId
    this.currentStep = 'scan-pools'
  }

  poolScanSuccessHandler(ev: string): void
  {
    // Ignore last one
    if (this.addedPools.length > 0 && this.addedPools[this.addedPools.length - 1].pool.pool_id === ev)
    {
      console.info("Subsequent scan ignored")
    }
    // Do not scan duplicates
    else if (this.addedPools.some((el) => el.pool.pool_id === ev))
    {
      alert(`This pool id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextPoolId(ev)
    }
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  async manualNextPoolId(poolId?: string): Promise<void>
  {
    if (poolId)
    {
      if (this.addedPools.some((el) => el.pool.pool_id === poolId))
      {
        alert(`This pool id (${ poolId }) is duplicate!`)
        return
      }

      // Make sure the pool is ready to be used
      try
      {
        // Get pools to verify
        const res = await this.dbService.query(`SELECT pool_id FROM cltp.pool WHERE pool_id = '${ poolId }'`)

        const [existingPool] = (res as { recordset: Pool[] }).recordset

        // Check for unused existing pool and prompt
        if (!existingPool)
        {
          if (this.autoRegisterNewPools)
          {
            await this.autoRegisterPool(poolId)
          }
          else
          {
            this.toastsService.show(`This Pool has not been registered in the system! Either register it manually beforehand or use the 'Auto Register' option.`, { classname: 'bg-danger text-light' })
            return
          }
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }

      // Make sure the pool is not yet used
      try
      {
        // Get pool rack mapping to verify
        const res = await this.dbService.query(`SELECT * FROM cltp.connection_pool_rack WHERE pool_id = '${ poolId }'`)

        const [existingMapping] = (res as { recordset: unknown[] }).recordset

        // Check for existing mapping
        if (existingMapping)
        {
          this.toastsService.show(`This Pool has already been mapped to another Rack!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }

      this.addedPools.push(
      {
        pool: { pool_id: poolId },
        coordinate: this.matrix.y[this.indices.y] + this.matrix.x[this.indices.x],
      })
      this.stateService.scanSucess.next()
      this.nextPoolId = undefined

      // Last one (excluding one empty)
      if (this.indices.x === this.matrix.x.length - 2 && this.indices.y === this.matrix.y.length - 1)
      {
        this.done()
      }
      // Wrap line
      if (this.indices.x === this.matrix.x.length - 1)
      {
        this.indices.x = 0
        this.indices.y++
      }
      else this.indices.x++
    }
  }

  done(): void
  {
    this.currentStep = 'done'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(false)
  }


  async upload(): Promise<void>
  {
    if (this.rackId && this.rackI !== undefined)
    {
      const rack: Rack =
      {
        rack_id: this.rackId,
        i: this.rackI,
      };

      let q = `INSERT INTO cltp.rack (rack_id, i) VALUES ('${ rack.rack_id }',${ rack.i });`

      for (const el of this.addedPools)
      {
        q += `INSERT INTO cltp.connection_pool_rack (rack_id, rack_i, pool_id, coordinate) VALUES ('${ rack.rack_id }',${ rack.i },'${ el.pool.pool_id }','${ el.coordinate }');`
      }

      try
      {
        await this.dbService.query(q)

        this.toastsService.show(`Rack '${ this.rackId }' (iteration: ${ this.rackI }) successfully inserted into the database`, { classname: 'bg-success text-light' })
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

  async autoRegisterPool(poolId: string): Promise<void>
  {
    if (!this.credentials) throw new Error("No user credentials found")

    // Make sure the pool is ready to be used
    try
    {
      // Get pools to verify
      const res = await this.dbService.query(`SELECT * FROM cltp.probe_order WHERE barcode_nummer = '${ poolId }'`)

      const [existingProbeOrder] = (res as { recordset: ProbeOrder[] }).recordset

      // Check for unused existing probe order and prompt
      if (!existingProbeOrder)
      {
        this.toastsService.show(`No Probe Order has been registered for this pool. Please upload it first before mapping the pools to the racks.`, { classname: 'bg-danger text-light' })
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }


    const poolArrival: PoolArrival =
    {
      id: v4(),
      pool_id: poolId,
      comment: "Auto Register during Pool/Rack mapping",
      source: "",
      technician: this.credentials.username,
    };

    const pool: Pool =
    {
      pool_id: poolId,
    };

    const q = `
    INSERT INTO cltp.pool (pool_id) VALUES ('${ pool.pool_id }');
    INSERT INTO cltp.pool_arrival (${ Object.keys(poolArrival).join(',') }) VALUES (${ Object.values(poolArrival).map(sqlValueFormatter).join(',') });
    `

    try
    {
      await this.dbService.query(q)

      this.toastsService.show(`Pool '${ poolId }' successfully inserted into the database`, { classname: 'bg-info text-dark', delay: 3000 })
    }
    catch (e)
    {
      alert("Could not insert into database, please check the logs for errors!")
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
