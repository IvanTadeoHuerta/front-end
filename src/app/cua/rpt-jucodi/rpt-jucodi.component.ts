import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { RptJucodiService } from "./rpt-jucodi.service";
import { AuthService } from '../../auth/auth.service';
import { Periodo } from '../../models/periodo';
import { Catalogo } from '../../models/catalogo';
import { getTablaUtf8 } from '../../utils';


declare var $: any;
declare var Materialize: any;
@Component({
  selector: 'app-rpt-jucodi',
  templateUrl: './rpt-jucodi.component.html',
  providers: [RptJucodiService]
  
})
export class RptJucodiComponent implements OnInit {

  public loading: boolean;
  public submitted: boolean;
  public viewReport: boolean;
  public formConsultaPeriodo: FormGroup;
  public parametrosBusqueda: any;
  public rows: Array<any>;
  public anios: Array<any>;
  public meses: Array<any>;
  public periodos: Array<Periodo>;
  public gruposLineas: Array<Catalogo>;

  constructor(
    private service: RptJucodiService,
    private auth: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    this.loading = true;
    this.submitted = false;
    this.viewReport = false;
    this.rows = [];
    this.parametrosBusqueda = {
      dia: ""
    };
    this.anios = [];
    this.meses = [];
    this.periodos = [];
    this.gruposLineas = [];

    this.service.getCatalogos(this.auth.getIdUsuario()).subscribe(result => {

      if (result.response.sucessfull) {
        this.gruposLineas = result.data.listGposLineas || [];
        this.gruposLineas = this.gruposLineas.filter(el => el.id != 4).map(el => el);
        this.periodos = result.data.listPeriodos || [];
        let tmpAnios = this.periodos.map(el => el.anio);
        this.periodos.filter((el, index) => {
          if (tmpAnios.indexOf(el.anio) === index) {
            this.anios.push({ valor: el.anio });
          }
        });

        this.loading = false;
        this.loadFormulario();

        setTimeout(() => { this.ngAfterViewHttp(); }, 200)
      } else {

        this.loading = false;
        Materialize.toast(result.response.message, 4000, 'red');
      }
    }, error => {

      this.loading = false;
      Materialize.toast('Ocurrió un error en el servicio!', 4000, 'red');
    });


  }

  loadFormulario(): void {
    this.formConsultaPeriodo = this.fb.group({
      idGpoLinea: new FormControl({ value: this.parametrosBusqueda.idGpoLinea }, [Validators.required]),
      dia: new FormControl({ value: this.parametrosBusqueda.dia }, [Validators.required]),
    });
  }

  /*
* Carga plugins despues de cargar y mostrar objetos en el DOM cuando carga la pagina
*/
  ngAfterViewHttp(): void {
    $('.tooltipped').tooltip({ delay: 50 });
    $('select').material_select();

    $('#dia').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15, // Creates a dropdown of 15 years to control year,
      today: '',
      clear: 'Limpiar',
      close: 'OK',
      monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      weekdaysLetter: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      format: 'dd/mm/yyyy',
      closeOnSelect: false, // Close upon selecting a date,
      onClose: () => {
        this.parametrosBusqueda.dia = $('#dia').val();
        this.viewReport = false;
      }
    });

  }

  changeCombo(params: string): void {
    this.viewReport = false;
    if (params == 'anio') {
      this.meses = this.periodos.filter(el => el.anio == this.parametrosBusqueda.anio)
    }
  }

  busqueda(parametrosBusqueda: any) {

    this.viewReport = false;
    this.submitted = true;
    this.rows = [];

    if (this.formConsultaPeriodo.valid) {

      this.service.reporteJUCODI(this.auth.getIdUsuario(), parametrosBusqueda).subscribe(result => {
        console.log('datos jucodi',result)
        if (result.response.sucessfull) {
          this.rows = result.data.reporteDailyPerformance || [];
          this.viewReport = true;
          setTimeout(() => {  
           
          }, 1000);

        } else {

          this.viewReport = false;
          Materialize.toast(result.response.message, 4000, 'red');
        }
      }, error => {

        this.viewReport = false;
        Materialize.toast('Ocurrió un error en el servicio!', 4000, 'red');
      });
    } else {
      this.viewReport = false;
      Materialize.toast('Ingrese todos los datos para mostrar reporte!', 4000, 'red');
    }
  }

  regresar() {
    $('.tooltipped').tooltip('hide');
  }

  
  exportarExcel(): void {
    let linkFile = document.createElement('a');
    let data_type = 'data:application/vnd.ms-excel;';

    let tablas = getTablaUtf8('tblReporte');
   
    linkFile.href = data_type + ', ' + tablas;
    linkFile.download = 'ReporteDisponibilidad';

    linkFile.click();
    linkFile.remove();

  }

}
