import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Constantes } from 'src/app/shared/constantes';
import { PlantillaEmail, Ticket } from 'src/app/shared/entidades';
import { EmailType, TicketStatus } from 'src/app/shared/enumerados';
import {
  CorreoService,
  ModalService,
  TicketService,
} from 'src/app/shared/servicios';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-agregar-comentario',
  templateUrl: './agregar-comentario.component.html',
})
export class AgregarComentarioComponent implements OnInit {
  public formulario: FormGroup;
  public submitted = false;
  public onClose: Subject<boolean>;

  public ticket: Ticket;
  public emailsTemplate: PlantillaEmail[];
  public propiedadesCorreo: IEmailProperties;

  deshabilitarCliente: boolean;
  deshabilitarPostventa: boolean;
  deshabilitarSoporte: boolean;
  correoCliente: string;
  correoPostventa: string;
  correoSoporte: string;

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
      this.registrarControlesFormulario();
      this.habilitarDestinatarios();
    }, 1);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formulario.controls;
  }

  private registrarControlesFormulario(): void {
    this.formulario = this.formBuilder.group({
      comentario: ['', Validators.required],
      destinatario: ['Client', [Validators.required]],
    });
  }

  habilitarDestinatarios(): void {
    this.correoCliente = this.ticket.creador ? this.ticket.creador.email : '';
    this.correoPostventa = this.ticket.usuarioPostVenta
      ? this.ticket.usuarioPostVenta.email
      : '';
    this.correoSoporte = this.ticket.usuarioSoporte
      ? this.ticket.usuarioSoporte.email
      : '';
    switch (this.ticket.estado) {
      case TicketStatus.CREATED:
        this.deshabilitarPostventa = true;
        this.deshabilitarSoporte = true;
        break;
      case TicketStatus.ASSIGNEDAFTERSALES:
      case TicketStatus.WATINGFORCUSTOMER:
        this.deshabilitarSoporte = true;
        break;
      case TicketStatus.ASSIGNEDTOSUPPORT:
      case TicketStatus.SUPPLIERS:
      case TicketStatus.RESOLVED:
        this.deshabilitarCliente = false;
        this.deshabilitarPostventa = false;
        this.deshabilitarSoporte = false;
    }
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formulario.invalid) {
      return;
    }
    this.spinner.show();
    this.enviarComentario();
  }

  private enviarComentario(): void {
    let email = '';
    let nombre = '';
    let bandeja = '';
    let destinatario = this.f.destinatario.value;
    if (destinatario === 'Client') {
      email = this.ticket.creador.email;
      nombre = this.ticket.creador.nombre;
      bandeja = Constantes.linkTicketView;
    }
    if (destinatario === 'After Sales') {
      email = this.ticket.usuarioPostVenta.email;
      nombre = this.ticket.usuarioPostVenta.nombre;
      bandeja = Constantes.linkTicketManage;
    }
    if (destinatario === 'Support') {
      email = this.ticket.usuarioSoporte.email;
      nombre = this.ticket.usuarioSoporte.nombre;
      bandeja = Constantes.linkTicketManage;
    }
    this.servicioTicket
      .agregarComentario(this.ticket.id, this.f.comentario.value)
      .then(() => {
        this.obtenerPropiedadesCorreoEnvioCliente(email, nombre, bandeja);
        this.enviarCorreo();
      });
  }

  private obtenerPropiedadesCorreoEnvioCliente(
    emailDestinatario: string,
    nombreDestinatario: string,
    linkBandeja: string
  ): void {
    const plantilla = this.emailsTemplate.find(
      (p) => p.nombre === EmailType.ADMINISTRATORCOMMENT
    );
    this.propiedadesCorreo = {
      To: [emailDestinatario],
      Subject: String.Format(
        '{0} to {1}',
        plantilla.asunto,
        this.f.destinatario.value
      ),
      Body: String.Format(
        plantilla.body,
        nombreDestinatario,
        this.ticket.ticket,
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

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.onClose.next(true);
    this.bsModalRef.hide();
    this.servicioNotificacion.Error(
      String.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate([Constantes.routerMisTickets])
    );
  }

  public cerrarModal(): void {
    this.bsModalRef.hide();
  }
}
