import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { deleteItemArray, getAnioActual, calculaDiaPorMes, isNumeroAsignacionValid, findRol } from '../../utils';
import swal from 'sweetalert2';
import { ListaIshikawasService } from './lista-ishikawas.service';
import { Periodo } from '../../models/periodo';
import { Linea } from '../../models/linea';
import { Catalogo } from '../../models/catalogo';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { PetIshikawa } from '../../models/pet-ishikawa';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { PetConsenso } from '../../models/pet-consenso';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var $: any;
declare var Materialize: any;
@Component({
  selector: 'app-lista-ishikawas',
  templateUrl: './lista-ishikawas.component.html',
  providers: [ListaIshikawasService],
  styleUrls: ['./lista-ishikawas.component.css'],
  animations: [
    trigger('visibility', [
      state('inactive', style({
        opacity: 0
      })),
      state('active', style({
        opacity: 1
      })),
      transition('inactive => active', animate('1s ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
    ])
  ]
})
export class ListaIshikawasComponent implements OnInit {

  public loading: boolean;
  public datos_tabla: boolean;
  public mensajeModal: string;
  public estatusPeriodo: boolean;
  public anioSeleccionado: number;
  public submitted: boolean;
  public disabled: boolean;
  public periodos: Array<Periodo> = [];
  public anios: any = {};
  public meses: Array<any> = [];
  public formConsultaPeriodo: FormGroup;
  public status: string;
  public idLinea: number;
  public idPeriodo: number;
  public recordsIshikawa: Array<PetIshikawa>;
  public $modalFormIshikawa: any;

  /* Catalogos requeridos y varibales para visualizar formulario detalle */
  public consultaById: boolean;
  public bloquear: boolean;
  public emes: Array<Catalogo>;
  public preguntas: Array<Catalogo>;
  public etads: Array<Catalogo>;
  public grupos: Array<Catalogo>;
  public ishikawa: PetIshikawa;
  public action: string;
  /* Fin catalogos requeridos */


  public permission: any = {
    editarIshikawa: true,
    finalizar: true
  }

  constructor(private auth: AuthService,
    private service: ListaIshikawasService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loading = true;
    this.datos_tabla = false;
    this.submitted = false;
    this.disabled = false;
    this.estatusPeriodo = true;
    this.consultaById = false;
    this.bloquear = true;
    this.recordsIshikawa = [];
    this.action = '';
    // this.permission.editarIshikawa = findRol(3, this.auth.getRolesOee());

    this.anioSeleccionado = getAnioActual();

    this.service.getInitCatalogos(this.auth.getIdUsuario()).subscribe(result => {

      if (result.response.sucessfull) {

        this.etads = result.data.listEtads || [];
        this.periodos = result.data.listPeriodos || [];

        this.emes = result.data.listMs || [];
        this.preguntas = result.data.listPreguntas || [];
        this.grupos = result.data.listGrupos || [];

        let tmpAnios = this.periodos.map(el => el.anio);
        this.periodos.filter((el, index) => {
          return tmpAnios.indexOf(el.anio) === index;
        }).forEach((el) => {
          let tmp = el.anio;
          this.anios[tmp] = tmp;
        });

        this.meses = this.periodos.filter(el => el.anio == this.anioSeleccionado);

        this.loading = false;
        // this.loadFormulario();

        setTimeout(() => {
          this.ngAfterViewInitHttp();
        }, 200);

      } else {
        Materialize.toast(result.response.message, 4000, 'red');
        this.loading = false;
      }
    }, error => {
      Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
      this.loading = false;
    });
  }



  /*
   * Carga plugins despues de cargar y mostrar objetos en el DOM
   */
  ngAfterViewInitHttp(): void {
    $('.tooltipped').tooltip({ delay: 50 });
    this.$modalFormIshikawa = $('#modalFormIshikawa').modal({
      opacity: 0.6,
      inDuration: 800,
      dismissible: false,
      complete: () => { }
    });

    this.consultaPeriodo();

  }

  agregar() {
    $('.tooltipped').tooltip('hide');
  }

  regresar() {
    $('.tooltipped').tooltip('hide');
  }


  changeCombo(): void {
    this.estatusPeriodo = true;
    this.datos_tabla = false;
    this.status = "inactive";
    this.recordsIshikawa = [];
  }

  openModalYear(event): void {
    event.preventDefault();
    swal({
      title: 'Seleccione el año',
      input: 'select',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'OK',
      inputOptions: this.anios,
      inputPlaceholder: 'SELECCIONE',
      showCancelButton: true,
      inputValidator: (value) => {

        return new Promise((resolve) => {

          if (value != '') {
            resolve();
            this.anioSeleccionado = value;
            this.submitted = false;
            this.status = "inactive";
            this.datos_tabla = false;
            this.recordsIshikawa = [];
            this.consultaPeriodo();
          } else {
            resolve('Seleccione un año')
          }
        })
      }
    })
  }


  consultaPeriodo(): void {
    this.submitted = true;
    this.status = "inactive";
    this.disabled = true;
    this.datos_tabla = false;
    this.recordsIshikawa = [];

    this.service.getAllIshikawas(this.auth.getIdUsuario(), this.anioSeleccionado).subscribe(result => {

      if (result.response.sucessfull) {
        this.recordsIshikawa = result.data.listIshikawas || [];
        this.datos_tabla = true;
        this.disabled = false;

        setTimeout(() => {
          this.status = 'active';
        }, 200);


      } else {
        this.disabled = false;
        Materialize.toast(result.response.message, 4000, 'red');
      }
    }, error => {
      this.disabled = false;
      Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
    });

  }

  verificaIshikawa(data): void {
    this.openModalConfirmacion(data.ishikawa, 'verificar');
  }

  openModalConfirmacion(ishikawa: PetIshikawa, accion: string, event?: any): void {
    this.mensajeModal = '';

    switch (accion) {
      case 'eliminar':
        this.mensajeModal = '¿Está seguro de eliminar ishikawa? ';
        break;
      case 'verificar':
        this.mensajeModal = '¿Está seguro de finalizar ishikawa? ';
        break;
    }

    /* 
     * Configuración del modal de confirmación
     */
    swal({
      title: '<span style="color: #303f9f ">' + this.mensajeModal + '</span>',
      type: 'question',
      html: '<p style="color: #303f9f ">Descripción ishikawa: <b>'+ishikawa.descripcion_corta+'</b></p>',
      showCancelButton: true,
      confirmButtonColor: '#303f9f',
      cancelButtonColor: '#9fa8da ',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si!',
      allowOutsideClick: false,
      allowEnterKey: false
    }).then((result) => {
      /*
       * Si acepta
       */
      if (result.value) {
        switch (accion) {
          case 'eliminar':
            this.service.deleteIshikawa(this.auth.getIdUsuario(), ishikawa).subscribe(result => {
              if (result.response.sucessfull) {
                deleteItemArray(this.recordsIshikawa, ishikawa.id, 'id');
                Materialize.toast('Se eliminó correctamente ', 4000, 'green');
              } else {
                Materialize.toast(result.response.message, 4000, 'red');
              }
            }, error => {
              Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
            });
            break;
          case 'verificar':
            this.service.checkIshikawa(this.auth.getIdUsuario(), ishikawa).subscribe(result => {
              
              if (result.response.sucessfull) {
                
                this.ishikawa = result.data.ishikawa;
                this.recordsIshikawa.forEach((el, index, arg) => {
                  if (el.id == ishikawa.id) {
                    arg[index] = this.ishikawa;
                  }
                });

                Materialize.toast('Finalizó ishikawa correctamente ', 4000, 'green');
              } else {
                Materialize.toast(result.response.message, 4000, 'red');
              }
            }, error => {
              Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
            });
            break;
        }
        /*
        * Si cancela accion
        */
      } else if (result.dismiss === swal.DismissReason.cancel) {
      }
    })

  }

  obtenerMesDelPeriodo(arg: Array<Periodo>, idPeriodo: number): number {
    let result = arg.filter((el) => el.id_periodo == idPeriodo);
    if (result.length > 0) {
      return result[0].mes;
    } else {
      return -1;
    }
  }

  arrayDescriptivo(arg: Array<Catalogo>): Array<string> {
    return arg.map((el) => el.valor);
  }

  idItemCombo(arg: Array<Catalogo>, valor: string): number {
    let element = arg.filter((el) => el.valor == valor.trim());
    if (element.length > 0) {
      return element[0].id;
    } else {
      return -1;
    }

  }

  openModalDetalle(ishikawa: PetIshikawa, action: string): void {

    this.action = action;
    this.bloquear = ('consult' == this.action);
    this.consultaById = false;
    this.ishikawa = new PetIshikawa();

    this.service.getIshikawaById(this.auth.getIdUsuario(), ishikawa.id).subscribe(result => {
     
      if (result.response.sucessfull) {
        this.ishikawa = result.data.ishikawa;
        this.consultaById = true;
        this.$modalFormIshikawa.modal('open');
      } else {
        Materialize.toast(result.response.message, 4000, 'red');
      }
    }, error => {
      Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
    });

  }

  closeModalFormulario(): void {
    this.$modalFormIshikawa.modal('close');
    this.consultaById = false;
  }

  help(event): void {
    $('.tooltipped').tooltip('hide');
    event.preventDefault();
    swal({
      title: 'Ayuda',
      type: 'info',
      html: ' Para <b>editar</b> un ishikawa haga clic en el botón <i class="material-icons">edit</i> <br>' +
        '<b>Solo podra editar si el ishikawa no ha sido verificado</b></br>' +
        'Para <b>verficar</b> haga clic en el botón <i class="material-icons">list</i> <br>' +
        '<b> La verificación se habilitará un día después de la fecha más lejana registrada en el plan de acción</b> <br><br>' +
        ' El formato <b>PDF</b> se habilitará cuando el ishikawa este finalizado',
      showCloseButton: false,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Ok!'
    })

  }


  updateIshikawa(data: any): void {

    this.ishikawa = data.ishikawa;
    /* 
     * Configuración del modal de confirmación
     */
    swal({
      title: '<span style="color: #303f9f ">¿Está seguro de actualizar ishikawa?</span>',
      type: 'question',
      input: 'text',
      inputPlaceholder: 'Escribe aquí',
      html: '<p style="color: #303f9f ">Ingrese descripción corta para identificar el registro</b></p>',
      showCancelButton: true,
      confirmButtonColor: '#303f9f',
      cancelButtonColor: '#9fa8da ',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si!',
      inputValue: this.ishikawa.descripcion_corta,
      allowOutsideClick: false,
      allowEnterKey: false,
      inputValidator: (value) => {

        if (!value) {
          return 'Se requiere descripción!';
        } else {
          if (value.length > 30) {
            return 'Máximo 30 caracteres';
          } else {
            this.ishikawa.descripcion_corta = value;
          }
        }
      }
    }).then((result) => {
      /*
       * Si acepta
       */
      if (result.value) {

        this.service.updateIshikawa(this.auth.getIdUsuario(), this.ishikawa).subscribe(result => {
          if (result.response.sucessfull) {
            let id_old = this.ishikawa.id;
            let id = parseInt(result.response.message);
            this.ishikawa.id = id;
            this.recordsIshikawa.forEach((el, index, arg) => {
              if (el.id == id_old) {
                arg[index] = this.ishikawa;
              }
            });
            Materialize.toast(' Se actualizo correctamente ', 5000, 'green');
          } else {
            Materialize.toast(result.response.message, 4000, 'red');
          }
        }, error => {
          Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
        });
        /*
        * Si cancela accion
        */
      } else if (result.dismiss === swal.DismissReason.cancel) {
      }
    });

  }

  revisaIshikawa(data: any): void {
  /* 
   * Configuración del modal de confirmación
   */
    swal({
      title: '<span style="color: #303f9f ">¿Está seguro de marcar ishikawa como revisado? </span>',
      type: 'question',
      html: '<p style="color: #303f9f "><b>Si confirma esta acción su nombre quedará registrado</b></p>',
      showCancelButton: true,
      confirmButtonColor: '#303f9f',
      cancelButtonColor: '#9fa8da ',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si!',
      allowOutsideClick: false,
      allowEnterKey: false
    }).then((result) => {
      /*
       * Si acepta
       */
      if (result.value) {

        this.service.revisarIshikawa(this.auth.getIdUsuario(), data.ishikawa).subscribe(result => {
        
          if (result.response.sucessfull) {

            this.ishikawa.estatus = 1;
            this.ishikawa.revisado = result.data.ishikawa.revisado;
            this.ishikawa.verificar = result.data.ishikawa.verificar;

            this.recordsIshikawa.forEach((el, index, arg) => {
              if (el.id ==  data.ishikawa.id) {
                arg[index].estatus = 1;
                arg[index].revisado = result.data.ishikawa.reviso;
              }
            });
            Materialize.toast('Ishikawa revisado ', 4000, 'green');
          } else {
            Materialize.toast(result.response.message, 4000, 'red');
          }
        }, error => {
          Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
        });

        /*
        * Si cancela accion
        */
      } else if (result.dismiss === swal.DismissReason.cancel) {
      }
    })

  }



  /*
   * 
   * 
   */

  viewPDF(ishikawa: PetIshikawa): void {

    var dd = {
        
        header: [
        {
          alignment: 'center',
          height: 45,
          image: 'data:image/png;base64,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'
        }
      ],
      
      content: [
        '\n',
        //Descripción del problema
        {

          alignment: 'center',
          width: 220,
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWUAAAAwCAYAAADJsWtLAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAIGNIUk0AAHolAACAgwAA+f8AAIDoAABSCAABFVgAADqXAAAXb9daH5AAAArJSURBVHja7F3NiyRJFf/FOBeFmSW97SqKNTgsDLSDOQdZQVit9uBRrWI//GKQ6oUVlxlGqv6Eah2X1ZNdl0VxXKjCw4KeOmcHFNaDnbCuOCM7VB0WHDx17szA7skpD/mCjn4TkR+RmVW51e8HSVdXZkRGvPfiFy9fvMhSy+USAoFAIGgHTokIBAKBQEhZIBAIBELKAoFAIKQsEAgEAiFlgUAg+PjhdJmL+9cvlq3/kwC+TscWgPMAnqDjPh3vAXgXwC0ANwF8VPYm02vviCYFAsHJI+USuADgKoDvEAHboMn5cwC6dP19AH8E8EsAt0U9AoHgpKHu8MWTAP5Anu/lDEJGBlFfBvBPqudJUZFAIBBS9sPzAP5Nf0/V0C5d3wuiJoFAIKRcHArAq+TZnq25fWcB3KD6lahLIBAIKecT8usArjTczisAfgvgE6IygUAgpOzGdQA/XFFbvw/gNVGZQCDYZFTJvngOacbEKvETAG8DeKOuCpWSqEhLEQII6POCDoGgVWjihW6+nvJTAPbWJIffAPhMSeIdK6WWtgPAIYB9AEMAnQ20mzGAJR3jNRLsnNowp/+zEAA4IL3sA+i1bLLQ7Rq3sL42YN84TrosVuYp/wL1L+oVxVkAPwfwYkllZxFAl44xgBGA3Q3S8ZB9Hq2hDV1jwuvQ/3HG9QPjcwxg0iJ5antpa31tQFdksVpP+QKFLrzwlXPfwvTaO1V34T1H7fDBhIhJk29s8Sz3NkjHsePzKrHI+d9FygmAPv0VCMRTduCqD5lfeOoZXPzCM/jml79d12RyBcCPPcrOlstlZIQ29My+Z3hzgxZ6aL7YNp4UojW1YQbgEnlCefHhkPSQUNslliwQUs7ApwB81+dGz3/tZZz/7IU6294H8FMAH9ZQV0SkMcfR4tJwQ0g5WSMZw8NLjyE56QIJXxTGs/CMJf/97l/w5t9+j7dv36yr7WeQvuioTvIy460d2BeYugCmSBcIl8bhWpDqkBfOr5/T97xMQBPCAbv+kO5rXq8XRQZIwy7mPfYMr9+8jocJ9qleWzvn7AmiqCwOqD2Bpa37JerSfXbFGc1+9ehaLmPejqLQ8pizOqc55Vz607IMarRZX/2Z5bqsrYc4vgbjoxd+rwOLfQw8+1xWvmZfddk564suZ5PhYYbeBkqpqVLqgCUQHCql9pRSXrou6yl7k+CbccoRL371Wp2TyrMA/lRjfRM2iLkxj3F84YyTShfHFwp1FkHgGPQDOjczvtt3kGBAxJMY13fZXz7J6HJdR/giYHUEjjb2KJRgertDuFfIQzomRjuyBrBLrrrPPZLpyCJzfT+XjHVWTb+EHegsgMDRpqxyU4f+TFmeQz1xcl/9meVsTsGiol5M7DnktEd/d0rqpax8A2YnHUtfBsa5IOP8JeP7KdxZQa4yjXjKWy3z9L/UQJ2RZdBr4zUNdEYDvW+QpDbkjlEmYJ74NhnixBJaMA0uIYPfpntMCoQiIrpH5BGyCFgbd9m5KZPFmN13h8qNaPDHKBYP5nKNDLlGbBLIGgQ69LFjKdtD8XTHgBHyguktyiGgjkXfI0YSTaR7ldGfbQLfJRvTdlaHXmxlY+bFlsm2qCrfDis3Y4Qf5JwPLTyxINn1LXIPlVKl0znLespfbBkpN9Ge2GFkpoHytLkZmzm7ZNwB88J5qt0OmwBMpXPPdJbjVZht8k3pM+8Z0eepYdAhfTewTE6msZa5/zCjLi7XIRsoyGmHuUagdVLkcdsk5EvMq104iKRn6C9h3pqeJA8KPDVUQVH9cUK2ee5N6mXfkFWvoANRl3y5jOZswubnD4z7mqmcMwDxcrnk8oyUUmbos/Teh7KecoB2YZXtCRnBZnnYQY5RFam/bPpa1UVJ2z1n7LvQYvSjGuU6ckw2tmuzrgML85SxFbNvuyXCDB0my8Qy2S98B2rN+kNOW5vWy8Qh76bl65JR0fO8H3GGY+eNsp7yujaMuHBmRUTfZcqYFiwXMaM6oO9mdCSOe/gotWqMcpHx6Bla4nO6TJWUtSJ16e87RpmoYPsXFdsUeZbrwr6g2aQTUVR/Reymab1EDrJtWr6LnP572TIt6IUefaqFlB+0jJgfNuwRxw7FF53ddYxzjxmU3j2463jUb1NubuJBBHWSCtjgXyUWNdhQm/W3Lr0sahyj63xKHyilBnXb5mkPBZ/dIIPLI9yFg2jzHtlj9kgUIY27mduNzQWJTdrWLTha7FyV3Yp8Vy/ffTY5mOGMThWiLkvKdwF8vkXKuVtzfTx3cmZRcgflMxsWOFqk05kL5u7BXYsnELVExt0MY6+6YJUUrCtcE6GFKB5KSjIe0duqv3XppWqb1i3fAY4vOo6Wy+XECGeY6aKlnwrKLvS927IZ8x81C3rMPNzE4vlWfWnKDOkKr0ny3MgGLZFvB4/HWKOciawMOOG5NusEGWXqRpRDSGGBvnRbrL826KVXsU3rlu+xrCqTkNmY9nIiypLyrZaR8q2aDJe/hCixhCjMVVjXLrchHt8NNYQ9qT+LDDqwJ90P0Vw8zZY0P2XtW1hkMba0KYR7kw3HhNUVsDaMHTpoCnyDTIfpZViQzIcOQh+W0EFT+lunXgZsIo8K9qcO+Tb9JAKKMVdyqsqGL95Curh2BuvHQ2pPWYyVUklG7Ee/CIfPcLs4nns4x1HKkc5LDMh4tg0D1En4EbuWG3RM13SNsl3jfM8InWw3IE9NQLw/tklqYvRB71rUsgiNc3EBT2hiGLGW68SQQcB00DQmxsDWfdM5570M4oxJBj2DyAY4yrIxUyJdcgmNydjmGNSlv6JyqEMvc4cMtO1PMkIjXBZV5dvExB0qpebGmLA5KFGTpPwhCeGyb2/+eufPmP/3dh2CmcHvZURhjiHuwr3At8O8hh7s21T5LBo4rtV1avRxfAHB5pk1mVZla6OepGLmtfCskjxZZBl4H0fvFwgsfU7ofqt49eiC9Y23R++qtA3AHRbecnnWgcWD7VjCQaOG9IeG9ZLg+KsKho6xNrJ4w1my8JFvUyEuPmnxJwfvzSM+r+58FcCP4PmrJe8f3sH7h3eqCuURtaMMgScOZel8y1mBx7sJXacD/XxwRcxAzxkebmgZ2DxXOUG6g8zci28Okpg9Ko4KDq5RgbhfZBlYtjaastDkxBduYos8Rzn6iSxy1XW5NjiMauq7q28DPL61VnvNtvo0Aeq0x5DZWeyQ5zYLlSQeJFpGf0Xl4qsXl927xklRWfjIN6+vvuf1ZGTG1hegVwNTGCOAR0xZlfmNqf71i/rjDQAvrDF08YZ5/yovzD/hv9FnrhJv2i+uiP4EjaNNv9H3M6QbSdaBB3R/gUAg2Dj4kvI9AC+tqc0vAfiPqE4gEAgpPx5CeG3F7f0V3VcgEAg2Eqcrlr8K4NMAfrCCtv4O6e/yCeqD70KYQPQnaCkpL5Gmx32A9PfymsKvaQKoPareRKD+YwSfl+ELRH+CBnGqhjr+B+AVAN9D/W9te0j1vkL3EQgEAiHlgrgB4GmkMd9HFet6RPU8TfUKBAKBkLIH7iHNH94C8LqH5/yQym1RPfdERQKB4CThdEP1/gtprPllAN9A+ivYWwDOA3gC6TuZHwC4D+A9pG+fewvATQAfiVoEAsFJhTrhC10CgUDQKpwSEQgEAoGQskAgEAiElAUCgUBIWSAQCAQF8f8BAGxgfqvGT2wLAAAAAElFTkSuQmCC'

        },
        '\n',
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [220],                
                body: [
                  [{text: 'Nombre ETAD', style: 'fuenteTabla'}],
                  [ {text: ishikawa.nombre_etad, style: 'textoTabla'}]
                ]
              }  
            },
            {
              style: 'tabla',
              table: {
                widths: [220],
                body: [
                  [{text: 'Grupo', style: 'fuenteTabla'}], 
                  [{text: ishikawa.grupo.valor, style: 'textoTabla'}]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [220],
                body: [
                  [{text: 'Área', style: 'fuenteTabla'}], 
                  [{text: ishikawa.etad.valor, style: 'texttoTabla'}]
                ]
              }
            }
          ]
        },
        '\n',
        {
          alignment: 'center',
          columns: [
            {
              text: 'Definición del problema',
              style: 'fuente'
            },
            {
              text: ''
            }
          ]
        },
        '\n',
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [350],
                heights: ['*', 30, '*', 30, '*', 30, '*', 30],
                body: [

                  [{ text: '¿Qué situación se presenta?', style: 'fuenteTabla' }],
                  [{ text: ishikawa.que, style: 'textoTabla' }],
                  [{ text: '¿Dónde se presenta la situación?', style: 'fuenteTabla' }],
                  [{ text: ishikawa.donde, style: 'textoTabla' }],
                  [{ text: '¿Cuándo se presenta?', style: 'fuenteTabla' }],
                  [{ text: ishikawa.cuando, style: 'textoTabla' }],
                  [{ text: '¿Cómo afecta la situación?', style: 'fuenteTabla' }],
                  [{ text: ishikawa.como, style: 'textoTabla' }]
                ]
              }
            }
            ,
            {
              style: 'tabla',

              table: {
                widths: [370],
                heights: ['*', 200],
                body: [
                  [{ text: 'Define el enunciado del problema', style: 'fuenteTabla' }],
                  [{ text: ishikawa.problema, style: 'textoTabla' }],
                ]
              }
            }
          ]
        },
        '\n\n\n\n\n\n\n\n\n',        
        //Lluvia de ideas
        {
          alignment: 'center',

          width: 220,
          image: 'data:image/png;base64,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'

        },
        '\n',
        {         
          style: 'tabla',
          table: {
            alignment: 'center',
            widths: [750],
            heights: ['*', 40, '*', 40, '*', 40, '*', 40, '*', 40, '*', 40],
            body: [
              [{text: 'Mano de Obra', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 1).map(el=>el.idea).toString(), style: 'textoTabla'}],
              [{text: 'Maquinaria', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 2).map(el=>el.idea).toString(), style: 'textoTabla'}],
              [{text: 'Mediciones', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 3).map(el=>el.idea).toString(), style: 'textoTabla'}],
              [{text: 'Método', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 4).map(el=>el.idea).toString(), style: 'textoTabla'}],
              [{text: 'Material', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 5).map(el=>el.idea).toString(), style: 'textoTabla'}],
              [{text: 'Medio Ambiente', style: 'fuenteTabla'}],
              [{text: ishikawa.listIdeas.filter(el=>el.id_eme == 6).map(el=>el.idea).toString(), style: 'textoTabla'}]
            ]
          }           
        },  
        '\n\n\n',
        //Diagrama de ishikawa
        {
          alignment: 'center',
          width: 220,
          image: 'data:image/png;base64,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'
        },
        '\n\n',
        {
          alignment: 'center',
          width: 650,
          image: 'data:image/png;base64,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'
        },
        '\n\n\n\n\n',  
        //Test de causa raíz  
        {
          alignment: 'center',

          width: 220,
          image: 'data:image/png;base64,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'

        },
        '\n\n',
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [350],
                heights: ['*', 200],
                body: [
                  [{ text: 'Describe la causa raíz', style: 'fuenteTabla' }],
                  [{ text: ishikawa.causa_raiz, style: 'textoTabla' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [270, 40, 40],
                heights: ['*', 50, 50, 50, 50, 50, 50, 50],
                body: this.getDrawTestRaiz(ishikawa.listConsenso)
              }
            }
          ]
        },
        '\n\n',
        //Tabla guia ADTP y plan de acción
        {
          alignment: 'center',
          width: 220,
          image: 'data:image/png;base64,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'
        },
        '\n',
        {
          style: 'tabla',
          table: {
            heights: ['*', 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
            body: [
              [{ text: 'Enunciado del Problema', style: 'fuenteTabla2' }, { text: 'Causa Primaria', style: 'fuenteTabla2' }, { text: 'Causa Secundaria', style: 'fuenteTabla2' }, { text: 'Causa terciaria', style: 'fuenteTabla2' }, { text: 'Causa Cuaternaria', style: 'fuenteTabla2' }, { text: 'Causa quinaria', style: 'fuenteTabla2' }, { text: 'Causa sextenaria', style: 'fuenteTabla2' }, { text: 'Causa septenaria', style: 'fuenteTabla2' }, { text: 'Acción Correctiva', style: 'fuenteTabla2' }, { text: 'Responsable', style: 'fuenteTabla2' }, { text: 'Fecha', style: 'fuenteTabla2' }],
              [{ rowSpan: 10, text: ishikawa.problema, style: 'textoIshikawa' }, { text: 'Maquinaria', style: 'textoIshikawa' }, { text: 'Alta temperatura de las resistencias del filtro fino', style: 'textoIshikawa' }, { text: 'Por ajuste del proceso', style: 'textoIshikawa' }, { text: 'Por baja viscosidad de la resina', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: 'Bajar  temperaturas del filtro fino', style: 'textoIshikawa' }, { text: 'Aurelio Marcial', style: 'textoIshikawa' }, { text: '31/07/2018', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: 'Maquinaria', style: 'textoIshikawa' }, { text: 'Guarda de desgogue de aire del piston de purga inadecuado', style: 'textoIshikawa' }, { text: 'Ya que solo se coloco una guarda provicional', style: 'textoIshikawa' }, { text: 'Por que no venia de fabrica', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: 'Fabricar la guarda que lleva igual que en el extrusor 2', style: 'textoIshikawa' }, { text: 'Eduardo Izquierdo', style: 'textoIshikawa' }, { text: '15/08/2018', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }],
              [{ text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }, { text: '', style: 'textoIshikawa' }]
            ]
          }
        },
        '\n\n\n',
        //Verificación y Seguimiento
        {
          alignment: 'center',
          width: 220,
          image: 'data:image/png;base64,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'
        },
        '\n',
        {
          alignment: 'center',
          columns: [
            {
              text: 'Colocar el enunciado del problema',
              style: 'fuenteTabla2'
            },
            {
              text: 'Describe la causa raíz',
              style: 'fuenteTabla2'
            },
            {
              text: 'Coloca las acciones colectivas',
              style: 'fuenteTabla2'
            },
            {
              text: '¿Fueron efectivas?',
              style: 'fuenteTabla2'
            },
            {
              text: '¿Por qué?',
              style: 'fuenteTabla2'
            }
          ]
        },
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [140],
                heights: [300],
                body: [
                  [{ text: ishikawa.problema, style: 'textoIshikawa' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [140],
                heights: [300],
                body: [
                  [{ text: ishikawa.causa_raiz, style: 'textoIshikawa' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [140],
                heights: [45, 45, 45, 45, 45, 50],
                body: [
                  [{ text: 'Bajar temperaturas del filtro fino', style: 'textoIshikawa' }],
                  [{ text: 'Fabricar la guarda que lleva igual que en el extrusor 2', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [140],
                heights: [45, 45, 45, 45, 45, 50],
                body: [
                  [{ text: 'No', style: 'textoIshikawa' }],
                  [{ text: 'Sí', style: 'textoIshikawa' }],
                  [{ text: 'NO ', style: 'textoIshikawa' }],
                  [{ text: 'Sí', style: 'textoIshikawa' }],
                  [{ text: 'NO ', style: 'textoIshikawa' }],
                  [{ text: 'Sí', style: 'textoIshikawa' }],
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                heights: [45, 45, 45, 45, 45, 50],
                body: [
                  [{ text: 'Con este ajuste  evitamos que expulse el material arriba de 285 grados', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }],
                  [{ text: '', style: 'textoIshikawa' }]
                ]
              }
            }
          ]
        },
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [215, 15],
                body: [
                  [{ rowSpan: 2, text: '¿Se solucionó el problema?', style: 'fuentePregunta' }, { text: 'Sí X', style: 'textoIshikawa' }],
                  [{ text: '', style: 'fuentePregunta' }, { text: 'No ', style: 'textoIshikawa' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [215, 15],
                body: [
                  [{ rowSpan: 2, text: '¿Ha sido recurrente el problema?', style: 'fuentePregunta' }, { text: 'Sí ', style: 'textoIshikawa' }],
                  [{ text: '', style: 'fuentePregunta' }, { text: 'No ', style: 'textoIshikawa' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [215, 15],
                body: [
                  [{ rowSpan: 2, text: '¿Es necesario un analisis mas profundo?', style: 'fuentePregunta' }, { text: 'Sí ', style: 'textoIshikawa' }],
                  [{ text: '', style: 'fuentePregunta' }, { text: 'No ', style: 'textoIshikawa' }]
                ]
              }
            }
          ]
        },
        {
          alignment: 'center',
          columns: [
            {
              style: 'tabla',
              table: {
                widths: [240],
                heights: [10, 10],
                body: [
                  [{ text: ishikawa.elaborado, style: 'textoIshikawa' }],
                  [{ text: 'Elaboró', style: 'fuenteFirma' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [240],
                heights: [10, 10],
                body: [
                  [{ text: ishikawa.revisado, style: 'textoIshikawa' }],
                  [{ text: 'Revisó', style: 'fuenteFirma' }]
                ]
              }
            },
            {
              style: 'tabla',
              table: {
                widths: [240],
                heights: [10, 10],
                body: [
                  [{ text: ishikawa.autorizado, style: 'textoIshikawa' }],
                  [{ text: 'Autorizó(Gerente de Área)', style: 'fuenteFirma' }]
                ]
              }
            }
          ]
        }
      ],
      background: {
        alignment: 'center',
        opacity: 0.1,
        fontSize: 100,
        margin: [0, 100],
        image: 'data:image/png;base64,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'
      },
      pageOrientation: 'landscape',
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          alignment: 'center'
        }
        ,
        fuente: {
          fontSize: 16,
          bold: true,
          alignment: 'center'
        },
        tabla: {
          margin: [0, 5, 0, 15]
        },
        fuenteTabla: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          color: '#000000',
          fillColor: '#F2F2F2'
        },
        fuenteTabla2: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          color: '#000000',
          fillColor: '#F2F2F2'
        },
        fuentePregunta: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#000000'
        },
        fuenteFirma: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#000000',
          fillColor: '#F2F2F2'
        },
        textoTabla: {
          fontSize: 12,
          alignment: 'center'
        },
        textoIshikawa: {
          fontSize: 8,
          alignment: 'center'
        }
      }
    }
    pdfMake.createPdf(dd).open();
  }


  getDrawTestRaiz(listConsenso: Array<PetConsenso>): Array<any> {
    let test_raiz = [];
    let temporal = [];
    temporal.push({ text: 'Text de causa raíz', style: 'fuenteTabla' });
    temporal.push({ text: 'Sí', style: 'fuenteTabla' });
    temporal.push({ text: 'No', style: 'fuenteTabla' });
    test_raiz.push(temporal);
    listConsenso.forEach(el => {
      let temporal = [];
      switch (el.id_pregunta) {
        case 2:
          temporal.push({ text: '¿El enunciado de la causa raíz idenrifica a algún elemento del proceso?', style: 'fuenteTabla' });
          break;
        case 3:
          temporal.push({ text: '¿Es controlable la causa raíz?', style: 'fuenteTabla' });
          break;
        case 4:
          temporal.push({ text: '¿Se puede preguntar "por qué" otra vez y obtener otra causa raíz controlable?', style: 'fuenteTabla' });
          break;
        case 5:
          temporal.push({ text: '¿La causa raíz identificada es la falla fundamental del proceso?', style: 'fuenteTabla' });
          break;
        case 6:
          temporal.push({ text: 'Si corregimos o mejoramos la causa raíz identificada, ¿Asegurará que el problema identificado no vuelva a ocurrir?', style: 'fuenteTabla' });
          break;
        case 7:
          temporal.push({ text: '¿Hemos identificado la causa raíz del prblema?', style: 'fuenteTabla' });
          break;
        case 8:
          temporal.push({ text: 'Ya checamos que nuestra causa raíz identificada sea aplicable para más de una parte o proceso', style: 'fuenteTabla' });
          break;
      }

      if (el.respuesta == 1) {
        temporal.push({ text: 'X', style: 'textoTabla' });
        temporal.push({ text: '', style: 'textoTabla' });
      } else {
        temporal.push({ text: '', style: 'textoTabla' });
        temporal.push({ text: 'X', style: 'textoTabla' });
      }
      test_raiz.push(temporal);
    });
    return test_raiz;
  }

}
