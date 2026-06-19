<?php

namespace App\Services;

use App\Models\Income;
use App\Models\Expense;
use App\Models\FuelPurchase;
use Illuminate\Support\Facades\DB;

class FinancialService
{
    public function recordIncome(array $data)
    {
        return Income::create($data);
    }

    public function recordExpense(array $data)
    {
        return Expense::create($data);
    }

    public function recordFuelPurchase(array $data)
    {
        return DB::transaction(function () use ($data) {
            $fuel = FuelPurchase::create($data);

            // Update vehicle odometer
            $fuel->vehicle->update([
                'current_odometer' => $data['odometer_reading']
            ]);

            return $fuel;
        });
    }

    public function getSummary(int $vehicleId = null)
    {
        $queryIncome = Income::query();
        $queryExpense = Expense::query();
        $queryFuel = FuelPurchase::query();

        if ($vehicleId) {
            $queryIncome->where('vehicle_id', $vehicleId);
            $queryExpense->where('vehicle_id', $vehicleId);
            $queryFuel->where('vehicle_id', $vehicleId);
        }

        return [
            'total_income' => $queryIncome->sum('amount'),
            'total_expense' => $queryExpense->sum('amount'),
            'total_fuel_cost' => $queryFuel->sum('total_cost'),
            'net_profit' => $queryIncome->sum('amount') - ($queryExpense->sum('amount') + $queryFuel->sum('total_cost'))
        ];
    }
}
