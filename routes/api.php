<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\IncomeController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FuelPurchaseController;
use App\Http\Controllers\Api\V1\MaintenanceController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health Check
    Route::get('db-check', function () {
        try {
            $dbName = \DB::connection()->getDatabaseName();
            $userCount = \App\Models\User::count();
            $adminExists = \App\Models\User::where('email', 'admin@jexpress.com')->exists();

            return response()->json([
                'status' => 'success',
                'database' => $dbName,
                'user_count' => $userCount,
                'admin_exists' => $adminExists,
                'connection' => 'PostgreSQL connected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Public routes
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');
    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verify'])->name('verification.verify');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('email/verification-notification', [AuthController::class, 'resendVerification']);

        // Vehicles
        Route::apiResource('vehicles', VehicleController::class);

        // Financial Transactions
        Route::apiResource('incomes', IncomeController::class);
        Route::apiResource('expenses', ExpenseController::class);
        Route::apiResource('fuel', FuelPurchaseController::class);
        Route::apiResource('maintenance', MaintenanceController::class);

        // Financials & Reports
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/vehicle/{id}', [ReportController::class, 'vehiclePerformance']);

        // Analytics
        Route::get('analytics/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('analytics/fuel-trends', [AnalyticsController::class, 'fuelTrends']);

        // Settings
        Route::get('settings', [SettingController::class, 'index']);
        Route::patch('settings', [SettingController::class, 'update']);

        // RBAC example
        Route::middleware('role:admin')->group(function () {
            // Admin only routes
        });
    });
});
