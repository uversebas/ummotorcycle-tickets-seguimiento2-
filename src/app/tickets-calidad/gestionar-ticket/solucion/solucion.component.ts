import { toPublicName } from '@angular/compiler/src/i18n/serializers/xmb';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { Guid } from 'guid-typescript';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { Documento, DocumentoProveedor, PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { DocumentoSoporte } from 'src/app/shared/entidades/documentoSoporte';
import { TicketStatus } from 'src/app/shared/enumerados';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import { CorreoService, DocumentoProveedorService, ModalService, TicketService } from 'src/app/shared/servicios';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-solucion',
  templateUrl: './solucion.component.html'
})
export class SolucionComponent implements OnInit {
  formularioSolucion: FormGroup;
  submitted = false;
  mostrarAlertaTipo = false;
  public propiedadesCorreo: IEmailProperties;
  rutaRegreso: string = Constantes.routerTodosLosTickets;
  habilitado = false;
  public tiposDocumentos: DocumentoProveedor[] = [];
  public documentosSoporte: DocumentoSoporte[] = [];
  public tipoDocumentoSeleccionado: DocumentoProveedor;
  public documentoSeleccionado: Documento;
  public documentoSoporteAdicional: DocumentoSoporte;

  @Input() ticket: Ticket;
  @Input() usuarioActual: Usuario;
  @Input() emailsTemplate: PlantillaEmail[];
  constructor(
    private servicioTicket: TicketService,
    private servicioCorreo: CorreoService,
    private servicioNotificacion: ModalService,
    private documentosProveedoresServicio: DocumentoProveedorService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService
  ) {
    this.documentoSoporteAdicional = new DocumentoSoporte();
   }

  ngOnInit() {
    this.validarIngreso();
    this.obtenerTiposDocumentos();
    this.registrarConstrolesFormulario();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formularioSolucion.controls;
  }

  public onSubmitSend(): void {
    this.submitted = true;
    if (this.formularioSolucion.invalid) {
      return;
    }
    if (this.documentoSeleccionado) {
      if (!this.tipoDocumentoSeleccionado) {
        this.mostrarAlertaTipo = true;
        return;
      } else {
        this.mostrarAlertaTipo = false;
      }
    }
    this.documentosSoporte;
    this.spinner.show();
    this.solucionarTicket();
  }

  public cancel(): void {
    this.router.navigate([this.rutaRegreso]);
  }

  public obtenerTipoDocumento(idTipoDocumento: number) {
    return this.tiposDocumentos.find(td => td.id === idTipoDocumento).nombre;
  }

  public seleccionarTipo(): void {
    this.documentoSoporteAdicional.tipo = this.tipoDocumentoSeleccionado;
    this.mostrarAlertaTipo = false;
  }

  public subirDocumento(e: any): void {
    this.documentoSeleccionado = null;
    this.mostrarAlertaTipo = false;
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const extension = file.name.split('.').pop();
        const nombre = String.Format(
          Constantes.nombreDocumentoProveedor,
          Guid.create().toString(),
          extension
        );
        this.documentoSeleccionado = new Documento(file, nombre);
        this.documentoSoporteAdicional.documento = this.documentoSeleccionado;
        this.documentoSoporteAdicional.mostrarCliente = true;
      });
    }
  }

  private validarIngreso(): void {
    if (
      this.ticket.estado === TicketStatus.SUPPLIERS
    ) {
      if (
        this.usuarioActual.esAdministrador ||
        this.ticket.usuarioPostVenta.id === this.usuarioActual.id
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

  private obtenerTiposDocumentos(): void {
    this.documentosProveedoresServicio.obtenerTodos().subscribe((respuesta) => {
      this.tiposDocumentos = DocumentoProveedor.fromJsonList(respuesta);
      this.cargarDocumentos();
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

  private registrarConstrolesFormulario(): void {
    this.formularioSolucion = this.formBuilder.group({
      comentario: ['', Validators.required],
      tipo: [''],
      documentoAdicional: [''],
    });
    if (!this.habilitado) {
      this.f.comentario.setValue(this.ticket.comentarioSolucion);
      this.formularioSolucion.disable();
    }
  }

  private solucionarTicket(): void {
    this.ticket.estado = TicketStatus.RESOLVED;
    this.servicioTicket.solicionTicket(this.ticket, this.f.comentario.value).then(() => {
      this.actulizarDocumentos();
      this.agregarDocumentoAdicional();
      this.obtenerPropiedadesCorreoEnvioCliente();
      this.enviarCorreo();
    });
  }

  private actulizarDocumentos(): void {
    const documentosAMostrar = this.documentosSoporte.filter(d => d.mostrarCliente);
    documentosAMostrar.forEach(documento => {
      this.documentosProveedoresServicio.actualizarDocumento(documento.id).then();
    });
  }

  private agregarDocumentoAdicional(): void {
    if (this.documentoSoporteAdicional.documento) {
      this.documentosProveedoresServicio.guardarDocumento(this.documentoSoporteAdicional, this.ticket.ticket).then();
    }
  }

  private obtenerPropiedadesCorreoEnvioCliente(): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.RESOLVED
    );
    this.propiedadesCorreo = {
      To: [this.ticket.emailCliente],
      Subject: plantilla.asunto,
      Body: String.Format(
        plantilla.body,
        String.Format(
          '{0} {1}',
          this.ticket.nombreCliente,
          this.ticket.apellidoCliente
        ),
        this.ticket.ticket,
        this.ticket.usuarioPostVenta.nombre,
        Constantes.linkTicketsClientes
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
      () => this.router.navigate([Constantes.routerMisTickets])
    );
  }

}
