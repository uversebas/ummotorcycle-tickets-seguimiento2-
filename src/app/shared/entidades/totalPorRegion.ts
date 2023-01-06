import { Ticket } from './ticket';
export class TotalPorRegion {
  public nombreRegion: string;
  public total: number;
  public tickets: Ticket[] = [];

  constructor(nombreRegion: string, total: number, tickets: Ticket[]) {
    this.nombreRegion = nombreRegion;
    this.total = total;
    this.tickets = tickets;
  }
}
