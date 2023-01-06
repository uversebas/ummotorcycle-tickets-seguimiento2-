import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Constantes } from '../constantes/constantes';
import { Parte } from '../entidades/parte';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PartesService {
  constructor() {}

  public CrearBatch(partes: Parte[], idTicket: number): Promise<void> {
    const listaPartes = Constantes.getConfig(environment.web).web.lists.getByTitle(
      Constantes.listaPartes
    );
    const batch = Constantes.getConfig(environment.web).createBatch();
    const headers = {
      Accept: 'application/json;odata=nometadata',
    };
    partes.forEach((parte) => {
      return listaPartes
        .configure({ headers })
        .items.usingCaching()
        .inBatch(batch)
        .add({
          Title: parte.codigo,
          Quantity: parte.cantidad,
          RequestId: idTicket,
        });
    });
    return batch.execute();
  }

  public obtenerPorTicket(ticketId: number): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaPartes)
        .items
        .filter('RequestId eq ' + ticketId)
        .orderBy('ID', true)
        .get()
    );
    return respuesta;
  }
}
