<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_id' => $this->vehicle_id,
            'vehicle' => new VehicleResource($this->whenLoaded('vehicle')),
            'user' => $this->whenLoaded('user'),
            'category' => $this->category,
            'amount' => (float)$this->amount,
            'date' => $this->date,
            'description' => $this->description,
            'created_at' => $this->created_at,
        ];
    }
}
