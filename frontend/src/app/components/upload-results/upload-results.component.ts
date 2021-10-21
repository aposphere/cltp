import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {  takeUntil } from 'rxjs/operators';
import { Interpretation } from 'src/app/interfaces/interpretation.table';
import { MappingView } from 'src/app/interfaces/mapping.view';
import { Result } from 'src/app/interfaces/result.table';
import { ResultEntry } from 'src/app/interfaces/result-entry.table';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { v4 } from 'uuid';
import map_transform_rack_to_plate from 'src/assets/map_transform_rack_to_plate.json'
import map_transform_plate_to_pcr_plate from 'src/assets/map_transform_plate_to_pcr_plate.json'
import { sqlValueFormatter } from '../../helpers/sql-value-formatter';
import { ToastsService } from 'src/app/services/toasts.service';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { MetricsService } from 'src/app/services/metrics.service';

/** The coordinate of the neg control */
const NEG_CONTROL_COORDINATE = "C24"
/** The coordinate of the neg control */
const POS_CONTROL_COORDINATE = "P24"

/** The index of the coordinate in the results csv */
const COL_COORDINATE = 1
/** The index of the cq value in the results csv */
const COL_CQ = 8

/** Height of the PCR Plate */
const M = 16
/** Width of the PCR Plate */
const N = 24

/** Height of the Plate */
const O = 8
/** Width of the Plate */
const P = 12

/** Height of the Rack */
const Q = 4
/** Width of the Rack */
const R = 6

/** Alphabet */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

/** Interface of the object containing all result data extracted from the results csv */
interface ResultData
{
  /** The result entry of the csv */
  result: Result,
  /** All entries of the result */
  resultEntries: ResultEntry[],
  /** The interpretations located in the pcr plate */
  pcrMap: Interpretation[][],
  /** The interpretations located in the plates */
  plateMaps: { plateId: string, map: Interpretation[][] }[],
  /** The interpretations located in the racks */
  rackMaps: { rackId: string, map: Interpretation[][] }[],
  /** All interpretations of the pools */
  interpretations: Interpretation[],
  /** Interpretation of the negative control */
  negControl: number | "undetermined",
  /** Interpretation of the positive control */
  posControl: number | "undetermined",
  /** Number of entries tested */
  entriesTested: number,
  /** Number of negative entries */
  entriesNeg: number,
  /** Number of positive entries */
  entriesPos: number,
  /** Number of undetermined entries */
  entriesUn: number,
  /** Number of results found without any interpretation of pool */
  noResults: MappingView[]
}

@Component(
{
  selector: 'app-upload-results',
  templateUrl: './upload-results.component.html',
  styleUrls: ['./upload-results.component.scss'],
})
export class UploadResultsComponent implements OnDestroy
{
  /** The user credentials */
  credentials?: Credentials;

  /** Height of the PCR Plate */
  N = N

  /** Width of the PCR Plate */
  M = M

  /** Height of the Plate */
  O = O

  /** Width of the Plate */
  P = P

  /** Height of the Rack */
  Q = Q

  /** Width of the Rack */
  R = R

  /** Alphabet */
  ALPHABET = ALPHABET

  /** Active tab */
  active = 1

  /** The pcr plate identifier extracted from the results csv */
  pcrPlateId?: string

  /** The results csv */
  file?: File

  /** The results data extracted from the results csv */
  resultData?: ResultData

