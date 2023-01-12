import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'tracing-tickets',
    loadChildren: () =>
      import('./tickets-calidad/tickets-calidad.module').then(
        (m) => m.TicketsCalidadModule
      ),
  },
  { path: '', redirectTo: '/tracing-tickets/home', pathMatch: 'full' },
  {
    runGuardsAndResolvers: 'always',
    redirectTo: '',
    pathMatch: 'full',
    path: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
