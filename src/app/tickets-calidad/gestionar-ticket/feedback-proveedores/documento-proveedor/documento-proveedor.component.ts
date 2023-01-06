import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Guid } from 'guid-typescript';
import { Constantes } from 'src/app/shared/constantes';
import { Documento, DocumentoProveedor } from 'src/app/shared/entidades';
import { DocumentoSoporte } from 'src/app/shared/entidades/documentoSoporte';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-documento-proveedor',
  templateUrl: './documento-proveedor.component.html',
})
export class DocumentoProveedorComponent implements OnInit {
  public documentoForm: FormGroup;
  @Input() submitted: boolean;
  @Input() tiposDocumentos: DocumentoProveedor[];
  @Input() documentoSoporte: DocumentoSoporte;
  @Input() cantidadDocumentos: number;
  @Input() habilitado: boolean;

  @Output() formReady = new EventEmitter();
  @Output() borrar = new EventEmitter();

  public id: string;
  tipoDocumentoSeleccionado: DocumentoProveedor;
  documentoSeleccionado: Documento;

  constructor(private formBuilder: FormBuilder) {
    this.id = this.obtenerId();
  }

  ngOnInit() {
    this.inicializarPlaceholders();
    this.registrarControlesFormulario();
  }

  inicializarPlaceholders(): void {
    this.tipoDocumentoSeleccionado = null;
  }

  registrarControlesFormulario(): void {
    this.documentoForm = this.formBuilder.group({
      tipo: ['', Validators.required],
      documento: ['', Validators.required],
    });
    const documentoProveedor = { id: this.id, form: this.documentoForm };
    this.formReady.emit(documentoProveedor);
    if (!this.habilitado) {
      this.tipoDocumentoSeleccionado = this.tiposDocumentos.find(
        (td) => td.id === this.documentoSoporte.tipo.id
      );
      this.documentoForm.disable();
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.documentoForm.controls;
  }

  obtenerId(): string {
    return Guid.create().toString();
  }

  public eliminar(): void {
    const documentoBorrar = { id: this.id, documento: this.documentoSoporte };
    this.borrar.emit(documentoBorrar);
  }

  public seleccionarTipo(): void {
    this.documentoSoporte.tipo = this.tipoDocumentoSeleccionado;
  }

  public subirDocumento(e: any): void {
    this.documentoSeleccionado = null;
    if (e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file: File) => {
        const extension = file.name.split('.').pop();
        const nombre = String.Format(
          Constantes.nombreDocumentoProveedor,
          Guid.create().toString(),
          extension
        );
        this.documentoSeleccionado = new Documento(file, nombre);
        this.documentoSoporte.documento = this.documentoSeleccionado;
        this.documentoSoporte.mostrarCliente = false;
      });
    }
  }
}
