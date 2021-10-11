import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Interpretation } from 'src/app/interfaces/interpretation';
import { MappingView } from 'src/app/interfaces/mapping-view';
import { Result } from 'src/app/interfaces/result';
import { ResultEntry } from 'src/app/interfaces/result-entry';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { v4 } from 'uuid';
import map_transform_rack_to_plate from 'src/assets/map_transform_rack_to_plate.json'
import map_transform_plate_to_pcr_plate from 'src/assets/map_transform_plate_to_pcr_plate.json'
import { sqlValueFormatter } from '../../helpers/sql-value-formatter';
import { ToastsService } from 'src/app/services/toasts.service';

const NEG_CONTROL_COORDINATE = "C24"
const POS_CONTROL_COORDINATE = "P24"

// const NEG_CONTROL_COORDINATE = "P24"
// const POS_CONTROL_COORDINATE = "P1"

const COL_COORDINATE = 1
const COL_CQ = 8

const M = 16
const N = 24

const O = 8
const P = 12

const Q = 4
const R = 6

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

interface ResultData
{
  result: Result,
  resultEntries: ResultEntry[],
  pcrMap: Interpretation[][],
  plateMaps: { plateId: string, map: Interpretation[][] }[],
  rackMaps: { rackId: string, map: Interpretation[][] }[],
  interpretations: Interpretation[],
  negControl: number | "undetermined",
  posControl: number | "undetermined",
  entriesTested: number,
  entriesNeg: number,
  entriesPos: number,
  entriesUn: number,
  noResults: MappingView[]
}

@Component({
  selector: 'app-upload-results',
  templateUrl: './upload-results.component.html',
  styleUrls: ['./upload-results.component.scss'],
})
export class UploadResultsComponent implements OnDestroy
{
  N = N

  M = M

  O = O

  P = P

  Q = Q

  R = R

  ALPHABET = ALPHABET

  active = 1

  cameraEnabled = false

  scannerEnabled = false;

  pcrPlateId?: string

  file?: File

  resultData?: ResultData

