<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Events\AfterSheet;
use \Maatwebsite\Excel\Sheet;

/*
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;*/

Sheet::macro('freezePane', function (Sheet $sheet, $pane) {
    $sheet->getDelegate()->getActiveSheet()->freezePane($pane);  // <-- https://stackoverflow.com/questions/49678273/setting-active-cell-for-excel-generated-by-phpspreadsheet
});

Sheet::macro('styleCells', function (Sheet $sheet, string $cellRange, array $style) {
    $sheet->getDelegate()->getStyle($cellRange)->applyFromArray($style);
});

class DevReportExport implements FromCollection, WithHeadings, ShouldAutosize, WithEvents, WithColumnWidths, WithColumnFormatting //, WithMapping
{
    use Exportable;

    protected $column_widths = [];
    protected $column_formats = [];
    protected $total_rows = 0;

    public function __construct($data, $headings, $widths = [], $formats = []){
        $this->data = $data;
        $this->headings = $headings;
        $this->column_widths = $widths;
        $this->column_formats = $formats;
        $this->total_rows = count($data);
    }

    // freeze the first row with headings
    public function registerEvents(): array{
        return [            
            AfterSheet::class => function(AfterSheet $event) {
                $event->sheet->freezePane('A2', 'A2');
                $event->sheet->styleCells(
                    'A1:'.($event->sheet->getHighestColumn()).'1',
                    [
                        'alignment' => [
                            'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                            'wrapText'  => true,
                        ],
                        'fill' => [
                            'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                            'color' => ['argb' => 'DDDDDD']
                        ],
                        'font' => array(
                            'name'      =>  'Calibri',
                            'size'      =>  10,
                            'bold'      =>  true,
                            'color' => ['argb' => '000000'],
                        )
                    ]
                );
            }
        ];
    }

    public function collection(){
        return collect($this->data);
    }

    public function headings(): array{
        return $this->headings;
    }

    public function columnWidths(): array{
        return $this->column_widths;
    }

    public function columnFormats(): array{
        $apply_formats = [];
        if(count($this->column_formats)){
            foreach ($this->column_formats as $key => $value) {
                $apply_formats[$key.'2:'.$key.$this->total_rows] = $value;
            }
        }
        return $apply_formats;
    }
}
