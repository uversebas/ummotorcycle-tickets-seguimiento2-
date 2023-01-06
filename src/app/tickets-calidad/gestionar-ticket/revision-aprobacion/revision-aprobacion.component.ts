import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { Guid } from 'guid-typescript';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes, ConstantesCorreos } from 'src/app/shared/constantes';
import {
  Comentario,
  Documento,
  PlantillaEmail,
  Ticket,
  Usuario,
} from 'src/app/shared/entidades';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import { TicketStatus } from 'src/app/shared/enumerados/ticketStatus';
import {
  ComentarioService,
  CorreoService,
  ModalService,
  TicketService,
} from 'src/app/shared/servicios';
import { String } from 'typescript-string-operations';
import { ConfirmacionSoporteComponent } from '../confirmacion-soporte/confirmacion-soporte.component';
import { String as string2 } from 'typescript-string-operations';
import { FailureCategoryService } from 'src/app/shared/servicios/failureCategory.service';
import { FactoryService } from 'src/app/shared/servicios/factory.service';
import { FailureCategory } from 'src/app/shared/entidades/failureCategory';
import { Factory } from 'src/app/shared/entidades/factory';

@Component({
  selector: 'app-revision-aprobacion',
  templateUrl: './revision-aprobacion.component.html',
})
export class RevisionAprobacionComponent implements OnInit {
  formularioRevisionAprobacion: FormGroup;
  submitted = false;
  public propiedadesCorreo: IEmailProperties;
  documentoCliente: Documento = null;
  rutaRegreso: string = Constantes.routerTodosLosTickets;
  habilitado = false;
  comentarios: Comentario[] = [];
  categoriasFallas: FailureCategory[] = [];
  fabricas: Factory[] = [];
  categoriaSeleccionada: FailureCategory;
  fabricaSeleccionada: Factory;

  @Input() ticket: Ticket;
  @Input() usuarioActual: Usuario;
  @Input() emailsTemplate: PlantillaEmail[];

  bsModalRef: BsModalRef;

  constructor(
    private servicioTicket: TicketService,
    private servicioCorreo: CorreoService,
    private servicioNotificacion: ModalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private servicioModal: BsModalService,
    private servicioComentarios: ComentarioService,
    private servicioCategoriaFalla: FailureCategoryService,
    private servicioFabrica: FactoryService
  ) {}

  ngOnInit() {
    this.inicializarPlaceholders();
    this.validarIngreso();
    this.cargarComentarios();
    this.cargarFabricas();
    this.carcarCategorias();
    this.registrarConstrolesFormulario();
  }

  inicializarPlaceholders() {
    this.fabricaSeleccionada = null;
    this.categoriaSeleccionada = null;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formularioRevisionAprobacion.controls;
  }

  onSubmit(buttonType): void {
    this.submitted = true;
    if (buttonType === 'sendSupport') {
      this.f.categoria.setValidators(Validators.required);
      this.f.categoria.updateValueAndValidity();

      this.f.fabrica.setValidators(Validators.required);
      this.f.fabrica.updateValueAndValidity();
    }
    if (buttonType === 'sendClient') {
      this.f.categoria.clearValidators();
      this.f.categoria.updateValueAndValidity();

      this.f.fabrica.clearValidators();
      this.f.fabrica.updateValueAndValidity();
    }
    if (this.formularioRevisionAprobacion.invalid) {
      return;
    }
    this.ticket.fabrica = this.fabricaSeleccionada;
    this.ticket.categoriaFalla = this.categoriaSeleccionada;
    if (buttonType === 'sendSupport') {
      this.asignarSoporte();
    }
    if (buttonType === 'sendClient') {
      this.enviarACliente();
    }
  }

