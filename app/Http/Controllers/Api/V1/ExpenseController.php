<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpenseResource;
use App\Services\ExpenseService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use ApiResponse;

    protected ExpenseService $service;

    public function __construct(ExpenseService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $expenses = $this->service->getPaginated();
        return ExpenseResource::collection($expenses);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'user_id' => 'required|exists:users,id',
            'category' => 'required|string',
            'amount' => 'required|numeric',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

        $expense = $this->service->store($data);
        return $this->successResponse(new ExpenseResource($expense), 'Expense recorded', 201);
    }

    public function show($id)
    {
        $expense = $this->service->findById($id);
        if (!$expense) return $this->errorResponse('Expense not found', 404);
        return $this->successResponse(new ExpenseResource($expense));
    }

    public function destroy($id)
    {
        $this->service->remove($id);
        return $this->successResponse(null, 'Expense deleted');
    }
}