  unsubscribe$ = new Subject<void>()

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
    public configService: ConfigService,
    public metricsService: MetricsService,
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
  }

  /**
   * Event handler listening to files being uploaded
   */
  fileChanged(ev: Event): void
  {
    // Check for file
    const t = ev.target as HTMLInputElement
    if (t.files && t.files[0])
    {
      // Save the file
      this.file = t.files[0]

      // Parse the file
      this.parseFile()
    }
    else throw new Error("File or file list is undefined")
  }

  /**
   * Parse the file content
   */
  parseFile(): void
  {
    if (!this.file) throw new Error("No file specified")

    // Use FileReader to get the text content of the file
    const fileReader = new FileReader()
    // Wait for file being loaded
    fileReader.onload = (_e) =>
    {
      // Analyse the content of the result csv
      this.analyseFileContent(fileReader.result as string)
    }
    // Read as text
    fileReader.readAsText(this.file)
  }

  /**
   * Analyse the content of the result csv
   */
  async analyseFileContent(content: string): Promise<void>
  {
    // Split the rows
    const rows = content.split('\n')

    // Create the result object
    const resultRaw = []

    // Get all comment limes
    while (rows[0].startsWith("#")) resultRaw.push(rows.shift())

    // Filter out the barcode row
    const barcodeRow = resultRaw.find((row) => row?.includes("Barcode"))
    // Extract the pcr plate id
    if (barcodeRow) this.pcrPlateId = barcodeRow?.split(": ")[1].trim()

    if (!this.pcrPlateId) throw new Error("PCR Plate ID is undefined")

    // Create the result entry
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


      // Create an entry
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

    // Check the controls
    if (!posControlEntry) return alert("Positive control entry not found!")
    if (!negControlEntry) return alert("Negative control entry not found!")

    if (negControlEntry.n1n2_cq !== undefined) return alert(`Negative control failed! N1N2_cq (${ negControlEntry.coordinate }) is '${ negControlEntry.n1n2_cq }' instead of 'Undetermined'!`)
    if (posControlEntry.n1n2_cq === undefined || posControlEntry.n1n2_cq >= 40) return alert(`Positive control failed! N1N2_cq (${ posControlEntry.coordinate }) is '${ posControlEntry.n1n2_cq }' instead of '<40'!`)

    // Interprete results
    this.interpreteResults(result, resultEntries, posControlEntry.n1n2_cq, negControlEntry.n1n2_cq)
  }

  /**
   * Interprete results
   */
  async interpreteResults(result: Result, resultEntries: ResultEntry[], posControl: number | undefined, negControl: number | undefined): Promise<void>
  {
    // Create the pcr plate map
    const pcrMap = new Array<Interpretation[]>(M);
    for (let i = 0; i < M; i++) pcrMap[i] = new Array<Interpretation>(N);


    // Create result data
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
      // Get the mapping
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

      // Get the result of the mapping
      const result = resultEntries.find((entry) => entry.coordinate === effectivePcrPlateCoordinate)
      if (result)
      {
        let i: "positive" | "negative" | "undetermined" | "unknown" = "unknown"

        // Check thresholds
        if (result.n1n2_cq === undefined && result.human_ic_cq !== undefined &&result.human_ic_cq < 35) i = "negative";
        else if (result.n1n2_cq !== undefined && result.n1n2_cq < 40) i = "positive";
        else if (result.n1n2_cq === undefined && (result.human_ic_cq === undefined || result.human_ic_cq > 35)) i = "undetermined"

        // Create an interpretation
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

        y_ = mappingEntry.pool_coordinate.substr(0, 1)
        x = +mappingEntry.pool_coordinate.substr(1)

        if (rackMap.map[ALPHABET.indexOf(y_)]) rackMap.map[ALPHABET.indexOf(y_)][x - 1] = interpretation
      }
      else
      {
        console.info("No result for mapping:", mappingEntry)
        resultData.noResults.push(mappingEntry)
      }
    }

    this.resultData = resultData
  }

  /**
   * Upload the results
   */
  async uploadResults(): Promise<void>
  {
    if (!this.resultData) throw new Error("Result data not available")

    // Get the actor
    const actor = this.credentials?.username || 'anonymous'

    // Create the result
    let q = `INSERT INTO cltp.result (${ Object.keys(this.resultData.result).join(',') }) VALUES (${ Object.values(this.resultData.result).map(sqlValueFormatter).join(',') });`

    const auditLog: AuditLog =
    {
      type: 'upload-result',
      ref: this.resultData.result.id,
      actor: actor,
      message: `Result [${ this.resultData.result.id }] uploaded by [${ actor }]`,
    }
    q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`


    // Create all results
    for (const entry of this.resultData.resultEntries.filter((entry) => this.resultData?.interpretations.some((inter) => entry.id === inter.result_entry_id)))
    {
      q += `INSERT INTO cltp.result_entry (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`

      const auditLog: AuditLog =
      {
        type: 'upload-result-entry',
        ref: entry.id,
        actor: actor,
        message: `Result Entry [${ this.resultData.result.id }] of Result [${ this.resultData.result.id }] uploaded by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
    }

    // Create all interpretations
    for (const entry of this.resultData.interpretations)
    {
      q += `INSERT INTO cltp.interpretation (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`

      const auditLog: AuditLog =
      {
        type: 'upload-interpretation',
        ref: entry.id,
        actor: actor,
        message: `Interpretation [${ entry.id }] of Result Entry [${ entry.result_entry_id }] uploaded for Pool [${ entry.pool_id }] by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
    }


    try
    {
      await this.dbService.query(q)

      // Log pcr runs to metrics
      this.metricsService.log({ metric: 'pcr-runs', value: 1 })

      // Log pool results to metrics
      this.metricsService.log({ metric: 'pool-results', value: this.resultData.entriesTested })

      // Log positive pool results to metrics
      this.metricsService.log({ metric: 'positive-pool-results', value: this.resultData.entriesPos })

      // Log negative pool results to metrics
      this.metricsService.log({ metric: 'negative-pool-results', value: this.resultData.entriesNeg + this.resultData.entriesUn })


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

  /**
   * Show details of a pool
   */
  showDetails(poolId?: string): void
  {
    if (!poolId) alert("No pool available here.")

      if (this.resultData)
      {
        // Get interpretation of the pool
        const interpretation = this.resultData.interpretations.find((i) => i.pool_id === poolId)
        // Get result of the pool
        const result = this.resultData.resultEntries.find((r) => r.id === interpretation?.result_entry_id)

        if (result)
        {
          // Show as alert popup
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
