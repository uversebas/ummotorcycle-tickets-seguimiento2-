export class Documento {
    public archivo: File;
    public nombre?: string;
    public url?: string;
  
    constructor(archivo: File, nombre?: string, url?: string) {
      this.archivo = archivo;
      this.nombre = nombre;
      this.url = url;
    }
  }