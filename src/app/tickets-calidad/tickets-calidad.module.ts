import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreacionTicketComponent } from './creacion-ticket/creacion-ticket.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParteComponent } from './creacion-ticket/parte/parte.component';
import { VinComponent } from './creacion-ticket/vin/vin.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutosizeModule } from 'ngx-autosize';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import {NgxPaginationModule} from 'ngx-pagination';
import { SolicitudesAdministradorComponent } from './solicitudes-administrador/solicitudes-administrador.component';
import { VerTicketComponent } from './ver-ticket/ver-ticket.component';
import { HomeComponent } from './home/home.component';
import { SolicitudesClienteComponent } from './solicitudes-cliente/solicitudes-cliente.component';
import { GestionarTicketComponent } from './gestionar-ticket/gestionar-ticket.component';
import { AsignarPosventaComponent } from './gestionar-ticket/asignar-posventa/asignar-posventa.component';
import { ConfirmacionSoporteComponent } from './gestionar-ticket/confirmacion-soporte/confirmacion-soporte.component';
import { FeedbackProveedoresComponent } from './gestionar-ticket/feedback-proveedores/feedback-proveedores.component';
import { RevisionAprobacionComponent } from './gestionar-ticket/revision-aprobacion/revision-aprobacion.component';
import { SolucionComponent } from './gestionar-ticket/solucion/solucion.component';
import { SolicitudesPostventaComponent } from './solicitudes-postventa/solicitudes-postventa.component';
import { SolicitudesSoporteComponent } from './solicitudes-soporte/solicitudes-soporte.component';
import { BitacoraComponent } from './bitacora/bitacora.component';
import { DocumentoProveedorComponent } from './gestionar-ticket/feedback-proveedores/documento-proveedor/documento-proveedor.component';
import { ResumenSolicitudesComponent } from './resumen-solicitudes/resumen-solicitudes.component';
import { ModalTicketsPorEstadoComponent } from './resumen-solicitudes/modal-tickets-por-estado/modal-tickets-por-estado.component';
import { AgregarComentarioComponent } from './gestionar-ticket/agregar-comentario/agregar-comentario.component';
import { VerSolucionClienteComponent } from './ver-ticket/ver-solucion-cliente/ver-solucion-cliente.component';
import { VinRepetidosComponent } from './vin-repetidos/vin-repetidos.component';
import { DetalleVinRepetidosComponent } from './vin-repetidos/detalle-vin-repetidos/detalle-vin-repetidos.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'create-request', component: CreacionTicketComponent },
  { path: 'my-requests', component: SolicitudesClienteComponent },
  { path: 'all-requests', component: SolicitudesAdministradorComponent },
  { path: 'view-request/:id', component: VerTicketComponent },
  { path: 'manage-ticket/:id', component: GestionarTicketComponent },
  { path: 'after-sales-requests', component: SolicitudesPostventaComponent },
  { path: 'support-requests', component: SolicitudesSoporteComponent },
  { path: 'summary-of-requests', component: ResumenSolicitudesComponent },
  { path: 'repeted-vins', component: VinRepetidosComponent}
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
    ProgressbarModule.forRoot(),
    NgxPaginationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    CreacionTicketComponent,
    ParteComponent,
    VinComponent,
    SolicitudesAdministradorComponent,
    VerTicketComponent,
    HomeComponent,
    SolicitudesClienteComponent,
    GestionarTicketComponent,
    AsignarPosventaComponent,
    ConfirmacionSoporteComponent,
    FeedbackProveedoresComponent,
    RevisionAprobacionComponent,
    SolucionComponent,
    SolicitudesPostventaComponent,
    SolicitudesSoporteComponent,
    BitacoraComponent,
    DocumentoProveedorComponent,
    ResumenSolicitudesComponent,
    ModalTicketsPorEstadoComponent,
    AgregarComentarioComponent,
    VerSolucionClienteComponent,
    VinRepetidosComponent,
    DetalleVinRepetidosComponent
  ],
  exports: [RouterModule],
  entryComponents: [
    AsignarPosventaComponent,
    ConfirmacionSoporteComponent,
    BitacoraComponent,
    ModalTicketsPorEstadoComponent,
    AgregarComentarioComponent,
    DetalleVinRepetidosComponent
  ],
})
export class TicketsCalidadModule {}
