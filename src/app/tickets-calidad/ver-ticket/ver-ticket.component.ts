import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { ActividadPorRol, Comentario, Documento, DocumentoCargado, PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { ComentarioService, CorreoService, DocumentosService, ModalService, TicketService, UsuarioService } from 'src/app/shared/servicios';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { ProcessStatus, TicketStatus } from 'src/app/shared/enumerados';
import { ActividadesPorRolService } from 'src/app/shared/servicios/actividadesPorRol.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BitacoraComentariosComponent } from '../bitacora-comentarios/bitacora-comentarios.component';
import { Utilidades } from 'src/app/shared/utilidades/utilidades';

@Component({
  selector: 'app-ver-ticket',
  templateUrl: './ver-ticket.component.html'
})
export class VerTicketComponent implements OnInit {

  bsModalRef: BsModalRef;

  public imagenes: string[] = [];
  public ticket: Ticket;
  public avance: number = 0;
  public usuarioActual: Usuario;
  public emailsTemplate: PlantillaEmail[] = [];
  public propiedadesCorreo: IEmailProperties;
  public actividades: ActividadPorRol[] = [];
  public misActividades: ActividadPorRol[] = [];

  public comentariosAprobacion: Comentario[] = [];

  public documentosCargadosIniciales: DocumentoCargado[] = [];
  public documentosAEliminarCargadosIniciales: DocumentoCargado[] = [];
  public documentosIniciales: Documento[] = [];
  public documentosAEliminarIniciales: DocumentoCargado[] = [];

  public actividad: ActividadPorRol = new ActividadPorRol('Documments', Constantes.grupoComercial, Constantes.grupoAdministrador, Constantes.bibliotecaDocumentosTicket, 0);

  public mostrarAsignacionResponsables = false;
  public mostrarZonaDocumentos = false;
  public mostrarDocumentosIniciales = false;
  public mostrarEdicionDocumentosIniciales = false;
  public mostrarEliminarDocumentos = false;

  public iconoDesconocido = '/assets/images/unknow-file.png';
  listaIconos = [
    { tipo: 'pdf', icono: '/assets/images/icon-pdf.png' },
    { tipo: 'xlsx', icono: '/assets/images/icon-excel.png' },
    { tipo: 'xls', icono: '/assets/images/icon-excel.png' },
    { tipo: 'csv', icono: '/assets/images/icon-excel.png' },
    { tipo: 'docx', icono: '/assets/images/icon-word.png' },
    { tipo: 'doc', icono: '/assets/images/icon-word.png' },
  ]

  constructor(
    private servicioTicket: TicketService,
    private activeRoute: ActivatedRoute,
    private usuarioService: UsuarioService,
    private servicioCorreo: CorreoService,
    private spinner: NgxSpinnerService,
    private servicioDocumentos: DocumentosService,
    private servicioModal: BsModalService,
    private servicioNotificacion: ModalService,
    private router: Router,
    private actividadPorRolService: ActividadesPorRolService,
    private servicioComentarios: ComentarioService) { }

  ngOnInit() {
    this.spinner.show();
    this.usuarioService.ObtenerUsuario().then(() => {
      this.usuarioActual = JSON.parse(
        localStorage.getItem(Constantes.cookieUsuarioActual));
      this.obtenerTicket();
    });
  }

  public obtenerIconoDocumentoIniciales(documento: Documento): string {
    const extension = documento.nombre.split('.').pop();
    const icono = this.listaIconos.find(i => i.tipo === extension)?.icono;
    if (icono) {
      return icono;
    }
    return this.iconoDesconocido;
  }

  public obtenerIconoDocumentoPorNombreIniciales(nombre: string): string {
    if (nombre) {
      const extension = nombre.split('.').pop();
      const icono = this.listaIconos.find(i => i.tipo === extension)?.icono;
      if (icono) {
        return icono;
      }
      return this.iconoDesconocido;
    }
  }

  public subirAdjuntosClienteIniciales(e: any): void {
    this.documentosIniciales = [];
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        this.documentosIniciales.push(new Documento(file, file.name));
      });
    }
  }

  public obtenerEstadoTab(actividad: ActividadPorRol): string {
    switch (actividad.biblioteca) {
      case Constantes.bibliotecaDocumentosManualesUsuario:
        if (this.ticket.estadoManualUsuario === ProcessStatus.Pending || this.ticket.estadoManualUsuario === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoManualUsuario === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoManualUsuario === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosVinList:
        if (this.ticket.estadoVinList === ProcessStatus.Pending || this.ticket.estadoVinList === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoVinList === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoVinList === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosVinDescription:
        if (this.ticket.estadoVinDescription === ProcessStatus.Pending || this.ticket.estadoVinDescription === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoVinDescription === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoVinDescription === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosSparePartsLabeling:
        if (this.ticket.estadoSparePartsLabel === ProcessStatus.Pending || this.ticket.estadoSparePartsLabel === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoSparePartsLabel === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoSparePartsLabel === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosReporteCalidad:
        if (this.ticket.estadoReporteCalidad === ProcessStatus.Pending || this.ticket.estadoReporteCalidad === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoReporteCalidad === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoReporteCalidad === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosEmbarque:
        if (this.ticket.estadoDocumentoEmbarque === ProcessStatus.Pending || this.ticket.estadoDocumentoEmbarque === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoDocumentoEmbarque === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoDocumentoEmbarque === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosManualesPDI:
        if (this.ticket.estadoManualPDI === ProcessStatus.Pending || this.ticket.estadoManualPDI === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoManualPDI === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoManualPDI === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosManualesServicio:
        if (this.ticket.estadoManualesServicio === ProcessStatus.Pending || this.ticket.estadoManualesServicio === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoManualesServicio === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoManualesServicio === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosHomologacion:
        if (this.ticket.estadoHomologacion === ProcessStatus.Pending || this.ticket.estadoHomologacion === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoHomologacion === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoHomologacion === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosFichaTecnica:
        if (this.ticket.estadoManualTecnico === ProcessStatus.Pending || this.ticket.estadoManualTecnico === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoManualTecnico === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoManualTecnico === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosFotografias:
        if (this.ticket.estadoFotografias === ProcessStatus.Pending || this.ticket.estadoFotografias === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoFotografias === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoFotografias === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      case Constantes.bibliotecaDocumentosLibroPartes:
        if (this.ticket.estadoLibroPartes === ProcessStatus.Pending || this.ticket.estadoLibroPartes === ProcessStatus.Send) {
          return 'pending';
        }
        if (this.ticket.estadoLibroPartes === ProcessStatus.Reject) {
          return 'reject';
        }
        if (this.ticket.estadoLibroPartes === ProcessStatus.Approved) {
          return 'approve';
        }
        break;
      default:
        break;
    }
  }

  private obtenerTicket(): void {
    this.activeRoute.params.subscribe(parametros => {
      let id = 0;
      if (parametros && parametros.id) {
        id = parametros.id;
      }
      if (id > 0) {
        this.servicioTicket.ObtenerPorId(id).subscribe(respuesta => {
          if (respuesta.length > 0) {
            this.ticket = Ticket.fromJson(respuesta[0]);
            this.cargarComentariosAprobacion();
            this.obtenerDocumentosCargados();
            this.avance = Utilidades.calcularAvanceTicket(this.ticket);
          } else {

          }
        });
      } else {

      }
    });
  }

  private async cargarComentariosAprobacion(): Promise<void> {
    this.comentariosAprobacion = await this.servicioComentarios.obtenerComentariosAprobacion(
      this.ticket.id,
      Constantes.listaTicket
    );
  }

  private obtenerDocumentosCargados(): void {
    this.servicioDocumentos.obtenerDocumentos(this.ticket, this.actividad.biblioteca).then((respuesta) => {
      this.documentosCargadosIniciales = DocumentoCargado.fromJsonList(respuesta);
      this.obtenerPlantillasEmail();
    });
  }

  private obtenerPlantillasEmail(): void {
    this.servicioCorreo.obtenerEmails().subscribe((respuesta) => {
      this.emailsTemplate = PlantillaEmail.fromJsonList(respuesta);
      this.obtenerActividades();
    });
  }

  private obtenerActividades(): void {
    this.actividadPorRolService.obtenerTodos().subscribe((respuesta) => {
      this.actividades = ActividadPorRol.fromJsonList(respuesta);
      this.obtenerMisActividades();
      this.validarMostrar();
      this.spinner.hide();
    });
  }

  private obtenerMisActividades(): void {
    if (this.usuarioActual.esMarketing && this.ticket.usuarioMarketing.id === this.usuarioActual.id) {
      this.misActividades = this.misActividades.concat(this.actividades.filter(a => a.rol === Constantes.grupoMarketing || a.aprobador === Constantes.grupoMarketing));
    }
    if (this.usuarioActual.esSoporteLogistica && this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id) {
      this.misActividades = this.misActividades.concat(this.actividades.filter(a => a.rol === Constantes.grupoSoporteLogistica || a.aprobador === Constantes.grupoSoporteLogistica));
    }
    if (this.usuarioActual.esCalidad && this.ticket.usuarioCalidad.id === this.usuarioActual.id) {
      this.misActividades = this.misActividades.concat(this.actividades.filter(a => a.rol === Constantes.grupoCalidad || a.aprobador === Constantes.grupoCalidad));
    }
    if (this.usuarioActual.esAdministrador) {
      this.misActividades = this.misActividades.concat(this.actividades.filter(a => a.rol === Constantes.grupoAdministrador || a.aprobador === Constantes.grupoAdministrador))
    }

    this.misActividades = this.misActividades.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.id === thing.id
      ))
    );

    this.misActividades = this.misActividades.sort((a, b) => a.id - b.id);

    this.actividades = this.actividades.filter(
      function (e) {
        return this.indexOf(e) < 0;
      },
      this.misActividades
    );

  }

  private validarMostrar(): void {
    this.mostrarAsignacionResponsables = this.ticket.estado === TicketStatus.CREATED && this.usuarioActual.esAdministrador;
    this.mostrarZonaDocumentos = this.ticket.estado === TicketStatus.ASSIGNED;
    this.mostrarDocumentosIniciales = true;
    this.mostrarEdicionDocumentosIniciales = this.ticket.estado === TicketStatus.REJECTCREATED;
  }

  public mostrarBitacora(): void {
    const opcionesModal: ModalOptions = {
      initialState: {
        ticket: this.ticket,
      },
      class: 'modal-lg',
    };
    this.bsModalRef = this.servicioModal.show(BitacoraComentariosComponent, opcionesModal);
  }

  borrarDocumento(documento: DocumentoCargado): void {
    this.documentosAEliminarCargadosIniciales.push(documento);
    this.documentosCargadosIniciales = this.documentosCargadosIniciales.filter(d => d.id !== documento.id);
  }

  reenviarTicket() {
    this.spinner.show();
    if (this.documentosAEliminarCargadosIniciales.length > 0) {
      this.eliminarDocumentos();
      this.reenviarOrden();
    }
    this.reenviarOrden();
  }

  eliminarDocumentos() {
    if (this.documentosAEliminarCargadosIniciales.length > 0) {
      this.servicioDocumentos.eliminarArchivos(this.ticket, this.actividad.biblioteca, this.documentosAEliminarCargadosIniciales).then(() => { });
    }

  }

  reenviarOrden() {
    if (this.documentosIniciales.length > 0) {
      this.servicioDocumentos.agregarArchivos(this.ticket, this.actividad.biblioteca, this.documentosIniciales).then(() => {
        this.ticket.estado = TicketStatus.CREATED;
        this.servicioTicket.reEnviarTicket(this.ticket).then(() => {
          this.mostrarMensajeExitoso(this.ticket.orden);
        });
      });
    } else {
      this.ticket.estado = TicketStatus.CREATED;
      this.servicioTicket.reEnviarTicket(this.ticket).then(() => {
        this.mostrarMensajeExitoso(this.ticket.orden);
      });
    }
  }

  private mostrarMensajeExitoso(orden: string): void {
    this.spinner.hide();
    this.servicioNotificacion.Exito(
      'Great!',
      'The order ' + orden + ' has been processes successfully.',
      () => this.router.navigate(['/'])
    );
  }

}
