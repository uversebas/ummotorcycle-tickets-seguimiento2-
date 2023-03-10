export class DocumentoProveedor {
    public nombre: string;
    public id?: number;

    constructor(nombre: string, id?: number) {
        this.nombre = nombre;
        this.id = id;
    }

    public static fromJson(element: any): DocumentoProveedor {
        const documentoProveedor = new DocumentoProveedor(element.Title, element.ID);
        return documentoProveedor;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}