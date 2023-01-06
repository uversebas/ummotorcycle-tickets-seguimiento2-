import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Constantes } from '../constantes';
import { RegionSetting } from '../entidades';

@Injectable({
  providedIn: 'root',
})
export class RegionSettingService {

  constructor() {}

  public obtenerTodos(): Promise<RegionSetting[]> {
    return new Promise<RegionSetting[]>((resolve, reject) => {
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaConfiguracionRegiones)
        .items.orderBy('Title', true)
        .get()
        .then((respuesta) => {
          const lista = RegionSetting.fromJsonList(respuesta);
          resolve(lista);
        })
        .catch((error) => reject(error));
    });
  }
}
