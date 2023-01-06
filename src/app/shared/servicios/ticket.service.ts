import { FiltroConsulta } from './../entidades/filtroConsulta';
import { Documento, Ticket } from 'src/app/shared/entidades';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import {
  IAttachmentAddResult,
  IAttachmentFileInfo,
  IAttachmentInfo,
} from '@pnp/sp/attachments';
import { IItemAddResult, IItemUpdateResult } from '@pnp/sp/items';
import { from, Observable } from 'rxjs';
import { Constantes } from '../constantes/constantes';
import { Usuario } from '../entidades';
import { String } from 'typescript-string-operations';
import { TicketStatus } from '../enumerados';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  selects: string[];
  expands: string[];

  constructor() {
    this.selects = [
      '*',
      'Author/Title',
      'Author/ID',
      'Author/EMail',
      'Attachments',
      'AttachmentFiles',
      'FailureType/Title',
      'FailureType/ID',
      'Model/Title',
      'Model/ID',
      'Region/Title',
      'Region/ID',
      'Region/Url',
      'Region/CustomerGroup',
      'Region/AfterSalesGroup',
      'Region/SupportGroup',
      'AfterSalesResponsible/Title',
      'AfterSalesResponsible/ID',
      'AfterSalesResponsible/EMail',
      'SupportResponsible/Title',
      'SupportResponsible/ID',
      'SupportResponsible/EMail',
      'Factory/Title',
      'Factory/ID',
      'FailureCategory/Title',
      'FailureCategory/ID'
    ];
    this.expands = ['Author', 'FailureType', 'Model', 'Region', 'AttachmentFiles', 'AfterSalesResponsible', 'SupportResponsible', 'Factory', 'FailureCategory'];
  }

  public ObtenerTodos(): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .orderBy('ID', false)
        .top(9999)
        .get()
    );
    return respuesta;
  }

  public MisTickets(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter('AuthorId eq ' + usuario.id)
        .orderBy('ID', false)
        .get()
    );
    return respuesta;
  }

  public obtenerTicketsSoporte(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`SupportResponsibleId eq {0} and (Status eq {1})`, usuario.id, `'${TicketStatus.ASSIGNEDTOSUPPORT}'`)
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filter)
        .orderBy('ID', false)
        .get()
    );
    return respuesta;
  }

  public obtenerTicketsPostVentas(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`AfterSalesResponsibleId eq {0} and (Status eq {1} or Status eq {2} or Status eq {3})`, usuario.id, `'${TicketStatus.ASSIGNEDAFTERSALES}'`, `'${TicketStatus.SUPPLIERS}'`, `'${TicketStatus.WATINGFORCUSTOMER}'`)
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filter)
        .orderBy('ID', false)
        .get()
    );
    return respuesta;
  }

  public obtenerUltimoTicketPorNumeroPI(
    ticketId: number,
    numeroPI: string
  ): Promise<Ticket> {
    return new Promise<Ticket>((resolve, reject) => {
      const filtroConsulta = String.Format(`PINumber eq '{0}'`, numeroPI);
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filtroConsulta)
        .orderBy('ID', false)
        .get()
        .then((respuesta) => {
          const tickets = Ticket.fromJsonList(respuesta);
          const ticketsFiltrados = tickets.filter(
            (item) => item.id !== ticketId
          );
          resolve(ticketsFiltrados[0]);
        })
        .catch((error) => reject(error));
    });
  }

  public agregar(ticket: Ticket): Promise<IItemAddResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.add({
        CustomerName: ticket.nombreCliente,
        CustomerLastName: ticket.apellidoCliente,
        CustomerEmail: ticket.emailCliente,
        Subject: ticket.asunto,
        PINumber: ticket.numeroPi,
        EngineCC: ticket.motorCC,
        FailureDescription: ticket.descripcionFalla,
        PossibleSolution: ticket.posibleSolucion,
        FailureTypeId: ticket.fallo.id,
        ModelId: ticket.modelo.id,
        RegionId: ticket.region.id,
        Status: ticket.estado,
        Tracing: ticket.comentario.valor
      });
  }

  public AsignarConsecutivo(
    ticketId: number,
    consecutivo: number
  ): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticketId)
      .update({
        ConsecutiveNumber: consecutivo,
      });
  }

  public agregarComentario(
    ticketId: number,
    comentario: string
  ): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticketId)
      .update({
        Tracing: comentario,
      });
  }

  public guardarAdjuntosCreacionTicket(ticketId: number, imagenes: File[], documentos: Documento[]): Promise<void> {
    const fileInfo: IAttachmentFileInfo[] = [];
    imagenes.forEach((imagen) => {
      fileInfo.push({
        name: imagen.name,
        content: imagen,
      });
    });
    documentos.forEach((documento) => {
      fileInfo.push({ name: documento.nombre, content: documento.archivo });
    });
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticketId)
      .attachmentFiles.addMultiple(fileInfo);
  }

  public revicionAprobacion(
    ticket: Ticket,
    comentario: string
  ): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        Tracing: comentario,
        TracingReviewApproval: comentario,
        FactoryId: ticket.fabrica?.id,
        FailureCategoryId: ticket.categoriaFalla?.id
      });
  }

  public guardarDocumentoCliente(
    ticketId: number,
    documento: Documento
  ): Promise<IAttachmentAddResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticketId)
      .attachmentFiles.add(documento.nombre, documento.archivo);
  }

  public ObtenerPorId(id: number): Observable<any[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter('ID eq ' + id)
        .top(1)
        .get()
    );
    return respuesta;
  }

  public ObtenerAdjuntos(id: number): Observable<IAttachmentInfo[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.getById(id)
        .attachmentFiles.get()
    );
    return respuesta;
  }

  public asignarPostVentas(ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        AfterSalesResponsibleId: ticket.usuarioPostVenta.id,
        Tracing: ticket.comentario.valor,
        AfterSalesAssignmentDate: new Date()
      });
  }

  public asignarUsuarioSoporte(ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        SupportResponsibleId: ticket.usuarioSoporte.id,
        Tracing: comentario,
        TracingReviewApproval: comentario,
        SupportAssignmentDate: new Date(),
        FactoryId: ticket.fabrica?.id,
        FailureCategoryId: ticket.categoriaFalla?.id
      });
  }

  public actualizarFeedbackProveedor(ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        Tracing: ticket.comentario.valor
      });
  }

  public solicionTicket(
    ticket: Ticket,
    comentario: string
  ): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        Tracing: comentario,
        SolutionComment: comentario,
        ResolveDate: new Date()
      });
  }

  public Filtrar(filtro: FiltroConsulta): Observable<any[]> {
    let filtroConsulta = String.Empty;
    if (filtro.regionId) {
      filtroConsulta = String.Format('RegionId eq {0} and ', filtro.regionId);
    }
    if (filtro.modeloId) {
      filtroConsulta += String.Format('ModelId eq {0} and ', filtro.modeloId);
    }
    if (filtro.motorCC) {
      filtroConsulta += String.Format(`EngineCC eq '{0}' and `, filtro.motorCC);
    }
    if (filtro.tipoFallaId) {
      filtroConsulta += String.Format(
        'FailureTypeId eq {0} and ',
        filtro.tipoFallaId
      );
    }
    filtroConsulta = filtroConsulta.slice(0, -4).trim();
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filtroConsulta)
        .orderBy('ID', false)
        .get()
    );
    return respuesta;
  }

  public ObtenerPorRegionYEstado(
    region: string,
    estado: string
  ): Observable<any[]> {
    const filtroConsulta = String.Format(
      `Region/Title eq '{0}' and Status eq '{1}'`,
      region,
      estado
    );
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.lists.getByTitle(Constantes.listaTicket)
        .items.select(this.selects.toString())
        .expand(this.expands.toString())
        .filter(filtroConsulta)
        .orderBy('ID', false)
        .get()
    );
    return respuesta;
  }
}
