import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class RptDetalladoFallasService {

  private URL = environment.BASE_URL_SERVICE + '/Reportes';

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
  reporteFallas(id_usuario: number, params:any): Observable<any> {
    return this.http.get<any>(this.URL + '?action=reporteFallas&id_usuario=' + id_usuario + '&id_periodo='+params.idPeriodo +'&id_linea='+params.idLinea);
  }


}
