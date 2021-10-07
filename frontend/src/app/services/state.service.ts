import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Credentials } from '../interfaces/credentials';



@Injectable(
{
  providedIn: 'root',
})
export class StateService
{
  readonly scanSucess: Subject<void> = new Subject();

  readonly scannerInputEnable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly scannerInput: Subject<string> = new Subject<string>();

}