  subirAdjuntoCliente(e: any): void {
    this.documentoCliente = null;
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const extension = file.name.split('.').pop();
        const nombre = String.Format(
          Constantes.nombreDocumentoClienteRevision,
          Guid.create().toString(),
          extension
        );
        this.documentoCliente = new Documento(file, nombre);
      });
    }
  }

  private validarIngreso(): void {
    if (
      this.ticket.estado === TicketStatus.ASSIGNEDAFTERSALES ||
      this.ticket.estado === TicketStatus.WATINGFORCUSTOMER
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

  private async cargarComentarios(): Promise<void> {
    this.comentarios =
      await this.servicioComentarios.ObtenerComentariosParaCliente(
        this.ticket.id
      );
  }

  private cargarFabricas(): void {
    this.servicioFabrica.obtenerTodos().subscribe(respuesta => {
      this.fabricas = Factory.fromJsonList(respuesta);
      if (this.ticket.fabrica != null) {
        this.fabricaSeleccionada = this.fabricas.find(f => f.id === this.ticket.fabrica.id);
      }
      this.f.fabrica.setValue(this.fabricaSeleccionada);
      if (!this.habilitado) {
        this.f.fabrica.disable();
      }
    })
  }

  private carcarCategorias(): void {
    this.servicioCategoriaFalla.obtenerTodos().subscribe(respuesta => {
      this.categoriasFallas = FailureCategory.fromJsonList(respuesta);
      if (this.ticket.categoriaFalla != null) {
        this.categoriaSeleccionada = this.categoriasFallas.find(c => c.id === this.ticket.categoriaFalla.id);
      }
      this.f.categoria.setValue(this.categoriaSeleccionada);
      if (!this.habilitado) {
        this.f.categoria.disable();
      }
    });
  }

  private registrarConstrolesFormulario(): void {
    this.formularioRevisionAprobacion = this.formBuilder.group({
      categoria: '',
      fabrica: '',
      comentario: ['', Validators.required],
      adjuntoCliente: '',
    });
  }

  private obtenerPropiedadesCorreoSoporte(): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.ASSIGNEDTOSUPPORT
    );
    this.propiedadesCorreo = {
      To: [this.ticket.usuarioSoporte.email],
      Subject: plantilla.asunto,
      Body: string2.Format(
        plantilla.body,
        this.ticket.usuarioSoporte.nombre,
        this.usuarioActual.nombre,
        this.ticket.ticket,
        Constantes.linkTicketsSoporte
      ),
      CC: plantilla.cc,
      AdditionalHeaders: {
        'content-type': 'text/html',
      },
    };
  }

  private obtenerPropiedadesCorreoEnvioCliente(): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.WATINGFORCUSTOMER
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
        this.f.comentario.value,
        this.ticket.usuarioPostVenta.email,
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
        this.mostrarMensajeExitoso();
      })
      .catch((e) => {
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

  private asignarSoporte(): void {
    this.bsModalRef = this.servicioModal.show(ConfirmacionSoporteComponent);
    this.bsModalRef.content.ticket = this.ticket;
    this.bsModalRef.content.comentario = this.f.comentario.value;
    this.bsModalRef.content.onClose.subscribe(
      (resultadoTransaccion: boolean) => {
        if (resultadoTransaccion) {
          if (this.documentoCliente) {
            this.guardarArchivo();
          }
          this.obtenerPropiedadesCorreoSoporte();
          this.enviarCorreo();
        }
      }
    );
  }

  private enviarACliente(): void {
    this.spinner.show();
    this.ticket.estado = TicketStatus.WATINGFORCUSTOMER;
    this.servicioTicket
      .revicionAprobacion(this.ticket, this.f.comentario.value)
      .then(() => {
        if (this.documentoCliente) {
          this.guardarArchivo();
        }
        this.obtenerPropiedadesCorreoEnvioCliente();
        this.enviarCorreo();
      });
  }

  private guardarArchivo(): void {
    this.servicioTicket
      .guardarDocumentoCliente(this.ticket.id, this.documentoCliente)
      .then();
  }
}
