import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Credentials } from 'src/app/interfaces/credentials';
import { Pool } from 'src/app/interfaces/pool';
import { PoolArrival } from 'src/app/interfaces/pool-arrival';
import { ConfigService } from 'src/app/services/config.service';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
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

  cameraEnabled = false;
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
    public stateService: StateService,
    public toastsService: ToastsService
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scannerInput.pipe(takeUntil(this.unsubscribe$), filter(() => this.scannerEnabled)).subscribe((input) =>
    {
      this.stateService.scanSucess.next()
      this.form.patchValue({ poolId: input })
      this.scannerEnabled = false
      this.stateService.scannerInputEnable.next(false)
    });
  }

  scanSuccessHandler(ev: string): void
  {
    this.stateService.scanSucess.next()
    this.form.patchValue({ poolId: ev.trim() })
    this.cameraEnabled = false
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
    INSERT INTO cltp.pool (pool_id) VALUES ('${pool.pool_id}');
    INSERT INTO cltp.pool_arrival (${Object.keys(poolArrival).join(',')}) VALUES (${Object.values(poolArrival).map(sqlValueFormatter).join(',')});
    `

    try
    {
      await this.dbService.query(q)

      this.toastsService.show(`Pool '${ pool.pool_id }' successfully inserted into the database`, { classname: 'bg-success text-light' })
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
