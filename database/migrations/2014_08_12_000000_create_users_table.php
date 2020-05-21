<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            //$table->smallIncrements('id')->unsigned();
            $table->string('id')->primary();
            $table->string('servidor_id',4);
            $table->bigInteger('incremento');

            $table->string('username');
            $table->string('password');
            
            $table->string('name');
            $table->string('email')->unique();
            $table->boolean('is_superuser')->default(false);
            $table->string('avatar')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
