export class Factory {
    public nombre: string;
    public id?: number;

    constructor(nombre: string, id?: number) {
        this.nombre = nombre;
        this.id = id;
    }

    public static fromJson(element: any): Factory {
        const vin = new Factory(element.Title, element.ID);
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