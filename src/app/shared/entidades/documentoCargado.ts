import { Documento } from "./documento";

export class DocumentoCargado {
    id?: number;
    documento: Documento;
    ticketId: number;

    constructor(documento: Documento, ticketId: number, id?: number) {
        this.documento = documento;
        this.ticketId = ticketId;
        this.id = id;
    }

    public static fromJson(element: any): DocumentoCargado {
        const documento = new Documento(null, element.Name, element.ServerRelativeUrl);
        const documentoCargado = new DocumentoCargado(documento, element.ListItemAllFields.TypeId, element.ListItemAllFields.Id);
        return documentoCargado;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}