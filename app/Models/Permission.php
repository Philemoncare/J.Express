<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\HasUuids;

class Permission extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug'];

    public $incrementing = false;
    protected $keyType = 'string';

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
