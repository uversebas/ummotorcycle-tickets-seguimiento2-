import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { ActividadPorRol, Comentario, Documento, DocumentoCargado, PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { EmailType, ProcessStatus, TicketStatus } from 'src/app/shared/enumerados';
import { CorreoService, DocumentosService, ModalService, TicketService, UsuarioService } from 'src/app/shared/servicios';
import { AgregarComentarioComponent } from '../agregar-comentario/agregar-comentario.component';
import { String } from 'typescript-string-operations';
import { IEmailProperties } from '@pnp/sp/sputilities';

@Component({
  selector: 'app-cargar-documentos',
  templateUrl: './cargar-documentos.component.html',
  styleUrls: ['./cargar-documentos.component.css']
})
export class CargarDocumentosComponent implements OnInit {
  bsModalRef: BsModalRef;

  submitted = false;
  comentario: string = '';


  @Input() id;

  @Input() ticket: Ticket;
  @Input() actividad: ActividadPorRol;
  @Input() usuarioActual: Usuario;
  @Input() emailsTemplate: PlantillaEmail[];
  @Input() comentariosAprobacion: Comentario[];

  @Output() formReady = new EventEmitter();

  public documentosCargados: DocumentoCargado[] = [];
  public documentos: Documento[] = [];
  public documentosAEliminar: DocumentoCargado[] = [];
  public comentariosActividad: Comentario[] = [];
  public propiedadesCorreo: IEmailProperties;

  public mostrarEditarDocumentos = false;
  public mostrarBotonAprobar = false;
  public mostrarComentario = false;

  public iconoDesconocido = 'assets/images/unknow-file.png';
  listaIconos = [
    { tipo: 'pdf', icono: 'assets/images/icon-pdf.png' },
    { tipo: 'xlsx', icono: 'assets/images/icon-excel.png' },
    { tipo: 'xls', icono: 'assets/images/icon-excel.png' },
    { tipo: 'csv', icono: 'assets/images/icon-excel.png' },
    { tipo: 'docx', icono: 'assets/images/icon-word.png' },
    { tipo: 'doc', icono: 'assets/images/icon-word.png' },
  ]

  constructor(private spinner: NgxSpinnerService,
    private servicioTicket: TicketService,
    private servicioDocumentos: DocumentosService,
    private servicioNotificacion: ModalService,
    private servicioModal: BsModalService,
    private servicioCorreo: CorreoService,
    private router: Router) {
  }

  ngOnInit() {
    this.spinner.show();
    this.obtenerDocumentosCargados();
  }


  public subirAdjuntosCliente(e: any): void {
    this.documentos = [];
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        this.documentos.push(new Documento(file, file.name));
      });
    }
  }

  borrarDocumento(documento: DocumentoCargado): void {
    this.documentosAEliminar.push(documento);
    this.documentosCargados = this.documentosCargados.filter(d => d.id !== documento.id);
  }

  public obtenerIconoDocumento(documento: Documento): string {
    const extension = documento.nombre.split('.').pop();
    const icono = this.listaIconos.find(i => i.tipo === extension)?.icono;
    if (icono) {
      return icono;
    }
    return this.iconoDesconocido;
  }

  public obtenerIconoDocumentoPorNombre(nombre: string): string {
    if (nombre) {
      const extension = nombre.split('.').pop();
      const icono = this.listaIconos.find(i => i.tipo === extension)?.icono;
      if (icono) {
        return icono;
      }
      return this.iconoDesconocido;
    }
  }

  public reject(): void {
    this.enviarComentario();
  }

  public enviar(): void {
    if (this.mostrarComentario) {
      this.submitted = true;
      if (this.comentario.length === 0) {
        return;
      }
      this.ticket.comentarioAprobacionAutomarica = `${this.actividad.actividad}: ${this.comentario}`;
    }
    if (this.documentos.length > 0 || !this.mostrarBotonAprobar) {
      this.spinner.show();
      if (this.documentosAEliminar.length > 0) {
        this.eliminarDocumentos();
      }
      this.procesarOrden();
    }
  }

  public aprobar(): void {
    this.spinner.show();
    this.procesarTicket(true);
  }

  private eliminarDocumentos(): void {
    if (this.documentosAEliminar.length > 0) {
      this.servicioDocumentos.eliminarArchivos(this.ticket, this.actividad.biblioteca, this.documentosAEliminar).then(() => { });
    }
  }

  private procesarOrden(): void {
    if (this.documentos.length > 0) {
      this.servicioDocumentos.agregarArchivos(this.ticket, this.actividad.biblioteca, this.documentos).then(() => {
        this.procesarTicket(false);
      });
    } else {
      this.procesarTicket(false);
    }
  }

  procesarTicket(gestion: boolean): void {
    switch (this.actividad.biblioteca) {
      case Constantes.bibliotecaDocumentosManualesUsuario:
        this.enviarManualUsuarioServicio(gestion);
        break;
      case Constantes.bibliotecaDocumentosVinList:
        this.enviarVinList(gestion);
        break;
      case Constantes.bibliotecaDocumentosVinDescription:
        this.enviarVinDescription(gestion);
        break;
      case Constantes.bibliotecaDocumentosSparePartsLabeling:
        this.enviarSparePartsLabeling(gestion);
        break;
      case Constantes.bibliotecaDocumentosReporteCalidad:
        this.enviarReporteCalidad(gestion);
        break;
      case Constantes.bibliotecaDocumentosEmbarque:
        this.enviarEmbarque(gestion);
        break;
      case Constantes.bibliotecaDocumentosManualesPDI:
        this.enviarPDI(gestion);
        break;
      case Constantes.bibliotecaDocumentosManualesServicio:
        this.enviarManualServicio(gestion);
        break;
      case Constantes.bibliotecaDocumentosHomologacion:
        this.enviarHomologacion(gestion);
        break;
      case Constantes.bibliotecaDocumentosFichaTecnica:
        this.enviarFichaTecnica(gestion);
        break;
      case Constantes.bibliotecaDocumentosFotografias:
        this.enviarFotografias(gestion);
        break;
      case Constantes.bibliotecaDocumentosLibroPartes:
        this.enviarLibroPartes(gestion);
        break;
      default:
        this.enviarTicket();
        break;
    }
  }

  enviarVinList(gestion: boolean) {
    gestion === false ? this.ticket.estadoVinList = ProcessStatus.Send : this.ticket.estadoVinList = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarVinList(this.ticket).then(() => {
      this.ticket.estadoVinList === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarVinDescription(gestion: boolean) {
    gestion === false ? this.ticket.estadoVinDescription = ProcessStatus.Send : this.ticket.estadoVinDescription = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarVinDescription(this.ticket).then(() => {
      this.ticket.estadoVinDescription === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarSparePartsLabeling(gestion: boolean) {
    this.ticket.estadoSparePartsLabel = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarSparePartsLabel(this.ticket).then(() => {
      this.ticket.estadoSparePartsLabel === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarReporteCalidad(gestion: boolean) {
    gestion === false ? this.ticket.estadoReporteCalidad = ProcessStatus.Send : this.ticket.estadoReporteCalidad = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarReporteCalidad(this.ticket).then(() => {
      this.ticket.estadoReporteCalidad === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarEmbarque(gestion: boolean) {
    gestion === false ? this.ticket.estadoDocumentoEmbarque = ProcessStatus.Send : this.ticket.estadoDocumentoEmbarque = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarDocumentoEmbarque(this.ticket).then(() => {
      this.ticket.estadoDocumentoEmbarque === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarPDI(gestion: boolean) {
    gestion === false ? this.ticket.estadoManualPDI = ProcessStatus.Send : this.ticket.estadoManualPDI = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarManualPDI(this.ticket).then(() => {
      this.ticket.estadoManualPDI === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarManualUsuarioServicio(gestion: boolean) {
    this.ticket.estadoManualUsuario = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarManualUsuario(this.ticket).then(() => {
      this.ticket.estadoManualUsuario === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }

  enviarManualServicio(gestion: boolean) {
    gestion === false ? this.ticket.estadoManualesServicio = ProcessStatus.Send : this.ticket.estadoManualesServicio = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarManualesServicio(this.ticket).then(() => {
      this.ticket.estadoManualesServicio === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarHomologacion(gestion: boolean) {
    this.ticket.estadoHomologacion = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarHomologacion(this.ticket).then(() => {
      this.ticket.estadoHomologacion === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarFichaTecnica(gestion: boolean) {
    gestion === false ? this.ticket.estadoManualTecnico = ProcessStatus.Send : this.ticket.estadoManualTecnico = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarManualTecnico(this.ticket).then(() => {
      this.ticket.estadoManualTecnico === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarFotografias(gestion: boolean) {
    gestion === false ? this.ticket.estadoFotografias = ProcessStatus.Send : this.ticket.estadoFotografias = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarFotografias(this.ticket).then(() => {
      this.ticket.estadoFotografias === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarLibroPartes(gestion: boolean) {
    this.ticket.estadoLibroPartes = ProcessStatus.Approved;
    this.validarEstadoTicket();
    this.servicioTicket.enviarLibroPartes(this.ticket).then(() => {
      this.ticket.estadoLibroPartes === ProcessStatus.Approved ? this.enviarCorreoAprobarActividad() : this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  enviarTicket() {
    throw new Error('Method not implemented.');
  }

  validarEstadoTicket(): void {
    if (this.ticket.estadoManualUsuario === ProcessStatus.Approved &&
      this.ticket.estadoVinList === ProcessStatus.Approved &&
      this.ticket.estadoVinDescription === ProcessStatus.Approved &&
      this.ticket.estadoSparePartsLabel === ProcessStatus.Approved &&
      this.ticket.estadoReporteCalidad === ProcessStatus.Approved &&
      this.ticket.estadoDocumentoEmbarque === ProcessStatus.Approved &&
      this.ticket.estadoManualPDI === ProcessStatus.Approved &&
      this.ticket.estadoManualesServicio === ProcessStatus.Approved &&
      this.ticket.estadoHomologacion === ProcessStatus.Approved &&
      this.ticket.estadoManualTecnico === ProcessStatus.Approved &&
      this.ticket.estadoFotografias === ProcessStatus.Approved &&
      this.ticket.estadoLibroPartes === ProcessStatus.Approved) {
      this.ticket.estado = TicketStatus.COMPLETED;
    }
  }

  private obtenerPropiedadesCorreoProcesarActividad(orden: string): void {
    const plantilla = this.emailsTemplate.find(p => p.nombre === EmailType.APPROVEACTIVITY);
    const destinatario = this.obtenerDestinatario();
    const para = [destinatario.email];
    const asunto = String.Format(plantilla.asunto, this.actividad.actividad, orden);
    const cuerpo = String.Format(plantilla.body, destinatario.nombre, this.usuarioActual.nombre, this.actividad.actividad, orden, Constantes.linkSitio);
    this.propiedadesCorreo = this.servicioCorreo.asignarPropiedasEmail(para, asunto, cuerpo);
  }

  private enviarCorreoAprobarActividad(): void {
    this.obtenerPropiedadesCorreoProcesarActividad(this.ticket.orden);
    this.servicioCorreo
      .Enviar(this.propiedadesCorreo)
      .then(() => {
        this.mostrarMensajeExitoso(this.ticket.orden);
      })
      .catch((e) => {
        this.mostrarAlertaError('Send email', e);
      });
  }

  private mostrarMensajeExitoso(orden: string): void {
    this.spinner.hide();
    this.servicioNotificacion.Exito(
      'Great!',
      'The order ' + orden + ' has been processes successfully.',
      () => window.location.reload()
    );
  }

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.servicioNotificacion.Error(
      String.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate(['/'])
    );
  }

  private obtenerDocumentosCargados(): void {
    this.servicioDocumentos.obtenerDocumentos(this.ticket, this.actividad.biblioteca).then((respuesta) => {
      this.documentosCargados = DocumentoCargado.fromJsonList(respuesta);
      this.obtenerComentariosPorActividad();
      this.visibilidad();
      this.spinner.hide();
    });
  }

  private obtenerComentariosPorActividad(): void {
    this.comentariosActividad = this.comentariosAprobacion.filter(c => c.valor.includes(this.actividad.actividad));
  }

  private enviarComentario(): void {
    let ngbModalOptions: ModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    this.bsModalRef = this.servicioModal.show(AgregarComentarioComponent, ngbModalOptions);
    this.bsModalRef.content.ticket = this.ticket;
    this.bsModalRef.content.usuarioDestinatario = this.obtenerDestinatario();
    this.bsModalRef.content.emailsTemplate = this.emailsTemplate;
    this.bsModalRef.content.biblioteca = this.actividad.biblioteca;
    this.bsModalRef.content.usuarioActual = this.usuarioActual;
    this.bsModalRef.content.actividad = this.actividad;
  }

  private obtenerDestinatario(): Usuario {
    switch (this.actividad.biblioteca) {
      case Constantes.bibliotecaDocumentosManualesUsuario:
        return this.ticket.usuarioMarketing;
      case Constantes.bibliotecaDocumentosVinList:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosVinDescription:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosSparePartsLabeling:
        return this.ticket.usuarioAdministrador;
      case Constantes.bibliotecaDocumentosReporteCalidad:
        return this.ticket.usuarioCalidad;
      case Constantes.bibliotecaDocumentosEmbarque:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosManualesPDI:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosManualesServicio:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosHomologacion:
        return this.ticket.usuarioAdministrador;
      case Constantes.bibliotecaDocumentosFichaTecnica:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosFotografias:
        return this.ticket.usuarioSoporteLogistica;
      case Constantes.bibliotecaDocumentosLibroPartes:
        return this.ticket.usuarioAdministrador;
      default:
        return this.ticket.usuarioAdministrador;
    }
  }

  private visibilidad(): void {
    switch (this.actividad.biblioteca) {
      case Constantes.bibliotecaDocumentosManualesUsuario:
        this.mostrarEditarDocumentos = (this.ticket.estadoManualUsuario === ProcessStatus.Pending || this.ticket.estadoManualUsuario === ProcessStatus.Reject) &&
          (this.ticket.usuarioMarketing.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoManualUsuario === ProcessStatus.Send && this.ticket.usuarioMarketing.id === this.usuarioActual.id;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoManualUsuario === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosVinList:
        this.mostrarEditarDocumentos = (this.ticket.estadoVinList === ProcessStatus.Pending || this.ticket.estadoVinList === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoVinList === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoVinList === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosVinDescription:
        this.mostrarEditarDocumentos = (this.ticket.estadoVinDescription === ProcessStatus.Pending || this.ticket.estadoVinDescription === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoVinDescription === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoVinDescription === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosSparePartsLabeling:
        this.mostrarEditarDocumentos = (this.ticket.estadoSparePartsLabel === ProcessStatus.Pending || this.ticket.estadoSparePartsLabel === ProcessStatus.Reject) &&
          (this.usuarioActual.esAdministrador);
        this.mostrarBotonAprobar = this.ticket.estadoSparePartsLabel === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoSparePartsLabel === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosReporteCalidad:
        this.mostrarEditarDocumentos = (this.ticket.estadoReporteCalidad === ProcessStatus.Pending || this.ticket.estadoReporteCalidad === ProcessStatus.Reject) &&
          (this.ticket.usuarioCalidad.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoReporteCalidad === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoReporteCalidad === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosEmbarque:
        this.mostrarEditarDocumentos = (this.ticket.estadoDocumentoEmbarque === ProcessStatus.Pending || this.ticket.estadoDocumentoEmbarque === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoDocumentoEmbarque === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoDocumentoEmbarque === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosManualesPDI:
        this.mostrarEditarDocumentos = (this.ticket.estadoManualPDI === ProcessStatus.Pending || this.ticket.estadoManualPDI === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoManualPDI === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoManualPDI === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosManualesServicio:
        this.mostrarEditarDocumentos = (this.ticket.estadoManualesServicio === ProcessStatus.Pending || this.ticket.estadoManualesServicio === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoManualesServicio === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoManualesServicio === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosHomologacion:
        this.mostrarEditarDocumentos = (this.ticket.estadoHomologacion === ProcessStatus.Pending || this.ticket.estadoHomologacion === ProcessStatus.Reject) &&
          (this.usuarioActual.esAdministrador);
        this.mostrarBotonAprobar = this.ticket.estadoHomologacion === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoHomologacion === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosFichaTecnica:
        this.mostrarEditarDocumentos = (this.ticket.estadoManualTecnico === ProcessStatus.Pending || this.ticket.estadoManualTecnico === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoManualTecnico === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoManualTecnico === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosFotografias:
        this.mostrarEditarDocumentos = (this.ticket.estadoFotografias === ProcessStatus.Pending || this.ticket.estadoFotografias === ProcessStatus.Reject) &&
          (this.ticket.usuarioSoporteLogistica.id === this.usuarioActual.id);
        this.mostrarBotonAprobar = this.ticket.estadoFotografias === ProcessStatus.Send && (this.ticket.usuarioMarketing.id === this.usuarioActual.id);
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoFotografias === ProcessStatus.Pending;
        break;
      case Constantes.bibliotecaDocumentosLibroPartes:
        this.mostrarEditarDocumentos = (this.ticket.estadoLibroPartes === ProcessStatus.Pending || this.ticket.estadoLibroPartes === ProcessStatus.Reject) &&
          (this.usuarioActual.esAdministrador);
        this.mostrarBotonAprobar = this.ticket.estadoLibroPartes === ProcessStatus.Send && this.usuarioActual.esAdministrador;
        this.mostrarComentario = this.actividad.rol === this.actividad.aprobador && this.ticket.estadoLibroPartes === ProcessStatus.Pending;
        break;
      default:
        break;
    }
  }

}
