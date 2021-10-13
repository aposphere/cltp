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
  /** The active tab */
  active = false

  /** The buffer of the scanner input received from the barcode scanner */
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

  /**
   * Listener to the windows keydown event capturing the scanner input
   */
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent): void
  {
    // Ignore when not active
    if (this.active)
    {
      // Clear on escape
      if (event.key === "Escape")
      {
        this.buffer = ""
      }
      // Send on enter
      if (event.key === "Enter")
      {
        this.stateService.scannerInput.next(this.buffer)
        this.buffer = ""
      }
      // Only allow alphanumeric being added to the buffer
      else if (event.key.length === 1 && ALLOWED_CHARS.includes(event.key.toLocaleLowerCase())) this.buffer += event.key

      event.stopPropagation()
      event.preventDefault()

      console.info("Buffered Input:", this.buffer)
    }
  }
}
