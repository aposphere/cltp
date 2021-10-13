import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for a json text input
 */
export function jsonValidator(): ValidatorFn
{
  return (control: AbstractControl): ValidationErrors | null =>
  {
    const error: ValidationErrors = { jsonInvalid: true };

    try
    {
      JSON.parse(control.value);
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
