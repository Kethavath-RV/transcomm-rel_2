import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { TokenInterceptor } from 'src/app/auth/interceptors/token.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { StartUpService } from './services/start-up.service';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function initializeAppFactory(
  startupService: StartUpService,
): () => Observable<any> {
  return () => startupService.getUserProfile();
}

@NgModule({
  imports: [BrowserModule, HttpClientModule, LayoutModule, AppRoutingModule],
  declarations: [AppComponent],
  providers: [
    StartUpService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [StartUpService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
