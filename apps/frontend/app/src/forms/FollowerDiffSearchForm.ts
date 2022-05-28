import { LocationQuery } from 'vue-router';
import * as yup from 'yup';
import { BaseForm } from './BaseForm';

class Fields {
  id: string | null = null;
  from: string | null = null;
  to: string | null = null;
}

export class FollowerDiffSearchForm extends BaseForm<Fields> {
  readonly fields: Fields;

  readonly schema: yup.SchemaOf<Fields> = yup.object({
    id: yup
      .string()
      .required('必須項目です。')
      .matches(/\d+$/, { message: '数字を入力してください。' }),
    from: yup
      .string()
      .required('必須項目です。'),
    to: yup
      .string()
      .required('必須項目です。'),
  });

  constructor(
    query: Partial<Fields>
  ) {
    super();
    this.fields = {
      ...new Fields(),
      ...query
    };
  }

  toQuery() {
    const query: LocationQuery = {};

    if (this.fields.id) {
      query['id'] = this.fields.id;
    }
    if (this.fields.from) {
      query['from'] = this.fields.from;
    }
    if (this.fields.to) {
      query['to'] = this.fields.to;
    }

    return query;
  }
}