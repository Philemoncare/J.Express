<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'plate_number' => $this->plate_number,
            'model' => $this->model,
            'make' => $this->make,
            'year' => $this->year,
            'status' => $this->status,
            'current_odometer' => $this->current_odometer,
            'created_at' => $this->created_at,
        ];
    }
}
