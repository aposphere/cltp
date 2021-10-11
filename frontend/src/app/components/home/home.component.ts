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
  samplesReady?: number

  poolsReady?: number

  probeOrdersReady?: number

  racksReady?: number

  platesReady?: number

  pcrPlatesReady?: number

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
