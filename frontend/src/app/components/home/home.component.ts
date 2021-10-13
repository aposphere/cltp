import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';

interface CountSQLResponse { __COUNT: string }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy
{
  /** Number of samples ready */
  samplesReady?: number

  /** Number of pools ready */
  poolsReady?: number

  /** Number of probe orders ready */
  probeOrdersReady?: number

  /** Number of racks ready */
  racksReady?: number

  /** Number of plates ready */
  platesReady?: number

  /** Number of pcr plates ready */
  pcrPlatesReady?: number

  /** Number of interpretations pending to download */
  interpretationsPending?: number

  unsubscribe$ = new Subject<void>();

  constructor(
    public stateService: StateService,
    public dbService: DBService,
  )
  {
    this.loadReadySamples()
    this.loadReadyPools()
    this.loadReadyProbeOrders()
    this.loadReadyRacks()
    this.loadReadyPlates()
    this.loadReadyPcrPlate()
    this.loadInterpretationPending()
  }

  /**
   * Load ready samples
   */
  async loadReadySamples(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.sample_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.samplesReady = count
  }


  /**
   * Load ready pools
   */
  async loadReadyPools(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.pool_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.poolsReady = count
  }


  /**
   * Load ready probe orders
   */
  async loadReadyProbeOrders(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.probe_order_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.probeOrdersReady = count
  }

  /**
   * Load ready racks
   */
  async loadReadyRacks(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.rack_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.racksReady = count
  }

  /**
   * Load ready plates
   */
  async loadReadyPlates(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.plate_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.platesReady = count
  }

  /**
   * Load ready pcr plates
   */
  async loadReadyPcrPlate(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.pcr_plate_ready;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.pcrPlatesReady = count
  }


  /**
   * Load pending interpretations
   */
  async loadInterpretationPending(): Promise<void>
  {
    let count;
    try
    {
      const resultsRes = await this.dbService.query(`SELECT COUNT(*) as "__COUNT" FROM cltp.interpretation_pending;`)

      count = +(resultsRes as { recordset: CountSQLResponse[] }).recordset[0].__COUNT
    }
    catch (e)
    {
      alert("Could not count the entries in the database!")
      console.error(e)
      return
    }

    this.interpretationsPending = count
  }



  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
