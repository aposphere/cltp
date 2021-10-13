import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ProbeOrderJSON } from 'src/app/interfaces/probe-order.table';

/**
 * Validator for a json text input to be a probe order
 */
 export function probeOrderValidator(): ValidatorFn
{
  return (control: AbstractControl): ValidationErrors | null =>
  {
    const error: ValidationErrors = { missingRequiredFields: true };

    try
    {
      const o = JSON.parse(control.value) as ProbeOrderJSON;

      if (!o.unternehmen_key) throw new Error("'unternehmen_key' missing")
      if (!o.barcode_nummer) throw new Error("'barcode_nummer' missing")
    }
    catch (e)
    {
      control.setErrors(error);
      return error;
    }

    control.setErrors(null);
    return null;
  };
}
