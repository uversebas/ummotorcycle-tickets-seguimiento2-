import { AyudaContextual } from './../../../shared/entidades/ayudaContextual';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { MaestroVin } from 'src/app/shared/entidades/maestroVin';
import { Vin } from 'src/app/shared/entidades/vin';

@Component({
  selector: 'app-vin',
  templateUrl: './vin.component.html'
})
export class VinComponent implements OnInit {
  public vinForm: FormGroup;
  @Input() submitted: boolean;
  @Input() vinMaestros: MaestroVin[];
  @Input() cantidadVines: number;
  @Input() vin: Vin;
  @Input() ayudasContextuales: AyudaContextual[] = [];


  @Output() formReady = new EventEmitter();
  @Output() borrar = new EventEmitter();

  public id: string;
  public vinSeleccionado: MaestroVin;

  constructor(private formBuilder: FormBuilder) { 
    this.id = this.obtenerId();
  }

  ngOnInit() {
    this.registrarControlesFormulario();
  }

  registrarControlesFormulario(): void {
    this.vinForm = this.formBuilder.group({
      vin: [this.vin.nombre, Validators.required]
    });
    const vinRegistrar = { id: this.id, form: this.vinForm };
    this.formReady.emit(vinRegistrar);
  }

  get f(): { [key: string]: AbstractControl } {
    return this.vinForm.controls;
  }

  obtenerId(): string {
    return Guid.create().toString();
  }

  public eliminar(): void {
    const vinBorrar = {id: this.id, vin: this.vin};
    this.borrar.emit(vinBorrar);
  }

  public seleccionarVin(vin: MaestroVin): void {
    this.vin.nombre = vin.nombre;
  }

}
