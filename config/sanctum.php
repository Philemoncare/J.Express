<?php

use Laravel\Sanctum\Http\Middleware\AuthenticateSession;

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,%s',
        parse_url(env('APP_URL'), PHP_URL_HOST)
    ))),

    'guard' => ['web'],
    'expiration' => null,
    'token_lifecycle' => null,
    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    ],
];
