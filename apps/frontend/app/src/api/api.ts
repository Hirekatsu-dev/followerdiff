import { inject, InjectionKey, provide } from "vue";

import { BaseApi } from "./BaseApi";
import { FollowerDiff } from "../models/FollowerDiff";
import { FollowerDiffSearchForm } from "../forms/FollowerDiffSearchForm";

export class Api extends BaseApi {
  constructor() {
    super();
  }

  public async getListFollowerDiff(form: FollowerDiffSearchForm) {
    return await this.requestGetList<FollowerDiff>({
      method: 'get',
      params: form.fields,
    });
  }
}

const API_INJECTION_KEY: InjectionKey<Api> = Symbol('api');

export function provideRemoteApi(): Api {
  const api = new Api();
  provide(API_INJECTION_KEY, api);

  return api;
}

export function useApi(): Api {
  const api = inject(API_INJECTION_KEY);

  if (!api) {
    throw new Error('API: `useAPI`は`provideRemoteApi`を実行してから呼んでください。');
  }

  return api;
}