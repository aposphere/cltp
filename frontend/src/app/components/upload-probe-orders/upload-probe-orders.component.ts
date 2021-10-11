import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ProbeOrder, ProbeOrderJSON } from 'src/app/interfaces/probe-order';
import { DBService } from 'src/app/services/db.service';
import { StateService } from 'src/app/services/state.service';
import { ToastsService } from 'src/app/services/toasts.service';
import { v4 } from 'uuid';
import { jsonValidator } from '../../helpers/json-validator';
import { probeOrderValidator } from '../../helpers/probe-order-validator';
import { sqlValueFormatter } from '../../helpers/sql-value-formatter';

@Component({
  selector: 'app-upload-probe-orders',
  templateUrl: './upload-probe-orders.component.html',
  styleUrls: ['./upload-probe-orders.component.scss'],
})
export class UploadProbeOrdersComponent implements OnDestroy
{
  active = 1

  form = new FormGroup(
  {
    comment: new FormControl(''),
    data: new FormControl('', Validators.compose([jsonValidator(), probeOrderValidator()])),
  });

  files?: File[]

  uploadedOrders: ProbeOrder[] = []

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public stateService: StateService,
    public toastsService: ToastsService,
  )
  {
  }

  filesChanged(ev: Event): void
  {
    const t = ev.target as HTMLInputElement
    if (t.files && t.files[0])
    {
      this.files = Array.from(t.files)

      this.parseFiles()
    }
    else throw new Error("File or file list is undefined")
  }

  parseFiles(): void
  {
    if (!this.files) throw new Error("No files specified")

    this.uploadedOrders = []

    for (const file of this.files)
    {
      const fileReader = new FileReader()
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


  async uploadOrders(): Promise<void>
  {
    const q = []

    for (const entry of this.uploadedOrders) q.push(`INSERT INTO cltp.probe_order (${ Object.keys(entry).join(',') }) VALUES (${ Object.values(entry).map(sqlValueFormatter).join(',') });`)

    try
    {
      await this.dbService.query(q.join(""))

      this.toastsService.show(`${ q.length } Probe Orders successfully inserted into the database`, { classname: 'bg-success text-light' })
    }
    catch (e)
    {
      alert("Could not insert into database, please check the logs for errors!")
      console.error(e)
      return
    }

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
