import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credentials } from '../interfaces/credentials';
import { environment } from 'src/environments/environment';

const ANONYMOUS_CREDENTIALS: Credentials =
{
  username: "anonymous",
  password: "cltp",
}

@Injectable(
{
  providedIn: 'root',
})
export class DBService
{
  private credentials?: Credentials;

  constructor(
    private readonly http: HttpClient,
  )
  { }

  query(query: string, overrideCredentials?: Credentials): Promise<unknown>
  {
    if (!this.credentials && !overrideCredentials) throw new Error("No credentials")

    if (overrideCredentials) this.credentials = overrideCredentials;

    console.info("Run Query: ", query)

    const formData = new FormData();
    formData.set("query", query)
    for (const key in this.credentials) formData.set(key, this.credentials[key as keyof Credentials])

    return this.http.post(environment.backend, formData).toPromise();
  }

  anonymousQuery(query: string): Promise<unknown>
  {
    console.info("Run Anonymous Query: ", query)

    const formData = new FormData();
    formData.set("query", query)
    for (const key in ANONYMOUS_CREDENTIALS) formData.set(key, ANONYMOUS_CREDENTIALS[key as keyof Credentials])

    return this.http.post(environment.backend, formData).toPromise();
  }
}
