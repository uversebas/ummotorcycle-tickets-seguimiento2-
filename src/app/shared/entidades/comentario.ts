export class Comentario {
  public valor: string;
  public version?: string;
  public fechaCreacion?: Date;
  public autor?: any;
  public emailAutor?: string;
  public estado?: string;

  constructor(
    valor: string,
    version?: string,
    fechaCreacion?: Date,
    autor?: any,
    emailAutor?: string,
    estado?: string
  ) {
    this.valor = valor;
    this.version = version;
    this.fechaCreacion = fechaCreacion;
    this.autor = autor;
    this.emailAutor = emailAutor;
    this.estado = estado;
  }
}
