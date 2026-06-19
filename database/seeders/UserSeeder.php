<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->first();

        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@jexpress.com',
            'password' => Hash::make('Password123!'),
            'email_verified_at' => now(),
        ]);

        if ($adminRole) {
            $admin->roles()->attach($adminRole->id);
        }
    }
}
