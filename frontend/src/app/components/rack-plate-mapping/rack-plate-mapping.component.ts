import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { Credentials } from 'src/app/interfaces/credentials';
import { Plate } from 'src/app/interfaces/plate.table';
import { Rack } from 'src/app/interfaces/rack.table';
import { ConfigService } from 'src/app/services/config.service';
import { DBService } from 'src/app/services/db.service';
import { InputDevice, StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';

/** Workflow steps */
const steps = ["identify-plate", "scan-racks", "done"] as const
/** Workflow step tyle */
type Step = typeof steps[number];


@Component({
  selector: 'app-rack-plate-mapping',
  templateUrl: './rack-plate-mapping.component.html',
  styleUrls: ['./rack-plate-mapping.component.scss'],
})
export class RackPlateMappingComponent implements OnDestroy
{
  /** The user credentials */
  credentials?: Credentials;

  /** The matrix */
  matrix =
  {
    x: ["1", "2", "3", "4"],
    y: ["A"],
  }

  /** The rack limit */
  rackLimit = this.matrix.x.length * this.matrix.y.length

  /** The current workflow step */
  currentStep?: Step = undefined

  /** The current indices in the matrix */
  indices: { x: number, y: number } = { x: 0, y: 0 }

  /** The selected input device */
  inputDevice: InputDevice = "scanner"

  /** Flag whether the scanner is enabled */
  scannerEnabled = false

  /** The plate id */
  plateId?: string

  /** The next rack id */
  nextRackId?: string

  /** The added racks */
  addedRacks: { rack: Rack, coordinate: string }[] = []


  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
    public configService: ConfigService,
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.inputDevice.pipe(takeUntil(this.unsubscribe$)).subscribe((inputDevice) =>
    {
      // Disable the scanner if necessary
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-plate" || this.currentStep === "scan-racks")) this.stateService.scannerInputEnable.next(false)
      this.inputDevice = inputDevice
      // Enable the scanner if necessary
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-plate" || this.currentStep === "scan-racks")) this.stateService.scannerInputEnable.next(true)
    });
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'identify-plate' &&  this.inputDevice === 'scanner')).subscribe(async (input) =>
    {
      // Receive the scanner input
      this.stateService.scanSucess.next()
      await this.checkPlate(input)
      if (this.inputDevice !== 'scanner') this.stateService.scannerInputEnable.next(false)
    })
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'scan-racks' && this.inputDevice === 'scanner')).subscribe((input) => this.rackScanSuccessHandler(input))
  }

  /**
   * Reset the complete workflow
   */
  reset(): void
  {
    this.currentStep = undefined
    this.plateId = undefined
    this.nextRackId = undefined
    this.indices = { x: 0, y: 0 }
    this.addedRacks = []
  }

  /**
   * Start the workflow
   */
  start(): void
  {
    this.currentStep = 'identify-plate'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(true)
  }

  /**
   * Success handler for the scanner
   */
  async plateScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.plateId && ev !== this.plateId)
    {
      alert(`Plate id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      await this.checkPlate(ev)
    }
  }

  /**
   * Check the plate id
   */
  async checkPlate(plateId: string): Promise<void>
  {
    // Make sure a plate is used only ONCE
    try
    {
      // Get plates to verify
      const res = await this.dbService.query(`SELECT plate_id FROM cltp.plate WHERE plate_id = '${ plateId }'`)

      const [existingPlate] = (res as { recordset: Plate[] }).recordset

      // Check for existing plate and prompt
      if (existingPlate)
      {
        this.toastsService.show(`A Plate can only be used once!`, { classname: 'bg-danger text-light' })
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }

    // Save the plate id and go to next step
    this.plateId = plateId
    this.currentStep = 'scan-racks'
  }

  /**
   * Success handler for the scanner
   */
  rackScanSuccessHandler(ev: string): void
  {
    // Ignore last one
    if (this.addedRacks.length > 0 && this.addedRacks[this.addedRacks.length - 1].rack.rack_id === ev)
    {
      console.info("Subsequent scan ignored")
    }
    // Do not scan duplicates
    else if (this.addedRacks.some((el) => el.rack.rack_id === ev))
    {
      alert(`This rack id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextRackId(ev)
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
   * Input the next rack id
   */
  async manualNextRackId(rackId?: string): Promise<void>
  {
    if (rackId)
    {
      // Check for duplicates
      if (this.addedRacks.some((el) => el.rack.rack_id === rackId))
      {
        alert(`This rack id (${ rackId }) is duplicate!`)
        return
      }


      // Make sure the rack is ready to be used
      try
      {
        // Get racks to verify
        const res = await this.dbService.query(`SELECT rack_id FROM cltp.rack WHERE rack_id = '${ rackId }'`)

        const [existingRack] = (res as { recordset: Rack[] }).recordset

        // Check for unused existing pool and prompt
        if (!existingRack)
        {
          this.toastsService.show(`This Rack has not been registered in the system!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }


      // Make sure the rack is ready to be used
      try
      {
        // Get unused racks to verify
        const res = await this.dbService.query(`SELECT rack_id, i FROM cltp.unused_rack WHERE rack_id = '${ rackId }' ORDER BY i DESC`)

        const [previousRack] = (res as { recordset: Rack[] }).recordset

        // Check for unused existing rack and prompt
        if (!previousRack)
        {
          this.toastsService.show(`This Rack has already been mapped to a different Plate. Please scan it again as a different iteration to prevent ambiguety!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }

      let rackI: number

      // Get the most recent rack iteration
      try
      {
        // Get most recent rack
        const res = await this.dbService.query(`SELECT rack_id, i FROM cltp.rack WHERE rack_id = '${ rackId }' ORDER BY i DESC`)

        const [mostRecentRack] = (res as { recordset: Rack[] }).recordset

        rackI = mostRecentRack.i
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }


      // Add the racks
      this.addedRacks.push(
      {
        rack: { rack_id: rackId, i: rackI },
        coordinate: this.matrix.y[this.indices.y] + this.matrix.x[this.indices.x],
      })
      // Flash
      this.stateService.scanSucess.next()
      this.nextRackId = undefined

      // Last one
      if (this.indices.x === this.matrix.x.length - 1 && this.indices.y === this.matrix.y.length - 1)
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
    if (this.plateId)
    {
      // Get the actor
      const actor = this.credentials?.username || 'anonymous'

      // Create the plate
      const plate: Plate =
      {
        plate_id: this.plateId,
      };

      let q = `INSERT INTO cltp.plate (plate_id) VALUES ('${ plate.plate_id }');`

      const auditLog: AuditLog =
      {
        type: 'create-plate',
        ref: plate.plate_id,
        actor: actor,
        message: `Plate [${ plate.plate_id }] created by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`

      // Add the racks
      for (const el of this.addedRacks)
      {
        q += `INSERT INTO cltp.connection_rack_plate (plate_id, rack_id, rack_i, coordinate) VALUES ('${ plate.plate_id }','${ el.rack.rack_id }','${ el.rack.i }','${ el.coordinate }');`
        const auditLog: AuditLog =
        {
          type: 'map-rack',
          ref: el.rack.rack_id,
          actor: actor,
          message: `Rack [${ el.rack.rack_id }] mapped to Plate [${ plate.plate_id }] by [${ actor }]`,
        }
        q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
      }

      try
      {
        await this.dbService.query(q)

        this.toastsService.show(`Plate '${ this.plateId }' successfully inserted into the database`, { classname: 'bg-success text-light' })
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
