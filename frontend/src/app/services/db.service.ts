import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Credentials } from '../interfaces/credentials';
import { environment } from 'src/environments/environment';

/**
 * Credentials for anonymous requests
 */
const ANONYMOUS_CREDENTIALS: Credentials =
{
  /** Username */
  username: "anonymous",
  /** Password */
  password: environment.servicePassword,
}

@Injectable(
{
  providedIn: 'root',
})
export class DBService
{
  /** The user credentials */
  credentials?: Credentials;

  constructor(
    private readonly http: HttpClient,
  )
  { }

  /**
   * Send a query to the backend
   */
  query(query: string, overrideCredentials?: Credentials): Promise<unknown>
  {
    // Check the credentials
    if (!this.credentials && !overrideCredentials) throw new Error("No credentials")

    // Update the credentials if necessary
    if (overrideCredentials) this.credentials = overrideCredentials;

    console.info("Run Query: ", query)

    // Create a formdata object and set the values
    const formData = new FormData();
    formData.set("query", query)
    for (const key in this.credentials) formData.set(key, this.credentials[key as keyof Credentials])

    // Send the request
    return this.http.post(environment.backend, formData).toPromise();
  }

  /**
   * Send an anonymous query to the backend
   */
  anonymousQuery(query: string): Promise<unknown>
  {
    console.info("Run Anonymous Query: ", query)

    // Create a formdata object and set the values
    const formData = new FormData();
    formData.set("query", query)
    for (const key in ANONYMOUS_CREDENTIALS) formData.set(key, ANONYMOUS_CREDENTIALS[key as keyof Credentials])

    // Send the request
    return this.http.post(environment.backend, formData).toPromise();
  }
}
