<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MaintenanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

use App\Http\Requests\StoreMaintenanceRequest;

class MaintenanceController extends Controller
{
    use ApiResponse;

    protected MaintenanceService $service;

    public function __construct(MaintenanceService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return $this->successResponse($this->service->getPaginated(15, ['vehicle']));
    }

    public function store(StoreMaintenanceRequest $request)
    {
        $record = $this->service->store($request->validated());
        return $this->successResponse($record, 'Maintenance record created', 201);
    }

    public function show($id)
    {
        $record = $this->service->findById($id);
        if (!$record) return $this->errorResponse('Record not found', 404);
        return $this->successResponse($record);
    }

    public function destroy($id)
    {
        $this->service->remove($id);
        return $this->successResponse(null, 'Record deleted');
    }
}
