import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SunburstComponent } from './sunburst/sunburst.component';
import { HomeComponent } from './home/home.component';
import { MasterMapComponent } from './home/master-map/master-map.component';

@NgModule({
  declarations: [
    AppComponent,
    SunburstComponent,
    HomeComponent,
    MasterMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
