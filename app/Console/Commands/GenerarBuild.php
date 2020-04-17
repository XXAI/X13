<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerarBuild extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generar:build';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $ruta_app = base_path() . '\resources\frontend';
        $ruta_views = base_path() . '\resources\views\\';
        $ruta_public = public_path() . '\\';

        chdir($ruta_app);
        echo 'Cambio a ruta ' . $ruta_app . "\r\n \n";

        echo "----> Generando build producción \r\n";
        exec('ng build --prod --base-href=', $output, $return);
        
        // Return will return non-zero upon an error
        if (!$return) {
            echo "Build generado \r\n \n";
        } else {
            echo "Ocurrio un error al generar el build. \r\n \n";
            return false;
        }
        
        chdir($ruta_public);
        echo '----> Eliminando archivos en ' . $ruta_public . "\r\n";
        array_map('unlink', glob("$ruta_public*.js"));
        array_map('unlink', glob("$ruta_public*.map"));
        array_map('unlink', glob("$ruta_public*.css"));
        array_map('unlink', glob("$ruta_public*.svg"));
        array_map('unlink', glob("$ruta_public*.jpg"));
        $this->delete_folder('assets/');
        echo "Archivos eliminados \r\n \n";
        
        $ruta_build = $ruta_app . '\dist\ng-build\\';
        echo '----> Copiando archivos de '. $ruta_build .' a ' . $ruta_public . "\r\n";
        $this->copy_files($ruta_build,$ruta_public,'*.js');
        $this->copy_files($ruta_build,$ruta_public,'*.css');
        $this->copy_files($ruta_build,$ruta_public,'*.jpg');
        $this->copy_files($ruta_build,$ruta_public,'*.svg');
        $this->copy_files($ruta_build,$ruta_public,'*.ico');
        mkdir($ruta_public.'assets\\', 0775, true);
        $this->copy_folder($ruta_build.'assets\\',$ruta_public.'assets\\');

        echo '----> Copiando archivo index de '. $ruta_build .' a ' . $ruta_views . "\r\n";
        copy($ruta_build.'index.html',$ruta_views.'index.html');

        echo "Archivos copiados \r\n \n";
    }

    function copy_files($source, $dest, $options){
        $files = glob( $source . $options, GLOB_MARK ); //GLOB_MARK adds a slash to directories returned
    
        foreach( $files as $file ){
            $file_name = str_replace($source,'',$file);
            copy($file, $dest.$file_name);
        }
    }

    function copy_folder($src, $dst) {  
  
        // open the source directory 
        $dir = opendir($src);  
      
        // Make the destination directory if not exist 
        @mkdir($dst);  
      
        // Loop through the files in source directory 
        while( $file = readdir($dir) ) {  
      
            if (( $file != '.' ) && ( $file != '..' )) {  
                if ( is_dir($src . '/' . $file) )  {  
      
                    // Recursively calling custom copy function 
                    // for sub directory  
                    $this->copy_folder($src . '/' . $file, $dst . '/' . $file);  
      
                }  
                else {  
                    copy($src . '/' . $file, $dst . '/' . $file);  
                }  
            }  
        }
        closedir($dir); 
    }

    function delete_folder($target) {
        if(is_dir($target)){
            $files = glob( $target . '*', GLOB_MARK ); //GLOB_MARK adds a slash to directories returned
    
            foreach( $files as $file ){
                $this->delete_folder( $file );      
            }
            rmdir( $target );
        } elseif(is_file($target)) {
            unlink( $target );  
        }
    }
}
