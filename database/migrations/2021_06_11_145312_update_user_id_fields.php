<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateUserIdFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('permission_user', function(Blueprint $table){
            $table->dropForeign(['user_id']);
        });

        Schema::table('role_user', function(Blueprint $table){
            $table->dropForeign(['user_id']);
        });

        Schema::table('users', function(Blueprint $table){
            $table->bigIncrements('id')->change();
            $table->dropColumn('servidor_id');
            $table->dropColumn('incremento');
        });

        Schema::table('almacenes', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('grupos_usuarios', function(Blueprint $table){
            $table->bigInteger('usuario_id')->unsigned()->change();
        });

        Schema::table('movimientos', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('movimientos_insumos', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('movimientos_insumos_borrador', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('permission_user', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('role_user', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });

        Schema::table('stocks', function(Blueprint $table){
            $table->bigInteger('user_id')->unsigned()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function(Blueprint $table){
            $table->string('id')->change();
            $table->string('servidor_id',4)->after('id');
            $table->bigInteger('incremento')->after('servidor_id');
        });

        Schema::table('almacenes', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('grupos_usuarios', function(Blueprint $table){
            $table->string('usuario_id')->unsigned()->change();
        });

        Schema::table('movimientos', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('movimientos_insumos', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('movimientos_insumos_borrador', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('permission_user', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('role_user', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });

        Schema::table('stocks', function(Blueprint $table){
            $table->string('user_id')->unsigned()->change();
        });
    }
}
