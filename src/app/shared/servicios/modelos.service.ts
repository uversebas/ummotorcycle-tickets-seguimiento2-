import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes/constantes';
import { String } from 'typescript-string-operations';

@Injectable({
  providedIn: 'root',
})
export class ModelosService {
  selects: string[];
  expands: string[];
  constructor() {
    this.selects = [
      '*',
      'Model/Title',
      'Model/ID',
      'Region/Title',
      'Region/ID',
      'Region/Url',
      'Region/CustomerGroup',
      'Region/AfterSalesGroup',
      'Region/SupportGroup',
    ];
    this.expands = ['Model', 'Region'];
  }

  public obtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaModelos)
        .items.orderBy('Title', true)
        .get()
    );
    return respuesta;
  }

  public ObtenerPorRegion(idRegion: number): Observable<any[]> {
    const filtroConsulta = String.Format(`RegionId eq {0}`, idRegion);
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaMotores)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filtroConsulta)
        .orderBy('Model', true)
        .top(9999)
        .get()
    );
    return respuesta;
  }
}
