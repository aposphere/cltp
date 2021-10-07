import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, take } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';
import { Credentials } from 'src/app/interfaces/credentials';

@Component({
  selector: 'core-system-popups',
  templateUrl: './system-popups.component.html',
  styleUrls: ['./system-popups.component.scss'],
})
export class SystemPopupsComponent implements OnDestroy, OnInit
{
  username?: string;
  password?: string;

  credentials?: Credentials;

  @ViewChild('connectionPopup') connectionPopup?: TemplateRef<HTMLElement>;

  unsubscribe$ = new Subject<void>();

  constructor(
    public modalService: NgbModal,
    public configService: ConfigService
  )
  {
    this.configService.credentials$.pipe(takeUntil(this.unsubscribe$)).subscribe((credentials) => this.credentials = credentials);
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

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
