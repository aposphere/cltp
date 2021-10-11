import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type InputDevice = "scanner" | "camera" | "manual";

@Injectable(
{
  providedIn: 'root',
})
export class StateService
{
  readonly uploadPersonalSample: Subject<void> = new Subject();

  readonly scanSucess: Subject<void> = new Subject();

  readonly inputDevice: BehaviorSubject<InputDevice> = new BehaviorSubject<InputDevice>('scanner');

  readonly scannerInputEnable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly scannerInput: Subject<string> = new Subject<string>();

}
