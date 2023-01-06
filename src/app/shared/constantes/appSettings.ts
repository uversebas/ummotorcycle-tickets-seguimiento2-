export class AppSettings {
  static obtenerConfiguracionTablaGeneral(): DataTables.Settings {
    const dtOptions = {
      responsive: true,
      destroy: true,
      autoWidth: true,
      fixedColumns: true,
      bSort: true,
      order: [[0, 'desc']],
      dom: 'lBfrtip',
      buttons: [
        {
          extend: 'excelHtml5',
          text: '<div class="col-md-12">Excel (xls)</div>',
          title: '',
          filename: 'Tickets',
          className: 'btn btn-primary boton-dt',
        },
        {
          extend: 'csvHtml5',
          text: '<div class="col-md-12">Excel (csv)</div>',
          title: '',
          filename: 'Tickets',
          className: 'btn btn-primary boton-dt',
        },
      ],
      language: {
        info: 'Page _PAGE_ of _PAGES_',
        zeroRecords: 'There are no records to show',
        infoEmpty: 'Showing 0 a 0 de 0 records',
        infoFiltered: '(Filtered of _MAX_ total records)',
        search: 'Search',
        paginate: {
          first: 'First',
          last: 'Last',
          next: 'Next',
          previous: 'Previous',
        },
        sLengthMenu: 'Show _MENU_ records',
        loadingRecords: 'Loading...',
        processing: 'Processing...',
      },
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthMenu: [
        [20, 25, 50, 100, 500, 2000, -1],
        [20, 25, 50, 100, 500, 2000, 'All'],
      ],
    };

    return dtOptions;
  }
}
