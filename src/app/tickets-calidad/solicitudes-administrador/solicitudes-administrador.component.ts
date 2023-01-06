import { FiltroConsulta } from './../../shared/entidades/filtroConsulta';
import { Falla } from './../../shared/entidades/falla';
import { Motor } from './../../shared/entidades/motor';
import { Modelo } from './../../shared/entidades/modelo';
import { FallosService } from './../../shared/servicios/fallos.service';
import { MotorService } from './../../shared/servicios/motor.service';
import { ModelosService } from './../../shared/servicios/modelos.service';
import { RegionSettingService } from './../../shared/servicios/region-setting.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import {
  AppSettings,
  Constantes,
  handleError,
} from 'src/app/shared/constantes';
import { RegionSetting, Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketService, UsuarioService } from 'src/app/shared/servicios';
import { TicketStatus } from 'src/app/shared/enumerados';

@Component({
  selector: 'app-solicitudes-administrador',
  templateUrl: './solicitudes-administrador.component.html'
})
export class SolicitudesAdministradorComponent implements OnDestroy, OnInit {
  public usuarioActual: Usuario;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  regionesCliente: RegionSetting[] = [];
  regionSeleccionada: RegionSetting;
  modelos: Modelo[] = [];
  modeloSeleccionado: Modelo;
  motores: Motor[] = [];
  motoresFiltro: Motor[] = [];
  motorSeleccionado: Motor;
  tiposFalla: Falla[] = [];
  tipoFallaSeleccionada: Falla;
  solicitudes: Ticket[] = [];

  estadoResuelto = TicketStatus.RESOLVED;

  constructor(
    private spinner: NgxSpinnerService,
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    private servicioRegiones: RegionSettingService,
    private servicioModelos: ModelosService,
    private servicioMotor: MotorService,
    private servicioFalla: FallosService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const ingreso = await this.validarIngreso();
    if (ingreso) {
      this.spinner.show();
      this.configurarDataTable();
      this.inicializarPlaceholders();
      this.obtenerRegiones();
    } else {
      this.cancelar();
    }
  }

  private inicializarPlaceholders() {
    this.regionSeleccionada = null;
    this.modeloSeleccionado = null;
    this.motorSeleccionado = null;
    this.tipoFallaSeleccionada = null;
  }

  async obtenerRegiones() {
    this.regionesCliente = await this.servicioRegiones.obtenerTodos();
    this.obtenerModelos();
  }

  private obtenerModelos(): void {
    this.servicioModelos.obtenerTodos().subscribe(
      (respuesta) => {
        this.modelos = Modelo.fromJsonList(respuesta);
        this.obtenerMotores();
      },
      (error) => this.mostrarErroryTerminar(error)
    );
  }

  private obtenerMotores(): void {
    this.servicioMotor.ObtenerTodos().subscribe(
      (respuesta) => {
        this.motores = Motor.fromJsonList(respuesta);
        this.motoresFiltro = [
          ...new Map(this.motores.map((m) => [m.nombre, m])).values(),
        ];
        this.obtenerTiposFalla();
      },
      (error) => this.mostrarErroryTerminar(error)
    );
  }

  private obtenerTiposFalla(): void {
    this.servicioFalla.obtenerTodos().subscribe(
      (respuesta) => {
        this.tiposFalla = Falla.fromJsonList(respuesta);
        this.consultarSolicitudes();
      },
      (error) => this.mostrarErroryTerminar(error)
    );
  }

  private async validarIngreso(): Promise<boolean> {
    this.usuarioActual =
      localStorage.getItem(Constantes.cookieUsuarioActual) != null
        ? JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual))
        : await this.servicioUsuario.ObtenerUsuario();
    const esAdministrador = this.usuarioActual.esAdministrador;
    return esAdministrador;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private configurarDataTable(): void {
    this.dtOptions = AppSettings.obtenerConfiguracionTablaGeneral();
  }

  private consultarSolicitudes(): void {
    this.servicioTicket.ObtenerTodos().subscribe(
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

  filtrar(): void {
    this.spinner.show();
    const filtro = new FiltroConsulta();
    if (this.regionSeleccionada) {
      filtro.regionId = this.regionSeleccionada.id;
    }
    if (this.modeloSeleccionado) {
      filtro.modeloId = this.modeloSeleccionado.id;
    }
    if (this.motorSeleccionado) {
      filtro.motorCC = this.motorSeleccionado.nombre;
    }
    if (this.tipoFallaSeleccionada) {
      filtro.tipoFallaId = this.tipoFallaSeleccionada.id;
    }
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.servicioTicket.Filtrar(filtro).subscribe((respuesta) => {
        this.solicitudes = Ticket.fromJsonList(respuesta);
        this.dtTrigger.next();
        this.spinner.hide();
      });
    });
  }

  limpiarFiltros(): void {
    this.spinner.show();
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.inicializarPlaceholders();
      this.obtenerRegiones();
    });
  }

  cancelar(): void {
    this.router.navigate([Constantes.routerInicio]);
  }
}
