<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'uuid', 'exists:vehicles,id'],
            'service_type' => ['required', 'string', 'max:255'],
            'cost' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'odometer_reading' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'service_center' => ['nullable', 'string', 'max:255'],
        ];
    }
}
