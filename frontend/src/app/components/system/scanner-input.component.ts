import { Component, OnDestroy, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';

const ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789-_"

@Component({
  selector: 'core-scanner-input',
  templateUrl: './scanner-input.component.html',
  styleUrls: ['./scanner-input.component.scss'],
})
export class ScannerInputComponent implements OnDestroy
{
  active = false

  buffer = ""

  constructor(public stateService: StateService)
  {
    this.stateService.scannerInputEnable.pipe(takeUntil(this.unsubscribe$)).subscribe((active) =>
    {
      this.active = active
      this.buffer = ""
    });
  }

  unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent): void
  {
    if (this.active)
    {
      if (event.key === "Escape")
      {
        this.buffer = ""
      }
      if (event.key === "Enter")
      {
        this.stateService.scannerInput.next(this.buffer)
        this.buffer = ""
      }
      // Only allow alphanumeric
      else if (event.key.length === 1 && ALLOWED_CHARS.includes(event.key.toLocaleLowerCase())) this.buffer += event.key

      event.stopPropagation()
      event.preventDefault()

      console.info("Buffered Input:", this.buffer)
    }
  }
}
