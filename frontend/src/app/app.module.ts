import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { HomeComponent } from './components/home/home.component';
import { SystemPopupsComponent } from './components/system/system-popups.component';
import { ToastsContainerComponent } from './components/system/toasts-container.component';
import { ScannerInputComponent } from './components/system/scanner-input.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { UploadProbeOrdersComponent } from './components/upload-probe-orders/upload-probe-orders.component';
import { PoolingComponent } from './components/pooling/pooling.component';
import { PoolRackMappingComponent } from './components/pool-rack-mapping/pool-rack-mapping.component';
import { RackPlateMappingComponent } from './components/rack-plate-mapping/rack-plate-mapping.component';
import { PlatePcrPlateMappingComponent } from './components/plate-pcr-plate-mapping/plate-pcr-plate-mapping.component';
import { UploadResultsComponent } from './components/upload-results/upload-results.component';
import { DownloadProbeResultsComponent } from './components/download-probe-results/download-probe-results.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SystemPopupsComponent,
    ToastsContainerComponent,
    ScannerInputComponent,
    PageNotFoundComponent,
    UploadProbeOrdersComponent,
    PoolingComponent,
    PoolRackMappingComponent,
    RackPlateMappingComponent,
    PlatePcrPlateMappingComponent,
    UploadResultsComponent,
    DownloadProbeResultsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModule,

    ZXingScannerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
