<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseService
{
    protected BaseRepository $repository;

    public function __construct(BaseRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->repository->all($columns, $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, $relations);
    }

    public function findById(string $id, array $relations = []): ?Model
    {
        return $this->repository->find($id, $relations);
    }

    public function store(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function update(string $id, array $data): bool
    {
        return $this->repository->update($id, $data);
    }

    public function remove(string $id): bool
    {
        return $this->repository->delete($id);
    }
}
