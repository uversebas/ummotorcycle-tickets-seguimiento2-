import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Documento, DocumentoProveedor, Ticket } from 'src/app/shared/entidades';
import { DocumentoSoporte } from 'src/app/shared/entidades/documentoSoporte';
import { DocumentoProveedorService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-ver-solucion-cliente',
  templateUrl: './ver-solucion-cliente.component.html'
})
export class VerSolucionClienteComponent implements OnInit {
  formularioSolucion: FormGroup;
  public tiposDocumentos: DocumentoProveedor[] = [];
  public documentosSoporte: DocumentoSoporte[] = [];
  public documentosCliente: DocumentoSoporte[] = [];
  public tipoDocumentoSeleccionado: DocumentoProveedor;

  @Input() ticket: Ticket;
  constructor(
    private documentosProveedoresServicio: DocumentoProveedorService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.obtenerTiposDocumentos();
    this.registrarConstrolesFormulario();
  }

  public obtenerTipoDocumento(idTipoDocumento: number) {
    return this.tiposDocumentos.find(td => td.id === idTipoDocumento).nombre;
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
        this.documentosCliente = this.documentosSoporte.filter(d => d.mostrarCliente);
        this.spinner.hide();
      });
  }

  private registrarConstrolesFormulario(): void {
    this.formularioSolucion = this.formBuilder.group({
      comentario: [this.ticket.comentarioSolucion]
    });
    this.formularioSolucion.disable();
  }

}
