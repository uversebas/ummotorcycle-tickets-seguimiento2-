import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Constantes } from '../constantes/constantes';
import { Vin } from '../entidades/vin';

@Injectable({
  providedIn: 'root'
})
export class VinService {

  constructor() { }

  public obtenerTodosVinMaestros(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaMaestroVin)
        .items.orderBy('ID', true).getAll()
    );
    return respuesta;
  }

  public CrearBatch(
    vins: Vin[],
    idTicket: number
  ): Promise<void> {
    const listaVin = Constantes.getConfig(environment.web).web.lists.getByTitle(
      Constantes.listaVin
    );
    const batch = Constantes.getConfig(environment.web).createBatch();
    const headers = {
      Accept: 'application/json;odata=nometadata',
    };
    vins.forEach((vin) => {
      return listaVin
        .configure({ headers })
        .items.usingCaching()
        .inBatch(batch)
        .add({
          Title: vin.nombre,
          RequestId: idTicket
        });
    });
    return batch.execute();
  }

  public obtenerPorTicket(ticketId: number): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaVin)
        .items.select("*, Request/ID, Request/Ticket, Request/CurrentStatus").expand("Request")
        .filter('RequestId eq ' + ticketId)
        .orderBy('ID', true)
        .get()
    );
    return respuesta;
  }

  public obtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaVin)
        .items.select("*, Request/ID, Request/Ticket, Request/CurrentStatus").expand("Request")
        .orderBy('ID', true)
        .top(9999)
        .get()
    );
    return respuesta;
  }

}
