export class Parte {
  public codigo: string;
  public cantidad: number;
  public id?: number;
  public indice?: number;
  public idTicket?: number;
  constructor(
    codigo: string,
    cantidad: number,
    idTicket?: number,
    id?: number
  ) {
    this.codigo = codigo;
    this.cantidad = cantidad;
    this.idTicket = idTicket;
    this.id = id;
  }

  public static fromJson(element: any): Parte {
    const vin = new Parte(element.Title, element.Quantity, element.RequestId, element.ID);
    return vin;
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
