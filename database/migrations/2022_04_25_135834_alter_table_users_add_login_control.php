<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableUsersAddLoginControl extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_login')->after('unidad_medica_asignada_id')->nullable();
            $table->integer('failed_attempts')->after('last_login')->default(0);
            $table->string('status',5)->after('failed_attempts')->default('OK');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_login');
            $table->dropColumn('failed_attempts');
            $table->dropColumn('status');
        });
    }
}
