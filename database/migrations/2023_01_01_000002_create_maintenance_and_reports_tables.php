<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained()->onDelete('cascade');
            $table->string('service_type'); // Oil change, Brake repair, etc.
            $table->decimal('cost', 15, 2);
            $table->date('date');
            $table->integer('odometer_reading');
            $table->text('notes')->nullable();
            $table->string('service_center')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'date']);
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('type'); // monthly, annual, vehicle_specific
            $table->jsonb('data'); // Stores the generated report metrics
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->uuidMorphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('maintenance_records');
    }
};
