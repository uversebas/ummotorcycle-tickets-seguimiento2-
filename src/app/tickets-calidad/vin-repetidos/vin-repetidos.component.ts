import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { AppSettings } from 'src/app/shared/constantes';
import { Vin } from 'src/app/shared/entidades';
import { TicketPorVin, VinRepeditos } from 'src/app/shared/entidades/vinRepetidos';
import { TicketStatus } from 'src/app/shared/enumerados';
import { VinService } from 'src/app/shared/servicios';
import { DetalleVinRepetidosComponent } from './detalle-vin-repetidos/detalle-vin-repetidos.component';

@Component({
  selector: 'app-vin-repetidos',
  templateUrl: './vin-repetidos.component.html'
})
export class VinRepetidosComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  public vins: Vin[] = [];
  public vinsRepetidos: VinRepeditos[] = [];

  bsModalRef: BsModalRef;
  constructor(
    private servicioVin: VinService,
    private spinner: NgxSpinnerService,
    private servicioModal: BsModalService
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.configurarDataTable();
    this.consultarVins();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private configurarDataTable(): void {
    this.dtOptions = AppSettings.obtenerConfiguracionTablaGeneral();
  }

  private consultarVins(): void {
    this.servicioVin.obtenerTodos().subscribe(respuesta => {
      this.vins = Vin.fromJsonList(respuesta).filter(v => v.ticketStatus !== TicketStatus.RESOLVED);
      const distincVins = [...new Map(this.vins.map((v) => [v["nombre"], v])).values()];
      const vinsAgrupados = this.groupBy(this.vins, vin => vin.nombre);
      distincVins.forEach(vin => {
        const vinsPorTicket = [...new Map(vinsAgrupados.get(vin.nombre).map((item) => [item["idTicket"], item])).values()] as Vin[];
        if (vinsPorTicket.length > 1) {
          let vinRepetido = new VinRepeditos(vin.nombre, vinsPorTicket.map(l => new TicketPorVin(l.idTicket, l.pinNumberTicket)));
          this.vinsRepetidos.push(vinRepetido);
        };
      });
      this.dtTrigger.next();
      this.spinner.hide();
    });
  }


  private groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  public mostrarTickets(vin: VinRepeditos): void {
    this.bsModalRef = this.servicioModal.show(DetalleVinRepetidosComponent);
    this.bsModalRef.content.vin = vin;
  }

}
