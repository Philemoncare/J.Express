<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->successResponse(Setting::all(), 'Settings retrieved');
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable'
        ]);

        foreach ($request->settings as $item) {
            Setting::updateOrCreate(['key' => $item['key']], ['value' => $item['value']]);
        }

        return $this->successResponse(null, 'Settings updated');
    }
}
