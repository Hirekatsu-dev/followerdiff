import * as yup from 'yup';

export abstract class BaseForm<Fields> {
  abstract fields: Fields;
  abstract schema: yup.SchemaOf<Fields>;

  protected validationError: Partial<Record<keyof Fields, string>> = {};

  get error() {
    return this.validationError;
  }

  validate() {
    try {
      this.schema.validateSync(this.fields, {
        abortEarly: false
      });

      this.validationError = {};

      return true;

    } catch (error) {
      if (error instanceof yup.ValidationError) {
        this.validationError = {};
        error.inner.forEach(e => {
          const key = e.path as keyof Fields;
          const value = e.message;

          this.validationError[key] = value;
        });

        return false;

      } else {
        // バリデーション以外のエラー
        // 普通は起こらない
        throw error;
      }
    }
  }
}