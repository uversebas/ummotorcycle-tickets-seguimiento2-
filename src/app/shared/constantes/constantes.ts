import { sp, SPRest } from '@pnp/sp/presets/all';
import { environment } from 'src/environments/environment';
import { String } from 'typescript-string-operations';

export class Constantes {
  static listaConfiguracionRegiones = 'RegionSettings';
  static listaAyudasContextuales = 'ContextualAids';
  static listaTicket = 'Requests';
  static listaPartes = 'Parts';
  static listaMaestroVin = 'Vins';
  static listaVin = 'Vin';
  static listaTipoFallas = 'FailureTypes';
  static listaModelos = 'Models';
  static listaMotores = 'EngineCC';
  static listaDocumentosProveedores = 'SupplierDocuments';
  static listaPlantillaEmails = 'EmailTemplate';
  static bibliotecaDocumentosProveedores = 'SupplierDocumentsSupport';
  static listaFabricas = 'Factories';
  static listaCategoriasFallas = 'FailureCategory';

  static cookieUsuarioActual = 'usuarioActual';
  static grupoClientesLATAM = 'CustomerLATAM';
  static grupoAdministrador = 'Administrator';

  static routerInicio = '/';
  static routerMisTickets = '/quality-tickets/my-requests';
  static routerTodosLosTickets = '/quality-tickets/all-requests';
  static routerPostVentaTicets = '/quality-tickets/after-sales-requests';
  static routerSoporteTickets = '/quality-tickets/support-requests';

  static urlSite = 'https://ummotorcycles.sharepoint.com/';
  static urlRelativaSitio = '/sites/quality-reports/'

  static nombreDocumentoCliente = 'CR-TICKET-{0}.{1}'
  static nombreDocumentoClienteRevision = 'CR-REVIEW-{0}.{1}';
  static nombreDocumentoProveedor = 'SD-{0}.{1}';
  static nombreCarpetaTicketProveedores = 'ticket-{0}';

  static linkTicketsClientes = String.Format(
    '{0}{1}',
    environment.web,
    '/SiteAssets/app-quality-reports/index.aspx/quality-tickets/my-requests'
  );

  static linkTicketsSoporte = String.Format(
    '{0}{1}',
    environment.web,
    '/SiteAssets/app-quality-reports/index.aspx/quality-tickets/support-requests'
  );

  static linkTicketsPostVentas = String.Format(
    '{0}{1}',
    environment.web,
    '/SiteAssets/app-quality-reports/index.aspx/quality-tickets/after-sales-requests'
  );

  static linkTicketManage = String.Format(
    '{0}{1}',
    environment.web,
    '/SiteAssets/app-quality-reports/index.aspx/quality-tickets/manage-ticket/'
  );

  static linkTicketView = String.Format(
    '{0}{1}',
    environment.web,
    '/SiteAssets/app-quality-reports/index.aspx/quality-tickets/view-request/'
  );

  public static getConfig(url: string): SPRest {
    const mySp = sp.configure(
      {
        headers: {
          Accept: 'application/json; odata=verbose',
        },
      },
      url
    );
    return mySp;
  }

  public static getConfigDev(url: string): SPRest {
    const mySp = sp.configure(
      {
        headers: {
          Accept: 'application/json; odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          Authorization:
            // tslint:disable-next-line: max-line-length
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCIsImtpZCI6ImtnMkxZczJUMENUaklmajRydDZKSXluZW4zOCJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvdHJpdmVudG8uc2hhcmVwb2ludC5jb21ANTAxYTIyMmItNWMyNC00NTgwLWJkMDYtODdkZjVjNGI2OWJlIiwiaXNzIjoiMDAwMDAwMDEtMDAwMC0wMDAwLWMwMDAtMDAwMDAwMDAwMDAwQDUwMWEyMjJiLTVjMjQtNDU4MC1iZDA2LTg3ZGY1YzRiNjliZSIsImlhdCI6MTYwMjUzMzk4MCwibmJmIjoxNjAyNTMzOTgwLCJleHAiOjE2MDI2MjA2ODAsImlkZW50aXR5cHJvdmlkZXIiOiIwMDAwMDAwMS0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDBANTAxYTIyMmItNWMyNC00NTgwLWJkMDYtODdkZjVjNGI2OWJlIiwibmFtZWlkIjoiMWUzMTNiMTMtNGQ3OC00YjdhLWIzN2EtN2RlYjI5MzJkNTk1QDUwMWEyMjJiLTVjMjQtNDU4MC1iZDA2LTg3ZGY1YzRiNjliZSIsIm9pZCI6IjVlYjcxZTdhLTVkOTItNDBiOS1iMTEyLWE2ZDFmN2NhNTgyYiIsInN1YiI6IjVlYjcxZTdhLTVkOTItNDBiOS1iMTEyLWE2ZDFmN2NhNTgyYiIsInRydXN0ZWRmb3JkZWxlZ2F0aW9uIjoiZmFsc2UifQ.r61BR0cQpOXytMRqoeXDTP_QEa5cIZqEedFOKCriGclG5RzEcI1sPvnR4qTPV3DthnvSLLx2obLQQANbkwKaSIRQfoDsFXmeqqPFnGfpJa6r-OZ6O1SPXHdwViSJ7nRhNlIdKWbzC3Z0FiWtH-4JaMLXkTyiUo26kSx5qTREnnIkT7GSZsIytjl0HaHjEOMsDxWEvZ4Wu_9o81wPjfx3Z8hRcdZ-na2xyRjBL6NCQ23vsPThstR0ZL0TsETXX4pZjnQZ5lDlv6Hb6AQkzvUepn7kg-Z6KT3l9OsNTfWmXIuzt42tfNawImuM2AK3JKfyjxF0dhIvJh0vfX7V-wvuFA',
        },
      },
      url
    );
    return mySp;
  }
}
