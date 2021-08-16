<?php

namespace App\Exceptions;

use Exception;

class DataException extends Exception
{
    private $_data;

    public function __construct($data = [], $message = "", $code = 0, Exception $previous =  null) 
    {
        parent::__construct($message, $code, $previous);

        $this->_data = $data; 
    }

    public function getData() { return $this->_data; }
}
