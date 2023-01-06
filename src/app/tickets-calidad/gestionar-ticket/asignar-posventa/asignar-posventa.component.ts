import { ComentarioTracing } from './../../../shared/enumerados/comentarioTracing';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Constantes } from 'src/app/shared/constantes';
import { Comentario, PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import { TicketStatus } from 'src/app/shared/enumerados/ticketStatus';
import { CorreoService, ModalService, TicketService, UsuarioService } from 'src/app/shared/servicios';
import { String as string2 } from 'typescript-string-operations';

@Component({
  selector: 'app-asignar-posventa',
  templateUrl: './asignar-posventa.component.html'
})
export class AsignarPosventaComponent implements OnInit {
  public formulario: FormGroup;
  public submitted = false;
  public onClose: Subject<boolean>;

  public ticket: Ticket;
  public usuariosPostVenta: Usuario[] = [];
  public usuarioSeleccionado: Usuario = null;
  public emailsTemplate: PlantillaEmail[];
  public propiedadesCorreo: IEmailProperties;
  public usuarioActual: Usuario;

  constructor(
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private servicioCorreo: CorreoService,
    private servicioNotificacion: ModalService,
    private router: Router) {
    this.onClose = new Subject();
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.show();
      this.obtenerUsuariosPostVenta();
      this.registrarControlesFormulario();
    }, 1);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formulario.controls;
  }


  public cerrarModal(): void {
    this.bsModalRef.hide();
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formulario.invalid) {
      return;
    }
    this.spinner.show();
    this.asignarPostVenta();
  }

  public seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
  }

  asignarPostVenta(): void {
    this.ticket.usuarioPostVenta = this.usuarioSeleccionado;
    this.ticket.estado = TicketStatus.ASSIGNEDAFTERSALES;
    this.ticket.comentario = new Comentario(ComentarioTracing.ASSIGNEDAFTERSALES);
    this.servicioTicket.asignarPostVentas(this.ticket).then(() => {
      this.obtenerPropiedadesCorreoEnvioCliente();
      this.enviarCorreo();
    });
  }

  private registrarControlesFormulario(): void {
    this.formulario = this.formBuilder.group({
      user: [this.usuarioSeleccionado, Validators.required]
    })
  }

  private obtenerUsuariosPostVenta(): void {
    const grupoPostVenta = this.ticket.region.grupoPostVenta;
    this.servicioUsuario.ObtenerUsuariosEnGrupo(grupoPostVenta).subscribe(respuesta => {
      this.usuariosPostVenta = Usuario.fromJsonList(respuesta);
      this.spinner.hide();
    });
  }

  private obtenerPropiedadesCorreoEnvioCliente(): void {
    const plantilla = this.emailsTemplate.find(p => p.nombre === EmailType.ASSIGNEDAFTERSALES);
    this.propiedadesCorreo = {
      To: [this.usuarioSeleccionado.email],
      Subject: plantilla.asunto,
      Body: string2.Format(
        plantilla.body,
        this.usuarioSeleccionado.nombre,
        this.usuarioActual.nombre,
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
      string2.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate([Constantes.routerMisTickets])
    );
  }

}
