<?php

namespace App\Imports;


use Illuminate\Validation\Rule;

use App\Exceptions\DataException;
use Carbon\Carbon;
use DB;

use App\Models\BienServicio;
use App\Models\Movimiento;
use App\Models\MovimientoArticulo;
use App\Models\TipoMovimiento;
use App\Models\Stock;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;


class ExistenciasInsumosImport implements ToCollection,WithStartRow,SkipsEmptyRows{ //ToModel, WithValidation

    private $rowErrors;
    private $almacen_id;
    private $programa_id;

    public function __construct($almacen_id,$programa_id){
        $this->almacen_id = $almacen_id;
        $this->programa_id = $programa_id;
        $this->rowErrors = [];
    }
    /**
     * @return int
     */
    public function startRow(): int{
        return 2;
    }
    
    public function collection(Collection $rows){
        $rowIndex = 2;

        $batch = [];
        //Validación de registros
        foreach ($rows as $row) 
        {            
            $this->insertBatchItem($batch, $row, $rowIndex);
            $rowIndex++;
        }

        if (count($this->rowErrors))
        {
            throw new DataException($this->rowErrors);
        }

        DB::beginTransaction();
        
        // Debug 
        $movimientoCreated = null;
        $stocksUpdated= [];
        $movimientosInsumosCreated = [];
        // ----
        $loggedUser = auth()->userOrFail();
        $tipo_movimiento = TipoMovimiento::where('clave','INI')->first();
        $unidad_medica_id = $loggedUser->unidad_medica_asignada_id;

        try{
            $movimiento = Movimiento::create([
                "unidad_medica_id"=>$unidad_medica_id,
                "almacen_id"=>$this->almacen_id,
                "programa_id"=>$this->programa_id,
                "direccion_movimiento" => "ENT",
                "tipo_movimiento_id" => $tipo_movimiento->id,
                "estatus" => "FIN",
                "fecha_movimiento"=> date('Y-m-d'),
                "descripcion" => "Importación de existencias (Inicialización de inventario) con layout xlsx",
                "observaciones" => "Esta operación sustituye existencias",
                "creado_por_usuario_id" => $loggedUser->id,
                "concluido_por_usuario_id" => $loggedUser->id,
            ]);

            Stock::where("almacen_id",$this->almacen_id)->where("programa_id",$this->programa_id)->delete();

            // Debug 
            $movimientoCreated = $movimiento;
            // ----

            foreach($batch as $insumo){
                $bienServicio = BienServicio::where("clave_local",$insumo["clave"])->first();

                if($bienServicio != null){
                    // This is to avoid duplicate stock
                    $stock = Stock::where("unidad_medica_id",$unidad_medica_id)
                    ->where("almacen_id",$this->almacen_id)
                    ->where("programa_id",$this->programa_id)
                    ->where("bien_servicio_id",$bienServicio->id)
                    ->where("lote",$insumo["lote"])
                    ->where("fecha_caducidad",$insumo["fecha_caducidad"])->first();
                    
                    $cantidad_anterior = 0;
                    if($stock != null){
                        $cantidad_anterior = $stock->existencia;
                        $stock->existencia = $insumo["cantidad"];
                        $stock->save();
                    }else{
                        $stock = Stock::create(
                            [
                                "unidad_medica_id"=>$unidad_medica_id,
                                "almacen_id"=>$this->almacen_id,
                                "programa_id"=>$this->programa_id,
                                "bien_servicio_id"=>$bienServicio->id,
                                "lote"=>$insumo["lote"],
                                "fecha_caducidad" => $insumo["fecha_caducidad"],
                                "existencia" => $insumo["cantidad"]
                            ]
                        );
                    }

                    $movimientoArticulo = MovimientoArticulo::create(
                        [
                            "movimiento_id" => $movimiento->id,
                            "stock_id" => $stock->id,
                            "bien_servicio_id"=>$bienServicio->id,
                            "direccion_movimiento" => "ENT",
                            "modo_movimiento" => "INI",
                            "cantidad" => $insumo["cantidad"],
                            "cantidad_anterior" => $cantidad_anterior,
                        ]
                    );

                    // Debug
                    $stocksUpdated[] = $stock;
                    $movimientosInsumosCreated[] = $movimientoArticulo;
                    // ----
                }else{
                    $this->addToErrors("Insumo no existe",$insumo["excel_index"],$insumo);
                }                    
            }
            if (count($this->rowErrors) == 0)
            {
                DB::commit();
            }
        }catch(\Exception $e){
            throw new DataException([],$e->getMessage());
            DB::rollback();
        }

        if (count($this->rowErrors)){
            throw new DataException($this->rowErrors);
        }
         /*  
        // Debug    
        throw new DataException([
            "movimiento_creado" => $movimientoCreated,
            "stocks_actualizados" => $stocksUpdated,
            "movimientos_insumos_creados" => $movimientosInsumosCreated

        ]);*/
    }

