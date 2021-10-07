import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Plate } from 'src/app/interfaces/plate';
import { Rack } from 'src/app/interfaces/rack';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { v4 } from 'uuid';

const steps = ["identify-plate", "scan-racks", "done"] as const
type Step = typeof steps[number];


@Component({
  selector: 'app-rack-plate-mapping',
  templateUrl: './rack-plate-mapping.component.html',
  styleUrls: ['./rack-plate-mapping.component.scss'],
})
export class RackPlateMappingComponent implements OnDestroy
{
  matrix =
  {
    x: ["1", "2", "3", "4"],
    y: ["A"]
  }

  rackLimit = this.matrix.x.length * this.matrix.y.length

  currentStep?: Step = undefined

  indices: { x: number, y: number } = { x: 0, y: 0 }

  plateInputMode: "manual" | "camera" | "scanner" = "manual"

  rackInputMode: "manual" | "camera" | "scanner" = "manual"

  scannerEnabled = false

  plateId?: string

  nextRackId?: string

  addedRacks: { rack: Rack, coordinate: string }[] = []


  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService
  )
  {
  }

  reset(): void
  {
    this.currentStep = undefined
    this.plateId = undefined
    this.nextRackId = undefined
    this.indices = { x: 0, y: 0 }
    this.addedRacks = []
  }

  async plateScanSuccessHandler(ev: string): Promise<void>
  {
    // Do not override
    if (this.plateId && (ev !== this.plateId))
    {
      alert(`Plate id (${ev}) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.checkPlate(ev)
    }
  }

  async checkPlate(plateId: string): Promise<void>
  {
    // Make sure a plate is used only ONCE
    try
    {
      // Get plates to verify
      const res = await this.dbService.query(`SELECT plate_id FROM plate WHERE plate_id = '${plateId}' LIMIT 1`)

      const [existingPlate] = (res as { rows: Plate[] }).rows

      // Check for existing plate and prompt
      if (existingPlate)
      {
        alert("A Plate can only be used once!")
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }

    this.plateId = plateId
    this.currentStep = 'scan-racks'
  }

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
      alert(`This rack id (${ev}) has already been scanned!`)
    }
    // Valid scan
    else
    {
      this.manualNextRackId(ev)
    }
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  async manualNextRackId(rackId?: string): Promise<void>
  {
    if (rackId)
    {
      if (this.addedRacks.some((el) => el.rack.rack_id === rackId))
      {
        alert(`This rack id (${rackId}) is duplicate!`)
        return
      }


      // Make sure the rack is ready to be used
      try
      {
        // Get racks to verify
        const res = await this.dbService.query(`SELECT rack_id FROM rack WHERE rack_id = '${rackId}' LIMIT 1`)

        const [existingRack] = (res as { rows: Rack[] }).rows

        // Check for unused existing pool and prompt
        if (!existingRack)
        {
          alert("This Rack has not been registered in the system!")
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
        const res = await this.dbService.query(`SELECT rack_id, i FROM unused_rack WHERE rack_id = '${rackId}' ORDER BY i DESC LIMIT 1`)

        const [previousRack] = (res as { rows: Rack[] }).rows

        // Check for unused existing rack and prompt
        if (!previousRack)
        {
          alert("This Rack has already been mapped to a different Plate. Please scan it again as a different iteration to prevent ambiguety!")
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
        const res = await this.dbService.query(`SELECT rack_id, i FROM rack WHERE rack_id = '${rackId}' ORDER BY i DESC LIMIT 1`)

        const [mostRecentRack] = (res as { rows: Rack[] }).rows

        rackI = mostRecentRack.i
      }
      catch (e)
      {
        alert("Could not read database, please check the logs for errors!")
        console.error(e)
        return
      }


      this.addedRacks.push(
      {
        rack: { rack_id: rackId, i: rackI },
        coordinate: this.matrix.y[this.indices.y] + this.matrix.x[this.indices.x]
      })
      this.stateService.scanSucess.next()
      this.nextRackId = undefined

      // Last one
      if (this.indices.x === this.matrix.x.length - 1 && this.indices.y === this.matrix.y.length - 1)
      {
        this.currentStep = 'done'
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


  async upload(): Promise<void>
  {
    if (this.plateId)
    {
      const plate: Plate =
      {
        plate_id: this.plateId
      };

      let q = `INSERT INTO plate (plate_id) VALUES ('${plate.plate_id}');`

      for (let el of this.addedRacks)
      {
        q += `INSERT INTO connection_rack_plate (plate_id, rack_id, rack_i, coordinate) VALUES ('${plate.plate_id}','${el.rack.rack_id}','${el.rack.i}','${el.coordinate}');`
      }

      try
      {
        await this.dbService.query(q)

        alert("Data successfully inserted into the database.")
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