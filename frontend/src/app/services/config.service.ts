import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Credentials } from '../interfaces/credentials';
import { DBService } from './db.service';
import { MetricsService } from './metrics.service';





@Injectable(
{
  providedIn: 'root',
})
export class ConfigService
{
  /** The user credentials */
  private readonly credentials: ReplaySubject<Credentials> = new ReplaySubject(1);

  /** The user credentials as observable (copy) */
  public readonly credentials$: Observable<Credentials> = this.credentials.asObservable().pipe(map((el) => ({ ...el })));

  constructor(
    public dbService: DBService,
    public metricsService: MetricsService,
  )
  { }

  /**
   * Verify the credentials and try to connect to the database
   */
  async connectToDB(username: string, password: string): Promise<void>
  {
    try
    {
      // Create the credentials object
      const credentials: Credentials =
      {
        username: username,
        password: password,
      }

      // Run a test query
      await this.dbService.query("SELECT 1 + 1 AS TEST_QUERY", credentials)

      // Log logins to metrics
      this.metricsService.log({ metric: 'login', value: 1 })

      // Save the credentials on success of the test query
      this.credentials.next(credentials);
    }
    catch (e)
    {
      console.error(e);
      throw e;
    }
  }
}
