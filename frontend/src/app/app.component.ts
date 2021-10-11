import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, takeUntil, tap } from 'rxjs/operators';
import { Credentials } from './interfaces/credentials';
import { ConfigService } from './services/config.service';
import { InputDevice, StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy
{
  credentials?: Credentials

  inputDevice: InputDevice = "scanner"

  flash = false

  unsubscribe$ = new Subject<void>()

  constructor(
    public configService: ConfigService,
    public stateService: StateService,
  )
  {
    this.stateService.inputDevice.pipe(takeUntil(this.unsubscribe$)).subscribe((inputDevice) => this.inputDevice = inputDevice);
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
    this.stateService.scanSucess.pipe(takeUntil(this.unsubscribe$))
    .pipe(
      tap(() => this.flash = true),
      delay(200),
      tap(() => this.flash = false),
    ).subscribe((v) => { console.info("Successful Scan:", v) });
  }

  changeInputDevice(ev: Event): void
  {
    // Change input device
    const target = ev.target as HTMLSelectElement
    if (target && target.value) this.stateService.inputDevice.next(target.value as InputDevice)
  }

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
