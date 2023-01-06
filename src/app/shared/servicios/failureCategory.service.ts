import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';

@Injectable({
  providedIn: 'root'
})
export class FailureCategoryService {

constructor() { }

public obtenerTodos(): Observable<any[]> {
  const respuesta = from(
    Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaCategoriasFallas)
      .items.orderBy('ID', true).get()
  );
  return respuesta;
}

}
