import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrincipalSource } from '@pnp/sp';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Constantes } from 'src/app/shared/constantes';
import { PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { EmailType, ProcessStatus } from 'src/app/shared/enumerados';
import { CorreoService, ModalService, TicketService } from 'src/app/shared/servicios';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-agregar-comentario',
  templateUrl: './agregar-comentario.component.html',
  styleUrls: ['./agregar-comentario.component.css']
})
export class AgregarComentarioComponent implements OnInit {
  public formulario: FormGroup;
  public submitted = false;
  public onClose: Subject<boolean>;

  public ticket: Ticket;
  public emailsTemplate: PlantillaEmail[];
  public propiedadesCorreo: IEmailProperties;
  public usuarioDestinatario: Usuario;
  public biblioteca: string;

  constructor(
    private servicioTicket: TicketService,
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private servicioCorreo: CorreoService,
    private servicioNotificacion: ModalService,
    private router: Router
  ) {
    this.onClose = new Subject();
  }

  ngOnInit() {
    setTimeout(() => {
      console.log(this.ticket);
      this.registrarControlesFormulario();
    }, 1);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formulario.controls;
  }

  private registrarControlesFormulario(): void {
    this.formulario = this.formBuilder.group({
      comentario: ['', Validators.required],
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formulario.invalid) {
      return;
    }
    this.spinner.show();
    this.rechazar();

  }

  private rechazar(): void {
    switch (this.biblioteca) {
      case Constantes.bibliotecaDocumentosManualesUsuario:
        this.rechazarManualUsuario();
        break;
      case Constantes.bibliotecaDocumentosVinList:
        this.rechazarVinList();
        break;
      case Constantes.bibliotecaDocumentosVinDescription:
        this.rechazarVinDescription();
        break;
      case Constantes.bibliotecaDocumentosSparePartsLabeling:
        this.rechazarSparePartsLabeling();
        break;
      case Constantes.bibliotecaDocumentosReporteCalidad:
        this.rechazarReporteCalidad();
        break;
      case Constantes.bibliotecaDocumentosEmbarque:
        this.rechazarEmbarque();
        break;
      case Constantes.bibliotecaDocumentosManualesPDI:
        this.rechazarPDI();
        break;
      case Constantes.bibliotecaDocumentosManualesServicio:
        this.rechazarManualServicio();
        break;
      case Constantes.bibliotecaDocumentosHomologacion:
        this.rechazarHomologacion();
        break;
      case Constantes.bibliotecaDocumentosFichaTecnica:
        this.rechazarFichaTecnica();
        break;
      case Constantes.bibliotecaDocumentosFotografias:
        this.rechazarFotografias();
        break;
      case Constantes.bibliotecaDocumentosLibroPartes:
        this.rechazarLibroPartes();
        break;
      default:
        this.rechazoTicket();
        break;
    }
  }

  rechazarManualUsuario() {
    this.ticket.estadoManualUsuario = ProcessStatus.Reject
    this.servicioTicket.rechazoManualUsuario(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarVinDescription() {
    this.ticket.estadoVinDescription = ProcessStatus.Reject;
    this.servicioTicket.rechazoVinDescription(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarVinList() {
    this.ticket.estadoVinList = ProcessStatus.Reject
    this.servicioTicket.rechazoVinList(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarSparePartsLabeling() {
    this.ticket.estadoSparePartsLabel = ProcessStatus.Reject
    this.servicioTicket.rechazoSparePartsLabel(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarReporteCalidad() {
    this.ticket.estadoReporteCalidad = ProcessStatus.Reject
    this.servicioTicket.rechazoReporteCalidad(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarEmbarque() {
    this.ticket.estadoDocumentoEmbarque = ProcessStatus.Reject
    this.servicioTicket.rechazoDocumentoEmbarque(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarPDI() {
    this.ticket.estadoManualPDI = ProcessStatus.Reject
    this.servicioTicket.rechazoManualPDI(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarManualServicio() {
    this.ticket.estadoManualesServicio = ProcessStatus.Reject
    this.servicioTicket.rechazoManualesServicio(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarHomologacion() {
    this.ticket.estadoHomologacion = ProcessStatus.Reject
    this.servicioTicket.rechazoHomologacion(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarFichaTecnica() {
    this.ticket.estadoManualTecnico = ProcessStatus.Reject
    this.servicioTicket.rechazoManualTecnico(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarFotografias() {
    this.ticket.estadoFotografias = ProcessStatus.Reject
    this.servicioTicket.rechazoFotografias(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazarLibroPartes() {
    this.ticket.estadoLibroPartes = ProcessStatus.Reject
    this.servicioTicket.rechazoLibroPartes(this.ticket, this.f.comentario.value).then(() => {
      this.cerrarModal();
      this.mostrarMensajeExitoso(this.ticket.orden);
    });
  }
  rechazoTicket() {
    this.servicioTicket.rechazoGeneral(this.ticket, this.f.comentario.value).then(() => {
      this.spinner.hide();
      this.bsModalRef.hide();
      this.router.navigate(['/'])
    });
  }

  private obtenerPropiedadesCorreoEnvioCliente(
    linkBandeja: string
  ): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.ADMINISTRATORCOMMENT
    );
    this.propiedadesCorreo = {
      To: [this.usuarioDestinatario.email],
      Subject: String.Format(
        '{0} to {1}',
        plantilla.asunto,
        this.f.destinatario.value
      ),
      Body: String.Format(
        plantilla.body,
        this.usuarioDestinatario.nombre,
        this.ticket.orden,
        this.f.comentario.value,
        linkBandeja + this.ticket.id
      ),
      CC: plantilla.cc,
      AdditionalHeaders: {
        'content-type': 'text/html',
      },
    };
  }

  private enviarCorreo(): void {
    this.servicioCorreo
      .Enviar(this.propiedadesCorreo)
      .then(() => {
        this.spinner.hide();
        this.onClose.next(true);
        this.bsModalRef.hide();
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
      () => this.router.navigate(['/'])
    );
  }

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.onClose.next(true);
    this.bsModalRef.hide();
    this.servicioNotificacion.Error(
      String.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate(['/'])
    );
  }

  public cerrarModal(): void {
    this.bsModalRef.hide();
  }

}
