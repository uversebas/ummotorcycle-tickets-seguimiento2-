import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes/constantes';

@Injectable({
  providedIn: 'root',
})
export class FallosService {
  constructor() {}

  public obtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTipoFallas)
        .items.orderBy('Title', true)
        .get()
    );
    return respuesta;
  }
}
