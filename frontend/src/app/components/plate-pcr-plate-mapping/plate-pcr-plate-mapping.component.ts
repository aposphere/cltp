import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Plate } from 'src/app/interfaces/plate';
import { PcrPlate } from 'src/app/interfaces/pcr-plate';
import { DBService } from 'src/app/services/db.service';
import { InputDevice, StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';
import { AuditLog } from 'src/app/interfaces/audit-log';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';

const steps = ["identify-pcr-plate", "scan-plates", "done"] as const
type Step = typeof steps[number];


@Component({
  selector: 'app-plate-pcr-plate-mapping',
  templateUrl: './plate-pcr-plate-mapping.component.html',
  styleUrls: ['./plate-pcr-plate-mapping.component.scss'],
})
export class PlatePcrPlateMappingComponent implements OnDestroy
{
  matrix =
  {
    x: ["1", "2"],
    y: ["A", "B"],
  }

  plateLimit = this.matrix.x.length * this.matrix.y.length

  credentials?: Credentials

  currentStep?: Step = undefined

  indices: { x: number, y: number } = { x: 0, y: 0 }

  inputDevice: InputDevice = "scanner"

  pcrPlateId?: string

  nextPlateId?: string

  addedPlates: { plate: Plate, coordinate: string }[] = []


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
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-pcr-plate" || this.currentStep === "scan-plates")) this.stateService.scannerInputEnable.next(false)
      this.inputDevice = inputDevice
      if (this.inputDevice === "scanner" && (this.currentStep === "identify-pcr-plate" || this.currentStep === "scan-plates")) this.stateService.scannerInputEnable.next(true)
    });
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'identify-pcr-plate' &&  this.inputDevice === 'scanner')).subscribe(async (input) =>
    {
      this.stateService.scanSucess.next()
      await this.checkPcrPlate(input)
      if (this.inputDevice !== 'scanner') this.stateService.scannerInputEnable.next(false)
    })
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.currentStep === 'scan-plates' && this.inputDevice === 'scanner')).subscribe((input) => this.plateScanSuccessHandler(input))
  }

  reset(): void
  {
    this.currentStep = undefined
    this.pcrPlateId = undefined
    this.nextPlateId = undefined
    this.indices = { x: 0, y: 0 }
    this.addedPlates = []
  }

  start(): void
  {
    this.currentStep = 'identify-pcr-plate'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(true)
  }

  async pcrPlateScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.pcrPlateId && ev !== this.pcrPlateId)
    {
      alert(`PCR Plate id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      await this.checkPcrPlate(ev)
    }
  }

  async checkPcrPlate(pcrPlateId: string): Promise<void>
  {
    // Make sure a prc plate is used only ONCE
    try
    {
      // Get prc plates to verify
      const res = await this.dbService.query(`SELECT pcr_plate_id FROM cltp.pcr_plate WHERE pcr_plate_id = '${ pcrPlateId }'`)

      const [existingPlate] = (res as { recordset: Plate[] }).recordset

      // Check for existing pcr plate and prompt
      if (existingPlate)
      {
        this.toastsService.show(`A PCR Plate can only be used once!`, { classname: 'bg-danger text-light' })
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }


    this.pcrPlateId = pcrPlateId
    this.currentStep = 'scan-plates'
  }


  plateScanSuccessHandler(ev: string): void
  {
    // Ignore last one
    if (this.addedPlates.length > 0 && this.addedPlates[this.addedPlates.length - 1].plate.plate_id === ev)
    {
      console.info("Subsequent scan ignored")
    }
    // Do not scan duplicates
    else if (this.addedPlates.some((el) => el.plate.plate_id === ev))
    {
      alert(`This plate id (${ ev }) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextPlateId(ev)
    }
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  async manualNextPlateId(plateId?: string): Promise<void>
  {
    if (plateId)
    {
      if (this.addedPlates.some((el) => el.plate.plate_id === plateId))
      {
        alert(`This plate id (${ plateId }) is duplicate!`)
        return
      }

      // Make sure the plate is ready to be used
      try
      {
        // Get plate to verify
        const res = await this.dbService.query(`SELECT plate_id FROM cltp.plate WHERE plate_id = '${ plateId }'`)

        const [existingPlate] = (res as { recordset: Plate[] }).recordset

        // Check for unused existing plate and prompt
        if (!existingPlate)
        {
          this.toastsService.show(`This Plate has not been registered in the system!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }

      // Make sure the plate is not yet used
      try
      {
        // Get pool rack mapping to verify
        const res = await this.dbService.query(`SELECT * FROM cltp.connection_plate_pcr_plate WHERE plate_id = '${ plateId }'`)

        const [existingMapping] = (res as { recordset: unknown[] }).recordset

        // Check for existing mapping
        if (existingMapping)
        {
          this.toastsService.show(`This Plate has already been mapped to a different PCR Plate and cannot be used again!`, { classname: 'bg-danger text-light' })
          return
        }
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }


      this.addedPlates.push(
      {
        plate: { plate_id: plateId },
        coordinate: this.matrix.y[this.indices.y] + this.matrix.x[this.indices.x],
      })
      this.stateService.scanSucess.next()
      this.nextPlateId = undefined

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

  done(): void
  {
    this.currentStep = 'done'
    if (this.inputDevice === 'scanner') this.stateService.scannerInputEnable.next(false)
  }

  async upload(): Promise<void>
  {
    if (this.pcrPlateId)
    {
      const actor = this.credentials?.username || 'anonymous'

      const pcrPlate: PcrPlate =
      {
        pcr_plate_id: this.pcrPlateId,
      };

      let q = `INSERT INTO cltp.pcr_plate (pcr_plate_id) VALUES ('${ pcrPlate.pcr_plate_id }');`

      const auditLog: AuditLog =
      {
        type: 'create-pcr-plate',
        ref: pcrPlate.pcr_plate_id,
        actor: actor,
        message: `PCR Plate [${ pcrPlate.pcr_plate_id }] create by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`


      for (const el of this.addedPlates)
      {
        q += `INSERT INTO cltp.connection_plate_pcr_plate (pcr_plate_id, plate_id, coordinate) VALUES ('${ pcrPlate.pcr_plate_id }','${ el.plate.plate_id }','${ el.coordinate }');`

        const auditLog: AuditLog =
        {
          type: 'map-plate',
          ref: el.plate.plate_id,
          actor: actor,
          message: `Plate [${ el.plate.plate_id }] mapped to PCR Plate [${ pcrPlate.pcr_plate_id }] by [${ actor }]`,
        }
        q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
      }

      try
      {
        await this.dbService.query(q)

        this.toastsService.show(`PCR Plate '${ this.pcrPlateId }' successfully inserted into the database`, { classname: 'bg-success text-light' })
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
