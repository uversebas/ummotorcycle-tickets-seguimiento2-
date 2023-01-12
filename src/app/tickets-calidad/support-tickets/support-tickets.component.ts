import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { AppSettings, Constantes, handleError } from 'src/app/shared/constantes';
import { Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketService, UsuarioService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.scss']
})
export class SupportTicketsComponent implements OnInit {
  public usuarioActual: Usuario;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  solicitudes: Ticket[] = [];
  constructor(private spinner: NgxSpinnerService,
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService) { }

    async ngOnInit(): Promise<void> {
      const ingreso = await this.validarIngreso();
      if (ingreso) {
        this.spinner.show();
        this.configurarDataTable();
        this.consultarSolicitudes();
      }
    }

    private consultarSolicitudes(): void {
      this.servicioTicket.obtenerTicketsSoporte().subscribe(
        (respuesta) => {
          this.solicitudes = Ticket.fromJsonList(respuesta);
          this.dtTrigger.next();
          this.spinner.hide();
        },
        (error) => this.mostrarErroryTerminar(error)
      );
    }
  
    private mostrarErroryTerminar(error: any): void {
      this.spinner.hide();
      handleError(error);
    }
  
    private async validarIngreso(): Promise<boolean> {
      this.usuarioActual =
        localStorage.getItem(Constantes.cookieUsuarioActual) != null
          ? JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual))
          : await this.servicioUsuario.ObtenerUsuario();
      return this.usuarioActual.esComercial;
    }
  
    ngOnDestroy(): void {
      this.dtTrigger.unsubscribe();
    }
  
    private configurarDataTable(): void {
      this.dtOptions = AppSettings.obtenerConfiguracionTablaGeneral();
    }

}
