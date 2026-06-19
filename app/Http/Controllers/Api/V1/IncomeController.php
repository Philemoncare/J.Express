<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\IncomeResource;
use App\Services\IncomeService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

use App\Http\Requests\StoreIncomeRequest;

class IncomeController extends Controller
{
    use ApiResponse;

    protected IncomeService $service;

    public function __construct(IncomeService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $incomes = $this->service->getPaginated(15, ['vehicle', 'driver']);
        return IncomeResource::collection($incomes);
    }

    public function store(StoreIncomeRequest $request)
    {
        $income = $this->service->store($request->validated());
        return $this->successResponse(new IncomeResource($income), 'Income recorded', 201);
    }

    public function show($id)
    {
        $income = $this->service->findById($id);
        if (!$income) return $this->errorResponse('Income not found', 404);
        return $this->successResponse(new IncomeResource($income));
    }

    public function destroy($id)
    {
        $this->service->remove($id);
        return $this->successResponse(null, 'Income deleted');
    }
}
