import { Documento, DocumentoProveedor } from ".";

export class DocumentoSoporte {
    id?: number;
    tipo: DocumentoProveedor;
    documento: Documento;
    indice?: number;
    mostrarCliente?: boolean;

    constructor(tipo?: DocumentoProveedor, documento?: Documento, mostrarCliente?: boolean, id?: number) {
        this.tipo = tipo;
        this.documento = documento;
        this.mostrarCliente = mostrarCliente;
        this.id = id;
    }

    public static fromJson(element: any): DocumentoSoporte {
        const tipo = new DocumentoProveedor('', element.ListItemAllFields.TypeId);
        const documento = new Documento(null, element.Name, element.ServerRelativeUrl);
        const documentoSoporte = new DocumentoSoporte(tipo, documento, element.ListItemAllFields.ShowClient, element.ListItemAllFields.Id);
        return documentoSoporte;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}