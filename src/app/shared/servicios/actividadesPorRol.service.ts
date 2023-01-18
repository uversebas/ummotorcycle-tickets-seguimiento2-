import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';

@Injectable({
  providedIn: 'root'
})
export class ActividadesPorRolService {
  selects: string[];
  expands: string[];
  constructor() {
    this.selects = [
      '*',
      'Rol/Title',
      'Rol/ID',
      'Approver/Title',
      'Approver/ID',
    ];
    this.expands = ['Rol', 'Approver'];
  }

  public obtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaRolesActividades)
        .items.select(this.selects.toString()).expand(this.expands.toString()).orderBy('ID', true)
        .top(9999)
        .get()
    );
    return respuesta;
  }

}
