export class PlantillaEmail {
    public nombre: string;
    public asunto: string;
    public body: string;
    public cc: string[];

    constructor (nombre: string, asunto: string, body: string, cc: string) {
        this.nombre = nombre;
        this.asunto = asunto = asunto;
        this.body = body;
        this.cc = new Array();
        if (cc) {
            this.cc = cc.split(',');
        }
    }

    public static fromJson(element: any): PlantillaEmail {
        const plantilla = new PlantillaEmail(element.Title, element.Subject, element.Body, element.CC);
        return plantilla;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }

}