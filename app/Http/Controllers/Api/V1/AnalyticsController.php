<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponse;

    protected AnalyticsService $service;

    public function __construct(AnalyticsService $service)
    {
        $this->service = $service;
    }

    public function dashboard()
    {
        $stats = $this->service->getDashboardStats();
        return $this->successResponse($stats, 'Dashboard statistics retrieved');
    }

    public function fuelTrends(Request $request)
    {
        $vehicleId = $request->query('vehicle_id');
        $trends = $this->service->getFuelEfficiencyTrend($vehicleId);
        return $this->successResponse($trends, 'Fuel efficiency trends retrieved');
    }
}
