import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { Constantes } from 'src/app/shared/constantes';
import {
  Documento,
  PlantillaEmail,
  Ticket,
  Usuario,
} from 'src/app/shared/entidades';

import { environment } from 'src/environments/environment';
import {
  CorreoService,
  DocumentosService,
  ModalService,
  TicketService,
  UsuarioService,
} from 'src/app/shared/servicios';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import { String as string2 } from 'typescript-string-operations';

@Component({
  selector: 'app-creacion-ticket',
  templateUrl: './creacion-ticket.component.html'
})
export class CreacionTicketComponent implements OnInit {
  formularioCreacionTicket: FormGroup;
  submitted = false;
  public usuarioActual: Usuario;
  public imagenes: string[] = [];
  public imagenesSubir: Documento[] = [];
  public data: [][];
  public emailsTemplate: PlantillaEmail[] = [];
  public documentos: Documento[] = [];
  public propiedadesCorreo: IEmailProperties;
  public iconoDesconocido = 'assets/images/unknow-file.png';
  listaIconos = [
    { tipo: 'pdf', icono: 'assets/images/icon-pdf.png' },
    { tipo: 'xlsx', icono: 'assets/images/icon-excel.png' },
    { tipo: 'xls', icono: 'assets/images/icon-excel.png' },
    { tipo: 'csv', icono: 'assets/images/icon-excel.png' },
    { tipo: 'docx', icono: 'assets/images/icon-word.png' },
    { tipo: 'doc', icono: 'assets/images/icon-word.png' },
  ]

  public consecutivoTicket: string;
  public html = `<img alt="vins" class="img-responsive" width="100%" src="${environment.web}/siteAssets/app-quality-reports/assets/images/imagenVINS.png" />`;

  constructor(
    private formBuilder: FormBuilder,
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    private documentosService: DocumentosService,
    private servicioNotificacion: ModalService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private servicioCorreo: CorreoService
  ) { }

  async ngOnInit() {
    this.spinner.show();
    this.CargarSolicitud();
  }

  async CargarSolicitud(): Promise<void> {
    await this.servicioUsuario.ObtenerUsuario().then(() => {
      this.obtenerUsuarioCookie();
      if (this.validarIngreso()) {
        this.registrarControlesFormulario();
        this.obtenerPlantillasEmail();
      } else {
        this.cancelar();
      }
    });
  }

  private obtenerUsuarioCookie(): void {
    this.usuarioActual = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
  }

  private validarIngreso(): boolean {
    return this.usuarioActual.esAdministrador || this.usuarioActual.esComercial;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formularioCreacionTicket.controls;
  }

  private registrarControlesFormulario(): void {
    this.formularioCreacionTicket = this.formBuilder.group({
      orden: ['', Validators.required],
      pais: ['', Validators.required],
      fecha: ['', Validators.required],
      adjuntoCliente: ''
    });
  }

  private obtenerPlantillasEmail(): void {
    this.servicioCorreo.obtenerEmails().subscribe((respuesta) => {
      this.emailsTemplate = PlantillaEmail.fromJsonList(respuesta);
      this.spinner.hide();
    });
  }

  onSubmitCrearTicket(): void {
    this.submitted = true;
    const numeroAdjuntos = this.imagenes.length + this.documentos.length;
    if (this.formularioCreacionTicket.invalid || numeroAdjuntos === 0) {
      return;
    }
    this.spinner.show();
    const ticket = new Ticket(
      this.f.orden.value,
      this.f.pais.value,
      this.f.fecha.value,
    );
    this.guardarTickect(ticket);
  }

  private guardarTickect(ticket: Ticket): void {
    this.servicioTicket.agregar(ticket).then((respuesta) => {
      ticket.id = respuesta.data.Id;
      this.agregarDocumentos(ticket);
    });
  }

  private agregarDocumentos(ticket: Ticket) {
    this.documentosService.crearCarpetaTicket(ticket.orden, Constantes.bibliotecaDocumentosTicket).then(() => {
      const documentosASubir = this.documentos.concat(this.imagenesSubir);
      this.documentosService.agregarArchivos(ticket, Constantes.bibliotecaDocumentosTicket, documentosASubir).then(() => {
        this.mostrarMensajeExitoso(ticket.orden);
      });
    });
  }

  cancelar(): void {
    this.router.navigate([Constantes.routerInicio]);
  }

  subirAdjuntosCliente(e: any): void {
    this.documentos = [];
    this.imagenesSubir = [];
    this.imagenes = [];
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        if (file.type.includes('image')) {
          this.imagenesSubir.push(new Documento(file, file.name));
          const reader: any = new FileReader();
          reader.onload = (e: any): any => {
            this.imagenes.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          this.documentos.push(new Documento(file, file.name));
        }
      });
    }
  }

  obtenerIconoDocumento(documento: Documento): string {
    const extension = documento.nombre.split('.').pop();
    const icono = this.listaIconos.find(i => i.tipo === extension)?.icono;
    if (icono) {
      return icono;
    }
    return this.iconoDesconocido;
  }

  private obtenerPropiedadesCorreoEnvioCliente(ticket: Ticket): void {
    const plantilla = this.emailsTemplate.find(p => p.nombre === EmailType.CREATED);
    this.propiedadesCorreo = {
      To: [''],
      Subject: plantilla.asunto,
      Body: string2.Format(
        plantilla.body,
        ticket.orden,
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
        this.mostrarMensajeExitoso('');
      })
      .catch((e) => {
        this.mostrarAlertaError('Send email', e);
      });
  }

  private mostrarMensajeExitoso(orden: string): void {
    this.spinner.hide();
    this.servicioNotificacion.Exito(
      'Great!',
      'The order ' + orden +' has been created successfully.',
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

  patternValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }
      const regex = new RegExp('^[0-9]{3}$');
      const valid = regex.test(control.value);
      return valid ? null : { invalidCcMotor: true };
    };
  }
}
