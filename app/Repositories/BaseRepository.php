<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository
{
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->with($relations)->get($columns);
    }

    public function paginate(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->model->with($relations)->paginate($perPage);
    }

    public function find(string $id, array $relations = []): ?Model
    {
        return $this->model->with($relations)->find($id);
    }

    public function create(array $details): Model
    {
        return $this->model->create($details);
    }

    public function update(string $id, array $details): bool
    {
        return $this->model->where('id', $id)->update($details);
    }

    public function delete(string $id): bool
    {
        return $this->model->where('id', $id)->delete();
    }
}
