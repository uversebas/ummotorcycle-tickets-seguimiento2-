import { AyudaContextual } from './../../../shared/entidades/ayudaContextual';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Guid } from 'guid-typescript';
import { Parte } from 'src/app/shared/entidades/parte';

@Component({
  selector: 'app-parte',
  templateUrl: './parte.component.html'
})
export class ParteComponent implements OnInit {
  public parteForm: FormGroup;
  @Input() submitted: boolean;
  @Input() parte: Parte;
  @Input() cantidadPartes: number;
  @Input() ayudasContextuales: AyudaContextual[] = [];

  @Output() formReady = new EventEmitter();
  @Output() borrar = new EventEmitter();

  public id: string;

  constructor(private formBuilder: FormBuilder) {
    this.id = this.obtenerId();
  }

  ngOnInit() {
    this.registrarControlesFormulario();
  }

  registrarControlesFormulario(): void {
    this.parteForm = this.formBuilder.group({
      numeroParte: ['', Validators.required],
      cantidad: [
        '',
        [Validators.required, Validators.min(0), Validators.max(999)],
      ],
    });
    const parteRegistrar = { id: this.id, form: this.parteForm };
    this.formReady.emit(parteRegistrar);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.parteForm.controls;
  }

  obtenerId(): string {
    return Guid.create().toString();
  }

  public eliminar(): void {
    const parteBorrar = { id: this.id, parte: this.parte };
    this.borrar.emit(parteBorrar);
  }
}
