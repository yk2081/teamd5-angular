import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SunburstComponent } from './sunburst/sunburst.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { CareerComponent } from './career/career.component';
import { IntroComponent } from './intro/intro.component';

const routes: Routes = [
  {path: '', redirectTo: '/intro', pathMatch: 'full'},
  {path: 'intro', component: IntroComponent},
  {path: 'home', component: HomeComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'sunburst', component: SunburstComponent},
  {path: 'career', component: CareerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
