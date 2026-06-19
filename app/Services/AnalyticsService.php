<?php

namespace App\Services;

use App\Models\Income;
use App\Models\Expense;
use App\Models\FuelPurchase;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    public function getDashboardStats()
    {
        return [
            'total_vehicles' => Vehicle::count(),
            'active_vehicles' => Vehicle::where('status', 'active')->count(),
            'total_income' => Income::sum('amount'),
            'total_expenses' => Expense::sum('amount') + FuelPurchase::sum('total_cost'),
            'recent_activity' => $this->getRecentActivity()
        ];
    }

    public function getFuelEfficiencyTrend(string $vehicleId = null)
    {
        $query = FuelPurchase::query()
            ->select(
                DB::raw('DATE_TRUNC(\'month\', date) as month'),
                DB::raw('SUM(liters) as total_liters'),
                DB::raw('SUM(total_cost) as total_cost')
            );

        if ($vehicleId) {
            $query->where('vehicle_id', $vehicleId);
        }

        return $query->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();
    }

    private function getRecentActivity()
    {
        // Combined recent transactions for dashboard
        $incomes = Income::latest()->take(5)->get()->map(fn($item) => ['type' => 'income', 'data' => $item]);
        $expenses = Expense::latest()->take(5)->get()->map(fn($item) => ['type' => 'expense', 'data' => $item]);

        return $incomes->concat($expenses)->sortByDesc(fn($item) => $item['data']->created_at)->values()->take(5);
    }
}
