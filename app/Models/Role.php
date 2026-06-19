<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Traits\HasUuids;

class Role extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug'];

    public $incrementing = false;
    protected $keyType = 'string';

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }
}
