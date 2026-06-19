<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\FinancialService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    protected FinancialService $financialService;

    public function __construct(FinancialService $financialService)
    {
        $this->financialService = $financialService;
    }

    public function summary(Request $request)
    {
        $vehicleId = $request->query('vehicle_id');
        $summary = $this->financialService->getSummary($vehicleId ? (int)$vehicleId : null);

        return $this->successResponse($summary, 'Financial summary retrieved');
    }

    public function vehiclePerformance($id)
    {
        // Implementation for specific vehicle performance analytics
        $summary = $this->financialService->getSummary((int)$id);
        return $this->successResponse($summary, 'Vehicle performance retrieved');
    }
}
