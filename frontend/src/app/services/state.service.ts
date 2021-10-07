import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Credentials } from '../interfaces/credentials';



@Injectable(
{
  providedIn: 'root',
})
export class StateService
{
  readonly scanSucess: Subject<void> = new Subject();
}
