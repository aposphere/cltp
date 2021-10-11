import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { UploadProbeOrdersComponent } from './components/upload-probe-orders/upload-probe-orders.component';
import { PoolingComponent } from './components/pooling/pooling.component';
import { PoolRackMappingComponent } from './components/pool-rack-mapping/pool-rack-mapping.component';
import { RackPlateMappingComponent } from './components/rack-plate-mapping/rack-plate-mapping.component';
import { PlatePcrPlateMappingComponent } from './components/plate-pcr-plate-mapping/plate-pcr-plate-mapping.component';
import { UploadResultsComponent } from './components/upload-results/upload-results.component';
import { DownloadProbeResultsComponent } from './components/download-probe-results/download-probe-results.component';

const routes: Routes =
[
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'cltp', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'upload-probe-orders',
    component: UploadProbeOrdersComponent,
  },
  {
    path: 'pooling',
    component: PoolingComponent,
  },
  {
    path: 'pool-rack-mapping',
    component: PoolRackMappingComponent,
  },
  {
    path: 'rack-plate-mapping',
    component: RackPlateMappingComponent,
  },
  {
    path: 'plate-pcr-plate-mapping',
    component: PlatePcrPlateMappingComponent,
  },
  {
    path: 'upload-results',
    component: UploadResultsComponent,
  },
  {
    path: 'download-probe-results',
    component: DownloadProbeResultsComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
