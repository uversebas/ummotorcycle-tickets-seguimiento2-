import { IAttachmentInfo } from '@pnp/sp/attachments';
import { Constantes } from '../constantes';
import { Usuario } from './usuario';
import { Documento } from '.';
import { ProcessStatus, TicketStatus } from '../enumerados';

export class Ticket {
  public orden: string;
  public pais: string;
  public fecha: Date;
  public fechaCreacion?: Date;
  public creador?: Usuario;
  public id?: number;

  public estado: TicketStatus;

  public estadoManualUsuario: ProcessStatus;
  public estadoVinList: ProcessStatus;
  public estadoVinDescription: ProcessStatus;
  public estadoSparePartsLabel: ProcessStatus;
  public estadoReporteCalidad: ProcessStatus;
  public estadoDocumentoEmbarque: ProcessStatus;
  public estadoManualPDI: ProcessStatus;
  public estadoManualesServicio: ProcessStatus;
  public estadoHomologacion: ProcessStatus;
  public estadoManualTecnico: ProcessStatus;
  public estadoFotografias: ProcessStatus;
  public estadoLibroPartes: ProcessStatus;



  public usuarioMarketing?: Usuario;
  public usuarioSoporteLogistica?: Usuario;
  public usuarioCalidad?: Usuario;
  public usuarioAdministrador?: Usuario;

  public comentarioAprobacionAutomarica?: string;

  constructor(
    orden: string,
    pais: string,
    fecha: Date,
    id?: number,
    fechaCreacion?: Date,
    creador?: Usuario
  ) {
    this.orden = orden;
    this.pais = pais;
    this.fecha = fecha;
    this.fechaCreacion = fechaCreacion;
    this.creador = creador;
    this.id = id;

  }

  public static fromJson(element: any): Ticket {
    const creador = new Usuario(
      element.Author.Title,
      element.Author.ID,
      element.Author.EMail
    );

    let usuarioMarketing: Usuario = new Usuario('');
    if (element.MarketingResponsableId != null) {
      usuarioMarketing.nombre = element.MarketingResponsable.Title;
      usuarioMarketing.id = element.MarketingResponsable.ID;
      usuarioMarketing.email = element.MarketingResponsable.EMail;
    }

    let usuarioSoporte: Usuario = new Usuario('');
    if (element.SupportLogiscticResponsableId != null) {
      usuarioSoporte.nombre = element.SupportLogiscticResponsable.Title;
      usuarioSoporte.id = element.SupportLogiscticResponsable.ID;
      usuarioSoporte.email = element.SupportLogiscticResponsable.EMail;
    }

    let usuarioCalidad: Usuario = new Usuario('');
    if (element.QualityAssuranceResponsableId != null) {
      usuarioCalidad.nombre = element.QualityAssuranceResponsable.Title;
      usuarioCalidad.id = element.QualityAssuranceResponsable.ID;
      usuarioCalidad.email = element.QualityAssuranceResponsable.EMail;
    }

    let usuarioAdministrador: Usuario = new Usuario('');
    if (element.AdministratorResponsableId != null) {
      usuarioAdministrador.nombre = element.AdministratorResponsable.Title;
      usuarioAdministrador.id = element.AdministratorResponsable.ID;
      usuarioAdministrador.email = element.AdministratorResponsable.EMail;
    }

    const fechaCreacion = new Date(element.Created);
    const fecha = new Date(element.Date);
    const ticket = new Ticket(
      element.Title,
      element.Country,
      fecha,
      element.ID,
      fechaCreacion,
      creador
    );

    ticket.estado = element.Status;
    
    ticket.estadoManualUsuario = element.UserManualsStatus;
    ticket.estadoVinList = element.VinListStatus;
    ticket.estadoVinDescription = element.VinDescriptionStatus;
    ticket.estadoSparePartsLabel = element.SparePartsLabelingStatus;
    ticket.estadoReporteCalidad = element.QualityReportStatus;
    ticket.estadoDocumentoEmbarque = element.ShippingDocumentsStatus;
    ticket.estadoManualPDI = element.PDIManualsStatus;
    ticket.estadoManualesServicio = element.ServiceManualsStatus;
    ticket.estadoHomologacion = element.HomologationStatus;
    ticket.estadoManualTecnico = element.DataSheetStatus;
    ticket.estadoFotografias = element.PhotographsStatus;
    ticket.estadoLibroPartes = element.PartsBookStatus;

    ticket.usuarioAdministrador = usuarioAdministrador;
    ticket.usuarioMarketing = usuarioMarketing;
    ticket.usuarioSoporteLogistica = usuarioSoporte;
    ticket.usuarioCalidad = usuarioCalidad;

    return ticket;
  }


  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
