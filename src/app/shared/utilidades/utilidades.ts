import { Ticket } from '../entidades';
import { ProcessStatus, TicketStatus } from '../enumerados';

export class Utilidades {
  static calcularAvanceTicket(ticket: Ticket): number {
    let avance = 0;
    const estados = 14;
    let progreso = 0;
    if (ticket.estado === TicketStatus.COMPLETED) {
      progreso += 14;
    } else {
      if (ticket.estado === TicketStatus.CREATED || ticket.estado === TicketStatus.REJECTCREATED) {
        progreso += 1;
      } else {
        if (ticket.estado === TicketStatus.ASSIGNED) {
          progreso += 2;
          progreso += Utilidades.progresoProcesos(ticket);
        }
      }
    }
    avance = (progreso / estados) * 100;
    return Math.floor(avance);
  }

  private static progresoProcesos(ticket: Ticket) {
    let progreso = 0;
    if (
      ticket.estadoLibroPartes === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoFotografias === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoManualTecnico === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoHomologacion === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoManualesServicio === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoManualPDI === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoDocumentoEmbarque === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoReporteCalidad === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoSparePartsLabel === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoVinDescription === ProcessStatus.Approved) {
      progreso += 1;
    }  if (
      ticket.estadoVinList === ProcessStatus.Approved) {
      progreso += 1;
    }  if (ticket.estadoManualUsuario === ProcessStatus.Approved) {
      progreso += 1;
    }
    return progreso;
  }

  static agruparPor(list: any, keyGetter: any) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  static DiferenciaEntreFechasEnDias(fechaInicial: Date, fechaFinal: Date): number {
    const diffTime = Math.abs(fechaFinal.getTime() - fechaInicial.getTime());
    return Math.ceil(diffTime / (1000 * 3600 * 24))
  }
}
