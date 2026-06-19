<?php
$host = '52.72.123.251'; // Forced IPv4
$db   = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_KM1jmcFCb0BH';
$port = 5432;

// Using the host parameter in options to help Neon route if hostname is missing in SNI
$conn_string = "host=$host port=$port dbname=$db user=$user password=$pass sslmode=require options='--endpoint=ep-long-field-aq8q7sfh'";

$dbconn = pg_connect($conn_string);

if($dbconn) {
    echo "Connected successfully with forced IPv4\n";
    pg_close($dbconn);
} else {
    echo "Connection failed with forced IPv4\n";
}
