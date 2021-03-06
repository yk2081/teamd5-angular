import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SunburstComponent } from './sunburst/sunburst.component';
import { HomeComponent } from './home/home.component';
import { MasterMapComponent } from './home/master-map/master-map.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './profile/profile.component';
import { CareerComponent } from './career/career.component';
import { IntroComponent } from './intro/intro.component';
import { UserModalComponent } from './home/user-modal/user-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    SunburstComponent,
    HomeComponent,
    MasterMapComponent,
    NavbarComponent,
    ProfileComponent,
    CareerComponent,
    IntroComponent,
    UserModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
