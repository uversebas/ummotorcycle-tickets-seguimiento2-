import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { VinRepeditos } from 'src/app/shared/entidades/vinRepetidos';

@Component({
  selector: 'app-detalle-vin-repetidos',
  templateUrl: './detalle-vin-repetidos.component.html'
})
export class DetalleVinRepetidosComponent implements OnInit {
  public vin: VinRepeditos;
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    setTimeout(() => {

    }, 1);
  }

  public cerrarModal(): void {
    this.bsModalRef.hide();
  }

}
