import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Confirmacion } from '../enumerados/confirmacion';
import { TipoAlerta } from '../enumerados/tipoAlerta';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

constructor() { }
  /**
   *
   * Modal con mensaje de éxito.
   *
   * @param titulo Título del modal.
   * @param mensaje Mensaje del modal.
   * @param funcionConfirmar Función que se ejecuta al dar clic en OK.
   *
   */
   public Exito(
    titulo: string,
    mensaje: string,
    funcionConfirmar: () => void
  ): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: TipoAlerta.EXITO,
      allowOutsideClick: false,
      showConfirmButton: true,
    }).then(() => {
      funcionConfirmar();
    });
  }

  /**
   *
   * Modal con mensaje de advertencia.
   *
   * @param titulo Título del modal.
   * @param mensaje Mensaje del modal.
   *
   */
  public Advertencia(titulo: string, mensaje: string): void {
    Swal.fire(titulo, mensaje, TipoAlerta.ADVERTENCIA);
  }

  /**
   *
   * Modal con mensaje de error.
   *
   * @param titulo Título del modal.
   * @param mensaje Mensaje del modal.
   * @param funcionConfirmar Función que se ejecuta al dar clic en OK (Es opcional).
   *
   */
  public Error(
    titulo: string,
    mensaje: string,
    funcionConfirmar: () => void
  ): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: TipoAlerta.ERROR,
      allowOutsideClick: false,
    }).then(() => {
      funcionConfirmar();
    });
  }

  /**
   *
   * Modal con mensaje de información.
   *
   * @param titulo Título del modal.
   * @param mensaje Mensaje del modal.
   *
   */
  public Info(titulo: string, mensaje: string): void {
    Swal.fire({
      title: titulo,
      html: mensaje,
      icon: TipoAlerta.INFO,
      allowOutsideClick: true,
    }).then(() => {
      this.Cerrar();
    });
  }

  /**
   *
   * Modal con mensaje de confirmación, contiene opciones de SI y NO.
   *
   * @param titulo Título del modal.
   * @param mensaje Mensaje del modal.
   * @param funcionConfirmar Función que se ejecuta al dar clic en SI.
   * @param funcionDeclinar Función que se ejecuta al dar clic en NO (Es opcional).
   *
   */
  public Confirmar(
    titulo: string,
    mensaje: string,
    funcionConfirmar: () => void,
    funcionDeclinar?: () => void
  ): void {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: TipoAlerta.ADVERTENCIA,
      showCancelButton: true,
      cancelButtonText: Confirmacion.NO,
      confirmButtonText: Confirmacion.SI,
    }).then((result: any) => {
      if (result.value) {
        funcionConfirmar();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        if (typeof funcionDeclinar === 'function') {
          funcionDeclinar();
        } else {
          return;
        }
      }
    });
  }

  /**
   *
   * Cerrar el modal.
   */
  public Cerrar(): void {
    Swal.close();
  }

}
