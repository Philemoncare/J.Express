<?php

namespace App\Services;

use App\Repositories\MaintenanceRepository;

class MaintenanceService extends BaseService
{
    public function __construct(MaintenanceRepository $repository)
    {
        parent::__construct($repository);
    }
}
