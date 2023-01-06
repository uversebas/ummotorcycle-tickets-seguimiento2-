import { ComentarioTracing } from './../../../shared/enumerados/comentarioTracing';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import {
  Comentario,
  DocumentoProveedor,
  PlantillaEmail,
  Ticket,
  Usuario,
} from 'src/app/shared/entidades';
import { DocumentoSoporte } from 'src/app/shared/entidades/documentoSoporte';
import { TicketStatus } from 'src/app/shared/enumerados';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import {
  CorreoService,
  DocumentoProveedorService,
  ModalService,
  TicketService,
} from 'src/app/shared/servicios';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-feedback-proveedores',
  templateUrl: './feedback-proveedores.component.html',
})
export class FeedbackProveedoresComponent implements OnInit {
  formularioFeedbackProveedores: FormGroup;
  submitted = false;
  public propiedadesCorreo: IEmailProperties;
  rutaRegreso: string = Constantes.routerTodosLosTickets;
  public tiposDocumentos: DocumentoProveedor[] = [];
  public documentosSoporte: DocumentoSoporte[] = [];
  public idsDocumentosRegistrados: string[] = [];
  habilitado = false;

  @Input() ticket: Ticket;
  @Input() usuarioActual: Usuario;
  @Input() emailsTemplate: PlantillaEmail[];

  constructor(
    private documentosProveedoresServicio: DocumentoProveedorService,
    private formBuilder: FormBuilder,
    private servicioTicket: TicketService,
    private servicioCorreo: CorreoService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private servicioNotificacion: ModalService
  ) {}

  ngOnInit() {
    this.validarIngreso();
    this.spinner.show();
    this.obtenerTiposDocumentos();
    this.registrarControlesFormulario();
  }

  public agregarDocumento(): void {
    const documento = new DocumentoSoporte(null, null);
    documento.indice = this.documentosSoporte.length + 1;
    this.documentosSoporte.push(documento);
  }

  public cancel(): void {
    this.router.navigate([this.rutaRegreso]);
  }

  public onSubmitSend(): void {
    this.submitted = true;
    if (this.formularioFeedbackProveedores.invalid) {
      return;
    }
    this.spinner.show();
    this.guardarDocumentos();
  }

  agregarControlDocumento(constrolDocumento: {
    id: string;
    form: AbstractControl;
  }): void {
    this.formularioFeedbackProveedores.setControl(
      constrolDocumento.id,
      constrolDocumento.form
    );
    this.idsDocumentosRegistrados.push(constrolDocumento.id);
  }

  borrarDocumento(documento: {
    id: string;
    documentoSoporte: DocumentoSoporte;
  }): void {
    this.documentosSoporte.splice(
      this.documentosSoporte.indexOf(documento.documentoSoporte),
      1
    );
    this.formularioFeedbackProveedores.removeControl(documento.id);
  }

  private validarIngreso(): void {
    if (this.ticket.estado === TicketStatus.ASSIGNEDTOSUPPORT) {
      if (
        this.usuarioActual.esAdministrador ||
        this.ticket.usuarioSoporte.id === this.usuarioActual.id
      ) {
        this.habilitado = true;
        this.rutaRegreso = !this.usuarioActual.esAdministrador ? Constantes.routerSoporteTickets : Constantes.routerTodosLosTickets;
      } else {
        this.servicioNotificacion.Error('Error!', 'Access denied', () =>
          this.router.navigate([Constantes.routerInicio])
        );
      }
    }
  }

  private registrarControlesFormulario(): void {
    this.formularioFeedbackProveedores = this.formBuilder.group({});
  }

  private obtenerTiposDocumentos(): void {
    this.documentosProveedoresServicio.obtenerTodos().subscribe((respuesta) => {
      this.tiposDocumentos = DocumentoProveedor.fromJsonList(respuesta);
      if (this.habilitado) {
        this.agregarDocumento();
        this.spinner.hide();
      } else {
        this.cargarDocumentos();
      }
    });
  }

  private cargarDocumentos(): void {
    this.documentosProveedoresServicio
      .obtenerDocumentos(this.ticket.ticket)
      .then((respuesta) => {
        this.documentosSoporte = DocumentoSoporte.fromJsonList(respuesta);
        this.spinner.hide();
      });
  }

  private guardarDocumentos(): void {
    this.documentosProveedoresServicio
      .crearCarpetaTicket(this.ticket.ticket)
      .then(() => {
        this.documentosSoporte.forEach((documento) => {
          this.documentosProveedoresServicio
            .guardarDocumento(documento, this.ticket.ticket)
            .then();
        });
        this.actualizarTicket();
      });
  }

  private actualizarTicket(): void {
    this.ticket.estado = TicketStatus.SUPPLIERS;
    this.ticket.comentario = new Comentario(ComentarioTracing.SUPPLIERS);
    this.servicioTicket.actualizarFeedbackProveedor(this.ticket).then(() => {
      this.obtenerPropiedadesCorreoEnvioPostVenta();
      this.enviarCorreo();
    });
  }

  private obtenerPropiedadesCorreoEnvioPostVenta(): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.SUPPLIERS
    );
    this.propiedadesCorreo = {
      To: [this.ticket.usuarioPostVenta.email],
      Subject: plantilla.asunto,
      Body: String.Format(
        plantilla.body,
        this.ticket.usuarioPostVenta.nombre,
        this.ticket.usuarioSoporte.nombre,
        this.ticket.ticket,
        Constantes.linkTicketsPostVentas
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
        this.mostrarMensajeExitoso();
      })
      .catch((e) => {
        this.spinner.hide();
        this.mostrarAlertaError('Enviar correo', e);
      });
  }

  private mostrarMensajeExitoso(): void {
    this.spinner.hide();
    this.servicioNotificacion.Exito(
      'Great',
      'your request has been sent successfully',
      () => this.router.navigate([this.rutaRegreso])
    );
  }

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.servicioNotificacion.Error(
      String.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate([this.rutaRegreso])
    );
  }
}
