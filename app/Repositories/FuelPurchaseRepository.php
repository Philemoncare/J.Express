<?php

namespace App\Repositories;

use App\Models\FuelPurchase;

class FuelPurchaseRepository extends BaseRepository
{
    public function __construct(FuelPurchase $fuelPurchase)
    {
        parent::__construct($fuelPurchase);
    }
}
