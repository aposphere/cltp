<?php
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE);

$endpoint = $_ENV["ENDPOINT"] ?: 'http://localhost';
$port_ = $_ENV["PORT"] ?: '8080';
$dbEndpoint = $_ENV["MSSQL_ENDPOINT"] ?: 'db';
$dbPort = intval($_ENV["MSSQL_PORT"]) ?: 1433;
$dbDatabase = $_ENV["MSSQL_DATABASE"] ?: 'test0';
$dbUsername = $_ENV["MSSQL_USERNAME"] ?: 'cltp';
$dbPassword = $_ENV["MSSQL_PASSWORD"] ?: 'cltp-aposphere';
$frontendEndpoint = $_ENV["FRONTEND_ENDPOINT"] ?: 'http://localhost';
$frontendPort = $_ENV["FRONTEND_PORT"] ?: '4200';
$servicePassword = $_ENV["SERVICE_PASSWORD"] ?: 'cltp';

require_once("../db.php");

if ($_SERVER['REQUEST_METHOD'] == "GET")
{
  echo '[cltp] php backend ready!';
}
else if ($_SERVER['REQUEST_METHOD'] == "POST")
{
  $inputJSON = file_get_contents('php://input');
  $input = json_decode($inputJSON, FALSE);

  $query = $input->query;
  $username = $input->username;
  $password = $input->password;
  
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
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  
    $db->beginTransaction();
    $result = $db->query($query);

    if ($result->columnCount() == 0) echo("");
    else 
    {
      $rows = $result->fetchAll(PDO::FETCH_ASSOC);
      echo(json_encode(["recordset" => $rows]));
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

function test() 
{
  try
  {
      $con = getPDO();
      $stmt  = $con->prepare("SELECT 1 + 1 AS TEST_QUERY");
      $stmt->execute();
      $dataRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      echo(json_encode($dataRows));

      $conn = null;
  }
  catch (PDOException $exception)
  {
      error_log($exception->getMessage());
      return null;
  }
  return null;
}

//test();
?>