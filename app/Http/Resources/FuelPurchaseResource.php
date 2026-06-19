<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FuelPurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_id' => $this->vehicle_id,
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'driver' => $this->whenLoaded('driver'),
            'liters' => (float)$this->liters,
            'cost_per_liter' => (float)$this->cost_per_liter,
            'total_cost' => (float)$this->total_cost,
            'odometer_reading' => (float)$this->odometer_reading,
            'date' => $this->date,
            'station_name' => $this->station_name,
            'created_at' => $this->created_at,
        ];
    }
}
