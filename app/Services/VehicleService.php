<?php

namespace App\Services;

use App\Repositories\VehicleRepository;

class VehicleService extends BaseService
{
    public function __construct(VehicleRepository $repository)
    {
        parent::__construct($repository);
    }
}
