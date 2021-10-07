import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Credentials } from 'src/app/interfaces/credentials';
import { Pool } from 'src/app/interfaces/pool';
import { PoolArrival } from 'src/app/interfaces/pool-arrival';
import { ConfigService } from 'src/app/services/config.service';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { v4 } from 'uuid';
import { sqlValueFormatter } from '../helpers/sql-value-formatter';

@Component({
  selector: 'app-register-pool',
  templateUrl: './register-pool.component.html',
  styleUrls: ['./register-pool.component.scss'],
})
export class RegisterPoolComponent implements OnDestroy
{
  credentials?: Credentials;

  scannerEnabled = false;

  form = new FormGroup(
  {
    poolId: new FormControl('', Validators.required),
    source: new FormControl(''),
    comment: new FormControl('')
  });

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public configService: ConfigService,
    public stateService: StateService
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
  }

  scanSuccessHandler(ev: string): void
  {
    this.stateService.scanSucess.next()
    this.form.patchValue({ poolId: ev.trim() })
    this.scannerEnabled = false
  }

  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }


  async onSubmit(): Promise<void>
  {
    if (!this.credentials) throw new Error("No user credentials found")

    const poolArrival: PoolArrival =
    {
      id: v4(),
      pool_id: this.form.value.poolId,
      comment: this.form.value.comment || "",
      source: this.form.value.source,
      technician: this.credentials.username
    };

    const pool: Pool =
    {
      pool_id: this.form.value.poolId
    };

    const q = `
    INSERT INTO pool (pool_id) VALUES ('${pool.pool_id}');
    INSERT INTO pool_arrival (${Object.keys(poolArrival).join(',')}) VALUES (${Object.values(poolArrival).map(sqlValueFormatter).join(',')});
    `

    try
    {
      await this.dbService.query(q)

      // alert("Data successfully inserted into the database.")
    }
    catch (e)
    {
      alert("Could not insert into database, please check the logs for errors!")
      console.error(e)
      return
    }

    this.form.reset()
  }


  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}