import { Component, TemplateRef, OnDestroy } from '@angular/core';
import { ToastsService } from '../../services/toasts.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'core-toasts-container',
  templateUrl: './toasts-container.component.html',
  /* eslint @angular-eslint/no-host-metadata-property: "off" */
  host: { '[class.ngb-toasts]': 'true' }, // Bind to host directly
  styleUrls: ['./toasts-container.component.scss'],
})
export class ToastsContainerComponent implements OnDestroy
{
  constructor(public toastsService: ToastsService) { }

  unsubscribe$ = new Subject<void>();

  ngOnDestroy(): void
  {
    // Clean up all subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isTemplate(toast: { textOrTpl: string | TemplateRef<unknown> }): boolean { return toast.textOrTpl instanceof TemplateRef; }

  castToastToString(toast: { textOrTpl: string | TemplateRef<unknown> }): string { return toast.textOrTpl as string; }

  castToastToTpl(toast: { textOrTpl: string | TemplateRef<unknown> }): TemplateRef<unknown> { return toast.textOrTpl as TemplateRef<unknown>; }
}
