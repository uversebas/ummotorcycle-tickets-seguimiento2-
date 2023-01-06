import { Modelo } from "./modelo";
import { RegionSetting } from "./regionSetting";



export class Motor {
  public nombre: string;
  public region: RegionSetting;
  public modelo: Modelo;
  public id?: number;
  constructor(
    nombre: string,
    region: RegionSetting,
    modelo: Modelo,
    id?: number
  ) {
    this.nombre = nombre;
    this.region = region;
    this.modelo = modelo;
    this.id = id;
  }

  public static fromJson(element: any): Motor {
    let region: RegionSetting = null;
    let modelo: Modelo = null;
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
    if (element.ModelId != null) {
      modelo = new Modelo(element.Model.Title, element.Model.ID);
    }
    const motor = new Motor(element.Title, region, modelo, element.ID);
    return motor;
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
