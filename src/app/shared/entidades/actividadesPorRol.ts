export class ActividadPorRol {
    public actividad: string;
    public rol: string;
    public aprobador: string;
    public biblioteca: string;
    public id?: number;

    constructor(actividad: string, rol: string, aprobador: string, biblioteca: string, id?: number) {
        this.actividad = actividad;
        this.rol = rol;
        this.aprobador = aprobador;
        this.biblioteca = biblioteca;
        this.id = id;
    }

    public static fromJson(element: any): ActividadPorRol {
        const actividad = new ActividadPorRol(element.Title, element.Rol.Title, element.Aprobador.Title, element.Library, element.ID);
        return actividad;
    }

    public static fromJsonList(elements: any): any[] {
        const list = [];
        elements.forEach((element: any) => {
            list.push(this.fromJson(element));
        });
        return list;
    }
}