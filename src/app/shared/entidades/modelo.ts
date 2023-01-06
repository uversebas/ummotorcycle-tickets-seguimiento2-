export class Modelo {
    public nombre: string;
    public id?: number;

    constructor(nombre: string, id?: number) {
        this.nombre = nombre;
        this.id = id;
    }

    public static fromJson(element: any): Modelo {
        const modelo = new Modelo(element.Title, element.ID);
        return modelo;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}