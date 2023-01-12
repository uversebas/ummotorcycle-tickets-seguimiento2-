import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreacionTicketComponent } from './creacion-ticket/creacion-ticket.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutosizeModule } from 'ngx-autosize';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerModule, DatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { NgxPaginationModule } from 'ngx-pagination';
import { VerTicketComponent } from './ver-ticket/ver-ticket.component';
import { HomeComponent } from './home/home.component';
import { SolicitudesSoporteComponent } from './solicitudes-soporte/solicitudes-soporte.component';
import { AssingResponsableComponent } from './assing-responsable/assing-responsable.component';
import { AgregarComentarioComponent } from './agregar-comentario/agregar-comentario.component';
import { BitacoraComentariosComponent } from './bitacora-comentarios/bitacora-comentarios.component';
import { CargarDocumentosComponent } from './cargar-documentos/cargar-documentos.component';
import { SolicitudesMarketingComponent } from './solicitudes-marketing/solicitudes-marketing.component';
import { ComercialTicketsComponent } from './comercial-tickets/comercial-tickets.component';
import { SupportTicketsComponent } from './support-tickets/support-tickets.component';
import { QualityTicketsComponent } from './quality-tickets/quality-tickets.component';
import { AdministradorTicketsComponent } from './administrador-tickets/administrador-tickets.component';

defineLocale('es', esLocale);

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'create-request', component: CreacionTicketComponent },
  { path: 'all-requests', component: AdministradorTicketsComponent },
  { path: 'view-request/:id', component: VerTicketComponent },
  { path: 'assing-responsable/:id', component: AssingResponsableComponent },
  { path: 'marketing-tickets', component: SolicitudesMarketingComponent },
  { path: 'comercial-tickets', component: ComercialTicketsComponent },
  { path: 'support-tickets', component: SupportTicketsComponent },
  { path: 'quality-tickets', component: QualityTicketsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    AutosizeModule,
    NgxSpinnerModule,
    DataTablesModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    ProgressbarModule.forRoot(),
    AccordionModule.forRoot(),
    NgxPaginationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    CreacionTicketComponent,
    AdministradorTicketsComponent,
    VerTicketComponent,
    AssingResponsableComponent,
    HomeComponent,
    SolicitudesSoporteComponent,
    AgregarComentarioComponent,
    BitacoraComentariosComponent,
    CargarDocumentosComponent,
    SolicitudesMarketingComponent,
    ComercialTicketsComponent,
    SupportTicketsComponent,
    QualityTicketsComponent
  ],
  exports: [RouterModule],
  entryComponents: [
    AgregarComentarioComponent,
    BitacoraComentariosComponent
  ],
})
export class TicketsCalidadModule {}
