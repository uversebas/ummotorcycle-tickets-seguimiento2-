import { ComentarioTracing } from './../../../shared/enumerados/comentarioTracing';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { Comentario, Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketStatus } from 'src/app/shared/enumerados/ticketStatus';
import { TicketService, UsuarioService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-confirmacion-soporte',
  templateUrl: './confirmacion-soporte.component.html',
})
export class ConfirmacionSoporteComponent implements OnInit {
  public formulario: FormGroup;
  public submitted = false;
  public onClose: Subject<boolean>;

  public ticket: Ticket;
  public usuariosSoporte: Usuario[] = [];
  public usuarioSeleccionado: Usuario = null;
  public comentario: string;

  constructor(
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService
  ) {
    this.onClose = new Subject();
  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.show();
      this.obtenerUsuariosSoporte();
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
    this.asignarUsuarioSoporte();
  }

  public seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
  }

  private registrarControlesFormulario(): void {
    this.formulario = this.formBuilder.group({
      user: [this.usuarioSeleccionado, Validators.required],
    });
  }

  private obtenerUsuariosSoporte(): void {
    const grupoSoporte = this.ticket.region.grupoSoporte;
    this.servicioUsuario
      .ObtenerUsuariosEnGrupo(grupoSoporte)
      .subscribe((respuesta) => {
        this.usuariosSoporte = Usuario.fromJsonList(respuesta);
        this.spinner.hide();
      });
  }

  asignarUsuarioSoporte(): void {
    this.ticket.usuarioSoporte = this.usuarioSeleccionado;
    this.ticket.estado = TicketStatus.ASSIGNEDTOSUPPORT;
    this.ticket.comentario = new Comentario(ComentarioTracing.ASSIGNEDTOSUPPORT);
    this.servicioTicket
      .asignarUsuarioSoporte(this.ticket, this.comentario)
      .then(() => {
        this.spinner.hide();
        this.onClose.next(true);
        this.bsModalRef.hide();
      });
  }
}
