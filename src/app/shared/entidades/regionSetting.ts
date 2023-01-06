export class RegionSetting {
  public nombre: string;
  public codigo: string;
  public url: string;
  public grupoCliente: string;
  public grupoPostVenta: string;
  public grupoSoporte: string;
  public id?: number;

  constructor(
    nombre: string,
    codigo: string,
    url: string,
    grupoCliente: string,
    grupoPostVenta: string,
    grupoSoporte: string,
    id?: number
  ) {
    this.nombre = nombre;
    this.codigo = codigo;
    this.url = url;
    this.grupoCliente = grupoCliente;
    this.grupoPostVenta = grupoPostVenta;
    this.grupoSoporte = grupoSoporte;
    this.id = id;
  }

  public static fromJson(element: any): RegionSetting {
    const opcionesRegiones = new RegionSetting(
      element.Title,
      element.RegionCode,
      element.Url,
      element.CustomerGroup,
      element.AfterSalesGroup,
      element.SupportGroup,
      element.ID
    );
    return opcionesRegiones;
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
