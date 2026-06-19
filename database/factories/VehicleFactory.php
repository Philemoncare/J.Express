<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        return [
            'plate_number' => strtoupper($this->faker->bothify('??-####-??')),
            'vin' => $this->faker->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'),
            'model' => $this->faker->word(),
            'make' => $this->faker->company(),
            'year' => $this->faker->year(),
            'status' => $this->faker->randomElement(['active', 'maintenance', 'inactive']),
            'current_odometer' => $this->faker->randomFloat(2, 1000, 200000),
        ];
    }
}
