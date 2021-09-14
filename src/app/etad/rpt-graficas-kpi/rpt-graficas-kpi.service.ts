import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL_SERVICE } from '../../constants';

@Injectable()
export class RptGraficasKpiService {

  private URL = BASE_URL_SERVICE + '/EtadReportes';

  constructor(private http: HttpClient) { }

  /*
   * Consulta de catalogo de lineas.
   */
  getCatalogos(id_usuario: number): Observable<any> {
    return this.http.get<any>(this.URL + '?action=loadCombobox&id_usuario=' + id_usuario);
  }

  /*
   * Consulta reporte
   */
  getGraficasByEtad(id_usuario: number, params: any): Observable<any> {
    return this.http.get<any>(this.URL + '?action=getGraficasByEtad&id_usuario=' + id_usuario + '&id_periodo=' + params.idPeriodo + '&id_etad=' + params.idEtad);
  }

}
