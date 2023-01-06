import { RegionSetting } from './regionSetting';
export class RolUsuario {
  public region?: RegionSetting;
  public esCliente?: boolean;
  public esPostVenta?: boolean;
  public esSoporte?: boolean;

  constructor(
    region?: RegionSetting,
    esCliente?: boolean,
    esPostVenta?: boolean,
    esSoporte?: boolean
  ) {
    this.region = region;
    this.esCliente = esCliente;
    this.esPostVenta = esPostVenta;
    this.esSoporte = esSoporte;
  }
}
