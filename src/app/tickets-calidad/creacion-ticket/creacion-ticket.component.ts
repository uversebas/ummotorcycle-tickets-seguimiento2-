import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TooltipConfig } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerService } from 'ngx-spinner';

import * as XLSX from 'xlsx';
import { Constantes } from 'src/app/shared/constantes';
import {
  AyudaContextual,
  Comentario,
  Documento,
  Falla,
  MaestroVin,
  Modelo,
  Motor,
  Parte,
  PlantillaEmail,
  RegionSetting,
  Ticket,
  Usuario,
  Vin,
} from 'src/app/shared/entidades';

import { environment } from 'src/environments/environment';
import {
  AyudaContextualService,
  CorreoService,
  FallosService,
  ModalService,
  ModelosService,
  MotorService,
  PartesService,
  TicketService,
  UsuarioService,
  VinService,
} from 'src/app/shared/servicios';
import { ComentarioTracing, TicketStatus } from 'src/app/shared/enumerados';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { EmailType } from 'src/app/shared/enumerados/emailType';
import { String as string2 } from 'typescript-string-operations';
import { Guid } from 'guid-typescript';

export function configurarTooltip(): TooltipConfig {
  return Object.assign(new TooltipConfig(), {
    placement: 'top',
    container: 'body-tooltip',
  });
}

@Component({
  selector: 'app-creacion-ticket',
  templateUrl: './creacion-ticket.component.html',
  providers: [{ provide: TooltipConfig, useFactory: configurarTooltip }],
})
export class CreacionTicketComponent implements OnInit {
  formularioCreacionTicket: FormGroup;
  submitted = false;
  public usuarioActual: Usuario;
  public imagenes: string[] = [];
  public ayudasContextuales: AyudaContextual[] = [];
  public partes: Parte[] = [];
  public vins: Vin[] = [];
  public idsPartesRegistradas: string[] = [];
  public idsVinRegistrados: string[] = [];
  public vinMaestros: MaestroVin[] = [];
  public fallas: Falla[] = [];
  public modelos: Modelo[] = [];
  public regionesCliente: RegionSetting[] = [];
  public motoresPorRegiones: Motor[] = [];
  public motores: Motor[] = [];
  public imagenesSubir: File[] = [];
  public data: [][];
  public vinsCargadosExcel: Vin[] = [];
  public vinsErradosExcel: Vin[] = [];
  public emailsTemplate: PlantillaEmail[] = [];
  public documentos: Documento[] = [];
  public propiedadesCorreo: IEmailProperties;

  public modeloSeleccionado: Modelo;
  public fallaSeleccionada: Falla;
  public regionSeleccionada: RegionSetting;
  public motorSeleccionado: Motor;

  public consecutivoTicket: string;
  public html = `<img alt="vins" class="img-responsive" width="100%" src="${environment.web}/siteAssets/app-quality-reports/assets/images/imagenVINS.png" />`;

  constructor(
    private formBuilder: FormBuilder,
    private servicioUsuario: UsuarioService,
    private servicioAyudasContextuales: AyudaContextualService,
    private servicioModelos: ModelosService,
    private servicioMotor: MotorService,
    private servicioFallas: FallosService,
    private servicioVin: VinService,
    private servicioTicket: TicketService,
    private servicioPartes: PartesService,
    private servicioNotificacion: ModalService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private servicioCorreo: CorreoService
  ) {}

  async ngOnInit() {
    this.CargarSolicitud();
  }

