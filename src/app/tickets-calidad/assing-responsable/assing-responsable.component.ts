import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { EmailType, TicketStatus } from 'src/app/shared/enumerados';
import { CorreoService, DocumentosService, ModalService, TicketService, UsuarioService } from 'src/app/shared/servicios';
import { String as string2 } from 'typescript-string-operations';
import { AgregarComentarioComponent } from '../agregar-comentario/agregar-comentario.component';

@Component({
  selector: 'app-assing-responsable',
  templateUrl: './assing-responsable.component.html',
  styleUrls: ['./assing-responsable.component.css']
})
export class AssingResponsableComponent implements OnInit {
  formularioAsignarResponsables: FormGroup;
  submitted = false;
  public usuariosMarketing: Usuario[] = [];
  public usuarioMarketingSeleccionado: Usuario = null;
  public usuariosSoporteLogistica: Usuario[] = [];
  public usuarioSoporteLogisticaSeleccionado: Usuario = null;
  public usuariosCalidad: Usuario[] = [];
  public usuarioCalidadSeleccionado: Usuario = null;

  public propiedadesCorreo: IEmailProperties;

  bsModalRef: BsModalRef;

  @Input() ticket: Ticket;
  @Input() usuarioActual: Usuario;
  @Input() emailsTemplate: PlantillaEmail[];
  
  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private servicioTicket: TicketService,
    private servicioUsuario: UsuarioService,
    private servicioDocumentos: DocumentosService,
    private servicioNotificacion: ModalService,
    private servicioModal: BsModalService,
    private servicioCorreo: CorreoService,
    private router: Router) { }

  ngOnInit() {
    this.obtenerUsuarios();
    this.registrarControlesFormulario();
  }

  public seleccionarUsuarioMarketing(usuario: Usuario): void {
    this.usuarioMarketingSeleccionado = usuario;
  }

  public seleccionarUsuarioSoporteLogistica(usuario: Usuario): void {
    this.usuarioSoporteLogisticaSeleccionado = usuario;
  }

  public seleccionarUsuarioCalidad(usuario: Usuario): void {
    this.usuarioCalidadSeleccionado = usuario;
  }

  private obtenerUsuarios(): void {
    this.spinner.show();
    this.servicioUsuario.ObtenerUsuariosEnGrupo(Constantes.grupoMarketing).subscribe(respuesta => {
      this.usuariosMarketing = Usuario.fromJsonList(respuesta);
    });
    this.servicioUsuario.ObtenerUsuariosEnGrupo(Constantes.grupoSoporteLogistica).subscribe(respuesta => {
      this.usuariosSoporteLogistica = Usuario.fromJsonList(respuesta);
    });
    this.servicioUsuario.ObtenerUsuariosEnGrupo(Constantes.grupoCalidad).subscribe(respuesta => {
      this.usuariosCalidad = Usuario.fromJsonList(respuesta);
      this.spinner.hide();
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formularioAsignarResponsables.controls;
  }

  private registrarControlesFormulario(): void {
    this.formularioAsignarResponsables = this.formBuilder.group({
      userMarketing: [this.usuarioMarketingSeleccionado, Validators.required],
      userSupport: [this.usuarioSoporteLogisticaSeleccionado, Validators.required],
      userQuality: [this.usuarioCalidadSeleccionado, Validators.required],
    })
  }

  public onSubmitSend(): void {
    this.submitted = true;
    if (this.formularioAsignarResponsables.invalid) {
      return;
    }
    this.spinner.show();
    this.asignarUsuarios();
  }

  private asignarUsuarios(): any {
    this.ticket.usuarioMarketing = this.usuarioMarketingSeleccionado;
    this.ticket.usuarioSoporteLogistica = this.usuarioSoporteLogisticaSeleccionado;
    this.ticket.usuarioCalidad = this.usuarioCalidadSeleccionado;
    this.ticket.estado = TicketStatus.ASSIGNED;
    this.servicioTicket.asignarResponsables(this.ticket, this.usuarioActual).then(() => {
      this.crearCarpetas();
    });
  }

  private crearCarpetas(): any {
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosManualesUsuario).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosVinList).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosVinDescription).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosSparePartsLabeling).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosReporteCalidad).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosEmbarque).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosManualesPDI).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosManualesServicio).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosHomologacion).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosFichaTecnica).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosFotografias).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosLibroPartes).then();
    this.servicioDocumentos.crearCarpetaTicket(this.ticket.orden, Constantes.bibliotecaDocumentosFactoryPi).then();
    this.enviarCorreo();
  }

  private obtenerPropiedadesCorreoEnvioAsignaciones(orden: string): void {
    const plantilla = this.emailsTemplate.find(p => p.nombre === EmailType.ASSIGNED);
    const para = [this.usuarioSoporteLogisticaSeleccionado.email, this.usuarioCalidadSeleccionado.email, this.usuarioMarketingSeleccionado.email];
    const asunto = string2.Format(plantilla.asunto, orden);
    const cuerpo = string2.Format(plantilla.body, this.usuarioActual.nombre, orden, Constantes.linkSitio);
    this.propiedadesCorreo = this.servicioCorreo.asignarPropiedasEmail(para, asunto, cuerpo);
  }

  private enviarCorreo(): void {
    this.obtenerPropiedadesCorreoEnvioAsignaciones(this.ticket.orden);
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
      'The order ' + orden +' has been assignated successfully.',
      () => this.router.navigate(['/'])
    );
  }

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.servicioNotificacion.Error(
      string2.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate(['/'])
    );
  }

  public reject(): void {
    this.ticket.estado = TicketStatus.REJECTCREATED;
    this.enviarComentario();
  }

  public cancel(): void {
    this.router.navigate(['/']);
  }

  private enviarComentario(): void {
    this.bsModalRef = this.servicioModal.show(AgregarComentarioComponent);
    this.bsModalRef.content.ticket = this.ticket;
    this.bsModalRef.content.usuarioDestinatario = this.ticket.creador;
    this.bsModalRef.content.emailsTemplate = this.emailsTemplate;
    this.bsModalRef.content.usuarioActual = this.usuarioActual;
  }

}