  unsubscribe$ = new Subject<void>()

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
  )
  {
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.scannerEnabled)).subscribe((input) =>
    {
      this.stateService.scanSucess.next()
      this.pcrPlateId = input
      this.scannerEnabled = false
      this.stateService.scannerInputEnable.next(false)
    });
  }

  scanSuccessHandler(ev: string): void
  {
    this.stateService.scanSucess.next()
    this.pcrPlateId = ev
    this.cameraEnabled = false
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

  fileChanged(ev: Event): void
  {
    const t = ev.target as HTMLInputElement
    if (t.files && t.files[0])
    {
      this.file = t.files[0]
      this.parseFile()
    }
    else throw new Error("File or file list is undefined")
  }

  parseFile(): void
  {
    if (!this.file) throw new Error("No file specified")

    const fileReader = new FileReader()
    fileReader.onload = (_e) =>
    {
      this.analyseFileContent(fileReader.result as string)
    }
    fileReader.readAsText(this.file)
  }

  async analyseFileContent(content: string): Promise<void>
  {
    const rows = content.split('\n')

    // Create the result object
    const resultRaw = []

    while (rows[0].startsWith("#")) resultRaw.push(rows.shift())

    const barcodeRow = resultRaw.find((row) => row?.includes("Barcode"))
    if (barcodeRow) this.pcrPlateId = barcodeRow?.split(": ")[1].trim()

    if (!this.pcrPlateId) throw new Error("PCR Plate ID is undefined")

    const result: Result =
    {
      id: v4(),
      pcr_plate_id: this.pcrPlateId,
    }

    // Make sure the plate is ready to be used
    try
    {
      // Get plate to verify
      const res = await this.dbService.query(`SELECT pcr_plate_id FROM cltp.pcr_plate WHERE pcr_plate_id = '${ this.pcrPlateId }'`)

      const [existingPlate] = (res as { recordset: unknown[] }).recordset

      // Check for existing plate and prompt
      if (!existingPlate)
      {
        this.toastsService.show(`This PCR Plate has not been registered in the system!`, { classname: 'bg-danger text-light' })
        return
      }
    }
    catch (e)
    {
      alert("Could not read database, please check the logs for errors!")
      console.error(e)
      return
    }


    // Remove the header line
    rows.shift()


    // Create the result entries
    const resultEntries: ResultEntry[] = []
    while (rows.length > 2)
    {
      // Get the row with "RNA IC"
      const rnaICRaw = rows.shift()

      // Get the row with "N1N2"
      const n1n2Raw = rows.shift()

      // Get the row with "Human IC"
      const humanICRaw = rows.shift()

      if (!rnaICRaw || !n1n2Raw || !humanICRaw) throw new Error("Entries not found")

      // Parse the entries
      const n1n2 = n1n2Raw.trim().split(",").map((s) => s.slice(1, -1))
      const humanIC = humanICRaw.trim().split(",").map((s) => s.slice(1, -1))


      const resultEntry: ResultEntry =
      {
        id: v4(),
        result_id: result.id,
        coordinate: n1n2[COL_COORDINATE],
        n1n2_cq: n1n2[COL_CQ].toLowerCase() !== "undetermined" ? +n1n2[COL_CQ] : undefined,
        human_ic_cq: humanIC[COL_CQ].toLowerCase() !== "undetermined" ? +humanIC[COL_CQ] : undefined,
      }

      resultEntries.push(resultEntry)
    }

    // Check controls
    const posControlEntry = resultEntries.find((entry) => entry.coordinate === POS_CONTROL_COORDINATE)
    const negControlEntry = resultEntries.find((entry) => entry.coordinate === NEG_CONTROL_COORDINATE)

    if (!posControlEntry) return alert("Positive control entry not found!")
    if (!negControlEntry) return alert("Negative control entry not found!")

    if (negControlEntry.n1n2_cq !== undefined) return alert(`Negative control failed! N1N2_cq (${ negControlEntry.coordinate }) is '${ negControlEntry.n1n2_cq }' instead of 'Undetermined'!`)
    if (posControlEntry.n1n2_cq === undefined || posControlEntry.n1n2_cq >= 40) return alert(`Positive control failed! N1N2_cq (${ posControlEntry.coordinate }) is '${ posControlEntry.n1n2_cq }' instead of '<40'!`)

    this.interpreteResults(result, resultEntries, posControlEntry.n1n2_cq, negControlEntry.n1n2_cq)
  }

  async interpreteResults(result: Result, resultEntries: ResultEntry[], posControl: number | undefined, negControl: number | undefined): Promise<void>
  {
    const pcrMap = new Array<Interpretation[]>(M);
    for (let i = 0; i < M; i++) pcrMap[i] = new Array<Interpretation>(N);


    const resultData: ResultData =
    {
      result: result,
      resultEntries: resultEntries,
      pcrMap: pcrMap,
      plateMaps: [],
      rackMaps: [],
      interpretations: [],
      negControl: negControl || "undetermined",
      posControl: posControl || "undetermined",
      entriesTested: 0,
      entriesNeg: 0,
      entriesPos: 0,
      entriesUn: 0,
      noResults: [],
    }


    let mapping;
    try
    {
      const mappingRes = await this.dbService.query(`SELECT * FROM cltp.mapping WHERE pcr_plate_id='${ this.pcrPlateId }';`)

      mapping = (mappingRes as { recordset: MappingView[] }).recordset
    }
    catch (e)
    {
      alert("Could not get the mapping from the database!")
      console.error(e)
      return
    }

    for (const mappingEntry of mapping)
    {
      // Transform the local relative coordinates to effective global coordinates
      const poolCoordinate = mappingEntry.pool_coordinate.toUpperCase() as keyof typeof map_transform_rack_to_plate["A1"]
      const rackCoordinate = mappingEntry.rack_coordinate.toUpperCase() as keyof typeof map_transform_rack_to_plate
      const plateCoordinate = mappingEntry.plate_coordinate.toUpperCase() as keyof typeof map_transform_plate_to_pcr_plate

      // plate coordinate for pool translated by local rack coordinate
      const effectivePlateCoordinate = map_transform_rack_to_plate[rackCoordinate][poolCoordinate] as keyof typeof map_transform_plate_to_pcr_plate["A1"]

      // pcr_plate coordinate for pool translated by local plate coordinate
      const effectivePcrPlateCoordinate = map_transform_plate_to_pcr_plate[plateCoordinate][effectivePlateCoordinate]

      const result = resultEntries.find((entry) => entry.coordinate === effectivePcrPlateCoordinate)
      if (result)
      {
        let i: "positive" | "negative" | "undetermined" | "unknown" = "unknown"

        // Check thresholds
        if (result.n1n2_cq === undefined && result.human_ic_cq !== undefined &&result.human_ic_cq < 35) i = "negative";
        else if (result.n1n2_cq !== undefined && result.n1n2_cq < 40) i = "positive";
        else if (result.n1n2_cq === undefined && (result.human_ic_cq === undefined || result.human_ic_cq > 35)) i = "undetermined"

        const interpretation: Interpretation =
        {
          id: v4(),
          result_entry_id: result.id,
          pool_id: mappingEntry.pool_id,
          interpretation: i,
        }

        resultData.interpretations.push(interpretation)

        resultData.entriesTested++;

        if (i === "positive") resultData.entriesPos++;
        else if (i === "negative") resultData.entriesNeg++;
        else if (i === "undetermined") resultData.entriesUn++;

        // Create maps

        // PCR Plate

        // Explode coordinates
        let y_ = effectivePcrPlateCoordinate.substr(0, 1)
        let x = +effectivePcrPlateCoordinate.substr(1)

        if (pcrMap[ALPHABET.indexOf(y_)]) pcrMap[ALPHABET.indexOf(y_)][x - 1] = interpretation

        // Plate

        let plateMap = resultData.plateMaps.find((m) => m.plateId === mappingEntry.plate_id)

        if (!plateMap)
        {
          const plateMap_ = new Array<Interpretation[]>(O);
          for (let i = 0; i < O; i++) plateMap_[i] = new Array<Interpretation>(P);

          plateMap = { plateId: mappingEntry.plate_id, map: plateMap_ }
          resultData.plateMaps.push(plateMap)
        }

        y_ = effectivePlateCoordinate.substr(0, 1)
        x = +effectivePlateCoordinate.substr(1)

        if (plateMap.map[ALPHABET.indexOf(y_)]) plateMap.map[ALPHABET.indexOf(y_)][x - 1] = interpretation

        // Rack

        let rackMap = resultData.rackMaps.find((m) => m.rackId === mappingEntry.rack_id)

        if (!rackMap)
        {
          const rackMap_ = new Array<Interpretation[]>(Q);
          for (let i = 0; i < Q; i++) rackMap_[i] = new Array<Interpretation>(R);

          rackMap = { rackId: mappingEntry.rack_id, map: rackMap_ }
          resultData.rackMaps.push(rackMap)
        }

        y_ = mappingEntry.rack_coordinate.substr(0, 1)
        x = +mappingEntry.rack_coordinate.substr(1)

        if (rackMap.map[ALPHABET.indexOf(y_)]) rackMap.map[ALPHABET.indexOf(y_)][x - 1] = interpretation
      }
      else
      {
        console.info("No result for mapping:", mappingEntry)
        resultData.noResults.push(mappingEntry)
      }
    }


    console.log(resultData)

    this.resultData = resultData
  }

  async uploadResults(): Promise<void>
  {
    if (!this.resultData) throw new Error("Result data not available")

    // Create the result
    const q = [`INSERT INTO cltp.result (${ Object.keys(this.resultData.result).join(',') }) VALUES (${ Object.values(this.resultData.result).map(sqlValueFormatter).join(',') });`]

    // Create all results
    for (const entry of this.resultData.resultEntries.filter((entry) => this.resultData?.interpretations.some((inter) => entry.id === inter.result_entry_id))) q.push(`INSERT INTO cltp.result_entry (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`)

    // Create all interpretations
    for (const entry of this.resultData.interpretations) q.push(`INSERT INTO cltp.interpretation (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`)


    try
    {
      await this.dbService.query(q.join(""))

      this.toastsService.show(`Results for PCR Plate '${ this.pcrPlateId }' successfully inserted into the database`, { classname: 'bg-success text-light' })
    }
    catch (e)
    {
      alert("Could not insert into database, please check the logs for errors!")
      console.error(e)
      return
    }

    this.pcrPlateId = undefined
    this.file = undefined
    this.resultData = undefined
  }

  showDetails(poolId?: string): void
  {
    if (!poolId) alert("No pool available here.")

      if (this.resultData)
      {
        const interpretation = this.resultData.interpretations.find((i) => i.pool_id === poolId)
        const result = this.resultData.resultEntries.find((r) => r.id === interpretation?.result_entry_id)

        if (result)
        {
          alert(`Pool '${ poolId }': [${ interpretation?.interpretation.toUpperCase() }] (n1n2_cq = ${ result.n1n2_cq }, human_ic = ${ result.human_ic_cq })`)
        }
      }
  }


  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }
}
