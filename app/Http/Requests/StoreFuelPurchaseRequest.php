<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFuelPurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'uuid', 'exists:vehicles,id'],
            'driver_id' => ['required', 'uuid', 'exists:users,id'],
            'liters' => ['required', 'numeric', 'min:0.01'],
            'cost_per_liter' => ['required', 'numeric', 'min:0.01'],
            'total_cost' => ['required', 'numeric', 'min:0'],
            'odometer_reading' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'station_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
