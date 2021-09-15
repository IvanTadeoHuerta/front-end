import { Component, OnInit, Input } from '@angular/core';
import { PetReporteEnlace } from '../../models/pet-reporte-enlace';
import { FormatoEnlaceService } from '../../@shared/formato-enlace/formato-enlace.service';
import swal from 'sweetalert2';
import { AuthService } from '../../auth/auth.service';
import { isNum } from '../../utils';

declare var $: any;
declare var Materialize: any;
@Component({
  selector: 'app-formato-enlace',
  templateUrl: './formato-enlace.component.html',
  styleUrls: ['./formato-enlace.component.css'],
  providers: [ FormatoEnlaceService ]
})
export class FormatoEnlaceComponent implements OnInit {

  @Input() datos: PetReporteEnlace;
  @Input() consulta: boolean;

  constructor(
    private auth: AuthService,
    private service: FormatoEnlaceService
  ) { }

  ngOnInit() {
   
  }

  openModalConfirmacion(accion: string, event?: any): void {
    let mensajeModal = '';

    switch (accion) {
      case 'edit':
        mensajeModal = '¿Está seguro de actualizar los parametros del reporte? ';
        break;
      case 'add':
        mensajeModal = '¿Está seguro de agregar parametros al  reporte? ';
        break;
    }
     
    if (this.isValidData(this.datos)) {

      /* 
       * Configuración del modal de confirmación
       */
      swal({
        title: '<span style="color: #303f9f ">' + mensajeModal + '</span>',
        type: 'question',
        html: '<p style="color: #303f9f "> Periodo :</b>'+ this.datos.periodo.descripcion_mes +' '+ this.datos.periodo.anio +' </b></p>',
        showCancelButton: true,
        confirmButtonColor: '#303f9f',
        cancelButtonColor: '#9fa8da ',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Si!',
        allowOutsideClick: false,
        allowEnterKey: false,
        useRejections: true,
      }).then((result) => {
        /*
         * Si acepta
         */
        if (result.value) {
          switch (accion) {
            case 'edit':
              this.service.updateConfiguracion(this.auth.getIdUsuario(), this.datos).subscribe(result => {
                if (result.response.sucessfull) {

                  Materialize.toast(' Se actualizarón correctamente parametros', 4000, 'green');
                } else {

                  Materialize.toast(result.response.message, 4000, 'red');
                }
              }, error => {
                Materialize.toast('Ocurrió  un error en el servicio!', 4000, 'red');
              });
              break;
            case 'add':
              this.service.insertConfiguracion(this.auth.getIdUsuario(), this.datos).subscribe(result => {

                if (result.response.sucessfull) {
                  this.datos.id_reporte_enlace = result.response.message || -1;
                  this.datos.nuevo = false;
                  Materialize.toast(' Se agregaron correctamente parametros ', 4000, 'green');
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
    } else {

      Materialize.toast('Verifique los datos capturados!', 4000, 'red');

    }
  }

  isValidData(datos:PetReporteEnlace):boolean{

    return isNum(this.datos.eficiencia_entregas_compra_real) &&
    isNum(this.datos.eficiencia_entregas_compra_mensual) &&
    isNum(this.datos.no_fugas_pet_real) && 
    isNum(this.datos.costo_unitario) && 
    isNum(this.datos.ajuste_error_inventario) && 
    isNum(this.datos.eficiencia_carga_real) && 
    isNum(this.datos.descarga_mp_real) && 
    isNum(this.datos.liberacion_embarques) && 
    isNum(this.datos.efectividad_entrega_cliente_real) && 
    isNum(this.datos.control_entradas_salidas_contratistas) && 
    isNum(this.datos.control_entradas_salidas_transportistas) && 
    isNum(this.datos.control_entradas_salidas_proveedores) && 
    isNum(this.datos.control_entradas_salidas_visitantes) && 
    isNum(this.datos.ot_alimentadas_mp9) && 
    isNum(this.datos.merma_mensual) && 
    isNum(this.datos.merma_real) && 
    isNum(this.datos.subproducto_mensual) && 
    isNum(this.datos.costo_unitario_real) && 
    isNum(this.datos.mdp_real) && 
    isNum(this.datos.mdp_mensual)

  }
}
