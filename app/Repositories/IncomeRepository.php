<?php

namespace App\Repositories;

use App\Models\Income;

class IncomeRepository extends BaseRepository
{
    public function __construct(Income $income)
    {
        parent::__construct($income);
    }
}
