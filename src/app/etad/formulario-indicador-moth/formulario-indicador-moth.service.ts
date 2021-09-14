import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL_SERVICE } from '../../constants';



@Injectable()
export class FormularioIndicadorMothService {

  /* 
   * URL del servicio del componente
   */

  private URL = BASE_URL_SERVICE + '/EtadIndicadores';

  constructor(private http: HttpClient) { }

  /*
 * Consulta de catalogo de lineas. Its important for form of Line
 */
  getCatalogos(id_usuario: number): Observable<any> {
    return this.http.get<any>(this.URL + '?action=loadCombobox&id_usuario=' + id_usuario);
  }
  /*
   * Fin de catalogos requeirdos
   */

  /*
   * Consulta  indicador dia consultada
   */
  getDetailIndicadores(id_usuario: number, id_grupo: number, id_etad: number, dia: string): Observable<any> {
    return this.http.get<any>(this.URL + '?action=getDetailIndicadores&id_usuario=' + id_usuario + '&id_grupo=' + id_grupo + '&id_etad=' + id_etad + '&frecuencia=diario&dia=' + dia);
  }
  /*
  * Fin indicador dia consultada
  */

  /*
   * Consulta  consulta de indicadores por area
   */
  viewKpiForSave(id_usuario: number, id_etad: number, id_periodo: number): Observable<any> {
    return this.http.get<any>(this.URL + '?action=viewKpiForSave&id_usuario=' + id_usuario + '&id_etad=' + id_etad + '&frecuencia=mensual&id_periodo=' + id_periodo);
  }
  /*
  * Finconsulta de indicadores por area
  */


  /*
 * Bloque de codigo para peticiones CRUD indicador diario
 */
  insertIndicadores(id_usuario: number, idEtad:number, datos: any): Observable<any> {
    const body = new HttpParams()
      .set('action', 'insertIndicadores')
      .set('id_etad', ''+idEtad)
      .set('frecuencia', 'mensual')
      .set('datos', ''+JSON.stringify(datos))
      .set('id_usuario', '' + id_usuario);
    return this.http.post(this.URL, body);
  }
}
