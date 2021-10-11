import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';
import { StateService } from 'src/app/services/state.service';
import { DBService } from 'src/app/services/db.service';


@Component({
  selector: 'core-system-popups',
  templateUrl: './system-popups.component.html',
  styleUrls: ['./system-popups.component.scss'],
})
export class SystemPopupsComponent implements OnDestroy, OnInit
{
  username?: string;

  password?: string;

  staffId?: string;

  sampleId?: string;

  credentials?: Credentials;

  @ViewChild('connectionPopup') connectionPopup?: TemplateRef<HTMLElement>;

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

      console.log(this.staffId, this.sampleId)

      const q = `INSERT INTO cltp.sample (sample_id, staff_id) VALUES ('${ this.sampleId }','${ this.staffId }');`

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

  scanSuccessHandler(ev: string): void
  {
    this.stateService.scanSucess.next()

    if (!this.staffId) this.staffId = ev
    else if (this.staffId !== ev) this.sampleId = ev
    else alert("Please do not scan the same code again.")
  }

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
