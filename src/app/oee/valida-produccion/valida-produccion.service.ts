import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../models/producto';
import { Linea } from '../../models/linea';
import { Catalogo } from '../../models/catalogo';
import { environment } from '../../../environments/environment';

@Injectable()
export class ValidaProduccionService {

  /* 
   * URL del servicio del componente
   */ 

  private URL = environment.BASE_URL_SERVICE + '/Produccion';

  constructor(private http: HttpClient) { }
    /*
   * Consulta de informe de meta.
   */ 
  init(id_usuario: number, id_meta:number): Observable<any> {
    return this.http.get<any>(this.URL + '?action=getDetailsByIdMeta&id_usuario=' + id_usuario + '&id_meta='+id_meta);
  }
  /*
   * Fin de catalogos requeirdos
   */
  
   
    /*
   * Bloque de codigo para peticiones insert produccion
   */
  liberarDatos(id_usuario: number, id_meta:number, status:number): Observable<any> {
    const body = new HttpParams()
      .set('action', 'liberarDatos')
      .set('id_meta', ''+id_meta)
      .set('estatus', ''+status)
      .set('id_usuario', '' + id_usuario);
    return this.http.post(this.URL, body);
  }



}
