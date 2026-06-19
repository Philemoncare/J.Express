<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('plate_number')->unique();
            $table->string('vin')->unique()->nullable();
            $table->string('model');
            $table->string('make');
            $table->year('year');
            $table->enum('status', ['active', 'maintenance', 'inactive'])->default('active');
            $table->decimal('current_odometer', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('plate_number');
            $table->index('status');
        });

        Schema::create('incomes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('driver_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('source');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'date']);
            $table->index('driver_id');
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('category');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'date']);
            $table->index('category');
        });

        Schema::create('fuel_purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('driver_id')->constrained('users')->onDelete('cascade');
            $table->decimal('liters', 10, 2);
            $table->decimal('cost_per_liter', 10, 2);
            $table->decimal('total_cost', 15, 2);
            $table->decimal('odometer_reading', 15, 2);
            $table->date('date');
            $table->string('station_name')->nullable();
            $table->timestamps();

            $table->index(['vehicle_id', 'date']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action');
            $table->string('model_type');
            $table->uuid('model_id'); // Using UUID for polymorphic relation
            $table->jsonb('old_values')->nullable(); // JSONB for better Postgres performance
            $table->jsonb('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['model_type', 'model_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('fuel_purchases');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('incomes');
        Schema::dropIfExists('vehicles');
    }
};
