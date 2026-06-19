<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleResource;
use App\Services\VehicleService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

use App\Http\Requests\StoreVehicleRequest;

class VehicleController extends Controller
{
    use ApiResponse;

    protected VehicleService $service;

    public function __construct(VehicleService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $vehicles = $this->service->getPaginated();
        return VehicleResource::collection($vehicles);
    }

    public function store(StoreVehicleRequest $request)
    {
        $vehicle = $this->service->store($request->validated());
        return $this->successResponse(new VehicleResource($vehicle), 'Vehicle created', 201);
    }

    public function show($id)
    {
        $vehicle = $this->service->findById($id);
        if (!$vehicle) return $this->errorResponse('Vehicle not found', 404);
        return $this->successResponse(new VehicleResource($vehicle));
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'plate_number' => 'sometimes|unique:vehicles,plate_number,' . $id,
            'status' => 'sometimes|in:active,maintenance,inactive',
            'current_odometer' => 'sometimes|numeric'
        ]);

        $this->service->update($id, $data);
        return $this->successResponse(null, 'Vehicle updated');
    }

    public function destroy($id)
    {
        $this->service->remove($id);
        return $this->successResponse(null, 'Vehicle deleted');
    }
}
