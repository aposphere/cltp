<?php
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE);

#####################################
# Provide the db access config here #
#####################################
$dbEndpoint = $_ENV["MSSQL_ENDPOINT"] ?: 'db';
$dbPort = intval($_ENV["MSSQL_PORT"]) ?: 1433;
$dbDatabase = $_ENV["MSSQL_DATABASE"] ?: 'test0';
$dbUsername = $_ENV["MSSQL_USERNAME"] ?: 'cltp';
$dbPassword = $_ENV["MSSQL_PASSWORD"] ?: 'cltp-aposphere';

$servicePassword = $_ENV["SERVICE_PASSWORD"] ?: 'cltp';

require_once("../db.php");

// Backwards-compatibility for PHP 7.4
function str_starts_with_php_7($haystack, $needle)
{
  $length = strlen($needle);
  return substr($haystack, 0, $length) === $needle;
}
// Backwards-compatibility for PHP 7.4


if ($_SERVER['REQUEST_METHOD'] == "GET")
{
  echo '[cltp] php backend ready!';
}
else if ($_SERVER['REQUEST_METHOD'] == "POST")
{
  $query = $_POST["query"];
  $username = $_POST["username"];
  $password = $_POST["password"];

  if ($password != $servicePassword)
  {
    http_response_code(401);
    die("Service password invalid!");
  }

  header('Content-Type: application/json; charset=utf-8');

  try
  {
    $db = getPDO($dbEndpoint, $dbPort, $dbDatabase, $dbUsername, $dbPassword);
  } catch (Exception $e)
  {
    die("Unable to connect: " . $e->getMessage());
  }

  try
  {
    $db->beginTransaction();
    // Assume it to be a single select query when it starts with SELECT, otherwise execute and do not return anything
    // Do not use PHP 8.0 feature due to back-compatibility
    // https://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
    if (str_starts_with_php_7($query, "SELECT"))
    {
      $result = $db->query($query);
      $rows = $result->fetchAll(PDO::FETCH_ASSOC);
      echo(json_encode(["recordset" => $rows]));
    }
    else
    {
      $result = $db->exec($query);
      echo(json_encode([]));
    }

    $db->commit();
  }
  catch (Exception $e)
  {
    $db->rollBack();
    http_response_code(500);
    die("Failed: " . $e->getMessage());
  }
}
if ($_SERVER['REQUEST_METHOD'] == "OPTIONS")
{
  echo '';
}
?>
