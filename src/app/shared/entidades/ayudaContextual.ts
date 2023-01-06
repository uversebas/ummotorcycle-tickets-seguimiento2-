export class AyudaContextual {
  public nombre: string;
  public textoAyuda: string;
  public id?: number;
  constructor(nombre: string, textoAyuda: string, id?: number) {
    this.nombre = nombre;
    this.textoAyuda = textoAyuda;
    this.id = id;
  }

  public static fromJson(element: any): AyudaContextual {
    const ayudaContextual = new AyudaContextual(
      element.Title,
      element.HelpText,
      element.ID
    );
    return ayudaContextual;
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }
}
