<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdatePermissionsTableAsIsSuper extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->boolean('is_super')->after('group')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('is_super');
        });
    }
}
