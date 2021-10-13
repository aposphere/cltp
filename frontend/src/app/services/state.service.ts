import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

/** Scanner input type */
export type InputDevice = "scanner" | "camera" | "manual";

@Injectable(
{
  providedIn: 'root',
})
export class StateService
{
  /** Trigger the upload personal sample popup */
  readonly uploadPersonalSample: Subject<void> = new Subject();

  /** Successful scan emitter */
  readonly scanSucess: Subject<void> = new Subject();

  /** Currently selected input device */
  readonly inputDevice: BehaviorSubject<InputDevice> = new BehaviorSubject<InputDevice>('scanner');

  /** Flag to enable the scanner input capturing the keyboard input coming from the barcode scanner */
  readonly scannerInputEnable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Emitter for the barcodes registered */
  readonly scannerInput: Subject<string> = new Subject<string>();

}
