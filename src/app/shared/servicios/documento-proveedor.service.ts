import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';
import { String } from 'typescript-string-operations';
import { DocumentoSoporte } from '../entidades/documentoSoporte';

@Injectable({
  providedIn: 'root'
})
export class DocumentoProveedorService {

  constructor() { }

  public obtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaDocumentosProveedores)
        .items.orderBy('ID', true)
        .get()
    );
    return respuesta;
  }

  crearCarpetaTicket(ticket: string) {
    const nombreCarpeta: string = String.Format(Constantes.nombreCarpetaTicketProveedores, ticket);
    return Constantes.getConfig(environment.web).web.folders
      .getByName(Constantes.bibliotecaDocumentosProveedores).folders
      .add(nombreCarpeta);
  }

  obtenerDocumentos(ticket: string) {
    const nombreCarpeta: string = String.Format(Constantes.nombreCarpetaTicketProveedores, ticket);
    const rutaCarpeta: string = String.Format('{0}{1}/{2}', Constantes.urlRelativaSitio, Constantes.bibliotecaDocumentosProveedores, nombreCarpeta);
    return Constantes.getConfig(environment.web).web
      .getFolderByServerRelativeUrl(rutaCarpeta).files.expand('ListItemAllFields/FieldValuesAsHtml', 'Files/ListItemAllFields/FieldValuesAsText', 'Author', 'Type')
      .select('*', 'Author/Title', 'Author/EMail',
        'Files/ListItemAllFields/FieldValuesAsText/Type/Id',
        'Files/ListItemAllFields/FieldValuesAsText/Type/Title',
        'ListItemAllFields/Id',
        'ListItemAllFields/TypeId',
        'ListItemAllFields/ShowClient')
      .orderBy('TimeCreated', false)
      .get();
  }

  guardarDocumento(documentoSoporte: DocumentoSoporte, ticket: string) {
    const nombreCarpeta: string = String.Format(Constantes.nombreCarpetaTicketProveedores, ticket);
    const rutaCarpeta: string = String.Format('{0}{1}/{2}', Constantes.urlRelativaSitio, Constantes.bibliotecaDocumentosProveedores, nombreCarpeta);
    return Constantes.getConfig(environment.web).web.getFolderByServerRelativeUrl(rutaCarpeta).files.add(
      documentoSoporte.documento.nombre, documentoSoporte.documento.archivo, true).then(
        (response) => {
          response.file.getItem().then(item => {
            item.update({
              TypeId: documentoSoporte.tipo.id,
              ShowClient: documentoSoporte.mostrarCliente
            });
          });
        });
  }

  actualizarDocumento(idDocumento: number) {
    return Constantes.getConfig(environment.web).web.lists.getByTitle(Constantes.bibliotecaDocumentosProveedores).items.getById(idDocumento).update({
      ShowClient: true
    });
  }

}
