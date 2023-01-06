export class Vin {
  public nombre: string;
  public id?: number;
  public indice?: number;
  public idTicket?: number;
  public pinNumberTicket?: string;
  public ticketStatus?: string;
  constructor(nombre: string, idTicket?: number, id?: number, PinNumberTicket?: string, ticketStatus?: string) {
    this.nombre = nombre;
    this.idTicket = idTicket;
    this.id = id;
    this.pinNumberTicket = PinNumberTicket;
    this.ticketStatus = ticketStatus;
  }

  public static fromJson(element: any): Vin {
    const vin = new Vin(element.Title, element.RequestId, element.ID, element.Request.Ticket, element.Request.CurrentStatus);
    return vin;
  }

  public static fromJsonList(elements: any): Vin[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
