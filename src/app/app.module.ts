import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {AppState} from './app-state.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HttpHeaders, HttpParams } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF, LocationStrategy, HashLocationStrategy} from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {CookieModule} from 'ngx-cookie';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {LoginComponent} from './login/login.component';
import {LoginService} from './services/login.service'; 

import {NgxPaginationModule} from 'ngx-pagination';
import { NgbModalConfig, NgbModal, NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ConfirmComponent } from './shared/modal/confirm/confirm.component';
import { environment } from 'environments/environment';
import { ApproveComponent } from './views/manage/coachabsent/approve/approve.component';


import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, `${environment.apiOriginalUrl}i18n/`, '.json');
}
@NgModule({
  imports: [
    NgxMaterialTimepickerModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    BrowserModule,
    NgbModalModule,
    HttpClientModule,
    CookieModule.forRoot(),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
	useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })

  ],
  entryComponents: [ConfirmComponent, ApproveComponent],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
    ApproveComponent,
    ConfirmComponent
  ],
  providers: [  	
	NgbModalConfig,
	NgbModal,
        NgbActiveModal,
	AppState,
	LoginService,
	{ provide: APP_BASE_HREF, useValue: '/' },
       { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent],
  schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
