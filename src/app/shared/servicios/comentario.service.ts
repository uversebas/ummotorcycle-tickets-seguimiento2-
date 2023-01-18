import { Injectable } from '@angular/core';
import { IItemUpdateResult } from '@pnp/sp/items';
import { Constantes } from '../constantes';
import { Comentario } from '../entidades';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  selects: string[] = [
    'Editor',
    'Comments',
    'OData__x005f_UIVersionString',
    'Created',
    'Status',
  ];

  selectsAprobador: string[] = [
    'Editor',
    'ApproveComment',
    'OData__x005f_UIVersionString',
    'Created',
    'Status',
  ];

  constructor() {}

  Obtener(
    idTicket: number,
    lista: string
  ): Promise<Comentario[]> {
    return new Promise<Comentario[]>((resolve, reject) => {
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(lista)
        .items.getById(idTicket)
        .versions.select(this.selects.toString())
        .get()
        .then((respuesta) => {
          const comentarios: Comentario[] = Array() as Comentario[];
          respuesta.forEach((elemento: any) => {
            const fechaCreacionComentario: Date = new Date(elemento.Created);
            fechaCreacionComentario.setHours(
              fechaCreacionComentario.getHours() - 5
            );
            if (elemento.Comments) {
              comentarios.push({
                valor: elemento.Comments,
                version: elemento.OData__x005f_UIVersionString,
                fechaCreacion: fechaCreacionComentario,
                autor: elemento.Editor.LookupValue,
                emailAutor: elemento.Editor.Email,
                estado: elemento.Status,
              });
            }
          });
          resolve(comentarios);
        })
        .catch((error) => reject(error));
    });
  }

  obtenerComentariosAprobacion(idTicket: number,
    lista: string): Promise<Comentario[]> {
      return new Promise<Comentario[]>((resolve, reject) => {
        Constantes.getConfig(environment.web)
          .web.lists.getByTitle(lista)
          .items.getById(idTicket)
          .versions.select(this.selectsAprobador.toString())
          .get()
          .then((respuesta) => {
            const comentarios: Comentario[] = Array() as Comentario[];
            respuesta.forEach((elemento: any) => {
              const fechaCreacionComentario: Date = new Date(elemento.Created);
              fechaCreacionComentario.setHours(
                fechaCreacionComentario.getHours() - 5
              );
              if (elemento.ApproveComment) {
                comentarios.push({
                  valor: elemento.ApproveComment,
                  version: elemento.OData__x005f_UIVersionString,
                  fechaCreacion: fechaCreacionComentario,
                  autor: elemento.Editor.LookupValue,
                  emailAutor: elemento.Editor.Email,
                  estado: elemento.Status,
                });
              }
            });
            resolve(comentarios);
          })
          .catch((error) => reject(error));
      });
    }

  ObtenerComentariosParaCliente(
    idTicket: number
  ): Promise<Comentario[]> {
    return new Promise<Comentario[]>((resolve, reject) => {
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.getById(idTicket)
        .versions.select(this.selects.toString())
        .get()
        .then((respuesta) => {
          const comentarios: Comentario[] = Array() as Comentario[];
          respuesta.forEach((elemento: any) => {
            const fechaCreacionComentario: Date = new Date(elemento.Created);
            fechaCreacionComentario.setHours(
              fechaCreacionComentario.getHours() - 5
            );
            if (elemento.TracingReviewApproval) {
              comentarios.push({
                valor: elemento.TracingReviewApproval,
                version: elemento.OData__x005f_UIVersionString,
                fechaCreacion: fechaCreacionComentario,
                autor: elemento.Editor.LookupValue,
                emailAutor: elemento.Editor.Email,
                estado: elemento.Status,
              });
            }
          });
          resolve(comentarios);
        })
        .catch((error) => reject(error));
    });
  }

  Agregar(
    comentario: Comentario,
    idTicket: number,
    lista: string
  ): Promise<IItemUpdateResult> {
    let objComentario: any;
    objComentario = {
      Tracing: comentario.valor,
    };
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(lista)
      .items.getById(idTicket)
      .update(objComentario);
  }
}
