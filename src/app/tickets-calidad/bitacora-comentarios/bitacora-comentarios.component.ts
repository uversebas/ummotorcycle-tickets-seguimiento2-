import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Constantes } from 'src/app/shared/constantes';
import { Comentario, Ticket } from 'src/app/shared/entidades';
import { ComentarioService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-bitacora-comentarios',
  templateUrl: './bitacora-comentarios.component.html',
  styleUrls: ['./bitacora-comentarios.component.css']
})
export class BitacoraComentariosComponent implements OnInit {
  ticket: Ticket;
  comentarios: Comentario[] = [];
  constructor(public bsModalRef: BsModalRef, private servicioComentarios: ComentarioService) { }

  ngOnInit(): void {
    this.cargarComentarios();
  }

  public async cargarComentarios(): Promise<void> {
    this.limpiarComentarios();
    this.comentarios = await this.servicioComentarios.Obtener(
      this.ticket.id,
      Constantes.listaTicket
    );
  }

  limpiarComentarios(): void {
    this.comentarios = [];
  }

}
