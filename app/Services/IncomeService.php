<?php

namespace App\Services;

use App\Repositories\IncomeRepository;

class IncomeService extends BaseService
{
    public function __construct(IncomeRepository $repository)
    {
        parent::__construct($repository);
    }
}
