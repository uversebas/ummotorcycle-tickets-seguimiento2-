import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';
import { String } from 'typescript-string-operations';

@Injectable({
  providedIn: 'root',
})
export class MotorService {
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

  public ObtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaMotores)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .orderBy('Title', true)
        .top(9999)
        .get()
    );
    return respuesta;
  }

  public ObtenerPorRegionYModelo(
    idRegion: number,
    idModelo: number
  ): Observable<any[]> {
    const filtroConsulta = String.Format(
      `RegionId eq {0} and ModelId eq {1}`,
      idRegion,
      idModelo
    );
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaMotores)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filtroConsulta)
        .orderBy('ID', false)
        .top(9999)
        .get()
    );
    return respuesta;
  }
}
