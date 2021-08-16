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


class ExistenciasInsumosImport implements ToCollection,WithStartRow,SkipsEmptyRows //ToModel, WithValidation
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

        try
        {
            $movimiento = Movimiento::create([
                "almacen_id"=>$this->almacen_id,
                "direccion_movimiento" => "INI",
                "estatus" => "IM-FI",
                "fecha_movimiento"=> date('Y-m-d'),
                "descripcion" => "Importación de existencias (Inicialización de inventario) con layout xlsx",
                "observaciones" => "Esta operación sustituye existencias"
            ]);

            Stock::where("almacen_id",$this->almacen_id)->delete();

            // Debug 
            $movimientoCreated = $movimiento;
            // ----

            foreach($batch as $insumo)
            {
                $bienServicio = BienServicio::where("clave_local",$insumo["clave"])->first();

                if($bienServicio != null)
                {

                    // This is to avoid duplicate stock
                    $stock = Stock::where("almacen_id",$this->almacen_id)
                    ->where("bienes_servicios_id",$bienServicio->id)
                    ->where("lote",$insumo["lote"])
                    ->where("fecha_caducidad",$insumo["fecha_caducidad"])->first();
                    
                    $cantidad_anterior = 0;
                    if($stock != null)
                    {
                        $cantidad_anterior = $stock->existencia;
                        $stock->existencia = $insumo["cantidad"];
                        $stock->save();
                    }
                    else
                    {
                        $stock = Stock::create(
                            [
                                "almacen_id"=>$this->almacen_id,
                                "bienes_servicios_id"=>$bienServicio->id,
                                "lote"=>$insumo["lote"],
                                "fecha_caducidad" => $insumo["fecha_caducidad"],
                                "existencia" => $insumo["cantidad"]
                            ]
                        );
                    }

                    $movimientoInsumo = MovimientoInsumo::create(
                        [
                            "movimiento_id" => $movimiento->id,
                            "stock_id" => $stock->id,
                            "bienes_servicios_id"=>$bienServicio->id,
                            "direccion_movimiento" => "INI",
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
                    $this->addToErrors("Insumo no existe",$insumo["excel_index"],$insumo);
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

        if (count($this->rowErrors))
        {
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

   

    private function insertBatchItem(&$array, $row, $index)
    {
        
        $fecha_caducidad = explode("-",$row[3]);               

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
        
        $array[] = [
            "clave" => $row[0],            
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