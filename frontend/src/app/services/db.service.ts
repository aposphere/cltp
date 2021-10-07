import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credentials } from '../interfaces/credentials';
import { environment } from 'src/environments/environment';

const ANONYMOUS_CREDENTIALS: Credentials =
{
  username: "anonymous",
  password: "anonymous"
}

@Injectable(
{
  providedIn: 'root',
})
export class DBService
{
  private credentials?: Credentials;

  constructor(
    private readonly http: HttpClient
  )
  { }

  async query(query: string, overrideCredentials?: Credentials): Promise<unknown>
  {
    if (!this.credentials && !overrideCredentials) throw new Error("No credentials")

    if (overrideCredentials) this.credentials = overrideCredentials;

    console.info("Run Query: ", query)

    return this.http.post(environment.backend,
    {
      query: query,
      ...this.credentials
    }).toPromise();
  }

  async anonymousQuery(query: string): Promise<unknown>
  {
    console.info("Run Anonymous Query: ", query)

    return this.http.post(environment.backend,
    {
      query: query,
      ...ANONYMOUS_CREDENTIALS
    }).toPromise();
  }
}
