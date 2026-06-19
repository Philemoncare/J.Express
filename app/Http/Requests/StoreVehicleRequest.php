<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plate_number' => ['required', 'string', 'unique:vehicles,plate_number'],
            'vin' => ['nullable', 'string', 'unique:vehicles,vin'],
            'model' => ['required', 'string'],
            'make' => ['required', 'string'],
            'year' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'status' => ['required', 'in:active,maintenance,inactive'],
            'current_odometer' => ['required', 'numeric', 'min:0'],
        ];
    }
}
