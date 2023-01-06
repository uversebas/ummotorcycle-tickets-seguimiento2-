import { Injectable } from '@angular/core';
import { IEmailProperties } from '@pnp/sp/sputilities';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {

constructor() { }

public Enviar(propiedades: IEmailProperties): Promise<void> {
  return Constantes.getConfig(environment.web).utility.sendEmail(propiedades);
}

public obtenerEmails(): Observable<any[]> {
  const respuesta = from(
    Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaPlantillaEmails)
      .items.orderBy('ID', true)
      .get()
  );
  return respuesta;
}

}
