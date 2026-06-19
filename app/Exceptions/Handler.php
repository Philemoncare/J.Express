<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use App\Traits\ApiResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (ValidationException $e, $request) {
            return $this->errorResponse($e->errors(), 422);
        });

        $this->renderable(function (AuthenticationException $e, $request) {
            return $this->errorResponse('Unauthenticated', 401);
        });

        $this->renderable(function (NotFoundHttpException $e, $request) {
            return $this->errorResponse('Resource not found', 404);
        });

        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return $this->errorResponse($e->getMessage(), 500);
            }
        });
    }
}
