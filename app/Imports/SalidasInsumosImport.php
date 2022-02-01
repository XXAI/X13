<?php

namespace App\Imports;


use Illuminate\Validation\Rule;

use App\Exceptions\DataException;
use Carbon\Carbon;
use DB;

//use App\Models\User;
use App\Models\BienServicio;
use App\Models\Movimiento;
use App\Models\MovimientoInsumo;
use App\Models\Stock;




use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;


class SalidasInsumosImport implements ToCollection,WithStartRow,SkipsEmptyRows //ToModel, WithValidation
{
    
    
    private $rowErrors;
    private $almacen_id;

    public function __construct($almacen_id) 
    {
        $this->almacen_id = $almacen_id;
        $this->rowErrors = [];
    }

    /**
     * @return int
     */
    public function startRow(): int
    {
        return 2;
    }
    
    public function collection(Collection $rows)
    {
        $unidadesBatch = [];
        $rowIndex = 2;

        // Arupamos por clues
        foreach ($rows as $row) 
        {            
            $this->insertUnidadesItem($unidadesBatch, $row, $rowIndex);
            $rowIndex++;
        }

       

        if (count($this->rowErrors))
        {
            throw new DataException($this->rowErrors);
        }

        // Si no hay errores continuamos y agrupamos por movimiento por cada clues
        $movimientosBatch = [];
        foreach($unidadesBatch as $unidadBatch)
        {  
            foreach ($unidadBatch as $row) 
            {                  
                $this->insertMovimientoItem($movimientosBatch,$row);
            }
        }

        DB::beginTransaction();
        
        // Debug
        $movimientosCreated = [];
        $stocksUpdated= [];
        $movimientosInsumosCreated = [];
        // ----

        try
        {
            foreach($movimientosBatch as $batch)
            {
    
                $movimiento = Movimiento::create([
                    "almacen_id"=>$this->almacen_id,
                    "direccion_movimiento" => "SAL",
                    "estatus" => "IM-FI",
                    "fecha_movimiento"=> $batch["fecha_movimiento"],
                    "clues" => $batch["clues"],
                    "descripcion" => "Importación de salidas por traspaso a unidades con layout xlsx"
                ]);
                // Debug
                $movimientosCreated[] = $movimiento;
                // ----

                foreach($batch["insumos"] as $insumo)
                {
                    $bienServicio = BienServicio::where("clave_local",$insumo["clave"])->first();

                    if($bienServicio != null)
                    {
                        $stock = Stock::where("almacen_id",$this->almacen_id)
                        ->where("bien_servicio_id",$bienServicio->id)
                        ->where("lote",$insumo["lote"])
                        ->where("fecha_caducidad",$insumo["fecha_caducidad"])->first();
                        
                        $cantidad_anterior = 0;
                        if($stock != null)
                        {

                            $existencia = (int)$stock->existencia - (int) $insumo["cantidad"];

                            if($existencia >= 0)
                            {
                                $cantidad_anterior = $stock->existencia;
                                $stock->existencia = $existencia;
                                $stock->save();

                                $movimientoInsumo = MovimientoInsumo::create(
                                    [
                                        "movimiento_id" => $movimiento->id,
                                        "stock_id" => $stock->id,
                                        "bien_servicio_id"=>$bienServicio->id,
                                        "direccion_movimiento" => "SAL",
                                        "modo_movimiento" => "NRM",
                                        "cantidad" => $insumo["cantidad"],
                                        "cantidad_anterior" => $cantidad_anterior,
                                    ]
                                );
                                // Debug
                                $stocksUpdated[] = $stock;
                                $movimientosInsumosCreated[] = $movimientoInsumo;
                                // ----
                            }
                            else
                            {
                                $this->addToErrors("No se pueden generar existencias negativas -> Stock antes de ejecutar fila: ".$stock->existencia.", Cantidad: ".$insumo["cantidad"].", Resultado: ".$existencia,$insumo["excel_index"],$insumo);
                            }                            
                        }
                        else
                        {
                            $this->addToErrors("Insumo no existe en stock",$insumo["excel_index"],$insumo);
                        }
                    }
                    else
                    {
                        $this->addToErrors("Insumo no existe",$insumo["excel_index"],$insumo);
                    }                    
                }
            }

            if (count($this->rowErrors) == 0)
            {
                DB::commit();
            }            
            
        }
        catch(\Exception $e)
        {
            throw new DataException([],$e->getMessage());
            DB::rollback();
        }

        if (count($this->rowErrors) > 0)
        {
            throw new DataException($this->rowErrors);
        }
        /*
        //Debug       
        throw new DataException([
            "movimientos_creados" => $movimientosCreated,
            "stocks_actualizados" => $stocksUpdated,
            "movimientos_insumos_creados" => $movimientosInsumosCreated

        ]);*/
    }


    private function addToErrors($message, $index, $data)
    {
        $this->rowErrors[] = [
            'message' => $message,
            "index" => $index,
            "data" => $data
        ];
    }

    private function insertMovimientoItem(&$array, $row)
    {      
        
        $array[$row["fecha_movimiento"].".".$row["clues"]]["fecha_movimiento"] = $row["fecha_movimiento"];
        $array[$row["fecha_movimiento"].".".$row["clues"]]["clues"] = $row["clues"];
        $array[$row["fecha_movimiento"].".".$row["clues"]]["insumos"][] = $row["insumo"] ;
    }

    private function insertUnidadesItem(&$array, $row, $index)
    {
        
        $fecha_movimiento = explode("-",$row[1]);
        $fecha_caducidad = explode("-",$row[6]);

        
        if( count($fecha_movimiento) != 3 || !checkdate($fecha_movimiento[1],$fecha_movimiento[2],$fecha_movimiento[0]))
        {
            $this->addToErrors("Fecha movimiento inválida: ".$row[1].", el formato valido es: AAAA-MM-DD", $index, $row);
            return;
        }

        if( count($fecha_caducidad) != 3 || !checkdate($fecha_caducidad[1],$fecha_caducidad[2],$fecha_caducidad[0]))
        {
            $this->addToErrors("Fecha caducidad inválida: ".$row[6].", el formato valido es: AAAA-MM-DD", $index, $row);
            return;
        }


        if( $row[4] <= 0 || !is_numeric($row[4]))
        {
            $this->addToErrors("Cantidad inválida: ".$row[4].", debe ser un número entero y mayor a 0", $index, $row);
            return;
        }
        
        $array[$row[0]][] = [
            "clues" => $row[0],   
            "fecha_movimiento" =>$row[1] ,                         
            "insumo" => [
                "clave" => $row[2],
                "cantidad" => $row[4],
                "lote" => $row[5],
                "fecha_caducidad" => $row[6],
                "excel_index" => $index,
            ]            
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