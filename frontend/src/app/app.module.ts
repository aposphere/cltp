import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { HomeComponent } from './components/home/home.component';
import { SystemPopupsComponent } from './components/system/system-popups.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

import { UploadProbeOrdersComponent } from './components/upload-probe-orders/upload-probe-orders.component';
import { RegisterPoolComponent } from './components/register-pool/register-pool.component';
import { PoolRackMappingComponent } from './components/pool-rack-mapping/pool-rack-mapping.component';
import { RackPlateMappingComponent } from './components/rack-plate-mapping/rack-plate-mapping.component';
import { PlatePcrPlateMappingComponent } from './components/plate-pcr-plate-mapping/plate-pcr-plate-mapping.component';
import { UploadResultsComponent } from './components/upload-results/upload-results.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SystemPopupsComponent,
    PageNotFoundComponent,
    UploadProbeOrdersComponent,
    RegisterPoolComponent,
    PoolRackMappingComponent,
    RackPlateMappingComponent,
    PlatePcrPlateMappingComponent,
    UploadResultsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModule,

    ZXingScannerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
