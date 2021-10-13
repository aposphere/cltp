import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';
import { StateService } from 'src/app/services/state.service';
import { DBService } from 'src/app/services/db.service';
import { AuditLog } from 'src/app/interfaces/audit-log.table';
import { sqlValueFormatter } from 'src/app/helpers/sql-value-formatter';


@Component({
  selector: 'core-system-popups',
  templateUrl: './system-popups.component.html',
  styleUrls: ['./system-popups.component.scss'],
})
export class SystemPopupsComponent implements OnDestroy, OnInit
{
  /** The username */
  username?: string;

  /** The password */
  password?: string;

  /** The staff id */
  staffId?: string;

  /** The sample id */
  sampleId?: string;

  /** The user credentials */
  credentials?: Credentials;

  /** The connection popup */
  @ViewChild('connectionPopup') connectionPopup?: TemplateRef<HTMLElement>;

  /** The upload personal sample popup */
  @ViewChild('uploadPersonalSamplePopup') uploadPersonalSamplePopup?: TemplateRef<HTMLElement>;

  unsubscribe$ = new Subject<void>();

  constructor(
    public dbService: DBService,
    public modalService: NgbModal,
    public stateService: StateService,
    public configService: ConfigService,
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials)
    this.stateService.uploadPersonalSample.pipe(takeUntil(this.unsubscribe$)).subscribe(() => this.showUploadPersonalSamplePopup())
  }

  ngOnInit(): void
  {
    setTimeout(() => this.showConnectionPopup(), 100)
  }


  /**
   * Show connection popup
   */
  async showConnectionPopup(): Promise<void>
  {
     this.password = undefined;

     const modal = this.modalService.open(this.connectionPopup, { size: 'md' });

    try
    {
      await modal.result; // Fails on modal dismiss

      if (!this.username) throw new Error("ID is undefined");
      if (!this.password) throw new Error("Password is undefined");

      // Connect to database with credentials
      await this.configService.connectToDB(this.username, this.password);
    }
    catch (e)
    {
      if (!this.credentials) this.showConnectionPopup(); // Repeat, trap the user in this loop
      else alert("Could not connect with provided credentials, reverting to previous!")
    }
  }


  /**
   * Show upload personal sample popup
   */
  async showUploadPersonalSamplePopup(): Promise<void>
  {
    const modal = this.modalService.open(this.uploadPersonalSamplePopup, { size: 'fullscreen' });

    try
    {
      await modal.result; // Fails on modal dismiss

      if (!this.staffId) throw new Error("Staff is undefined");
      if (!this.sampleId) throw new Error("Sample is undefined");

      // Register the sample for the staff member
      let q = `INSERT INTO cltp.sample (sample_id, staff_id) VALUES ('${ this.sampleId }','${ this.staffId }');`

      const auditLog: AuditLog =
      {
        type: 'register-sample',
        ref: this.sampleId,
        actor: 'anonymous',
        message: `Sample [${ this.sampleId }] registered for Staff [${ this.staffId }] by [anonymous]`,
      }
      q += `INSERT INTO cltp.audit_log (${ Object.keys(auditLog).join(',') }) VALUES (${ Object.values(auditLog).map(sqlValueFormatter).join(',') });`


      try
      {
        await this.dbService.anonymousQuery(q)

        alert("Registration completed, thank you for your contribution!")
      }
      catch (e)
      {
        alert("Registration Failed! You have to be registered as staff in the database and each sample can only be registered once!")
        console.error(e)
      }

      this.staffId = undefined
      this.sampleId = undefined
    }
    catch (e)
    {
      console.error(e)
    }
  }

  /**
   * Success handler for the scanner
   */
  scanSuccessHandler(ev: string): void
  {
    this.stateService.scanSucess.next()

    if (!this.staffId) this.staffId = ev
    else if (this.staffId !== ev) this.sampleId = ev
    else alert("Please do not scan the same code again.")
  }

  /**
   * Error handler for the scanner
   */
  scanErrorHandler(ev: unknown): void
  {
    console.error("SCAN ERROR")
    console.error(ev)
  }

   ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
