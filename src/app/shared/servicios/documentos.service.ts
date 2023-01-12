import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constantes } from '../constantes';
import { String } from 'typescript-string-operations';
import { DocumentoSoporte } from '../entidades/documentoSoporte';
import { Documento, DocumentoCargado, Ticket } from '../entidades';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {

  constructor() { }

  crearCarpetaTicket(orden: string, biblioteca: string) {
    return Constantes.getConfig(environment.web).web.folders
      .getByName(biblioteca).folders
      .add(orden);
  }

  obtenerDocumentos2(ticket: string) {
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

  agregarArchivos(ticket: Ticket, nombreBliblioteca: string,  documentos: Documento[]) {
    const rutaCarpeta: string = String.Format('{0}{1}/{2}', Constantes.urlRelativaSitio, nombreBliblioteca, ticket.orden);
    const batch = Constantes.getConfig(environment.web).createBatch();
    documentos.forEach((documento: Documento) => {
      return Constantes.getConfig(environment.web).web.getFolderByServerRelativeUrl(rutaCarpeta).files
        .add(documento.archivo.name, documento.archivo, true).then(
          (respuestaAdjunto) => {
            respuestaAdjunto.file.getItem().then(item => {
              item.update({
              });
            });
          });
    });
    return batch.execute();
  }

  obtenerDocumentos(ticket: Ticket, nombreBiblioteca: string) {
    const rutaCarpeta: string = String.Format('{0}{1}/{2}', Constantes.urlRelativaSitio, nombreBiblioteca, ticket.orden);
    return Constantes.getConfig(environment.web).web
      .getFolderByServerRelativeUrl(rutaCarpeta).files.expand('ListItemAllFields/FieldValuesAsHtml', 'Files/ListItemAllFields/FieldValuesAsText', 'Author', 'Ticket')
      .select('*', 'Author/Title', 'Author/EMail',
        'Files/ListItemAllFields/FieldValuesAsText/Ticket/Id',
        'Files/ListItemAllFields/FieldValuesAsText/Ticket/Title',
        'ListItemAllFields/Id',
        'ListItemAllFields/TicketId')
      .orderBy('TimeCreated', false)
      .get();
  }

  eliminarArchivos(ticket: Ticket, nombreBliblioteca: string,  documentos: DocumentoCargado[]) {
    const rutaCarpeta: string = String.Format('{0}{1}/{2}', Constantes.urlRelativaSitio, nombreBliblioteca, ticket.orden);
    const batch = Constantes.getConfig(environment.web).createBatch();
    documentos.forEach((documento: DocumentoCargado) => {
      return Constantes.getConfig(environment.web).web.getFileByUrl(documento.documento.url).delete();
    });
    return batch.execute();
  }

  actualizarDocumento(idDocumento: number) {
    return Constantes.getConfig(environment.web).web.lists.getByTitle(Constantes.bibliotecaDocumentosProveedores).items.getById(idDocumento).update({
      ShowClient: true
    });
  }

}
