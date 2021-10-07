import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, takeUntil, tap } from 'rxjs/operators';
import { Credentials } from './interfaces/credentials';
import { ConfigService } from './services/config.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy
{
  credentials?: Credentials;

  flash = false;

  unsubscribe$ = new Subject<void>();

  constructor(
    public configService: ConfigService,
    public stateService: StateService
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scanSucess.pipe(takeUntil(this.unsubscribe$))
    .pipe(
      tap(() => this.flash = true),
      delay(200),
      tap(() => this.flash = false),
    ).subscribe(() => {});
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
