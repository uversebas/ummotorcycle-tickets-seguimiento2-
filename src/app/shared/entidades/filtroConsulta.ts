export class FiltroConsulta {
  public regionId?: number;
  public modeloId?: number;
  public motorCC?: string;
  public tipoFallaId?: number;
  constructor(
    regionId?: number,
    modeloId?: number,
    motorCC?: string,
    tipoFallaId?: number
  ) {
    this.regionId = regionId;
    this.modeloId = modeloId;
    this.motorCC = motorCC;
    this.tipoFallaId = tipoFallaId;
  }
}