  async CargarSolicitud(): Promise<void> {
    await this.servicioUsuario.ObtenerUsuario().then(() => {
      this.obtenerUsuarioCookie();
      if (this.validarIngreso()) {
        this.spinner.show();
        this.inicializarPlaceholders();
        this.registrarControlesFormulario();
        this.cargarRegionesCliente();
        this.obtenerAyudasContextuales();
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
    const esAdministrador = this.usuarioActual.esAdministrador;
    const esCliente =
      this.usuarioActual.roles.filter((r) => r.esCliente === true).length > 0;
    return esAdministrador || esCliente;
  }

  private inicializarPlaceholders(): void {
    this.modeloSeleccionado = null;
    this.fallaSeleccionada = null;
    this.regionSeleccionada = null;
    this.motorSeleccionado = null;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formularioCreacionTicket.controls;
  }

  private registrarControlesFormulario(): void {
    this.formularioCreacionTicket = this.formBuilder.group({
      region: ['', Validators.required],
      nombrecliente: ['', Validators.required],
      apellidocliente: ['', Validators.required],
      emailcliente: [
        this.usuarioActual.email,
        Validators.compose([Validators.required, Validators.email]),
      ],
      asunto: ['', Validators.required],
      numeropi: ['', Validators.required],
      modelo: ['', Validators.required],
      ccmotor: ['', Validators.required],
      tipofalla: ['', Validators.required],
      descripcionfalla: ['', Validators.required],
      solucionfalla: ['', Validators.required],
      adjuntoCliente: ''
    });
    this.f.emailcliente.disable();
    this.agregarParte();
    this.agregarVin();
  }

  private cargarRegionesCliente(): void {
    if (this.usuarioActual.esAdministrador) {
      this.regionesCliente = this.usuarioActual.roles.map((r) => r.region);
    } else {
      this.regionesCliente = this.usuarioActual.roles
        .filter((r) => r.esCliente === true)
        .map((r) => r.region);
      if (this.regionesCliente.length === 1) {
        this.deshabilitarRegionesCliente();
      }
    }
  }

  seleccionarRegion(): void {
    this.limpiarMotoresPorRegionesYModelos();
    if (this.regionSeleccionada) {
      this.spinner.show();
      this.servicioModelos
        .ObtenerPorRegion(this.regionSeleccionada.id)
        .subscribe((respuesta) => {
          this.motoresPorRegiones = Motor.fromJsonList(respuesta);
          const motoresFiltradosPorRegion = this.motoresPorRegiones.map(
            (m) => m.modelo
          );
          this.modelos = motoresFiltradosPorRegion.filter(
            (v, i, a) => a.findIndex((t) => t.id === v.id) === i
          );
          this.spinner.hide();
        });
    } else {
      this.spinner.hide();
    }
  }

  private limpiarMotoresPorRegionesYModelos() {
    this.motoresPorRegiones = new Array();
    this.modelos = new Array();
    this.motores = new Array();
    this.modeloSeleccionado = null;
    this.motorSeleccionado = null;
  }

  seleccionarModelo(): void {
    this.limpiarMotores();
    if (this.modeloSeleccionado) {
      this.spinner.show();
      this.servicioMotor
        .ObtenerPorRegionYModelo(
          this.regionSeleccionada.id,
          this.modeloSeleccionado.id
        )
        .subscribe((respuesta) => {
          this.motores = Motor.fromJsonList(respuesta);
          this.spinner.hide();
        });
    } else {
      this.spinner.hide();
    }
  }

  private limpiarMotores(): void {
    this.motores = new Array();
    this.motorSeleccionado = null;
  }

  private deshabilitarRegionesCliente(): void {
    this.regionSeleccionada = this.regionesCliente[0];
    this.f.region.disable();
    this.seleccionarRegion();
  }

  private obtenerAyudasContextuales(): void {
    this.servicioAyudasContextuales.obtenerTodos().subscribe((respuesta) => {
      this.ayudasContextuales = AyudaContextual.fromJsonList(respuesta);
      this.obtenerFallas();
    });
  }

  private obtenerFallas(): void {
    this.servicioFallas.obtenerTodos().subscribe((respuesta) => {
      this.fallas = Falla.fromJsonList(respuesta);
      this.obtenerMaestroVin();
    });
  }

  private obtenerMaestroVin(): void {
    this.servicioVin.obtenerTodosVinMaestros().subscribe((respuesta) => {
      this.vinMaestros = MaestroVin.fromJsonList(respuesta);
      this.spinner.hide();
    });
  }

  private obtenerPlantillasEmail(): void {
    this.servicioCorreo.obtenerEmails().subscribe((respuesta) => {
      this.emailsTemplate = PlantillaEmail.fromJsonList(respuesta);
    });
  }

  onSubmitCrearTicket(): void {
    this.submitted = true;
    if (this.formularioCreacionTicket.invalid || this.imagenes.length < 3) {
      return;
    }
    this.spinner.show();
    const ticket = new Ticket(
      this.regionSeleccionada,
      this.f.nombrecliente.value,
      this.f.apellidocliente.value,
      this.f.emailcliente.value,
      this.f.asunto.value,
      this.f.numeropi.value,
      this.motorSeleccionado.nombre,
      this.f.descripcionfalla.value,
      this.f.solucionfalla.value,
      this.fallaSeleccionada,
      this.modeloSeleccionado
    );
    ticket.estado = TicketStatus.CREATED;
    ticket.comentario = new Comentario(ComentarioTracing.CREATED);
    this.guardarTickect(ticket);
  }

  private guardarTickect(ticket: Ticket): void {
    this.servicioTicket.agregar(ticket).then((respuesta) => {
      ticket.id = respuesta.data.Id;
      this.asignarConsecutivo(ticket.id, ticket);
    });
  }

  private asignarConsecutivo(ticketId: number, ticket: Ticket) {
    this.servicioTicket
      .obtenerUltimoTicketPorNumeroPI(ticketId, ticket.numeroPi)
      .then((respuesta) => {
        const ultimoTicket: Ticket = respuesta;
        let consecutivo: number = ultimoTicket
          ? ultimoTicket.numeroConsecutivo + 1
          : 1;
        this.servicioTicket
          .AsignarConsecutivo(ticketId, consecutivo)
          .then(() => {
            this.consecutivoTicket = ticket.numeroPi + '-' + consecutivo;
            ticket.ticket = this.consecutivoTicket;
            this.agregarPartes(ticket);
          });
      });
  }

  private agregarPartes(ticket: Ticket): void {
    this.servicioPartes.CrearBatch(this.partes, ticket.id).then(() => {
      this.agregarVins(ticket);
    });
  }

  private agregarVins(ticket: Ticket): void {
    this.servicioVin.CrearBatch(this.vins, ticket.id).then(() => {
      this.guardarAdjuntos(ticket.id);
      this.obtenerPropiedadesCorreoEnvioCliente(ticket);
      this.enviarCorreo();
    });
  }

  private guardarAdjuntos(ticketId: number) {
    this.servicioTicket
      .guardarAdjuntosCreacionTicket(ticketId, this.imagenesSubir, this.documentos)
      .then();
  }

  cancelar(): void {
    this.router.navigate([Constantes.routerInicio]);
  }

  public cambiarImagenes(inputImage: any): void {
    if (inputImage.files) {
      for (let index = 0; index < inputImage.files.length; index++) {
        const file: File = inputImage.files[index];
        const reader: any = new FileReader();
        this.imagenesSubir.push(file);
        reader.onload = (e: any): any => {
          this.setSignatureImage(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public resetImagenes(inputImage: HTMLInputElement): void {
    this.imagenes = [];
    this.imagenesSubir = [];
    inputImage.value = '';
  }

  private setSignatureImage(image: string): void {
    this.imagenes.push(image);
  }

  public agregarParte(): void {
    const parte = new Parte(null, 0);
    parte.indice = this.partes.length + 1;
    this.partes.push(parte);
  }

  agregarControlParte(controlParte: {
    id: string;
    form: AbstractControl;
  }): void {
    this.formularioCreacionTicket.setControl(
      controlParte.id,
      controlParte.form
    );
    this.idsPartesRegistradas.push(controlParte.id);
  }

  public agregarVin(): void {
    const vin = new Vin(null);
    vin.indice = this.vins.length + 1;
    this.vins.push(vin);
  }

  agregarControlVin(controlVin: { id: string; form: AbstractControl }): void {
    this.formularioCreacionTicket.setControl(controlVin.id, controlVin.form);
    this.idsVinRegistrados.push(controlVin.id);
  }

  borrarVin(vin: { id: string; vin: Vin }): void {
    this.vins.splice(this.vins.indexOf(vin.vin), 1);
    this.formularioCreacionTicket.removeControl(vin.id);
  }

  borrarParte(parte: { id: string; parte: Parte }): void {
    this.partes.splice(this.partes.indexOf(parte.parte), 1);
    this.formularioCreacionTicket.removeControl(parte.id);
  }

  subirExcel(excel: any): void {
    const reader: FileReader = new FileReader();
    reader.onload = (e: any): any => {
      this.spinner.show();
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (this.data.length > 0) {
        this.vinsCargadosExcel = [];
        this.vinsErradosExcel = [];
        this.procesarVinMasivos();
        if (this.vinsCargadosExcel.length > 0) {
          this.cargarVinMasivosFormulario();
        }
        this.spinner.hide();
      }
    };
    reader.readAsBinaryString(excel.files[0]);
  }

  subirAdjuntosCliente(e: any): void {
    this.documentos = [];
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const extension = file.name.split('.').pop();
        if (extension === 'pdf' || extension === 'xls' || extension === 'xlsx') {
          const nombre = string2.Format(Constantes.nombreDocumentoCliente, Guid.create().toString(), extension);
          this.documentos.push(new Documento(file, nombre));
        }
      });
    }
  }

  private procesarVinMasivos(): void {
    this.data.forEach((element) => {
      for (let index = 0; index < element.length; index++) {
        const vin = String(element[index]);
        if (vin.length === 17) {
          if (this.vinMaestros.find((v) => v.nombre === vin)) {
            this.vinsCargadosExcel.push(new Vin(vin));
          } else {
            this.vinsErradosExcel.push(new Vin(vin));
          }
        } else {
          this.vinsErradosExcel.push(new Vin(vin));
        }
      }
    });
  }

  private cargarVinMasivosFormulario(): void {
    this.vins = [];
    this.idsVinRegistrados.forEach((id) => {
      this.formularioCreacionTicket.removeControl(id);
    });
    this.vinsCargadosExcel.forEach((vinCargado) => {
      vinCargado.indice = this.vins.length + 1;
      this.vins.push(vinCargado);
    });
  }

  private obtenerPropiedadesCorreoEnvioCliente(ticket: Ticket): void {
    const plantilla = this.emailsTemplate.find(p => p.nombre === EmailType.CREATED);
    this.propiedadesCorreo = {
      To: [ticket.emailCliente],
      Subject: plantilla.asunto,
      Body: string2.Format(
        plantilla.body,
        ticket.ticket,
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
        this.mostrarAlertaError('Send email', e);
      });
  }

  private mostrarMensajeExitoso(): void {
    this.spinner.hide();
    this.servicioNotificacion.Exito(
      'Great!',
      'Your request has been sent successfully, you have been assigned ticket: ' +
        this.consecutivoTicket,
      () => this.router.navigate([Constantes.routerMisTickets])
    );
  }

  private mostrarAlertaError(titulo: string, error: any): void {
    this.spinner.hide();
    this.servicioNotificacion.Error(
      string2.Format('Error {0}', titulo),
      'Ha ocurrido un error, inténtelo más tarde o comuniquese con el administrador',
      () => this.router.navigate([Constantes.routerMisTickets])
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
