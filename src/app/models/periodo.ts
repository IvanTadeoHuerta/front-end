export class Periodo {
    id_periodo: number;
    anio: number;
    mes: number;
    descripcion_mes: string;
    estatus: number;

    id_metas_periodo?:number;
    disponibilidad?:number;
    utilizacion?:number;
    calidad?:number;
    oee?:number;
    eficiencia_teorica?:number;
}
