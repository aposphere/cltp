import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Credentials } from '../interfaces/credentials';
import { DBService } from './db.service';





@Injectable(
{
  providedIn: 'root',
})
export class ConfigService
{
  private readonly credentials: ReplaySubject<Credentials> = new ReplaySubject(1);
  public readonly credentials$: Observable<Credentials> = this.credentials.asObservable().pipe(map((el) => ({ ...el })));

  constructor(
    public dbService: DBService
  )
  {
  }

  async connectToDB(username: string, password: string): Promise<void>
  {
    try
    {
      const credentials =
      {
        username: username,
        password: password
      }

      await this.dbService.query("SELECT NOW()", credentials)

      this.credentials.next(credentials);
    }
    catch (e)
    {
      console.error(e);
      throw e;
    }
  }
}
