<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'Admin' => ['all'],
            'Fleet Manager' => ['view-vehicles', 'manage-vehicles', 'view-reports', 'manage-maintenance'],
            'Driver' => ['view-vehicles', 'add-fuel-purchase', 'add-expense', 'add-income'],
            'Accountant' => ['view-reports', 'view-incomes', 'view-expenses'],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::create([
                'name' => $roleName,
                'slug' => Str::slug($roleName),
            ]);

            foreach ($perms as $permName) {
                if ($permName === 'all') continue;

                $permission = Permission::firstOrCreate([
                    'name' => ucwords(str_replace('-', ' ', $permName)),
                    'slug' => $permName,
                ]);

                $role->permissions()->attach($permission->id);
            }
        }
    }
}