    private function getProveedorId($nombre):int
    {
        
        foreach($this->proveedores as $proveedor)
        {
            
            if($proveedor->nombre == trim($this->removeAccents($nombre)))
            {
                return $proveedor->id;
            }
        }
        return -1;
    }

    private function addToErrors($message, $index, $data)
    {
        $this->rowErrors[] = [
            'message' => $message,
            "index" => $index,
            "data" => $data
        ];
    }

   

    private function insertBatchItem(&$array, $row, $index){
        if($row[3]){
            $fecha_caducidad = explode("-",$row[3]);
            if( count($fecha_caducidad) != 3 || !checkdate($fecha_caducidad[1],$fecha_caducidad[2],$fecha_caducidad[0])){
                $this->addToErrors("Fecha caducidad inválida: ".$row[6].", el formato valido es: AAAA-MM-DD", $index, $row);
                return;
            }
        }
        
        if( $row[4] <= 0 || !is_numeric($row[4])){
            $this->addToErrors("Cantidad inválida: ".$row[4].", debe ser un número entero y mayor a 0", $index, $row);
            return;
        }
        
        $array[] = [
            "clave" => $row[0],
            "articulo" => $row[1],
            "lote" => $row[2],
            "fecha_caducidad" => $row[3],
            "cantidad" => $row[4],
            "excel_index" => $index,
        ];
    }

    private function removeAccents($string) : string {
        $string = str_replace(
            array('Á', 'À', 'Â', 'Ä', 'á', 'à', 'ä', 'â', 'ª'),
            array('A', 'A', 'A', 'A', 'a', 'a', 'a', 'a', 'a'),
            $string
            );
     
            //Reemplazamos la E y e
            $string = str_replace(
            array('É', 'È', 'Ê', 'Ë', 'é', 'è', 'ë', 'ê'),
            array('E', 'E', 'E', 'E', 'e', 'e', 'e', 'e'),
            $string );
     
            //Reemplazamos la I y i
            $string = str_replace(
            array('Í', 'Ì', 'Ï', 'Î', 'í', 'ì', 'ï', 'î'),
            array('I', 'I', 'I', 'I', 'i', 'i', 'i', 'i'),
            $string );
     
            //Reemplazamos la O y o
            $string = str_replace(
            array('Ó', 'Ò', 'Ö', 'Ô', 'ó', 'ò', 'ö', 'ô'),
            array('O', 'O', 'O', 'O', 'o', 'o', 'o', 'o'),
            $string );
     
            //Reemplazamos la U y u
            $string = str_replace(
            array('Ú', 'Ù', 'Û', 'Ü', 'ú', 'ù', 'ü', 'û'),
            array('U', 'U', 'U', 'U', 'u', 'u', 'u', 'u'),
            $string );
     
            //Reemplazamos la N, n, C y c
            $string = str_replace(
            array('Ñ', 'ñ', 'Ç', 'ç'),
            array('N', 'n', 'C', 'c'),
            $string
            );
            
        return $string;        
    }
}