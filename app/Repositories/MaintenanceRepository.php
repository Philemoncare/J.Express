<?php

namespace App\Repositories;

use App\Models\MaintenanceRecord;

class MaintenanceRepository extends BaseRepository
{
    public function __construct(MaintenanceRecord $record)
    {
        parent::__construct($record);
    }
}
