<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_id' => $this->vehicle_id,
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'driver' => $this->whenLoaded('driver'),
            'amount' => (float)$this->amount,
            'date' => $this->date,
            'source' => $this->source,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
    }
}
