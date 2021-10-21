import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { Credentials } from 'src/app/interfaces/credentials';
import { ProbeOrder, ProbeOrderJSON } from 'src/app/interfaces/probe-order.table';
import { ConfigService } from 'src/app/services/config.service';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { v4 } from 'uuid';
import { jsonValidator } from '../../helpers/json-validator';
import { probeOrderValidator } from '../../helpers/probe-order-validator';
import { sqlValueFormatter } from '../../helpers/sql-value-formatter';

const MAX_FILE_NUMBER = 100

@Component({
  selector: 'app-upload-probe-orders',
  templateUrl: './upload-probe-orders.component.html',
  styleUrls: ['./upload-probe-orders.component.scss'],
})
export class UploadProbeOrdersComponent implements OnDestroy
{
  /** The user credentials */
  credentials?: Credentials;

  /** Active tab */
  active = 1

  /** The form */
  form = new FormGroup(
  {
    comment: new FormControl(''),
    data: new FormControl('', Validators.compose([jsonValidator(), probeOrderValidator()])),
  });

  /** The files */
  files?: File[]

  /** The uploaded orders from the json */
  uploadedOrders: ProbeOrder[] = []

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
    public configService: ConfigService,
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
  }

  /**
   * Event listener for new files
   */
  filesChanged(ev: Event): void
  {
    // Check the files
    const t = ev.target as HTMLInputElement
    if (t.files && t.files[0])
    {
      // Limit the number of files
      if (t.files.length > MAX_FILE_NUMBER) return alert("You cannot upload more then 100 JSONs at once.")

      // Save the files
      this.files = Array.from(t.files)

      // Parse the files
      this.parseFiles()
    }
    else throw new Error("File or file list is undefined")
  }

  /**
   * Parse the files
   */
  parseFiles(): void
  {
    if (!this.files) throw new Error("No files specified")

    this.uploadedOrders = []

    // Read all files
    for (const file of this.files)
    {
      // Use the FileReader to get the content
      const fileReader = new FileReader()
      // Wait for the file to be ready
      fileReader.onload = (_e) =>
      {
        console.info("File loaded", file, fileReader.result)

        try
        {
          // Parse file
          const d = JSON.parse(fileReader.result as string) as ProbeOrderJSON

          // Check data
          if (!d.unternehmen_key) throw new Error("No 'unternehmen_key'")
          if (!d.barcode_nummer) throw new Error("No 'barcode_nummer'")

          this.uploadedOrders.push(
          {
            id: v4(),
            comment: `Uploaded from file: ${ file.name }`,
            ...d,
          })
        }
        catch (e)
        {
          console.error(e)
          return alert(`Could not parse file '${ file.name }: ${ e }`)
        }
      }
      fileReader.readAsText(file)
    }
  }


  /**
   * Upload the probe orders
   */
  async uploadOrders(): Promise<void>
  {
    let q = ""

    // Get the actor
    const actor = this.credentials?.username || 'anonymous'

    for (const entry of this.uploadedOrders)
    {
      q += `INSERT INTO cltp.probe_order (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`

      const auditLog: AuditLog =
      {
        type: 'upload-probe-order',
        ref: entry.id,
        actor: actor,
        message: `Probe Order [${ entry.id }] uploaded for Pool [${ entry.barcode_nummer }] by [${ actor }]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`
    }

    try
    {
      await this.dbService.query(q)

      this.toastsService.show(`${ this.uploadedOrders.length } Probe Orders successfully inserted into the database`, { classname: 'bg-success text-light' })
    }
    catch (e)
    {
      alert("Could not insert into database, please check the logs for errors!\nYou might have tried to upload duplicated Probe Orders?")
      console.error(e)
      return
    }

    // Reset
    this.form.reset()
    this.files = undefined
    this.uploadedOrders = []
  }


  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
