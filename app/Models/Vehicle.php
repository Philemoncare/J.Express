<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasUuids;

class Vehicle extends Model
{
    use SoftDeletes, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'plate_number',
        'vin',
        'model',
        'make',
        'year',
        'status',
        'current_odometer'
    ];

    protected $casts = [
        'vin' => 'encrypted', // Encrypt Vehicle Identification Number
        'current_odometer' => 'decimal:2',
    ];

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function fuelPurchases(): HasMany
    {
        return $this->hasMany(FuelPurchase::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function latestMaintenance(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MaintenanceRecord::class)->latestOfMany();
    }
}
