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
      'MarketingResponsable/Title',
      'MarketingResponsable/ID',
      'MarketingResponsable/EMail',
      'SupportLogiscticResponsable/Title',
      'SupportLogiscticResponsable/ID',
      'SupportLogiscticResponsable/EMail',
      'QualityAssuranceResponsable/Title',
      'QualityAssuranceResponsable/ID',
      'QualityAssuranceResponsable/EMail',
      'AdministratorResponsable/Title',
      'AdministratorResponsable/ID',
      'AdministratorResponsable/EMail',
    ];
    this.expands = ['Author', 'MarketingResponsable', 'SupportLogiscticResponsable', 'QualityAssuranceResponsable', 'AdministratorResponsable'];
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

  public obtenerTicketsComercial(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`AuthorId eq {0}`, usuario.id)
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

  public obtenerTicketsCalidad(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`QualityAssuranceResponsableId eq {0}`, usuario.id)
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

  public obtenerTicketsMarketing(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`MarketingResponsableId eq {0}`, usuario.id)
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

  public obtenerTicketsSoporte(): Observable<any[]> {
    const usuario: Usuario = JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual));
    const filter = String.Format(`SupportLogiscticResponsableId eq {0} `, usuario.id)
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
    const filter = String.Format(`AfterSalesResponsibleId eq {0} and (Status eq {1} or Status eq {2} or Status eq {3})`, usuario.id, `'${TicketStatus.ASSIGNED}'`, `'${TicketStatus.ASSIGNED}'`, `'${TicketStatus.ASSIGNED}'`)
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
        Title: ticket.orden,
        Country: ticket.pais,
        Date: ticket.fecha
      });
  }

  public asignarResponsables(ticket: Ticket, usuarioActual: Usuario): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
        MarketingResponsableId: ticket.usuarioMarketing.id,
        SupportLogiscticResponsableId: ticket.usuarioSoporteLogistica.id,
        QualityAssuranceResponsableId: ticket.usuarioCalidad.id,
        AdministratorResponsableId: usuarioActual.id
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

  public reEnviarTicket(
    ticket: Ticket
  ): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({
        Status: ticket.estado,
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

  public rechazoGeneral(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      Status: ticket.estado
    });
  }

  public rechazoManualUsuario(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      UserManualsStatus: ticket.estadoManualUsuario
    });
  }

  public rechazoVinList(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      VinListStatus: ticket.estadoVinList
    });
  }

  public rechazoVinDescription(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      VinDescriptionStatus: ticket.estadoVinDescription
    });
  }

  public rechazoSparePartsLabel(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      SparePartsLabelingStatus: ticket.estadoSparePartsLabel
    });
  }

  public rechazoReporteCalidad(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      QualityReportStatus: ticket.estadoReporteCalidad
    });
  }

  public rechazoDocumentoEmbarque(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      ShippingDocumentsStatus: ticket.estadoDocumentoEmbarque
    });
  }

  public rechazoManualPDI(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      PDIManualsStatus: ticket.estadoManualPDI
    });
  }

  public rechazoManualesServicio(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      ServiceManualsStatus: ticket.estadoManualesServicio
    });
  }

  public rechazoHomologacion(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      HomologationStatus: ticket.estadoHomologacion
    });
  }

  public rechazoManualTecnico(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      DataSheetStatus: ticket.estadoManualTecnico
    });
  }

  public rechazoFotografias(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      PhotographsStatus: ticket.estadoFotografias
    });
  }

  public rechazoLibroPartes(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      PartsBookStatus: ticket.estadoLibroPartes
    });
  }

  public rechazoFactoryPI(
    ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      Comments: comentario,
      FactoryPIStatus: ticket.estadoFactoryPi
    });
  }

  public enviarManualUsuario(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      UserManualsStatus: ticket.estadoManualUsuario,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarVinList(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      VinListStatus: ticket.estadoVinList,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarVinDescription(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      VinDescriptionStatus: ticket.estadoVinDescription,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarSparePartsLabel(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      SparePartsLabelingStatus: ticket.estadoSparePartsLabel,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarReporteCalidad(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      QualityReportStatus: ticket.estadoReporteCalidad,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarDocumentoEmbarque(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      ShippingDocumentsStatus: ticket.estadoDocumentoEmbarque,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarManualPDI(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      PDIManualsStatus: ticket.estadoManualPDI,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarManualesServicio(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      ServiceManualsStatus: ticket.estadoManualesServicio,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarHomologacion(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      HomologationStatus: ticket.estadoHomologacion,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarManualTecnico(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      DataSheetStatus: ticket.estadoManualTecnico,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarFotografias(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      PhotographsStatus: ticket.estadoFotografias,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarLibroPartes(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      PartsBookStatus: ticket.estadoLibroPartes,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
    });
  }

  public enviarFactoryPI(
    ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
    .web.lists.getByTitle(Constantes.listaTicket)
    .items.getById(ticket.id)
    .update({
      FactoryPIStatus: ticket.estadoFactoryPi,
      Status: ticket.estado,
      ApproveComment: ticket.comentarioAprobacionAutomarica
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

      });
  }

  public asignarUsuarioSoporte(ticket: Ticket, comentario: string): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({

      });
  }

  public actualizarFeedbackProveedor(ticket: Ticket): Promise<IItemUpdateResult> {
    return Constantes.getConfig(environment.web)
      .web.lists.getByTitle(Constantes.listaTicket)
      .items.getById(ticket.id)
      .update({

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
