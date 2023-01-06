import { Comentario } from 'src/app/shared/entidades';
import { Falla } from './falla';
import { Modelo } from './modelo';
import { IAttachmentInfo } from '@pnp/sp/attachments';
import { Constantes } from '../constantes';
import { TicketStatus } from '../enumerados/ticketStatus';
import { RegionSetting } from './regionSetting';
import { Usuario } from './usuario';
import { Documento } from '.';
import { Utilidades } from '../utilidades/utilidades';
import { Factory } from './factory';
import { FailureCategory } from './failureCategory';

export class Ticket {
  public region: RegionSetting;
  public nombreCliente: string;
  public apellidoCliente: string;
  public emailCliente: string;
  public asunto: string;
  public numeroPi: string;
  public motorCC: string;
  public descripcionFalla: string;
  public posibleSolucion: string;
  public fallo: Falla;
  public modelo: Modelo;
  public id?: number;
  public numeroConsecutivo?: number;
  public ticket?: string;
  public imagenes: string[];
  public usuarioPostVenta: Usuario;
  public usuarioSoporte: Usuario;
  public estado: TicketStatus;
  public documentosCliente: Documento[];
  public documentosCreacionTicket: Documento[];
  public creador?: Usuario;
  public fechaCreacion?: Date;
  public comentario?: Comentario;
  public comentarioSolucion?: string;
  public fechaAsignacionPostventa?: Date;
  public fechaAsignacionSoporte?: Date;
  public fechaResuelto?: Date;
  public tiempoProceso?: number;
  public fabrica?: Factory;
  public categoriaFalla?: FailureCategory;

  constructor(
    region: RegionSetting,
    nombreCliente: string,
    apellidoCliente: string,
    emailCliente: string,
    asunto: string,
    numeroPi: string,
    motorCC: string,
    descripcionFalla: string,
    posibleSolucion: string,
    fallo: Falla,
    modelo: Modelo,
    id?: number
  ) {
    this.region = region;
    this.nombreCliente = nombreCliente;
    this.apellidoCliente = apellidoCliente;
    this.emailCliente = emailCliente;
    this.asunto = asunto;
    this.numeroPi = numeroPi;
    this.motorCC = motorCC;
    this.descripcionFalla = descripcionFalla;
    this.posibleSolucion = posibleSolucion;
    this.fallo = fallo;
    this.modelo = modelo;
    this.id = id;
    this.imagenes = [];
    this.documentosCliente = [];
    this.documentosCreacionTicket = [];
  }

  public static fromJson(element: any): Ticket {
    let region: RegionSetting = null;
    let fallo: Falla = null;
    let modelo: Modelo = null;
    let usuarioPostVenta: Usuario = new Usuario('');
    let usuarioSoporte: Usuario = new Usuario('');
    let fechaFinalProceso = new Date();
    let fabrica: Factory = null;
    let categoria: FailureCategory = null;

    if (element.RegionId != null) {
      region = new RegionSetting(
        element.Region.Title,
        element.Region.RegionCode,
        element.Region.Url,
        element.RegionCustomerGroup,
        element.Region.AfterSalesGroup,
        element.Region.SupportGroup,
        element.Region.ID
      );
    }
    if (element.FailureTypeId != null) {
      fallo = new Falla(element.FailureType.Title, element.FailureType.ID);
    }
    if (element.ModelId != null) {
      modelo = new Modelo(element.Model.Title, element.Model.ID);
    }
    if (element.SupportResponsibleId != null) {
      usuarioSoporte.nombre = element.SupportResponsible.Title;
      usuarioSoporte.id = element.SupportResponsible.ID;
      usuarioSoporte.email = element.SupportResponsible.EMail;
    }
    if (element.AfterSalesResponsibleId != null) {
      usuarioPostVenta.nombre = element.AfterSalesResponsible.Title;
      usuarioPostVenta.id = element.AfterSalesResponsible.ID;
      usuarioPostVenta.email = element.AfterSalesResponsible.EMail;
    }

    if (element.FailureCategoryId != null) {
      categoria = new FailureCategory(element.FailureCategory.Title, element.FailureCategory.ID);
    }

    if (element.FactoryId != null) {
      fabrica = new Factory(element.Factory.Title, element.Factory.ID);
    }

    const ticket = new Ticket(
      region,
      element.CustomerName,
      element.CustomerLastName,
      element.CustomerEmail,
      element.Subject,
      element.PINumber,
      element.EngineCC,
      element.FailureDescription,
      element.PossibleSolution,
      fallo,
      modelo,
      element.ID
    );
    ticket.estado = element.Status;
    ticket.numeroConsecutivo = element.ConsecutiveNumber;
    ticket.ticket = element.Ticket;
    element.AttachmentFiles.results.forEach((adjunto: IAttachmentInfo) => {
      const esImagen = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(
        adjunto.FileName
      );
      esImagen
        ? ticket.imagenes.push(Constantes.urlSite + adjunto.ServerRelativeUrl)
        : this.gestionarDocumentos(ticket, adjunto);
    });
    ticket.usuarioPostVenta = usuarioPostVenta;
    ticket.usuarioSoporte = usuarioSoporte;
    ticket.creador = new Usuario(
      element.Author.Title,
      element.Author.ID,
      element.Author.EMail
    );
    ticket.fechaCreacion = new Date(element.Created);
    ticket.comentarioSolucion = element.SolutionComment;
    if (element.AfterSalesAssignmentDate) {
      ticket.fechaAsignacionPostventa = element.AfterSalesAssignmentDate;
    }
    if (element.SupportAssignmentDate) {
      ticket.fechaAsignacionSoporte = element.SupportAssignmentDate;
    }
    if (element.ResolveDate) {
      ticket.fechaResuelto = element.ResolveDate;
      fechaFinalProceso = new Date(ticket.fechaResuelto);
    }
    ticket.tiempoProceso = Utilidades.DiferenciaEntreFechasEnDias(ticket.fechaCreacion, fechaFinalProceso);
    ticket.categoriaFalla = categoria;
    ticket.fabrica = fabrica;
    return ticket;
  }

  private static gestionarDocumentos(ticket: Ticket, documento: IAttachmentInfo): void {
    if (documento.FileName.startsWith('CR-TICKET')) {
      ticket.documentosCreacionTicket.push(
        new Documento(
          null,
          documento.FileName,
          Constantes.urlSite + documento.ServerRelativeUrl
        )
      );
    } else {
      ticket.documentosCliente.push(
        new Documento(
          null,
          documento.FileName,
          Constantes.urlSite + documento.ServerRelativeUrl
        )
      );
    }
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
