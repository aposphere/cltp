import { Injectable, TemplateRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast
{
  /** The string or template to show */
  textOrTpl: string | TemplateRef<HTMLElement>;
  /** Add a custom delay to the toast auto hide */
  delay?: number;
  /** Add classname to toast */
  classname?: string;
}

@Injectable(
{
  providedIn: 'root',
})
export class ToastsService
{
  // The list of toasts
  public readonly toasts: Toast[] = [];

  private readonly _toast: Subject<Toast> = new Subject<Toast>();

  public toast$: Observable<Toast> = this._toast.asObservable();

  /**
   * Add a new toast
   */
  show(textOrTpl: string | TemplateRef<HTMLElement>, options: Pick<Toast, 'delay' | 'classname'> = {}): Toast
  {
    const toast = { textOrTpl, ...options };
    this.toasts.push(toast);
    this._toast.next(toast);
    return toast;
  }

  /**
   * Remove an existing toast
   */
  remove(toast: Toast): void
  {
    const index = this.toasts.indexOf(toast);
    if (index > -1) this.toasts.splice(index, 1);
  }

}
