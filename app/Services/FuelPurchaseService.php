<?php

namespace App\Services;

use App\Repositories\FuelPurchaseRepository;

class FuelPurchaseService extends BaseService
{
    public function __construct(FuelPurchaseRepository $repository)
    {
        parent::__construct($repository);
    }
}
