import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface MetricsLog
{
  value: number;
  metric: string;
  environment: string;
}

@Injectable(
{
  providedIn: 'root',
})
export class MetricsService
{
  constructor(
    private readonly http: HttpClient,
  )
  { }

  /**
   * Send a log to the metrics apo
   */
  async log(metrics: Pick<MetricsLog, 'value' | 'metric'>): Promise<void>
  {
    if (!environment.metricsEndpoint) return Promise.resolve();

    console.info("Log Metrics: ", metrics)
    // Send the request
    try
    {
      await this.http.post(environment.metricsEndpoint, { ...metrics, environment: environment.production ? 'production' : 'development' }).toPromise();
    }
    catch (e)
    {
      if (environment.metricsFailSilently) console.warn(e)
      else throw e
    }
  }
}
