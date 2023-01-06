import { TicketStatus } from '../enumerados/ticketStatus';

export class Utilidades {
  static calcularAvanceTicket(estadoTicket: TicketStatus): number {
    let avance = 0;
    const estados = Object.values(TicketStatus);
    avance = ((estados.indexOf(estadoTicket) + 1) / estados.length) * 100;
    return Math.floor(avance);
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
