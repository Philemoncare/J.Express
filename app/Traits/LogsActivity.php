<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::updated(function ($model) {
            self::logActivity($model, 'updated');
        });

        static::created(function ($model) {
            self::logActivity($model, 'created');
        });

        static::deleted(function ($model) {
            self::logActivity($model, 'deleted');
        });
    }

    protected static function logActivity($model, $action)
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'old_values' => $action === 'updated' ? $model->getOriginal() : null,
            'new_values' => $action !== 'deleted' ? $model->getAttributes() : null,
            'ip_address' => request()->ip(),
        ]);
    }
}
