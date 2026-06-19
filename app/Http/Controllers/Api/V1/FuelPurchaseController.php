<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FuelPurchaseResource;
use App\Services\FinancialService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use App\Models\FuelPurchase;

use App\Http\Requests\StoreFuelPurchaseRequest;

class FuelPurchaseController extends Controller
{
    use ApiResponse;

    protected FinancialService $financialService;

    public function __construct(FinancialService $financialService)
    {
        $this->financialService = $financialService;
    }

    public function index()
    {
        return FuelPurchaseResource::collection(FuelPurchase::with(['vehicle', 'driver'])->latest()->paginate());
    }

    public function store(StoreFuelPurchaseRequest $request)
    {
        $fuel = $this->financialService->recordFuelPurchase($request->validated());
        return $this->successResponse(new FuelPurchaseResource($fuel), 'Fuel purchase recorded', 201);
    }

    public function show($id)
    {
        $fuel = FuelPurchase::find($id);
        if (!$fuel) return $this->errorResponse('Fuel purchase not found', 404);
        return $this->successResponse(new FuelPurchaseResource($fuel));
    }
}
