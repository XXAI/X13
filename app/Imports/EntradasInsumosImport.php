<?php

namespace App\Imports;


use Illuminate\Validation\Rule;

use App\Exceptions\DataException;
use Carbon\Carbon;
use DB;

//use App\Models\User;
use App\Models\Proveedor;
use App\Models\Pedido;
use App\Models\BienServicio;
use App\Models\Movimiento;
use App\Models\MovimientoInsumo;
use App\Models\Stock;




use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;


class EntradasInsumosImport implements ToCollection,WithStartRow,SkipsEmptyRows //ToModel, WithValidation
{

    private $proveedores;
    private $rowErrors;
    private $almacen_id;
    private $pedido_id; //Harima:: Temporal para guardado con recepciones de pedidos

    public function __construct($almacen_id, $pedido_id = null) //Harima:: Se agrego parametro opcional pedido_id
    {
        $this->almacen_id = $almacen_id;

        if($pedido_id){ //Harima:: Se agrego parametro opcional pedido_id
            $this->pedido_id = $pedido_id;
        }

        $this->proveedores = Proveedor::all();
        $this->rowErrors = [];
        

        foreach ($this->proveedores as $proveedor) 
        {
            $proveedor->nombre = $this->removeAccents($proveedor->nombre);
        }
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
        $proveedoresBatch = [];

        $rowIndex = 2;

        // Validamos los registros y los agrupamos por proveedor
        foreach ($rows as $row) 
        {            
            $this->insertProveedoresItem( $proveedoresBatch, $row, $rowIndex);
            $rowIndex++;
        }

        if (count($this->rowErrors))
        {
            throw new DataException($this->rowErrors);
        }
        //throw new DataException($proveedoresBatch);
        // Si no hay errores continuamos y agrupamos por movimiento por cada proveedor
        $movimientosBatch = [];


        foreach($proveedoresBatch as $proveedorBatch)
        {  
            foreach ($proveedorBatch as $row) 
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
            if($this->pedido_id){ //Harima:: Se agrego parametro opcional pedido_id
                $pedido = Pedido::find($this->pedido_id);
            }

            foreach($movimientosBatch as $batch)
            {
    
                $movimiento = Movimiento::create([
                    "almacen_id"=>$this->almacen_id,
                    "direccion_movimiento" => "ENT",
                    "estatus" => "IM-FI",
                    "fecha_movimiento"=> $batch["fecha_movimiento"],
                    "proveedor_id" => $batch["proveedor_id"],
                    "descripcion" => "Importación de entradas por proveedor con layout xlsx"
                ]);

                if($this->pedido_id){ //Harima:: Se agrego parametro opcional pedido_id
                    $pedido->recepcionActual()->attach($movimiento);
                }
                
                // Debug 
                $movimientosCreated[] = $movimiento;
                // ----

                foreach($batch["insumos"] as $insumo)
                {
                    $bienServicio = BienServicio::where("clave_local",$insumo["clave"])->first();

                    if($bienServicio != null)
                    {
                        $stock = Stock::where("almacen_id",$this->almacen_id)
                        ->where("bienes_servicios_id",$bienServicio->id)
                        ->where("lote",$insumo["lote"])
                        ->where("fecha_caducidad",$insumo["fecha_caducidad"])->first();
                        
                        $cantidad_anterior = 0;
                        if($stock != null)
                        {
                            $cantidad_anterior = $stock->existencia;
                            $stock->existencia = (int)$stock->existencia + (int) $insumo["cantidad"];
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
                                "direccion_movimiento" => "ENT",
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
            "movimientos_creados" => $movimientosCreated,
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

    private function insertMovimientoItem(&$array, $row)
    {      
        
        $array[$row["fecha_movimiento"].".".$row["proveedor_id"]]["fecha_movimiento"] = $row["fecha_movimiento"];
        $array[$row["fecha_movimiento"].".".$row["proveedor_id"]]["proveedor_id"] = $row["proveedor_id"];
        $array[$row["fecha_movimiento"].".".$row["proveedor_id"]]["insumos"][] = $row["insumo"] ;
    }

    private function insertProveedoresItem(&$array, $row, $index)
    {
        
        $proveedorId = $this->getProveedorId($row[1]);
        if($proveedorId !== -1)
        {
            $fecha_movimiento = explode("-",$row[0]);
            $fecha_caducidad = explode("-",$row[6]);

            
            if( count($fecha_movimiento) != 3 || !checkdate($fecha_movimiento[1],$fecha_movimiento[2],$fecha_movimiento[0]))
            {
                $this->addToErrors("Fecha movimiento inválida: ".$row[0].", el formato valido es: AAAA-MM-DD", $index, $row);
                return;
            }

            if( count($fecha_caducidad) != 3 || !checkdate($fecha_caducidad[1],$fecha_caducidad[2],$fecha_caducidad[0]))
            {
                $this->addToErrors("Fecha caducidad inválida: ".$row[6].", el formato valido es: AAAA-MM-DD", $index, $row);
                return;
            }

            $dateMovimiento = Carbon::createFromFormat('Y-m-d', $row[0]);
            $dateCaducidad = Carbon::createFromFormat('Y-m-d', $row[6]);

            if($dateCaducidad->lt($dateMovimiento))
            {
                $this->addToErrors("Entrega de insumo caducado, fecha de entrega: ".$row[0].", fecha de caducidad: ".$row[6], $index, $row);
                return;
            }

            if( $row[4] <= 0 || !is_numeric($row[4]))
            {
                $this->addToErrors("Cantidad inválida: ".$row[4].", debe ser un número entero y mayor a 0", $index, $row);
                return;
            }
            
            $array[$row[1]][] = [
                "fecha_movimiento" => $row[0],
                "proveedor_id" => $proveedorId,                
                "insumo" => [
                    "clave" => $row[2],
                    "cantidad" => $row[4],
                    "lote" => $row[5],
                    "fecha_caducidad" => $row[6],
                    "excel_index" => $index,
                ]
                
            ];
        }
        else 
        {
            $this->addToErrors("Proveedor no existe en la base de datos: ".$row[1], $index, $row);
        }
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