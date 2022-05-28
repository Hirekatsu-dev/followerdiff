import { RouteRecordRaw } from 'vue-router';
import { FollowerDiffSearchForm } from '../forms/FollowerDiffSearchForm';

export const Routes = Object.freeze({
  FollowerDiffList: 'FollowerDiffList'
})

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/followers/diff',
    name: Routes.FollowerDiffList,
    component: () => import('../pages/FollowerDiffSearchPage.vue'),
  },
  {
    path: '/:path(.*)*',
    redirect: {
      name: Routes.FollowerDiffList,
    },
  }
];