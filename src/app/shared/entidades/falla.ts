export class Falla {
    public nombre: string;
    public id?: number;

    constructor(nombre: string, id?: number) {
        this.nombre = nombre;
        this.id = id;
    }

    public static fromJson(element: any): Falla {
        const falla = new Falla(element.Title, element.ID);
        return falla;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}